.PHONY: help dev prod down logs clean install

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment with Docker
	docker-compose up

dev-build: ## Start development environment and rebuild containers
	docker-compose up --build

prod: ## Start production environment with Docker
	docker-compose -f docker-compose.prod.yml up --build

down: ## Stop all containers
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

logs: ## Show logs from all containers
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

clean: ## Remove all containers, volumes, and images
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

install: ## Install dependencies locally (not using Docker)
	cd backend && npm install
	cd frontend && npm install

backend-dev: ## Run backend in development mode locally
	cd backend && npm run start:dev

frontend-dev: ## Run frontend in development mode locally
	cd frontend && npm run dev

test-backend: ## Run backend tests
	cd backend && npm run test

build-backend: ## Build backend
	cd backend && npm run build

build-frontend: ## Build frontend
	cd frontend && npm run build
