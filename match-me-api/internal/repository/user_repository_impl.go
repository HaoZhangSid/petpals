package repository

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// postgresUserRepository implements the UserRepository interface using PostgreSQL.
type postgresUserRepository struct {
	db *gorm.DB
}

// NewPostgresUserRepository creates a new instance of postgresUserRepository.
func NewPostgresUserRepository(db *gorm.DB) UserRepository {
	return &postgresUserRepository{db: db}
}

// CreateUser creates a new user in the database
func (r *postgresUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	// Ensure UpdatedAt and CreatedAt are set (GORM might do this automatically)
	// user.CreatedAt = time.Now()
	// user.UpdatedAt = time.Now()
	result := r.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		return fmt.Errorf("failed to create user: %w", result.Error)
	}
	return nil
}

// GetUserByEmail retrieves a user by their email address
func (r *postgresUserRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, result.Error // Return gorm error directly for specific handling upstream
		}
		return nil, fmt.Errorf("error fetching user by email %s: %w", email, result.Error)
	}
	return &user, nil
}

// GetUserByID retrieves a user by their ID
func (r *postgresUserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	// Note: Not preloading Pets or Photos here. That's responsibility of the service layer.
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, result.Error // Return gorm error directly
		}
		return nil, fmt.Errorf("error fetching user by ID %s: %w", id, result.Error)
	}
	return &user, nil
}

// FindUsers retrieves a list of users, excluding a specific user ID, with a limit.
func (r *postgresUserRepository) FindUsers(ctx context.Context, excludeUserID uuid.UUID, limit int) ([]models.User, error) {
	var users []models.User

	query := r.db.WithContext(ctx).Where("id <> ?", excludeUserID).Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	// Note: Not preloading related data here.
	result := query.Find(&users)
	if result.Error != nil {
		return nil, fmt.Errorf("error finding users: %w", result.Error)
	}

	return users, nil
}

// UpdateUser updates specific fields of an existing user using a map.
func (r *postgresUserRepository) UpdateUser(ctx context.Context, userID uuid.UUID, updates map[string]interface{}) error {
	if userID == uuid.Nil {
		return errors.New("invalid user ID provided for update")
	}
	if len(updates) == 0 {
		log.Printf("UpdateUser called for user %s with no fields to update.", userID)
		return nil // Nothing to update
	}

	// Ensure UpdatedAt is always set on update
	// GORM often handles this automatically if the field exists, but explicit is safer
	// updates["updated_at"] = time.Now() // Uncomment if GORM hooks aren't reliably setting it

	// Use Model(&models.User{}) to specify the table and Updates map for partial update
	result := r.db.WithContext(ctx).Model(&models.User{}).Where("id = ?", userID).Updates(updates)

	if result.Error != nil {
		// Log the detailed GORM error
		log.Printf("GORM error updating user %s: %v", userID, result.Error)
		// Check for specific errors if needed, e.g., constraint violations
		return fmt.Errorf("failed to update user %s: %w", userID, result.Error)
	}

	// Check if the record was actually found and updated
	if result.RowsAffected == 0 {
		// Verify if the user actually exists to differentiate 'not found' from 'no changes needed'
		var exists int64
		err := r.db.Model(&models.User{}).Where("id = ?", userID).Count(&exists).Error
		if err != nil {
			log.Printf("Error checking existence of user %s after 0 rows affected update: %v", userID, err)
			// Fall through to return a generic error as we couldn't confirm existence
		} else if exists == 0 {
			log.Printf("Update failed for user %s: record not found.", userID)
			return gorm.ErrRecordNotFound // Return specific error for not found
		}
		// If exists > 0, then 0 rows affected might mean the data was identical
		log.Printf("Update for user %s resulted in 0 rows affected (user exists, data might be unchanged).", userID)
		// Consider returning nil here, as the desired state might already be achieved
		// return fmt.Errorf("user %s found, but update resulted in 0 rows affected (data likely unchanged)", userID)
	}

	log.Printf("Successfully updated fields for user %s. Rows affected: %d", userID, result.RowsAffected)
	return nil
}

/* // REMOVED Incorrect User Recommendation Repository Method
// FindUsersWithinRadius finds users whose coordinates are within a given radius (in meters)
// from the provided center point WKT (Well-Known Text), excluding a specific user ID.
func (r *postgresUserRepository) FindUsersWithinRadius(ctx context.Context, centerPointWKT string, radiusMeters float64, excludeUserID uuid.UUID, limit int) ([]models.User, error) {
    // ... implementation removed ...
}
*/
