# 📋 WEEK 2 COMPREHENSIVE QA & SECURITY PLAN (Nov 30 - Dec 5, 2025)

**Goal**: Zero-critical security findings + 100% functional verification | **Effort**: 20-25 hours | **Success Criteria**: Security ✅ + Multi-device ✅ + Documented ✅

---

## Overview: Week 2 Roadmap

**Week 2 Focus**: Deep testing, security hardening, documentation
- Manual functional testing (all 5 pages, all flows)
- Automated security audit (OWASP Top 10)
- Browser compatibility verification
- Load testing (1,000+ concurrent connections)
- Data persistence validation
- Backup & disaster recovery testing

**Expected Duration**: 20-25 hours (full-time developer)

---

## Phase 1: Days 6-7 (Nov 30 - Dec 1) — Manual Functional Testing (6-8 hours)

### Day 6 (Nov 30) — Comprehensive Functional Testing (3-4 hours)

**Test All 5 Pages Thoroughly**:

#### Homepage (`index.html`) — 30-40 min

| Feature | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| **Page Load** | Open in browser | <2 sec load time | ⏳ Test |
| **News Section** | Scroll to news cards | 6 cards display, images load | ⏳ Test |
| **News Links** | Click news links | Opens new tab, no 404s | ⏳ Test |
| **Climate Trends** | Scroll to trends section | Data displays, no API errors | ⏳ Test |
| **Donation CTA** | Click "Donate Now" button | Navigates to donate page | ⏳ Test |
| **Navigation Menu** | Click all menu items | All pages accessible | ⏳ Test |
| **Mobile Responsive** | Resize to 375px width | Layout adapts, no breaks | ⏳ Test |
| **Accessibility** | Tab through page | All interactive elements reachable | ⏳ Test |

**Expected**: No errors, all data displays, <2 sec load

---

#### How to Help - Donation Page (`pages/how-to-help.html`) — 30-40 min

| Feature | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| **Page Load** | Open page | Loads successfully | ⏳ Test |
| **Impact Calculator** | Enter $10 donation | Shows CO₂ offset, lives saved | ⏳ Test |
| **Calculator Math** | Enter various amounts | Calculations correct (formula: amount × 1.2 CO₂, 0.05 lives) | ⏳ Test |
| **Form Validation** | Submit without email | Error: "Email required" | ⏳ Test |
| **Form Validation** | Submit without amount | Error: "Amount required" | ⏳ Test |
| **Valid Submission** | Enter all fields, submit | Success message, data in DB | ⏳ Test |
| **DB Persistence** | Refresh page, submit again | Both donations appear in DB | ⏳ Test |
| **Mobile Form** | Resize to 375px | Form touch-friendly, no tiny inputs | ⏳ Test |

**Expected**: All form validations work, donations stored in SQLite

---

#### Volunteer Page (`pages/volunteer.html`) — 30-40 min

| Feature | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| **Page Load** | Open page | Weather widget visible | ⏳ Test |
| **Weather Display** | Check forecast | 7-day forecast displays (or fallback data) | ⏳ Test |
| **UV Index Widget** | Check UV widget | Shows UV index + safe hours (or fallback) | ⏳ Test |
| **Form Fields** | Fill form | All 8 fields accept input | ⏳ Test |
| **Phone Validation** | Enter invalid phone | Error displayed | ⏳ Test |
| **Experience Dropdown** | Select options | All 4 options available | ⏳ Test |
| **Valid Submission** | Complete form, submit | Success, stored in DB | ⏳ Test |
| **Mobile Responsiveness** | Test on 375px | Form fully functional | ⏳ Test |

**Expected**: Weather displays, form validates, volunteers stored

---

#### Debris Report Page (`pages/report-debris.html`) — 30-40 min

| Feature | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| **Page Load** | Open page | Maps visible, no errors | ⏳ Test |
| **Ocean Conditions** | Check conditions card | Wave height, water temp, air quality display | ⏳ Test |
| **Map Interaction** | Click map | Can see debris locations marked | ⏳ Test |
| **Form Fields** | Fill form | All 7 fields accept input | ⏳ Test |
| **Location Auto-Fill** | Enter coordinates | Address reverse-geocoded | ⏳ Test |
| **Debris Type Dropdown** | Select types | All options available | ⏳ Test |
| **Valid Submission** | Complete form, submit | Debris report stored, appears on map | ⏳ Test |
| **Map Updates** | Submit, check map | New marker appears on map | ⏳ Test |
| **Photo Upload** | Upload image | Image displays (if supported) | ⏳ Test |

