# API Registration Guide - Week 1, Day 1

Complete these steps in order to register all 3 required APIs for OceanCare Initiative launch.

## 1. Storm Glass API
**Estimated Time**: 15-20 minutes
**Free Tier Quota**: 50 requests/day
**URL**: https://stormglass.io/

### Steps:
1. Visit https://stormglass.io/
2. Click "Sign Up" (top right)
3. Enter email and create password
4. Verify email address
5. Complete profile setup
6. Navigate to Dashboard → API Keys
7. Create new API key (name: "OceanCare-Primary")
8. Copy the API key
9. **Save to notepad temporarily**

### Validation Test:
```bash
curl -H "Authorization: Bearer YOUR_KEY_HERE" \
  "https://api.stormglass.io/v2/weather/point?lat=37.7749&lng=-122.4194&params=windSpeed,waveHeight"
```

---

## 2. OpenUV API
**Estimated Time**: 10-15 minutes
**Free Tier Quota**: 50 requests/day
**URL**: https://openuv.io/

### Steps:
1. Visit https://openuv.io/
2. Click "Sign Up" (top right)
3. Choose "Sign up with Google" or "Sign up with Email"
4. Complete the form (if email signup)
5. Verify email if required
6. Go to Dashboard → API Keys
7. Your API key is displayed immediately
8. **Save to notepad temporarily**

### Validation Test:
```bash
curl "https://api.openuv.io/api/v1/uv?lat=37.7749&lng=-122.4194&apikey=YOUR_KEY_HERE"
```

---

## 3. Visual Crossing API
**Estimated Time**: 15-20 minutes
**Free Tier Quota**: 1,000 requests/day
**URL**: https://www.visualcrossing.com/

### Steps:
1. Visit https://www.visualcrossing.com/
2. Click "Sign Up" (top right)
3. Enter email and create password
4. Verify email address
5. After login, go to Account → API keys
6. Create new API key (name: "OceanCare-Production")
7. Copy the API key
8. **Save to notepad temporarily**

### Validation Test:
```bash
curl "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/37.7749,-122.4194/next7days?unitGroup=metric&key=YOUR_KEY_HERE&contentType=json"
```

---

## 4. Update .env File

After obtaining all 3 API keys, update your `./.env` file:

```
GNEWS_API_KEY=your_existing_key
GOOGLE_MAPS_API_KEY=your_existing_key
STORMGLASS_API_KEY=your_new_key_from_step_1
OPENUV_API_KEY=your_new_key_from_step_2
VISUAL_CROSSING_API_KEY=your_new_key_from_step_3
PORT=3000
NODE_ENV=development
```

⚠️ **SECURITY ALERT**: 
- Never commit .env to Git
- Add to .gitignore if not already present
- Use different keys for development vs. production
- Rotate keys every 90 days
- Monitor quota usage weekly

---

## 5. Quick Validation

After updating .env, run these commands:

```bash
# Check syntax
node -c server.js

# Verify .env is properly formatted
node -e "require('dotenv').config(); console.log('Loaded:', Object.keys(process.env).filter(k => k.includes('API')))"

# Start server
npm start

# In another terminal, test an endpoint
curl http://localhost:3000/
```

---

## 6. Success Checklist

- [ ] Storm Glass API key obtained and validated
- [ ] OpenUV API key obtained and validated
- [ ] Visual Crossing API key obtained and validated
- [ ] All 3 keys added to .env file
- [ ] .env file syntax verified
- [ ] Server starts without errors
- [ ] All 5 API endpoints responding correctly
- [ ] No console errors in server output

---

## Estimated Total Time: 45-75 minutes

**Next Steps After Completion**:
1. Run full test suite: `npm test`
2. Performance optimization tests
3. Proceed to Week 2: Comprehensive testing phase

