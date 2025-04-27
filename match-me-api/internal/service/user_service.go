package service

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm" // Import gorm for error checking
)

// UserService defines the interface for user-related business logic.
// It might include methods for registration, profile updates, etc.
type UserService interface {
	UpdateUser(ctx context.Context, userID uuid.UUID, updateData *models.UserUpdatePayload) (*models.User, error)
	GetUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error)
	// Add other user-related methods like CreateUser if they belong here (not in AuthService)
}

// userService implements the UserService interface.
type userService struct {
	userRepo  repository.UserRepository
	photoRepo repository.PhotoRepository // Added PhotoRepository dependency
}

// NewUserService creates a new instance of UserService.
func NewUserService(userRepo repository.UserRepository, photoRepo repository.PhotoRepository) UserService {
	return &userService{
		userRepo:  userRepo,
		photoRepo: photoRepo, // Store PhotoRepository
	}
}

// UpdateUser handles the logic for updating a user's profile.
func (s *userService) UpdateUser(ctx context.Context, userID uuid.UUID, payload *models.UserUpdatePayload) (*models.User, error) {
	// 1. Basic validation of payload presence
	if payload == nil {
		// Assuming ErrValidation is defined elsewhere in the package or imported
		return nil, fmt.Errorf("%w: update payload cannot be nil", ErrValidation)
	}

	// 2. Build the update map
	updates := make(map[string]interface{})

	if payload.Name != nil {
		if *payload.Name == "" {
			return nil, fmt.Errorf("%w: user name cannot be empty", ErrValidation)
		}
		updates["name"] = *payload.Name
	}
	if payload.Location != nil { // Keep handling the simple location string if needed
		updates["location"] = *payload.Location
	}
	if payload.Phone != nil {
		updates["phone"] = *payload.Phone
	}
	if payload.Bio != nil {
		updates["bio"] = *payload.Bio
	}
	if payload.Interests != nil { // Replaces the entire array
		updates["interests"] = *payload.Interests
	}

	// --- New Geolocation Field Handling ---
	if payload.MaxRecommendationRadiusKm != nil {
		if *payload.MaxRecommendationRadiusKm < 0 {
			return nil, fmt.Errorf("%w: max recommendation radius cannot be negative", ErrValidation)
		}
		updates["max_recommendation_radius_km"] = *payload.MaxRecommendationRadiusKm
	}

	if payload.Coordinates != nil {
		lat := payload.Coordinates.Latitude
		lon := payload.Coordinates.Longitude
		// Validate coordinates
		if lat < -90 || lat > 90 || lon < -180 || lon > 180 {
			return nil, fmt.Errorf("%w: invalid latitude or longitude provided", ErrValidation)
		}
		// Format to WKT: SRID=4326;POINT(longitude latitude)
		wktPoint := fmt.Sprintf("SRID=4326;POINT(%f %f)", lon, lat)
		updates["coordinates"] = wktPoint
	}
	// --- End Geolocation Handling ---

	// 3. Check if there's anything to update
	if len(updates) == 0 {
		log.Printf("No fields to update for user %s", userID)
		// Return current user data without hitting the DB for an update
		user, err := s.GetUserByID(ctx, userID)
		if err != nil {
			// Log the error, but the primary operation (update) wasn't needed
			log.Printf("Error fetching user %s after determining no update needed: %v", userID, err)
			return nil, err // Return the fetch error
		}
		return user, nil
	}

	// 4. Call the repository to save the updates map
	err := s.userRepo.UpdateUser(ctx, userID, updates)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("Attempted to update non-existent user %s", userID)
			// Assuming ErrNotFound is defined elsewhere
			return nil, fmt.Errorf("%w: user with ID %s not found", ErrNotFound, userID)
		}
		log.Printf("Error updating user %s in repository: %v", userID, err)
		return nil, fmt.Errorf("database error during user update: %w", err) // More generic error to client
	}

	// 5. Re-fetch the user to return the updated state including transient fields
	// This ensures consistency, especially if DB triggers or defaults modified other fields.
	updatedUser, err := s.GetUserByID(ctx, userID)
	if err != nil {
		log.Printf("Error re-fetching user %s after successful update: %v", userID, err)
		// Decide if this error is critical. Maybe return success but log heavily?
		// For now, let's return the error.
		return nil, fmt.Errorf("failed to retrieve updated user data: %w", err)
	}

	log.Printf("Successfully processed update for user %s", userID)
	return updatedUser, nil
}

// GetUserByID retrieves a user by their ID and populates photo URLs.
func (s *userService) GetUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Ensure ErrNotFound is accessible here
			return nil, fmt.Errorf("%w: user %s not found", ErrNotFound, userID)
		}
		return nil, fmt.Errorf("failed to get user by ID from repository: %w", err)
	}

	err = s.populateUserPhotoURLs(ctx, user)
	if err != nil {
		// Log error but return user data anyway
		log.Printf("Warning: Failed to populate photo URLs for user %s: %v", userID, err)
	}

	return user, nil
}

// populateUserPhotoURLs (or populateUserPhotosInfo) fetches and attaches photo info.
func (s *userService) populateUserPhotoURLs(ctx context.Context, user *models.User) error {
	if user == nil {
		return nil // Nothing to populate
	}

	// Reset fields before populating
	user.AvatarURL = nil
	user.Photos = []models.Photo{}

	// Get All Photos for the owner
	allPhotos, err := s.photoRepo.GetPhotosByOwner(ctx, "user", user.ID)
	if err != nil {
		// Log error but don't fail the entire user retrieval
		log.Printf("Error fetching photos for user %s: %v", user.ID, err)
		return nil // Return nil to indicate non-fatal error for photo population
	}

	// Assign the full photo objects to the new field
	if len(allPhotos) > 0 {
		user.Photos = allPhotos
	} else {
		user.Photos = []models.Photo{} // Ensure it's an empty slice, not nil, for JSON
	}

	// Populate AvatarURL from the fetched photos
	for _, p := range allPhotos {
		if p.IsPrimary {
			// Make a copy of the URL string to avoid pointer issues if needed
			primaryUrl := p.URL
			user.AvatarURL = &primaryUrl
			break // Found primary, no need to check further for AvatarURL
		}
	}

	// If no primary photo was found, maybe assign the first one as avatar?
	// This is optional, depends on desired behavior.
	if user.AvatarURL == nil && len(user.Photos) > 0 {
		urlCopy := user.Photos[0].URL
		user.AvatarURL = &urlCopy
	}

	return nil
}

// Helper function to hash password (Might belong in AuthService or a util package)
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

/* // REMOVED Incorrect User Recommendation Service Method
// GetRecommendations finds users within the requesting user's specified radius.
func (s *userService) GetRecommendations(ctx context.Context, requestingUserID uuid.UUID) ([]models.User, error) {
	// ... implementation removed ...
}
*/
