# 🎯 OceanCare Initiative - Pre-Launch Checklist

**Current Status**: 85% Complete  
**Estimated Time to 100%**: 4-7 hours  
**Recommended Timeline**: Deploy in 1-2 weeks

---

## IMMEDIATE ACTIONS (Do This First)

### Phase 1A: Register API Keys (1-2 hours)

- [ ] **Storm Glass API**
  - Visit: https://stormglass.io/
  - Click "Sign Up" → Create account
  - Verify email
  - Go to Account Settings → API Keys
  - Copy API key
  - Add to `.env`: `STORM_GLASS_API_KEY=<key>`

- [ ] **OpenUV API**
  - Visit: https://openuv.io/
  - Click "Get API Key"
  - Sign up with Google or email
  - Copy API key from dashboard
  - Add to `.env`: `OPENUV_API_KEY=<key>`

- [ ] **Visual Crossing API**
  - Visit: https://www.visualcrossing.com/
  - Click "Sign up"
  - Create account
  - Go to Account → API Tokens
  - Create new token (or copy existing)
  - Add to `.env`: `VISUAL_CROSSING_API_KEY=<key>`

### Phase 1B: Verify Installation (30 minutes)

- [ ] Run: `npm install`
  ```bash
  cd c:\Users\Hostilian\collab-connect\OceanCarePPRPRT
  npm install
  ```

- [ ] Check syntax: `node -c server.js`
  ```bash
  node -c server.js
  # Should output nothing (no errors)
  ```

- [ ] Start server: `npm start`
  ```bash
  npm start
  # Should see: 🌊 OceanCare running on :3000
  ```

- [ ] Verify in browser: http://localhost:3000
  - [ ] Homepage loads
  - [ ] Navigation works
  - [ ] All pages load

---

## TESTING PHASE (2-3 hours)

### Phase 2A: Automated Testing

- [ ] Run test suite: `npm test`
  ```bash
  npm test
  # Target: 21 tests passing
  ```

- [ ] Check coverage
  - [ ] All endpoints tested
  - [ ] Error scenarios covered
  - [ ] Database operations verified

### Phase 2B: Manual Testing - Frontend

**Homepage (index.html)**
- [ ] Click "Get Climate Trends" button
  - [ ] Enter location: "San Francisco"
  - [ ] Should show 90-day temp/precip data
  - [ ] Error message if location not found

- [ ] Check News Feed
  - [ ] Should show 6 ocean conservation articles
  - [ ] Fallback works if API fails

**Debris Reporting (pages/report-debris.html)**
- [ ] Click "Get Location"
  - [ ] Should show current coordinates
  - [ ] Should display ocean conditions
  - [ ] Should display marine weather

- [ ] Submit debris report with valid data
  - [ ] Location: "Santa Monica Beach"
  - [ ] Type: "plastic"
  - [ ] Quantity: "5"
  - [ ] Description: "Plastic bottles near shore"
  - [ ] Should show success message

- [ ] Test validation errors
  - [ ] Try invalid email on form
  - [ ] Try quantity > 10000
  - [ ] Try missing location
  - [ ] Verify error messages clear

**Volunteer Signup (pages/volunteer.html)**
- [ ] Enter valid information
  - [ ] Name, Email, Location
  - [ ] Should display UV index
  - [ ] Should show SPF recommendations

- [ ] Test phone validation
  - [ ] Invalid phone: "123"
  - [ ] Valid phone: "(555) 123-4567"
  - [ ] Error message should be clear

**Donation (pages/how-to-help.html)**
- [ ] Enter donation amount
  - [ ] Valid: "$50"
  - [ ] Invalid: "$5000000"
  - [ ] Invalid: "abc"
  - [ ] Error messages should guide

**Contact (pages/contact.html)**
- [ ] Fill contact form
  - [ ] Name: "John Doe"
  - [ ] Email: "john@example.com"
  - [ ] Message: "Love your work! Keep it up."
  - [ ] Should succeed

- [ ] Test message validation
  - [ ] Too short: "Hi" (needs 10+)
  - [ ] Too long: 5000+ characters
  - [ ] Error should be clear

### Phase 2C: Error Scenario Testing

**API Quota Simulation** (After testing works)
- [ ] Make 51 requests to Storm Glass (limit is 50)
  - [ ] Should get 402 status
  - [ ] Message should say: "quota exceeded... try again tomorrow"

