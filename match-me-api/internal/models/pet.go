package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Pet defines the unified pet model in the application
type Pet struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID             uuid.UUID      `gorm:"type:uuid;index;not null" json:"userId"`
	Name               string         `gorm:"size:255;not null" json:"name"`
	Type               string         `gorm:"size:50;not null" json:"type"`
	Breed              *string        `gorm:"size:100" json:"breed,omitempty"`
	Gender             *string        `gorm:"size:20" json:"gender,omitempty"`
	Weight             *float64       `gorm:"type:float" json:"weight,omitempty"`
	Birthday           *time.Time     `gorm:"type:date" json:"birthday,omitempty"`
	Bio                *string        `gorm:"type:text" json:"bio,omitempty"`
	Personality        pq.StringArray `gorm:"type:text[]" json:"personality,omitempty"`
	FavoriteActivities pq.StringArray `gorm:"type:text[]" json:"favoriteActivities,omitempty"`
	PlayStyle          pq.StringArray `gorm:"type:text[]" json:"playStyle,omitempty"`
	ActivityLevel      *string        `gorm:"size:50" json:"activityLevel,omitempty"`
	IsMicrochipped     *bool          `gorm:"default:false" json:"isMicrochipped,omitempty"`
	IsVaccinated       *bool          `gorm:"default:false" json:"isVaccinated,omitempty"`
	IsNeutered         *bool          `gorm:"default:false" json:"isNeutered,omitempty"`
	CreatedAt          time.Time      `json:"createdAt"`
	UpdatedAt          time.Time      `json:"updatedAt"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	// Relationships
	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	// Let Repository handle loading via Preload, ignore field for GORM auto-processing
	Photos []Photo `gorm:"-" json:"photos,omitempty"`

	// Transient field for API responses (can be populated by service/repo)
	AvatarURL *string `gorm:"-" json:"avatarUrl,omitempty"` // Primary photo URL
}

// PetUpdatePayload defines the structure for updating a pet.
// Uses pointers for most fields to distinguish between zero values and fields not provided.
type PetUpdatePayload struct {
	Name               *string         `json:"name,omitempty"`
	Type               *string         `json:"type,omitempty"`
	Breed              *string         `json:"breed,omitempty"`
	Gender             *string         `json:"gender,omitempty"`
	Weight             *float64        `json:"weight,omitempty"`
	Birthday           *time.Time      `json:"birthday,omitempty"`
	Bio                *string         `json:"bio,omitempty"`
	Personality        *pq.StringArray `json:"personality,omitempty"`
	FavoriteActivities *pq.StringArray `json:"favoriteActivities,omitempty"`
	PlayStyle          *pq.StringArray `json:"playStyle,omitempty"`
	ActivityLevel      *string         `json:"activityLevel,omitempty"`
	IsMicrochipped     *bool           `json:"isMicrochipped,omitempty"`
	IsVaccinated       *bool           `json:"isVaccinated,omitempty"`
	IsNeutered         *bool           `json:"isNeutered,omitempty"`
}
