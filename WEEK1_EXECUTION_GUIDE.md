# 🎯 WEEK 1 EXECUTION GUIDE - API Keys + Testing
## Days 1-7: Make Features Work

**Goal**: Register remaining OpenUV & Visual Crossing API keys + maintain 21/21 tests passing once all keys active  
**Effort**: 40-50 hours  
**Timeline**: Must complete Days 1-3 (API keys) on schedule  
**Exit Condition**: Storm Glass validated ✅; OpenUV & Visual Crossing registered and tested; all 5 APIs functional, all tests passing, all pages working

---

## DAY 1 DETAILED WALKTHROUGH (Monday)

### Task 1.1: Register Storm Glass API (20 minutes)

**Status**: Completed Nov 23 and validated. Keep these steps for reference or if the key needs re-registration.

**Step 1**: Open browser tab: https://stormglass.io

**Step 2**: Click blue "Sign Up" button (top right corner)

**Step 3**: Complete signup form:
- Email: Enter your email
- Password: Create strong password (12+ chars, mixed case, numbers)
- Click "Sign Up"

**Step 4**: Check email for verification link
- Open email client
- Look for "Storm Glass" verification email (check spam folder if not found)
- Click verification link in email
- Wait for browser to confirm verification

**Step 5**: Login to dashboard
- Return to stormglass.io
- Click "Log In" (if not automatically logged in)
- Enter email + password

**Step 6**: Find your API key
- Look for "API Keys" or "Account" section (usually in left sidebar)
- Click "API Keys"
- You should see a default API key like: `abc123def456xyz789...`
- Click copy button (or select and Ctrl+C)

**Step 7**: Save the key
- Open notepad or Notes app
- Paste: `STORMGLASS_API_KEY=abc123def456xyz789...`
- Keep this tab open or save this text

**Time Check**: Should take ~20 minutes. If stuck:
- Email verification not arriving? Check spam folder, try resend
- Can't find API key? Try clicking "Account" → "API Keys"
- Need help? Contact support via stormglass.io/support

---

### Task 1.2: Register OpenUV API (20 minutes)

**Status**: Pending—complete these steps next to unlock UV data tests.

**Step 1**: Open new browser tab: https://openuv.io

**Step 2**: Click "Sign Up Free" button (top right or center)

**Step 3**: Complete signup:
- Email: Enter your email (can use same email as Storm Glass)
- Password: Create strong password
- Click "Sign Up" or "Create Account"

**Step 4**: Email verification
- Check email for OpenUV verification link
- Click link to verify
- Browser confirms verification

**Step 5**: Login and find API key
- Go to openuv.io and login
- Look for "API Keys" in dashboard (usually left sidebar or settings)
- Find your API key like: `openuv123xyz...`
- Copy the key

**Step 6**: Save the key
- Notepad: Add `OPENUV_API_KEY=openuv123xyz...`
- Keep this text with Storm Glass key

**Time Check**: ~20 minutes. Similar process as Storm Glass.

---

### Task 1.3: Register Visual Crossing API (20 minutes)

**Status**: Pending—complete these steps to enable climate trend data.

**Step 1**: Open new browser tab: https://visualcrossing.com

**Step 2**: Click "Sign Up" button (top right corner)

**Step 3**: Choose signup type:
- Select "Personal" (not business)
- Click "Continue" or "Sign Up"

**Step 4**: Complete form:
- Email: Your email
- Password: Strong password
- Agree to terms
- Click "Sign Up" or "Create Account"

**Step 5**: Email verification
- Check email for Visual Crossing verification
- Click verification link
- Confirm email

**Step 6**: Login and get API key
- Go to visualcrossing.com login
- Enter credentials
- Look for "Account" → "API Key" or "Settings" → "API Key"
- Copy your API key (format: `VC_KEY_123abc...` or similar)

**Step 7**: Save the key
- Notepad: Add `VISUAL_CROSSING_API_KEY=VC_KEY_123abc...`

**Time Check**: ~20 minutes

---

### Task 1.4: Organize Your Keys (5 minutes)

**Open Notepad**, create this format:
```
STORMGLASS_API_KEY=abc123def456xyz789...
OPENUV_API_KEY=openuv123xyz...
VISUAL_CROSSING_API_KEY=VC_KEY_123abc...
```

**Verify each key**:
- [ ] Storm Glass key starts with: (ask API when signed in)
- [ ] OpenUV key is visible in dashboard
- [ ] Visual Crossing key is visible in account settings
- [ ] No keys have spaces before/after
- [ ] All keys are complete (not cut off)

---

### Task 1.5: Update .env File (10 minutes)

**Step 1**: Open file: `c:\Users\Hostilian\collab-connect\OceanCarePPRPRT\.env`

**Step 2**: Current content looks like:
```env
GNEWS_API_KEY=xxxxx
GOOGLE_MAPS_API_KEY=xxxxx
NODE_ENV=production
PORT=3000
```

