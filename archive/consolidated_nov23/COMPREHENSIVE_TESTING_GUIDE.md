# 🧪 COMPREHENSIVE TESTING & VALIDATION GUIDE

**Date**: November 23, 2025  
**Status**: Ready for testing with demo data  
**Version**: 1.0 (Complete Test Suite)

---

## 📋 OVERVIEW

This guide covers:
1. **Automated Testing** - Run npm test to validate all endpoints
2. **Manual Feature Testing** - Test each page in browser
3. **API Validation** - Verify all 8 APIs are responding
4. **Database Verification** - Confirm SQLite persistence
5. **Error Handling** - Test error scenarios
6. **Performance** - Check response times

**Total Testing Time**: 45-60 minutes

---

## PART 1: AUTOMATED TEST SUITE

### Prerequisites
```bash
# Verify you're in project root
cd c:\Users\Hostilian\collab-connect\OceanCarePPRPRT

# Verify dependencies installed
npm list jest
npm list supertest
```

### Run Full Test Suite

```bash
# Terminal 1: Start server (keep running)
npm start

# Expected output:
# ✅ OceanCare running on :3000
# ✅ Database initialized
# ✅ All rate limiters active
```

```bash
# Terminal 2: Run tests
npm test

# Expected output:
# PASS  server.test.js
# ✓ OceanCare API - Comprehensive Test Suite (21 tests)
# ✓ News endpoints ......................... 4/4 passed
# ✓ Donation endpoints ..................... 2/2 passed
# ✓ Volunteer endpoints .................... 3/3 passed
# ✓ Debris report endpoints ................ 4/4 passed
# ✓ Geocoding endpoints .................... 2/2 passed
# ✓ UV Index endpoints ..................... 2/2 passed
# ✓ Climate trends endpoints ............... 2/2 passed
#
# Tests:       21 passed, 0 failed
# Snapshots:   0 total
# Time:        2.456 s
```

### Test Results Interpretation

**All 21 tests pass ✅**:
- All API endpoints working
- Fallback/demo data functioning
- Error handling correct
- Rate limiting active
- Database saving data

**If tests fail**:
1. Check `.env` file for invalid keys
2. Verify no "your_" placeholders
3. See "Troubleshooting" section below

---

## PART 2: MANUAL FEATURE TESTING

### Test Setup

**Open Browser**:
```
http://localhost:3000
```

**Check Console for Errors**:
- Press `F12` (Developer Tools)
- Click "Console" tab
- Look for red error messages
- Green/info logs are OK

---

### TEST 1: Homepage (`/`)

#### Test 1.1: Page Loads
- [ ] Homepage loads without blank screen
- [ ] Navigation menu visible
- [ ] Hero section displays (large banner)
- [ ] No errors in console (F12)

#### Test 1.2: News Section
- [ ] News section visible below hero
- [ ] 6 news cards appear with:
  - [ ] Article title
  - [ ] Description
  - [ ] Publication date
  - [ ] Source (usually "OceanCare" or news site)
- [ ] Each card is clickable (links to article)

**Test news loading**:
```javascript
// In browser console (F12 → Console)
fetch('/api/news').then(r => r.json()).then(d => console.log(d))
```

Expected: `{ articles: [{title: "...", ...}, ...] }`

#### Test 1.3: Impact Calculator
- [ ] "Calculate Impact" section visible
- [ ] Input field shows placeholder: "Enter donation amount"
- [ ] Donation amount input works
- [ ] Impact calculation displays correctly
  - $10 = X kg of plastic removed
  - $50 = X kg of plastic removed
  - $100 = X kg of plastic removed

#### Test 1.4: Climate Trends Section (NEW)
- [ ] Climate Trends section visible (teal background)
- [ ] Location input field visible
- [ ] "Get Climate Trends" button visible
- [ ] Enter location: "San Francisco"
- [ ] Click button
- [ ] Results appear showing:
  - [ ] Average Temperature (°C)
  - [ ] Total Precipitation (mm)
  - [ ] Climate Trend (Warming/Cooling/Stable)
  - [ ] Color-coded metric cards

