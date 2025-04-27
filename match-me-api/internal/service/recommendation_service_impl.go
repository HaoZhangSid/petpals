package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sort"

	// "math/rand" // For future random selection

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/HaoZhangSid/match-me-api/internal/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	maxRecommendations = 10
)

// recommendationService implements the RecommendationService interface.
type recommendationService struct {
	userRepo  repository.UserRepository
	connRepo  repository.ConnectionRepository
	photoRepo repository.PhotoRepository // Needed to populate user photos
}

// NewRecommendationService creates a new instance of RecommendationService.
func NewRecommendationService(userRepo repository.UserRepository, connRepo repository.ConnectionRepository, photoRepo repository.PhotoRepository) RecommendationService {
	return &recommendationService{
		userRepo:  userRepo,
		connRepo:  connRepo,
		photoRepo: photoRepo,
	}
}

// GenerateRecommendations generates a list of potential user connections.
func (s *recommendationService) GenerateRecommendations(ctx context.Context) ([]models.User, error) {
	// 1. Get current user ID from context
	currentUserID, err := utils.GetUserIDFromContext(ctx) // Use utils package
	if err != nil {
		return nil, fmt.Errorf("failed to get current user ID for recommendations: %w", err)
	}

	// 2. Get IDs of users already connected (status = "accepted")
	acceptedConnections, err := s.connRepo.ListConnectionsByUserID(ctx, currentUserID, "accepted")
	if err != nil {
		log.Printf("Warning: Failed to list accepted connections for user %s: %v", currentUserID, err)
		// Continue even if connections fail to load? Or return error?
		// For now, let's continue with an empty set of excludes if this fails.
		acceptedConnections = []models.Connection{}
	}

	excludedUserIDs := make(map[uuid.UUID]bool)
	excludedUserIDs[currentUserID] = true // Exclude self
	for _, conn := range acceptedConnections {
		if conn.RequesterID == currentUserID {
			excludedUserIDs[conn.ReceiverID] = true
		} else {
			excludedUserIDs[conn.RequesterID] = true
		}
	}

	// 3. Find potential users (excluding self and connected users)
	// We fetch a larger batch initially, e.g., 50, as simple filtering happens in memory.
	// A more optimized approach would filter in the DB query itself.
	potentialLimit := 50                                                            // Fetch more candidates initially
	potentialUsers, err := s.userRepo.FindUsers(ctx, currentUserID, potentialLimit) // FindUsers already excludes self
	if err != nil {
		return nil, fmt.Errorf("failed to find potential users: %w", err)
	}

	// 4. Filter out already connected users from the potential list
	recommendedUsers := make([]models.User, 0, maxRecommendations)
	for _, user := range potentialUsers {
		if len(recommendedUsers) >= maxRecommendations {
			break // Stop once we have enough recommendations
		}
		if !excludedUserIDs[user.ID] {
			// Populate photo URLs before adding to recommendations
			err = s.populateUserPhotoURLs(ctx, &user) // Assumes populateUserPhotoURLs helper exists
			if err != nil {
				log.Printf("Warning: Failed to populate photos for recommended user %s: %v", user.ID, err)
				// Decide whether to skip user or include without photos. Skipping for now.
				continue
			}
			recommendedUsers = append(recommendedUsers, user)
		}
	}

	log.Printf("Generated %d recommendations for user %s", len(recommendedUsers), currentUserID)
	return recommendedUsers, nil
}

// populateUserPhotoURLs fetches photos for a given user and sets the AvatarURL and PhotoURLs fields.
// (Similar to populatePetPhotoURLs, potentially move to a shared helper or keep separate)
func (s *recommendationService) populateUserPhotoURLs(ctx context.Context, user *models.User) error {
	if user == nil {
		return fmt.Errorf("cannot populate photos for nil user")
	}

	// Reset fields
	user.AvatarURL = nil
	user.Photos = []models.Photo{} // Initialize Photos slice

	photos, err := s.photoRepo.GetPhotosByOwner(ctx, "user", user.ID)
	if err != nil {
		// Consider gorm.ErrRecordNotFound as non-fatal, meaning no photos
		if errors.Is(err, gorm.ErrRecordNotFound) {
			user.AvatarURL = nil
			// user.PhotoURLs = []string{} // REMOVE THIS LINE
			user.Photos = []models.Photo{} // Ensure photos is empty
			return nil
		}
		return fmt.Errorf("failed to get photos for user %s: %w", user.ID, err)
	}

	// Assign photos
	user.Photos = photos

	// Sort photos by order (if necessary for determining avatar)
	sort.Slice(photos, func(i, j int) bool {
		// Handle potential nil pointers if Order can be nil, or adjust sorting logic
		// Assuming Order is always non-nil for simplicity here
		return photos[i].Order < photos[j].Order
	})

	// Determine Avatar URL
	var avatarURL *string
	// otherPhotoURLs := []string{} // REMOVE THIS LINE

	for _, p := range photos {
		if p.IsPrimary {
			urlCopy := p.URL // Make a copy
			avatarURL = &urlCopy
			break // Found primary
		} // else {
		// 	otherPhotoURLs = append(otherPhotoURLs, p.URL) // REMOVE THIS LINE
		// }
	}

	// If no primary, optionally use the first photo as avatar
	if avatarURL == nil && len(user.Photos) > 0 {
		urlCopy := user.Photos[0].URL
		avatarURL = &urlCopy
	}

	user.AvatarURL = avatarURL
	// user.PhotoURLs = otherPhotoURLs // REMOVE THIS LINE

	return nil
}