**Timeout Testing**
- [ ] Interrupt network
- [ ] Try API call
- [ ] Should timeout after 5 seconds
- [ ] Message should say: "request timed out"

**Rate Limiting**
- [ ] Make 101 requests in 15 minutes
  - [ ] Request 101 should be blocked
  - [ ] Should get 429 status
  - [ ] Check RateLimit-* headers

**Invalid Coordinates**
- [ ] Try climate trends with Lat > 90
- [ ] Try with Lon > 180
- [ ] Should get 400 status with validation message

### Phase 2D: Mobile Testing

Test on mobile device (smartphone or tablet):
- [ ] [ ] Homepage responsive
- [ ] [ ] Navigation accessible
- [ ] [ ] Forms fill properly
- [ ] [ ] Buttons touch-friendly
- [ ] [ ] No horizontal scroll
- [ ] [ ] Geolocation works
- [ ] [ ] Maps display correctly
- [ ] [ ] All text readable (no tiny fonts)

---

## DATABASE VERIFICATION (30 minutes)

### Phase 3A: Database Operations

- [ ] Submit donation
  - [ ] Check data in oceancare.db
  - [ ] Verify record created

- [ ] Submit volunteer signup
  - [ ] Verify in database

- [ ] Submit debris report
  - [ ] Verify location saved
  - [ ] Verify photo saved

- [ ] Query donor dashboard
  - [ ] GET `/api/donor/your@email.com`
  - [ ] Should show donation history

### Phase 3B: Backup System

- [ ] Check `.backups/` folder
  - [ ] Should contain backup files
  - [ ] Named: `oceancare-TIMESTAMP.db`

- [ ] Verify daily schedule
  - [ ] Initial backup on startup created
  - [ ] Next backup will be at 2 AM tomorrow

- [ ] Test backup recovery
  1. Copy backup: `cp .backups/oceancare-*.db oceancare-test.db`
  2. Verify file exists and has data
  3. Confirm size reasonable (~100KB+)

---

## VALIDATION & SECURITY (1 hour)

### Phase 4A: Validation Tests

Create test script to verify:

```bash
# Test 1: Invalid email
curl -X POST http://localhost:3000/api/donate \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"invalid","amount":50}'
# Should return 400 with email validation message

# Test 2: Amount too high
curl -X POST http://localhost:3000/api/donate \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","amount":2000000}'
# Should return 400 with amount validation message

# Test 3: Rate limiting
for i in {1..101}; do
  curl http://localhost:3000/api/news
done
# Request 101+ should return 429 with rate limit message
```

### Phase 4B: Security Checklist

- [ ] No API keys in code comments
- [ ] No API keys in version control
- [ ] `.env` in `.gitignore`
- [ ] All inputs validated
- [ ] All queries parameterized (SQL injection safe)
- [ ] Error messages don't expose stack traces
- [ ] Rate limiting working
- [ ] Timeout handling in place

### Phase 4C: Code Review

- [ ] All syntax valid: `node -c server.js` ✅
- [ ] No console.error messages critical
- [ ] Proper error handling on all endpoints
- [ ] All validations working
- [ ] Database backups scheduled

---

## PRE-DEPLOYMENT PREPARATION (1 hour)

### Phase 5A: Environment Setup

**For Vercel**:
- [ ] Push code to GitHub
- [ ] Go to vercel.com
- [ ] Import repository
- [ ] Add environment variables:
  - [ ] GNEWS_API_KEY
  - [ ] GOOGLE_MAPS_API_KEY
  - [ ] STORM_GLASS_API_KEY
  - [ ] OPENUV_API_KEY
  - [ ] VISUAL_CROSSING_API_KEY
  - [ ] NODE_ENV=production
- [ ] Deploy

**For Heroku**:
- [ ] Create Heroku app: `heroku create oceancare-initiative`
- [ ] Set env vars: `heroku config:set GNEWS_API_KEY=...`
- [ ] Push: `git push heroku main`

**For Self-Hosted**:
- [ ] Create `.env` on server
- [ ] Copy all files to server
- [ ] Run: `npm install && npm start`
- [ ] Use PM2 for process management

### Phase 5B: Monitoring Setup

- [ ] Check error logs
- [ ] Monitor API usage
- [ ] Track database growth
- [ ] Check backup creation
- [ ] Monitor rate limit hits

