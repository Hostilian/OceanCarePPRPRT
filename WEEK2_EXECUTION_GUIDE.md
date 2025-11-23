# 🔒 WEEK 2 EXECUTION GUIDE - Security & Multi-Device QA
## Days 8-14: Ensure Quality and Security

**Goal**: Security audit passed (0 critical issues) + tested on all devices  
**Effort**: 35-40 hours  
**Timeline**: All work is non-blocking for launch, but critical for quality  
**Exit Condition**: Security audit complete, multi-device testing complete, Lighthouse 90+

**API Keys Status**: Storm Glass ✅ (validated Nov 23). Register OpenUV & Visual Crossing keys during Week 2 so QA can validate those live endpoints and publish-ready `.env` values.

---

## WEEK 2 OVERVIEW

This week focuses on **quality assurance** and **security hardening**. All tests from Week 1 continue daily. New parallel tracks:

| Track | Days | Hours | Owner |
|-------|------|-------|-------|
| **Security Audit** | 8-10 | 8-10 | Dev |
| **Multi-Device Testing** | 8-14 | 6-8 | QA/Dev |
| **Performance Optimization** | 10-14 | 4-6 | Dev |
| **Accessibility Audit** | 12-14 | 4 | QA |
| **Daily Regression** | 8-14 | 1/day | Dev |

---

## DAY 8 (MONDAY): SECURITY AUDIT BEGINS

### 8.1: SQL Injection Testing (2 hours)

**Overview**: SQL injection happens when user input is directly used in database queries. Test if attackers can break the database.

**Test Target**: All 3 forms that save to database
1. Donation form (/pages/how-to-help.html)
2. Volunteer signup form (/pages/volunteer.html)
3. Debris report form (/pages/report-debris.html)

**Testing Steps**:

**Step 1**: Donation Form - Test with SQL characters
```
Field: Name
Input: '; DROP TABLE donations;--
Expected: Form rejects or escapes (doesn't break database)
Check: In browser console, no errors. In server logs, no SQL errors.
```

**Step 2**: Same form - Test with numeric escape
```
Field: Amount
Input: 1' OR '1'='1
Expected: Server handles safely (no unexpected behavior)
```

**Step 3**: Volunteer Form - Test email field
```
Field: Email
Input: test@email.com'); DROP TABLE volunteers;--
Expected: Safely handled
```

**Step 4**: Debris Report Form - Test location field
```
Field: Location
Input: <img src=x onerror="alert('xss')">
Expected: Safely handled
```

**Documentation**: Create file `SECURITY_AUDIT_RESULTS.md` and record:
```markdown
# Security Audit - SQL Injection Testing

## Donations Form
- [ ] '; DROP TABLE donations;-- : PASSED (safely handled)
- [ ] 1' OR '1'='1 : PASSED

## Volunteer Form  
- [ ] SQL injection test 1: PASSED
- [ ] SQL injection test 2: PASSED

## Debris Report Form
- [ ] SQL injection test 1: PASSED
- [ ] SQL injection test 2: PASSED

## Summary
Total Tests: 6
Passed: 6
Failed: 0
Status: ✅ SAFE FROM SQL INJECTION
```

---

### 8.2: XSS (Cross-Site Scripting) Testing (2 hours)

**Overview**: XSS happens when user input appears in page without being escaped. Test if attackers can inject scripts.

**Test Injections**:
```javascript
<script>alert('xss')</script>
<img src=x onerror="alert('xss')">
<svg onload="alert('xss')">
javascript:alert('xss')
```

**Testing Steps**:

**Step 1**: Donation Form - Test name field
```
Field: Donor Name
Input: <script>alert('xss')</script>
Expected: Script does NOT execute
Visual: You see literal text "<script>..." displayed (if shown at all)
```

**Step 2**: Contact Form - Test message field
```
Field: Message
Input: <img src=x onerror="alert('xss')">
Expected: Image doesn't load, script doesn't execute
```

**Step 3**: Any user-input field
```
Input: javascript:alert('xss')
Expected: Not executed as code
```

**Documentation**: Add to `SECURITY_AUDIT_RESULTS.md`
```markdown
## XSS (Cross-Site Scripting) Testing

### Donation Form
- [ ] <script>alert('xss')</script> : PASSED (script not executed)
- [ ] <img onerror> : PASSED

### Contact Form
- [ ] <script> injection : PASSED
- [ ] Event handler injection : PASSED

### All Forms
- [ ] javascript: protocol : PASSED

## Summary
Total XSS Tests: 8
Passed: 8
Failed: 0
Status: ✅ SAFE FROM XSS
```

