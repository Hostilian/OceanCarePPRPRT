# Production Configuration Guide

This guide covers all environment variables and configurations needed to deploy OceanCare to production.

## Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env.production
   ```

2. **Fill in required values** (see sections below)

3. **Verify configuration:**
   ```bash
   npm run verify:config
   ```

---

## Critical Configuration (MUST SETUP BEFORE LAUNCH)

### 1. JWT Secret Key (CRITICAL - SECURITY)

**Why:** Used to sign authentication tokens. Different value per environment.

**Generate new secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Set in .env:**
```
JWT_SECRET=<your-generated-secret-above>
```

**⚠️ SECURITY:** 
- Never commit .env to git
- Use .gitignore to exclude .env
- Rotate on regular schedule
- Different secret per environment (dev/staging/prod)

---

### 2. Database Configuration

**Production:** PostgreSQL (required, not SQLite)

**Setup steps:**

a) **Create PostgreSQL database:**
```bash
createdb oceancare
createuser oceancare_user
psql oceancare -c "ALTER USER oceancare_user WITH PASSWORD 'strong-password-here';"
psql oceancare -c "GRANT ALL PRIVILEGES ON DATABASE oceancare TO oceancare_user;"
```

b) **Set connection string:**
```
DATABASE_URL=postgresql://oceancare_user:strong-password-here@localhost:5432/oceancare
```

c) **For cloud databases (AWS RDS, Heroku, etc.):**
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

d) **Test connection:**
```bash
npm run db:migrate
```

**Backup configuration:**
```
BACKUP_DIR=/backups/oceancare
BACKUP_RETENTION_DAYS=30
ENABLE_AUTO_BACKUP=true
```

---

### 3. Stripe Integration (PAYMENTS)

**Get Live Keys:**
1. Log into Stripe Dashboard
2. Switch to Live Mode (top toggle)
3. Navigate to API keys
4. Copy Secret and Publishable keys

**Set in .env:**
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

**Webhook Setup:**
1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `charge.refunded`
4. Copy webhook signing secret

**Set in .env:**
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_WEBHOOK_URL=https://yourdomain.com/api/webhooks/stripe
```

**Test payments:**
```bash
# Use Stripe test cards
# Success: 4242 4242 4242 4242
# 3D Secure: 4000 0025 0000 3155

npm run test:payments
```

---

### 4. Email Service (SendGrid)

**Get API Key:**
1. Log into SendGrid
2. Settings → API Keys
3. Create new API key (Full Access)
4. Copy key

**Set in .env:**
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=OceanCare Initiative
```

**Verify Domain:**
1. Settings → Sender Authentication
2. Authenticate your domain
3. Add DNS records
4. Verify records propagated

**Create Email Templates:**
```bash
npm run setup:email-templates
```

Templates needed:
- Donation Confirmation
- Volunteer Signup
- Debris Report Acknowledgment
- Contact Form Response
- Support Notifications

**Test email:**
```bash
npm run test:email test@example.com
```

---

## Secondary Configuration (RECOMMENDED)

### 5. Google Maps API

**Setup:**
1. Google Cloud Console → Create Project
2. Enable Maps JavaScript API
3. Create API Key (Restricted to JS origin)
4. Restrict to domains: yourdomain.com

**Set in .env:**
```
GOOGLE_MAPS_API_KEY=AIzaxxxxxxxxxxxxxxxx
```

### 6. GNews API (News Feed)

**Setup:**
1. Visit https://gnewsapi.com
2. Sign up for free API key
3. Free tier: 100 requests/day

**Set in .env:**
```
GNEWS_API_KEY=your-api-key
```

### 7. Monitoring & Error Tracking

**Option A: Sentry (Recommended)**
```
SENTRY_DSN=https://key@sentry.io/id
```

**Option B: Rollbar**
```
ROLLBAR_ACCESS_TOKEN=post_server_item_xxxxx
```

**Option C: CloudWatch (AWS)**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

---

## Security Configuration

### HTTPS/TLS Setup

**For Vercel/Heroku:**
- Automatic SSL certificate included
- Set ENFORCE_HTTPS=true

**For self-hosted:**
1. Generate certificate (Let's Encrypt):
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

2. Set in .env:
```
ENFORCE_HTTPS=true
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### CORS Configuration

