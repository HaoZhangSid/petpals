package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository" // For GetUserIDFromContext
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// connectionService implements the ConnectionService interface.
type connectionService struct {
	connRepo repository.ConnectionRepository
	userRepo repository.UserRepository // Needed to check if users exist
}

// NewConnectionService creates a new instance of ConnectionService.
func NewConnectionService(connRepo repository.ConnectionRepository, userRepo repository.UserRepository) ConnectionService {
	return &connectionService{
		connRepo: connRepo,
		userRepo: userRepo,
	}
}

// SendRequest creates a new connection request from the current user to the receiver.
// It now accepts requesterID as a parameter per the interface definition.
func (s *connectionService) SendRequest(ctx context.Context, requesterID uuid.UUID, receiverID uuid.UUID) (*models.Connection, error) {
	// Removed call to utils.GetUserIDFromContext(ctx)

	if requesterID == receiverID {
		return nil, fmt.Errorf("%w: cannot send connection request to self", ErrValidation)
	}

	// Check if receiver user exists
	_, err := s.userRepo.GetUserByID(ctx, receiverID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: receiver user %s not found", ErrNotFound, receiverID)
		}
		return nil, fmt.Errorf("failed to verify receiver user %s: %w", receiverID, err)
	}

	// Check if a connection already exists between these users (regardless of status)
	// Uses the passed requesterID
	existingConn, err := s.connRepo.GetConnectionByUsers(ctx, requesterID, receiverID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		// Failed to check for existing connection
		return nil, fmt.Errorf("failed to check existing connection: %w", err)
	}
	if existingConn != nil {
		// Connection already exists, return an error or the existing connection?
		// Returning an error indicating conflict seems appropriate.
		return nil, fmt.Errorf("%w: connection already exists (status: %s)", ErrValidation, existingConn.Status)
	}

	// Create the new connection request - uses the passed requesterID
	newConnection := &models.Connection{
		RequesterID: requesterID,
		ReceiverID:  receiverID,
		Status:      string(models.StatusPending),
		// CreatedAt and UpdatedAt should be handled by GORM or DB defaults
	}

	err = s.connRepo.CreateConnection(ctx, newConnection)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection request: %w", err)
	}

	return newConnection, nil
}

// AcceptRequest changes the status of a pending connection request to 'accepted'.
func (s *connectionService) AcceptRequest(ctx context.Context, connectionID uuid.UUID, currentUserID uuid.UUID) (*models.Connection, error) {
	conn, err := s.connRepo.GetConnectionByID(ctx, connectionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: connection request %s not found", ErrNotFound, connectionID)
		}
		return nil, fmt.Errorf("failed to get connection request %s: %w", connectionID, err)
	}

	// Authorization: Only the receiver can accept
	if conn.ReceiverID != currentUserID {
		return nil, fmt.Errorf("%w: user %s is not the receiver of request %s", ErrUnauthorized, currentUserID, connectionID)
	}

	// Check if the request is actually pending
	if conn.Status != string(models.StatusPending) {
		return nil, fmt.Errorf("%w: cannot accept request with status '%s'", ErrValidation, conn.Status)
	}

	// Update status to accepted
	conn.Status = string(models.StatusAccepted)
	conn.UpdatedAt = time.Now() // Explicitly set UpdatedAt

	err = s.connRepo.UpdateConnection(ctx, conn)
	if err != nil {
		return nil, fmt.Errorf("failed to update connection status to accepted: %w", err)
	}

	// TODO: Potentially create a Conversation record here upon acceptance

	return conn, nil
}

// RejectRequest changes the status of a pending connection request to 'declined'.
func (s *connectionService) RejectRequest(ctx context.Context, connectionID uuid.UUID, currentUserID uuid.UUID) error {
	conn, err := s.connRepo.GetConnectionByID(ctx, connectionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: connection request %s not found", ErrNotFound, connectionID)
		}
		return fmt.Errorf("failed to get connection request %s: %w", connectionID, err)
	}

	// Authorization: Only the receiver can reject
	if conn.ReceiverID != currentUserID {
		return fmt.Errorf("%w: user %s is not the receiver of request %s", ErrUnauthorized, currentUserID, connectionID)
	}

	// Check if the request is actually pending
	if conn.Status != string(models.StatusPending) {
		return fmt.Errorf("%w: cannot reject request with status '%s'", ErrValidation, conn.Status)
	}

	// Option 1: Update status to declined
	conn.Status = string(models.StatusDeclined)
	conn.UpdatedAt = time.Now()
	err = s.connRepo.UpdateConnection(ctx, conn)
	if err != nil {
		return fmt.Errorf("failed to update connection status to declined: %w", err)
	}

	// Option 2: Delete the request entirely (Simpler, less state)
	// err = s.connRepo.DeleteConnection(ctx, connectionID)
	// if err != nil {
	// 	return fmt.Errorf("failed to delete connection request: %w", err)
	// }

	return nil
}

// ListIncomingRequests lists pending connection requests for the current user.
func (s *connectionService) ListIncomingRequests(ctx context.Context, currentUserID uuid.UUID) ([]models.Connection, error) {
	// Repository method already filters by receiver ID for pending status
	requests, err := s.connRepo.ListConnectionsByUserID(ctx, currentUserID, string(models.StatusPending))
	if err != nil {
		log.Printf("Error listing incoming requests for user %s: %v", currentUserID, err)
		return nil, fmt.Errorf("failed to list incoming connection requests")
	}

	return requests, nil
}

// ListAcceptedConnections lists established connections for the current user.
func (s *connectionService) ListAcceptedConnections(ctx context.Context, currentUserID uuid.UUID) ([]models.Connection, error) {
	// Repository method already handles OR condition for accepted status
	connections, err := s.connRepo.ListConnectionsByUserID(ctx, currentUserID, string(models.StatusAccepted))
	if err != nil {
		log.Printf("Error listing accepted connections for user %s: %v", currentUserID, err)
		return nil, fmt.Errorf("failed to list accepted connections")
	}

	return connections, nil
}

// RemoveConnection deletes an accepted connection.
func (s *connectionService) RemoveConnection(ctx context.Context, connectionID uuid.UUID, currentUserID uuid.UUID) error {
	conn, err := s.connRepo.GetConnectionByID(ctx, connectionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: connection %s not found", ErrNotFound, connectionID)
		}
		return fmt.Errorf("failed to get connection %s: %w", connectionID, err)
	}

	// Authorization: Only involved users can remove the connection
	if conn.RequesterID != currentUserID && conn.ReceiverID != currentUserID {
		return fmt.Errorf("%w: user %s is not part of connection %s", ErrUnauthorized, currentUserID, connectionID)
	}

	// We only allow removing 'accepted' connections via this method.
	// Blocking/declining should use other methods or status updates.
	if conn.Status != string(models.StatusAccepted) {
		return fmt.Errorf("%w: cannot remove connection with status '%s' using this method", ErrValidation, conn.Status)
	}

	// Perform hard delete
	err = s.connRepo.DeleteConnection(ctx, connectionID)
	if err != nil {
		// Check if the error was because it was already deleted (or never existed)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: connection %s not found for deletion", ErrNotFound, connectionID)
		}
		return fmt.Errorf("failed to remove connection %s: %w", connectionID, err)
	}

	return nil
}
