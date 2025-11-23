# 🌞 OpenUV.io Integration & Next Steps - Implementation Guide

**Status**: Ready for Implementation  
**Date**: November 23, 2025  
**API**: OpenUV.io (50 Reqs/Day, Free Tier)  
**Authentication**: API Key: `openuv-1vaqrmibpr6nv-io`

---

## 🎯 Integration Strategy

### What We're Adding

1. **Real-Time UV Index Widget** - Shows current UV levels for your location
2. **UV Forecast Section** - 5-day UV forecast with risk levels
3. **Safe Exposure Times** - Skin type-based sun safety recommendations
4. **Sun Position Data** - Sunrise, sunset, solar noon information
5. **Environmental Dashboard** - Combined ocean + UV data metrics

---

## 🔌 OpenUV.io API Details

### Authentication
```javascript
// API Key provided
const API_KEY = 'openuv-1vaqrmibpr6nv-io';

// Header required for requests
headers: {
  'x-access-token': API_KEY,
  'Content-Type': 'application/json'
}
```

### API Limits & Plan
- **Plan**: Free Startup
- **Daily Limit**: 50 requests/day
- **Monthly Limit**: 1,500 requests
- **Cost**: $15 USD/Month (if upgrade needed)
- **Response Time**: Real-time JSON

### Available Endpoints

#### 1. Get Real-Time UV Index
```
GET https://api.openuv.io/api/v1/uv?lat={latitude}&lng={longitude}&alt={altitude}&dt={datetime}
```

**Response Includes**:
- `uv` - Current UV index (0-11+)
- `uv_max` - Max UV for the day
- `ozone` - Ozone level (Dobson Units)
- `safe_exposure_time` - By skin type (st1-st6)
- `sun_info` - Full sun times and position

#### 2. Get UV Forecast
```
GET https://api.openuv.io/api/v1/forecast
```

#### 3. Get API Statistics
```
GET https://api.openuv.io/api/v1/stat
```

#### 4. Check API Status
```
GET https://api.openuv.io/api/v1/status
```

---

## 📊 UV Index Scale

| UV Index | Level | Risk | Protection |
|----------|-------|------|-----------|
| 0-2 | Low | Minimal | Sunglasses optional |
| 3-5 | Moderate | Moderate | Sunscreen SPF 30+ |
| 6-7 | High | High | Sunscreen SPF 50+, hat |
| 8-10 | Very High | Very High | Avoid sun, full protection |
| 11+ | Extreme | Extreme | Stay indoors |

---

## 🌍 Integration Points

### 1. Add UV Widget to Dashboard
```html
<!-- New section in HTML -->
<section id="uv-dashboard" class="py-20 px-4">
  <!-- Real-time UV display -->
  <!-- Current location UV index
  <!-- Safe exposure times
  <!-- Sun times
</section>
```

### 2. JavaScript Integration
```javascript
// Get user's geolocation
navigator.geolocation.getCurrentPosition(position => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const alt = position.coords.altitude || 0;
  
  // Fetch UV data from API
  fetchUVIndex(lat, lng, alt);
});

// Fetch function
async function fetchUVIndex(lat, lng, alt) {
  const url = `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}&alt=${alt}`;
  
  const response = await fetch(url, {
    headers: {
      'x-access-token': 'openuv-1vaqrmibpr6nv-io'
    }
  });
  
  const data = await response.json();
  displayUVData(data.result);
}
```

### 3. Display Components
```javascript
// Display UV Index with color coding
function displayUVIndex(uv) {
  let color = 'green';
  if (uv > 10) color = 'red';
  else if (uv > 7) color = 'orange';
  else if (uv > 5) color = 'yellow';
  
  // Update UI with color
}

// Display safe exposure times
function displaySafeExposureTimes(safeExposureTime) {
  // Show by skin type (st1-st6)
  // st1 = pale white skin (most sensitive)
  // st6 = dark skin (least sensitive)
}

// Display sun information
function displaySunInfo(sunInfo) {
  // Sunrise, sunset, solar noon
  // Golden hours, twilight times
  // Sun position (azimuth, altitude)
}
```

---

## 🛠️ Implementation Steps

