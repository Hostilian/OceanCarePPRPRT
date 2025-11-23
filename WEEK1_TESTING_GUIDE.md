# 🧪 Week 1 Testing & Verification Guide

**Timeline**: After API keys are registered  
**Estimated Duration**: 2-3 hours  
**Current Status**: ⏳ READY FOR EXECUTION

---

## Phase 1: Automated Validation (15 minutes)

### Step 1: Run Setup Verification

```bash
node launch-setup-helper.js
```

**What it checks**:
- ✅ .env file exists and has no placeholders
- ✅ All dependencies installed (npm modules)
- ✅ All server files present
- ✅ All test files present
- ✅ All frontend pages present
- ✅ Database and backup systems ready

**Expected Output**:
```
═══ Summary ═══

Checks passed: 6/6

✅ All checks passed! You are ready to:
  1. Run the validation script: node validate-api-keys.js
  2. Run the test suite: npm test
  3. Start the development server: npm start
```

**If checks fail**:
- Ensure .env has no "your_" placeholder text
- Run `npm install` if dependencies missing
- Check file paths - all files should be in project root

---

## Phase 2: API Validation (15 minutes)

### Step 2: Test All APIs

```bash
node validate-api-keys.js
```

**What it does**:
- Tests Storm Glass API (marine weather)
- Tests OpenUV API (UV index)
- Tests Visual Crossing API (climate trends)
- Tests Google Maps API (mapping)
- Tests GNews API (news feed)
- Provides sample data from each

**Expected Output** (if all keys registered):
```
═══ Testing Storm Glass API ═══
ℹ️  Fetching weather data from Storm Glass...
✅ Storm Glass API working correctly
   🌊 Latest data: {"time":"2025-11-23T...", "waveHeight": ...}

═══ Testing OpenUV API ═══
ℹ️  Fetching UV index data from OpenUV...
✅ OpenUV API working correctly
   ☀️  Current UV Index: 3.5

═══ Testing Visual Crossing API ═══
ℹ️  Fetching climate data from Visual Crossing...
✅ Visual Crossing API working correctly
   🌍 Forecast days available: 7

═══ Testing Google Maps API ═══
✅ Google Maps API working correctly

═══ Testing GNews API ═══
✅ GNews API working correctly

═══ SUMMARY ═══
✅ All APIs validated successfully
```

**If any API shows ❌**:
1. Wait 1-2 minutes (key may not be activated yet)
2. Verify key is correct in .env file
3. Check internet connection
4. Run again: `node validate-api-keys.js`

**If still failing after 2 attempts**:
1. Re-check API key registration (see API_KEY_REGISTRATION_STEPS.md)
2. Ensure key was activated in the API dashboard
3. Verify no extra spaces in .env file
4. Copy the key again and update .env

---

## Phase 3: Test Suite Execution (30 minutes)

### Step 3: Run Full Test Suite

```bash
npm test
```

**What it tests**:
- **API Endpoints** (15 total):
  - News feed generation
  - Weather data fetching
  - Donations processing
  - Volunteer registration
  - Debris reporting
  - Contact form handling
  - Data retrieval endpoints
  - Marine weather (Storm Glass)
  - UV index (OpenUV)
  - Climate trends (Visual Crossing)
  
- **Data Validation**:
  - Form input validation
  - Database constraint checking
  - Error handling
  
- **Infrastructure**:
  - Rate limiting
  - Database persistence
  - Error fallbacks

