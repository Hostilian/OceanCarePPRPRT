# 🚀 API Registration Quick Start (Day 1 Priority)

**Target Completion**: 30-45 minutes | **Blocker Status**: Finalize API keys | **Success Impact**: Keeps 21/21 tests green ✅

---

## Overview: Finalize Remaining Free APIs

| # | API | Time | Free Tier | Link | Status |
|---|-----|------|-----------|------|--------|
| ✅ | **Storm Glass** | Complete | 50 req/day | https://stormglass.io/ | ✅ Active (Nov 23 validation) |
| 2 | **OpenUV** | 10 min | 50 req/day | https://openuv.io/ | ⏳ TODO |
| 3 | **Visual Crossing** | 15 min | 1,000 req/day | https://visualcrossing.com/ | ⏳ TODO |

**Remaining Effort**: 20-25 minutes of registration + 10-15 minutes validation = **30-45 minutes**

---

## Step-by-Step Instructions

### Step 1: Storm Glass API ✅ Completed (Reference Only)
**What it does**: Provides marine weather data (wave height, swell direction, water temperature) for debris reports

Storm Glass was registered and validated on Nov 23. Keep the checklist below for future onboarding or if you need to re-activate the key.

1. **Go to**: https://stormglass.io/
2. **Click**: "Sign Up" (top right)
3. **Fill form**:
   - Email: `your_email@example.com`
   - Password: Create secure password
   - Company: `OceanCare Initiative` (optional)
4. **Email verification**: Check inbox, click verification link
5. **Accept Terms**: Agree to free tier terms
6. **API Key location**: 
   - Dashboard → "API Keys" or "Account Settings"
   - Copy the key (should be 32+ characters)
7. **Expected key format**: `abc123def456...` (alphanumeric)

**Current status**: `STORMGLASS_API_KEY` stored in `.env` and confirmed via `node validate-api-keys.js`

---

### Step 2: Register OpenUV API (10 min)
**What it does**: Provides UV index, safe sun exposure times, SPF recommendations for volunteer safety

1. **Go to**: https://openuv.io/
2. **Click**: "Sign Up" or "Get Started"
3. **Fill form**:
   - Email: Same as Storm Glass
   - Password: Create secure password
4. **Email verification**: Check inbox, click link
5. **Dashboard setup**: May show free tier info automatically
6. **API Key location**:
   - Dashboard → API Key section (often visible immediately)
   - Copy the key
7. **Expected key format**: `openuv_abc123...` or similar (alphanumeric)

**✓ You now have**: `OPENUV_API_KEY`

---

### Step 3: Register Visual Crossing API (15 min)
**What it does**: Provides 90-day climate trends (temperature, precipitation, weather patterns) for homepage

1. **Go to**: https://www.visualcrossing.com/
2. **Click**: "Sign Up" (top right)
3. **Fill form**:
   - Email: Same email
   - Password: Create secure password
   - Account type: "Free" (select explicitly)
4. **Email verification**: Check inbox
5. **Dashboard**: Should show "Free Plan - 1,000 requests/day"
6. **API Key location**:
   - Account → Account Settings or API Keys section
   - Copy the key
7. **Expected key format**: Long alphanumeric string (30+ characters)

**✓ You now have**: `VISUAL_CROSSING_API_KEY`

---

## Step 4: Update `.env` File (5 min)

**Location**: `OceanCarePPRPRT/.env`

Replace the placeholder values with your actual keys (Storm Glass should already be populated — update if needed):

```dotenv
# Before (placeholders / double-check actual values):
STORMGLASS_API_KEY=your_stormglass_api_key_here
OPENUV_API_KEY=your_openuv_api_key_here
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here

# After (example):
STORMGLASS_API_KEY=abc123def456ghi789jkl012mno345pqr
OPENUV_API_KEY=openuv_xyz789abc456def123ghi
VISUAL_CROSSING_API_KEY=VC7AB8CD9E0F1G2H3I4J5K6L7M8N9O0P1Q
```

**⚠️ Important**: 
- Do NOT commit `.env` to GitHub (already in `.gitignore`)
- Keep keys private
- Never share in screenshots or messages

---

## Step 5: Validate Registration (5 min)

Run the validation script:

```bash
# From project root
node validate-api-keys.js
```

