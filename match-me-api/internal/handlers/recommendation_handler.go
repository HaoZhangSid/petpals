package handlers

import (
	"log"
	"net/http"

	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	// Import other necessary packages like models if needed for response structure
)

// RecommendationHandler handles recommendation related HTTP requests.
type RecommendationHandler struct {
	recommendationService service.RecommendationService
}

// NewRecommendationHandler creates a new RecommendationHandler.
func NewRecommendationHandler(recService service.RecommendationService) *RecommendationHandler {
	return &RecommendationHandler{
		recommendationService: recService,
	}
}

// GetRecommendations handles GET /recommendations requests.
func (h *RecommendationHandler) GetRecommendations(c *gin.Context) {
	// The service layer already extracts the user ID from the context
	recommendations, err := h.recommendationService.GenerateRecommendations(c.Request.Context())
	if err != nil {
		// Log the error and return an appropriate HTTP status code
		log.Printf("[Handler /recommendations GET] Error generating recommendations: %v", err)
		// Determine the type of error if needed (e.g., internal vs. not found - though service handles not found logic internally for users)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate recommendations"})
		return
	}

	// Return the recommendations (already includes populated photo URLs)
	c.JSON(http.StatusOK, recommendations)
}
