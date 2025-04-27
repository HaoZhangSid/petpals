package config

import (
	"fmt"
	"os"
	"strconv" // Import strconv for JWT expiration
	"time"    // Import time for JWT expiration
)

// FileStorageConfig 存储文件存储相关配置
type FileStorageConfig struct {
	BasePath string // 文件存储的基础路径
}

// Config 存储应用程序的配置
type Config struct {
	AppEnv      string // e.g., development, production
	Database    DatabaseConfig
	Server      ServerConfig
	JWT         JWTConfig
	FileStorage FileStorageConfig // Add file storage config
}

// DatabaseConfig 存储数据库相关配置
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// ServerConfig 存储服务器相关配置
type ServerConfig struct {
	Port string
}

// JWTConfig 存储JWT相关配置
type JWTConfig struct {
	Secret         string
	ExpirationTime time.Duration
}

// GetDSN 返回PostgreSQL数据库连接字符串
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// LoadConfig 从环境变量加载配置
func LoadConfig() *Config {
	// Load JWT Expiration (with default)
	expHoursStr := getEnv("JWT_EXPIRATION_HOURS", "72")
	expHours, err := strconv.Atoi(expHoursStr)
	if err != nil {
		expHours = 72 // Default to 72 hours on parsing error
	}
	jwtExpiration := time.Duration(expHours) * time.Hour

	return &Config{
		AppEnv: getEnv("APP_ENV", "development"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5433"), // Default to 5432
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),        // Default to empty, should be set in .env
			DBName:   getEnv("DB_NAME", "match_me_db"), // Default db name
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"), // Use SERVER_PORT, default 8080
		},
		JWT: JWTConfig{
			Secret:         getEnv("JWT_SECRET", "default-insecure-secret-key-please-change"), // Provide a default, but strongly recommend setting in .env
			ExpirationTime: jwtExpiration,
		},
		FileStorage: FileStorageConfig{
			BasePath: getEnv("FILE_STORAGE_PATH", "./uploads"), // Read file storage path
		},
	}
}

// 从环境变量获取值，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
