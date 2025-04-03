package main

import (
	"log"
	"os"

	"github.com/HaoZhangSid/match-me-api/internal/database"
	"github.com/HaoZhangSid/match-me-api/internal/handlers"
	"github.com/HaoZhangSid/match-me-api/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found")
	}

	// 连接数据库
	if err := database.Connect(); err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	// 设置Gin模式
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 初始化路由
	r := gin.Default()

	// 使用中间件
	r.Use(middleware.CORS())

	// 设置路由
	setupRoutes(r)

	// 获取服务器端口
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 启动服务器
	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Could not start server: %v", err)
	}
}

func setupRoutes(r *gin.Engine) {
	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "OK",
		})
	})

	// API路由组
	api := r.Group("/api")

	// 用户相关路由
	userRoutes := api.Group("/users")
	{
		userRoutes.GET("", handlers.GetUsers)
		userRoutes.GET("/:id", handlers.GetUser)
		userRoutes.POST("", handlers.CreateUser)
		userRoutes.PUT("/:id", handlers.UpdateUser)
		userRoutes.DELETE("/:id", handlers.DeleteUser)

		// 获取用户的宠物
		userRoutes.GET("/:id/pets", handlers.GetUserPets)
	}

	// 宠物相关路由
	petRoutes := api.Group("/pets")
	{
		petRoutes.GET("", handlers.GetPets)
		petRoutes.GET("/:id", handlers.GetPetByID)
		petRoutes.POST("", handlers.CreatePet)
		petRoutes.PUT("/:id", handlers.UpdatePet)
		petRoutes.DELETE("/:id", handlers.DeletePet)
	}

	// TODO: 添加验证、用户认证和其他功能路由
}