### Phase 5C: Performance Check

Before going live:
- [ ] Homepage loads < 3 seconds
- [ ] API calls < 2 seconds
- [ ] Database queries < 100ms
- [ ] No memory leaks
- [ ] Backup system working

---

## LAUNCH CHECKLIST

### Go Live Verification

**24 Hours Before**:
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] API keys verified working
- [ ] Backups running
- [ ] Monitoring configured

**1 Hour Before**:
- [ ] Final syntax check: `node -c server.js`
- [ ] Final test run: `npm test`
- [ ] Server startup: `npm start` (then stop)
- [ ] Notification to team

**At Launch**:
- [ ] Deploy to production
- [ ] Verify site loads: https://yoursite.com
- [ ] Test all major features
- [ ] Monitor error logs
- [ ] Monitor API quotas

**First Week**:
- [ ] Daily error log review
- [ ] Monitor API usage
- [ ] Check backup creation
- [ ] Gather user feedback
- [ ] Monitor performance

---

## POST-LAUNCH OPERATIONS

### Weekly Tasks
- [ ] Review error logs
- [ ] Check API quota usage
- [ ] Verify backups created
- [ ] Monitor performance
- [ ] Check for security alerts

### Monthly Tasks
- [ ] Analyze user data
- [ ] Review donation/volunteer trends
- [ ] Optimize database (analyze/vacuum)
- [ ] Update dependencies: `npm update`
- [ ] Review and archive old debris reports

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Feature planning
- [ ] API cost review
- [ ] Backup retention policy review

---

## TROUBLESHOOTING QUICK GUIDE

| Problem | Solution |
|---------|----------|
| API key not working | Verify key format in .env, check for extra spaces |
| Rate limited | Wait for window reset (15 min general, 1 hour strict) |
| Database error | Restore from .backups folder |
| Port 3000 in use | Change PORT=3001 in .env or kill process |
| Tests failing | Run `npm install` first |
| Timeout on slow API | Already 5 second timeout configured |
| Photo upload fails | Check photo < 5MB |
| Location not found | Try more specific location (city name, landmark) |
| Backup not created | Check .backups folder has write permissions |

---

## SUCCESS CRITERIA

Platform is ready to launch when:

✅ **Functionality**
- [ ] All 8 APIs working
- [ ] All pages responding
- [ ] All forms submitting
- [ ] Database storing data

✅ **Error Handling**
- [ ] API timeouts handled
- [ ] Quota detection working
- [ ] Validation messages clear
- [ ] Error logs clean

✅ **Security**
- [ ] Rate limiting active
- [ ] Input validation passing
- [ ] No exposed secrets
- [ ] Backups running

✅ **Performance**
- [ ] Pages load fast (<3s)
- [ ] APIs respond (<2s)
- [ ] Database queries fast (<100ms)
- [ ] No memory leaks

✅ **Testing**
- [ ] 21 tests passing
- [ ] Manual tests complete
- [ ] Mobile verified
- [ ] Error scenarios tested

---

## ESTIMATED HOURS REMAINING

| Phase | Hours | Notes |
|-------|-------|-------|
| API key registration | 1-2 | Automated signup process |
| Full testing (auto + manual) | 2-3 | Most time spent on manual testing |
| Mobile verification | 1 | Quick check on device |
| Database & backup verification | 0.5 | Quick checks |
| Deployment preparation | 1 | Setting up env vars, configs |
| **Total** | **5-8** | Ready in 1-2 weeks |

---

## SIGN-OFF TEMPLATE

When everything is complete and tested:

```
✅ OceanCare Initiative Launch Readiness Checklist - COMPLETE

Date: January 15, 2025
API Keys Registered: ✅ Storm Glass, OpenUV, Visual Crossing
Test Suite: ✅ 21 tests passing
Mobile Testing: ✅ Verified on device
Security: ✅ Input validation, rate limiting, backups all working
Performance: ✅ All metrics within targets
Error Handling: ✅ Production-ready

Status: APPROVED FOR PRODUCTION DEPLOYMENT
Recommended Deploy Date: [Choose date]
```

---

**Created**: January 15, 2025  
**Purpose**: Ensure successful launch  
**Owner**: OceanCare Team  
**Status**: Ready for execution ✅
