package models

import (
	"time"

	"github.com/google/uuid"
)

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
	UpdatedAt time.Time `json:"updatedAt"` // GORM handles this automatically if field exists

	// Note: We don't define explicit GORM relationships back to User/Pet here
	// to keep the Photo model decoupled. Queries will filter by OwnerType and OwnerID.
}
