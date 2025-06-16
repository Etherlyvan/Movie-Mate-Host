.PHONY: build up down dev clean logs restart health

# Build all services (backend, frontend, ai-api)
build:
	docker-compose build

# Start production services
up:
	docker-compose up -d

# Start development services
dev:
	docker-compose -f docker-compose.dev.yml up

# Stop all services
down:
	docker-compose down

# Clean everything
clean:
	docker-compose down -v --rmi all --remove-orphans

# View all logs
logs:
	docker-compose logs -f

# View specific service logs
logs-frontend:
	docker-compose logs -f frontend

logs-backend:
	docker-compose logs -f backend

logs-ai:
	docker-compose logs -f ai-api

# Health check
health:
	@echo "=== Service Health Status ==="
	@docker-compose ps
	@echo ""
	@echo "=== Testing API Endpoints ==="
	@curl -s http://localhost:3001/api/health || echo "Backend: ❌ Not responding"
	@curl -s http://localhost:8000/health || echo "AI API: ❌ Not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend: ✅ Running" || echo "Frontend: ❌ Not responding"

# Restart services
restart:
	docker-compose restart

# Shell access
shell-frontend:
	docker-compose exec frontend sh

shell-backend:
	docker-compose exec backend sh

shell-ai:
	docker-compose exec ai-api bash