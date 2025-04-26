package service

import (
	"context"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	// "github.com/google/uuid" // Not directly needed in interface definition
)

// RecommendationService defines the interface for generating user recommendations.
type RecommendationService interface {
	// GenerateRecommendations generates a list of potential user connections for the given user.
	// It excludes the user themselves and users they are already connected with.
	GenerateRecommendations(ctx context.Context) ([]models.User, error)
}
