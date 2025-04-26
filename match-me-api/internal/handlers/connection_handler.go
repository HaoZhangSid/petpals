package handlers

import (
	"errors"
	"log"
	"net/http"

	"github.com/HaoZhangSid/match-me-api/internal/middleware"
	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ConnectionHandler handles connection-related HTTP requests.
type ConnectionHandler struct {
	connService service.ConnectionService
}

// NewConnectionHandler creates a new ConnectionHandler.
func NewConnectionHandler(connService service.ConnectionService) *ConnectionHandler {
	return &ConnectionHandler{connService: connService}
}

// Helper to get current user ID from context
func getCurrentUserID(c *gin.Context) (uuid.UUID, error) {
	userIDAny := c.Request.Context().Value(middleware.UserIDKey)
	if userIDAny == nil {
		return uuid.Nil, errors.New("user ID not found in context")
	}
	userID, ok := userIDAny.(uuid.UUID)
	if !ok {
		return uuid.Nil, errors.New("invalid User ID type in context")
	}
	return userID, nil
}

// SendRequestHandler handles POST /connections
func (h *ConnectionHandler) SendRequest(c *gin.Context) {
	requesterID, err := getCurrentUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var reqBody struct {
		TargetUserID string `json:"targetUserId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	receiverID, err := uuid.Parse(reqBody.TargetUserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid targetUserId format"})
		return
	}

	connection, err := h.connService.SendRequest(c.Request.Context(), requesterID, receiverID)
	if err != nil {
		if errors.Is(err, service.ErrValidation) || errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrUnauthorized) { // e.g., blocked
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		} else {
			log.Printf("Error sending connection request from %s to %s: %v", requesterID, receiverID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send connection request"})
		}
		return
	}

	c.JSON(http.StatusCreated, connection)
}

// RespondToRequestHandler handles PUT /connections/requests/{id}
func (h *ConnectionHandler) RespondToRequest(c *gin.Context) {
	currentUserID, err := getCurrentUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	connectionIDStr := c.Param("id") // Assuming path is /connections/requests/:id
	connectionID, err := uuid.Parse(connectionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid connection request ID format"})
		return
	}

	var reqBody struct {
		Action string `json:"action" binding:"required,oneof=accept reject"`
	}
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: 'action' must be 'accept' or 'reject'"})
		return
	}

	if reqBody.Action == "accept" {
		connection, err := h.connService.AcceptRequest(c.Request.Context(), connectionID, currentUserID)
		if err != nil {
			if errors.Is(err, service.ErrNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			} else if errors.Is(err, service.ErrUnauthorized) {
				c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			} else if errors.Is(err, service.ErrValidation) {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			} else {
				log.Printf("Error accepting connection request %s by %s: %v", connectionID, currentUserID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept connection request"})
			}
			return
		}
		c.JSON(http.StatusOK, connection)
	} else if reqBody.Action == "reject" {
		err := h.connService.RejectRequest(c.Request.Context(), connectionID, currentUserID)
		if err != nil {
			if errors.Is(err, service.ErrNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			} else if errors.Is(err, service.ErrUnauthorized) {
				c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			} else if errors.Is(err, service.ErrValidation) {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			} else {
				log.Printf("Error rejecting connection request %s by %s: %v", connectionID, currentUserID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject connection request"})
			}
			return
		}
		c.Status(http.StatusNoContent)
	}
}

// ListIncomingRequestsHandler handles GET /connections/requests
func (h *ConnectionHandler) ListIncomingRequests(c *gin.Context) {
	currentUserID, err := getCurrentUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	requests, err := h.connService.ListIncomingRequests(c.Request.Context(), currentUserID)
	if err != nil {
		log.Printf("Error listing incoming requests for %s: %v", currentUserID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve incoming requests"})
		return
	}

	c.JSON(http.StatusOK, requests)
}

// ListConnectionsHandler handles GET /connections
func (h *ConnectionHandler) ListConnections(c *gin.Context) {
	currentUserID, err := getCurrentUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	connections, err := h.connService.ListAcceptedConnections(c.Request.Context(), currentUserID)
	if err != nil {
		log.Printf("Error listing connections for %s: %v", currentUserID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve connections"})
		return
	}

	c.JSON(http.StatusOK, connections)
}

// RemoveConnectionHandler handles DELETE /connections/{id}
func (h *ConnectionHandler) RemoveConnection(c *gin.Context) {
	currentUserID, err := getCurrentUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	connectionIDStr := c.Param("id")
	connectionID, err := uuid.Parse(connectionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid connection ID format"})
		return
	}

	err = h.connService.RemoveConnection(c.Request.Context(), connectionID, currentUserID)
	if err != nil {
		if errors.Is(err, service.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if errors.Is(err, service.ErrUnauthorized) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized to remove this connection"})
		} else {
			log.Printf("Error removing connection %s by %s: %v", connectionID, currentUserID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove connection"})
		}
		return
	}

	c.Status(http.StatusNoContent)
}
