package service

import (
	"context"
	"errors" // Import errors package
	"log"    // Import log package
	"time"   // Import time package

	"github.com/HaoZhangSid/match-me-api/config"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/golang-jwt/jwt/v5" // Import JWT library
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt" // Import bcrypt
	// We will need JWT library later, e.g., github.com/golang-jwt/jwt/v5
)

// jwtCustomClaims defines the structure of the JWT claims
type jwtCustomClaims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

// AuthService defines the interface for authentication operations
type AuthService interface {
	RegisterUser(ctx context.Context, name, email, password string) (*models.User, string, error) // Returns user, token, error
	LoginUser(ctx context.Context, email, password string) (*models.User, string, error)          // Returns user, token, error
}

// authService implements the AuthService interface
type authService struct {
	userRepo repository.UserRepository
	cfg      *config.Config // To access JWT secret, etc.
}

// NewAuthService creates a new instance of AuthService
func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

// generateJWT generates a new JWT token for a given user ID
func (s *authService) generateJWT(userID uuid.UUID) (string, error) {
	// Set custom claims
	claims := &jwtCustomClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)), // Token expires in 72 hours
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "match-me-api", // Example issuer
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and return it as a string.
	// The secret key is obtained from the configuration.
	t, err := token.SignedString([]byte(s.cfg.JWT.Secret))
	if err != nil {
		return "", err
	}

	return t, nil
}

// RegisterUser handles the logic for user registration
func (s *authService) RegisterUser(ctx context.Context, name, email, password string) (*models.User, string, error) {
	// 1. Check if email already exists
	_, err := s.userRepo.GetUserByEmail(ctx, email)
	if err == nil {
		return nil, "", errors.New("email already registered")
	}
	log.Printf("Email check for %s passed (err: %v)", email, err) // Log email check result

	// 2. Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password for %s: %v", email, err)
		return nil, "", errors.New("failed to hash password")
	}

	// 3. Create the user model
	newUser := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
	}

	// 4. Save the user to the database
	err = s.userRepo.CreateUser(ctx, newUser)
	if err != nil {
		log.Printf("Error creating user %s in DB: %v", email, err)
		return nil, "", errors.New("failed to create user")
	}
	log.Printf("User %s created successfully in DB. Checking ID: %s", email, newUser.ID.String())

	// Check if ID was populated
	if newUser.ID == uuid.Nil {
		log.Printf("Error: User ID is NIL after creation for user %s", email)
		return nil, "", errors.New("failed to retrieve user ID after creation")
	}
	log.Printf("User ID %s is valid for user %s. Generating JWT...", newUser.ID.String(), email)

	// 5. Generate JWT token
	token, err := s.generateJWT(newUser.ID)
	if err != nil {
		log.Printf("Error generating JWT for user %s (ID: %s): %v", email, newUser.ID.String(), err)
		return nil, "", errors.New("failed to generate token after registration")
	}
	log.Printf("JWT generated successfully for user %s", email)

	// 6. Return the newly created user (without password) and token
	newUser.Password = ""
	return newUser, token, nil
}

// LoginUser handles the logic for user login
func (s *authService) LoginUser(ctx context.Context, email, password string) (*models.User, string, error) {
	// 1. Find user by email (using userRepo)
	user, err := s.userRepo.GetUserByEmail(ctx, email)
	if err != nil {
		// Handle case where user not found vs other DB errors
		// if errors.Is(err, gorm.ErrRecordNotFound) { ... }
		return nil, "", errors.New("invalid credentials") // Generic error for security
	}

	// 2. Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		// Password doesn't match
		return nil, "", errors.New("invalid credentials")
	}

	// 3. Generate JWT token
	token, err := s.generateJWT(user.ID)
	if err != nil {
		// Log the error maybe, but return a generic message
		return nil, "", errors.New("failed to generate token during login")
	}

	// 4. Return the user (without password) and token
	user.Password = "" // Clear password before returning
	return user, token, nil
}