**Allowed origins:**
```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Note:** Only HTTPS origins in production

### Rate Limiting

```
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

Stricter limits for sensitive endpoints (built-in).

---

## Deployment Platforms

### Vercel (Easiest)

1. Connect GitHub repository
2. Add environment variables in Project Settings
3. Deploy automatically on push

```bash
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET_KEY
# ... etc
vercel --prod
```

### Heroku

1. Create app: `heroku create oceancare`
2. Add config vars:
```bash
heroku config:set JWT_SECRET=xxxxx
heroku config:set STRIPE_SECRET_KEY=xxxxx
# ... etc
```

3. Deploy:
```bash
git push heroku main
```

### AWS EC2 / Self-Hosted

1. Install Node.js: `sudo apt-get install nodejs npm`
2. Clone repository
3. Create .env file with all variables
4. Install PM2:
```bash
npm install -g pm2
```

5. Start application:
```bash
pm2 start src/server.js --name oceancare
pm2 save
```

6. Setup NGINX reverse proxy (port 80/443 → 3000)

### DigitalOcean App Platform

1. Connect GitHub
2. Add environment variables
3. Deploy

---

## Verification Checklist

Before launching:

```bash
# 1. Verify all environment variables set
npm run verify:config

# 2. Run database migrations
npm run db:migrate

# 3. Run full test suite
npm test

# 4. Load test
npm run test:load -- --duration 60 --connections 100

# 5. Check for secrets in code
npm run audit:secrets

# 6. Security audit
npm audit
npm run audit:security

# 7. Lighthouse test
npm run lighthouse -- https://yourdomain.com

# 8. API health check
curl https://yourdomain.com/api/health
```

---

## Post-Deployment

### 1. Monitor Logs
```bash
# View application logs
tail -f /var/log/oceancare/app.log

# Or via Sentry/CloudWatch dashboard
```

### 2. Setup Alerts
- Email notifications if error rate > 1%
- Alert if response time > 1 second
- Alert if uptime < 99%

### 3. Regular Backups
```bash
# Manual backup
npm run db:backup

# Restore from backup
npm run db:restore -- backup-file.sql
```

### 4. Monitor Stripe
- Check dashboard for failed charges
- Review refunds/disputes
- Monitor webhook delivery

### 5. Monitor Email
- Check SendGrid dashboard for bounces
- Verify deliverability
- Monitor spam complaints

---

## Troubleshooting

### "Database connection failed"
```bash
# Check connection string
echo $DATABASE_URL

# Verify database exists
psql $DATABASE_URL -c "SELECT 1"

# Check credentials
psql -U oceancare_user -d oceancare -c "SELECT 1"
```

### "Stripe webhook not working"
```bash
# Verify webhook URL is publicly accessible
curl https://yourdomain.com/api/webhooks/stripe

# Check webhook secret is correct
grep STRIPE_WEBHOOK_SECRET .env
```

### "Emails not sending"
```bash
# Test SendGrid connection
npm run test:email test@example.com

# Check SendGrid activity
# Dashboard → Mail Activity → search for test address

# Verify domain authentication
npm run verify:email-domain
```

### "JWT authentication failing"
```bash
# Generate new secret
openssl rand -base64 32

# Update .env
JWT_SECRET=<new-secret>

# Restart application
pm2 restart oceancare
```

---

## Security Reminders

- ✅ Never commit .env to version control
- ✅ Use strong, random passwords
- ✅ Rotate secrets regularly
- ✅ Use HTTPS in production
- ✅ Enable CORS for your domain only
- ✅ Monitor logs for suspicious activity
- ✅ Keep dependencies updated
- ✅ Review OAuth scopes (only needed permissions)
- ✅ Test backup/restore procedures
- ✅ Document credentials securely (1Password, LastPass, etc.)

---

## Support

For issues:
1. Check logs: `npm run logs`
2. Run diagnostics: `npm run diagnose`
3. Test individual components: `npm run test:stripe`, `npm run test:email`, etc.
