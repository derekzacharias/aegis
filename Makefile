.PHONY: lint test up down seed

lint:
poetry run ruff check backend/fastapi || true

test:
pytest backend/fastapi/tests

up:
cd ops && docker-compose up -d

down:
cd ops && docker-compose down

seed:
psql "$$DATABASE_URL" -f ops/seed/seed_data.sql
