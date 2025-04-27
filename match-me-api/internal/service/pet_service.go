package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time" // Needed for age calculation

	// Need UserIDKey
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/HaoZhangSid/match-me-api/internal/utils" // Import utils
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// --- Service Specific Errors ---
// These errors can be defined here as they are part of the service contract
var (
	ErrUnauthorized = errors.New("unauthorized operation")
	ErrValidation   = errors.New("validation failed")
	ErrNotFound     = errors.New("resource not found")
)

// PetService defines the interface for pet-related business logic
type PetService interface {
	// AddPet adds a new pet for the currently logged-in user
	AddPet(ctx context.Context, pet *models.Pet) (*models.Pet, error)

	// ListUserPets retrieves all pets for the currently logged-in user
	ListUserPets(ctx context.Context) ([]models.Pet, error)

	// UpdatePetInfo updates information for a specific pet belonging to the current user
	UpdatePetInfo(ctx context.Context, petID uuid.UUID, updateData *models.PetUpdatePayload) (*models.Pet, error)

	// DeletePet removes a specific pet belonging to the current user
	DeletePet(ctx context.Context, petID uuid.UUID) error

	// GetPetByID retrieves a single pet and populates its photo URLs.
	GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error)

	// GetPetRecommendations finds suitable pet playmates near the target pet's owner.
	GetPetRecommendations(ctx context.Context, targetPetID uuid.UUID, requestingUserID uuid.UUID) ([]models.PetRecommendation, error)

	// TODO: Consider if other public methods are needed (e.g., getting pet details for another user?)
}

// petService implements the PetService interface
type petService struct {
	petRepo   repository.PetRepository
	photoRepo repository.PhotoRepository
	userRepo  repository.UserRepository // Added UserRepository dependency
}

// NewPetService creates a new PetService
func NewPetService(petRepo repository.PetRepository, photoRepo repository.PhotoRepository, userRepo repository.UserRepository) PetService {
	return &petService{
		petRepo:   petRepo,
		photoRepo: photoRepo,
		userRepo:  userRepo, // Inject UserRepository
	}
}

// AddPet handles adding a new pet for the user specified in the context
func (s *petService) AddPet(ctx context.Context, pet *models.Pet) (*models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for adding pet: %w", ErrUnauthorized)
	}
	pet.UserID = userID

	if pet.Name == "" || pet.Type == "" {
		return nil, fmt.Errorf("%w: pet name and type are required", ErrValidation)
	}

	err = s.petRepo.CreatePet(ctx, pet)
	if err != nil {
		return nil, fmt.Errorf("failed to save pet to database: %w", err)
	}

	// Return the created pet (photos will be empty as none are associated yet)
	// Fetch again to get photos if needed, though repo Create doesn't add them.
	createdPet, err := s.petRepo.GetPetByID(ctx, pet.ID) // Use GetPetByID which loads photos
	if err != nil {
		log.Printf("Warning: failed to fetch pet %s immediately after creation: %v", pet.ID, err)
		// Return the initially passed pet object, but it might lack some data (like photos)
		return pet, nil
	}

	return createdPet, nil
}

// ListUserPets retrieves pets for the user specified in the context
func (s *petService) ListUserPets(ctx context.Context) ([]models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for listing pets: %w", ErrUnauthorized)
	}

	// GetPetsByUserID should handle photo population
	pets, err := s.petRepo.GetPetsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list user pets: %w", err)
	}

	return pets, nil
}

// GetPetByID retrieves a single pet by its ID and populates photo URLs.
func (s *petService) GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error) {
	pet, err := s.petRepo.GetPetByID(ctx, petID) // GetPetByID in repo now handles photos
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) { // Check if repo returns gorm error
			return nil, fmt.Errorf("%w: pet %s not found", ErrNotFound, petID)
		}
		return nil, fmt.Errorf("failed to get pet by ID: %w", err)
	}
	return pet, nil
}