### Step 1: Add Geolocation Permission
```html
<!-- In index.html <head> -->
<meta name="description" content="...">
```

### Step 2: Create UV Widget HTML
```html
<section id="uv-widget" class="py-20 px-4 bg-white">
  <div class="max-w-7xl mx-auto">
    <h2>UV Index Monitor</h2>
    
    <!-- UV Index Display -->
    <div id="uv-display" class="card">
      <h3>Current UV Index</h3>
      <div id="uv-value" class="text-5xl">Loading...</div>
      <div id="uv-risk-level" class="text-lg">--</div>
    </div>
    
    <!-- Sun Times -->
    <div id="sun-times" class="card">
      <h3>Today's Sun Times</h3>
      <div id="sunrise-time">Sunrise: --</div>
      <div id="sunset-time">Sunset: --</div>
      <div id="solar-noon-time">Solar Noon: --</div>
    </div>
    
    <!-- Safe Exposure -->
    <div id="safe-exposure" class="card">
      <h3>Safe Exposure Time</h3>
      <!-- By skin type -->
    </div>
  </div>
</section>
```

### Step 3: Add JavaScript Handler
```javascript
// Initialize UV monitor
function initUVMonitor() {
  // Check browser geolocation support
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const alt = position.coords.altitude || 0;
        
        fetchUVIndex(lat, lng, alt);
      },
      error => {
        console.log('Geolocation error:', error);
        // Use fallback location
        fetchUVIndex(51.5074, -0.1278, 0); // London default
      }
    );
  }
}

// Fetch UV data
async function fetchUVIndex(lat, lng, alt) {
  try {
    const url = `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}&alt=${alt}`;
    
    const response = await fetch(url, {
      headers: {
        'x-access-token': 'openuv-1vaqrmibpr6nv-io'
      }
    });
    
    const data = await response.json();
    
    if (data.result) {
      updateUVDisplay(data.result);
    }
  } catch (error) {
    console.error('UV API error:', error);
  }
}

// Update UI with UV data
function updateUVDisplay(result) {
  const uvIndex = result.uv;
  const uvMax = result.uv_max;
  const sunInfo = result.sun_info;
  const safeExposure = result.safe_exposure_time;
  
  // Update UV Index
  document.getElementById('uv-value').textContent = uvIndex.toFixed(1);
  
  // Update risk level
  let riskLevel = 'Low';
  let riskColor = 'green';
  if (uvIndex > 10) { riskLevel = 'Extreme'; riskColor = 'red'; }
  else if (uvIndex > 7) { riskLevel = 'Very High'; riskColor = 'orange'; }
  else if (uvIndex > 5) { riskLevel = 'High'; riskColor = 'yellow'; }
  else if (uvIndex > 2) { riskLevel = 'Moderate'; riskColor = 'blue'; }
  
  const riskElement = document.getElementById('uv-risk-level');
  riskElement.textContent = riskLevel;
  riskElement.style.color = riskColor;
  
  // Update sun times
  if (sunInfo && sunInfo.sun_times) {
    const times = sunInfo.sun_times;
    document.getElementById('sunrise-time').textContent = 
      `Sunrise: ${new Date(times.sunrise).toLocaleTimeString()}`;
    document.getElementById('sunset-time').textContent = 
      `Sunset: ${new Date(times.sunset).toLocaleTimeString()}`;
    document.getElementById('solar-noon-time').textContent = 
      `Solar Noon: ${new Date(times.solarNoon).toLocaleTimeString()}`;
  }
  
  // Update safe exposure times
  displaySafeExposureTimes(safeExposure);
}

// Display safe exposure times by skin type
function displaySafeExposureTimes(safeExposure) {
  const skinTypes = [
    { type: 'st1', label: 'Type 1 (Pale White)', color: 'red' },
    { type: 'st2', label: 'Type 2 (White)', color: 'orange' },
    { type: 'st3', label: 'Type 3 (Light Brown)', color: 'yellow' },
    { type: 'st4', label: 'Type 4 (Medium Brown)', color: 'blue' },
    { type: 'st5', label: 'Type 5 (Dark Brown)', color: 'purple' },
    { type: 'st6', label: 'Type 6 (Very Dark)', color: 'green' }
  ];
  
  let html = '';
  skinTypes.forEach(skinType => {
    const minutes = safeExposure[skinType.type];
    const hours = (minutes / 60).toFixed(1);
    html += `
      <div class="flex justify-between p-2 border-b">
        <span>${skinType.label}</span>
        <span style="color: ${skinType.color};">${minutes} mins (${hours} hrs)</span>
      </div>
    `;
  });
  
  document.getElementById('safe-exposure').innerHTML += html;
}
```

