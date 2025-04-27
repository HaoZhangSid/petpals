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
	numUsers        = 50            // Number of users to create
	centerLat       = 60.9812677    // Your provided Latitude
	centerLon       = 24.4727716    // Your provided Longitude
	maxDistanceKm   = 200.0         // Max distance from center for generated users
	minPrefRadiusKm = 5.0           // Min user preference radius
	maxPrefRadiusKm = 50.0          // Max user preference radius
	commonPassword  = "password123" // Common password for all seeded users
	latDegPerKm     = 1.0 / 111.1   // Approximate degrees latitude per km
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
	// log.Println("Cleaning existing data...")
	// ... (keep cleanup code commented out unless needed) ...
	// log.Println("Existing data cleaned.")

	// --- Seed Users ---
	log.Printf("Creating %d users...\n", numUsers)
	users := make([]models.User, 0, numUsers)
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(commonPassword), bcrypt.DefaultCost)

	// Calculate max offsets in degrees
	maxLatOffset := maxDistanceKm * latDegPerKm
	maxLonOffset := maxDistanceKm * lonDegPerKmAtLat

	for i := 1; i <= numUsers; i++ {
		// Generate random offsets within the max distance
		latOffset := (rand.Float64()*2 - 1) * maxLatOffset // Random value between -maxLatOffset and +maxLatOffset
		lonOffset := (rand.Float64()*2 - 1) * maxLonOffset // Random value between -maxLonOffset and +maxLonOffset

		userLat := centerLat + latOffset
		userLon := centerLon + lonOffset

		// Format coordinates to WKT
		coordinatesWKT := fmt.Sprintf("SRID=4326;POINT(%f %f)", userLon, userLat)

		// Generate random preference radius
		prefRadius := minPrefRadiusKm + rand.Float64()*(maxPrefRadiusKm-minPrefRadiusKm)

		user := models.User{
			Name:     fmt.Sprintf("Seed User %d", i),
			Email:    fmt.Sprintf("seed%d@example.com", i),
			Password: string(hashedPassword),
			// Location:  fmt.Sprintf("Location %d", (i%5)+1), // Removed old location string
			Phone:                     fmt.Sprintf("123-555-%04d", i),
			Bio:                       fmt.Sprintf("This is the bio for seed user %d. Loves pets!", i),
			Interests:                 pq.StringArray([]string{fmt.Sprintf("Interest%d", i%3+1), "Pets", "Outdoors"}),
			Coordinates:               stringToPtr(coordinatesWKT), // Set new coordinates
			MaxRecommendationRadiusKm: float64ToPtr(prefRadius),    // Set new radius preference
		}
		result := db.Create(&user)
		if result.Error != nil {
			log.Printf("Failed to create user %d: %v", i, result.Error)
			continue
		}
		users = append(users, user)
	}
	log.Printf("Created %d users.\n", len(users))

	// --- Seed Pets (One Dog and One Cat per User) ---
	log.Println("Creating 1 Dog and 1 Cat for each user...")
	petCount := 0 // Used for variation in pet details
	dogBreeds := []string{"Labrador", "Poodle", "German Shepherd", "Golden Retriever", "Beagle"}
	catBreeds := []string{"Siamese", "Persian", "Maine Coon", "Sphynx", "Ragdoll"}
	personalities := []string{"Playful", "Calm", "Shy", "Energetic", "Curious", "Affectionate"}
	activities := []string{"Walks", "Fetch", "Cuddling", "Sleeping", "Exploring", "Training"}
	playStyles := []string{"Rough", "Gentle", "Independent", "With Toys", "With Others"}
	activityLevels := []string{"High", "Medium", "Low"}
	genders := []string{"Male", "Female"}

	totalPetsCreated := 0
	for _, user := range users {
		// Create Dog
		dogBreed := dogBreeds[petCount%len(dogBreeds)]
		dogGender := genders[petCount%len(genders)]
		dogWeight := 15.0 + rand.Float64()*15.0 // Example weight range for dogs
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
		}
		petCount++ // Increment for variation

		// Create Cat
		catBreed := catBreeds[petCount%len(catBreeds)]
		catGender := genders[petCount%len(genders)]
		catWeight := 3.0 + rand.Float64()*4.0 // Example weight range for cats
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
		}
		petCount++ // Increment again
	}
	log.Printf("Created %d pets in total.\n", totalPetsCreated)

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
