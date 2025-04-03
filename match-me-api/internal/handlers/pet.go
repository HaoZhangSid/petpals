package handlers

import (
	"net/http"

	"github.com/HaoZhangSid/match-me-api/internal/database"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/gin-gonic/gin"
)

// GetPets 获取所有宠物
func GetPets(c *gin.Context) {
	var pets []models.Pet

	result := database.DB.Find(&pets)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve pets"})
		return
	}

	c.JSON(http.StatusOK, pets)
}

// GetPetByID 根据ID获取宠物
func GetPetByID(c *gin.Context) {
	id := c.Param("id")

	var pet models.Pet
	result := database.DB.First(&pet, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pet not found"})
		return
	}

	c.JSON(http.StatusOK, pet)
}

// CreatePet 创建新宠物
func CreatePet(c *gin.Context) {
	var newPet models.Pet

	if err := c.ShouldBindJSON(&newPet); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.DB.Create(&newPet)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pet"})
		return
	}

	c.JSON(http.StatusCreated, newPet)
}

// UpdatePet 更新宠物信息
func UpdatePet(c *gin.Context) {
	id := c.Param("id")

	var pet models.Pet
	if err := database.DB.First(&pet, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pet not found"})
		return
	}

	// 只更新请求中包含的字段
	if err := c.ShouldBindJSON(&pet); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&pet)

	c.JSON(http.StatusOK, pet)
}

// DeletePet 删除宠物
func DeletePet(c *gin.Context) {
	id := c.Param("id")

	var pet models.Pet
	if err := database.DB.First(&pet, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pet not found"})
		return
	}

	database.DB.Delete(&pet)

	c.JSON(http.StatusOK, gin.H{"message": "Pet deleted successfully"})
}

// GetUserPets 获取某用户的所有宠物
func GetUserPets(c *gin.Context) {
	userID := c.Param("id")

	var pets []models.Pet
	result := database.DB.Where("user_id = ?", userID).Find(&pets)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user's pets"})
		return
	}

	c.JSON(http.StatusOK, pets)
}
