package repository

import (
	"context"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
)

// ConnectionRepository defines the interface for connection data operations.
type ConnectionRepository interface {
	// CreateConnection creates a new connection request.
	CreateConnection(ctx context.Context, connection *models.Connection) error

	// GetConnectionByID retrieves a connection by its ID.
	GetConnectionByID(ctx context.Context, connectionID uuid.UUID) (*models.Connection, error)

	// GetConnectionByUsers retrieves an existing connection (regardless of status) between two users.
	// Order of user IDs shouldn't matter.
	GetConnectionByUsers(ctx context.Context, userID1, userID2 uuid.UUID) (*models.Connection, error)

	// UpdateConnection updates the status of a connection.
	UpdateConnection(ctx context.Context, connection *models.Connection) error

	// ListConnectionsByUserID retrieves a list of connections for a user based on status.
	// For status "accepted", it retrieves established connections.
	// For status "pending" and userID = ReceiverID, it retrieves incoming requests.
	ListConnectionsByUserID(ctx context.Context, userID uuid.UUID, status string) ([]models.Connection, error)

	// DeleteConnection removes a connection (hard delete or mark as inactive/blocked?).
	// Current implementation might just use UpdateConnection with status='blocked' or a hard delete.
	DeleteConnection(ctx context.Context, connectionID uuid.UUID) error
}
