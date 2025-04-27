package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	// Removed filestorage import, no longer needed here
	"github.com/HaoZhangSid/match-me-api/internal/middleware"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UserHandler handles user-related HTTP requests.
type UserHandler struct {
	userService service.UserService
	// fileStore   filestorage.FileStorage // Removed fileStore dependency
	// photoService service.PhotoService // Optional: Inject if needed for future user-specific photo actions
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(userService service.UserService) *UserHandler { // Removed fileStore
	return &UserHandler{
		userService: userService,
		// fileStore:   fileStore,
	}
}

// UpdateCurrentUser handles requests to update the currently logged-in user's profile (non-photo fields).
func (h *UserHandler) UpdateCurrentUser(c *gin.Context) {
	// 1. Get UserID from context
	userIDAny := c.Request.Context().Value(middleware.UserIDKey)
	if userIDAny == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}
	userID, ok := userIDAny.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid User ID in context"})
		return
	}

	// 2. Bind JSON Payload
	var payload models.UserUpdatePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("Error binding JSON payload for user %s: %v", userID, err)
		// Check if the error is due to empty request body or actual JSON parsing error
		if err.Error() == "EOF" { // Or check binding.ErrEmptyBody if using ShouldBindWith
			c.JSON(http.StatusBadRequest, gin.H{"error": "Request body cannot be empty"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request body: %v", err)})
		}
		return
	}

	// 3. Call the UserService to update the user
	// The payload is now correctly populated from the JSON body
	updatedUser, err := h.userService.UpdateUser(c.Request.Context(), userID, &payload)
	if err != nil {
		// Handle potential service errors (e.g., validation, not found)
		log.Printf("Error calling userService.UpdateUser for %s: %v", userID, err)
		if errors.Is(err, service.ErrNotFound) { // Assuming service might return ErrNotFound
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrValidation) { // Assuming service might return validation errors
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
		}
		return
	}

	// 4. Return the updated user profile (now includes transient photo URLs populated by service)
	log.Printf("Successfully updated profile for user %s", userID)
	c.JSON(http.StatusOK, updatedUser)
}

// Add GetCurrentUser Handler (moved from main.go)
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userIDAny := c.Request.Context().Value(middleware.UserIDKey)
	if userIDAny == nil {
		log.Println("[Handler /me GET] Error: User ID not found in context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found in context after auth"})
		return
	}
	userID, ok := userIDAny.(uuid.UUID)
	if !ok {
		log.Printf("[Handler /me GET] Error: User ID is not uuid.UUID. Actual type: %T", userIDAny)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID in context is of wrong type"})
		return
	}

	user, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		log.Printf("[Handler /me GET] Error getting user %s: %v", userID, err)
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user profile"})
		}
		return
	}

	log.Printf("[Handler /me GET] Successfully retrieved user profile for ID: %s", userID)
	c.JSON(http.StatusOK, user)
}

/* // REMOVED Incorrect User Recommendation Handler
// GetRecommendations handles requests to get user recommendations for the logged-in user.
func (h *UserHandler) GetRecommendations(c *gin.Context) {
	// ... implementation removed ...
}
*/

// TODO: Add GetUserProfile handler if needed for public profiles
