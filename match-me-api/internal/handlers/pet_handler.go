package handlers

import (
	"net/http"
	"strconv"

	"errors"

	"log"

	"strings"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// --- Helper functions for form value conversion ---

// stringToPtr converts a non-empty string to *string, returns nil otherwise.
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// stringToFloat64Ptr converts a non-empty string to *float64, returns nil on error or empty.
func stringToFloat64Ptr(s string) *float64 {
	if s == "" {
		return nil
	}
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return nil // Or handle error differently
	}
	return &f
}

// stringToBoolPtr converts a non-empty string ("true"/"false") to *bool, returns nil otherwise.
func stringToBoolPtr(s string) *bool {
	if s == "" {
		return nil
	}
	// Handle common boolean representations, default to false if not "true"
	b := (s == "true")
	return &b
}

// TODO: Add helper for string array conversion if needed for Personality etc.

// PetHandler holds the pet service dependency
type PetHandler struct {
	petService service.PetService
}

// NewPetHandler creates a new PetHandler
func NewPetHandler(petService service.PetService) *PetHandler {
	return &PetHandler{
		petService: petService,
	}
}

// @Summary Create a new pet profile
// @Description Adds a new pet profile for the logged-in user.
// @Tags Pets
// @Accept  json
// @Produce  json
// @Param Authorization header string true "Bearer Token"
// @Param pet body models.PetCreateRequest true "Pet object that needs to be added"
// @Success 201 {object} models.Pet
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 401 {object} map[string]string "Unauthorized - User ID not found or token invalid"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /api/v1/me/pets [post]
func (h *PetHandler) CreatePet(c *gin.Context) {
	var pet models.Pet
	if err := c.ShouldBindJSON(&pet); err != nil {
		log.Printf("Error binding JSON for creating pet: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format", "details": err.Error()})
		return
	}

	// Input validation - REMOVED pet.Validate() call as it doesn't exist
	// Validation should be handled in the service layer or by checking specific fields if needed here.
	/*
		if err := pet.Validate(); err != nil {
			log.Printf("Validation error for creating pet: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
			return
		}
	*/

	// User ID is automatically retrieved from the context in the service layer
	// No need to extract or set it here anymore.

	// Call the service layer, passing the request context which contains the userID
	createdPet, err := h.petService.AddPet(c.Request.Context(), &pet) // Pass request context
	if err != nil {
		log.Printf("Error calling pet service AddPet: %v", err)
		// Check for specific error types if needed, e.g., context error vs. db error
		if strings.Contains(err.Error(), "failed to get user ID") { // Check if it's the context error from service
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID missing from context"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pet", "details": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, createdPet)
}

// GetUserPets handles the request to list pets for the logged-in user
func (h *PetHandler) GetUserPets(c *gin.Context) {
	pets, err := h.petService.ListUserPets(c.Request.Context())
	if err != nil {
		log.Printf("Error listing user pets: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve pets"})
		return
	}
	c.JSON(http.StatusOK, pets) // Pets now include photo URLs populated by service
}

// GetPetByID handles the request to get a single pet by ID
func (h *PetHandler) GetPetByID(c *gin.Context) {
	petIDStr := c.Param("petId")
	petID, err := uuid.Parse(petIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pet ID format"})
		return
	}

	pet, err := h.petService.GetPetByID(c.Request.Context(), petID)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			log.Printf("Error getting pet by ID %s: %v", petID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve pet details"})
		}
		return
	}

	c.JSON(http.StatusOK, pet) // Pet includes photo URLs populated by service
}

// UpdatePet handles the request to update a specific pet (non-photo fields)
func (h *PetHandler) UpdatePet(c *gin.Context) {
	petIDStr := c.Param("petId")
	petID, err := uuid.Parse(petIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pet ID format"})
		return
	}

	var payload models.PetUpdatePayload // Expecting JSON payload for updates

	// Bind JSON data from the request body
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Call the service layer
	updatedPet, err := h.petService.UpdatePetInfo(c.Request.Context(), petID, &payload)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrValidation) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrUnauthorized) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this pet"})
		} else {
			log.Printf("Error updating pet %s: %v", petID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pet profile"})
		}
		return
	}

	c.JSON(http.StatusOK, updatedPet)
}

// DeletePet handles the request to delete a specific pet
func (h *PetHandler) DeletePet(c *gin.Context) {
	petIDStr := c.Param("petId")
	petID, err := uuid.Parse(petIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pet ID format"})
		return
	}

	err = h.petService.DeletePet(c.Request.Context(), petID)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrUnauthorized) {
			c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this pet"})
		} else {
			log.Printf("Error deleting pet %s: %v", petID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pet"})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// TODO: Add handler for GetPet
