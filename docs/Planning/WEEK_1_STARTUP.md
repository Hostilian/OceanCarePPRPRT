# 🌊 OceanCare - Week 1 Startup Guide

**Start Date**: November 23, 2025  
**Phase**: PHASE 1 - API Registration (Critical Path)  
**Estimated Duration**: 2-3 hours to complete remaining Day 1 work

---

## What You Need to Do Right Now

### ✅ DONE - Infrastructure Ready
- Server code validated (1020 lines, production-grade)
- All npm dependencies installed
- Database backup system active
- Rate limiting configured
- Test suite ready (Storm Glass-dependent specs passing; OpenUV & Visual Crossing tests pending keys)

### ⏳ TODO - Register Remaining 2 APIs (Next 1 hour)

Storm Glass is already registered and validated. Your job now is to collect the final two free API keys so the validation suite can go fully green.

---

## Task 1: Storm Glass API (15-20 minutes)

**Status**: ✅ Completed on Nov 23 — key is already registered, validated, and stored in `.env`. Keep these instructions for onboarding or re-registration if the key ever needs to be rotated.

---

## Task 2: OpenUV API (10-15 minutes)

**What**: UV index data API  
**Free Tier**: 50 requests/day  
**Status**: ⏳ Pending — completing this unlocks UV monitoring, CLI validation, and the Jest suite.

**Your Action**:

1. Open browser → https://openuv.io/
2. Click "Sign Up" button
3. Choose "Sign up with Google" (easier) or "Email"
4. Complete signup
5. Check email for verification (if needed)
6. Login to dashboard
7. API key is shown immediately
8. **Copy the key**
9. Paste it in notepad temporarily

✅ **Mark done when**: You have the API key saved

---

## Task 3: Visual Crossing API (15-20 minutes)

**What**: Climate/weather forecast API  
**Free Tier**: 1,000 requests/day (most generous!)  
**Status**: ⏳ Pending — required for climate trends on the homepage and final test coverage.

**Your Action**:

1. Open browser → https://www.visualcrossing.com/
2. Click "Sign Up" button
3. Enter email and password
4. Check email for verification link (click it)
5. Login to dashboard
6. Find "Account" → "API Keys"
7. Create new key (name it "OceanCare-Production")
8. **Copy the key**
9. Paste it in notepad temporarily

✅ **Mark done when**: You have the API key saved

---

## Task 4: Update .env File (5-10 minutes)

**What**: Add the remaining API keys to configuration  
**Your Action**:

1. Open `.env` file in project root
2. Find these lines:
   ```
   STORMGLASS_API_KEY=your_stormglass_api_key_here
   OPENUV_API_KEY=your_openuv_api_key_here
   VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
   ```
3. Replace the placeholders with actual keys from notepad (Storm Glass should already contain a live value—leave it in place).
4. **Do not add quotes** - just paste raw key
5. Save file (Ctrl+S)

Example (with fake keys):
```
STORMGLASS_API_KEY=abc123def456ghi789
OPENUV_API_KEY=xyz789uvw012abc345
VISUAL_CROSSING_API_KEY=qrs456tuv789wxy012
```

✅ **Mark done when**: File saved and you see no syntax errors

---

## Task 5: Validate Everything (5-10 minutes)

**What**: Test that API keys work  
**Your Action**:

Run validation script:
```bash
node validate-api-keys.js
```

**Current output** (before registering the remaining keys):
```
✅ Storm Glass API ✓
❌ OpenUV API — Missing API key
❌ Visual Crossing API — Missing API key
✅ Google Maps API ✓
✅ GNews API ✓

Status: 3/5 APIs configured
```

**Expected output after OpenUV & Visual Crossing keys are added**:
```
✅ Storm Glass API ✓
✅ OpenUV API ✓
✅ Visual Crossing API ✓
✅ Google Maps API ✓
✅ GNews API ✓

Status: 5/5 APIs configured
All APIs are properly configured! Ready to launch.
```

If some fail, double-check:
- Keys copied exactly (no spaces before/after)
- .env file saved
- No typos in key names

✅ **Mark done when**: All 5 APIs show ✓

---

## Task 6: Run Full Test Suite (5 minutes)

**What**: Verify all endpoints work with new API keys  
**Your Action**:

```bash
npm test
```

Expected result once OpenUV & Visual Crossing are configured:
- 21/21 tests passing
- 0 failures
- 0 errors

**Current behavior**: Storm Glass–dependent specs already pass; the UV index and climate trend tests remain red until those two keys are in `.env`.

If some still fail:
- They might need real API quota (first request uses quota)
- Re-run with: `npm test -- --testTimeout=20000` for slower networks
- Still failing? Check server logs for errors

✅ **Mark done when**: See "21 passed"

---

## Task 7: Quick Server Test (3 minutes)

**What**: Make sure server starts with live APIs  
**Your Action**:

1. Terminal 1 - Start server:
   ```bash
   npm start
   ```
   
   Should see:
   ```
   ✅ Database initialized
   ✅ Database backup created
   Server running on http://localhost:3000
   ```

2. Terminal 2 - Test endpoint:
   ```bash
   curl http://localhost:3000/api/news
   ```
   
   Should get JSON response with news articles

   *Tip*: You can also hit `/api/marine-weather` to confirm the Storm Glass key is active. `/api/uv-index` and `/api/climate-trends` return missing-key messages until their credentials are added.

3. Stop server: Press Ctrl+C

✅ **Mark done when**: Server starts and responds to requests

---

## Summary: Week 1 Day 1

### Remaining Time Required: ~60 minutes
- OpenUV registration: 10-15 min
- Visual Crossing registration: 15-20 min
- Update `.env`: 5-10 min
- Validation + tests: 10-15 min
- Server spot-check: 3 min

### What Happens Next
Once Day 1 complete:
- **Days 2-3**: Fix any remaining test failures
- **Days 4-5**: Performance optimization
- **Week 2**: Comprehensive testing (manual + automated)
- **Week 3**: Deploy to production

---

## If Something Goes Wrong

### "API signup won't verify email"
→ Check spam folder, or use alternative signup (Google OAuth)

### "API key doesn't work"
→ Make sure you copied the full key without extra spaces

### ".env file has syntax error"
→ Run: `node -e "require('dotenv').config(); console.log('OK')"`

### "Tests still failing"
→ Check that server isn't already running on port 3000

### "Can't find API Keys section"
→ It's usually: Dashboard → Settings → API Keys (or similar)

---

## You're Ready!

Everything is set up. You just need to:
1. ✅ Keep the Storm Glass key active (already complete)
2. ⏳ Register OpenUV & Visual Crossing API keys (≈30-40 minutes total)
3. ⏳ Add the new keys to `.env`, re-run validation/tests, and confirm 5/5 APIs working

Then move to Days 2-7 for testing and optimization.

**Questions?** See detailed docs:
- `API_REGISTRATION_GUIDE.md` - Step-by-step signup help
- `IMPLEMENTATION_CHECKLIST.md` - Full 4-week plan
- `README.md` - Project overview

**Let's go! 🌊💪**
