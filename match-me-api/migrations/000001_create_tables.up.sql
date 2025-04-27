-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用PostGIS扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(1024),
    location VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    interests TEXT[],
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 创建宠物表
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age FLOAT,
    gender VARCHAR(20),
    weight FLOAT,
    birthday DATE,
    avatar VARCHAR(1024),
    bio TEXT,
    photos TEXT[],
    personality TEXT[],
    favorite_activities TEXT[],
    play_style TEXT[],
    activity_level VARCHAR(50),
    is_microchipped BOOLEAN DEFAULT FALSE,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_neutered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 删除可能存在的旧约束（如果之前执行过）
-- ALTER TABLE pets DROP CONSTRAINT IF EXISTS check_pet_type;
-- ALTER TABLE pets DROP CONSTRAINT IF EXISTS check_pet_gender;
-- ALTER TABLE pets DROP CONSTRAINT IF EXISTS check_pet_activity_level;

-- 添加约束 (如果需要，可以在模型层面或服务层面验证)
-- ALTER TABLE pets ADD CONSTRAINT check_pet_type CHECK (type IN ('Dog', 'Cat', 'Bird', 'Fish', 'Small Animal', 'Reptile', 'Other'));
-- ALTER TABLE pets ADD CONSTRAINT check_pet_gender CHECK (gender IN ('male', 'female'));
-- ALTER TABLE pets ADD CONSTRAINT check_pet_activity_level CHECK (activity_level IN ('Low Energy', 'Moderate Energy', 'High Energy', 'Very Active'));

-- 注意：之前的 DROP TABLE 语句已移除，因为 migrate down 会处理表的删除。 