**Expected Output** (21 tests):
```
PASS  server.test.js
  ✓ GET /api/news-feed returns news articles (45ms)
  ✓ GET /api/weather returns weather data (123ms)
  ✓ POST /api/donate validates donation data (12ms)
  ✓ POST /api/donate rejects missing amount (8ms)
  ✓ POST /api/volunteer registers volunteer (15ms)
  ✓ POST /api/volunteer stores location data (18ms)
  ✓ POST /api/report-debris stores debris report (22ms)
  ✓ GET /api/debris-reports returns stored reports (35ms)
  ✓ GET /api/marine-weather returns Storm Glass data (234ms)
  ✓ GET /api/uv-index returns UV data (167ms)
  ✓ GET /api/climate-trends returns Visual Crossing data (289ms)
  ✓ POST /api/contact validates contact form (10ms)
  ✓ GET /api/reverse-geocode returns address (98ms)
  ✓ GET /api/maps-proxy serves Google Maps API (45ms)
  ✓ POST /api/login validates donor login (15ms)
  ✓ GET /api/donations returns donation history (28ms)
  ✓ Rate limiting blocks excessive requests (156ms)
  ✓ Rate limiting allows requests within limits (18ms)
  ✓ Form validation catches SQL injection attempts (8ms)
  ✓ Error handling returns 500 for server errors (12ms)
  ✓ Error handling returns 404 for missing routes (5ms)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        8.234s
```

**Test Execution Time**: Usually 8-15 seconds

### Interpreting Test Results

#### ✅ All 21 tests pass
- **Congratulations!** Your application is ready for Week 2
- All endpoints working correctly
- All APIs responding
- Database functioning
- No blocking issues

#### ⏳ 1-2 tests fail
**Common causes and solutions**:

**Test**: `GET /api/marine-weather returns Storm Glass data`
- **Cause**: Storm Glass key not activated or rate-limited
- **Solution**: Wait 2 minutes, verify key activation, retry

**Test**: `GET /api/uv-index returns UV data`
- **Cause**: OpenUV key not activated
- **Solution**: Check OpenUV dashboard, click Activate if needed

**Test**: `GET /api/climate-trends returns Visual Crossing data`
- **Cause**: Visual Crossing key not working
- **Solution**: Verify key in .env, re-check registration, retry

**Test**: `POST /api/volunteer registers volunteer`
- **Cause**: Database issue or missing field
- **Solution**: Check database isn't locked, ensure oceancare.db can be written

**Test**: `Rate limiting blocks excessive requests`
- **Cause**: Rate limiter not triggered
- **Solution**: This is low-priority, will be fixed in Week 2

#### ❌ >5 tests fail
- **Stop and troubleshoot**:
  1. Run `node launch-setup-helper.js` to check setup
  2. Run `node validate-api-keys.js` to check APIs
  3. Check console output for specific error messages
  4. Verify .env file has all keys (no placeholders)
  5. Delete oceancare.db and let it recreate: `rm oceancare.db && npm test`
  6. If still failing, see "Troubleshooting" section below

---

## Phase 4: Manual Testing in Browser (1.5-2 hours)

### Step 4: Start Development Server

```bash
npm start
```

**Expected Output**:
```
🌊 OceanCare Initiative server running on http://localhost:3000
✅ Database initialized
✅ Backups scheduled
```

**Leave terminal running** - server stays active while you test

### Step 5: Test in Browser

Open a new browser window and visit: **http://localhost:3000**

#### Test 4.1: Homepage

**URL**: http://localhost:3000

**Test Checklist**:
- [ ] Page loads without errors (check DevTools console - F12)
- [ ] Navigation menu visible and clickable
- [ ] News feed displays 6+ articles
  - Check article titles visible
  - Check article links work
- [ ] Weather widget shows current conditions
  - Check temperature, wind, description display
- [ ] Climate trends section visible
  - Check 90-day forecast displayed
- [ ] "How to Help" section visible
  - Check donation and volunteer call-to-action buttons
- [ ] No red error messages in console (F12 > Console tab)
- [ ] Page loads in <3 seconds

**Issues to Document**:
- Any text not displaying correctly
- Any API data missing or showing "Loading..."
- Any error messages in console
- Page taking >5 seconds to load

---

#### Test 4.2: Debris Report Page

**URL**: http://localhost:3000/pages/report-debris.html

**Test Checklist**:
- [ ] Page loads completely
- [ ] Form fields visible:
  - [ ] Debris description textarea
  - [ ] Location input
  - [ ] Photo upload area
  - [ ] Report button
