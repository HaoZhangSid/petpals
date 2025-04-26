package main

import (
	"log"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt" // For hashing passwords
	"github.com/HaoZhangSid/match-me-api/config"
	"github.com/HaoZhangSid/match-me-api/internal/database"
	"github.com/HaoZhangSid/match-me-api/internal/models"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/lib/pq" // For StringArray
	"gorm.io/gorm"
	// "math/rand" // May need later for randomization
	"fmt" // For generating unique emails/names
)

func main() {
	log.Println("Starting database seeding...")

	// Load .env file (optional, but good practice)
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables or defaults")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Connect to the database
	err = database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database for seeding: %v", err)
	}
	db := database.DB // Use the global DB instance from database package

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

	// --- Configuration ---
	numUsers := 20 // Number of users to create
	numPetsPerUserMax := 3 // Maximum pets per user

	// --- Clean existing data (optional, use with caution!) ---
	// uncomment the following lines if you want to wipe tables before seeding
	// log.Println("Cleaning existing data...")
	// if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Message{}).Error; err != nil { return fmt.Errorf("failed to delete messages: %w", err) }
	// if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Conversation{}).Error; err != nil { return fmt.Errorf("failed to delete conversations: %w", err) }
	// if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Connection{}).Error; err != nil { return fmt.Errorf("failed to delete connections: %w", err) }
	// if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Photo{}).Error; err != nil { return fmt.Errorf("failed to delete photos: %w", err) }
	// if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Pet{}).Error; err != nil { return fmt.Errorf("failed to delete pets: %w", err) }
	// if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.User{}).Error; err != nil { return fmt.Errorf("failed to delete users: %w", err) }
	// log.Println("Existing data cleaned.")


	// --- Seed Users ---
	log.Printf("Creating %d users...
", numUsers)
	users := make([]models.User, 0, numUsers)
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost) // Use a common password for seeds

	for i := 1; i <= numUsers; i++ {
		user := models.User{
			Name:      fmt.Sprintf("Seed User %d", i),
			Email:     fmt.Sprintf("seed%d@example.com", i),
			Password:  string(hashedPassword),
			Location:  fmt.Sprintf("Location %d", (i%5)+1), // Cycle through 5 locations
			Phone:     fmt.Sprintf("123-555-%04d", i),
			Bio:       fmt.Sprintf("This is the bio for seed user %d. Loves pets!", i),
			Interests: pq.StringArray([]string{fmt.Sprintf("Interest%d", i%3+1), "Pets", "Outdoors"}),
		}
		result := db.Create(&user)
		if result.Error != nil {
			log.Printf("Failed to create user %d: %v", i, result.Error)
			// Decide if you want to stop seeding or continue
			continue // Continue for now
		}
		users = append(users, user)
	}
	log.Printf("Created %d users.
", len(users))

	// --- Seed Pets ---
	log.Printf("Creating pets for users (up to %d per user)...
", numPetsPerUserMax)
	petCount := 0
	petTypes := []string{"Dog", "Cat", "Rabbit", "Hamster", "Parrot"}
	dogBreeds := []string{"Labrador", "Poodle", "German Shepherd", "Golden Retriever", "Beagle"}
	catBreeds := []string{"Siamese", "Persian", "Maine Coon", "Sphynx", "Ragdoll"}
	personalities := []string{"Playful", "Calm", "Shy", "Energetic", "Curious", "Affectionate"}
	activities := []string{"Walks", "Fetch", "Cuddling", "Sleeping", "Exploring", "Training"}
	playStyles := []string{"Rough", "Gentle", "Independent", "With Toys", "With Others"}
	activityLevels := []string{"High", "Medium", "Low"}
	genders := []string{"Male", "Female"}

	// Initialize random seed if needed (uncomment math/rand import too)
	// rand.Seed(time.Now().UnixNano())

	for _, user := range users {
		// numPets := rand.Intn(numPetsPerUserMax + 1) // 0 to Max pets
        numPets := (int(user.ID.ID() % uint64(numPetsPerUserMax))) + 1 // Deterministic pet count based on user ID
		for j := 0; j < numPets; j++ {
			petType := petTypes[petCount%len(petTypes)]
			var breed *string
			if petType == "Dog" {
				b := dogBreeds[petCount%len(dogBreeds)]
				breed = &b
			} else if petType == "Cat" {
				b := catBreeds[petCount%len(catBreeds)]
				breed = &b
			}
            gender := genders[petCount%len(genders)]
            weight := float64(petCount%20 + 5) // Example weight
            bDay := time.Now().AddDate(-(petCount % 10), - (petCount % 12), 0) // Example birthday
            activityLevel := activityLevels[petCount%len(activityLevels)]
            isNeutered := petCount%2 == 0
            isVaccinated := petCount%3 != 0
            isMicrochipped := petCount%4 == 0


			pet := models.Pet{
				UserID:           user.ID,
				Name:             fmt.Sprintf("%s Pet %d", user.Name, j+1),
				Type:             petType,
				Breed:            breed,
                Gender:           &gender,
                Weight:           &weight,
                Birthday:         &bDay,
				Bio:              stringToPtr(fmt.Sprintf("Bio for %s's pet %d.", user.Name, j+1)),
				Personality:      pq.StringArray([]string{personalities[petCount%len(personalities)], personalities[(petCount+1)%len(personalities)]}),
				FavoriteActivities: pq.StringArray([]string{activities[petCount%len(activities)], activities[(petCount+2)%len(activities)]}),
				PlayStyle:        pq.StringArray([]string{playStyles[petCount%len(playStyles)]}),
                ActivityLevel:    &activityLevel,
                IsNeutered:       &isNeutered,
                IsVaccinated:     &isVaccinated,
                IsMicrochipped:   &isMicrochipped,
			}
			result := db.Create(&pet)
			if result.Error != nil {
				log.Printf("Failed to create pet for user %s: %v", user.Email, result.Error)
				continue
			}
			petCount++
		}
	}
	log.Printf("Created %d pets.
", petCount)


	// --- Seed Photos (Optional - Placeholder URLs) ---
	// TODO: Implement if needed, potentially creating placeholder Photo records


	// --- Seed Connections (Optional) ---
    // TODO: Implement if needed, create some pending/accepted connections


	// --- Seed Conversations & Messages (Optional) ---
	// TODO: Implement if needed


	log.Println("Data seeding finished.")
	return nil
}

// Helper function (already exists in pet_handler.go, copied here for simplicity)
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
} 