### Step 4: Error Handling & Fallbacks
```javascript
// Fallback for API errors
const DEFAULT_LOCATIONS = {
  'London': { lat: 51.5074, lng: -0.1278 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Cape Town': { lat: -33.9249, lng: 18.4241 }
};

// Use geolocation or default
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => fetchUVIndex(position.coords.latitude, position.coords.longitude),
    error => {
      console.log('Using default location');
      const london = DEFAULT_LOCATIONS['London'];
      fetchUVIndex(london.lat, london.lng);
    }
  );
}
```

---

## 📈 Dashboard Integration

### Combined Metrics View
```
Ocean Health Dashboard
├─ Plastic Removed (Live Counter)
├─ Marine Acres Protected (Live Counter)
├─ Active Contributors (Live Counter)
└─ UV Index Monitor (NEW)
    ├─ Current UV Index
    ├─ Risk Level & Color
    ├─ Safe Exposure Times
    └─ Sun Times
```

### Environmental Impact Calculation
```javascript
// Combine UV exposure + Ocean health
const environmentalScore = {
  oceanHealth: calculateOceanMetrics(),
  uvExposure: getUVRiskLevel(),
  safeZones: calculateSafeZones(), // Low UV + Clean water
  combinedImpact: combineMetrics()
};
```

---

## 🔐 Security Considerations

### Protect API Key
```javascript
// IMPORTANT: API key should be in backend proxy
// DO NOT expose in frontend code in production

// Option 1: Backend Proxy (Recommended)
// Frontend calls: /api/uv?lat=X&lng=Y
// Backend adds API key header and forwards to OpenUV

// Option 2: Environment Variables
// Store in .env file
// Access via backend API

// Option 3: Current Implementation (Development Only)
// Fine for development/testing
// Add proxy for production
```

### CORS Handling
```javascript
// If CORS error, set up backend proxy
// Backend route: GET /api/uv-data
// Backend forwards to OpenUV with API key
```

---

## 📱 Mobile Optimization

### Location Permissions
```javascript
// Request location permission on app load
function requestLocationPermission() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        // User allowed
        fetchUVIndex(position.coords.latitude, position.coords.longitude);
      },
      error => {
        // User denied - use IP geolocation fallback
        // Or default location
      }
    );
  }
}
```

### Responsive UV Widget
```css
/* Mobile first */
.uv-widget {
  display: grid;
  gap: 1rem;
}

/* Tablet+ */
@media (min-width: 768px) {
  .uv-widget {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

/* Desktop+ */
@media (min-width: 1024px) {
  .uv-widget {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
  }
}
```

---

## ⚡ Performance Optimization

### Caching
```javascript
// Cache UV data for 30 minutes
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cachedData = null;
let cacheTime = null;

function getCachedUVData(lat, lng) {
  const now = Date.now();
  
  if (cachedData && (now - cacheTime) < CACHE_DURATION) {
    return cachedData;
  }
  
  return null;
}

function setCachedUVData(data) {
  cachedData = data;
  cacheTime = Date.now();
}
```

### Request Rate Limiting
```javascript
// Respect 50 requests/day limit
const MAX_REQUESTS = 50;
const RESET_TIME = 24 * 60 * 60 * 1000; // 24 hours
let requestCount = 0;
let lastReset = Date.now();

function canMakeRequest() {
  const now = Date.now();
  
  if (now - lastReset > RESET_TIME) {
    requestCount = 0;
    lastReset = now;
  }
  
  return requestCount < MAX_REQUESTS;
}

function incrementRequestCount() {
  requestCount++;
}
```

---

## 🎯 Next Implementation Steps

