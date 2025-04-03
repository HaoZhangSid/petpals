package handlers

import (
	"net/http"

	"github.com/HaoZhangSid/match-me-api/internal/database"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/gin-gonic/gin"
)

// GetUsers 获取所有用户
func GetUsers(c *gin.Context) {
	var users []models.User

	result := database.DB.Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetUser 根据ID获取用户
func GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	result := database.DB.Preload("Pets").First(&user, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// CreateUser 创建新用户
func CreateUser(c *gin.Context) {
	var newUser models.User

	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.DB.Create(&newUser)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// 不返回密码
	newUser.Password = ""

	c.JSON(http.StatusCreated, newUser)
}

// UpdateUser 更新用户信息
func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 只更新请求中包含的字段
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&user)

	// 不返回密码
	user.Password = ""

	c.JSON(http.StatusOK, user)
}

// DeleteUser 删除用户
func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	database.DB.Delete(&user)

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
