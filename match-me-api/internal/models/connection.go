package models

import (
	"time"

	"github.com/google/uuid"
)

// ConnectionStatus defines the possible states of a connection request.
type ConnectionStatus string

const (
	StatusPending  ConnectionStatus = "pending"
	StatusAccepted ConnectionStatus = "accepted"
	StatusDeclined ConnectionStatus = "declined"
	StatusBlocked  ConnectionStatus = "blocked" // Could represent blocking or removed connection
)

// Connection represents a relationship status between two users.
type Connection struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RequesterID uuid.UUID `gorm:"type:uuid;index;not null" json:"requesterId"`   // User who sent the request
	ReceiverID  uuid.UUID `gorm:"type:uuid;index;not null" json:"receiverId"`    // User who received the request
	Status      string    `gorm:"size:20;default:'pending';index" json:"status"` // e.g., "pending", "accepted", "blocked"
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	// Optional relationships for preloading if needed
	// Requester User `gorm:"foreignKey:RequesterID"`
	// Receiver  User `gorm:"foreignKey:ReceiverID"`
}
