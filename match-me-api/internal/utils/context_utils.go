package utils

import (
	"context"
	"errors"
	"fmt"

	"github.com/HaoZhangSid/match-me-api/internal/middleware"
	"github.com/google/uuid"
)

// GetUserIDFromContext extracts the user ID (as uuid.UUID) from the given context.
// It relies on the UserIDKey defined in the middleware package being set correctly.
// Returns the user ID or an error if the ID is not found or is invalid.
func GetUserIDFromContext(ctx context.Context) (uuid.UUID, error) {
	userIDAny := ctx.Value(middleware.UserIDKey) // Use the key defined in middleware
	if userIDAny == nil {
		// It's generally an internal error if the middleware is applied but the key isn't set
		return uuid.Nil, errors.New("internal error: user ID not found in context after auth middleware")
	}

	userID, ok := userIDAny.(uuid.UUID)
	if !ok {
		// This indicates a programming error - the value set in the context was not a uuid.UUID
		return uuid.Nil, fmt.Errorf("internal error: user ID in context is not uuid.UUID (type: %T)", userIDAny)
	}

	if userID == uuid.Nil {
		// A Nil UUID might be set erroneously, treat it as invalid.
		return uuid.Nil, errors.New("internal error: invalid user ID (Nil UUID) found in context")
	}

	return userID, nil
}
