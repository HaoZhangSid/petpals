package models

import (
	"github.com/google/uuid"
)

// RecommendedPetInfo holds data returned from the repository query,
// including the pet and its distance from the requesting user's location.
// TEMPORARILY SIMPLIFIED FOR DEBUGGING
type RecommendedPetInfo struct {
	// Pet                    // Embed the Pet model (COMMENTED OUT)
	TempID         uuid.UUID `json:"id"`                     // Temporary field
	DistanceMeters float64   `gorm:"column:distance_meters"` // Distance calculated by the database
}

// PetRecommendation is the DTO (Data Transfer Object) returned by the API.
// It includes details about the recommended pet and its owner.
type PetRecommendation struct {
	// --- Pet Details ---
	ID                 uuid.UUID `json:"id"`
	Name               string    `json:"name"`
	Type               string    `json:"type"`
	Breed              *string   `json:"breed,omitempty"`
	Age                *float64  `json:"age,omitempty"` // Consider calculating this in service if Birthday is present
	Gender             *string   `json:"gender,omitempty"`
	Weight             *float64  `json:"weight,omitempty"`
	Bio                *string   `json:"bio,omitempty"`
	Personality        []string  `json:"personality,omitempty"`         // Changed from pq.StringArray for easier JSON
	FavoriteActivities []string  `json:"favorite_activities,omitempty"` // Changed from pq.StringArray
	PlayStyle          []string  `json:"play_style,omitempty"`          // Changed from pq.StringArray
	ActivityLevel      *string   `json:"activity_level,omitempty"`
	IsNeutered         *bool     `json:"is_neutered,omitempty"`
	IsVaccinated       *bool     `json:"is_vaccinated,omitempty"`
	IsMicrochipped     *bool     `json:"is_microchipped,omitempty"`
	PetAvatarURL       *string   `json:"petAvatarUrl,omitempty"` // Pet's primary photo URL
	PetPhotos          []Photo   `json:"petPhotos,omitempty"`    // Full photo objects for the pet

	// --- Owner Details ---
	OwnerID     uuid.UUID `json:"ownerId"`
	OwnerName   string    `json:"ownerName"`
	OwnerAvatar *string   `json:"ownerAvatarUrl,omitempty"` // Owner's primary photo URL

	// --- Recommendation Context ---
	DistanceMeters float64 `json:"distanceMeters"`
}
