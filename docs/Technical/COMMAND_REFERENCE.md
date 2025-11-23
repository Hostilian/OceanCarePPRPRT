# 🚀 OceanCare Implementation - Command Reference

**Quick lookup for all commands you'll need during the 3-4 week implementation**

---

## Phase 1: API Registration & Validation (Week 1)

### Environment Setup
```bash
# Verify Node.js is installed
node --version

# Verify npm is installed
npm --version

# Check all dependencies installed
npm list --depth=0

# Verify server syntax (no errors)
node -c server.js

# Load environment and check
node -e "require('dotenv').config(); console.log('Env loaded:', Object.keys(process.env).length, 'variables')"

# Check specific API keys loaded
node -e "require('dotenv').config(); console.log('API Keys:', Object.keys(process.env).filter(k => k.includes('API')))"
```

### API Key Validation
```bash
# Validate all API keys are working
node validate-api-keys.js

# Test individual endpoints after API keys added
curl http://localhost:3000/api/news
curl http://localhost:3000/api/climate-trends
curl http://localhost:3000/api/marine-weather
curl http://localhost:3000/api/uv-index
```

### Testing
```bash
# Run full test suite
npm test

# Run tests with longer timeout (for slow networks)
npm test -- --testTimeout=20000

# Run tests with detailed output
npm test -- --verbose

# Run specific test file
npm test -- server.test.js

# Check test coverage
npm test -- --coverage

# Watch mode (re-run on file change)
npm test -- --watch
```

---

## Phase 1: Server Operations (Week 1)

### Starting & Stopping
```bash
# Start development server
npm start

# Start server (alternative)
npm run dev

# Check if port 3000 is in use (Windows)
netstat -ano | findstr :3000

# Kill process on port 3000 (Windows)
taskkill /PID <PID> /F

# Kill process on port 3000 (Mac/Linux)
lsof -i :3000
kill -9 <PID>
```

### Database Operations
```bash
# Verify database is initialized
ls oceancare.db

# Check database size
dir oceancare.db

# Backup database manually
node -e "require('./server.js')" &  # Start server, then interrupt

# View database tables (if sqlite3 CLI installed)
sqlite3 oceancare.db ".tables"
sqlite3 oceancare.db ".schema"
```

---

## Phase 2: Manual Testing (Week 2)

### API Endpoint Testing with curl

```bash
# Test homepage
curl http://localhost:3000/

# Test news endpoint
curl http://localhost:3000/api/news

# Test debris reports list
curl http://localhost:3000/api/debris-reports

# Test reverse geocoding
curl http://localhost:3000/api/reverse-geocode?lat=37.7749&lng=-122.4194

# Test ocean conditions (requires coordinates)
curl http://localhost:3000/api/ocean-conditions-cached?lat=37.7749&lng=-122.4194

# Test donation (POST)
curl -X POST http://localhost:3000/api/donate \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","amount":50}'

# Test volunteer (POST)
curl -X POST http://localhost:3000/api/volunteer \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","phone":"555-123-4567","location":"San Francisco"}'

# Test contact (POST)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Smith","email":"bob@example.com","subject":"Help","message":"How can I help the ocean?"}'

# Test debris report (POST) - simple version
curl -X POST http://localhost:3000/api/report-debris \
  -H "Content-Type: application/json" \
  -d '{"type":"plastic","quantity":5,"latitude":37.7749,"longitude":-122.4194,"description":"Plastic bags"}'
```

### Performance Testing
```bash
# Simple load test (10 requests)
for i in {1..10}; do curl -s http://localhost:3000/api/news > /dev/null; done; echo "Done"

# Time a request
curl -w "Total time: %{time_total}s\n" http://localhost:3000/api/news

# Check response headers
curl -i http://localhost:3000/api/news
```

---

## Phase 3: Deployment (Week 3)

### GitHub Setup (Required for Vercel)
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "OceanCare initiative - ready for deployment"

# Check status
git status

# List commits
git log --oneline

# Create remote (replace with your GitHub URL)
git remote add origin https://github.com/USERNAME/OceanCarePPRPRT.git

# Push to GitHub
git push -u origin main

# Verify push
git remote -v
```

### Pre-Deployment Checklist
```bash
# Final syntax check
node -c server.js

# Final test run
npm test

# Check all dependencies
npm list --depth=0

# Verify .env is NOT in git (security check)
git status | grep .env  # Should show nothing

# Check .gitignore includes .env
cat .gitignore | grep env

