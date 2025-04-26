package middleware

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/HaoZhangSid/match-me-api/config" // Import service to access jwtCustomClaims if needed elsewhere, or just jwt library
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Use a custom type for context keys to avoid collisions
type contextKey string

const (
	AuthorizationHeaderKey  = "Authorization"
	AuthorizationTypeBearer = "bearer"
	AuthorizationPayloadKey = "authorization_payload"
	UserIDKey               = "userID" // Use custom type for context key
)

// AuthMiddleware creates a Gin middleware for JWT authentication.
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authorizationHeader := c.GetHeader(AuthorizationHeaderKey)

		if len(authorizationHeader) == 0 {
			err := errors.New("authorization header is not provided")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		fields := strings.Fields(authorizationHeader)
		if len(fields) < 2 {
			err := errors.New("invalid authorization header format")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		authorizationType := strings.ToLower(fields[0])
		if authorizationType != AuthorizationTypeBearer {
			err := fmt.Errorf("unsupported authorization type %s", authorizationType)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		accessToken := fields[1]
		// Define claims struct locally or use the one from service if appropriate
		claims := &struct { // Using anonymous struct based on service/jwtCustomClaims
			UserID uuid.UUID `json:"user_id"`
			jwt.RegisteredClaims
		}{}

		// Parse and validate the token
		token, err := jwt.ParseWithClaims(accessToken, claims, func(token *jwt.Token) (interface{}, error) {
			// Make sure the signing method is what we expect (HS256)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			// Return the secret key for validation
			return []byte(cfg.JWT.Secret), nil
		})

		if err != nil {
			// Handle different JWT errors (expired, invalid signature, etc.)
			var errMsg string
			if errors.Is(err, jwt.ErrTokenExpired) {
				errMsg = "token has expired"
			} else if errors.Is(err, jwt.ErrTokenNotValidYet) {
				errMsg = "token not active yet"
			} else if errors.Is(err, jwt.ErrSignatureInvalid) {
				errMsg = "invalid token signature"
			} else {
				errMsg = "invalid token: " + err.Error()
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": errMsg})
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// Token is valid, extract user ID from claims
		userID := claims.UserID
		if userID == uuid.Nil {
			log.Println("[AuthMiddleware] Error: Invalid user ID (Nil UUID) in token claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID in token"})
			return
		}
		log.Printf("[AuthMiddleware] Token valid for user ID: %s", userID.String())

		// Set the user ID in the context for downstream handlers
		ctx := context.WithValue(c.Request.Context(), UserIDKey, userID)
		// Update the context in the Gin request object
		c.Request = c.Request.WithContext(ctx)
		log.Printf("[AuthMiddleware] Set standard context key '%v' with value: %s", UserIDKey, userID.String())

		// Also setting the raw claims might be useful sometimes
		c.Set(AuthorizationPayloadKey, claims)

		// Proceed to the next handler with the modified context
		c.Next()
	}
}
