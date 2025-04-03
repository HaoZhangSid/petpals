package config

import (
	"fmt"
	"os"
)

// Config 存储应用程序的配置
type Config struct {
	Database DatabaseConfig
	Server   ServerConfig
	JWT      JWTConfig
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
	Secret string
}

// GetDSN 返回PostgreSQL数据库连接字符串
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// LoadConfig 从环境变量加载配置
func LoadConfig() *Config {
	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5433"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "qwer1234"),
			DBName:   getEnv("DB_NAME", "matchme"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-secret-key"),
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
