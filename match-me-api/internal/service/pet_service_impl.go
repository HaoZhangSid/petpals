package service

import (
	"context"
	"errors"
	"fmt"

	// "sort" // No longer needed here as repo handles photo loading/ordering

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/HaoZhangSid/match-me-api/internal/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// petService implements the PetService interface
type petService struct {
	petRepo   repository.PetRepository
	photoRepo repository.PhotoRepository // Still needed for other photo operations potentially
}

// NewPetService creates a new instance of PetService
func NewPetService(petRepo repository.PetRepository, photoRepo repository.PhotoRepository) PetService {
	return &petService{
		petRepo:   petRepo,
		photoRepo: photoRepo,
	}
}

// GetPetByID retrieves a single pet. Repository now handles photo preloading.
func (s *petService) GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error) {
	// Retrieve the pet data (including photos) from the repository
	pet, err := s.petRepo.GetPetByID(ctx, petID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: pet with ID %s not found", ErrNotFound, petID)
		}
		return nil, fmt.Errorf("failed to retrieve pet %s: %w", petID, err)
	}

	// No longer need to call populatePetPhotoURLs here
	// err = s.populatePetPhotoURLs(ctx, pet)
	// if err != nil {
	// 	log.Printf("Warning: Failed to fully populate photo URLs for pet %s: %v", petID, err)
	// }

	return pet, nil
}

// populatePetPhotoURLs function is removed as Repository now handles this.
/*
func (s *petService) populatePetPhotoURLs(ctx context.Context, pet *models.Pet) error {
	if pet == nil {
		return errors.New("cannot populate photos for nil pet")
	}

	photos, err := s.photoRepo.GetPhotosByOwner(ctx, "pet", pet.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pet.AvatarURL = nil
			// pet.PhotoURLs = []string{} // Field removed
			return nil
		}
		return fmt.Errorf("failed to get photos for pet %s: %w", pet.ID, err)
	}

	sort.Slice(photos, func(i, j int) bool {
		return photos[i].Order < photos[j].Order
	})

	var avatarURL *string
	// otherPhotoURLs := []string{} // Field removed

	for _, p := range photos {
		if p.IsPrimary {
			primaryURL := p.URL
			avatarURL = &primaryURL
		} // else {
		// 	otherPhotoURLs = append(otherPhotoURLs, p.URL) // Field removed
		// }
	}

	pet.AvatarURL = avatarURL
	// pet.PhotoURLs = otherPhotoURLs // Field removed

	return nil
}
*/

// AddPet adds a new pet for the currently logged-in user
func (s *petService) AddPet(ctx context.Context, pet *models.Pet) (*models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for adding pet: %w", err)
	}
	pet.UserID = userID

	if pet.Name == "" || pet.Type == "" {
		return nil, fmt.Errorf("%w: pet name and type are required", ErrValidation)
	}

	// No need to set AvatarURL or PhotoURLs here, they are handled by repository on fetch
	// pet.AvatarURL = nil
	// pet.PhotoURLs = nil

	err = s.petRepo.CreatePet(ctx, pet)
	if err != nil {
		return nil, fmt.Errorf("failed to save pet to database: %w", err)
	}

	// Return the created pet (photos will be empty as none are associated yet)
	return pet, nil
}

// ListUserPets retrieves all pets for the currently logged-in user. Repository handles photo preloading.
func (s *petService) ListUserPets(ctx context.Context) ([]models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for listing pets: %w", err)
	}

	// Get pets WITH photos preloaded from repository
	pets, err := s.petRepo.GetPetsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve pets from database: %w", err)
	}

	// No longer need the loop to populate photos here
	// for i := range pets {
	// 	err = s.populatePetPhotoURLs(ctx, &pets[i])
	// 	if err != nil {
	// 		log.Printf("Warning: Failed to populate photo URLs for pet %s: %v", pets[i].ID, err)
	// 	}
	// }

	return pets, nil
}

