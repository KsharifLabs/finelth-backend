# Variables
DOCKER_COMPOSE = docker-compose
APP_NAME = finelth-backend

# Colors for terminal output
GREEN = \033[0;32m
NC = \033[0m # No Color
INFO = @echo "${GREEN}[INFO]${NC}"

.PHONY: help build up down restart logs ps clean test

# Show help
help:
	@echo "Available commands:"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop and remove all containers"
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - View logs from all services"
	@echo "  make ps       - List running services"
	@echo "  make clean    - Remove all containers, volumes, and images"
	@echo "  make test     - Run tests in Docker environment"

# Build Docker images
build:
	${INFO} "Building Docker images..."
	${DOCKER_COMPOSE} build

# Start all services
up:
	${INFO} "Starting all services..."
	${DOCKER_COMPOSE} up -d
	${INFO} "Services are running"
	${DOCKER_COMPOSE} ps

# Stop and remove containers
down:
	${INFO} "Stopping all services..."
	${DOCKER_COMPOSE} down

# Restart all services
restart:
	${INFO} "Restarting all services..."
	${DOCKER_COMPOSE} restart

# View logs
logs:
	${DOCKER_COMPOSE} logs -f

# List running services
ps:
	${DOCKER_COMPOSE} ps

# Clean everything
clean:
	${INFO} "Cleaning up Docker resources..."
	${DOCKER_COMPOSE} down -v --rmi all --remove-orphans

# Run tests
test:
	${INFO} "Running tests..."
	${DOCKER_COMPOSE} run --rm app npm test

# Development specific commands
dev:
	${INFO} "Starting development environment..."
	${DOCKER_COMPOSE} up

# Enter shell in app container
shell:
	${INFO} "Opening shell in app container..."
	${DOCKER_COMPOSE} exec app sh
