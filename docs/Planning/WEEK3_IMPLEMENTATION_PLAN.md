# 🚀 WEEK 3 DEPLOYMENT & LAUNCH PLAN (Dec 6-21, 2025)

**Goal**: Deploy to production on Vercel + achieve 100% uptime first 24h + train team | **Effort**: 15-20 hours | **Success Criteria**: Live URL ✅ + 24h uptime ✅ + Team trained ✅

---

## Overview: Week 3 Roadmap

**Week 3 Focus**: Production deployment, monitoring, team training
- Deploy to Vercel (30-45 min)
- Configure environment variables
- Smoke test all endpoints on production
- Set up monitoring & error tracking
- 24-hour uptime verification
- Team training & handoff documentation

**Expected Duration**: 15-20 hours (can spread across team)

---

## Phase 1: Days 11-13 (Dec 6-8) — DEPLOYMENT TO VERCEL

### Day 11 (Dec 6, Saturday) — Pre-Deployment Verification (2 hours)

**Step 1: Final Code Review** — 30 min

```bash
# Ensure all code committed
git status
# Expected: working tree clean

# Check .env is NOT in git (safety check)
git log --name-status | grep ".env"
# Expected: (no results, .env should be in .gitignore)

# Verify no debug code
grep -r "console.log\|debugger\|TODO" src/ pages/
# Expected: minimal/none in production code

# Confirm all tests passing
npm test
# Expected: 21/21 passing
```

**Step 2: Environment Variable Checklist** — 30 min

Required variables for Vercel (will set in dashboard):

```dotenv
# API Keys (copy from local .env)
GNEWS_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
STORMGLASS_API_KEY=your_key_here
OPENUV_API_KEY=your_key_here
VISUAL_CROSSING_API_KEY=your_key_here

# Deployment settings
NODE_ENV=production
PORT=3000

# Optional: Error tracking (Sentry, etc.)
# SENTRY_DSN=https://...
```

**Check list**:
- [ ] All 5 API keys obtained and verified
- [ ] NODE_ENV set to "production"
- [ ] No hardcoded secrets in code
- [ ] .env file NOT in git (.gitignore verified)
- [ ] Database connection string correct

**Step 3: Vercel Account Setup** — 1 hour

```bash
# 1. Create free Vercel account (if not exists)
# Go to: https://vercel.com
# Sign up with GitHub (easiest - auto-connects repo)

# 2. Install Vercel CLI
npm install -g vercel

# 3. Login locally
vercel login

# 4. Link project to Vercel
cd /path/to/OceanCarePPRPRT
vercel link
# Select organization (personal)
# Select existing project or create new
# Expected: .vercel/ folder created
```

---

### Day 12 (Dec 7, Sunday) — Initial Deployment (1-2 hours)

**Step 1: Deploy to Vercel** — 15 min

```bash
# From project root
vercel
# or for production deployment:
vercel --prod

# Expected output:
# ✓ Linked to [your-org]/oceancare (created .vercel and added it to .gitignore)
# ✓ Connected to code repository
# ✓ Deployed to oceancare.vercel.app
```

**Step 2: Configure Environment Variables in Vercel** — 30 min

**In Vercel Dashboard** (vercel.com):
1. Go to your project → Settings → Environment Variables
2. Add all 5 API keys:
   - GNEWS_API_KEY
   - GOOGLE_MAPS_API_KEY
   - STORMGLASS_API_KEY
   - OPENUV_API_KEY
   - VISUAL_CROSSING_API_KEY
3. Set NODE_ENV=production
4. Save & trigger redeploy

```bash
# Redeploy after env vars set
vercel --prod
```

**Step 3: Verify Deployment** — 30 min

```bash
# Check deployment status
vercel status

# Visit your deployment URL
# https://oceancare.vercel.app (or your custom domain)

# Tests to run:
✓ Homepage loads (check news, climate trends)
✓ Donation form works (submit test donation)
✓ Volunteer form works (submit test data)
✓ Debris report works (check maps load)
✓ All API endpoints respond
✓ No console errors (check DevTools)
```

**Expected Issues & Fixes**:

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot find module" | Missing dependency | Check package.json has all deps |
| "API key not found" | Env var not set | Add to Vercel dashboard |
| "Port already in use" | Vercel auto-handles | Should work automatically |
| "CORS error" | Frontend origin issue | Update CORS in server.js if needed |
| "Database not persisting" | Expected on Vercel | ⚠️ Noted: data resets on cold start |
| "500 error" | Server crash | Check Vercel logs for error |

