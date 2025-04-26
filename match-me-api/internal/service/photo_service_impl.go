package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"mime/multipart"

	"github.com/HaoZhangSid/match-me-api/internal/filestorage"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// photoService implements the PhotoService interface.
type photoService struct {
	photoRepo repository.PhotoRepository
	userRepo  repository.UserRepository // Needed for authorization checks
	petRepo   repository.PetRepository  // Needed for authorization checks
	fileStore filestorage.FileStorage
	// TODO: Add transaction manager if needed for complex operations
}

// NewPhotoService creates a new instance of PhotoService.
func NewPhotoService(
	photoRepo repository.PhotoRepository,
	userRepo repository.UserRepository,
	petRepo repository.PetRepository,
	fileStore filestorage.FileStorage,
) PhotoService {
	return &photoService{
		photoRepo: photoRepo,
		userRepo:  userRepo,
		petRepo:   petRepo,
		fileStore: fileStore,
	}
}

// UploadPhoto handles saving a file, creating a photo record, and potentially setting it as primary.
func (s *photoService) UploadPhoto(ctx context.Context, ownerType string, ownerID uuid.UUID, fileHeader *multipart.FileHeader, isPrimary bool, caption string) (*models.Photo, error) {
	// 1. Save the file using FileStorage
	fileURL, err := s.fileStore.SaveFile(fileHeader)
	if err != nil {
		return nil, fmt.Errorf("failed to save photo file: %w", err)
	}

	// 2. Create the Photo model
	photo := &models.Photo{
		OwnerType: ownerType,
		OwnerID:   ownerID,
		URL:       fileURL,
		IsPrimary: isPrimary, // Initial primary status
		Caption:   caption,
		// Order might be set based on existing photos count or handled separately
	}

	// 3. Save the photo record to the database
	err = s.photoRepo.CreatePhoto(ctx, photo)
	if err != nil {
		// Attempt to clean up the saved file if DB insert fails
		// TODO: Implement DeleteFile in FileStorage
		// _ = s.fileStore.DeleteFile(fileURL)
		log.Printf("Error creating photo record in DB for %s, uploaded file was %s: %v", fileURL, fileURL, err)
		return nil, fmt.Errorf("failed to create photo database record: %w", err)
	}

	// 4. If isPrimary is true, ensure it's the only primary one
	if isPrimary {
		err = s.photoRepo.SetPrimaryPhoto(ctx, ownerType, ownerID, photo.ID)
		if err != nil {
			// Log the error, but the photo was already created. Maybe return the photo with a warning?
			log.Printf("Warning: Failed to set photo %s as primary after creation: %v", photo.ID, err)
			// Potentially return the photo anyway, client might retry setting primary
		}
	}

	log.Printf("Successfully uploaded and saved photo %s for %s %s", photo.ID, ownerType, ownerID)
	return photo, nil
}

// authorizePhotoAccess checks if the userID is authorized to modify the photo.
func (s *photoService) authorizePhotoAccess(ctx context.Context, photoID uuid.UUID, userID uuid.UUID) (*models.Photo, error) {
	photo, err := s.photoRepo.GetPhotoByID(ctx, photoID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: photo %s not found", ErrNotFound, photoID)
		}
		return nil, fmt.Errorf("failed to get photo %s: %w", photoID, err)
	}

	if photo.OwnerType == "user" {
		if photo.OwnerID != userID {
			return nil, fmt.Errorf("%w: user %s cannot modify photo %s owned by user %s", ErrUnauthorized, userID, photoID, photo.OwnerID)
		}
	} else if photo.OwnerType == "pet" {
		// Check if the user owns the pet
		pet, err := s.petRepo.GetPetByID(ctx, photo.OwnerID)
		if err != nil {
			// Handle pet not found or other errors
			return nil, fmt.Errorf("failed to verify pet ownership for photo %s: %w", photoID, err)
		}
		if pet.UserID != userID {
			return nil, fmt.Errorf("%w: user %s cannot modify photo %s owned by pet %s (user %s)", ErrUnauthorized, userID, photoID, pet.ID, pet.UserID)
		}
	} else {
		return nil, fmt.Errorf("unknown photo owner type: %s", photo.OwnerType)
	}

	return photo, nil
}

