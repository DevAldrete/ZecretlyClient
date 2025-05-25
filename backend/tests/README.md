# ZecretlyClient Backend Test Suite

This directory contains comprehensive API tests for the ZecretlyClient backend using Playwright.

## Test Structure

```
tests/
├── utils/
│   ├── test-helpers.ts     # API testing utilities and helpers
│   └── test-data.ts        # Test data factories and generators
├── health.api.spec.ts      # Health check endpoint tests
├── workspaces.api.spec.ts  # Workspace CRUD operations tests
├── collections.api.spec.ts # Collection CRUD operations tests
├── requests.api.spec.ts    # Request CRUD and execution tests
├── environments.api.spec.ts # Environment and variable resolution tests
├── request-histories.api.spec.ts # Request history tracking tests
├── integration.api.spec.ts # Cross-module integration tests
└── README.md              # This file
```

## Test Categories

### 1. **Unit API Tests**
- **Health Check**: Basic connectivity and server status
- **Workspaces**: CRUD operations, validation, error handling
- **Collections**: CRUD operations, workspace relationships
- **Requests**: CRUD operations, search functionality
- **Environments**: Variable management, activation/deactivation
- **Request Histories**: History tracking and retrieval

### 2. **Critical Functionality Tests**
- **Request Execution**: HTTP request execution with various methods
- **Variable Resolution**: Environment variable substitution in requests
- **Error Handling**: Graceful handling of invalid inputs and edge cases

### 3. **Integration Tests**
- **Complete Workflows**: End-to-end testing scenarios
- **Cross-Module Relationships**: Data consistency across modules
- **Performance Testing**: Concurrent requests and stress testing

## Setup and Prerequisites

### 1. **Database Setup**
You need a PostgreSQL database for testing. Create a separate test database:

```sql
CREATE DATABASE zecretly_test;
```

### 2. **Environment Configuration**
Create a `.env.test` file in the backend directory:

```env
NODE_ENV=test
PORT=3001
ZECRETLY_DB_CONNECTION_URI=postgresql://username:password@localhost:5432/zecretly_test
LOG_LEVEL=error
```

### 3. **Install Dependencies**
```bash
cd backend
pnpm install
```

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Tests with UI
```bash
pnpm test:ui
```

### Run Tests in Debug Mode
```bash
pnpm test:debug
```

### Run Tests in Headed Mode (with browser)
```bash
pnpm test:headed
```

### Run Specific Test Files
```bash
# Run only health check tests
npx playwright test health.api.spec.ts

# Run only request execution tests
npx playwright test requests.api.spec.ts

# Run only integration tests
npx playwright test integration.api.spec.ts
```

### Run Tests with Specific Tags
```bash
# Run only critical functionality tests
npx playwright test --grep "CRITICAL FUNCTIONALITY"

# Run only error handling tests
npx playwright test --grep "Error Handling"
```

## Test Features

### 1. **Automatic Cleanup**
All tests automatically clean up created resources after each test to prevent data pollution.

### 2. **Data Factories**
Consistent test data generation using factory patterns:
- `TestDataFactory.createWorkspace()`
- `TestDataFactory.createCollection()`
- `TestDataFactory.createRequest()`
- `TestDataFactory.createEnvironment()`
- `TestDataFactory.createRequestHistory()`

### 3. **API Helpers**
Simplified API testing with built-in validation:
- `api.get()`, `api.post()`, `api.put()`, `api.delete()`
- `api.expectError()` for testing error scenarios
- Automatic response validation

### 4. **Validation Utilities**
- UUID format validation
- Timestamp format validation
- API response structure validation

## Test Coverage

### Endpoints Tested
- ✅ `GET /api/health`
- ✅ `GET|POST|PUT|DELETE /api/workspaces`
- ✅ `GET|POST|PUT|DELETE /api/collections`
- ✅ `GET|POST|PUT|DELETE|PATCH /api/requests`
- ✅ `POST /api/requests/:id/execute` (Critical)
- ✅ `GET /api/requests/search`
- ✅ `GET|POST|PUT|DELETE /api/environments`
- ✅ `POST /api/environments/:id/activate|deactivate`
- ✅ `PUT|DELETE /api/environments/:id/variables`
- ✅ `POST /api/environments/:id/resolve` (Critical)
- ✅ `GET|POST|PUT|DELETE /api/request-histories`

### Functionality Tested
- ✅ CRUD operations for all entities
- ✅ Data validation and error handling
- ✅ HTTP request execution
- ✅ Environment variable resolution
- ✅ Cross-module relationships
- ✅ Performance and concurrency
- ✅ Large payload handling
- ✅ Invalid input handling

## Critical Test Scenarios

### 1. **Request Execution Tests**
```typescript
// Test GET request execution
test('should execute GET request successfully', async () => {
  // Creates request, executes it, validates response
});

// Test POST request execution
test('should execute POST request successfully', async () => {
  // Creates POST request with body, executes it, validates response
});

// Test request execution with overrides
test('should execute request with overrides', async () => {
  // Tests runtime parameter overrides
});
```

### 2. **Variable Resolution Tests**
```typescript
// Test variable substitution
test('should resolve variables in text', async () => {
  // Tests {{VARIABLE}} substitution in URLs, headers, body
});

// Test partial resolution
test('should handle partial variable resolution', async () => {
  // Tests behavior with missing variables
});
```

### 3. **Integration Workflow Tests**
```typescript
// Complete workflow test
test('should create workspace, collection, environment, and execute requests', async () => {
  // Tests entire API workflow from setup to execution
});
```

## Debugging Tests

### 1. **View Test Reports**
After running tests, open the HTML report:
```bash
npx playwright show-report
```

### 2. **Debug Specific Tests**
```bash
# Debug a specific test
npx playwright test --debug health.api.spec.ts

# Debug with headed browser
npx playwright test --headed --debug
```

### 3. **Trace Viewer**
Tests automatically capture traces on failure. View them with:
```bash
npx playwright show-trace trace.zip
```

## Performance Considerations

### 1. **Test Isolation**
Each test runs in isolation with proper cleanup to prevent interference.

### 2. **Concurrent Execution**
Tests run in parallel by default. Adjust workers in `playwright.config.ts` if needed.

### 3. **Database Cleanup**
Tests clean up all created data to prevent database bloat.

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: zecretly_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test
        env:
          ZECRETLY_DB_CONNECTION_URI: postgresql://postgres:postgres@localhost:5432/zecretly_test
```

## Contributing

### Adding New Tests
1. Create test files following the naming pattern: `*.api.spec.ts`
2. Use the existing test helpers and data factories
3. Follow the established test structure and cleanup patterns
4. Add comprehensive error handling tests
5. Update this README with new test coverage

### Test Guidelines
- Always clean up created resources
- Use descriptive test names
- Test both success and error scenarios
- Validate response structure and data
- Include performance considerations for critical paths

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check connection string in `.env.test`
   - Verify test database exists

2. **Port Conflicts**
   - Ensure port 3001 is available
   - Check if backend server is already running

3. **Test Timeouts**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity for external API calls

4. **Cleanup Failures**
   - Tests may fail if cleanup encounters errors
   - Manually clean test database if needed

### Getting Help
- Check Playwright documentation: https://playwright.dev/
- Review test logs and traces
- Ensure all dependencies are properly installed
