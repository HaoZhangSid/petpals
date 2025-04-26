package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/HaoZhangSid/match-me-api/internal/middleware"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// PhotoHandler handles photo-related HTTP requests.
type PhotoHandler struct {
	photoService service.PhotoService
	// No FileStorage needed here, Service handles it.
}

// NewPhotoHandler creates a new PhotoHandler.
func NewPhotoHandler(photoService service.PhotoService) *PhotoHandler {
	return &PhotoHandler{photoService: photoService}
}

// Shared logic for uploading photos for either user or pet
func (h *PhotoHandler) handleUpload(c *gin.Context, ownerType string) {
	// 1. Get Owner ID
	var ownerID uuid.UUID
	var err error
	if ownerType == "user" {
		userIDAny := c.Request.Context().Value(middleware.UserIDKey)
		if userIDAny == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}
		currentUserID, ok := userIDAny.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid User ID type in context"})
			return
		}
		ownerID = currentUserID
	} else if ownerType == "pet" {
		ownerIDStr := c.Param("petId")
		ownerID, err = uuid.Parse(ownerIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pet ID format"})
			return
		}
		// Note: Authorization (checking if user owns the pet) happens in the Service layer
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid owner type for photo upload"})
		return
	}

	// 2. Get current user ID for authorization check in service layer
	// userIDAny := c.Request.Context().Value(middleware.UserIDKey)
	// if userIDAny == nil { ... } // Redundant check if ownerType is user
	// currentUserID, _ := userIDAny.(uuid.UUID) // Assignment removed as currentUserID is not used directly here for pets

	// 3. Parse Multipart Form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB limit
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form: " + err.Error()})
		return
	}

	// 4. Handle File Upload(s)
	form := c.Request.MultipartForm
	files := form.File["photos"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No photos provided in 'photos' field"})
		return
	}

	caption := c.PostForm("caption")
	isPrimaryStr := c.PostForm("isPrimary")
	isPrimary := isPrimaryStr == "true"

	var uploadedPhotos []*models.Photo
	var firstError error

	for i, fileHeader := range files {
		makePrimary := isPrimary && i == 0
		// Call service (service layer performs authorization using context user ID)
		photo, err := h.photoService.UploadPhoto(c.Request.Context(), ownerType, ownerID, fileHeader, makePrimary, caption)
		if err != nil {
			log.Printf("Error uploading photo %s for %s %s: %v", fileHeader.Filename, ownerType, ownerID, err)
			if firstError == nil {
				firstError = fmt.Errorf("failed to upload %s: %w", fileHeader.Filename, err)
			}
			break
		}
		uploadedPhotos = append(uploadedPhotos, photo)
	}

	if firstError != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload one or more photos", "detail": firstError.Error()})
		return
	}

	c.JSON(http.StatusCreated, uploadedPhotos)
}

// UploadUserPhotos handles POST /me/photos (or similar)
func (h *PhotoHandler) UploadUserPhotos(c *gin.Context) {
	h.handleUpload(c, "user")
}

// UploadPetPhotos handles POST /pets/{petId}/photos
func (h *PhotoHandler) UploadPetPhotos(c *gin.Context) {
	h.handleUpload(c, "pet")
}

// DeletePhoto handles DELETE /photos/{photoId}
func (h *PhotoHandler) DeletePhoto(c *gin.Context) {
	photoIDStr := c.Param("photoId")
	photoID, err := uuid.Parse(photoIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID format"})
		return
	}

	// Get current user ID for authorization
	userIDAny := c.Request.Context().Value(middleware.UserIDKey)
	if userIDAny == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}
	currentUserID, ok := userIDAny.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid User ID type in context"})
		return
	}

	err = h.photoService.DeletePhoto(c.Request.Context(), photoID, currentUserID)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrUnauthorized) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to delete this photo"})
		} else {
			log.Printf("Error deleting photo %s: %v", photoID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete photo"})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// SetPrimaryPhoto handles PATCH /photos/{photoId}/primary
func (h *PhotoHandler) SetPrimaryPhoto(c *gin.Context) {
	photoIDStr := c.Param("photoId")
	photoID, err := uuid.Parse(photoIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID format"})
		return
	}

	// Get current user ID for authorization
	userIDAny := c.Request.Context().Value(middleware.UserIDKey)
	if userIDAny == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}
	currentUserID, ok := userIDAny.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid User ID type in context"})
		return
	}

	err = h.photoService.SetPrimaryPhoto(c.Request.Context(), photoID, currentUserID)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrUnauthorized) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to modify this photo"})
		} else {
			log.Printf("Error setting primary photo %s: %v", photoID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set primary photo"})
		}
		return
	}

	c.Status(http.StatusOK)
}

// TODO: Implement handlers for UpdatePhotoCaption and ReorderPhotos
