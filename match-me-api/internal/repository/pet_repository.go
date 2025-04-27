package repository

import (
	"context"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
)

// PetRepository defines the interface for pet data operations
type PetRepository interface {
	// CreatePet adds a new pet record to the database
	CreatePet(ctx context.Context, pet *models.Pet) error

	// GetPetsByUserID retrieves all pets belonging to a specific user
	GetPetsByUserID(ctx context.Context, userID uuid.UUID) ([]models.Pet, error)

	// GetPetByID retrieves a single pet by its ID
	GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error)

	// UpdatePet updates an existing pet record in the database
	UpdatePet(ctx context.Context, pet *models.Pet) error

	// DeletePet removes a pet record from the database by its ID
	DeletePet(ctx context.Context, petID uuid.UUID) error

	// FindNearbyPets finds pets whose owners are within a given radius (in meters)
	// from the provided center point WKT, excluding specific pet and owner IDs.
	// It returns pet details along with the distance.
	FindNearbyPets(ctx context.Context, centerPointWKT string, radiusMeters float64, excludePetID uuid.UUID, excludeOwnerID uuid.UUID, limit int) ([]models.RecommendedPetInfo, error)
}
