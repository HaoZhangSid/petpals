package database

import (
	"log"

	"github.com/HaoZhangSid/match-me-api/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 是全局数据库连接实例
var DB *gorm.DB

// Connect 连接到PostgreSQL数据库
func Connect() error {
	cfg := config.LoadConfig()

	// 获取数据库连接字符串
	dsn := cfg.Database.GetDSN()

	log.Printf("Connecting to database at %s:%s", cfg.Database.Host, cfg.Database.Port)

	// 配置GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// 连接到数据库
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return err
	}

	log.Println("Successfully connected to database")

	// 自动迁移数据库模型
	err = migrateModels()
	if err != nil {
		return err
	}

	return nil
}

// migrateModels 迁移所有必要的数据库模型
func migrateModels() error {
	log.Println("Running database auto-migration check - GORM AutoMigrate is DISABLED. Migrations handled by external tool.")

	/* // GORM AutoMigrate disabled to rely on explicit SQL migrations
	err := DB.AutoMigrate(
		&models.User{},
		&models.Pet{},
		&models.Photo{},
		&models.Connection{},
		&models.Conversation{},
		&models.Message{},
		// Add other models here if they are created
	)

	if err != nil {
		log.Printf("Auto-migration failed: %v", err)
		return err
	}
	*/

	log.Println("Database auto-migration check skipped. Using external migration tool.")
	return nil
}
