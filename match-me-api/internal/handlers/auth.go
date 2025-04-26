package handlers

import (
	"net/http"

	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	// "golang.org/x/crypto/bcrypt" // No longer needed here, moved to service
	// "time" // No longer needed here
)

// LoginRequest 登录请求结构
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest 注册请求结构
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// AuthResponse 认证响应结构
type AuthResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

// AuthHandler holds the authentication service dependency
type AuthHandler struct {
	authService service.AuthService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login handles user login requests by calling the AuthService
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Call the service layer to handle login logic
	user, token, err := h.authService.LoginUser(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		// Use a generic error message for invalid credentials
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Return the token and user information (service already removed password)
	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  user,
	})
}

// Register handles user registration requests by calling the AuthService
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Call the service layer to handle registration logic
	user, token, err := h.authService.RegisterUser(c.Request.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		// Handle specific errors from the service if needed, otherwise return a generic error
		// Example: Check if the error indicates email already exists
		if err.Error() == "email already registered" { // Simple string comparison, can be improved
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user: " + err.Error()}) // Or a more generic message
		}
		return
	}

	// Return the token and newly created user information (service already removed password)
	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  user,
	})
}
