# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline setup for the Zecretly project using GitHub Actions.

## 📋 Overview

The CI/CD pipeline consists of three main workflows:

1. **Main CI/CD Pipeline** (`ci-cd.yml`) - Full pipeline for main branches
2. **Pull Request Checks** (`pr-checks.yml`) - Fast validation for PRs
3. **Nightly Tests** (`nightly-tests.yml`) - Comprehensive testing and security audits

## 🚀 Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Backend Testing (`backend-test`)
- Sets up PostgreSQL test database
- Installs dependencies and Playwright browsers
- Seeds test database
- Runs all API tests using Playwright
- Uploads test results as artifacts

#### Frontend Build (`frontend-build`)
- Installs frontend dependencies
- Runs ESLint for code quality
- Checks Prettier formatting
- Builds the frontend application
- Uploads build artifacts

#### Security Scan (`security-scan`)
- Runs npm audit for both backend and frontend
- Scans for secrets using TruffleHog
- Checks for security vulnerabilities

#### Docker Build (`docker-build`)
- Builds Docker image for backend
- Pushes to Docker Hub (for main/develop branches)
- Uses build cache for optimization

#### Integration Tests (`integration-test`)
- Runs end-to-end integration tests
- Uses Docker Compose for service orchestration
- Tests critical API functionality

#### Deployment Jobs
- **Production**: Deploys to production on `main` branch
- **Staging**: Deploys to staging on `develop` branch

### 2. Pull Request Checks (`pr-checks.yml`)

**Purpose:** Fast feedback for pull requests

**Jobs:**
- **PR Validation**: TypeScript checks, linting, formatting
- **PR API Tests**: Critical API tests only (health, workspaces)
- **Breaking Changes**: Checks for API and database schema changes

### 3. Nightly Tests (`nightly-tests.yml`)

**Schedule:** Every night at 2 AM UTC

**Jobs:**
- **Comprehensive Tests**: Full test suite with extended timeout
- **Performance Tests**: API response time and load testing
- **Security Audit**: Deep security scanning
- **Dependency Check**: Outdated dependency detection

## 🔧 Setup Instructions

### 1. Repository Secrets

Configure the following secrets in your GitHub repository:

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password or access token
```

### 2. Environment Configuration

Create GitHub environments:
- `production` - For production deployments
- `staging` - For staging deployments

### 3. Branch Protection Rules

Set up branch protection for `main` and `develop`:

```yaml
Required status checks:
  - Backend API Tests
  - Frontend Build & Lint
  - Security & Quality Scan

Require branches to be up to date: ✓
Require pull request reviews: ✓
Dismiss stale reviews: ✓
Restrict pushes to matching branches: ✓
```

## 📊 Test Coverage

### Backend API Tests

The pipeline runs comprehensive API tests covering:

- **Health Check API** (`health.api.spec.ts`)
- **Workspaces API** (`workspaces.api.spec.ts`)
- **Collections API** (`collections.api.spec.ts`)
- **Requests API** (`requests.api.spec.ts`)
- **Environments API** (`environments.api.spec.ts`)
- **Request Histories API** (`request-histories.api.spec.ts`)
- **Integration Tests** (`integration.api.spec.ts`)

### Critical Functionalities Tested

1. **Authentication & Authorization**
2. **CRUD Operations** for all entities
3. **Data Validation** using Zod schemas
4. **Error Handling** and edge cases
5. **Database Transactions** and consistency
6. **API Response Formats** and status codes

## 🔒 Security Features

### Automated Security Scanning

1. **Dependency Auditing**
   - npm audit for known vulnerabilities
   - Runs on both backend and frontend

2. **Secret Detection**
   - TruffleHog scans for exposed secrets
   - Prevents credential leaks

3. **Code Quality**
   - ESLint for code quality
   - Prettier for consistent formatting
   - TypeScript strict mode

### Security Best Practices

- Secrets stored in GitHub Secrets
- Environment-specific configurations
- Minimal Docker image permissions
- Database isolation for tests

## 🐳 Docker Integration

### Backend Docker Build

- Multi-stage build for optimization
- Security scanning during build
- Automated tagging strategy:
  - `latest` for main branch
  - `develop` for develop branch
  - SHA-based tags for traceability

### Image Management

- Build cache optimization
- Automatic cleanup of old images
- Registry authentication

## 📈 Performance Monitoring

### Metrics Tracked

1. **Test Execution Time**
2. **Build Duration**
3. **API Response Times**
4. **Database Query Performance**

### Performance Thresholds

- API health check: < 1 second
- Test suite: < 10 minutes
- Build process: < 5 minutes

## 🚨 Failure Handling

### Automatic Retries

- Test failures: 2 retries on CI
- Network timeouts: Built-in retry logic
- Database connection issues: Health checks

### Notification Strategy

- Success: Silent (green checkmarks)
- Failures: GitHub notifications
- Critical failures: Can be extended to Slack/email

## 🔄 Deployment Strategy

### Staging Deployment

**Trigger:** Push to `develop` branch

**Process:**
1. Run all tests
2. Build and push Docker image
3. Deploy to staging environment
4. Run smoke tests
5. Notify team

### Production Deployment

**Trigger:** Push to `main` branch

**Process:**
1. Run full test suite
2. Security scanning
3. Integration tests
4. Build production image
5. Deploy to production
6. Health checks
7. Rollback capability

## 📝 Maintenance

### Regular Tasks

1. **Weekly:**
   - Review test results
   - Check for outdated dependencies
   - Monitor performance metrics

2. **Monthly:**
   - Update base Docker images
   - Review security scan results
   - Optimize build times

3. **Quarterly:**
   - Update GitHub Actions versions
   - Review and update documentation
   - Performance optimization

### Troubleshooting

#### Common Issues

1. **Test Database Connection**
   ```bash
   # Check PostgreSQL service status
   docker-compose -f docker-compose.test.yml ps
   ```

2. **Playwright Browser Issues**
   ```bash
   # Reinstall browsers
   pnpm exec playwright install --with-deps
   ```

3. **Build Cache Issues**
   ```bash
   # Clear Docker build cache
   docker builder prune
   ```

## 🎯 Best Practices

### Code Quality

1. **Write Tests First** - TDD approach
2. **Meaningful Test Names** - Describe what is being tested
3. **Test Isolation** - Each test should be independent
4. **Mock External Dependencies** - Use test doubles

### CI/CD Optimization

1. **Parallel Execution** - Run independent jobs in parallel
2. **Caching Strategy** - Cache dependencies and build artifacts
3. **Fail Fast** - Stop on first critical failure
4. **Resource Management** - Optimize runner usage

### Security

1. **Least Privilege** - Minimal permissions for CI/CD
2. **Secret Rotation** - Regular credential updates
3. **Audit Logs** - Monitor CI/CD activities
4. **Vulnerability Scanning** - Regular security checks

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Testing](https://www.postgresql.org/docs/current/regress.html)

## 🤝 Contributing

When contributing to the CI/CD pipeline:

1. Test changes in a fork first
2. Update documentation for new features
3. Follow the existing naming conventions
4. Add appropriate error handling
5. Consider backward compatibility

---

**Last Updated:** $(date)
**Version:** 1.0.0
