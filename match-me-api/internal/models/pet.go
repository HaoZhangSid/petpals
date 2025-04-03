package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Pet 宠物模型
type Pet struct {
	ID                 string         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID             string         `json:"user_id" gorm:"type:uuid;not null"`
	Name               string         `json:"name" gorm:"not null"`
	Type               string         `json:"type" gorm:"not null"` // 如dog, cat等
	Breed              string         `json:"breed"`
	Age                int            `json:"age"`
	Gender             string         `json:"gender"`
	Weight             float64        `json:"weight"`
	Birthday           *time.Time     `json:"birthday"`
	Avatar             string         `json:"avatar"`
	Bio                string         `json:"bio" gorm:"type:text"`
	Photos             pq.StringArray `json:"photos" gorm:"type:text[]"`
	Personality        pq.StringArray `json:"personality" gorm:"type:text[]"`
	FavoriteActivities pq.StringArray `json:"favorite_activities" gorm:"type:text[]"`
	IsMicrochipped     bool           `json:"is_microchipped"`
	IsVaccinated       bool           `json:"is_vaccinated"`
	IsNeutered         bool           `json:"is_neutered"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`
	// 可以根据需要添加其他字段
}
