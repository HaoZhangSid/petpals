package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// User defines the user model in the application
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id" db:"id"` // Added gorm tags for UUID PK
	Name      string         `json:"name" db:"name"`                                                    // User's name
	Email     string         `json:"email" db:"email"`                                                  // User's email, should be unique
	Password  string         `json:"-" db:"password"`                                                   // User's hashed password, excluded from JSON
	CreatedAt time.Time      `json:"created_at" db:"created_at"`                                        // Timestamp of creation
	UpdatedAt time.Time      `json:"updated_at" db:"updated_at"`                                        // Timestamp of last update
	Avatar    string         `gorm:"size:512" json:"avatar,omitempty"`                                  // Added json tag
	Location  string         `gorm:"size:255" json:"location,omitempty"`                                // Added json tag
	Phone     string         `gorm:"size:50" json:"phone,omitempty"`                                    // Added json tag
	Bio       string         `gorm:"type:text" json:"bio,omitempty"`                                    // Added json tag
	Interests pq.StringArray `gorm:"type:varchar(100)[]" json:"interests,omitempty"`                    // Added json tag
	Photos    pq.StringArray `gorm:"type:text[]" json:"photos,omitempty"`                               // Changed type & Added json tag

	// Relationships
	// Note: `->;-:migration` means GORM won't handle this field for writing/migration
	// It's likely loaded separately or via preload.
	Pets []Pet `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"-"` // Added json tag
}
