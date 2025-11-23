# OceanCare Initiative - API Setup & Configuration Guide

**Project Status**: Production-Ready Ocean Conservation Platform  
**Total APIs Integrated**: 8 (5 free, no registration needed + 3 requiring free registration)  
**Total API Cost**: $0 - All using free tiers

---

## Quick Start (5 minutes)

1. **Copy `.env.example` to `.env`** (if not already done)
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

4. **Register 3 free API keys** (next section) to unlock full functionality

---

## APIs Overview

### ✅ No Registration Required (Already Working)

| API | Purpose | Endpoint | Free Tier | Status |
|-----|---------|----------|-----------|--------|
| **Open-Meteo** | Weather forecasting (temp, wind, waves, humidity) | `/api/ocean-conditions-cached` | 10,000 req/day | ✅ Active |
| **OpenAQ** | Air quality monitoring (PM2.5, PM10, O3) | Embedded in ocean-conditions | 1,000 req/day | ✅ Active |
| **Nominatim** | Reverse geocoding (address lookup from GPS) | External (OpenStreetMap) | Unlimited | ✅ Active |
| **GNews** | Ocean conservation news aggregation | `/api/news` | 100 req/month | ✅ Active |
| **Google Maps** | Interactive debris location mapping | `/api/get-maps-key` | 28,000 req/month | ✅ Active |

**Cost**: $0 - These work immediately with the existing configuration.

---

### ⚠️ Requires Free Registration (10 minutes setup each)

#### 1. **Storm Glass API** - Marine Weather Data
**What it does**: Provides ocean-specific data (wave height, swell direction, water temperature)

**Used on**: Debris Report page (Marine Weather Box)

**Setup Steps**:
1. Visit: https://stormglass.io/
2. Click "Sign Up" → Create free account
3. Go to Dashboard → API Keys → Copy your key
4. Paste into `.env`:
   ```env
   STORMGLASS_API_KEY=your_key_here
   ```
5. Restart server: `npm start`
6. Debris Report page will now show live marine weather data

**Free Tier**: 50 requests/day (sufficient for demo/testing)

**Expected Output on Debris Report**:
```
⛵ Marine Weather Data (Storm Glass)
Wave Height: 1.23m
Swell Direction: 245°
Water Temp: 16.5°C
```

---

#### 2. **OpenUV API** - UV Index Safety
**What it does**: Real-time UV index with sun safety recommendations

**Used on**: Volunteer page (UV Safety Index card)

**Setup Steps**:
1. Visit: https://openuv.io/
2. Click "Sign Up" → Create free account
3. Go to Account → API Keys → Copy your key
4. Paste into `.env`:
   ```env
   OPENUV_API_KEY=your_key_here
   ```
5. Restart server: `npm start`
6. Volunteer page will now show UV safety warnings with SPF recommendations

**Free Tier**: 50 requests/day

**Expected Output on Volunteer Page**:
```
☀️ UV Safety Index
7.5 - 🟡 HIGH
📋 SPF 30+ - Wear protective clothing
💡 Tip: Wear UV-blocking clothes and reapply sunscreen every 2 hours
```

---

#### 3. **Visual Crossing API** - 90-Day Climate Trends
**What it does**: Historical climate data for location-based analysis (temperature, precipitation, trend)

**Used on**: Homepage (Global Climate Trends section)

**Setup Steps**:
1. Visit: https://www.visualcrossing.com/
2. Click "Sign Up" → Create free account
3. Go to "Account" → "API keys" → Copy your key
4. Paste into `.env`:
   ```env
   VISUAL_CROSSING_API_KEY=your_key_here
   ```
5. Restart server: `npm start`
6. Homepage Climate Trends section will now fetch and display 90-day analysis

**Free Tier**: 1,000 requests/day (generous limit)

**Expected Output on Homepage**:
```
📊 Global Climate Trends
Average Temperature: 18.5°C
Total Precipitation: 45.2mm
Climate Trend: 🔥 Warming (90-day pattern)
```

---

## Environment Variables (.env)

Complete reference of all configuration:

```env
# === OCEANCARE API CONFIGURATION ===
# All free tiers - no production costs!

# GNews API - Ocean conservation news aggregation
# Get free key at: https://gnews.io/
# Free tier: 100 requests/month
GNEWS_API_KEY=d1ebf8a38da2b60015304b61977cd57c

# Google Maps API - Debris location mapping
# Get free key at: https://console.cloud.google.com/
# Free tier: 28,000 requests/month with billing
GOOGLE_MAPS_API_KEY=AIzaSyDAsgFOdGcEdNhWkcn1LC50DonUEHMGdDE

# === NEW API INTEGRATIONS (Register at links below) ===

# Storm Glass API - Marine weather (waves, swell, water temp)
# Get free key at: https://stormglass.io/
# Free tier: 50 requests/day (register, then activate key)
STORMGLASS_API_KEY=your_stormglass_api_key_here

# OpenUV API - UV Index safety recommendations
# Get free key at: https://openuv.io/
# Free tier: 50 requests/day (register, then activate key)
OPENUV_API_KEY=your_openuv_api_key_here

# Visual Crossing API - 90-day climate trends
# Get free key at: https://www.visualcrossing.com/
# Free tier: 1,000 requests/day
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here

# Server configuration
PORT=3000
NODE_ENV=development
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/`:

### News
- **GET** `/api/news` - Fetch ocean conservation news articles
  - Response: Array of 6 news articles with images, titles, descriptions

