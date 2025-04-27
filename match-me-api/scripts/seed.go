package main

import (
	"log"
	"time"

	"github.com/HaoZhangSid/match-me-api/config"
	"github.com/HaoZhangSid/match-me-api/internal/database"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/joho/godotenv"
	"github.com/lib/pq"          // For StringArray
	"golang.org/x/crypto/bcrypt" // For hashing passwords
	"gorm.io/gorm"

	"fmt"       // For generating unique emails/names
	"math"      // For Cos function used in coordinate calculation
	"math/rand" // Using this for randomization
)

const (
	numTotalUsers     = 50            // TOTAL number of users including the main one
	centerLat         = 60.9812677    // Main user Latitude
	centerLon         = 24.4727716    // Main user Longitude
	maxDistanceKm     = 100.0         // **MODIFIED**: Max distance for OTHER users (100km)
	minPrefRadiusKm   = 5.0           // Min user preference radius
	maxPrefRadiusKm   = 50.0          // Max user preference radius
	mainUserPassword  = "qwer1234"    // Password for main test user
	otherUserPassword = "password123" // Common password for other seeded users
	latDegPerKm       = 1.0 / 111.1   // Approximate degrees latitude per km
)

// Calculate lonDegPerKmAtLat as a package variable
var lonDegPerKmAtLat = 1.0 / (111.1 * math.Cos(centerLat*math.Pi/180.0))

func main() {
	log.Println("Starting database seeding...")

	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables or defaults")
	}

	// Load configuration
	_ = config.LoadConfig()

	// Connect to the database
	err = database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database for seeding: %v", err)
	}
	db := database.DB

	// Initialize random seed
	rand.Seed(time.Now().UnixNano())

	// Run the seeding logic
	err = seedData(db)
	if err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}

	log.Println("Database seeding completed successfully!")
}