**Check Logs**:
```bash
# View real-time deployment logs
vercel logs oceancare.vercel.app

# Or in dashboard: Vercel → Deployments → Details → Functions/Logs
```

---

### Day 13 (Dec 8, Monday) — Post-Deployment Verification (3-4 hours)

**Step 1: Comprehensive Endpoint Testing** — 90 min

Test all 15+ endpoints on production:

| Endpoint | Method | Test | Expected | Status |
|----------|--------|------|----------|--------|
| `/` | GET | Load homepage | 200, <2s | ⏳ Test |
| `/api/news` | GET | Fetch news articles | 200, 6 articles | ⏳ Test |
| `/api/ocean-conditions` | GET | Fetch cached conditions | 200, data array | ⏳ Test |
| `/api/marine-weather` | GET | Marine weather (Storm Glass) | 200 or 503 (fallback) | ⏳ Test |
| `/api/uv-index` | GET | UV index (OpenUV) | 200 or 503 (fallback) | ⏳ Test |
| `/api/climate-trends` | GET | Climate trends (Visual Crossing) | 200 or 503 (fallback) | ⏳ Test |
| `/api/get-maps-key` | GET | Google Maps key | 200, key exposed? NO ✓ | ⏳ Test |
| `/api/geocode-location` | GET | Reverse geocoding | 200, address returned | ⏳ Test |
| `/api/debris-reports` | GET | Fetch all debris reports | 200, array (might be empty) | ⏳ Test |
| `POST /api/donate` | POST | Submit donation (test data) | 200/201, stored | ⏳ Test |
| `POST /api/volunteer` | POST | Submit volunteer form | 200/201, stored | ⏳ Test |
| `POST /api/report-debris` | POST | Submit debris report | 200/201, stored, on map | ⏳ Test |
| `POST /api/contact` | POST | Submit contact form | 200/201, stored | ⏳ Test |

**Tool**: Use Postman or curl to test each endpoint:

```bash
# Example: Test news endpoint
curl https://oceancare.vercel.app/api/news

# Example: Test donation (POST)
curl -X POST https://oceancare.vercel.app/api/donate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vercel.com","name":"Test","amount":25,"purpose":"cleanup"}'
```

**Expected**: All endpoints return 200 or 503 (with graceful fallback)

---

**Step 2: Mobile & Browser Testing** — 60 min

| Device | Test | Expected | Status |
|--------|------|----------|--------|
| iPhone (Safari) | Open oceancare.vercel.app | Fully responsive, no breaks | ⏳ Test |
| Android (Chrome) | Submit donation form | Form works, success message | ⏳ Test |
| iPad (landscape) | Check maps page | Maps display, interactive | ⏳ Test |
| Chrome Desktop | Full flow test | All pages load, no errors | ⏳ Test |
| Firefox Desktop | Compatibility check | Same as Chrome | ⏳ Test |

---

**Step 3: Error Handling & Fallback Testing** — 60 min

**Test graceful degradation when APIs are down**:

```bash
# Simulate API failure by temporarily stopping internet
# (or by adding wrong API key to test error handling)

# Test 1: Access homepage with no API calls failing
# Expected: Page loads, news shows fallback data

# Test 2: Access volunteer page with weather API down
# Expected: Form still works, weather widget shows fallback

# Test 3: Submit donation with partial API failure
# Expected: Donation stored despite API issues

# Test 4: View maps with Google Maps down
# Expected: Maps container visible, shows "Unable to load maps" gracefully
```

---

**Step 4: Performance Baseline** — 30 min

```bash
# Use Chrome DevTools → Lighthouse (production)
# Target metrics:

Performance:    >90
Accessibility: >90
Best Practices: >85
SEO:           >90

# Expected: All scores above thresholds
# Screenshot results for Week 3 report
```

---

## Phase 2: Days 14-15 (Dec 9-10) — Monitoring & Uptime Verification

### Day 14 (Dec 9) — 24-Hour Uptime Monitoring (2-4 hours)

**Set up automatic monitoring**:

**Option 1: Vercel Built-in Analytics** (Free)
```
Dashboard → Analytics
- Monitors uptime automatically
- Shows response times
- Alerts on errors
```

