package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// postgresPhotoRepository implements the PhotoRepository interface for PostgreSQL
type postgresPhotoRepository struct {
	db *gorm.DB
}

// NewPostgresPhotoRepository creates a new instance of postgresPhotoRepository
func NewPostgresPhotoRepository(db *gorm.DB) PhotoRepository {
	return &postgresPhotoRepository{db: db}
}

// CreatePhoto saves a new photo record.
func (r *postgresPhotoRepository) CreatePhoto(ctx context.Context, photo *models.Photo) error {
	result := r.db.WithContext(ctx).Create(photo)
	return result.Error
}

// GetPhotosByOwner retrieves all photos for a specific owner, ordered by 'Order' then 'CreatedAt'.
func (r *postgresPhotoRepository) GetPhotosByOwner(ctx context.Context, ownerType string, ownerID uuid.UUID) ([]models.Photo, error) {
	var photos []models.Photo
	result := r.db.WithContext(ctx).
		Where("owner_type = ? AND owner_id = ?", ownerType, ownerID).
		Order("\"order\" asc, created_at asc"). // Explicitly quote "order"
		Find(&photos)
	if result.Error != nil {
		return nil, result.Error
	}
	return photos, nil
}

// GetPhotoByID retrieves a single photo by its ID.
func (r *postgresPhotoRepository) GetPhotoByID(ctx context.Context, photoID uuid.UUID) (*models.Photo, error) {
	var photo models.Photo
	result := r.db.WithContext(ctx).First(&photo, photoID) // Find by primary key
	if result.Error != nil {
		return nil, result.Error
	}
	return &photo, nil
}

// UpdatePhoto updates photo details using the Save method.
func (r *postgresPhotoRepository) UpdatePhoto(ctx context.Context, photo *models.Photo) error {
	result := r.db.WithContext(ctx).Save(photo)
	return result.Error
}

// DeletePhoto removes a photo record (soft delete if DeletedAt is configured).
func (r *postgresPhotoRepository) DeletePhoto(ctx context.Context, photoID uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Photo{}, photoID)
	if result.Error == nil && result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

// SetPrimaryPhoto sets the IsPrimary flag for a photo and unsets it for others.
func (r *postgresPhotoRepository) SetPrimaryPhoto(ctx context.Context, ownerType string, ownerID uuid.UUID, photoID uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. Unset IsPrimary for all other photos of the same owner
		err := tx.Model(&models.Photo{}).
			Where("owner_type = ? AND owner_id = ? AND id != ?", ownerType, ownerID, photoID).
			Update("is_primary", false).
			Error
		if err != nil {
			return fmt.Errorf("failed to unset other primary photos: %w", err)
		}

		// 2. Set IsPrimary for the target photo
		err = tx.Model(&models.Photo{}).
			Where("id = ?", photoID).
			Update("is_primary", true).
			Error
		if err != nil {
			return fmt.Errorf("failed to set primary photo %s: %w", photoID, err)
		}

		return nil // Commit transaction
	})
}

// GetPrimaryPhoto retrieves the primary photo for a specific owner.
func (r *postgresPhotoRepository) GetPrimaryPhoto(ctx context.Context, ownerType string, ownerID uuid.UUID) (*models.Photo, error) {
	var photo models.Photo
	result := r.db.WithContext(ctx).
		Where("owner_type = ? AND owner_id = ? AND is_primary = ?", ownerType, ownerID, true).
		Order("created_at DESC"). // In case multiple are somehow marked primary, take the latest
		First(&photo)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Return nil, nil if no primary photo is found
		}
		return nil, result.Error // Return other errors
	}
	return &photo, nil
}
