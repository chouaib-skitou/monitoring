# ========== Variables ==========
PROJECT_NAME=monitoring

# ========== Commands ==========

up:
	@echo "🚀 Starting services..."
	docker-compose up --build

down:
	@echo "🧹 Stopping and cleaning containers and volumes..."
	docker-compose down -v

restart:
	@echo "🔁 Restarting stack..."
	docker-compose down -v
	docker-compose up --build

logs:
	@echo "📜 Tailing logs..."
	docker-compose logs -f

logs-filebeat:
	docker-compose logs -f filebeat

logs-logstash:
	docker-compose logs -f logstash

logs-app:
	docker-compose logs -f analytics-app

ps:
	docker-compose ps

exec-app:
	docker exec -it $(PROJECT_NAME)-analytics-app-1 sh

exec-filebeat:
	docker exec -it $(PROJECT_NAME)-filebeat-1 sh

# ========== Help ==========
help:
	@echo "🛠️  Available commands:"
	@echo "  make up              - Start services"
	@echo "  make down            - Stop & clean"
	@echo "  make restart         - Rebuild everything"
	@echo "  make logs            - View all logs"
	@echo "  make logs-app        - View analytics-app logs"
	@echo "  make logs-filebeat   - View filebeat logs"
	@echo "  make logs-logstash   - View logstash logs"
	@echo "  make ps              - Show container status"
	@echo "  make exec-app        - Shell into analytics-app"
	@echo "  make exec-filebeat   - Shell into filebeat"
