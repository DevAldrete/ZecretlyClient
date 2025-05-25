# CI/CD Setup Guide

This guide will help you set up the complete CI/CD pipeline for the Zecretly project.

## 🚀 Quick Start

### 1. Repository Setup

1. **Push the CI/CD files to your repository:**
   ```bash
   git add .github/
   git add scripts/
   git add SETUP_CI_CD.md
   git add .github/CI_CD_DOCUMENTATION.md
   git commit -m "Add comprehensive CI/CD pipeline"
   git push origin main
   ```

### 2. GitHub Repository Configuration

#### A. Configure Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

```
DOCKER_USERNAME     # Your Docker Hub username
DOCKER_PASSWORD     # Your Docker Hub password or access token
```

#### B. Create Environments

Go to Settings → Environments and create:

1. **production**
   - Add protection rules (require reviewers)
   - Add environment secrets if needed

2. **staging**
   - Add protection rules (optional)
   - Add environment secrets if needed

#### C. Branch Protection Rules

Go to Settings → Branches and add protection for `main` and `develop`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging

**Required status checks:**
- `Backend API Tests`
- `Frontend Build & Lint`
- `Security & Quality Scan`

### 3. Local Development Setup

#### A. Install Prerequisites

```bash
# Install pnpm (if not already installed)
npm install -g pnpm@10.11.0

# Install Docker and Docker Compose
# Follow instructions for your OS at https://docs.docker.com/get-docker/
```

#### B. Test Local CI

```bash
# Make the script executable (if not already done)
chmod +x scripts/ci-local.sh

# Run all CI checks locally
./scripts/ci-local.sh

# Or run specific checks
./scripts/ci-local.sh backend   # Backend tests only
./scripts/ci-local.sh frontend # Frontend tests only
./scripts/ci-local.sh security # Security checks only
./scripts/ci-local.sh docker   # Docker build test only
```

## 📋 Workflow Overview

### Automatic Triggers

1. **Pull Request to main/develop:**
   - Runs PR validation checks
   - Fast feedback for developers
   - Blocks merge if tests fail

2. **Push to develop:**
   - Full CI/CD pipeline
   - Deploys to staging environment
   - Runs integration tests

3. **Push to main:**
   - Full CI/CD pipeline
   - Deploys to production environment
   - Requires all tests to pass

4. **Nightly (2 AM UTC):**
   - Comprehensive test suite
   - Performance testing
   - Security audits
   - Dependency checks

### Manual Triggers

- All workflows can be triggered manually from GitHub Actions tab
- Use "Run workflow" button for testing or emergency deployments

## 🔧 Customization

### Adding New Tests

1. **Backend API Tests:**
   ```bash
   # Add new test files in backend/tests/
   # Follow naming convention: *.api.spec.ts
   ```

2. **Frontend Tests:**
   ```bash
   # Add test scripts to frontend/package.json
   # Update .github/workflows/ci-cd.yml if needed
   ```

### Deployment Configuration

#### Staging Deployment

Edit `.github/workflows/ci-cd.yml` in the `deploy-staging` job:

```yaml
- name: Deploy to staging
  run: |
    echo "🚀 Deploying to staging..."
    # Add your staging deployment commands here
    # Examples:
    # kubectl apply -f k8s/staging/
    # aws ecs update-service --cluster staging --service zecretly
    # docker-compose -f docker-compose.staging.yml up -d
```

#### Production Deployment

Edit `.github/workflows/ci-cd.yml` in the `deploy-production` job:

```yaml
- name: Deploy to production
  run: |
    echo "🚀 Deploying to production..."
    # Add your production deployment commands here
    # Examples:
    # kubectl apply -f k8s/production/
    # aws ecs update-service --cluster production --service zecretly
    # terraform apply -var-file="production.tfvars"
```

### Notification Setup

#### Slack Notifications

Add to your workflow files:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Discord Notifications

```yaml
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. PostgreSQL Connection Issues

```bash
# Check if PostgreSQL service is running
docker-compose -f docker-compose.test.yml ps

# Restart the database
./scripts/ci-local.sh backend
```

#### 2. Playwright Browser Issues

```bash
# Reinstall browsers
cd backend
pnpm exec playwright install --with-deps
```

#### 3. Docker Build Failures

```bash
# Clear Docker cache
docker builder prune

# Test build locally
cd backend
docker build -t test-build .
```

#### 4. Permission Denied on Scripts

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Getting Help

1. **Check the logs:**
   - Go to GitHub Actions tab
   - Click on failed workflow
   - Expand failed steps to see detailed logs

2. **Run locally:**
   ```bash
   ./scripts/ci-local.sh
   ```

3. **Check documentation:**
   - Read `.github/CI_CD_DOCUMENTATION.md`
   - Check individual workflow files for comments

## 📊 Monitoring

### Key Metrics to Watch

1. **Test Success Rate:** Should be > 95%
2. **Build Time:** Should be < 10 minutes
3. **Deployment Frequency:** Track how often you deploy
4. **Mean Time to Recovery:** How quickly you fix issues

### GitHub Actions Usage

- Monitor your GitHub Actions minutes usage
- Optimize workflows to reduce costs
- Use caching effectively

## 🔄 Maintenance

### Weekly Tasks

- [ ] Review failed builds and fix issues
- [ ] Check for outdated dependencies
- [ ] Monitor performance metrics

### Monthly Tasks

- [ ] Update base Docker images
- [ ] Review and update documentation
- [ ] Optimize build times
- [ ] Security audit review

### Quarterly Tasks

- [ ] Update GitHub Actions versions
- [ ] Review CI/CD strategy
- [ ] Performance optimization
- [ ] Team training on new features

## 🎯 Best Practices

1. **Keep workflows fast:** Optimize for quick feedback
2. **Use caching:** Cache dependencies and build artifacts
3. **Fail fast:** Stop on first critical failure
4. **Monitor costs:** Keep an eye on GitHub Actions usage
5. **Document changes:** Update docs when modifying workflows
6. **Test locally:** Use `./scripts/ci-local.sh` before pushing

## 📚 Next Steps

1. **Set up monitoring:** Add application monitoring (e.g., Sentry, DataDog)
2. **Add performance tests:** Implement load testing with k6 or Artillery
3. **Infrastructure as Code:** Add Terraform or CloudFormation
4. **Advanced security:** Add SAST/DAST scanning
5. **Multi-environment:** Add more environments (QA, UAT)

---

**Need help?** Check the full documentation in `.github/CI_CD_DOCUMENTATION.md` or create an issue in the repository.
