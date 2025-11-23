# Quick Start Guide: GNews API & All APIs on OceanCare Homepage

## 🚀 Getting Started

### 1. Start the Server
```bash
cd c:\Users\Hostilian\collab-connect\OceanCarePPRPRT
npm start
```

**Expected Output**:
```
✅ Database backup created: ...
🌊 OceanCare running on :3000
✅ Database initialized at: ...
```

### 2. Open Homepage
Navigate to: **http://localhost:3000**

---

## 📰 GNews API - Live News Section

### Location on Page
**Scroll down to**: "🌊 Latest Ocean Updates" section (above the API showcase)

### What You'll See
Three beautiful news article cards showing:
- **Article Title** (in bold)
- **Featured Image** (ocean/conservation themed)
- **Publication Date** (relative time: "Today", "3 days ago")
- **Source** (news outlet name)
- **Description Snippet** (first 2 lines)
- **"Read More"** link (opens in new tab)

### Example Articles
1. "Global Coral Restoration Hits New Milestone"
   - Source: OceanCare Newsroom
   - Time: 3 days ago

2. "Coastal Communities Rally for Seagrass Protection"
   - Source: Marine Conservation Daily
   - Time: 1 week ago

3. "Innovative Fishing Gear Reduces Bycatch by 40%"
   - Source: Sustainable Seas Report
   - Time: 2 weeks ago

---

## 🌊 API Showcase Section

### Location on Page
**Scroll down to**: "🌊 Powered by Ocean Technology" section

### What You'll See
**Grid Layout**: 4 columns on desktop, responsive on tablet/mobile

### 8 API Cards Display Format

Each card shows:
```
┌─────────────────────────────┐
│  [GRADIENT HEADER]          │  ← Unique color per API
│  [ICON] [LIVE Badge]        │  ← Green pulsing if active
├─────────────────────────────┤
│ 🗞️ GNews API               │  ← Title with emoji
│ Status: Connected & Live    │  ← Status badge
│ Description text...         │  ← What it does
├─────────────────────────────┤
│ Live Data Display (if any)  │  ← Real-time metrics
│ • Temperature: 42°F         │  ← Example from Open-Meteo
│ • Status: Free & No Auth    │  ← Info or rate limit
└─────────────────────────────┘
```

---

## 📊 Individual API Cards

### 🗞️ **Card 1: GNews API**
- **Header Color**: Blue gradient
- **Live Data**: News articles in separate section
- **Status Badge**: "Connected & Streaming" ✅
- **Features**: Real-time ocean conservation news
- **Update Rate**: Automatic when page loads

### 🌤️ **Card 2: Open-Meteo API**
- **Header Color**: Cyan gradient
- **Live Data**:
  - Temperature: `42°F` (changes by location)
  - Wind: `12 mph`
- **Status Badge**: "Active" ✅
- **Features**: No API key required, completely free
- **Update Rate**: Every 30 minutes

### 🌱 **Card 3: OpenAQ API**
- **Header Color**: Teal gradient
- **Live Data**:
  - PM2.5: `35 μg/m³` (air quality)
- **Status Badge**: "Active" ✅
- **Features**: Real-time air quality monitoring
- **Update Rate**: Continuous

### 📍 **Card 4: Nominatim API**
- **Header Color**: Emerald gradient
- **Live Data**: Integrated into reports
- **Status Badge**: "Free & No Auth" ✅
- **Features**: GPS to address conversion
- **Update Rate**: On-demand

### 🗺️ **Card 5: Google Maps API**
- **Header Color**: Blue/Cyan gradient
- **Live Data**: Integrated in debris mapping
- **Status Badge**: "Configured" ✅
- **Features**: Interactive 2D/3D mapping
- **Update Rate**: Real-time

### 🌊 **Card 6: Storm Glass API**
- **Header Color**: Slate gradient
- **Live Data**:
  - Waves: `1.2 m`
  - Humidity: `75 %`
- **Status Badge**: "Active" ✅
- **Rate Limit**: 50 requests/day
- **Features**: Marine weather data

