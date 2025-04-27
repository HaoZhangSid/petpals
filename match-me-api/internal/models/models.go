package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// --- Base Model --- //

// BaseUUIDModel provides common fields (UUID PK, Timestamps, Soft Delete)
// Can be embedded in other models.
type BaseUUIDModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// --- User Model --- //

// User defines the user model in the application
type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id" db:"id"` // Added gorm tags for UUID PK
	Name      string    `json:"name" db:"name"`                                                    // User's name
	Email     string    `json:"email" db:"email" gorm:"unique"`                                    // User's email, should be unique
	Password  string    `json:"-" db:"password"`                                                   // User's hashed password, excluded from JSON
	CreatedAt time.Time `json:"created_at" db:"created_at"`                                        // Timestamp of creation
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`                                        // Timestamp of last update
	// Avatar    string         `gorm:"size:512" json:"avatar,omitempty"`                                  // Removed - Handled by Photo model
	Location  string         `gorm:"size:255" json:"location"`             // Removed omitempty - Legacy?
	Phone     string         `gorm:"size:50" json:"phone"`                 // Removed omitempty
	Bio       string         `gorm:"type:text" json:"bio"`                 // Removed omitempty
	Interests pq.StringArray `gorm:"type:varchar(100)[]" json:"interests"` // Removed omitempty
	// Photos    pq.StringArray `gorm:"type:text[]" json:"photos,omitempty"`                               // Removed - Handled by Photo model

	// New fields for geolocation
	Coordinates               *string  `gorm:"column:coordinates;type:geography(Point,4326)" json:"coordinates,omitempty"`        // User's location as WKT Point Geography
	MaxRecommendationRadiusKm *float64 `gorm:"column:max_recommendation_radius_km" json:"max_recommendation_radius_km,omitempty"` // Preferred max distance for recommendations in KM

	// Relationships
	Pets []Pet `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"-"` // GORM relationship

	// Transient fields for API responses (populated by service layer)
	AvatarURL *string `gorm:"-" json:"avatarUrl,omitempty"` // Primary photo URL
	// PhotoURLs []string `gorm:"-" json:"photoUrls"` // REMOVED - Use Photos field
	Photos []Photo `gorm:"-" json:"photos,omitempty"` // Full photo objects for detailed info
}

// CoordinatesPayload defines the structure for receiving coordinates in API requests.
type CoordinatesPayload struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// UserUpdatePayload defines the structure for updating a user profile.
type UserUpdatePayload struct {
	Name      *string         `json:"name,omitempty"`
	Location  *string         `json:"location,omitempty"` // Legacy?
	Phone     *string         `json:"phone,omitempty"`
	Bio       *string         `json:"bio,omitempty"`
	Interests *pq.StringArray `json:"interests,omitempty"` // Replaces entire list

	// New fields for geolocation update
	Coordinates               *CoordinatesPayload `json:"coordinates,omitempty"`                  // User's location coordinates (lat/lon)
	MaxRecommendationRadiusKm *float64            `json:"max_recommendation_radius_km,omitempty"` // Preferred max distance in KM
}

// --- Pet Model --- //

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

	// Transient fields populated by service/repository
	Photos    []Photo `gorm:"-" json:"photos,omitempty"`    // Full photo objects
	AvatarURL *string `gorm:"-" json:"avatarUrl,omitempty"` // Primary photo URL
}

// PetUpdatePayload defines the structure for updating a pet.
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

// --- Photo Model --- //

// Photo represents an uploaded image belonging to a User or a Pet.
type Photo struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OwnerType string    `gorm:"size:10;index;not null" json:"-"` // "user" or "pet"
	OwnerID   uuid.UUID `gorm:"type:uuid;index;not null" json:"-"`
	URL       string    `gorm:"type:varchar(1024);not null" json:"url"`
	IsPrimary bool      `gorm:"default:false;index" json:"isPrimary"` // Is this the profile/avatar pic?
	Order     int       `gorm:"default:0" json:"order"`               // For ordering display
	Caption   string    `gorm:"size:255" json:"caption,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// --- Connection Model --- //

// ConnectionStatus defines the possible states of a connection request.
type ConnectionStatus string

const (
	StatusPending  ConnectionStatus = "pending"
	StatusAccepted ConnectionStatus = "accepted"
	StatusDeclined ConnectionStatus = "declined"
	StatusBlocked  ConnectionStatus = "blocked" // Represents blocking or removed connection
)

// Connection represents a relationship status between two users.
type Connection struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RequesterID uuid.UUID `gorm:"type:uuid;index;not null" json:"requesterId"`   // User who sent the request
	ReceiverID  uuid.UUID `gorm:"type:uuid;index;not null" json:"receiverId"`    // User who received the request
	Status      string    `gorm:"size:20;default:'pending';index" json:"status"` // e.g., "pending", "accepted", "blocked"
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// --- Conversation & Message Models --- //

type Conversation struct {
	BaseUUIDModel           // Embed base model with UUID PK
	User1ID       uuid.UUID `gorm:"type:uuid;index;not null"`
	User2ID       uuid.UUID `gorm:"type:uuid;index;not null"`

	User1    User      `gorm:"foreignKey:User1ID"`
	User2    User      `gorm:"foreignKey:User2ID"`
	Messages []Message `gorm:"foreignKey:ConversationID"`
}

type Message struct {
	BaseUUIDModel            // Embed base model with UUID PK
	ConversationID uuid.UUID `gorm:"type:uuid;index;not null"`
	SenderID       uuid.UUID `gorm:"type:uuid;index;not null"`
	Content        string    `gorm:"type:text;not null"`
	Read           bool      `gorm:"default:false"`

	Conversation Conversation `gorm:"foreignKey:ConversationID"`
	Sender       User         `gorm:"foreignKey:SenderID"`
}

// --- Recommendation Models --- //

// RecommendedPetInfo holds data returned from the repository query,
// including the pet and its distance from the requesting user's location.
type RecommendedPetInfo struct {
	Pet                    // Embed the Pet model (Restored)
	DistanceMeters float64 `gorm:"column:distance_meters"` // Distance calculated by the database
}

// PetRecommendation is the DTO (Data Transfer Object) returned by the API.
// It includes details about the recommended pet and its owner.
type PetRecommendation struct {
	// --- Pet Details ---
	ID                 uuid.UUID `json:"id"`
	Name               string    `json:"name"`
	Type               string    `json:"type"`
	Breed              *string   `json:"breed,omitempty"`
	Age                *float64  `json:"age,omitempty"` // Calculated in service
	Gender             *string   `json:"gender,omitempty"`
	Weight             *float64  `json:"weight,omitempty"`
	Bio                *string   `json:"bio,omitempty"`
	Personality        []string  `json:"personality,omitempty"`
	FavoriteActivities []string  `json:"favorite_activities,omitempty"`
	PlayStyle          []string  `json:"play_style,omitempty"`
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
