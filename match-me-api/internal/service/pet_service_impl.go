package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sort" // Needed for sorting photos by order

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/HaoZhangSid/match-me-api/internal/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// petService implements the PetService interface
type petService struct {
	petRepo   repository.PetRepository
	photoRepo repository.PhotoRepository // Added PhotoRepository dependency
}

// NewPetService creates a new instance of PetService
func NewPetService(petRepo repository.PetRepository, photoRepo repository.PhotoRepository) PetService {
	return &petService{
		petRepo:   petRepo,
		photoRepo: photoRepo, // Store PhotoRepository
	}
}

// GetPetByID retrieves a single pet and populates its photo URLs.
func (s *petService) GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error) {
	// Retrieve the core pet data from the repository
	pet, err := s.petRepo.GetPetByID(ctx, petID)
	if err != nil {
		// Check if the error is 'record not found' and wrap it for standardized error handling
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Use the predefined ErrNotFound
			return nil, fmt.Errorf("%w: pet with ID %s not found", ErrNotFound, petID)
		}
		// For other database errors, return a generic error message
		return nil, fmt.Errorf("failed to retrieve pet %s: %w", petID, err)
	}

	// Populate the photo URLs for the retrieved pet
	err = s.populatePetPhotoURLs(ctx, pet)
	if err != nil {
		// Log the warning but still return the pet data (photos might be partially populated or missing)
		log.Printf("Warning: Failed to fully populate photo URLs for pet %s: %v", petID, err)
		// Do not return the error here, allow the response to proceed with potentially incomplete photo data
	}

	return pet, nil
}

// populatePetPhotoURLs fetches photos for a given pet and sets the AvatarURL and PhotoURLs fields.
func (s *petService) populatePetPhotoURLs(ctx context.Context, pet *models.Pet) error {
	if pet == nil {
		return errors.New("cannot populate photos for nil pet")
	}

	photos, err := s.photoRepo.GetPhotosByOwner(ctx, "pet", pet.ID)
	if err != nil {
		// If no photos found, it's not necessarily an error for population, just means no photos.
		if errors.Is(err, gorm.ErrRecordNotFound) {
			pet.AvatarURL = nil
			pet.PhotoURLs = []string{}
			return nil
		}
		// For other errors, return the error
		return fmt.Errorf("failed to get photos for pet %s: %w", pet.ID, err)
	}

	// Sort photos by their Order field
	sort.Slice(photos, func(i, j int) bool {
		return photos[i].Order < photos[j].Order
	})

	var avatarURL *string
	otherPhotoURLs := []string{}

	for _, p := range photos {
		if p.IsPrimary {
			// Make a copy of the URL string to avoid issues with pointer reuse if we used &p.URL directly
			primaryURL := p.URL
			avatarURL = &primaryURL
		} else {
			otherPhotoURLs = append(otherPhotoURLs, p.URL)
		}
	}

	pet.AvatarURL = avatarURL
	pet.PhotoURLs = otherPhotoURLs

	return nil
}

// --- Placeholder Methods ---

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

	pet.AvatarURL = nil
	pet.PhotoURLs = nil

	err = s.petRepo.CreatePet(ctx, pet)
	if err != nil {
		return nil, fmt.Errorf("failed to save pet to database: %w", err)
	}

	return pet, nil
}

// ListUserPets retrieves all pets for the currently logged-in user
func (s *petService) ListUserPets(ctx context.Context) ([]models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for listing pets: %w", err)
	}

	pets, err := s.petRepo.GetPetsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve pets from database: %w", err)
	}

	for i := range pets {
		err = s.populatePetPhotoURLs(ctx, &pets[i])
		if err != nil {
			log.Printf("Warning: Failed to populate photo URLs for pet %s: %v", pets[i].ID, err)
		}
	}

	return pets, nil
}

// UpdatePetInfo updates information for a specific pet belonging to the current user
func (s *petService) UpdatePetInfo(ctx context.Context, petID uuid.UUID, updateData *models.PetUpdatePayload) (*models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for updating pet: %w", err)
	}

	existingPet, err := s.petRepo.GetPetByID(ctx, petID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: pet with ID %s not found", ErrNotFound, petID)
		}
		return nil, fmt.Errorf("failed to retrieve pet for update: %w", err)
	}

	if existingPet.UserID != userID {
		return nil, ErrUnauthorized
	}

	if updateData.Name != nil {
		existingPet.Name = *updateData.Name
	}
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

	err = s.petRepo.UpdatePet(ctx, existingPet)
	if err != nil {
		return nil, fmt.Errorf("failed to save updated pet to database: %w", err)
	}

	err = s.populatePetPhotoURLs(ctx, existingPet)
	if err != nil {
		log.Printf("Warning: Failed to populate photo URLs for pet %s after update: %v", petID, err)
	}

	return existingPet, nil
}

// DeletePet removes a specific pet belonging to the current user
func (s *petService) DeletePet(ctx context.Context, petID uuid.UUID) error {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user ID for deleting pet: %w", err)
	}

	existingPet, err := s.petRepo.GetPetByID(ctx, petID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: pet with ID %s not found", ErrNotFound, petID)
		}
		return fmt.Errorf("failed to retrieve pet for deletion check: %w", err)
	}

	if existingPet.UserID != userID {
		return ErrUnauthorized
	}

	// TODO: Delete associated photos

	err = s.petRepo.DeletePet(ctx, petID)
	if err != nil {
		return fmt.Errorf("failed to delete pet from database: %w", err)
	}

	return nil
}