# Final server start (Ctrl+C to stop)
npm start
```

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Check project status
vercel projects list
```

### Heroku Deployment (Alternative)
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create oceancare-initiative

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GNEWS_API_KEY=your_key
heroku config:set GOOGLE_MAPS_API_KEY=your_key
heroku config:set STORMGLASS_API_KEY=your_key
heroku config:set OPENUV_API_KEY=your_key
heroku config:set VISUAL_CROSSING_API_KEY=your_key

# Push code
git push heroku main

# View logs
heroku logs --tail

# Check app status
heroku apps
```

---

## Monitoring & Debugging (Ongoing)

### Error Checking
```bash
# Get all errors in workspace
npm test 2>&1 | grep -i error

# Check server logs (if running)
# Use Vercel dashboard or Heroku logs command above

# List all npm scripts available
npm run
```

### Maintenance
```bash
# Update all packages
npm update

# Check for security vulnerabilities
npm audit

# Fix security issues automatically
npm audit fix

# Clean npm cache
npm cache clean --force

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Git Commands (Ongoing)
```bash
# Check git status
git status

# View recent commits
git log --oneline -10

# Create a new branch for features
git checkout -b feature/my-feature

# Switch back to main
git checkout main

# Merge feature into main
git merge feature/my-feature

# Push updates
git push origin main

# Pull latest changes
git pull origin main
```

---

## Useful Aliases (Optional)

Add these to `.bashrc`, `.zshrc`, or create as batch scripts for Windows:

```bash
# Quick test
alias test-app="npm test"

# Quick start
alias start-app="npm start"

# Quick API validation
alias validate-api="node validate-api-keys.js"

# Quick syntax check
alias check-syntax="node -c server.js"

# Quick deployment prep
alias deploy-prep="npm test && git status && npm list --depth=0"
```

**For Windows cmd, create batch files instead:**

```batch
REM test.bat
@echo off
npm test

REM start.bat
@echo off
npm start

REM validate.bat
@echo off
node validate-api-keys.js
```

---

## Troubleshooting Commands

### Port 3000 Already In Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux - Find and kill process
lsof -i :3000
kill -9 [PID_NUMBER]

# Check if port is free now
netstat -ano | findstr :3000  # Windows (should be empty)
lsof -i :3000  # Mac/Linux (should be empty)
```

### API Key Issues
```bash
# Verify keys are in .env
cat .env | grep API

# Check they're being loaded
node -e "require('dotenv').config(); console.log('STORMGLASS_API_KEY:', process.env.STORMGLASS_API_KEY)"

# Verify format (no extra spaces/quotes)
node -e "require('dotenv').config(); const k = process.env.STORMGLASS_API_KEY; console.log('Length:', k.length, 'Starts:', k.substring(0, 10))"
```

### Dependencies Not Found
```bash
# Reinstall everything
npm install

# Verify specific package
npm list express
npm list express-rate-limit
npm list sqlite3

# Check if there are missing packages
npm ls --depth=0
```

### Tests Not Running
```bash
# Check test file exists
ls server.test.js

# Run with verbose output
npm test -- --verbose

# Run single test file
npm test server.test.js

# Run with more details
npm test -- --detectOpenHandles
```

---

## File Organization Commands

### View Project Structure
```bash
# List files
dir

# List with details
dir /s

# Tree view (if available)
tree

# Show only .js files
dir /s *.js

# Show only .md files (documentation)
dir /s *.md
```

### Backup Before Major Changes
```bash
# Create backup of entire project
robocopy . .backup /e  # Windows
cp -r . .backup  # Mac/Linux

# Create git backup (best practice)
git commit -m "Backup before major changes"
git push origin main
```

---

## Summary: Commands by Phase

### **Week 1** (API Registration)
```bash
npm start              # Start server
npm test               # Run tests
node validate-api-keys.js  # Validate APIs
node -c server.js      # Check syntax
```

### **Week 2** (Testing)
```bash
npm test               # Main test command
curl http://localhost:3000/api/news  # Test endpoints
npm test -- --coverage  # Coverage report
```

### **Week 3** (Deployment)
```bash
npm test               # Final test
npm start              # Final check
git push origin main   # Push to GitHub
vercel                 # Deploy to Vercel
```

### **Week 4+** (Operations)
```bash
npm audit              # Security check
npm update             # Update packages
vercel logs            # Check production logs
npm test               # Regression testing
```

---

**Keep this file handy during implementation! Bookmark the commands you use most.**