**Step 3**: Add 3 new lines at the end (before any blank lines):
```env
STORMGLASS_API_KEY=your_storm_glass_key_here
OPENUV_API_KEY=your_openuv_key_here
VISUAL_CROSSING_API_KEY=your_visual_crossing_key_here
```

Storm Glass should already be populated—focus on adding OpenUV & Visual Crossing once their keys are obtained.

**Step 4**: Replace placeholders with actual keys from notepad:
```env
STORMGLASS_API_KEY=abc123def456xyz789...
OPENUV_API_KEY=openuv123xyz...
VISUAL_CROSSING_API_KEY=VC_KEY_123abc...
```

**Step 5**: Final check:
- [ ] No "your_" text remaining
- [ ] No "xxxxx" placeholders remaining
- [ ] Each key is on its own line
- [ ] No extra spaces before/after keys
- [ ] File saved (Ctrl+S)

**Step 6**: Verify file saved:
- Close file
- Reopen it
- Confirm all keys are there

---

### Task 1.6: Validate APIs with Script (5 minutes)

**Step 1**: Open terminal (Command Prompt on Windows)

**Step 2**: Navigate to project:
```cmd
cd c:\Users\Hostilian\collab-connect\OceanCarePPRPRT
```

**Step 3**: Run validation script:
```cmd
node validate-api-keys.js
```

**Step 4**: Expected output once every key is in place:
```
✅ GNEWS_API_KEY: CONFIGURED
✅ GOOGLE_MAPS_API_KEY: CONFIGURED
✅ STORMGLASS_API_KEY: CONFIGURED
✅ OPENUV_API_KEY: CONFIGURED
✅ VISUAL_CROSSING_API_KEY: CONFIGURED

All 5 APIs are configured. Run 'npm test' to verify.
```

**Current Status**: Storm Glass already shows ✅. Until OpenUV & Visual Crossing keys are registered, the script reports `❌ Missing API key` for those two entries—this is expected and resolves as soon as you add the real keys.

**Troubleshooting**:
- If any show ❌: Check .env file for typos or missing keys
- If all show ✅: Proceed to next step
- If script not found: Verify file is in project root

---

### Task 1.7: Run Test Suite (5-10 minutes)

**Step 1**: In same terminal, run:
```cmd
npm test
```

**Step 2**: Watch output - should show something like:
```
PASS  server.test.js
  API Endpoints
    ✓ GET /api/news (22ms)
    ✓ GET /api/ocean-conditions-cached (5ms)
    ✓ POST /api/donate (18ms)
    ...
    ✓ GET /api/climate-trends (35ms)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
```

**Success Condition**: **21 passed** (not 16 passed)

Storm Glass tests already pass; expect the UV and climate trend specs to fail until their keys are configured.

**If Not All Passing**:
1. Check .env file for typos
2. Run `node validate-api-keys.js` again
3. Delete `node_modules`, run `npm install`
4. Restart server: `npm start` (in new terminal)
5. Run `npm test` again in another terminal

---

### END OF DAY 1 CHECKLIST

- [x] Storm Glass API key registered and validated (Nov 23)
- [ ] OpenUV API key registered and copied
- [ ] Visual Crossing API key registered and copied
- [ ] `.env` updated with all live keys (only Storm Glass present today)
- [ ] `node validate-api-keys.js` shows 5/5 ✅ (currently 3/5 until remaining keys added)
- [ ] `npm test` shows 21/21 passing (requires OpenUV & Visual Crossing keys)
- [ ] No console errors or warnings
- [ ] Server starts cleanly with `npm start`

**Expected Time**: 2-3 hours  
**Next Step**: Day 2 (manual testing of all pages)

---

## DAYS 2-3 QUICK TESTING

### Day 2: Manual Page Testing (2-3 hours)

**Setup**: Open browser, visit `http://localhost:3000`

**Test Each Page**:
1. **Homepage** (/)
   - [ ] Page loads without errors
   - [ ] News feed visible and populated
   - [ ] Climate trends section visible (fully populates after Visual Crossing key is active)
   - [ ] All images load
   - [ ] No console errors (F12)

2. **How to Help** (/pages/how-to-help.html)
   - [ ] Page loads
   - [ ] Donation calculator works (change amount, see results)
   - [ ] Form validation works (try submitting empty)
   - [ ] Submit button works
   - [ ] Success message appears

3. **Volunteer** (/pages/volunteer.html)
   - [ ] Page loads
   - [ ] UV index displays (shows sun/SPF info) — expect missing data until OpenUV key is configured
   - [ ] Weather forecast visible
   - [ ] Form fields present (name, email, etc.)
   - [ ] Submit works

