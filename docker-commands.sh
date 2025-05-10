#!/bin/bash

# Not mandatory to use

# Function to display usage
show_usage() {
    echo "Usage: $0 [command]"
    echo "Commands:"
    echo "  build    - Build all Docker containers"
    echo "  up       - Start all containers"
    echo "  down     - Stop and remove all containers"
    echo "  logs     - View logs from all containers"
    echo "  shell    - Open shell in backend container"
    echo "  migrate  - Run database migrations"
    echo "  test     - Run tests"
    echo "  clean    - Remove all containers, images, and volumes"
}

# Function to build containers
build_containers() {
    echo "Building Docker containers..."
    docker-compose build
}

# Function to start containers
start_containers() {
    echo "Starting Docker containers..."
    docker-compose up -d
}

# Function to stop containers
stop_containers() {
    echo "Stopping Docker containers..."
    docker-compose down
}

# Function to view logs
view_logs() {
    echo "Viewing Docker logs..."
    docker-compose logs -f
}

# Function to open shell in backend
open_shell() {
    echo "Opening shell in backend container..."
    docker-compose exec backend /bin/bash
}

# Function to run migrations
run_migrations() {
    echo "Running database migrations..."
    docker-compose exec backend python manage.py migrate
}

# Function to run tests
run_tests() {
    echo "Running tests..."
    docker-compose exec backend python manage.py test
}

# Function to clean everything
clean_all() {
    echo "Cleaning all Docker resources..."
    docker-compose down -v
    docker system prune -af
}

# Main script
case "$1" in
    "build")
        build_containers
        ;;
    "up")
        start_containers
        ;;
    "down")
        stop_containers
        ;;
    "logs")
        view_logs
        ;;
    "shell")
        open_shell
        ;;
    "migrate")
        run_migrations
        ;;
    "test")
        run_tests
        ;;
    "clean")
        clean_all
        ;;
    *)
        show_usage
        exit 1
        ;;
esac 