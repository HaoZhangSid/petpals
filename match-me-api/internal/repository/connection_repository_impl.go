package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// postgresConnectionRepository implements the ConnectionRepository interface using PostgreSQL.
type postgresConnectionRepository struct {
	db *gorm.DB
}

// NewPostgresConnectionRepository creates a new instance of postgresConnectionRepository.
func NewPostgresConnectionRepository(db *gorm.DB) ConnectionRepository {
	return &postgresConnectionRepository{db: db}
}

// CreateConnection creates a new connection request.
func (r *postgresConnectionRepository) CreateConnection(ctx context.Context, connection *models.Connection) error {
	if connection == nil {
		return errors.New("connection cannot be nil")
	}
	result := r.db.WithContext(ctx).Create(connection)
	if result.Error != nil {
		return fmt.Errorf("failed to create connection: %w", result.Error)
	}
	return nil
}

// GetConnectionByID retrieves a connection by its ID.
func (r *postgresConnectionRepository) GetConnectionByID(ctx context.Context, connectionID uuid.UUID) (*models.Connection, error) {
	var connection models.Connection
	result := r.db.WithContext(ctx).Where("id = ?", connectionID).First(&connection)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, result.Error // Return gorm error for specific handling
		}
		return nil, fmt.Errorf("error fetching connection by ID %s: %w", connectionID, result.Error)
	}
	return &connection, nil
}

// GetConnectionByUsers retrieves an existing connection (regardless of status) between two users.
// It checks both combinations (user1 -> user2 and user2 -> user1).
func (r *postgresConnectionRepository) GetConnectionByUsers(ctx context.Context, userID1, userID2 uuid.UUID) (*models.Connection, error) {
	var connection models.Connection
	// Check both directions for the connection
	result := r.db.WithContext(ctx).Where("(requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)", userID1, userID2, userID2, userID1).First(&connection)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, result.Error // Not found is a valid outcome, return the specific error
		}
		return nil, fmt.Errorf("error fetching connection between users %s and %s: %w", userID1, userID2, result.Error)
	}
	return &connection, nil
}

// UpdateConnection updates the status or other fields of a connection.
// It assumes the connection object passed in contains the ID and fields to update.
func (r *postgresConnectionRepository) UpdateConnection(ctx context.Context, connection *models.Connection) error {
	if connection == nil || connection.ID == uuid.Nil {
		return errors.New("invalid connection object provided for update")
	}
	// Use Save to update all fields based on the primary key.
	// Ensure UpdatedAt is handled correctly (e.g., by GORM hooks or manually).
	result := r.db.WithContext(ctx).Save(connection)
	if result.Error != nil {
		return fmt.Errorf("failed to update connection %s: %w", connection.ID, result.Error)
	}
	if result.RowsAffected == 0 {
		// Check if the record actually exists, Save might return 0 rows affected if not found
		var exists int64
		if err := r.db.Model(&models.Connection{}).Where("id = ?", connection.ID).Count(&exists).Error; err == nil && exists == 0 {
			return fmt.Errorf("failed to update connection %s: %w", connection.ID, gorm.ErrRecordNotFound)
		}
		// Log if 0 rows affected but record exists (might mean no change was detected)
		// fmt.Printf("Warning: 0 rows affected when updating connection %s\n", connection.ID)
	}
	return nil
}

// ListConnectionsByUserID retrieves a list of connections for a user based on status.
// If status is "accepted", retrieves connections where the user is either requester or receiver.
// If status is "pending", retrieves connections where the user is the receiver.
func (r *postgresConnectionRepository) ListConnectionsByUserID(ctx context.Context, userID uuid.UUID, status string) ([]models.Connection, error) {
	var connections []models.Connection
	query := r.db.WithContext(ctx).Where("status = ?", status)

	if status == string(models.StatusAccepted) {
		query = query.Where("requester_id = ? OR receiver_id = ?", userID, userID)
	} else if status == string(models.StatusPending) {
		// For pending, we typically only care about requests received by the user
		query = query.Where("receiver_id = ?", userID)
	} else {
		// For other statuses (declined, blocked), you might want requests sent OR received
		// Adjust this logic based on requirements for those statuses
		query = query.Where("requester_id = ? OR receiver_id = ?", userID, userID)
	}

	// Order by UpdatedAt descending to show recent activity first
	result := query.Order("updated_at DESC").Find(&connections)
	if result.Error != nil {
		return nil, fmt.Errorf("error listing connections for user %s with status %s: %w", userID, status, result.Error)
	}

	return connections, nil
}

// DeleteConnection removes a connection record from the database.
// Currently implements a hard delete.
func (r *postgresConnectionRepository) DeleteConnection(ctx context.Context, connectionID uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Connection{}, connectionID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete connection %s: %w", connectionID, result.Error)
	}
	if result.RowsAffected == 0 {
		// Return a specific error if the record to delete was not found
		return fmt.Errorf("connection %s not found for deletion: %w", connectionID, gorm.ErrRecordNotFound)
	}
	return nil
}
