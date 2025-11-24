# OceanCare Initiative - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** November 24, 2025

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Stripe Setup](#stripe-setup)
5. [Email Service Setup](#email-service-setup)
6. [Deployment to Vercel](#deployment-to-vercel)
7. [Deployment to Heroku](#deployment-to-heroku)
8. [GitHub Pages Static Hosting](#github-pages-static-hosting)
9. [Post-Deployment](#post-deployment)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Stripe account created and keys obtained
- [ ] Email service account set up (SendGrid recommended)
- [ ] Database migrations tested
- [ ] All tests passing (`npm test`)
- [ ] Security audit completed
- [ ] SSL/HTTPS certificate ready
- [ ] Domain configured and DNS updated
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Team trained on deployment process

---

## Environment Setup

### Step 1: Create Production .env File

Copy `.env.example` and create a production `.env` file with real values:

```bash
cp .env.example .env.production
```

### Step 2: Configure Critical Variables

```dotenv
# Server
NODE_ENV=production
PORT=3000

# Database (use PostgreSQL in production!)
DB_TYPE=postgres
DB_HOST=your-db-host.amazonaws.com
DB_PORT=5432
DB_NAME=oceancare_prod
DB_USER=oceancare_user
DB_PASSWORD=<strong_password>

# JWT
JWT_SECRET=<generate_with: openssl rand -base64 32>
JWT_EXPIRY=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxx
SENDGRID_FROM_EMAIL=noreply@oceancare.org
SENDGRID_SUPPORT_EMAIL=support@oceancare.org

# Security
CORS_ORIGIN=https://oceancare.org,https://www.oceancare.org
SECURE_COOKIES=true

# APIs (optional but recommended)
GNEWS_API_KEY=xxxxxx
GOOGLE_MAPS_API_KEY=xxxxxx
```

### Step 3: Validate Environment Variables

```bash
node -e "require('dotenv').config(); \
  const required = ['JWT_SECRET', 'STRIPE_SECRET_KEY', 'SENDGRID_API_KEY']; \
  required.forEach(v => console.log(v + ':', process.env[v] ? '✓' : '✗'));"
```

---

## Database Configuration

### PostgreSQL Migration (Recommended for Production)

**Advantages:**
- Scales better than SQLite
- Supports concurrent access
- Built-in replication and backups
- Industry standard

### Step 1: Create PostgreSQL Database

**Option A: AWS RDS**

1. Go to AWS RDS Console
2. Create new database:
   - Engine: PostgreSQL 14+
   - DB Instance: db.t3.micro (free tier eligible)
   - Storage: 20GB
   - Backup retention: 30 days
   - Multi-AZ: Yes (for production)

**Option B: Railway/Render (Simpler)**

1. Go to railway.app or render.com
2. Create new PostgreSQL database
3. Note connection string

### Step 2: Migrate Data from SQLite (Optional)

If you have existing data in SQLite:

```bash
# Create backup of current SQLite database
cp oceancare.db oceancare.db.backup

# Use migration script (to be created)
node scripts/migrate-sqlite-to-postgres.js

# Verify data migration
npm test
```

### Step 3: Connection String

Use environment variable:

```
DATABASE_URL=postgresql://user:password@host:5432/oceancare_prod
```

---

## Stripe Setup

### Step 1: Create Stripe Account

1. Go to stripe.com
2. Sign up for a Stripe account
3. Complete identity verification

### Step 2: Get API Keys

1. Go to Dashboard → Developers → API Keys
2. Copy:
   - **Secret Key** → `STRIPE_SECRET_KEY`
   - **Publishable Key** → `STRIPE_PUBLISHABLE_KEY`

### Step 3: Create Webhook Endpoint

1. Go to Developers → Webhooks
2. Add endpoint: `https://oceancare.org/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `charge.refunded`
4. Copy **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

### Step 4: Configure Payment Methods

1. Go to Payment Methods
2. Enable:
   - Credit/Debit Cards
   - Digital Wallets (Apple Pay, Google Pay)
3. Customization → Brand colors and logo

### Step 5: Test Integration

```bash
# Test with Stripe test keys
curl -X POST http://localhost:3000/api/donate/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "email": "test@example.com",
    "amount": 25.00,
    "purpose": "Testing"
  }'
```

### Step 6: Enable Live Mode

Once testing is complete:

1. Switch to Live API Keys in Stripe Dashboard
2. Update `.env.production` with live keys
3. Test with small donation
4. Monitor transactions in Stripe Dashboard

---

## Email Service Setup

### SendGrid (Recommended)

#### Step 1: Create SendGrid Account

1. Go to sendgrid.com
2. Sign up for free account
3. Complete domain verification

#### Step 2: Get API Key

1. Go to Settings → API Keys
2. Create new API Key
3. Select "Full Access"
4. Copy key → `SENDGRID_API_KEY`

#### Step 3: Configure Sender Email

1. Go to Settings → Sender Authentication
2. Verify your domain or email address
3. Use verified address in `SENDGRID_FROM_EMAIL`

#### Step 4: Create Email Templates (Optional)

1. Go to Marketing → Email Templates
2. Create templates for:
   - Donation confirmation
   - Volunteer signup
   - Debris report
   - Contact form response

#### Step 5: Test Email Service

```bash
node -e "
const email = require('./src/email');
email.initializeEmailService();
email.sendDonationConfirmation(
  'test@example.com',
  'Test User',
  25.00,
  'Testing'
).then(console.log);
"
```

---

## Deployment to Vercel

### Step 1: Prepare Repository

```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab
git push origin main
```

### Step 2: Connect to Vercel

1. Go to vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

1. In Vercel dashboard: Settings → Environment Variables
2. Add all variables from `.env.production`
3. Set to "Production" environment

### Step 4: Deploy

```bash
# Option A: Automatic (recommended)
# Push to main branch - Vercel deploys automatically

# Option B: Manual
vercel deploy --prod
```

### Step 5: Configure Database

**Important:** SQLite doesn't work on Vercel's serverless platform!

1. Go to vercel.postgres (or external database)
2. Create PostgreSQL database
3. Update connection string in environment variables
4. Run migrations on Vercel database

### Step 6: Custom Domain

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records (see Vercel instructions)
4. Wait for SSL certificate (usually instant)

---

## Deployment to Heroku

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from heroku.com/downloads

# Verify
heroku --version
```

### Step 2: Create Heroku App

```bash
heroku create oceancare-initiative
heroku addons:create heroku-postgresql:standard-0 -a oceancare-initiative
```

### Step 3: Configure Environment Variables

```bash
heroku config:set NODE_ENV=production -a oceancare-initiative
heroku config:set JWT_SECRET="$(openssl rand -base64 32)" -a oceancare-initiative
heroku config:set STRIPE_SECRET_KEY=sk_live_xxxxx -a oceancare-initiative
# ... add all other variables

# Verify
heroku config -a oceancare-initiative
```

### Step 4: Deploy

```bash
# Push code to Heroku
git push heroku main

# View logs
heroku logs --tail -a oceancare-initiative

# Open app
heroku open -a oceancare-initiative
```

### Step 5: Database Migrations

```bash
heroku run npm run migrate -a oceancare-initiative
```

### Step 6: Monitor Application

```bash
# View metrics
heroku metrics -a oceancare-initiative

# Check application health
curl https://oceancare-initiative.herokuapp.com/health
```

---

## GitHub Pages Static Hosting

GitHub Pages gives stakeholders a fast, serverless preview of the marketing site. Because the Express app already serves `public/` statically, both deployments rely on the same files.

1. **Enable Pages:** In GitHub → *Settings → Pages*, choose the `main` branch and the **root** folder. Pages will serve `https://<user>.github.io/OceanCarePPRPRT/`.
2. **Redirect root traffic:** The repository root `index.html` contains a lightweight redirect to `public/index.html`. No action needed—just keep the file committed.
3. **Use relative URLs:** Every HTML file under `public/` uses paths such as `css/styles.css` or `pages/contact.html`. This keeps links valid whether the content is served from `/` (Express) or `/OceanCarePPRPRT/public/` (Pages).
4. **Deploy changes:** Edit assets inside `public/`, run `npm start` locally to QA, then push to `main`. GitHub Pages rebuilds automatically within a minute.
5. **New assets:** Add images/scripts/fonts somewhere under `public/` so both GitHub Pages and Express can reach them without extra configuration.

> **Note:** GitHub Pages is meant for front-end previews only. Donate, volunteer, and debris-reporting flows still rely on the Express backend for API handling.

---

## Post-Deployment

### Step 1: Verify All Services

```bash
# Test API endpoints
curl https://oceancare.org/api/news
curl https://oceancare.org/api/ocean-conditions

# Test email service
curl -X POST https://oceancare.org/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com", "message": "Testing"}'

# Test Stripe integration
curl -X POST https://oceancare.org/api/donate/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com", "amount": 1}'
```

### Step 2: Set Up Monitoring

```bash
# Option A: New Relic
npm install newrelic
# Configure in code startup

# Option B: Datadog
# Follow Datadog setup instructions

# Option C: Sentry (Error tracking)
npm install @sentry/node
```

### Step 3: Configure SSL/HTTPS

Vercel and Heroku provide free SSL by default. Verify:

```bash
curl -I https://oceancare.org
# Should show "Strict-Transport-Security" header
```

### Step 4: Set Up Backups

```bash
# PostgreSQL automated backups (configured in database setup)

# Additional backup to AWS S3 (optional)
npm install aws-sdk
# Configure backup script
```

### Step 5: Create Runbooks

Create documentation for:
- Emergency procedures
- Common troubleshooting
- Database restore procedures
- Deployment rollback process

---

## Monitoring & Maintenance

### Daily Tasks

- [ ] Check error logs
- [ ] Verify database backups
- [ ] Monitor Stripe payments
- [ ] Check email delivery

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check security alerts
- [ ] Review failed transactions
- [ ] Update dependencies (`npm outdated`)

### Monthly Tasks

- [ ] Security audit
- [ ] Database optimization
- [ ] Performance analysis
- [ ] Backup restoration test

### Quarterly Tasks

- [ ] Full security scan
- [ ] Dependency updates
- [ ] Compliance checks
- [ ] Disaster recovery drill

---

## Troubleshooting

### Issue: Server won't start

**Solution:**
```bash
# Check environment variables
node -e "console.log(process.env.JWT_SECRET)"

# Check for syntax errors
npm test

# Run with verbose logging
DEBUG=* npm start
```

### Issue: Database connection fails

**Solution:**
```bash
# Test connection string
psql $DATABASE_URL -c "SELECT 1"

# Check connection limits
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

### Issue: Stripe payment fails

**Solution:**
1. Verify API keys are correct
2. Check Stripe webhook logs
3. Review transaction logs
4. Test with test card: 4242 4242 4242 4242

### Issue: Emails not sending

**Solution:**
```bash
# Test SendGrid API
curl -X GET https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY"

# Check sender email is verified
# Review SendGrid bounce list
```

### Issue: High memory usage

**Solution:**
```bash
# Check for memory leaks
node --inspect src/server.js

# Monitor with
watch free -h
```

---

## Rollback Procedures

### If deployment fails:

**Vercel:**
```bash
# Automatic rollback
# Go to Vercel dashboard → Deployments → Rollback
```

**Heroku:**
```bash
# Rollback to previous release
heroku releases:rollback -a oceancare-initiative
```

**Manual:**
```bash
git revert HEAD
git push origin main
```

---

## Performance Optimization

### Database Indexing

```sql
CREATE INDEX idx_donations_email ON donations(email);
CREATE INDEX idx_volunteers_location ON volunteers(location);
CREATE INDEX idx_debris_status ON debris_reports(status);
CREATE INDEX idx_contact_created ON contact_messages(createdAt);
```

### Caching

- Implement Redis for session caching
- Cache API responses (1 hour default)
- Compress static assets

### CDN

- Serve static files through Cloudflare/AWS CloudFront
- Cache images and CSS

---

## Next Steps

1. Configure monitoring and alerting
2. Set up CI/CD pipeline (GitHub Actions)
3. Create admin dashboard
4. Implement API rate limiting per user
5. Add webhook support for integrations
6. Scale database to production specs

---

**Support:** support@oceancare.org  
**Documentation:** https://oceancare.org/docs
