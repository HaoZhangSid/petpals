.PHONY: build run clean migrate-up migrate-down test seed clean-data

# 应用名称
APP=match-me-api
# 主程序入口
MAIN_PATH=./cmd/server/main.go
# 数据库连接URL（确保这个环境变量在运行 make 时可用）
# DB_URL ?= "postgresql://postgres:qwer1234@localhost:5433/matchme?sslmode=disable"

# 构建可执行文件
build:
	go build -o $(APP) $(MAIN_PATH)

# 运行应用
run:
	go run $(MAIN_PATH)

# 热重载
dev:
	go install github.com/cosmtrek/air@latest
	air

# 清理生成的文件
clean:
	rm -f $(APP)
	go clean

# 数据库迁移
migrate-up:
	@echo "Running database migrations up..."
	@migrate -path migrations -database "$(DB_URL)" up

migrate-down:
	@echo "Running database migrations down..."
	@migrate -path migrations -database "$(DB_URL)" down

# 运行数据库填充脚本
seed:
	@echo "Running database seeding script..."
	@go run ./scripts/seed.go

# 清空用户生成的数据 (谨慎使用!)
clean-data:
	@echo "WARNING: This will delete all messages, conversations, connections, photos, pets, and users!"
	@read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "Deleting data..."
	@psql "$(DB_URL)" -c "DELETE FROM messages;" \
	                 -c "DELETE FROM conversations;" \
	                 -c "DELETE FROM connections;" \
	                 -c "DELETE FROM photos;" \
	                 -c "DELETE FROM pets;" \
	                 -c "DELETE FROM users;"
	@echo "Data deleted."

# 单元测试
test:
	go test ./... -v

# 显示帮助
help:
	@echo "以下是可用的命令:"
	@echo "make build        - 构建应用"
	@echo "make run          - 运行应用"
	@echo "make dev          - 使用Air进行热重载开发"
	@echo "make clean        - 清理构建文件"
	@echo "make migrate-up   - 运行数据库迁移"
	@echo "make migrate-down - 回滚数据库迁移"
	@echo "make seed         - 运行数据库填充脚本 (./scripts/seed.go)"
	@echo "make clean-data   - 清空用户、宠物、照片等核心数据 (危险!)"
	@echo "make test         - 运行单元测试"

# 默认目标
default: help