// UpdatePetInfo handles updating a pet, ensuring authorization
func (s *petService) UpdatePetInfo(ctx context.Context, petID uuid.UUID, payload *models.PetUpdatePayload) (*models.Pet, error) {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID for updating pet: %w", ErrUnauthorized)
	}

	// 1. Get the existing pet
	existingPet, err := s.petRepo.GetPetByID(ctx, petID) // Get full pet data
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: pet %s not found for update", ErrNotFound, petID)
		}
		return nil, fmt.Errorf("failed to find pet %s for update: %w", petID, err)
	}

	// 2. Check ownership
	if existingPet.UserID != userID {
		return nil, fmt.Errorf("user %s not authorized to update pet %s: %w", userID, petID, ErrUnauthorized)
	}

	// 3. Apply updates from payload
	if payload.Name != nil {
		existingPet.Name = *payload.Name
	}
	if payload.Type != nil {
		existingPet.Type = *payload.Type
	}
	if payload.Breed != nil {
		existingPet.Breed = payload.Breed
	}
	if payload.Gender != nil {
		existingPet.Gender = payload.Gender
	}
	if payload.Weight != nil {
		existingPet.Weight = payload.Weight
	}
	if payload.Birthday != nil {
		existingPet.Birthday = payload.Birthday
	}
	if payload.Bio != nil {
		existingPet.Bio = payload.Bio
	}
	if payload.Personality != nil {
		existingPet.Personality = *payload.Personality
	}
	if payload.FavoriteActivities != nil {
		existingPet.FavoriteActivities = *payload.FavoriteActivities
	}
	if payload.PlayStyle != nil {
		existingPet.PlayStyle = *payload.PlayStyle
	}
	if payload.ActivityLevel != nil {
		existingPet.ActivityLevel = payload.ActivityLevel
	}
	if payload.IsNeutered != nil {
		existingPet.IsNeutered = payload.IsNeutered
	}
	if payload.IsVaccinated != nil {
		existingPet.IsVaccinated = payload.IsVaccinated
	}
	if payload.IsMicrochipped != nil {
		existingPet.IsMicrochipped = payload.IsMicrochipped
	}

	// Add validation for required fields after update
	if existingPet.Name == "" || existingPet.Type == "" {
		return nil, fmt.Errorf("%w: pet name and type cannot be empty after update", ErrValidation)
	}

	// 4. Save updated pet (repo UpdatePet likely uses Save which updates all fields)
	err = s.petRepo.UpdatePet(ctx, existingPet)
	if err != nil {
		return nil, fmt.Errorf("failed to save updated pet %s: %w", petID, err)
	}

	// 5. Return the updated pet (already includes photos from GetPetByID)
	return existingPet, nil
}

// DeletePet handles deleting a pet, ensuring authorization
func (s *petService) DeletePet(ctx context.Context, petID uuid.UUID) error {
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user ID for deleting pet: %w", ErrUnauthorized)
	}

	// 1. Get the pet to check ownership before deleting
	pet, err := s.petRepo.GetPetByID(ctx, petID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// If not found, maybe return success (idempotent) or specific error?
			// Returning NotFound for now.
			return fmt.Errorf("%w: pet %s not found for deletion", ErrNotFound, petID)
		}
		return fmt.Errorf("failed to find pet %s for deletion check: %w", petID, err)
	}

	// 2. Check ownership
	if pet.UserID != userID {
		return fmt.Errorf("user %s not authorized to delete pet %s: %w", userID, petID, ErrUnauthorized)
	}

	// 3. Delete the pet
	err = s.petRepo.DeletePet(ctx, petID)
	if err != nil {
		// Check if repo distinguishes not found error on delete
		if errors.Is(err, gorm.ErrRecordNotFound) { // Assuming repo might return this
			return fmt.Errorf("%w: pet %s not found during deletion attempt", ErrNotFound, petID)
		}
		return fmt.Errorf("failed to delete pet %s: %w", petID, err)
	}

	// TODO: Delete associated photos (optional - maybe handled by CASCADE? Check DB schema)
	// photoRepo.DeletePhotosByOwner(ctx, "pet", petID)

	return nil
}