**Option 2: Uptime Monitor (Free Tool)** — Better for external verification
```
Go to: https://uptimerobot.com/
Create free account
Add monitor:
- URL: https://oceancare.vercel.app
- Check interval: 5 minutes
- Alert email: your_email@example.com

Expected: 100% uptime first 24 hours
```

**Option 3: Manual Monitoring** (if resources constrained)
```bash
# Run every 30 min for 24 hours:
curl -i https://oceancare.vercel.app
# Expected: 200 OK

# Log response times
for i in {1..48}; do
  echo "Check $i: $(date)" >> uptime.log
  curl -w "Time: %{time_total}s\n" https://oceancare.vercel.app >> uptime.log
  sleep 1800  # 30 min
done
```

**Expected Result**:
```
✅ 100% uptime (0 failed checks out of 48)
✅ Avg response time <500ms
✅ No 5xx errors
✅ No timeouts
```

---

### Day 15 (Dec 10) — Error Tracking & Monitoring Setup (2-3 hours)

**Set up Error Tracking (Sentry)** — Free tier sufficient

```bash
# 1. Create free Sentry account
# https://sentry.io/signup/

# 2. Create new project → Node.js

# 3. Get Sentry DSN (looks like: https://abc@def.ingest.sentry.io/123)

# 4. Add to Vercel environment variables
# SENTRY_DSN=https://abc@def.ingest.sentry.io/123

# 5. Add to server.js (already partially implemented)
# Install: npm install @sentry/node
```

**Alternative: Vercel Error Tracking** (Built-in)
```
Dashboard → Integrations → Find error tracking tool
Or manually check:
Deployments → Details → Monitoring/Logs
```

**Expected**:
- ✅ All errors logged automatically
- ✅ Email alerts on critical errors
- ✅ Error trends visible in dashboard
- ✅ Can debug production issues

---

**Database Persistence Note** ⚠️:

**Vercel's Ephemeral File System**:
```
SQLite data file is NOT persisted across Vercel cold starts
- Cold start: Server restarts (after 15+ min inactivity)
- Database file cleaned up
- All submissions lost

OPTIONS:
1. Accept this for MVP (data resets, fine for testing)
2. Migrate to PostgreSQL addon ($5-15/month)
   - Command: vercel env add DATABASE_URL
   - Update server.js to use pg instead of sqlite3
   - Or use managed service like Render (free tier available)

RECOMMENDATION for Week 3: Accept option 1 (MVP, data loss OK)
POST-LAUNCH: Implement option 2 (persistent database)
```

**For Heroku** (if switch later):
```
SQLite persists naturally
No cold start data loss
PostgreSQL not required
```

---

## Phase 3: Days 16-18 (Dec 11-13) — Team Training & Documentation

### Day 16 (Dec 11) — Create Operations Manual (2-3 hours)

**File**: `PRODUCTION_OPERATIONS_MANUAL.md`

Contents:

```markdown
# OceanCare Production Operations Manual

## Deployment Platform: Vercel

### Quick Links
- **Live URL**: https://oceancare.vercel.app
- **Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/Hostilian/OceanCarePPRPRT

### Critical Info
- **Free tier includes**: 100 GB bandwidth/month, unlimited deployments
- **No scaling cost** unless exceeding free tier
- **Database**: SQLite (data resets on cold start), consider PostgreSQL post-launch

### Deployment Process
1. Make changes locally
2. Test: `npm test` (expect 21/21)
3. Commit: `git add .` && `git commit -m "message"`
4. Push: `git push origin main`
5. Vercel auto-deploys from main branch
6. Verify in dashboard

### Monitoring Checklist (Daily)
- [ ] Visit https://oceancare.vercel.app (homepage loads)
- [ ] Check Vercel dashboard for errors
- [ ] Review error tracking (Sentry or Vercel logs)
- [ ] Confirm uptime >99.9%

### Common Issues & Fixes

**Issue: Donation form not working**
- Check: API key in Vercel env vars
- Fix: Re-deploy if keys changed

**Issue: Maps not loading**
- Check: Google Maps API key valid
- Fix: Verify quota not exceeded

**Issue: High latency**
- Check: Database size (if using SQLite)
- Solution: Consider PostgreSQL migration

**Issue: Server returning 500 errors**
- Check: Error logs in Vercel dashboard
- Solution: Debug locally, push fix, auto-redeploy

### Team Contacts
- Deployment Lead: [Name]
- Backend Owner: [Name]
- Emergency Contact: [Phone]

### Escalation Path
1. Check Vercel dashboard logs
2. Review GitHub issues
3. Check error tracking (Sentry)
4. Contact deployment lead
```

