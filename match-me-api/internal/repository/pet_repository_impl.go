package repository

import (
	"context"
	"errors"
	"fmt"
	"log"

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
// It now manually loads associated photos and sets the AvatarURL.
func (r *postgresPetRepository) GetPetByID(ctx context.Context, petID uuid.UUID) (*models.Pet, error) {
	var pet models.Pet

	// 1. Fetch the pet first
	result := r.db.WithContext(ctx).
		Where("id = ?", petID).
		First(&pet)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("pet with ID %s not found: %w", petID, result.Error)
		}
		return nil, fmt.Errorf("error fetching pet %s: %w", petID, result.Error)
	}

	// 2. Fetch associated photos
	var photos []models.Photo
	photoResult := r.db.WithContext(ctx).
		Where("owner_type = ? AND owner_id = ?", "pet", pet.ID).
		Order("created_at ASC").
		Find(&photos)

	if photoResult.Error != nil {
		// Log or handle error - returning pet without photos for now, maybe log warning
		fmt.Printf("Warning: could not fetch photos for pet %s: %v\n", pet.ID, photoResult.Error)
		pet.Photos = []models.Photo{} // Ensure Photos is empty slice
		pet.AvatarURL = nil
	} else {
		pet.Photos = photos
		// 3. Set AvatarURL based on loaded photos
		var primaryPhotoURL *string
		for j := range pet.Photos {
			if pet.Photos[j].IsPrimary {
				urlCopy := pet.Photos[j].URL
				primaryPhotoURL = &urlCopy
				break
			}
		}
		if primaryPhotoURL == nil && len(pet.Photos) > 0 {
			urlCopy := pet.Photos[0].URL
			primaryPhotoURL = &urlCopy
		}
		pet.AvatarURL = primaryPhotoURL
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
// It now manually loads associated photos.
func (r *postgresPetRepository) GetPetsByUserID(ctx context.Context, userID uuid.UUID) ([]models.Pet, error) {
	var pets []models.Pet

	// 1. Fetch pets without preloading photos initially
	result := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at ASC").
		Find(&pets)

	if result.Error != nil {
		return nil, fmt.Errorf("error fetching pets for user %s: %w", userID, result.Error)
	}

	// If no pets found, return early
	if len(pets) == 0 {
		return pets, nil
	}

	// 2. Collect pet IDs
	petIDs := make([]uuid.UUID, len(pets))
	for i, p := range pets {
		petIDs[i] = p.ID
	}

	// 3. Fetch all relevant photos in a single query
	var photos []models.Photo
	photoResult := r.db.WithContext(ctx).
		Where("owner_type = ? AND owner_id IN ?", "pet", petIDs).
		Order("created_at ASC"). // Order photos if needed
		Find(&photos)

	if photoResult.Error != nil {
		// Log error but potentially return pets without photos? Or return error?
		// Let's return the error for now, as failing to load photos might be critical.
		return nil, fmt.Errorf("error fetching photos for pets: %w", photoResult.Error)
	}

	// 4. Group photos by OwnerID (pet ID)
	photosByPetID := make(map[uuid.UUID][]models.Photo)
	for _, photo := range photos {
		photosByPetID[photo.OwnerID] = append(photosByPetID[photo.OwnerID], photo)
	}

	// 5. Assign photos and set AvatarURL for each pet
	for i := range pets {
		pet := &pets[i] // Get pointer to modify
		if petPhotos, ok := photosByPetID[pet.ID]; ok {
			pet.Photos = petPhotos
			// Set AvatarURL based on assigned photos
			var primaryPhotoURL *string
			for j := range pet.Photos {
				if pet.Photos[j].IsPrimary {
					urlCopy := pet.Photos[j].URL
					primaryPhotoURL = &urlCopy
					break
				}
			}
			if primaryPhotoURL == nil && len(pet.Photos) > 0 {
				urlCopy := pet.Photos[0].URL
				primaryPhotoURL = &urlCopy
			}
			pet.AvatarURL = primaryPhotoURL
		} else {
			// Ensure Photos is an empty slice, not nil, if no photos found
			pet.Photos = []models.Photo{}
			pet.AvatarURL = nil
		}
	}

	return pets, nil
}

// UpdatePet updates an existing pet record in the database
func (r *postgresPetRepository) UpdatePet(ctx context.Context, pet *models.Pet) error {
	// Ensure the pet ID is valid before attempting update
	if pet.ID == uuid.Nil {
		return fmt.Errorf("cannot update pet with nil ID")
	}

	// Use GORM's Save method for updates (updates all fields based on primary key)
	// Alternatively, use Updates with specific fields if needed.
	result := r.db.WithContext(ctx).Save(pet)

	if result.Error != nil {
		return fmt.Errorf("error updating pet %s in database: %w", pet.ID, result.Error)
	}

	// Check if any row was actually affected. If ID doesn't exist, Save might not error but RowsAffected will be 0.
	if result.RowsAffected == 0 {
		// It's debatable whether this should be an error.
		// GORM's Save might not return ErrRecordNotFound in this case.
		// Let's treat it as "not found" for clarity.
		return fmt.Errorf("pet with ID %s not found for update", pet.ID) // Or return gorm.ErrRecordNotFound?
	}

	return nil
}

// DeletePet removes a pet record from the database by its ID
func (r *postgresPetRepository) DeletePet(ctx context.Context, petID uuid.UUID) error {
	// Ensure the pet ID is valid before attempting delete
	if petID == uuid.Nil {
		return fmt.Errorf("cannot delete pet with nil ID")
	}

	// Use GORM's Delete method
	// We pass a pointer to an empty Pet struct with the ID set
	// GORM uses this to identify the record to delete by primary key
	result := r.db.WithContext(ctx).Delete(&models.Pet{ID: petID})

	if result.Error != nil {
		return fmt.Errorf("error deleting pet %s from database: %w", petID, result.Error)
	}

	// Check if any row was actually affected. If ID doesn't exist, Delete returns RowsAffected = 0 but no error.
	if result.RowsAffected == 0 {
		return fmt.Errorf("pet with ID %s not found for deletion", petID) // Or return gorm.ErrRecordNotFound?
	}

	return nil
}

// FindNearbyPets finds pets whose owners are within a given radius (in meters)
// from the provided center point WKT, excluding specific pet and owner IDs.
// It returns pet details along with the calculated distance.
func (r *postgresPetRepository) FindNearbyPets(ctx context.Context, centerPointWKT string, radiusMeters float64, excludePetID uuid.UUID, excludeOwnerID uuid.UUID, targetPetType string, limit int) ([]models.RecommendedPetInfo, error) {
	var results []models.RecommendedPetInfo

	if centerPointWKT == "" {
		return nil, errors.New("center point WKT cannot be empty for nearby pets query")
	}
	if radiusMeters < 0 {
		return nil, errors.New("radius cannot be negative for nearby pets query")
	}

	// Use Raw SQL for the complex query involving ST_DWithin and ST_Distance
	// GORM's standard methods struggle with selecting calculated fields like distance easily.
	// We select all columns from pets (p.*) and the calculated distance.
	sql := `
        SELECT p.*, ST_Distance(u.coordinates, ?::geography) as distance_meters
        FROM pets p
        JOIN users u ON p.user_id = u.id
        WHERE u.coordinates IS NOT NULL
          AND p.deleted_at IS NULL
          AND p.id <> ?
          AND p.user_id <> ?
          AND p.type = ? 
          AND ST_DWithin(u.coordinates, ?::geography, ?)
        ORDER BY distance_meters ASC
        LIMIT ?
    `

	// Execute the raw query and scan results into the RecommendedPetInfo struct
	// Note the order of parameters must match the placeholders (?) in the SQL string.
	queryResult := r.db.WithContext(ctx).Raw(sql,
		centerPointWKT,
		excludePetID,
		excludeOwnerID,
		targetPetType,
		centerPointWKT,
		radiusMeters,
		limit,
	).Scan(&results)

	if queryResult.Error != nil {
		log.Printf("Error finding nearby pets: %v. Center: %s, Radius: %.2f, ExcludePet: %s, ExcludeOwner: %s",
			queryResult.Error, centerPointWKT, radiusMeters, excludePetID, excludeOwnerID)
		return nil, fmt.Errorf("database error finding nearby pets: %w", queryResult.Error)
	}

	log.Printf("Found %d nearby pets (limit %d) for query: Center: %s, Radius: %.2f, ExcludePet: %s, ExcludeOwner: %s",
		len(results), limit, centerPointWKT, radiusMeters, excludePetID, excludeOwnerID)

	return results, nil
}