// GetPetRecommendations finds suitable pet playmates near the target pet's owner.
func (s *petService) GetPetRecommendations(ctx context.Context, targetPetID uuid.UUID, requestingUserID uuid.UUID) ([]models.PetRecommendation, error) {
	log.Printf("Service: GetPetRecommendations called for pet %s by user %s", targetPetID, requestingUserID)

	// 1. Get the target Pet and validate ownership
	targetPet, err := s.petRepo.GetPetByID(ctx, targetPetID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: target pet %s not found", ErrNotFound, targetPetID)
		}
		log.Printf("Error fetching target pet %s: %v", targetPetID, err)
		return nil, fmt.Errorf("failed to get target pet data: %w", err)
	}
	if targetPet.UserID != requestingUserID {
		log.Printf("Unauthorized attempt by user %s to get recommendations for pet %s (owner %s)",
			requestingUserID, targetPetID, targetPet.UserID)
		return nil, fmt.Errorf("%w: cannot get recommendations for a pet you do not own", ErrUnauthorized)
	}

	// 2. Get the Owner's data
	owner, err := s.userRepo.GetUserByID(ctx, targetPet.UserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("Owner %s not found for pet %s", targetPet.UserID, targetPetID)
			return nil, fmt.Errorf("%w: owner %s not found", ErrNotFound, targetPet.UserID)
		}
		log.Printf("Error fetching owner %s for pet %s: %v", targetPet.UserID, targetPetID, err)
		return nil, fmt.Errorf("failed to get owner data: %w", err)
	}

	// 3. Check owner's location and radius preferences
	if owner.Coordinates == nil || *owner.Coordinates == "" {
		log.Printf("Owner %s has no coordinates set. Cannot get recommendations.", owner.ID)
		return []models.PetRecommendation{}, nil // Return empty list if no location
		// return nil, fmt.Errorf("%w: owner must set location for recommendations", ErrValidation)
	}
	if owner.MaxRecommendationRadiusKm == nil {
		log.Printf("Owner %s has no recommendation radius set. Cannot get recommendations.", owner.ID)
		return []models.PetRecommendation{}, nil // Return empty list if no radius
		// return nil, fmt.Errorf("%w: owner must set recommendation radius", ErrValidation)
	}

	radiusKm := *owner.MaxRecommendationRadiusKm
	if radiusKm <= 0 {
		log.Printf("Owner %s has non-positive radius %.2f km.", owner.ID, radiusKm)
		return []models.PetRecommendation{}, nil // Return empty list
	}
	radiusMeters := radiusKm * 1000.0
	centerPointWKT := *owner.Coordinates
	limit := 50 // Default recommendation limit

	log.Printf("Service: Finding nearby pets for owner %s within %.2f meters of %s (excluding pet %s)",
		owner.ID, radiusMeters, centerPointWKT, targetPetID)

	// 4. Call Repository to find nearby pets (including distance)
	recommendedPetInfos, err := s.petRepo.FindNearbyPets(ctx, centerPointWKT, radiusMeters, targetPetID, owner.ID, limit)
	if err != nil {
		log.Printf("Error calling FindNearbyPets repository method: %v", err)
		return nil, fmt.Errorf("failed to query nearby pets: %w", err)
	}

	if len(recommendedPetInfos) == 0 {
		log.Printf("Service: No nearby pets found for owner %s", owner.ID)
		return []models.PetRecommendation{}, nil
	}

	// 5. Prepare the final DTO list, populating owner and photo details
	recommendations := make([]models.PetRecommendation, 0, len(recommendedPetInfos))
	ownerInfoCache := make(map[uuid.UUID]*models.User)  // Cache owner info
	ownerAvatarCache := make(map[uuid.UUID]*string)     // Cache owner avatar URLs
	petPhotoCache := make(map[uuid.UUID][]models.Photo) // Cache pet photos

	for _, info := range recommendedPetInfos {
		recommendedPet := info.Pet // Get the embedded pet model

		// --- Get Pet Photos ---
		var petPhotos []models.Photo
		if cachedPhotos, found := petPhotoCache[recommendedPet.ID]; found {
			petPhotos = cachedPhotos
		} else {
			fetchedPhotos, err := s.photoRepo.GetPhotosByOwner(ctx, "pet", recommendedPet.ID)
			if err != nil {
				log.Printf("Warning: Failed to fetch photos for recommended pet %s: %v", recommendedPet.ID, err)
				petPhotos = []models.Photo{}
			} else {
				petPhotos = fetchedPhotos
			}
			petPhotoCache[recommendedPet.ID] = petPhotos // Cache the result (even if empty/error)
		}
		// Determine Pet Avatar URL
		var petAvatarURL *string
		for _, p := range petPhotos {
			if p.IsPrimary {
				urlCopy := p.URL
				petAvatarURL = &urlCopy
				break
			}
		}
		if petAvatarURL == nil && len(petPhotos) > 0 {
			urlCopy := petPhotos[0].URL
			petAvatarURL = &urlCopy
		}

		// --- Get Owner Info ---
		var recOwner *models.User
		var ownerAvatarURL *string

		if cachedOwner, found := ownerInfoCache[recommendedPet.UserID]; found {
			recOwner = cachedOwner
			ownerAvatarURL = ownerAvatarCache[recommendedPet.UserID] // Get cached avatar
		} else {
			fetchedOwner, err := s.userRepo.GetUserByID(ctx, recommendedPet.UserID)
			if err != nil {
				log.Printf("Warning: Failed to fetch owner %s for recommended pet %s: %v", recommendedPet.UserID, recommendedPet.ID, err)
				// Skip this recommendation if owner data is crucial?
				continue
			}
			recOwner = fetchedOwner
			ownerInfoCache[recommendedPet.UserID] = recOwner // Cache owner

			// Fetch owner's primary photo
			log.Printf("Service: Fetching primary photo for owner %s", recOwner.ID) // Log fetch attempt
			ownerPrimaryPhoto, err := s.photoRepo.GetPrimaryPhoto(ctx, "user", recOwner.ID)
			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("Warning: Failed to check primary photo for owner %s: %v", recOwner.ID, err)
				ownerAvatarURL = nil // Ensure it's nil on error
			} else if ownerPrimaryPhoto != nil {
				log.Printf("Service: Found primary photo for owner %s: %s", recOwner.ID, ownerPrimaryPhoto.URL) // Log success
				urlCopy := ownerPrimaryPhoto.URL                                                                // Create copy for pointer safety
				ownerAvatarURL = &urlCopy
			} else {
				log.Printf("Service: No primary photo found for owner %s", recOwner.ID) // Log not found
				ownerAvatarURL = nil                                                    // Explicitly nil if not found
			}
			ownerAvatarCache[recOwner.ID] = ownerAvatarURL // Cache avatar (might be nil)
		}

		// Calculate Age (Example - adjust as needed)
		var age *float64
		if recommendedPet.Birthday != nil {
			ageYears := time.Since(*recommendedPet.Birthday).Hours() / 24 / 365.25
			age = &ageYears
		}

		// --- Construct DTO ---
		log.Printf("Service: Constructing DTO. Owner: %s, AvatarURL: %v", recOwner.Name, ownerAvatarURL) // Log before assignment
		dto := models.PetRecommendation{
			// Pet Details
			ID:                 recommendedPet.ID,
			Name:               recommendedPet.Name,
			Type:               recommendedPet.Type,
			Breed:              recommendedPet.Breed,
			Age:                age,
			Gender:             recommendedPet.Gender,
			Weight:             recommendedPet.Weight,
			Bio:                recommendedPet.Bio,
			Personality:        []string(recommendedPet.Personality), // Convert pq.StringArray
			FavoriteActivities: []string(recommendedPet.FavoriteActivities),
			PlayStyle:          []string(recommendedPet.PlayStyle),
			ActivityLevel:      recommendedPet.ActivityLevel,
			IsNeutered:         recommendedPet.IsNeutered,
			IsVaccinated:       recommendedPet.IsVaccinated,
			IsMicrochipped:     recommendedPet.IsMicrochipped,
			PetAvatarURL:       petAvatarURL,
			PetPhotos:          petPhotos,

			// Owner Details
			OwnerID:     recOwner.ID,
			OwnerName:   recOwner.Name,
			OwnerAvatar: ownerAvatarURL, // Assign the determined value

			// Recommendation Context
			DistanceMeters: info.DistanceMeters,
		}
		recommendations = append(recommendations, dto)
	}

	log.Printf("Service: Returning %d pet recommendations for pet %s", len(recommendations), targetPetID)
	return recommendations, nil
}