- [ ] Geolocation button works:
  - [ ] Click "Use My Location" button
  - [ ] Browser prompts for location permission
  - [ ] Allow location access
  - [ ] Latitude/Longitude fields populate
- [ ] Marine weather data displays:
  - [ ] Wave height shown
  - [ ] Water temperature shown
  - [ ] Wind conditions shown
  - [ ] Water conditions advisory visible
- [ ] Form validation works:
  - [ ] Try submitting empty form - should show error
  - [ ] Fill in minimal data (description, location)
  - [ ] Click "Report Debris"
  - [ ] Success message should appear
  - [ ] Form should reset
- [ ] Check DevTools for errors (F12 > Console)

**Storm Glass Integration Verification**:
- Open DevTools Network tab (F12 > Network)
- Perform a debris report submission
- Look for request to `api/marine-weather`
- Should show `200` response code
- Response should include: `waveHeight`, `windSpeed`, `waterTemp`

**Issues to Document**:
- Weather data not appearing
- Location not populating
- Form submission failing
- Unexpected console errors

---

#### Test 4.3: Volunteer Signup Page

**URL**: http://localhost:3000/pages/volunteer.html

**Test Checklist**:
- [ ] Page loads completely
- [ ] Form fields visible:
  - [ ] Full Name field
  - [ ] Email field
  - [ ] Location input
  - [ ] Date/Time selection
  - [ ] Submit button
- [ ] Location input works:
  - [ ] Type a location (e.g., "San Francisco, CA")
  - [ ] Field accepts input
- [ ] UV Index displays dynamically:
  - [ ] Section "UV Index Information" visible
  - [ ] Current UV index number shown
  - [ ] UV safety level category shown (e.g., "Moderate")
  - [ ] SPF recommendation displayed
  - [ ] Precautions listed for volunteers
- [ ] Form validation:
  - [ ] Try submitting empty form - should reject
  - [ ] Fill in: Name, Email, Location
  - [ ] Select a date and time
  - [ ] Click "Register as Volunteer"
  - [ ] Success message appears
  - [ ] Form resets
- [ ] No console errors

**OpenUV Integration Verification**:
- Open DevTools Network tab (F12 > Network)
- Change the location input field
- Look for request to `api/uv-index`
- Should show `200` response
- Response should include: `uv` (number), `category`, `spf`

**Issues to Document**:
- UV data not showing
- SPF recommendations missing
- Form not submitting
- Validation not working

---

#### Test 4.4: Donation/How-to-Help Page

**URL**: http://localhost:3000/pages/how-to-help.html

**Test Checklist**:
- [ ] Page loads
- [ ] Donation form visible:
  - [ ] Amount input field
  - [ ] Currency selector (if applicable)
  - [ ] Donate button
- [ ] Impact calculator:
  - [ ] Shows default values when page loads
  - [ ] Dynamically updates as you change amount
  - [ ] Displays:
    - [ ] CO₂ reduction estimate (kg)
    - [ ] Marine life saved estimate (number)
    - [ ] Reef area protected (m²)
- [ ] Form validation:
  - [ ] Try submitting $0 donation - should reject
  - [ ] Enter $50 donation
  - [ ] Click "Donate"
  - [ ] Success message appears
  - [ ] Message shows donation amount
  - [ ] Impact metrics shown
- [ ] No console errors

**Issues to Document**:
- Impact calculator not updating
- Form submission failing
- Validation not working
- Visual issues with formatting

---

#### Test 4.5: Contact Page

**URL**: http://localhost:3000/pages/contact.html

**Test Checklist**:
- [ ] Page loads
- [ ] Form fields visible:
  - [ ] Name field
  - [ ] Email field
  - [ ] Subject field
  - [ ] Message textarea
  - [ ] Submit button
- [ ] Form validation:
  - [ ] Try submitting empty - should reject
  - [ ] Fill in all fields with test data
  - [ ] Click "Send Message"
  - [ ] Success message appears
  - [ ] Form resets
