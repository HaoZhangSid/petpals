package service

import (
	"context"
	"mime/multipart"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
)

// PhotoService defines the interface for photo management business logic.
type PhotoService interface {
	// UploadPhoto handles saving a file, creating a photo record, and potentially setting it as primary.
	UploadPhoto(ctx context.Context, ownerType string, ownerID uuid.UUID, fileHeader *multipart.FileHeader, isPrimary bool, caption string) (*models.Photo, error)

	// DeletePhoto handles deleting a photo record and the corresponding file.
	DeletePhoto(ctx context.Context, photoID uuid.UUID, userID uuid.UUID) error // userID for authorization

	// SetPrimaryPhoto sets a specific photo as the primary one for its owner.
	SetPrimaryPhoto(ctx context.Context, photoID uuid.UUID, userID uuid.UUID) error // userID for authorization

	// UpdatePhotoCaption updates the caption of a photo.
	UpdatePhotoCaption(ctx context.Context, photoID uuid.UUID, caption string, userID uuid.UUID) (*models.Photo, error) // userID for authorization

	// ReorderPhotos updates the display order of photos for an owner.
	// Takes a map of photoID to desired order index.
	ReorderPhotos(ctx context.Context, ownerType string, ownerID uuid.UUID, order map[uuid.UUID]int, userID uuid.UUID) error // userID for authorization
}
