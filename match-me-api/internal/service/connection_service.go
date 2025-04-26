package service

import (
	"context"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
)

// ConnectionService defines the interface for connection management logic.
type ConnectionService interface {
	// SendRequest creates a new connection request from requesterID to receiverID.
	SendRequest(ctx context.Context, requesterID, receiverID uuid.UUID) (*models.Connection, error)

	// AcceptRequest changes the status of a pending connection request to 'accepted'.
	AcceptRequest(ctx context.Context, connectionID uuid.UUID, currentUserID uuid.UUID) (*models.Connection, error)

	// RejectRequest changes the status of a pending connection request to 'rejected' (or deletes it).
	RejectRequest(ctx context.Context, connectionID uuid.UUID, currentUserID uuid.UUID) error

	// ListIncomingRequests lists pending connection requests for the current user.
	ListIncomingRequests(ctx context.Context, currentUserID uuid.UUID) ([]models.Connection, error)

	// ListAcceptedConnections lists established connections for the current user.
	ListAcceptedConnections(ctx context.Context, currentUserID uuid.UUID) ([]models.Connection, error)

	// RemoveConnection deletes an accepted connection or potentially blocks a user.
	RemoveConnection(ctx context.Context, connectionID uuid.UUID, currentUserID uuid.UUID) error
}