---

### Day 17 (Dec 12) — Team Training Session (2-3 hours)

**Training Agenda** (2-hour session):

**Part 1: Overview** (30 min)
- OceanCare mission & features recap
- Technology stack (Node.js, Express, SQLite, Vercel)
- Team member roles

**Part 2: How to Deploy** (45 min)
```
Walk through:
1. Making a code change
2. Testing locally (npm test)
3. Committing & pushing
4. Vercel auto-deployment
5. Verifying on production

Hands-on: Have team member make dummy change & deploy
```

**Part 3: Monitoring & Support** (30 min)
```
Walkthrough:
- Checking Vercel dashboard
- Reading error logs
- Using error tracking (Sentry)
- Responding to downtime alerts
- Database considerations (cold start resets)
```

**Part 4: Q&A** (15 min)

---

### Day 18 (Dec 13) — Post-Launch Handoff Documentation (1-2 hours)

**Create Handoff Document**:

File: `TEAM_HANDOFF_CHECKLIST.md`

```markdown
# Team Handoff Checklist

## Pre-Handoff Verification ✅

### Deployment
- [ ] Live URL accessible to team
- [ ] All 5 pages working on mobile + desktop
- [ ] Forms submitting successfully
- [ ] APIs responding (news, weather, maps)

### Monitoring Setup
- [ ] Vercel dashboard access granted to all team members
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Error tracking active (Sentry or Vercel)
- [ ] Email alerts enabled for critical errors

### Documentation
- [ ] Operations manual completed & shared
- [ ] Deployment guide accessible
- [ ] API key storage documented (in .env, not in git)
- [ ] Known limitations documented (SQLite cold start)

### Runbook for Common Tasks

#### Task: Fix critical bug in production
1. Fix locally, test: npm test
2. Commit & push to GitHub
3. Vercel auto-deploys within 2-5 min
4. Verify on production

#### Task: Update API key
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Update key
4. Re-deploy: vercel --prod
5. Verify endpoint works

#### Task: Respond to downtime alert
1. Check Vercel status (https://vercel.com/status)
2. Check error logs in Vercel dashboard
3. If critical: see runbook above
4. If Vercel issue: await their resolution

#### Task: Monitor performance
1. Open Vercel Analytics
2. Check: avg response time, uptime %, errors
3. If latency high: consider PostgreSQL migration

### Team Member Responsibilities

**Deployment Lead**:
- Primary responder to downtime
- Merges PRs to main
- Verifies production stability

**Backend Developer(s)**:
- Code quality, testing
- API endpoint health
- Error handling improvements

**Frontend Developer(s)**:
- Page responsiveness
- Form validation
- User experience

**QA/Tester**:
- Smoke testing pre-launch
- Regression testing post-updates
- Mobile device testing

### Escalation Path
1. Check Vercel/error tracking logs
2. Contact deployment lead
3. Page on-call engineer if critical
4. Post-mortem within 24h of major incident

### Monthly Checklist
- [ ] Verify all 5 pages working
- [ ] Check database size (if SQLite)
- [ ] Review error logs for patterns
- [ ] Check API quotas (news, maps, weather)
- [ ] Update documentation if needed
- [ ] Plan any maintenance windows

```

---

## Phase 4: Days 19-21 (Dec 14-16) — Launch Week Monitoring

### Day 19 (Dec 14, Sunday) — Public Launch Day

**Pre-Launch Checklist**:
```
✅ All tests passing (21/21)
✅ 24-hour uptime confirmed
✅ All endpoints verified
✅ Mobile responsive confirmed
✅ Error monitoring active
✅ Team trained & ready
✅ Documentation complete
✅ Backup of production data
✅ Incident response plan ready
✅ Team contact list posted
```

**Launch Activities**:
1. **Announce publicly** (email, social media, etc.)
2. **Monitor closely** — watch error logs every 15 min
3. **Be ready to hotfix** — have developer on standby
4. **Document metrics** — record first 24h stats

---

### Days 20-21 (Dec 15-16) — First 48 Hours Monitoring

