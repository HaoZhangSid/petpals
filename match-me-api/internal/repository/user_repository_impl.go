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

// UpdateUser updates an existing user's information based on the provided user object.
// It uses Save for a full update, overwriting all fields based on the provided 'user' model.
func (r *postgresUserRepository) UpdateUser(ctx context.Context, user *models.User) error {
	if user == nil || user.ID == uuid.Nil {
		return fmt.Errorf("invalid user object provided for update")
	}

	// Ensure UpdatedAt is set if not handled by GORM hooks/tags
	// user.UpdatedAt = time.Now()

	result := r.db.WithContext(ctx).Save(user)
	if result.Error != nil {
		// Check if the error is because the record wasn't found
		var exists int64
		_ = r.db.Model(&models.User{}).Where("id = ?", user.ID).Count(&exists) // Check existence even if save failed
		if exists == 0 {
			return fmt.Errorf("failed to update user %s (not found): %w", user.ID, gorm.ErrRecordNotFound)
		}
		// Return the original save error if user exists but save failed for other reasons
		return fmt.Errorf("gorm error saving user %s: %w", user.ID, result.Error)
	}
	// GORM's Save returns RowsAffected == 0 if the record is not found OR if no changes were detected.
	if result.RowsAffected == 0 {
		// Explicitly check existence if RowsAffected is 0 to differentiate 'not found' from 'no change'
		var exists int64
		if err := r.db.Model(&models.User{}).Where("id = ?", user.ID).Count(&exists).Error; err == nil && exists == 0 {
			return fmt.Errorf("failed to update user %s (not found): %w", user.ID, gorm.ErrRecordNotFound)
		}
		// If user exists, 0 rows affected means no changes were made.
		log.Printf("GORM Save for user %s resulted in 0 rows affected (record found but no changes detected).", user.ID)
	}

	return nil
}
