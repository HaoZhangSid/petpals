package database

import (
	"log"

	"github.com/HaoZhangSid/match-me-api/config"
	"github.com/HaoZhangSid/match-me-api/internal/models"
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

// 迁移数据库模型
func migrateModels() error {
	log.Println("Running database migrations")

	err := DB.AutoMigrate(
		&models.User{},
		&models.Pet{},
	)

	if err != nil {
		log.Printf("Migration failed: %v", err)
		return err
	}

	log.Println("Database migration completed successfully")
	return nil
}
