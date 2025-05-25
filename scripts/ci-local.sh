#!/bin/bash

# Local CI Script - Mimics GitHub Actions CI/CD pipeline
# Run this script before pushing to ensure your changes will pass CI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command_exists pnpm; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi

    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "All prerequisites are available"
}

# Setup test database
setup_test_db() {
    print_status "Setting up test database..."

    cd backend

    # Start test database
    pnpm test:db:up

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10

    # Seed test database
    pnpm test:db:seed

    cd ..
    print_success "Test database setup complete"
}

# Run backend tests
run_backend_tests() {
    print_status "Running backend tests..."

    cd backend

    # Install dependencies
    print_status "Installing backend dependencies..."
    pnpm install --frozen-lockfile

    # TypeScript check
    print_status "Running TypeScript check..."
    pnpm exec tsc --noEmit

    # Install Playwright browsers
    print_status "Installing Playwright browsers..."
    pnpm exec playwright install --with-deps

    # Run API tests
    print_status "Running API tests..."
    CI=true pnpm test

    cd ..
    print_success "Backend tests completed successfully"
}

# Run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."

    cd frontend

    # Install dependencies
    print_status "Installing frontend dependencies..."
    pnpm install --frozen-lockfile

    # TypeScript check
    print_status "Running TypeScript check..."
    pnpm exec tsc --noEmit

    # Lint check
    print_status "Running ESLint..."
    pnpm lint

    # Format check
    print_status "Checking Prettier formatting..."
    pnpm format --check

    # Build
    print_status "Building frontend..."
    pnpm build

    cd ..
    print_success "Frontend tests completed successfully"
}

# Run security checks
run_security_checks() {
    print_status "Running security checks..."

    # Backend audit
    print_status "Running backend security audit..."
    cd backend
    pnpm audit --audit-level moderate || print_warning "Backend audit found issues"
    cd ..

    # Frontend audit
    print_status "Running frontend security audit..."
    cd frontend
    pnpm audit --audit-level moderate || print_warning "Frontend audit found issues"
    cd ..

    print_success "Security checks completed"
}

# Docker build test
test_docker_build() {
    print_status "Testing Docker build..."

    cd backend

    # Build Docker image
    docker build -t zecretly-backend-test .

    # Clean up test image
    docker rmi zecretly-backend-test

    cd ..
    print_success "Docker build test completed"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."

    cd backend
    pnpm test:db:down || true
    cd ..

    print_success "Cleanup completed"
}

# Main execution
main() {
    print_status "Starting local CI checks..."
    echo "This script will run the same checks as the GitHub Actions CI pipeline"
    echo ""

    # Set trap for cleanup on exit
    trap cleanup EXIT

    # Run all checks
    check_prerequisites
    setup_test_db
    run_backend_tests
    run_frontend_tests
    run_security_checks
    test_docker_build

    print_success "🎉 All CI checks passed! Your code is ready for push."
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes: git add . && git commit -m 'Your commit message'"
    echo "2. Push to your branch: git push origin your-branch-name"
    echo "3. Create a pull request if needed"
}

# Handle script arguments
case "${1:-}" in
    "backend")
        print_status "Running backend tests only..."
        check_prerequisites
        setup_test_db
        run_backend_tests
        cleanup
        ;;
    "frontend")
        print_status "Running frontend tests only..."
        check_prerequisites
        run_frontend_tests
        ;;
    "security")
        print_status "Running security checks only..."
        check_prerequisites
        run_security_checks
        ;;
    "docker")
        print_status "Running Docker build test only..."
        check_prerequisites
        test_docker_build
        ;;
    "help"|"-h"|"--help")
        echo "Local CI Script - Usage:"
        echo ""
        echo "  ./scripts/ci-local.sh          Run all CI checks"
        echo "  ./scripts/ci-local.sh backend  Run backend tests only"
        echo "  ./scripts/ci-local.sh frontend Run frontend tests only"
        echo "  ./scripts/ci-local.sh security Run security checks only"
        echo "  ./scripts/ci-local.sh docker   Run Docker build test only"
        echo "  ./scripts/ci-local.sh help     Show this help message"
        echo ""
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown argument: $1"
        echo "Use './scripts/ci-local.sh help' for usage information"
        exit 1
        ;;
esac
