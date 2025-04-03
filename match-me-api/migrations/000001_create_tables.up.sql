-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    interests TEXT[],
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 创建宠物表
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age INTEGER,
    gender VARCHAR(20),
    weight DECIMAL(5,2),
    birthday TIMESTAMP WITH TIME ZONE,
    avatar VARCHAR(255),
    bio TEXT,
    photos TEXT[],
    personality TEXT[],
    favorite_activities TEXT[],
    is_microchipped BOOLEAN DEFAULT FALSE,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_neutered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_users_email ON users(email); 