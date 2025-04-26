package models

import (
	"time" // Import time for UpdatedAt/CreatedAt if using gorm.Model replacement

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Using explicit fields instead of gorm.Model to use UUIDs
type BaseUUIDModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

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