**Test climate trends endpoint**:
```javascript
// In browser console
fetch('/api/climate-trends?latitude=37.7749&longitude=-122.4194')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected: Climate data with temperature, precipitation, trend

---

### TEST 2: Volunteer Page (`/pages/volunteer.html`)

#### Test 2.1: Page Loads
- [ ] Page loads fully
- [ ] "Volunteer Signup Form" visible
- [ ] Form fields display:
  - [ ] Name input
  - [ ] Email input
  - [ ] Location input
  - [ ] "Get Forecast" button
- [ ] No console errors (F12)

#### Test 2.2: Forecast Feature
- [ ] Enter name: "John Doe"
- [ ] Enter email: "john@example.com"
- [ ] Enter location: "Santa Monica"
- [ ] Click "Get Forecast"
- [ ] Loading spinner appears briefly
- [ ] Forecast results display

#### Test 2.3: Forecast Results
Expected to show:
- [ ] Current ocean conditions:
  - [ ] Temperature
  - [ ] Wind speed
  - [ ] Wave height
  - [ ] Humidity
- [ ] UV Index Box (NEW):
  - [ ] UV Index number (0-15)
  - [ ] Risk level: GREEN (low), YELLOW (moderate), RED (high)
  - [ ] SPF recommendation
  - [ ] Safe exposure time
  - [ ] Color matches risk level
- [ ] Week forecast:
  - [ ] 7 day cards
  - [ ] Each shows date, temp range, conditions
  - [ ] Count of ideal cleanup days

**Test UV Index endpoint**:
```javascript
// In browser console
fetch('/api/uv-index?latitude=34.0195&longitude=-118.4912')
  .then(r => r.json())
  .then(d => console.log(d))
```

Expected: 
```json
{
  "success": true,
  "uv": {
    "index": 7,
    "recommendation": "MODERATE - Use SPF 30+ sunscreen",
    "riskLevel": "yellow"
  }
}
```

#### Test 2.4: Form Validation
- [ ] Leave name empty, click "Get Forecast" → Error shows
- [ ] Leave email empty → Error shows
- [ ] Enter invalid email → Error shows
- [ ] Leave location empty → Error shows
- [ ] All validation works correctly

---

### TEST 3: Debris Report Page (`/pages/report-debris.html`)

#### Test 3.1: Page Loads
- [ ] Page loads fully
- [ ] "Report Debris" heading visible
- [ ] Map container visible (gray area)
- [ ] Form section below map
- [ ] No console errors

#### Test 3.2: Geolocation Feature
- [ ] Browser shows location permission popup
- [ ] Click "Allow"
- [ ] Map center changes to your location (small marker)
- [ ] "Ocean Conditions" card populates:
  - [ ] Temperature
  - [ ] Wind speed
  - [ ] Wave height
  - [ ] Humidity
  - [ ] Air quality indicator

**Check geolocation**:
```javascript
// In browser console
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos.coords.latitude, pos.coords.longitude),
  err => console.log(err)
)
```

#### Test 3.3: Map Display
- [ ] Google Map visible (shows satellite/terrain)
- [ ] Map shows your location
- [ ] Red debris markers visible (if any data exists)
- [ ] Click marker → Info window shows:
  - [ ] Debris type
  - [ ] Quantity (kg)
  - [ ] Date reported
  - [ ] Location

#### Test 3.4: Marine Weather (Storm Glass)
- [ ] Marine Weather box shows (blue gradient):
  - [ ] Wave Height (meters)
  - [ ] Swell Direction (degrees)
  - [ ] Water Temperature (°C)
- [ ] Data displays correctly

**Test marine weather**:
```javascript
// In browser console
fetch('/api/marine-weather?latitude=34.0195&longitude=-118.4912')
  .then(r => r.json())
  .then(d => console.log(d))
