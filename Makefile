run:
go run ./cmd/server/main.go

build:
go build -o bin/match-me-api ./cmd/server/main.go

test:
go test ./...

clean:
rm -f bin/match-me-api

# Add the seed command
seed:
@echo "Running database seeder..."
go run ./scripts/seed.go
@echo "Seeder finished."

.PHONY: run build test clean seed 