4. **Report Debris** (/pages/report-debris.html)
   - [ ] Page loads
   - [ ] "Get Location" button works (allows geolocation)
   - [ ] Marine weather displays (waves, water temp) — should already pass with the active Storm Glass key
   - [ ] Form fields present
   - [ ] Submit works

5. **Projects** (/pages/projects.html)
   - [ ] Page loads
   - [ ] Project cards visible
   - [ ] Responsive layout (looks good)

6. **Contact** (/pages/contact.html)
   - [ ] Page loads
   - [ ] Form fields present
   - [ ] Submit works

7. **Team** (/pages/team.html)
   - [ ] Page loads
   - [ ] Team members visible
   - [ ] Profiles display correctly

### Day 3: API Deep Testing (2-3 hours)

**Test Each API Endpoint**:

**1. Test Marine Weather** (Debris Report page)
- [ ] Enter address or allow geolocation
- [ ] Marine weather box appears
- [ ] Shows wave height, water temperature
- [ ] No console errors

Storm Glass is already validated, so this check should succeed now.

**2. Test UV Index** (Volunteer page)
- [ ] UV index displays
- [ ] Shows SPF recommendations
- [ ] Shows sun safety info
- [ ] No console errors

These items complete once the OpenUV API key is registered and active; expect errors until then.

**3. Test Climate Trends** (Homepage)
- [ ] Climate section displays
- [ ] Shows temperature trend
- [ ] Shows precipitation trend
- [ ] No console errors

Visual Crossing responses populate after its key is added—treat missing data as expected until registration is done.

**4. Test News Feed** (Homepage)
- [ ] News articles appear
- [ ] Articles have titles and links
- [ ] Can scroll through articles
- [ ] No console errors

**5. Test Debris Reports List**
- [ ] Submit debris report (Report Debris page)
- [ ] Report appears in list
- [ ] Shows on map
- [ ] Database save confirmed

---

## DAYS 4-7: DEEPEN TESTING

### Daily Routine (1-2 hours/day)

**Every Morning**:
```cmd
npm test
```
Expected: 21/21 passing ✅ once all keys are in place (current runs flag the OpenUV & Visual Crossing specs until those keys are registered)

**Every Afternoon**:
- Test one page deeply on 3 devices:
  - Desktop (laptop at 1920x1080)
  - Tablet (if available)
  - Mobile (smartphone)
- Check for responsive issues
- Test all forms on that page

**Every Evening**:
- Monitor server uptime
- Check for memory leaks
- Document any anomalies

---

## TROUBLESHOOTING COMMON ISSUES

### Issue: Test still shows 16/21 (some failing)
**Cause**: API key not properly added to .env  
**Solution**:
1. Close terminal completely
2. Reopen terminal
3. Verify .env file directly (not in memory)
4. Run `npm test` again
5. If still failing, delete node_modules: `rmdir /s node_modules`
6. Run `npm install`
7. Run `npm test` again

### Issue: "Cannot find module" errors
**Cause**: Dependencies not installed  
**Solution**:
```cmd
npm install
npm test
```

### Issue: Port 3000 already in use
**Cause**: Another process using port  
**Solution**:
```cmd
taskkill /pid [PID] /f
```
Or change port in .env: `PORT=3001`

### Issue: API validation shows ❌ (not configured)
**Cause**: Key not in .env or typo in name  
**Solution**:
1. Open .env file
2. Check exact spelling:
   - `STORMGLASS_API_KEY` (not `STORM_GLASS`)
   - `OPENUV_API_KEY` (not `OPEN_UV`)
   - `VISUAL_CROSSING_API_KEY` (exact spelling)
3. Restart server
4. Run validation again

### Issue: API registration email not arriving
**Cause**: Email spam filter  
**Solution**:
1. Check spam/junk folder
2. Add API provider to contacts
3. Request resend from API provider
4. Try different email address if needed

---

## SUCCESS INDICATORS

**After Day 1**:
- [x] Storm Glass API key registered and validated
- [ ] OpenUV API key registered
- [ ] Visual Crossing API key registered
- [ ] `.env` updated with all live keys (currently Storm Glass only)
- [ ] Tests show 21/21 (will complete after remaining keys are active)
- [ ] Validation script green ✅ (pending remaining keys)

**After Day 3**:
- [ ] All pages load without errors
- [ ] All forms submit successfully
- [ ] All APIs responding correctly (OpenUV & Visual Crossing pending key registration)
- [ ] No console errors
- [ ] Database saving data

**After Day 7**:
- [ ] 100% feature complete
- [ ] 21/21 tests passing consistently
- [ ] Server stable under testing
- [ ] Ready for Week 2 QA

---

## NEXT STEPS

- **Friday (End of Week 1)**: Review WEEK2_QA_GUIDE.md
- **Monday (Week 2, Day 1)**: Begin security audit
- **By Friday (Week 2)**: Complete security audit + multi-device testing