---

### 8.3: API Key Security (1 hour)

**Overview**: Verify API keys are never exposed in logs, network traffic, or source code.

**Testing Steps**:

**Step 1**: Browser Network Tab
- [ ] Open DevTools (F12) → Network tab
- [ ] Click a button that uses an API (e.g., "Get Location" on Debris Report)
- [ ] Watch network requests
- [ ] Verify: API keys NOT visible in request headers or URL
- [ ] Verify: API keys NOT visible in response body
- [ ] Expected: Keys stay on server, not sent to frontend

Storm Glass traffic should already pass this check. Once OpenUV & Visual Crossing keys are registered and added to `.env`, repeat the same verification for their endpoints.

**Step 2**: Server Logs
- [ ] Terminal where server is running
- [ ] Make API call (submit form)
- [ ] Check logs: Verify API keys NOT printed
- [ ] Check logs: Error messages don't expose keys

**Step 3**: Source Code Check
```cmd
findstr /r "STORMGLASS_API_KEY\|OPENUV_API_KEY\|VISUAL_CROSSING_API_KEY" server.js
```
- [ ] Should return lines showing usage (e.g., `process.env.STORMGLASS_API_KEY`)
- [ ] Should NOT show actual key values in code

**Step 4**: Environment Variables
- [ ] Open .env file
- [ ] Verify it's NOT in Git: `git status` should NOT show .env
- [ ] Check .gitignore contains `.env`

Confirm the existing Storm Glass key remains in `.env`, then add the newly registered OpenUV & Visual Crossing keys so upcoming deployment work uses real credentials.

**Documentation**: Add to audit results
```markdown
## API Key Security

- [ ] API keys not visible in Network tab ✅
- [ ] API keys not printed to server logs ✅
- [ ] API keys not hardcoded in source ✅
- [ ] .env file not in Git repository ✅
- [ ] .env in .gitignore ✅

Status: ✅ API KEYS PROPERLY PROTECTED
```

---

### 8.4: CORS & Rate Limiting (1 hour)

**Testing Steps**:

**CORS Testing** (Cross-Origin Resource Sharing):
- [ ] Open browser console on different domain
- [ ] Verify: API endpoints only respond to oceancare.vercel.app domain
- [ ] Verify: Requests from other domains are blocked (rejected)

**Rate Limiting Testing**:
- [ ] Run validation script 20 times in rapid succession:
```cmd
for /L %i in (1,1,20) do node validate-api-keys.js
```
- [ ] Expect: After 10 requests (limit), subsequent requests get rate limited
- [ ] Verify: 429 Too Many Requests status code appears
- [ ] Verify: After waiting 15 minutes, limit resets

`validate-api-keys.js` should report Storm Glass as configured. The script will flip fully green once OpenUV & Visual Crossing keys are registered and present in `.env`.

**Documentation**: Add results
```markdown
## CORS & Rate Limiting

- [ ] Cross-origin requests properly blocked ✅
- [ ] Rate limiting active (100 req/15min) ✅
- [ ] Sensitive endpoints limited (10 req/1hr) ✅
- [ ] 429 status code returned when exceeded ✅

Status: ✅ PROPERLY RATE LIMITED
```

---

### END OF DAY 8

- [ ] SQL injection testing complete (6/6 passed)
- [ ] XSS testing complete (8/8 passed)
- [ ] API key security verified
- [ ] CORS & rate limiting verified
- [ ] All results documented in `SECURITY_AUDIT_RESULTS.md`
- [ ] Daily: `npm test` showing 21/21 ✅

**Summary**: **0 CRITICAL SECURITY ISSUES FOUND** ✅

---

## DAYS 9-14: MULTI-DEVICE TESTING

### Multi-Device Test Matrix

You need to test on these combinations:

**Desktops** (Windows):
- [ ] 1920x1080 (full HD laptop)
- [ ] 1366x768 (common laptop)
- [ ] 1024x768 (older displays)

**Tablets**:
- [ ] iPad (768x1024 landscape & portrait)
- [ ] Android tablet (1080x1920)

**Mobile Phones**:
- [ ] iPhone/iOS (375x667)
- [ ] Android (414x896)

**Browsers** (test all on desktop):
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (if Mac available, or iOS)
- [ ] Edge (Windows)

### Testing Each Device - Checklist

