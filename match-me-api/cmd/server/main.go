package main

import (
	"fmt"
	"log"
	"time"

	"github.com/HaoZhangSid/match-me-api/config"
	"github.com/HaoZhangSid/match-me-api/internal/database"
	"github.com/HaoZhangSid/match-me-api/internal/filestorage"
	"github.com/HaoZhangSid/match-me-api/internal/handlers"
	"github.com/HaoZhangSid/match-me-api/internal/middleware"
	"github.com/HaoZhangSid/match-me-api/internal/repository"
	"github.com/HaoZhangSid/match-me-api/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables or defaults")
	}

	cfg := config.LoadConfig()

	// Initialize Database Connection by calling Connect from database package
	err = database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	// Use the exported DB variable from the database package
	db := database.DB
	log.Println("Database connection established and models migrated (by database.Connect).")

	// Initialize File Storage
	storagePath := cfg.FileStorage.BasePath
	baseURL := "/uploads"
	fileStore, err := filestorage.NewLocalStorage(storagePath, baseURL)
	if err != nil {
		log.Fatalf("Failed to initialize file storage: %v", err)
	}
	log.Printf("File storage initialized at path: %s, accessible via base URL: %s", storagePath, baseURL)

	// Initialize Repositories (pass the db instance)
	userRepo := repository.NewPostgresUserRepository(db)
	petRepo := repository.NewPostgresPetRepository(db)
	photoRepo := repository.NewPostgresPhotoRepository(db)
	connRepo := repository.NewPostgresConnectionRepository(db)

	// Initialize Services
	authService := service.NewAuthService(userRepo, cfg)
	photoService := service.NewPhotoService(photoRepo, userRepo, petRepo, fileStore)
	userService := service.NewUserService(userRepo, photoRepo)
	petService := service.NewPetService(petRepo, photoRepo, userRepo)
	connService := service.NewConnectionService(connRepo, userRepo)
	recService := service.NewRecommendationService(userRepo, connRepo, photoRepo)

	// Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	petHandler := handlers.NewPetHandler(petService)
	photoHandler := handlers.NewPhotoHandler(photoService)
	connHandler := handlers.NewConnectionHandler(connService)
	recHandler := handlers.NewRecommendationHandler(recService)

	// Initialize Gin router
	router := gin.Default()

	// CORS Middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Adjust for your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Static File Serving for Uploads
	router.Static(baseURL, storagePath)
	log.Printf("Serving static files from %s at %s", storagePath, baseURL)

	// Public Routes
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}

	// Protected Routes
	apiV1 := router.Group("/api/v1")
	apiV1.Use(middleware.AuthMiddleware(cfg))
	{
		// User Routes
		apiV1.GET("/me", userHandler.GetCurrentUser)
		apiV1.PATCH("/me", userHandler.UpdateCurrentUser)
		// User Photo Route (relative to /me)
		apiV1.POST("/me/photos", photoHandler.UploadUserPhotos)

		// Pet Routes (now under /me/pets)
		mePetsRoutes := apiV1.Group("/me/pets")
		{
			mePetsRoutes.POST("", petHandler.CreatePet)          // POST /api/v1/me/pets
			mePetsRoutes.GET("", petHandler.GetUserPets)         // GET /api/v1/me/pets
			mePetsRoutes.GET("/:petId", petHandler.GetPetByID)   // GET /api/v1/me/pets/:petId
			mePetsRoutes.PUT("/:petId", petHandler.UpdatePet)    // PUT /api/v1/me/pets/:petId
			mePetsRoutes.DELETE("/:petId", petHandler.DeletePet) // DELETE /api/v1/me/pets/:petId
			// Pet Photo Route (relative to specific pet)
			mePetsRoutes.POST("/:petId/photos", photoHandler.UploadPetPhotos) // POST /api/v1/me/pets/:petId/photos
		}

		// --- Pet Recommendation Route ---
		// Note: Placed directly under /api/v1 for now, could be nested under /me/pets/:petId too
		apiV1.GET("/pets/:petId/recommendations", petHandler.GetPetRecommendations)

		// Generic Photo Routes (remain top-level under /api/v1)
		apiV1.DELETE("/photos/:photoId", photoHandler.DeletePhoto)
		apiV1.PATCH("/photos/:photoId/primary", photoHandler.SetPrimaryPhoto)
		// TODO: Add routes for PATCH /photos/:photoId (caption) and PUT /owner/:type/:id/photos/order

		// Connection Routes
		apiV1.POST("/connections", connHandler.SendRequest)
		apiV1.GET("/connections", connHandler.ListConnections)
		apiV1.GET("/connections/requests", connHandler.ListIncomingRequests)
		apiV1.PUT("/connections/requests/:id", connHandler.RespondToRequest)
		apiV1.DELETE("/connections/:id", connHandler.RemoveConnection)

		// Recommendation Routes
		apiV1.GET("/recommendations", recHandler.GetRecommendations)

		// TODO: Add Chat routes
	}

	// Start the server
	serverAddr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on %s", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