**Expected**: Maps load, debris reports persist, geolocation works

---

#### Additional Pages (Quick Pass) — 20 min

| Page | Quick Tests | Status |
|------|-------------|--------|
| **Projects** | Loads, cards visible | ⏳ Test |
| **Contact** | Form submits, data stored | ⏳ Test |
| **Team** | Team member cards display | ⏳ Test |
| **Login** (if used) | Form validates, mock login | ⏳ Test |

---

### Day 7 (Dec 1) — Edge Cases & Error Scenarios (3-4 hours)

#### Error Handling Tests — 90 min

| Scenario | How to Test | Expected Behavior | Status |
|----------|-------------|-------------------|--------|
| **Network Down** | Disable internet, try submit | Graceful error, no crash | ⏳ Test |
| **API Timeout** | Slow network (throttle in DevTools) | Page waits 5s, shows fallback data | ⏳ Test |
| **Invalid Coordinates** | Debris page: enter "abc, xyz" | Error message, no crash | ⏳ Test |
| **Huge Amount** | Donation: enter 999999999 | Validation: "Amount too large" | ⏳ Test |
| **Negative Amount** | Donation: enter -100 | Validation fails | ⏳ Test |
| **Empty Phone** | Volunteer: leave phone blank | Validation: "Phone required" | ⏳ Test |
| **Very Long Message** | Contact: paste 10k chars | Validation: "Message too long" (if limit set) | ⏳ Test |
| **Special Characters** | Name field: "Robert'; DROP TABLE--" | Safely stored (SQL injection prevented) | ⏳ Test |
| **Rapid Submissions** | Click submit 5 times quickly | Rate limiting prevents spam | ⏳ Test |
| **Stale Session** | Leave page open 30+ min, submit | Session still valid or clear error | ⏳ Test |

#### Database Integrity — 60 min

| Test | How | Expected Result | Status |
|------|-----|-----------------|--------|
| **Data Persistence** | Submit form, restart server | Data still exists | ⏳ Test |
| **No Data Loss** | Submit 10 donations, check DB | All 10 stored, none duplicated | ⏳ Test |
| **Concurrent Writes** | Submit multiple forms simultaneously | All stored without conflicts | ⏳ Test |
| **Backup Creation** | Check `/backups` folder | Daily backups created | ⏳ Test |
| **Backup Restoration** | Restore from backup, verify data | Data matches original | ⏳ Test |

#### Performance Under Load — 30 min

| Test | How | Expected Result | Status |
|------|-----|-----------------|--------|
| **1,000 News API Calls** | Load test with Apache Bench | >90% success, <2s avg response | ⏳ Test |
| **Rate Limit Enforcement** | Rapid GET requests to one endpoint | After 100 in 15 min, gets 429 error | ⏳ Test |
| **Database Size** | Submit 100+ donations/volunteers | DB file <10MB, still responsive | ⏳ Test |

---

## Phase 2: Days 8-9 (Dec 2-3) — Security Audit (8-10 hours)

### Day 8 (Dec 2) — OWASP Top 10 Security Audit (4-5 hours)

**OWASP Top 10 (2021) — Check Each**:

#### 1. Broken Access Control
```
Test: Can user access another user's data?
- Try to modify donation ID in request (change from 1 to 2)
- Expected: 403 Forbidden or no data from other users
- Status: ⏳ Test
```

#### 2. Cryptographic Failures
```
Test: Are API keys and sensitive data protected?
- Check server.js: Keys loaded from .env, not hardcoded ✓
- Check: No keys in console logs ✓
- Check: HTTPS enforced in production (will test on Vercel)
- Status: ⏳ Verify in code
```

#### 3. Injection (SQL, Command, etc.)
```
Test: SQL Injection attempts
Donations form → Name field → Enter: Robert'; DROP TABLE donations;--
- Expected: Treated as literal text, not SQL command
- Status: ⏳ Test
```

#### 4. Insecure Design
```
Test: Are there logical flaws?
- Try to submit 0-dollar donation: validation prevents
- Try to submit volunteer without phone: validation prevents
- Expected: All flows secured by validation
- Status: ⏳ Test
```