```

#### Test 3.5: Report Debris Form
- [ ] Type field shows dropdown:
  - [ ] Plastic
  - [ ] Metal
  - [ ] Glass
  - [ ] Other
- [ ] Quantity input field works (numbers only)
- [ ] Location input field works
- [ ] "Report Debris" button visible
- [ ] Fill form:
  - Type: "Plastic"
  - Quantity: "25"
  - Location: "Santa Monica Beach"
- [ ] Click "Report"
- [ ] Success message shows: "Debris reported successfully"

#### Test 3.6: Form Validation
- [ ] Try submitting empty form → Error shows
- [ ] Try quantity with letters → Rejected
- [ ] All validations work

#### Test 3.7: Statistics Panel
- [ ] Debris statistics display:
  - [ ] Total reports
  - [ ] Most common type
  - [ ] Total kg reported
- [ ] Numbers update when you add reports
- [ ] Stats persist (check after page refresh)

---

### TEST 4: Other Pages

#### Test 4.1: Team Page (`/pages/team.html`)
- [ ] Page loads
- [ ] Team member cards display
- [ ] Images load
- [ ] All content visible

#### Test 4.2: How to Help Page (`/pages/how-to-help.html`)
- [ ] Page loads
- [ ] Instructions display clearly
- [ ] Call-to-action buttons work

#### Test 4.3: Login Page (`/pages/login.html`)
- [ ] Form displays
- [ ] Email field works
- [ ] Password field works
- [ ] Submit button functional

#### Test 4.4: Contact Page (if exists)
- [ ] Contact form displays
- [ ] Fields: name, email, message
- [ ] Submit works

---

## PART 3: API VALIDATION

### Test All 8 APIs

Use this script in browser console (F12 → Console):

```javascript
// API Validation Script
const apis = [
  {
    name: 'GNews',
    url: '/api/news',
    expected: 'articles'
  },
  {
    name: 'Open-Meteo',
    url: '/api/ocean-conditions-cached?latitude=34&longitude=-118',
    expected: 'temperature'
  },
  {
    name: 'OpenAQ',
    url: '/api/ocean-conditions-cached?latitude=34&longitude=-118',
    expected: 'aqi'
  },
  {
    name: 'Nominatim',
    url: '/api/geocode-location?latitude=34&longitude=-118',
    expected: 'location'
  },
  {
    name: 'Google Maps',
    url: '/api/get-maps-key',
    expected: 'apiKey'
  },
  {
    name: 'Storm Glass',
    url: '/api/marine-weather?latitude=34&longitude=-118',
    expected: 'waveHeight'
  },
  {
    name: 'OpenUV',
    url: '/api/uv-index?latitude=34&longitude=-118',
    expected: 'uv'
  },
  {
    name: 'Visual Crossing',
    url: '/api/climate-trends?latitude=34&longitude=-118',
    expected: 'climateTrends'
  }
];

// Test each API
async function validateAPIs() {
  console.log('🧪 Testing all 8 APIs...\n');
  
  for (const api of apis) {
    try {
      const res = await fetch(api.url);
      const data = await res.json();
      
      if (data.success === false) {
        console.log(`⚠️  ${api.name}: API responded but with error: ${data.message}`);
      } else if (api.expected in data || api.expected in (data[Object.keys(data)[0]] || {})) {
        console.log(`✅ ${api.name}: Working (found '${api.expected}')`);
      } else {
        console.log(`⚠️  ${api.name}: Responding but expected field not found`);
      }
    } catch (error) {
      console.log(`❌ ${api.name}: ERROR - ${error.message}`);
    }
  }
}

// Run validation
validateAPIs();
```

**Expected Output**:
```
✅ GNews: Working
✅ Open-Meteo: Working
✅ OpenAQ: Working
✅ Nominatim: Working
✅ Google Maps: Working
✅ Storm Glass: Working
✅ OpenUV: Working (Demo Mode OK)
✅ Visual Crossing: Working (Demo Mode OK)
```

---

## PART 4: DATABASE VERIFICATION

### Test Data Persistence

#### Test 4.1: Add Debris Report
1. Go to `/pages/report-debris.html`
2. Fill debris form:
   - Type: "Plastic"
   - Quantity: "50"
   - Location: "Test Beach"
3. Click "Report"
4. See success message

#### Test 4.2: Check Database
```bash
# In terminal (with server running)
# Install sqlite3 if needed:
npm install -g sqlite3

# Open database
sqlite3 oceancare.db

# Check debris reports
SELECT * FROM debris_reports;

# Should show your recent report with:
# - type: "Plastic"
# - quantity: 50
# - location: "Test Beach"
# - created_at: (recent timestamp)

# Exit
.quit
```

#### Test 4.3: Verify Persistence
1. Refresh browser page (Ctrl+R)
2. Allow geolocation again
3. Map should still show your reported debris
4. Statistics should still show your report
5. This confirms **data persists** ✅

#### Test 4.4: Check Backups
```bash
# List backup directory
dir ".backups"

# Should show backup files like:
# oceancare-2025-11-23T14-30-45.db
# oceancare-2025-11-23T13-15-22.db

# Backups created daily at 2 AM
```

---

## PART 5: PERFORMANCE TESTING

### Response Time Validation

```javascript
// In browser console - test response times