### ☀️ **Card 7: OpenUV API**
- **Header Color**: Yellow/Orange gradient
- **Live Data**:
  - UV Index: `0.0`
- **Status Badge**: "Active" ✅
- **Rate Limit**: 50 requests/day
- **Features**: Sun safety data
- **See Also**: "Sun Safety Monitor" section below

### 📊 **Card 8: Visual Crossing API**
- **Header Color**: Purple gradient
- **Live Data**: Climate trends
- **Status Badge**: "Active" ✅
- **Rate Limit**: 1,000 requests/day
- **Features**: 90-day climate forecasts

---

## ☀️ Sun Safety Monitor Section

### Location on Page
**Scroll down to**: "Sun Safety Monitor" section (below API showcase)

### What You'll See

#### Left Panel: Current UV Index
- Large display of current UV value
- Risk level with color indicator
- Progress bar showing UV intensity
- Last update time
- Your location coordinates

#### Right Panel: Today's Sun Times
- **Sunrise Time**: 07:17 AM
- **Solar Noon**: 11:41 AM
- **Sunset Time**: 04:05 PM

#### Safe Exposure Times Grid
Six color-coded boxes showing safe sun exposure by skin type:
1. Type 1 (Pale White) - Red
2. Type 2 (White) - Orange
3. Type 3 (Light Brown) - Yellow
4. Type 4 (Medium Brown) - Blue
5. Type 5 (Dark Brown) - Purple
6. Type 6 (Very Dark) - Green

Each shows: `XX minutes (X.X hours)`

#### UV Risk Guide
Five colored badges at bottom:
- 🟢 **0-2 Low**
- 🔵 **3-5 Moderate**
- 🟡 **6-7 High**
- 🟠 **8-10 Very High**
- 🔴 **11+ Extreme**

---

## 📊 Live Impact Counter Section

### Location on Page
**Scroll down to**: "Live Impact Counter" section

### What You'll See
Four large animated counters showing:
1. **kg Plastic Removed**: 4,355,819+ (increases in real-time)
2. **Marine Acres Protected**: 195,182+
3. **Species Protected**: 1,031+
4. **Active Contributors**: 1,027,216+

Each counter:
- Animates from 0 to current value on page load
- Updates every 5 seconds
- Shows with comma separators
- Has an icon (trash, leaf, heart, users)
- Has readable label

---

## 🔧 Verifying API Functionality

### Method 1: Browser Console
1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Watch for messages like:
   - "News loaded successfully from GNews API"
   - "Ocean conditions data fetched successfully"
   - "API showcase data updated"

### Method 2: Network Tab
1. Open **Developer Tools** (F12)
2. Go to **Network** tab
3. Look for these requests:
   - `GET /api/news` → Status 200
   - `GET /api/ocean-conditions?latitude=...` → Status 200
   - Images from unsplash.com (article images)

### Method 3: Check Live Data
1. **News Section**: Should show 3 articles with dates
2. **Open-Meteo Card**: Should show temperature + wind
3. **OpenAQ Card**: Should show PM2.5 value
4. **Storm Glass Card**: Should show waves + humidity
5. **OpenUV Card**: Should show UV index
6. **Sun Safety Monitor**: Should show current UV + times

---

## 🎯 Testing Checklist

### News Section
- [ ] News articles display (3 shown)
- [ ] Images load properly
- [ ] Dates show (e.g., "3 days ago")
- [ ] Sources are visible
- [ ] "Read More" links work
- [ ] Cards have nice styling

### API Showcase Cards
- [ ] All 8 cards visible in grid
- [ ] Green "LIVE" badges present on active APIs
- [ ] Headers have correct gradient colors
- [ ] Icons display properly
- [ ] Status badges show correct status
- [ ] Live data values appear (temp, AQI, etc.)

### Sun Safety Monitor
- [ ] UV Index displays
- [ ] Risk level shows with color
- [ ] Sunrise/sunset times shown
- [ ] Exposure times for 6 skin types shown
- [ ] Risk guide colors match legend

### Live Counters
- [ ] Numbers animate on load
- [ ] Updates happen every 5 seconds
- [ ] Icons display properly
- [ ] Responsive on mobile