#### 5. Security Misconfiguration
```
Test: Are defaults secure?
- server.js: Check default error responses (no stack traces leaked)
- .env: Check no secrets in git history
- Headers: Check CORS configured correctly
- Status: ⏳ Verify
```

#### 6. Vulnerable & Outdated Components
```
Test: npm dependencies
Run: npm audit
- Expected: 0 critical vulnerabilities
- If found: npm audit fix
- Status: ⏳ Run
```

#### 7. Authentication & Session Management
```
Test: Session security (if login used)
- Check: Cookies set with secure flag
- Check: Sessions timeout properly
- Status: ⏳ Verify
```

#### 8. Software & Data Integrity Failures
```
Test: Can user modify requests without detection?
- Verify: No unsigned/unvalidated data accepted
- Check: All inputs validated server-side (not just client)
- Status: ⏳ Test
```

#### 9. Logging & Monitoring Gaps
```
Test: Are errors logged properly?
- Submit invalid form: check server logs
- API error: check logs show error code + timestamp
- Expected: All errors logged without exposing internals
- Status: ⏳ Test
```

#### 10. SSRF (Server-Side Request Forgery)
```
Test: Can user make server request to internal networks?
- Try to call maps API with malicious URL
- Expected: Only allowed domains called
- Status: ⏳ Verify
```

**Output**: Document findings in `WEEK2_SECURITY_AUDIT_RESULTS.md`

---

### Day 9 (Dec 3) — Additional Security Hardening (4-5 hours)

#### Rate Limiting Verification — 60 min
```bash
# Test rate limiting on donations endpoint
for i in {1..150}; do
  curl -X POST http://localhost:3000/api/donate \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","amount":10}'
  echo "Request $i"
  sleep 0.01
done

# Expected: After 100 requests in 15 min window, gets 429 Too Many Requests
# Status: ⏳ Test
```

#### API Key Exposure Check — 30 min
```bash
# Verify API keys not logged
npm start > server.log 2>&1 &
# Make requests to /api/news, /api/marine-weather, etc.
# Check: grep -i "key\|secret" server.log
# Expected: No keys logged
# Status: ⏳ Verify
```

#### Input Validation Completeness — 90 min

| Endpoint | Input | Expected Validation | Status |
|----------|-------|---------------------|--------|
| POST /api/donate | email | Email format, required | ⏳ Test |
| POST /api/donate | amount | Number, >0, <1M | ⏳ Test |
| POST /api/donate | name | String, 1-100 chars | ⏳ Test |
| POST /api/volunteer | phone | Valid phone format | ⏳ Test |
| POST /api/volunteer | experience | Enum (Beginner, Intermediate, etc.) | ⏳ Test |
| POST /api/contact | message | String, 10-5000 chars | ⏳ Test |
| GET /api/geocode-location | lat/lng | Valid coordinates (-90 to 90, -180 to 180) | ⏳ Test |
| POST /api/report-debris | location | Non-empty string | ⏳ Test |

#### SSL/TLS Readiness — 30 min
```bash
# This will be tested during Vercel deployment
# For local: Check HTTPS can be enabled
# Expected: No self-signed cert warnings on staging
# Status: ⏳ Verify on Vercel
```

#### CORS Configuration — 30 min
```bash
# Test CORS headers
curl -i -X OPTIONS http://localhost:3000/api/donate
# Check for: Access-Control-Allow-Origin
# Should allow: http://localhost:3000, staging, production URLs
# Status: ⏳ Verify
```

---

## Phase 3: Days 10 (Dec 4) — Integration & Stress Testing (3-4 hours)

### Full Integration Test Scenario

**Scenario**: Simulate complete user journey
```
1. User visits homepage
   → News loads, climate trends display
   → Expected: <2 sec, no errors

2. User clicks "Learn more" on project
   → Projects page loads
   → Expected: Images load, descriptions visible

3. User donates $50
   → Fills form with valid data
   → Expected: Success message, stored in DB, email logged

4. Another user volunteers for cleanup
   → Fills volunteer form (7 fields)
   → Expected: Accepted, stored, confirmation

5. User reports debris on map
   → Provides coordinates, debris type, description
   → Expected: Reverse geocoded, stored, appears on map

6. User checks contact form
   → Submits message
   → Expected: Message stored, no errors

7. Verify all data in database
   → Check ocean_data.db has 5+ tables populated
   → Expected: 5+ donations, 3+ volunteers, 1+ debris reports
```

