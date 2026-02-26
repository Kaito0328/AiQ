#!/bin/bash
set -e

echo "Setting up quiz_test_db for Playwright E2E tests..."

export DATABASE_URL=postgresql://user:password@db:5432/quiz_test_db
cd "$(dirname "$0")/.."

# Drop and recreate the test database
sqlx database drop -y --database-url postgresql://user:password@db:5432/quiz_test_db || true
sqlx database create --database-url postgresql://user:password@db:5432/quiz_test_db

echo "Test database created."

# Run migrations
sqlx migrate run

echo "Migrations applied."
