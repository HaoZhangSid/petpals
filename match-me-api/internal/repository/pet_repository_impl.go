package repository

import (
	"context"
	"fmt"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// postgresPetRepository implements the PetRepository interface using PostgreSQL.
type postgresPetRepository struct {
	db *gorm.DB
}

// NewPostgresPetRepository creates a new instance of postgresPetRepository.
func NewPostgresPetRepository(db *gorm.DB) PetRepository {
	return &postgresPetRepository{db: db}
}

// GetPetByID retrieves a single pet by its ID.
// It returns the pet record or an error if not found or other issues occur.
func (r *postgresPetRepository) GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error) {
	var pet models.Pet
	// We use .WithContext to ensure the query respects context cancellation/timeouts.
	// Note: We are NOT preloading Photos here. Photo loading should happen in the service layer
	// to keep repository focused on direct data access for the Pet model itself.
	result := r.db.WithContext(ctx).Where("id = ?", petID).First(&pet)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("pet with ID %s not found: %w", petID, result.Error) // Consider wrapping gorm.ErrRecordNotFound if specific handling is needed upstream
		}
		return nil, fmt.Errorf("error fetching pet %s: %w", petID, result.Error)
	}

	return &pet, nil
}

// --- Methods to be implemented ---

// CreatePet adds a new pet record to the database
func (r *postgresPetRepository) CreatePet(ctx context.Context, pet *models.Pet) error {
	// Ensure pet has a new UUID if not already assigned (GORM might handle this automatically with BeforeCreate hook, but explicit is safer)
	if pet.ID == uuid.Nil {
		pet.ID = uuid.New()
	}

	// Use GORM's Create method within the context
	result := r.db.WithContext(ctx).Create(pet)

	if result.Error != nil {
		// Provide a more specific error message
		return fmt.Errorf("error creating pet in database: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		// This case might indicate an issue, although Create usually returns error if it fails
		return fmt.Errorf("failed to create pet, no rows affected")
	}

	// Return nil on success
	return nil
}

// GetPetsByUserID retrieves all pets belonging to a specific user
func (r *postgresPetRepository) GetPetsByUserID(ctx context.Context, userID uuid.UUID) ([]models.Pet, error) {
	var pets []models.Pet

	// Query the database for pets matching the userID
	// Use .WithContext for cancellation support
	// Order by creation time or name, for example
	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at ASC").Find(&pets)

	if result.Error != nil {
		// Return an empty slice and the error if the query fails
		return nil, fmt.Errorf("error fetching pets for user %s: %w", userID, result.Error)
	}

	// Return the slice of pets (can be empty if user has no pets)
	return pets, nil
}

// UpdatePet updates an existing pet record in the database
func (r *postgresPetRepository) UpdatePet(ctx context.Context, pet *models.Pet) error {
	// TODO: Implement UpdatePet logic
	panic("UpdatePet not implemented")
}

// DeletePet removes a pet record from the database by its ID
func (r *postgresPetRepository) DeletePet(ctx context.Context, petID uuid.UUID) error {
	// TODO: Implement DeletePet logic
	panic("DeletePet not implemented")
}