### Phase 1: Basic Integration (Week 1)
1. [ ] Add UV widget HTML to index.html
2. [ ] Implement geolocation JavaScript
3. [ ] Fetch UV data from API
4. [ ] Display UV index with color coding
5. [ ] Show safe exposure times

### Phase 2: Enhanced Features (Week 2)
1. [ ] Add sun times display
2. [ ] Implement 5-day forecast
3. [ ] Add risk level warnings
4. [ ] Create location selector
5. [ ] Add caching & optimization

### Phase 3: Mobile & Accessibility (Week 3)
1. [ ] Mobile-responsive design
2. [ ] Location permission handling
3. [ ] Accessibility improvements
4. [ ] Error handling & fallbacks
5. [ ] Performance optimization

### Phase 4: Backend Integration (Week 4)
1. [ ] Create backend proxy for API key
2. [ ] Move API key to environment variables
3. [ ] Implement rate limiting
4. [ ] Add request logging
5. [ ] Deploy to production

---

## 📊 Data Flow

```
User Visits Website
        ↓
Check Location Permission
        ↓
Get User Location (Latitude, Longitude)
        ↓
Check Cache for Recent Data
        ↓
Call OpenUV.io API
        ↓
Receive UV Data + Sun Times
        ↓
Update UI with Color Coding
        ↓
Display Safe Exposure Times
        ↓
Cache Data for 30 Minutes
        ↓
Auto-update Every 30 Mins
```

---

## 🌍 Real-World Use Cases

### 1. Beach Safety
- Show safe times to visit beach
- UV index for cleanup events
- Sun protection recommendations

### 2. Volunteer Planning
- Schedule cleanup events during low UV
- Show safe exposure times
- Provide sun protection tips

### 3. Environmental Education
- Teach about UV index
- Explain sun safety
- Relate to ocean health

### 4. Impact Tracking
- Combined ocean + UV metrics
- Environmental health score
- Seasonal trends

---

## 📝 Example API Response

```json
{
  "result": {
    "uv": 0.5347,
    "uv_time": "2025-11-23T12:48:00.192Z",
    "uv_max": 0.6683,
    "uv_max_time": "2025-11-23T11:48:20.287Z",
    "ozone": 332.5,
    "safe_exposure_time": {
      "st1": 312,
      "st2": 374,
      "st3": 499,
      "st4": 623,
      "st5": 997,
      "st6": 1870
    },
    "sun_info": {
      "sun_times": {
        "sunrise": "2025-11-23T07:33:10.555Z",
        "sunset": "2025-11-23T16:03:30.018Z",
        "solarNoon": "2025-11-23T11:48:20.287Z",
        "goldenHourEnd": "2025-11-23T08:29:12.072Z",
        "goldenHour": "2025-11-23T15:07:28.502Z"
      },
      "sun_position": {
        "azimuth": 0.2599,
        "altitude": 0.2950
      }
    }
  }
}
```

---

## ✅ Ready for Implementation

The website is ready for UV Index integration. All the infrastructure is in place:

✅ **HTML Structure** - Ready for new sections  
✅ **CSS Framework** - Tailwind ready for styling  
✅ **JavaScript Architecture** - Modular design for new features  
✅ **API Documentation** - Complete OpenUV.io guide  
✅ **Implementation Plan** - Step-by-step instructions  

---

## 📞 Next Steps

**Immediate** (Within 1 day):
1. Review this implementation guide
2. Add UV widget HTML section to index.html
3. Implement basic geolocation + API fetch

**Short-term** (Within 1 week):
1. Complete UV display with color coding
2. Add safe exposure times
3. Test on mobile devices

**Medium-term** (Within 2 weeks):
1. Add forecast functionality
2. Implement caching
3. Add location selector

**Long-term** (Within 1 month):
1. Backend proxy setup
2. Production security
3. Advanced features

---

**Status**: ✅ READY FOR UV INDEX INTEGRATION  
**Complexity**: Medium (JavaScript + API)  
**Estimated Time**: 2-3 hours for basic implementation  
**Estimated Time**: 8 hours for full implementation  

---

*For questions or support, refer to the OpenUV.io documentation: https://www.openuv.io/uvindex*
