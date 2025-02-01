# Variables
DOCKER_COMPOSE = docker-compose
APP_NAME = finelth-backend

# Colors for terminal output
GREEN = \033[0;32m
NC = \033[0m # No Color
INFO = @echo "${GREEN}[INFO]${NC}"

.PHONY: help build up down restart logs ps clean test clean-deps fix-install rebuild-modules

# Show help
help:
	@echo "Available commands:"
	@echo "  make start    - Start Docker container"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop and remove all containers"
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - View logs from all services"
	@echo "  make ps       - List running services"
	@echo "  make clean    - Remove all containers, volumes, and images"
	@echo "  make test     - Run tests in Docker environment"
	@echo "  make dev      - Start development environment"
	@echo "  make shell    - Open shell in app container"
	@echo "  make install  - Install dependencies"
	@echo "  make install-package - Install a specific package"
	@echo "  make clean-deps - Clean Node.js dependencies"
	@echo "  make fix-install - Fix permissions and clean install"
	@echo "  make rebuild-modules - Force rebuild node modules with platform-specific binaries"

# start docker container
start:
	${INFO} "Starting Docker container..."
	${DOCKER_COMPOSE} up

# Build Docker images
build:
	${INFO} "Building Docker images..."
	${DOCKER_COMPOSE} build --no-cache

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

# Install dependencies
install:
	${INFO} "Installing dependencies..."
	${DOCKER_COMPOSE} run --rm app npm install

# install a specific package as a dev dependency
# make install-package-dev package=drizzle-kit
install-package-dev:
	${INFO} "Installing package..."
	${DOCKER_COMPOSE} run --rm app npm install ${package} --save-dev

# install a specific package as a dependency
# make install-package package=drizzle-kit
install-package:
	${INFO} "Installing package..."
	${DOCKER_COMPOSE} run --rm app npm install --save ${package}

uninstall-package:
	${INFO} "Uninstalling package..."
	${DOCKER_COMPOSE} run --rm app npm uninstall ${package}

generate-migrations:
	${INFO} "Generating migrations..."
	${DOCKER_COMPOSE} run --rm app drizzle-kit generate --name=${name}

migrate:
	${INFO} "Migrating..."
	${DOCKER_COMPOSE} run --rm app npm run migrate

# Clean node modules, package-lock.json and dist
clean-deps:
	${INFO} "Cleaning Node.js dependencies..."
	${DOCKER_COMPOSE} run --rm app rm -rf package-lock.json node_modules dist

# Fix permissions and clean install
fix-install:
	${INFO} "Fixing permissions and performing clean install..."
	${DOCKER_COMPOSE} run --rm app sh -c "rm -rf node_modules package-lock.json && npm cache clean --force && npm install"

# Force rebuild node modules with platform-specific binaries
rebuild-modules:
	${INFO} "Rebuilding node modules..."
	${DOCKER_COMPOSE} run --rm app sh -c "npm rebuild"