**Time**: 60-90 min | **Status**: ⏳ Execute

---

### Stress Test: High Load Scenario

```bash
# Tool: Apache Bench (ab) or Artillery
# Test: 100 concurrent users hitting homepage
ab -n 1000 -c 100 http://localhost:3000/

# Expected: 
# - 95%+ requests succeed
# - Avg response time <500ms
# - Max response time <2s
# - Server doesn't crash

# Status: ⏳ Test
```

---

## Phase 4: Day 10 (Dec 4) — Documentation & Sign-Off (2 hours)

### Create Comprehensive Test Report

**File**: `WEEK2_QA_REPORT.md`

Contents:
```markdown
# WEEK 2 QA & SECURITY AUDIT REPORT

## Executive Summary
- Tests run: 50+ scenarios
- Pass rate: 99% (or document failures)
- Critical findings: 0 (or list and remediate)

## Functional Testing Results
- Homepage: ✅ PASS
- Donation page: ✅ PASS
- Volunteer page: ✅ PASS
- Debris report page: ✅ PASS
- Contact/Team pages: ✅ PASS

## Security Audit Results
- OWASP Top 10: All 10 verified ✅
- npm audit: 0 critical vulns ✅
- SQL injection tests: All passed ✅
- Rate limiting: Verified ✅
- API key exposure: None found ✅

## Browser Compatibility
- Chrome: ✅ PASS
- Firefox: ✅ PASS
- Safari: ✅ PASS
- Edge: ✅ PASS

## Performance Metrics
- Homepage load: 1.2s ✅
- API endpoints: <500ms avg ✅
- Database queries: <100ms ✅
- Rate limiting: 100 req/15min ✅

## Known Issues (if any)
- None identified

## Recommendations
- Ready for Week 3 deployment ✅
- Consider PostgreSQL post-launch (optional)
- Monitor error logs on production
```

---

## Week 2 Success Criteria Checklist

```
✅ FUNCTIONAL TESTING
  [ ] 5 pages tested thoroughly (all flows)
  [ ] All forms working, validations correct
  [ ] Database persistence verified (restart test)
  [ ] All API endpoints responding
  [ ] No console errors on any page
  
✅ SECURITY
  [ ] OWASP Top 10 audit completed
  [ ] 0 critical npm vulnerabilities
  [ ] SQL injection attempts blocked
  [ ] API keys not exposed in logs
  [ ] Rate limiting functional
  
✅ PERFORMANCE
  [ ] Homepage <2 sec load (desktop + mobile)
  [ ] API responses <500ms avg
  [ ] Database queries <100ms
  [ ] Images optimized
  [ ] No memory leaks observed
  
✅ BROWSER COMPATIBILITY
  [ ] Chrome tested ✓
  [ ] Firefox tested ✓
  [ ] Safari tested ✓
  [ ] Edge tested ✓
  
✅ STRESS TESTING
  [ ] 100 concurrent users handled
  [ ] 95%+ success rate under load
  [ ] No data corruption
  
✅ DOCUMENTATION
  [ ] Test results documented
  [ ] Security findings logged
  [ ] Issues (if any) recorded
  [ ] Ready for handoff to Week 3
```

---

## Week 2 Time Budget

| Phase | Estimated Hours | Actual | Status |
|-------|-----------------|--------|--------|
| **Days 6-7: Manual Testing** | 6-8 | TBD | 🟡 PENDING |
| **Days 8-9: Security Audit** | 8-10 | TBD | 🟡 PENDING |
| **Day 10: Integration & Stress** | 3-4 | TBD | 🟡 PENDING |
| **Day 10: Documentation** | 2 | TBD | 🟡 PENDING |
| **Buffer** | 1-3 | TBD | 🟡 PENDING |
| **TOTAL WEEK 2** | **20-25 hours** | TBD | 🟡 PENDING |

---

**Week 2 Status**: 🟡 **PENDING** (Starts Nov 30, 2025)
**Success Criteria**: Zero-critical security + 100% functional + Documented
**Next**: WEEK 3 - Deployment to Vercel (Dec 6-15)
