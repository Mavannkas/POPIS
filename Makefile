.PHONY: dev stop logs clean

dev: ## Start development environment
	docker compose up -d

stop: ## Stop all containers
	docker compose down

logs: ## Show logs
	docker compose logs -f

clean: ## Clean everything
	docker compose down -v
