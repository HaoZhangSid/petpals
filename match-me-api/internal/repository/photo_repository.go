package repository

import (
	"context"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
)

// PhotoRepository defines the interface for photo data operations.
type PhotoRepository interface {
	// CreatePhoto saves a new photo record.
	CreatePhoto(ctx context.Context, photo *models.Photo) error

	// GetPhotosByOwner retrieves all photos for a specific owner (User or Pet).
	GetPhotosByOwner(ctx context.Context, ownerType string, ownerID uuid.UUID) ([]models.Photo, error)

	// GetPhotoByID retrieves a single photo by its ID.
	GetPhotoByID(ctx context.Context, photoID uuid.UUID) (*models.Photo, error)

	// UpdatePhoto updates photo details (e.g., caption, order, isPrimary).
	UpdatePhoto(ctx context.Context, photo *models.Photo) error

	// DeletePhoto removes a photo record.
	DeletePhoto(ctx context.Context, photoID uuid.UUID) error

	// SetPrimaryPhoto sets the IsPrimary flag for a photo and unsets it for others of the same owner.
	// This might involve multiple DB operations and could potentially live in the service layer,
	// but placing a dedicated method here can be convenient if the transaction logic is simple.
	SetPrimaryPhoto(ctx context.Context, ownerType string, ownerID uuid.UUID, photoID uuid.UUID) error

	// GetPrimaryPhoto retrieves the primary photo for a specific owner.
	GetPrimaryPhoto(ctx context.Context, ownerType string, ownerID uuid.UUID) (*models.Photo, error)
}
