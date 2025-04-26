package service

import (
	"context"
	"errors"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
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

	// TODO: Consider if other public methods are needed (e.g., getting pet details for another user?)
}
