package handlers

import (
	"net/http"
	"strconv"
	"time"

	"errors"

	"log"

	"strings"

	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
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

// CreatePet handles the request to add a new pet (non-photo fields)
func (h *PetHandler) CreatePet(c *gin.Context) {
	// Note: No need for ParseMultipartForm if no files are uploaded here
	var pet models.Pet
	pet.Name = c.PostForm("name")
	pet.Type = c.PostForm("type")
	pet.Breed = stringToPtr(c.PostForm("breed"))
	// Removed Age
	pet.Weight = stringToFloat64Ptr(c.PostForm("weight"))
	pet.Gender = stringToPtr(c.PostForm("gender"))
	pet.ActivityLevel = stringToPtr(c.PostForm("activityLevel"))
	pet.IsNeutered = stringToBoolPtr(c.PostForm("isNeutered"))
	pet.IsMicrochipped = stringToBoolPtr(c.PostForm("isMicrochipped"))
	pet.IsVaccinated = stringToBoolPtr(c.PostForm("isVaccinated"))
	pet.Bio = stringToPtr(c.PostForm("bio"))

	// Birthday parsing
	if birthdayStr := c.PostForm("birthday"); birthdayStr != "" {
		layout := "2006-01-02"
		parsedTime, err := time.Parse(layout, birthdayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthday format. Use YYYY-MM-DD."})
			return
		}
		pet.Birthday = &parsedTime
	}

	// Array Fields
	if personalityStr := c.PostForm("personality"); personalityStr != "" {
		pet.Personality = pq.StringArray(strings.Split(personalityStr, ","))
	}
	if activitiesStr := c.PostForm("favoriteActivities"); activitiesStr != "" {
		pet.FavoriteActivities = pq.StringArray(strings.Split(activitiesStr, ","))
	}
	if playStyleStr := c.PostForm("playStyle"); playStyleStr != "" {
		pet.PlayStyle = pq.StringArray(strings.Split(playStyleStr, ","))
	}

	// Removed Avatar and Photos handling

	createdPet, err := h.petService.AddPet(c.Request.Context(), &pet)
	if err != nil {
		if errors.Is(err, service.ErrValidation) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			log.Printf("Error creating pet: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pet profile"})
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

	// No need for ParseMultipartForm
	var payload models.PetUpdatePayload

	// Bind simple fields
	if name := c.PostForm("name"); name != "" {
		payload.Name = &name
	}
	if petType := c.PostForm("type"); petType != "" {
		payload.Type = &petType
	}
	if breed := c.PostForm("breed"); breed != "" {
		payload.Breed = stringToPtr(breed)
	}
	// Removed Age
	if weight := c.PostForm("weight"); weight != "" {
		payload.Weight = stringToFloat64Ptr(weight)
	}
	if gender := c.PostForm("gender"); gender != "" {
		payload.Gender = stringToPtr(gender)
	}
	if energyLevel := c.PostForm("activityLevel"); energyLevel != "" {
		payload.ActivityLevel = stringToPtr(energyLevel)
	}
	if isNeutered := c.PostForm("isNeutered"); isNeutered != "" {
		payload.IsNeutered = stringToBoolPtr(isNeutered)
	}
	if isMicrochipped := c.PostForm("isMicrochipped"); isMicrochipped != "" {
		payload.IsMicrochipped = stringToBoolPtr(isMicrochipped)
	}
	if isVaccinated := c.PostForm("isVaccinated"); isVaccinated != "" {
		payload.IsVaccinated = stringToBoolPtr(isVaccinated)
	}
	if bio := c.PostForm("bio"); bio != "" {
		payload.Bio = stringToPtr(bio)
	}

	// Birthday parsing
	if birthdayStr := c.PostForm("birthday"); birthdayStr != "" {
		layout := "2006-01-02"
		parsedTime, err := time.Parse(layout, birthdayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthday format. Use YYYY-MM-DD."})
			return
		}
		payload.Birthday = &parsedTime
	} else if _, exists := c.Request.PostForm["birthday"]; exists {
		// Allow clearing birthday by sending empty string
		var nilTime *time.Time
		payload.Birthday = nilTime
	}

	// Array Fields (Handle clearing if empty string provided)
	if personalityStr := c.PostForm("personality"); personalityStr != "" {
		arr := pq.StringArray(strings.Split(personalityStr, ","))
		payload.Personality = &arr
	} else if _, exists := c.Request.PostForm["personality"]; exists {
		arr := pq.StringArray{}
		payload.Personality = &arr
	}

	if activitiesStr := c.PostForm("favoriteActivities"); activitiesStr != "" {
		arr := pq.StringArray(strings.Split(activitiesStr, ","))
		payload.FavoriteActivities = &arr
	} else if _, exists := c.Request.PostForm["favoriteActivities"]; exists {
		arr := pq.StringArray{}
		payload.FavoriteActivities = &arr
	}

	if playStyleStr := c.PostForm("playStyle"); playStyleStr != "" {
		arr := pq.StringArray(strings.Split(playStyleStr, ","))
		payload.PlayStyle = &arr
	} else if _, exists := c.Request.PostForm["playStyle"]; exists {
		arr := pq.StringArray{}
		payload.PlayStyle = &arr
	}

	// Removed Avatar and Photos handling

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

	c.JSON(http.StatusOK, updatedPet) // Includes populated photo URLs
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