- [ ] No console errors

---

#### Test 4.6: Other Pages

Quick verification - just ensure they load:
- [ ] Team page: http://localhost:3000/pages/team.html
- [ ] Projects page: http://localhost:3000/pages/projects.html
- [ ] Login page: http://localhost:3000/pages/login.html

**For each page**:
- [ ] Page loads without errors
- [ ] No broken images
- [ ] Content displays properly
- [ ] Navigation works

---

## Phase 5: Documentation & Results

### Create Test Results Document

After completing all tests, document the results:

**File**: `WEEK1_TEST_RESULTS.md`

```markdown
# Week 1 Test Results - November 23-24, 2025

## Automated Tests
- Setup Helper: 6/6 checks passed ✅
- API Validation: 5/5 APIs working ✅
- Test Suite: 21/21 tests passed ✅

## Manual Testing
- Homepage: ✅ All sections working
- Debris Report: ✅ Storm Glass integration verified
- Volunteer: ✅ OpenUV integration verified
- Donation: ✅ Impact calculator working
- Contact: ✅ Form submission working
- Other Pages: ✅ All loading correctly

## Performance
- Average API response time: [record time]
- Page load time: [record time]
- Database operations: [record observations]

## Issues Found
[List any issues discovered]

## Recommendations for Week 2
[List any optimizations or fixes needed]
```

---

## Troubleshooting Reference

### Test Suite Errors

#### Error: "Cannot find module 'express'"
```bash
# Solution: Install dependencies
npm install
```

#### Error: "ENOENT: no such file or directory, open 'oceancare.db'"
```bash
# Solution 1: Let server create the database
npm start
# Wait 2-3 seconds
# Stop server (Ctrl+C)
npm test

# Solution 2: If still failing, reset database
rm oceancare.db
npm test
```

#### Error: "EADDRINUSE :::3000"
```bash
# Problem: Port 3000 already in use
# Solution: Kill process using port 3000
# On Windows Command Prompt:
netstat -ano | findstr :3000
# Look for PID number, then:
taskkill /PID [PID] /F

# Or use different port:
PORT=3001 npm start
```

#### Error: "SQLITE_CANTOPEN"
```bash
# Problem: Database file is locked
# Solution: Delete database and reset
rm oceancare.db
rm -rf .backups
npm start
# Wait for database to initialize
npm test
```

### Browser Testing Issues

#### "ReferenceError: Cannot read property 'X' of undefined"
- Check F12 console for full error
- Usually means API didn't return expected data
- Solution: Run `node validate-api-keys.js` to debug API

#### Page loads but shows "Loading..." forever
- Check Network tab in DevTools (F12 > Network)
- Look for failed requests (red color)
- Click on failed request to see error details
- Usually API key or network issue

#### Form submits but nothing happens
- Check DevTools Console (F12 > Console)
- Look for error messages
- Check Network tab for failed POST request
- May need to restart server

#### Geolocation not working
- Browser must allow location access
- Some browsers block on HTTP (not HTTPS)
- Try allowing permission when prompted
- Check that location is actually being requested in Network tab

---

## Success Criteria for Week 1 Completion

✅ **All Automated Tests Pass**:
- Setup helper: 6/6
- API validation: 5/5 APIs working
- Test suite: 21/21 tests

✅ **Manual Testing Complete**:
- All 7 pages load without errors
- All forms can submit data
- All integrations work (Storm Glass, OpenUV, Visual Crossing)
- No blocking console errors

✅ **Performance Acceptable**:
- Pages load in <3 seconds
- APIs respond in <2 seconds
- No database errors

✅ **Documentation Complete**:
- Test results documented
- Any issues noted
- Ready for Week 2 QA

---

**Next Steps**: When all tests pass, you're ready to move to Week 2 (Quality Assurance & Security)

**Need help?** Check troubleshooting sections above or review error messages carefully - they usually explain what's wrong.
