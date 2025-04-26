package service

import (
	"context"
	"fmt"
	"log"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

// UpdateUser handles the logic for updating a user's profile (excluding photos).
func (s *userService) UpdateUser(ctx context.Context, userID uuid.UUID, updateData *models.UserUpdatePayload) (*models.User, error) {
	// 1. Fetch the existing user to apply changes
	existingUser, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find user %s for update: %w", userID, err)
	}

	// 2. Apply updates from payload to existingUser
	if updateData.Name != nil {
		existingUser.Name = *updateData.Name
	}
	// Removed Avatar update logic - Handled by PhotoService/Handler
	if updateData.Location != nil {
		existingUser.Location = *updateData.Location
	}
	if updateData.Phone != nil {
		existingUser.Phone = *updateData.Phone
	}
	if updateData.Bio != nil {
		existingUser.Bio = *updateData.Bio
	}
	if updateData.Interests != nil {
		existingUser.Interests = *updateData.Interests
	}
	// Removed Photos/AppendPhotos update logic - Handled by PhotoService/Handler

	// 3. Call the repository to save the updated existingUser object
	err = s.userRepo.UpdateUser(ctx, existingUser) // Pass the modified object
	if err != nil {
		return nil, fmt.Errorf("failed to save updated user in repository: %w", err)
	}

	// 4. Populate transient photo fields before returning
	err = s.populateUserPhotoURLs(ctx, existingUser)
	if err != nil {
		// Log error but potentially return the user data anyway?
		log.Printf("Warning: Failed to populate photo URLs for user %s after update: %v", userID, err)
	}

	// 5. Return the modified existingUser object (now saved)
	return existingUser, nil
}

// GetUserByID retrieves a user by their ID and populates photo URLs.
func (s *userService) GetUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
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
	user.PhotoURLs = []string{}
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

	// Populate AvatarURL and PhotoURLs from the fetched photos for compatibility/convenience
	user.PhotoURLs = make([]string, 0, len(allPhotos))
	for _, p := range allPhotos {
		if p.IsPrimary {
			// Make a copy of the URL string to avoid pointer issues if needed
			primaryUrl := p.URL
			user.AvatarURL = &primaryUrl
		}
		user.PhotoURLs = append(user.PhotoURLs, p.URL)
	}

	// Ensure PhotoURLs is an empty slice if no photos, not nil
	if user.PhotoURLs == nil {
		user.PhotoURLs = []string{}
	}

	return nil
}

// Helper function to hash password (Might belong in AuthService or a util package)
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}