// DeletePhoto handles deleting a photo record and the corresponding file.
func (s *photoService) DeletePhoto(ctx context.Context, photoID uuid.UUID, userID uuid.UUID) error {
	// 1. Authorize and get photo details
	photo, err := s.authorizePhotoAccess(ctx, photoID, userID)
	if err != nil {
		return err // Authorization or Not Found error
	}

	// TODO: Implement DeleteFile in FileStorage interface and implementation
	// Needs careful consideration of error handling (e.g., what if DB delete fails after file delete?)
	// Suggestion: Delete DB record first, then attempt file deletion. Log file deletion errors.

	// 2. Delete the photo record from the database
	err = s.photoRepo.DeletePhoto(ctx, photoID)
	if err != nil {
		return fmt.Errorf("failed to delete photo record %s: %w", photoID, err)
	}

	// 3. Attempt to delete the file from storage (implement FileStorage.DeleteFile)
	// err = s.fileStore.DeleteFile(photo.URL)
	// if err != nil {
	// 	log.Printf("Warning: Failed to delete photo file %s after deleting DB record %s: %v", photo.URL, photoID, err)
	// 	// Don't return error here, as DB record is already gone.
	// }

	log.Printf("Successfully deleted photo %s (owned by %s %s) by user %s", photoID, photo.OwnerType, photo.OwnerID, userID)
	return nil
}

// SetPrimaryPhoto sets a specific photo as the primary one for its owner.
func (s *photoService) SetPrimaryPhoto(ctx context.Context, photoID uuid.UUID, userID uuid.UUID) error {
	// 1. Authorize and get photo details
	photo, err := s.authorizePhotoAccess(ctx, photoID, userID)
	if err != nil {
		return err
	}

	// 2. Call repository method to handle setting primary flag atomically
	err = s.photoRepo.SetPrimaryPhoto(ctx, photo.OwnerType, photo.OwnerID, photoID)
	if err != nil {
		return fmt.Errorf("failed to set photo %s as primary for %s %s: %w", photoID, photo.OwnerType, photo.OwnerID, err)
	}

	log.Printf("Successfully set photo %s as primary for %s %s by user %s", photoID, photo.OwnerType, photo.OwnerID, userID)
	return nil
}

// UpdatePhotoCaption updates the caption of a photo.
func (s *photoService) UpdatePhotoCaption(ctx context.Context, photoID uuid.UUID, caption string, userID uuid.UUID) (*models.Photo, error) {
	// 1. Authorize and get photo
	photo, err := s.authorizePhotoAccess(ctx, photoID, userID)
	if err != nil {
		return nil, err
	}

	// 2. Update caption and save
	photo.Caption = caption
	err = s.photoRepo.UpdatePhoto(ctx, photo)
	if err != nil {
		return nil, fmt.Errorf("failed to update caption for photo %s: %w", photoID, err)
	}

	log.Printf("Successfully updated caption for photo %s by user %s", photoID, userID)
	return photo, nil
}

// ReorderPhotos updates the display order of photos for an owner.
func (s *photoService) ReorderPhotos(ctx context.Context, ownerType string, ownerID uuid.UUID, order map[uuid.UUID]int, userID uuid.UUID) error {
	// 1. Authorization: Check if userID owns the user/pet associated with ownerID
	if ownerType == "user" {
		if ownerID != userID {
			return fmt.Errorf("%w: user %s cannot reorder photos for user %s", ErrUnauthorized, userID, ownerID)
		}
	} else if ownerType == "pet" {
		pet, err := s.petRepo.GetPetByID(ctx, ownerID)
		if err != nil {
			return fmt.Errorf("failed to verify pet ownership for reorder: %w", err)
		}
		if pet.UserID != userID {
			return fmt.Errorf("%w: user %s cannot reorder photos for pet %s (user %s)", ErrUnauthorized, userID, pet.ID, pet.UserID)
		}
	} else {
		return fmt.Errorf("invalid owner type for reorder: %s", ownerType)
	}

	// 2. Fetch all photos for the owner
	photos, err := s.photoRepo.GetPhotosByOwner(ctx, ownerType, ownerID)
	if err != nil {
		return fmt.Errorf("failed to fetch photos for reorder: %w", err)
	}
	// Use the photos variable to avoid unused linter error until logic is implemented
	log.Printf("Fetched %d photos for %s %s to reorder.", len(photos), ownerType, ownerID)

	// 3. Update order based on the input map and save changes (potentially in a transaction)
	// This requires careful implementation to handle potential conflicts or missing IDs.
	// A simple approach (might be inefficient for many photos): Iterate and update one by one.
	// TODO: Implement the actual reordering logic, possibly within a transaction.
	log.Printf("Reordering photos for %s %s by user %s (logic not fully implemented)", ownerType, ownerID, userID)
	// Example (Needs Refinement):
	// tx := s.db.Begin() // Assuming db access or transaction manager
	// for _, photo := range photos {
	// 	if newOrder, ok := order[photo.ID]; ok {
	// 		if photo.Order != newOrder {
	// 			err = tx.Model(&photo).Update("order", newOrder).Error
	// 			if err != nil { tx.Rollback(); return err }
	// 		}
	// 	}
	// }
	// tx.Commit()

	return fmt.Errorf("reorder photos logic not implemented") // Placeholder
}