For each device/browser combination, test:

**Page Load & Layout**
- [ ] All 7 pages load successfully
- [ ] No layout breaking (elements overlap, hidden, or jumbled)
- [ ] Text is readable (no tiny fonts on mobile)
- [ ] Images display properly (not stretched/squashed)
- [ ] Navigation works on mobile (hamburger menu if applicable)

**Forms**
- [ ] All form fields are accessible
- [ ] Form fields are appropriately sized (easy to tap on mobile)
- [ ] Form submit button is visible and clickable
- [ ] Form validation messages display
- [ ] Success messages display after submit

**API Features**
- [ ] Marine weather displays properly on Debris Report (Storm Glass already live)
- [ ] UV index displays properly on Volunteer page (requires newly registered OpenUV key)
- [ ] Climate trends display on homepage (requires newly registered Visual Crossing key)
- [ ] News feed scrolls smoothly
- [ ] Maps display and are interactive

**Performance**
- [ ] Pages load in < 3 seconds
- [ ] No console errors or warnings
- [ ] No network errors in DevTools

---

### Day 9-11: Tablet & Mobile Testing

**Test on Tablet** (if available, e.g., iPad):
- [ ] Homepage: All content visible, readable
- [ ] Donation page: Form usable with touch
- [ ] Volunteer page: UV index displays, form works
- [ ] Debris Report: Geolocation works, form submittable
- [ ] Other pages load/display correctly
- [ ] Landscape and portrait orientations both work

**Test on Mobile** (smartphone):
- [ ] Homepage: Mobile-optimized layout
- [ ] Navigation: Can access all pages (menu working)
- [ ] All forms: Inputs are large enough to tap
- [ ] Marine weather: Displays in readable format
- [ ] News feed: Scrollable, readable on small screen
- [ ] All buttons: Easily tappable (not too small)
- [ ] Geolocation: Works on mobile browser

**Documentation**: Create `MULTI_DEVICE_TEST_RESULTS.md`
```markdown
# Multi-Device Testing Results

## Desktop (1920x1080) - Chrome
- [ ] Homepage: PASSED
- [ ] How to Help: PASSED
- [ ] Volunteer: PASSED
- [ ] Report Debris: PASSED
- [ ] Projects: PASSED
- [ ] Contact: PASSED
- [ ] Team: PASSED

## Desktop (1366x768) - Chrome
- [ ] All pages: PASSED

## Mobile (iPhone) - Safari
- [ ] All pages: PASSED
- [ ] Forms usable: PASSED
- [ ] Responsive layout: PASSED

## Tablet (iPad) - Safari
- [ ] All pages: PASSED
- [ ] Landscape mode: PASSED
- [ ] Portrait mode: PASSED

## Summary
Total Tests: 50+ (7 pages × 7+ device/browser combos)
Passed: 50+
Failed: 0
Critical Issues: 0
Status: ✅ FULLY RESPONSIVE ACROSS ALL DEVICES
```

---

### Day 12-14: Performance & Accessibility

#### Performance Testing - Lighthouse

**Step 1**: Run Lighthouse on each page

In Chrome:
1. Open each page
2. Right-click → Inspect (DevTools)
3. Find "Lighthouse" tab
4. Click "Analyze page load"
5. Wait for results

**Step 2**: Check scores
- [ ] Performance: 90+ ✅
- [ ] Accessibility: 95+ ✅
- [ ] Best Practices: 90+ ✅
- [ ] SEO: 90+ ✅

**If Scores Below Target**:
- [ ] Compress images (use online tool or ImageOptim)
- [ ] Minify CSS/JavaScript (if not already)
- [ ] Enable lazy loading for images
- [ ] Review recommendations from Lighthouse

**Documentation**: 
```markdown
# Performance Results

## Page: Homepage
- Performance: 92 ✅
- Accessibility: 96 ✅
- Best Practices: 92 ✅
- SEO: 100 ✅

## Page: How to Help
- Performance: 91 ✅
- Accessibility: 95 ✅
- Best Practices: 91 ✅
- SEO: 100 ✅

[Continue for all 7 pages]

## Summary
All pages meet or exceed targets ✅
```

#### Accessibility Testing - WCAG AA

**Keyboard Navigation**:
- [ ] Tab through entire homepage
- [ ] Expected: Can access all clickable elements via Tab
- [ ] Expected: Focus indicator is visible
- [ ] Expected: All forms submittable via Enter key

