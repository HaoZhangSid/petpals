package repository

import (
	"context"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	// CreateUser creates a new user in the database
	CreateUser(ctx context.Context, user *models.User) error

	// GetUserByEmail retrieves a user by their email address
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)

	// GetUserByID retrieves a user by their ID
	GetUserByID(ctx context.Context, id uuid.UUID) (*models.User, error)

	// UpdateUser updates an existing user's information based on the provided user object.
	UpdateUser(ctx context.Context, userID uuid.UUID, updates map[string]interface{}) error

	// FindUsers retrieves a list of users, excluding a specific user ID, with a limit.
	FindUsers(ctx context.Context, excludeUserID uuid.UUID, limit int) ([]models.User, error)

	// FindUsersWithinRadius finds users whose coordinates are within a given radius (in meters)
	// from the provided center point WKT (Well-Known Text).
	// FindUsersWithinRadius(ctx context.Context, centerPointWKT string, radiusMeters float64, excludeUserID uuid.UUID, limit int) ([]models.User, error)
}