**Expected output (after adding OpenUV & Visual Crossing)**:
```
✅ GNEWS_API_KEY: Configured
✅ GOOGLE_MAPS_API_KEY: Configured
✅ STORMGLASS_API_KEY: Configured
✅ OPENUV_API_KEY: Configured
✅ VISUAL_CROSSING_API_KEY: Configured
✅ All required API keys present!
```

If OpenUV or Visual Crossing show as missing:
- Double-check spelling in `.env`
- Ensure no extra spaces around `=`
- Verify keys were copied completely (no truncation)
- Try again

---

## Step 6: Run Full Test Suite (10-15 min)

```bash
# From project root
npm test
```

**Expected result after registrations (tests already green with Storm Glass key)**:
```
✅ OceanCare API - Comprehensive Test Suite

  ✓ GNews API Tests (4 tests)
  ✓ Donations Endpoint (3 tests)
  ✓ Volunteers Endpoint (3 tests)
  ✓ Debris Reports (2 tests)
  ✓ Contact Endpoint (2 tests)
  ✓ Marine Weather API (1 test)          ← NEW
  ✓ UV Index API (1 test)                ← NEW
  ✓ Climate Trends API (1 test)          ← NEW
  ✓ Additional Tests (4 tests)

✅ Tests: 21 passed, 0 failed
✅ Duration: 8-15 seconds
```

### If tests still fail:
- **Check console output**: Errors will show which API is misconfigured
- **Verify `.env` loaded**: Keys must be loaded at startup
- **Restart server**: Kill any running `npm start` process first
- **Check API quotas**: Some APIs have strict rate limits; wait 1 hour if rate-limited

---

## Success Checklist ✅

- [x] Storm Glass API registered & key obtained (Nov 23)
- [ ] OpenUV API registered & key obtained
- [ ] Visual Crossing API registered & key obtained
- [ ] `.env` file updated with all 3 keys (Storm Glass already present)
- [ ] `validate-api-keys.js` shows all 5 keys configured
- [ ] `npm test` shows 21/21 tests passing
- [ ] No console errors when running server (`npm start`)

---

## Troubleshooting

### "API key not configured" error
**Solution**: Keys not found in `.env` or not loaded at startup
```bash
# Verify .env exists and has keys
cat .env | grep -E "STORMGLASS|OPENUV|VISUAL_CROSSING"

# Restart server
npm start
```

### "Quota exceeded" error (402 status)
**Solution**: Free tier rate limit hit (usually after 50+ test requests)
**Action**: Wait 1 hour, then re-run tests

### "Invalid API key" error (401/403 status)
**Solution**: Key is wrong or wasn't fully copied
**Action**: 
- Re-visit API provider dashboard
- Copy key again (avoid extra spaces)
- Update `.env`
- Restart server

### "Network timeout" error
**Solution**: API provider temporarily unavailable
**Action**: 
- Wait 2-3 minutes
- Check if other APIs work (rule out local network issue)
- Retry

---

## Timeline Estimate

```
Activity                          Time    Cumulative
─────────────────────────────────────────────────────
Storm Glass registration           15 min      15 min
OpenUV registration               10 min      25 min
Visual Crossing registration      15 min      40 min
Update .env file                   5 min      45 min
Validate with script               5 min      50 min
Run npm test                      10 min      60 min
Troubleshoot (if needed)          0-15 min   60-75 min
─────────────────────────────────────────────────────
TOTAL                             60-75 min   ✅
```

---

## What's Next (After APIs Registered)

**Day 2-3**: 
- Monitor test suite daily
- Address any validation errors
- Prepare for Week 1 Days 4-7 (mobile testing phase)

**Success Criteria**: 
- ✅ 21/21 tests passing
- ✅ All endpoints responding <1 second
- ✅ No console errors

**Go to**: `WEEK1_TESTING_GUIDE.md` (next guide after this)

---

## Quick Reference

| API | Dashboard Link | Key Property |
|-----|---|---|
| Storm Glass | https://stormglass.io/account | API Keys section |
| OpenUV | https://openuv.io/auth/login | Dashboard (auto-shown) |
| Visual Crossing | https://www.visualcrossing.com/account | API Keys section |

---

**Status**: ⏳ START HERE (Day 1) | **Est. Effort**: 60-75 min | **Impact**: Unlock 21/21 tests ✅