// UpdatePetInfo updates information for a specific pet belonging to the current user
func (s *petService) UpdatePetInfo(ctx context.Context, petID uuid.UUID, updateData *models.PetUpdatePayload) (*models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for updating pet: %w", err)
	}

	// Fetch the existing pet (without photos for now, as repo update doesn't preload)
	existingPet, err := s.petRepo.GetPetByID(ctx, petID) // GetPetByID now preloads photos
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: pet with ID %s not found", ErrNotFound, petID)
		}
		return nil, fmt.Errorf("failed to retrieve pet for update: %w", err)
	}

	if existingPet.UserID != userID {
		return nil, ErrUnauthorized
	}

	// --- Apply updates ---
	if updateData.Name != nil {
		existingPet.Name = *updateData.Name
	}
	// ... (rest of the field updates remain the same) ...
	if updateData.Type != nil {
		existingPet.Type = *updateData.Type
	}
	if updateData.Breed != nil {
		existingPet.Breed = updateData.Breed
	}
	if updateData.Gender != nil {
		existingPet.Gender = updateData.Gender
	}
	if updateData.Weight != nil {
		existingPet.Weight = updateData.Weight
	}
	if updateData.Birthday != nil {
		existingPet.Birthday = updateData.Birthday
	}
	if updateData.Bio != nil {
		existingPet.Bio = updateData.Bio
	}
	if updateData.Personality != nil {
		existingPet.Personality = *updateData.Personality
	}
	if updateData.FavoriteActivities != nil {
		existingPet.FavoriteActivities = *updateData.FavoriteActivities
	}
	if updateData.PlayStyle != nil {
		existingPet.PlayStyle = *updateData.PlayStyle
	}
	if updateData.ActivityLevel != nil {
		existingPet.ActivityLevel = updateData.ActivityLevel
	}
	if updateData.IsMicrochipped != nil {
		existingPet.IsMicrochipped = updateData.IsMicrochipped
	}
	if updateData.IsVaccinated != nil {
		existingPet.IsVaccinated = updateData.IsVaccinated
	}
	if updateData.IsNeutered != nil {
		existingPet.IsNeutered = updateData.IsNeutered
	}

	if existingPet.Name == "" || existingPet.Type == "" {
		return nil, fmt.Errorf("%w: pet name and type cannot be empty after update", ErrValidation)
	}

	// Save the updated pet (repo UpdatePet doesn't preload photos)
	err = s.petRepo.UpdatePet(ctx, existingPet)
	if err != nil {
		return nil, fmt.Errorf("failed to save updated pet to database: %w", err)
	}

	// Return the pet object fetched *before* the update, but now including photos because GetPetByID preloads them.
	// The photo data itself isn't modified by this update operation.
	// No need to call populatePetPhotoURLs here anymore.
	// err = s.populatePetPhotoURLs(ctx, existingPet)
	// if err != nil {
	// 	log.Printf("Warning: Failed to populate photo URLs for pet %s after update: %v", petID, err)
	// }

	return existingPet, nil
}

// DeletePet removes a specific pet belonging to the current user
func (s *petService) DeletePet(ctx context.Context, petID uuid.UUID) error {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user ID for deleting pet: %w", err)
	}

	existingPet, err := s.petRepo.GetPetByID(ctx, petID) // This now preloads photos
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: pet with ID %s not found", ErrNotFound, petID)
		}
		return fmt.Errorf("failed to retrieve pet for deletion check: %w", err)
	}

	if existingPet.UserID != userID {
		return ErrUnauthorized
	}

	// TODO: Delete associated photos from storage and database before deleting the pet
	// This requires iterating through existingPet.Photos and calling photoRepo/fileStorage methods

	err = s.petRepo.DeletePet(ctx, petID)
	if err != nil {
		return fmt.Errorf("failed to delete pet from database: %w", err)
	}

	return nil
}
