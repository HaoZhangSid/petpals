package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID        string         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string         `json:"name" gorm:"not null"`
	Email     string         `json:"email" gorm:"not null;unique"`
	Password  string         `json:"-" gorm:"not null"` // 不返回密码到JSON
	Avatar    string         `json:"avatar"`
	Location  string         `json:"location"`
	Phone     string         `json:"phone"`
	Bio       string         `json:"bio" gorm:"type:text"`
	Interests pq.StringArray `json:"interests" gorm:"type:text[]"`
	Photos    pq.StringArray `json:"photos" gorm:"type:text[]"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Pets      []Pet          `json:"pets,omitempty" gorm:"foreignKey:UserID"`
}