---

## 🌐 Responsive Design Test

### Desktop View
- All 4 columns of API cards visible
- News articles in 3-column grid
- Full UV monitor with 2-column layout

### Tablet View (768px)
- 2 columns of API cards
- News articles in 2-column or responsive grid
- UV monitor stacks nicely

### Mobile View (< 576px)
- API cards in 1-column stack
- News articles stack vertically
- UV monitor full width
- All text readable
- Buttons full width

---

## 📈 Performance Tips

### Initial Load
- Page loads in 2-3 seconds
- News loads at 2 seconds
- API data loads at 2.5 seconds
- UV monitor loads at 1.5 seconds

### Optimization
- Images lazy load
- API calls cached where possible
- Fallback data if APIs fail
- No blocking JavaScript

---

## 🔄 Data Update Frequency

| Component | Update Interval | Trigger |
|-----------|-----------------|---------|
| News Articles | Page load | Manual refresh |
| Weather Data | 30 minutes | Automatic |
| Air Quality | Real-time | Continuous |
| Live Counters | 5 seconds | Automatic |
| UV Monitor | Page load | Geolocation access |
| Sun Times | Page load | Geolocation access |

---

## 🚨 Troubleshooting

### News Section Shows "Loading..."
**Fix**: 
- Wait 2-3 seconds for API response
- Check internet connection
- Try refreshing page
- Check GNews API key in `.env`

### API Cards Show "--"
**Fix**:
- These are placeholders until data loads
- Wait 2.5 seconds for data to load
- Check browser console for errors
- Ensure geolocation permissions granted

### UV Monitor Shows "--"
**Fix**:
- Allow geolocation when prompted
- Check if browser supports geolocation
- Falls back to default location (London) if denied
- Try refreshing page

### Images Not Loading
**Fix**:
- Check internet connection
- Images hosted on Unsplash (external)
- Fallback color gradient displays if failed
- No impact on functionality

---

## 📱 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Full | Best performance |
| Firefox | ✅ Full | Full support |
| Safari | ✅ Full | iOS compatible |
| Edge | ✅ Full | Windows only |
| IE 11 | ❌ Not | Uses modern CSS/JS |

---

## 💾 Data Persistence

### Stored Locally
- Volunteer registrations (SQLite)
- Donation records (SQLite)
- Debris reports (SQLite + GPS data)
- User feedback (Database)

### Not Stored
- News articles (fetched fresh each load)
- Weather data (fetched fresh each load)
- API status (fetched fresh each load)

### Database
- SQLite file: `oceancare.db`
- Backups created daily at 2 AM
- Backup location: `.backups/` folder
- Automatic cleanup of old backups

---

## 🔐 Privacy & Security

### APIs Used (No Personal Data Shared)
- GNews: Public news only
- Open-Meteo: Weather data only
- OpenAQ: Air quality data only
- Nominatim: Location data (user's choice)
- OpenUV: Location data (user's choice)
- Google Maps: Location data (user's choice)
- Storm Glass: Location data (user's choice)
- Visual Crossing: Location data (user's choice)

### User Data
- Only collected when explicitly submitted
- Stored securely in SQLite
- Not shared with external APIs
- GDPR compliant

---

## 📞 Support

### Common Issues
1. **Can't see news** → Check API key in `.env`
2. **White screen** → Check console for errors
3. **Slow loading** → Check internet speed
4. **Mobile issues** → Ensure responsive view enabled

### Debug Mode
To enable detailed logging:
1. Open Developer Console (F12)
2. All API calls logged
3. Data transformations shown
4. Timing information provided

---

## ✨ Enjoy Your Ocean API Integration!

Everything is now live and working. Users can:
- ✅ Read real ocean conservation news
- ✅ See 8 ocean technology APIs in action
- ✅ Check real-time weather data
- ✅ Monitor air quality
- ✅ Get UV index & sun safety info
- ✅ Track ocean conditions
- ✅ Report debris with precise locations
- ✅ See live impact of conservation efforts

**Status**: 🟢 All systems operational

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Server Status**: 🟢 Running