// seedData contains the main logic for populating the database
func seedData(db *gorm.DB) error {
	log.Println("Seeding data...")

	// --- Clean existing data (optional, uncomment with caution!) ---
	// Consider using `make clean-data` instead if added to Makefile
	// log.Println("Cleaning existing data...")
	// ...
	// log.Println("Existing data cleaned.")

	users := make([]models.User, 0, numTotalUsers)

	// --- Create Main Test User ---
	log.Println("Creating main test user (admin@gmail.com)...")
	mainHashedPassword, _ := bcrypt.GenerateFromPassword([]byte(mainUserPassword), bcrypt.DefaultCost)
	mainCoordinatesWKT := fmt.Sprintf("SRID=4326;POINT(%f %f)", centerLon, centerLat)
	mainPrefRadius := 20.0 // Set default radius for main user

	mainUser := models.User{
		Name:                      "Admin User",
		Email:                     "admin@gmail.com",
		Password:                  string(mainHashedPassword),
		Phone:                     "555-ADMIN",
		Bio:                       "Main test account.",
		Interests:                 pq.StringArray{"Testing", "Admin", "Pets"},
		Coordinates:               stringToPtr(mainCoordinatesWKT),
		MaxRecommendationRadiusKm: float64ToPtr(mainPrefRadius),
	}
	if err := db.Create(&mainUser).Error; err != nil {
		log.Printf("Failed to create main user admin@gmail.com: %v", err)
		// Optionally stop if main user fails?
		return fmt.Errorf("failed to create main user: %w", err)
	}
	log.Printf("Created main user: %s (ID: %s)\n", mainUser.Email, mainUser.ID)
	users = append(users, mainUser)

	// Seed Avatar for Main User
	mainUserAvatar := models.Photo{
		OwnerType: "user",
		OwnerID:   mainUser.ID,
		URL:       fmt.Sprintf("/uploads/user/%s/ownerAvatar.png", mainUser.ID.String()),
		IsPrimary: true,
		Order:     0,
	}
	if err := db.Create(&mainUserAvatar).Error; err != nil {
		log.Printf("Failed to create avatar for main user %s: %v", mainUser.Email, err)
	}

	// --- Create Other Users ---
	numOtherUsers := numTotalUsers - 1
	log.Printf("Creating %d other users within %.1f km...\n", numOtherUsers, maxDistanceKm)
	otherHashedPassword, _ := bcrypt.GenerateFromPassword([]byte(otherUserPassword), bcrypt.DefaultCost)

	// Calculate max offsets in degrees for 100km
	maxLatOffset := maxDistanceKm * latDegPerKm
	maxLonOffset := maxDistanceKm * lonDegPerKmAtLat

	for i := 1; i <= numOtherUsers; i++ {
		// Generate random offsets
		latOffset := (rand.Float64()*2 - 1) * maxLatOffset
		lonOffset := (rand.Float64()*2 - 1) * maxLonOffset
		userLat := centerLat + latOffset
		userLon := centerLon + lonOffset
		coordinatesWKT := fmt.Sprintf("SRID=4326;POINT(%f %f)", userLon, userLat)
		prefRadius := minPrefRadiusKm + rand.Float64()*(maxPrefRadiusKm-minPrefRadiusKm)

		email := fmt.Sprintf("seed%d@example.com", i) // Start emails from seed1
		user := models.User{
			Name:                      fmt.Sprintf("Seed User %d", i),
			Email:                     email,
			Password:                  string(otherHashedPassword),
			Phone:                     fmt.Sprintf("123-555-%04d", i),
			Bio:                       fmt.Sprintf("This is the bio for seed user %d. Loves pets!", i),
			Interests:                 pq.StringArray([]string{fmt.Sprintf("Interest%d", i%3+1), "Pets", "Outdoors"}),
			Coordinates:               stringToPtr(coordinatesWKT),
			MaxRecommendationRadiusKm: float64ToPtr(prefRadius),
		}
		result := db.Create(&user)
		if result.Error != nil {
			log.Printf("Failed to create user %d (%s): %v", i, email, result.Error)
			continue // Skip this user if creation fails
		}
		users = append(users, user)

		// Seed Avatar for Other User
		userAvatar := models.Photo{
			OwnerType: "user",
			OwnerID:   user.ID,
			URL:       fmt.Sprintf("/uploads/user/%s/ownerAvatar.png", user.ID.String()), // Use same avatar for all seeds
			IsPrimary: true,
			Order:     0,
		}
		if err := db.Create(&userAvatar).Error; err != nil {
			log.Printf("Failed to create avatar for user %s: %v", user.Email, err)
		}
	}
	log.Printf("Created %d users in total.\n", len(users))

	// --- Seed Pets (One Dog and One Cat per User) ---
	log.Println("Creating 1 Dog and 1 Cat for each user, plus photos...")
	petCount := 0 // Used for variation in pet details
	dogBreeds := []string{"Labrador", "Poodle", "German Shepherd", "Golden Retriever", "Beagle"}
	catBreeds := []string{"Siamese", "Persian", "Maine Coon", "Sphynx", "Ragdoll"}
	personalities := []string{"Playful", "Calm", "Shy", "Energetic", "Curious", "Affectionate"}
	activities := []string{"Walks", "Fetch", "Cuddling", "Sleeping", "Exploring", "Training"}
	playStyles := []string{"Rough", "Gentle", "Independent", "With Toys", "With Others"}
	activityLevels := []string{"High", "Medium", "Low"}
	genders := []string{"Male", "Female"}

	totalPetsCreated := 0
	// Iterate through ALL created users (main + others)
	for _, user := range users {
		// --- Create Dog ---
		dogBreed := dogBreeds[petCount%len(dogBreeds)]
		dogGender := genders[petCount%len(genders)]
		dogWeight := 15.0 + rand.Float64()*15.0
		dogBDay := time.Now().AddDate(-(rand.Intn(8) + 1), -rand.Intn(12), -rand.Intn(28))
		dogActivityLevel := activityLevels[rand.Intn(len(activityLevels))]
		dogNeutered := rand.Intn(2) == 0
		dogVaccinated := rand.Intn(3) != 0
		dogMicrochipped := rand.Intn(4) == 0

		dog := models.Pet{
			UserID:             user.ID,
			Name:               fmt.Sprintf("%s's Dog", user.Name),
			Type:               "Dog",
			Breed:              &dogBreed,
			Gender:             &dogGender,
			Weight:             &dogWeight,
			Birthday:           &dogBDay,
			Bio:                stringToPtr(fmt.Sprintf("Loyal canine companion of %s.", user.Name)),
			Personality:        pq.StringArray([]string{personalities[rand.Intn(len(personalities))], personalities[rand.Intn(len(personalities))]}),
			FavoriteActivities: pq.StringArray([]string{activities[rand.Intn(len(activities))], activities[rand.Intn(len(activities))]}),
			PlayStyle:          pq.StringArray([]string{playStyles[rand.Intn(len(playStyles))]}),
			ActivityLevel:      &dogActivityLevel,
			IsNeutered:         &dogNeutered,
			IsVaccinated:       &dogVaccinated,
			IsMicrochipped:     &dogMicrochipped,
		}
		if err := db.Create(&dog).Error; err != nil {
			log.Printf("Failed to create dog for user %s: %v", user.Email, err)
		} else {
			totalPetsCreated++
			// Seed Dog Photos
			dogAvatar := models.Photo{ /*...*/
				OwnerType: "pet", OwnerID: dog.ID, URL: fmt.Sprintf("/uploads/pet/%s/petAvatar.png", dog.ID.String()), IsPrimary: true, Order: 0}
			dogPhoto := models.Photo{ /*...*/
				OwnerType: "pet", OwnerID: dog.ID, URL: fmt.Sprintf("/uploads/pet/%s/dog.png", dog.ID.String()), IsPrimary: false, Order: 1}
			if err := db.Create(&dogAvatar).Error; err != nil {
				log.Printf("Failed to create avatar for dog %s: %v", dog.Name, err)
			}
			if err := db.Create(&dogPhoto).Error; err != nil {
				log.Printf("Failed to create photo for dog %s: %v", dog.Name, err)
			}
		}
		petCount++

		// --- Create Cat ---
		catBreed := catBreeds[petCount%len(catBreeds)]
		catGender := genders[petCount%len(genders)]
		catWeight := 3.0 + rand.Float64()*4.0
		catBDay := time.Now().AddDate(-(rand.Intn(10)), -rand.Intn(12), -rand.Intn(28))
		catActivityLevel := activityLevels[rand.Intn(len(activityLevels))]
		catNeutered := rand.Intn(2) == 0
		catVaccinated := rand.Intn(3) != 0
		catMicrochipped := rand.Intn(4) == 0

		cat := models.Pet{
			UserID:             user.ID,
			Name:               fmt.Sprintf("%s's Cat", user.Name),
			Type:               "Cat",
			Breed:              &catBreed,
			Gender:             &catGender,
			Weight:             &catWeight,
			Birthday:           &catBDay,
			Bio:                stringToPtr(fmt.Sprintf("Independent feline friend of %s.", user.Name)),
			Personality:        pq.StringArray([]string{personalities[rand.Intn(len(personalities))], personalities[rand.Intn(len(personalities))]}),
			FavoriteActivities: pq.StringArray([]string{activities[rand.Intn(len(activities))], activities[rand.Intn(len(activities))]}),
			PlayStyle:          pq.StringArray([]string{playStyles[rand.Intn(len(playStyles))]}),
			ActivityLevel:      &catActivityLevel,
			IsNeutered:         &catNeutered,
			IsVaccinated:       &catVaccinated,
			IsMicrochipped:     &catMicrochipped,
		}
		if err := db.Create(&cat).Error; err != nil {
			log.Printf("Failed to create cat for user %s: %v", user.Email, err)
		} else {
			totalPetsCreated++
			// Seed Cat Photos
			catAvatar := models.Photo{ /*...*/
				OwnerType: "pet", OwnerID: cat.ID, URL: fmt.Sprintf("/uploads/pet/%s/petAvatar.png", cat.ID.String()), IsPrimary: true, Order: 0}
			catPhoto := models.Photo{ /*...*/
				OwnerType: "pet", OwnerID: cat.ID, URL: fmt.Sprintf("/uploads/pet/%s/cat.jpg", cat.ID.String()), IsPrimary: false, Order: 1}
			if err := db.Create(&catAvatar).Error; err != nil {
				log.Printf("Failed to create avatar for cat %s: %v", cat.Name, err)
			}
			if err := db.Create(&catPhoto).Error; err != nil {
				log.Printf("Failed to create photo for cat %s: %v", cat.Name, err)
			}
		}
		petCount++
	}
	log.Printf("Created %d pets and their photos in total.\n", totalPetsCreated)

	// --- Seed Photos / Connections / Messages (Optional Placeholders) ---
	// ...

	log.Println("Data seeding finished.")
	return nil
}

// Helper function to get pointer to string, returns nil if string is empty
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// Helper function to get pointer to float64
func float64ToPtr(f float64) *float64 {
	return &f
}