async function testPerformance() {
  const endpoints = [
    '/api/news',
    '/api/ocean-conditions-cached?latitude=34&longitude=-118',
    '/api/marine-weather?latitude=34&longitude=-118',
    '/api/uv-index?latitude=34&longitude=-118',
    '/api/climate-trends?latitude=34&longitude=-118'
  ];

  console.log('📊 Performance Test Results\n');
  
  for (const endpoint of endpoints) {
    const start = performance.now();
    const res = await fetch(endpoint);
    const end = performance.now();
    
    const time = (end - start).toFixed(0);
    const speed = time < 500 ? '🟢 Fast' : time < 1000 ? '🟡 OK' : '🔴 Slow';
    
    console.log(`${speed} ${endpoint}: ${time}ms`);
  }
}

testPerformance();
```

**Expected Results**:
- Most endpoints: 🟢 < 500ms
- Some with demo data: 🟡 < 1000ms
- None should exceed 2000ms

---

## PART 6: ERROR HANDLING TESTS

### Test Invalid Inputs

#### Test 6.1: Invalid Coordinates
```javascript
// Should return error
fetch('/api/uv-index?latitude=999&longitude=999')
  .then(r => r.json())
  .then(d => console.log(d))
// Expected: { success: false, message: "Invalid coordinates..." }
```

#### Test 6.2: Missing Parameters
```javascript
// Should return error
fetch('/api/climate-trends?latitude=34')  // missing longitude
  .then(r => r.json())
  .then(d => console.log(d))
// Expected: { success: false, message: "..." }
```

#### Test 6.3: Rate Limiting
```javascript
// Spam requests to test rate limiting
for (let i = 0; i < 150; i++) {
  fetch('/api/news');
}
// After 100 requests, should get 429 Too Many Requests
```

---

## PART 7: CHECKLIST

### Automated Tests
- [ ] npm test shows 21/21 passing
- [ ] No timeout errors
- [ ] All endpoints covered
- [ ] Coverage > 80%

### Homepage
- [ ] Loads without errors
- [ ] News section displays 6 articles
- [ ] Impact calculator works
- [ ] Climate Trends section works
- [ ] All buttons clickable

### Volunteer Page
- [ ] Form loads and validates
- [ ] Forecast feature works
- [ ] UV Index displays (with colors)
- [ ] SPF recommendations show
- [ ] Week forecast shows

### Debris Report
- [ ] Map loads (Google Maps visible)
- [ ] Geolocation works
- [ ] Ocean conditions display
- [ ] Marine weather shows
- [ ] Report form submits
- [ ] Data persists in database
- [ ] Statistics update

### All 8 APIs
- [ ] GNews API working
- [ ] Open-Meteo API working
- [ ] OpenAQ API working
- [ ] Nominatim API working
- [ ] Google Maps API working
- [ ] Storm Glass API working (✅ with key)
- [ ] OpenUV API working (Demo if no key)
- [ ] Visual Crossing API working (Demo if no key)

### Database
- [ ] SQLite database created
- [ ] Data persists after refresh
- [ ] Backups created
- [ ] Old backups deleted

### Performance
- [ ] Most responses < 500ms
- [ ] No responses > 2000ms
- [ ] Page loads smooth

### Error Handling
- [ ] Invalid coords → error
- [ ] Missing params → error
- [ ] Rate limiting works
- [ ] Graceful degradation (demo data)

---

## RESULTS SUMMARY

When all tests pass, you can say:

✅ **Infrastructure**: All endpoints working  
✅ **APIs**: All 8 integrated (with graceful demos)  
✅ **Database**: Persistent, backed up  
✅ **Frontend**: All pages functional  
✅ **Performance**: Response times acceptable  
✅ **Error Handling**: Robust  
✅ **User Features**: Complete  

**Status**: READY FOR DEPLOYMENT 🚀

---

## TROUBLESHOOTING

### Tests fail: "API key not configured"
- Check `.env` file has no `your_` text
- Keys should have actual values, not placeholders
- Restart server after .env changes

### API responses show "Demo Mode"
- This is OK! Means API working but key missing
- Register the key at appropriate site
- Update `.env` and restart

### Map not loading
- Check Google Maps key in `.env`
- Verify key has Maps permission enabled
- Check browser console for errors

### Data not persisting
- Check database exists: `ls oceancare.db`
- Check filesystem permissions
- Try clearing browser cache

### Response times are slow
- Server might be slow to start
- Check System Monitor for CPU/Memory usage
- Restart server if needed

---

**Testing Guide Complete** ✅

Proceed to deployment once all tests pass!