**Color Contrast**:
- [ ] Use WebAIM Color Contrast Checker
- [ ] Verify all text meets WCAG AA standards
- [ ] Minimum: 4.5:1 for normal text, 3:1 for large text

**Screen Reader Testing** (optional but recommended):
- [ ] Use built-in screen reader (Windows Narrator, MacOS VoiceOver)
- [ ] Navigate homepage
- [ ] Expected: All images have alt text
- [ ] Expected: Headings are properly labeled
- [ ] Expected: Form labels associated with inputs

**Documentation**:
```markdown
# Accessibility (WCAG AA) Results

## Keyboard Navigation
- [ ] Homepage: PASSED (all elements accessible via Tab)
- [ ] All pages: PASSED

## Color Contrast
- [ ] Body text vs background: 7.2:1 (PASSED)
- [ ] Links: 5.1:1 (PASSED)
- [ ] Buttons: 4.8:1 (PASSED)

## Screen Reader
- [ ] Alt text on images: PASSED
- [ ] Form labels: PASSED
- [ ] Heading structure: PASSED

Status: ✅ WCAG AA COMPLIANT
```

---

## DAILY REGRESSION TESTING

**Every morning of Week 2**:
```cmd
npm test
```

Expected: 21/21 tests passing consistently

If any test fails:
1. Run again (could be flaky test)
2. Check if change was made since last pass
3. Roll back change if needed
4. Report issue

---

## END OF WEEK 2 CHECKLIST

**Security**:
- [ ] SQL injection testing: 0 vulnerabilities ✅
- [ ] XSS testing: 0 vulnerabilities ✅
- [ ] API key protection: Verified ✅
- [ ] CORS: Properly configured ✅
- [ ] Rate limiting: Active ✅
- [ ] Documented in `SECURITY_AUDIT_RESULTS.md` ✅
- [ ] OpenUV & Visual Crossing keys registered and stored alongside the validated Storm Glass key ✅

**Multi-Device Testing**:
- [ ] Tested on 3+ desktop resolutions ✅
- [ ] Tested on tablet ✅
- [ ] Tested on mobile ✅
- [ ] Tested in 4+ browsers ✅
- [ ] All pages responsive ✅
- [ ] All forms work on all devices ✅
- [ ] Documented in `MULTI_DEVICE_TEST_RESULTS.md` ✅

**Performance**:
- [ ] Lighthouse Performance: 90+ ✅
- [ ] Lighthouse Accessibility: 95+ ✅
- [ ] Page load time < 3 sec ✅
- [ ] Documented scores ✅

**Accessibility**:
- [ ] Keyboard navigation verified ✅
- [ ] Color contrast WCAG AA ✅
- [ ] Screen reader friendly ✅
- [ ] WCAG AA compliance verified ✅

**Regression**:
- [ ] 21/21 tests passing daily ✅
- [ ] No new bugs introduced ✅
- [ ] All features still working ✅

**Next Steps**:
- [ ] Review WEEK3_DEPLOYMENT_GUIDE.md
- [ ] Prepare Vercel account setup
- [ ] Plan soft launch date

---

## COMMON ISSUES & SOLUTIONS

### Issue: Lighthouse showing poor performance scores
**Solution**:
1. Check image file sizes (should be < 200KB each)
2. Remove unused CSS/JavaScript
3. Enable GZIP compression
4. Use CDN for static assets (Vercel handles this)

### Issue: Color contrast failing WCAG AA
**Solution**:
1. Darken text or lighten background
2. Increase font weight for small text
3. Use online tools to verify: webaim.org/resources/contrastchecker

### Issue: Form not working on mobile
**Solution**:
1. Check input field size (should be 44x44px minimum for touch)
2. Verify submit button is visible without scrolling
3. Check viewport meta tag in HTML: `<meta name="viewport">`

### Issue: Screen reader not reading content
**Solution**:
1. Add alt text to all images
2. Use semantic HTML: `<button>` not `<div>`
3. Associate labels with form inputs: `<label for="email">`

---

## SUCCESS CRITERIA FOR WEEK 2

✅ **SECURITY**: 0 critical vulnerabilities found  
✅ **DEVICES**: Tested on 5+ device/browser combinations  
✅ **PERFORMANCE**: All Lighthouse scores 90+  
✅ **ACCESSIBILITY**: WCAG AA compliant  
✅ **REGRESSION**: 21/21 tests passing consistently  

**Week 2 Complete** → Ready for Week 3 Deployment ✅