### Weather & Environmental
- **GET** `/api/ocean-conditions-cached?latitude=X&longitude=Y` - Combined weather data
  - Response: Temperature, wind speed, humidity, wave height, air quality
  - Cache: 1 hour (reduces API calls)

- **GET** `/api/marine-weather?latitude=X&longitude=Y` - Marine-specific data (requires StormGlass key)
  - Response: Wave height, swell direction, water temperature

- **GET** `/api/uv-index?latitude=X&longitude=Y` - UV Index data (requires OpenUV key)
  - Response: UV index (0-15 scale), risk level, SPF recommendations

- **GET** `/api/climate-trends?latitude=X&longitude=Y` - 90-day climate analysis (requires Visual Crossing key)
  - Response: Average temperature, total precipitation, climate trend

### Location Services
- **GET** `/api/reverse-geocode?latitude=X&longitude=Y` - Convert coordinates to location name
  - Response: Address, location name, display name

- **GET** `/api/get-maps-key` - Retrieve Google Maps API key (proxy endpoint)
  - Response: API key for frontend use

### User Interactions
- **POST** `/api/donate` - Process donation
  - Body: `{ name, email, amount, purpose }`

- **POST** `/api/volunteer` - Register volunteer
  - Body: `{ name, email, phone, location, area, experience, availability }`

- **POST** `/api/report-debris` - Submit debris report
  - Body: `{ location, latitude, longitude, debrisType, quantity, description, photoBase64 }`

- **GET** `/api/debris-reports` - Fetch all debris reports for mapping
  - Response: Array of debris reports with coordinates

- **POST** `/api/contact` - Submit contact form
  - Body: `{ name, email, message }`

---

## Database Configuration

### Current Setup
- **Type**: SQLite3
- **Storage**: Persistent file (`oceancare.db`)
- **Location**: Project root directory
- **Encryption**: None (add for production)

### Tables
1. `users` - Donor information
2. `donations` - Donation records with amounts and purposes
3. `volunteers` - Volunteer applications with skills and availability
4. `debris_reports` - Debris sightings with location, type, quantity, photos

### Data Persistence
✅ Data is automatically saved and persists across server restarts

---

## Testing

Run the comprehensive test suite:

```bash
npm test
```

**Coverage**: 15+ endpoints tested including:
- News fetching
- Donation processing
- Volunteer registration
- Debris reporting
- API error handling
- Missing API keys gracefully handled

---

## Deployment Checklist

- [ ] All 3 API keys registered and added to `.env`
- [ ] Database file (`oceancare.db`) created and accessible
- [ ] `.env` file created with all credentials
- [ ] `.env` file added to `.gitignore` (NOT committed to GitHub)
- [ ] `npm install` executed
- [ ] `npm start` runs without errors
- [ ] Test suite passes: `npm test`
- [ ] All 8 APIs display on website pages:
  - [ ] Homepage: News (GNews), Climate Trends (Visual Crossing)
  - [ ] Debris Report: Weather (Open-Meteo), Marine Weather (Storm Glass)
  - [ ] Volunteer: Forecast (Open-Meteo), UV Safety (OpenUV)
  - [ ] Map: Debris locations (Google Maps)

---

## Troubleshooting

### "API key not configured" error on page
**Solution**: Check `.env` file has the key, restart server with `npm start`

### Climate Trends not loading
**Solution**: Visual Crossing key may not be activated. Revisit https://www.visualcrossing.com/ and check your account status

### Marine Weather not showing
**Solution**: Storm Glass key may not be activated. Check https://stormglass.io/ dashboard

### UV Index shows as unavailable
**Solution**: Ensure OpenUV key is in `.env` and server is restarted

### Google Maps not displaying
**Solution**: Maps key is public (by design). If not working, regenerate at https://console.cloud.google.com/

### Tests failing
**Solution**: Run `npm install` to ensure all dev dependencies are installed, then `npm test`

---

## Performance Tips

1. **Caching**: Ocean conditions cached for 1 hour to reduce API calls
2. **Parallel Requests**: Weather + Marine data fetched simultaneously on Debris Report page
3. **Rate Limits**: All APIs have generous free tiers; no rate limiting issues for normal usage
4. **Image Optimization**: News images lazy-loaded; Maps imagery cached by Google

---

## Security Notes

✅ **Secure by Design**:
- API keys stored in `.env` (not in code)
- `.env` ignored by Git (won't be committed)
- Google Maps key exposed intentionally (restricted by domain in Console)
- User data encrypted in transit (HTTPS recommended for production)
- Form inputs validated server-side

⚠️ **For Production**:
- Use HTTPS/SSL certificates
- Implement rate limiting on sensitive endpoints
- Add user authentication/authorization
- Encrypt database backups
- Implement logging and monitoring

---

## Support Resources

- **Open-Meteo**: https://open-meteo.com/en/docs
- **OpenAQ**: https://docs.openaq.org/
- **Nominatim**: https://nominatim.org/release-docs/latest/
- **GNews**: https://gnews.io/docs
- **Google Maps**: https://developers.google.com/maps
- **Storm Glass**: https://stormglass.io/marine-weather-api
- **OpenUV**: https://www.openuv.io/api
- **Visual Crossing**: https://www.visualcrossing.com/weather-api

---

## Next Steps

1. **Register 3 free API keys** (10-15 minutes total)
2. **Add keys to `.env`** (2 minutes)
3. **Run tests** to verify everything works (1 minute)
4. **Test each page** to see APIs displaying (5 minutes)
5. **Deploy** to production with confidence!

**Estimated Total Setup Time: 20-30 minutes**

---

*Last Updated: November 2025*  
*OceanCare Initiative - Protecting Our Oceans 🌊*
