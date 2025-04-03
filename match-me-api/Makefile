.PHONY: build run clean migrate-up migrate-down test

# 应用名称
APP=match-me-api
# 主程序入口
MAIN_PATH=./cmd/api/main.go

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
	migrate -path migrations -database "$(DB_URL)" up

migrate-down:
	migrate -path migrations -database "$(DB_URL)" down

# 单元测试
test:
	go test ./... -v

# 显示帮助
help:
	@echo "以下是可用的命令:"
	@echo "make build      - 构建应用"
	@echo "make run        - 运行应用"
	@echo "make dev        - 使用Air进行热重载开发" 
	@echo "make clean      - 清理构建文件"
	@echo "make migrate-up - 运行数据库迁移"
	@echo "make migrate-down - 回滚数据库迁移"
	@echo "make test       - 运行单元测试"

# 默认目标
default: help 