**Monitoring Cadence**:
- Every 15 min: Check Vercel status page
- Every 30 min: Hit homepage + critical endpoints
- Every hour: Review error logs
- Every 4 hours: Check overall uptime percentage

**Expected Metrics** (First 48 hours):
```
Uptime:        99.9%+ ✅
Avg Response:  <500ms ✅
Error Rate:    <0.5% ✅
Page Load:     <2s ✅
API Endpoints: All responding ✅
```

**If Issues Arise**:
1. **Check Vercel logs** for error details
2. **Review error tracking** (Sentry/Vercel)
3. **Hotfix if simple** (push to GitHub, auto-deploy)
4. **Escalate if complex** (all-hands debugging)
5. **Communicate status** to team/stakeholders

---

## Week 3 Success Criteria Checklist

```
✅ DEPLOYMENT
  [ ] App deployed to Vercel
  [ ] All environment variables configured
  [ ] Live URL accessible (https://oceancare.vercel.app)
  [ ] Auto-deployment from GitHub working
  
✅ VERIFICATION
  [ ] 21/21 endpoints tested on production
  [ ] Mobile responsive confirmed (3+ devices)
  [ ] All forms working (donations, volunteers, debris)
  [ ] APIs responding (news, weather, maps)
  [ ] No console errors
  
✅ MONITORING
  [ ] Uptime monitoring configured (UptimeRobot)
  [ ] Error tracking active (Sentry or Vercel)
  [ ] Email alerts enabled
  [ ] 24-hour uptime verified (100% expected)
  
✅ TEAM READINESS
  [ ] Operations manual created & shared
  [ ] Team training completed
  [ ] Deployment runbook documented
  [ ] All team members have Vercel access
  [ ] Escalation contacts posted
  
✅ DOCUMENTATION
  [ ] Production handoff checklist signed off
  [ ] Known limitations documented (SQLite cold start)
  [ ] Post-launch procedure documented
  [ ] Team contact list established
  
✅ FIRST 48H LAUNCH
  [ ] Public announcement made
  [ ] Close monitoring first 24h (15-min checks)
  [ ] All systems stable (99.9%+ uptime)
  [ ] Error rate <0.5%
  [ ] Team confident in support
```

---

## Week 3 Time Budget

| Phase | Estimated Hours | Actual | Status |
|-------|-----------------|--------|--------|
| **Days 11-13: Deployment** | 5-6 | TBD | 🟡 PENDING |
| **Days 14-15: Monitoring Setup** | 4-6 | TBD | 🟡 PENDING |
| **Days 16-18: Team Training** | 3-4 | TBD | 🟡 PENDING |
| **Days 19-21: Launch & Monitoring** | 2-3 | TBD | 🟡 PENDING |
| **Buffer** | 1-2 | TBD | 🟡 PENDING |
| **TOTAL WEEK 3** | **15-20 hours** | TBD | 🟡 PENDING |

---

## Post-Launch: Optional Improvements (Dec 22+)

**Recommended enhancements** (not blocking launch):

1. **Database Migration to PostgreSQL** (4-6 hours)
   - Eliminates cold-start data loss
   - Supports growth beyond MVP
   - Cost: $5-15/month

2. **Custom Domain** (1-2 hours)
   - Register domain (e.g., oceancare.app)
   - Point DNS to Vercel
   - Update links in documentation

3. **Advanced Analytics** (2-3 hours)
   - Google Analytics integration
   - Track user journeys
   - Monitor feature adoption

4. **Email Notifications** (3-4 hours)
   - Send confirmation emails on donations
   - Notify volunteers of opportunities
   - Admin alerts on submissions

5. **Mobile App** (4-6 weeks)
   - React Native or Flutter
   - Push notifications
   - Offline mode

---

**Week 3 Status**: 🟡 **PENDING** (Starts Dec 6, 2025)
**Success Criteria**: Live URL + 24h uptime + Team trained
**End State**: Production-ready, monitored, team handoff complete

---

## Quick Reference: Vercel Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to staging (preview URL)
vercel

# Deploy to production (live URL)
vercel --prod

# Check status
vercel status

# View logs
vercel logs oceancare.vercel.app

# Link existing project
vercel link

# Open dashboard in browser
vercel
```

---

**Next Steps After Week 3**: Monitor production, respond to issues, plan post-launch improvements (database migration, features, scaling).
