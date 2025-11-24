# 🌊 OceanCare Initiative - Technical Documentation

**Production-Ready Ocean Conservation Platform**

---

## 📑 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [Database](#database)
7. [Security](#security)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

---

## 🚀 Quick Start

### For Developers
```bash
# Clone and install
git clone https://github.com/Hostilian/OceanCarePPRPRT.git
cd OceanCarePPRPRT
npm install

# Configure environment
cp .env.example config/.env
# Edit config/.env with your API keys

# Run server
node src/server.js

# Run tests
npm test

# Server running at http://localhost:3000
```

### For Users
Visit **https://oceancare.org** to:
- 💰 Donate and track impact
- 🙋 Sign up as a volunteer
- 📍 Report ocean debris
- 📰 Read ocean conservation news
- 🌊 Check ocean conditions

---

## 🏗️ Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                   Client (Browser/Mobile)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Express.js Server (Node.js)                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes & API Endpoints                           │  │
│  │  • /api/donate          (Stripe payments)        │  │
│  │  • /api/volunteer       (Signup)                 │  │
│  │  • /api/report-debris   (Submissions)            │  │
│  │  • /api/contact         (Messages)               │  │
│  │  • /api/news            (News feed)              │  │
│  │  • /api/ocean-conditions (Weather data)          │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middleware & Services                            │  │
│  │  • Authentication (JWT + bcryptjs)               │  │
│  │  • Payment Processing (Stripe SDK)               │  │
│  │  • Email Service (SendGrid/SMTP)                 │  │
│  │  • Security (Helmet, CORS, sanitization)         │  │
│  │  • Rate Limiting (express-rate-limit)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│                                                         │
│  • Stripe (Payment Processing)                          │
│  • SendGrid (Email Service)                             │
│  • GNews API (News Feed)                                │
│  • Open-Meteo (Weather Data)                            │
│  • OpenAQ (Air Quality Data)                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              SQLite / PostgreSQL Database               │
│                                                         │
│  Tables:                                                │
│  • users (accounts, authentication)                     │
│  • donations (donation records)                         │
│  • recurring_donations (monthly donors)                 │
│  • volunteers (volunteer profiles)                      │
│  • debris_reports (debris submissions)                  │
│  • contact_messages (contact form submissions)          │
│  • impact_metrics (impact tracking)                     │
└─────────────────────────────────────────────────────────┘
```

### Core Modules

**src/auth.js** - Authentication & Authorization
- JWT token generation and validation
- Password hashing (bcryptjs)
- Email validation
- Password strength requirements
- Role-based access control

**src/payment.js** - Payment Processing
- Stripe payment intents
- Payment confirmation and recording
- Recurring subscription management
- Receipt retrieval and generation
- Webhook event handling

**src/email.js** - Email Service
- Transactional email sending
- HTML-formatted templates
- Donation confirmations
- Volunteer signup confirmations
- Debris report acknowledgments
- Support notifications
- Supports SendGrid and SMTP

**src/security.js** - Security & Validation
- Input sanitization (XSS prevention)
- SQL injection prevention
- CSRF token generation
- Security headers
- Rate limiting configuration
- Environment validation

---

## 📡 API Reference

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

### Donations API

#### Create Payment Intent
```
POST /api/donate/create-payment-intent
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "amount": 50,
  "purpose": "coral_restoration"
}

Response:
{
  "success": true,
  "clientSecret": "pi_..._secret_...",
  "paymentId": "pi_...",
  "amount": 5000
}
```

#### Confirm Payment
```
POST /api/donate/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_...",
  "email": "john@example.com",
  "name": "John Doe",
  "amount": 50
}

Response:
{
  "success": true,
  "donationId": 1,
  "email_sent": true,
  "message": "Thank you for your donation!"
}
```

#### Get Donation (requires auth)
```
GET /api/donate?id=1
Authorization: Bearer <jwt_token>

Response:
{
  "id": 1,
  "donor_email": "john@example.com",
  "amount": 50,
  "status": "completed",
  "created_at": "2025-11-24T08:00:00.000Z"
}
```

### Volunteers API

#### Register as Volunteer
```
POST /api/volunteer
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-0123",
  "experience": "beginner",
  "availability": ["weekends"],
  "location": "California"
}

Response:
{
  "success": true,
  "volunteerId": 1,
  "email_sent": true,
  "message": "Thank you for volunteering!"
}
```

### Debris Reporting API

#### Report Ocean Debris
```
POST /api/report-debris
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "description": "Plastic bags near shore",
  "location": "Malibu Beach, CA",
  "latitude": 34.0195,
  "longitude": -118.6814,
  "photo_url": "https://example.com/photo.jpg"
}

Response:
{
  "success": true,
  "reportId": 1,
  "email_sent": true,
  "message": "Report submitted successfully"
}
```

### Contact Form API

#### Submit Contact Form
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I'd like to discuss a partnership..."
}

Response:
{
  "success": true,
  "messageId": 1,
  "email_sent": true,
  "message": "Thank you for contacting us"
}
```

### News API

#### Get Latest Ocean News
```
GET /api/news?limit=10

Response:
{
  "success": true,
  "articles": [
    {
      "title": "Ocean Cleanup Initiative Success",
      "description": "Record amounts of plastic removed...",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "source": "GNews",
      "published_at": "2025-11-24T10:00:00Z"
    }
  ]
}
```

### Ocean Conditions API

#### Get Ocean Conditions
```
GET /api/ocean-conditions?latitude=34.0195&longitude=-118.6814

Response:
{
  "success": true,
  "location": "Malibu Beach, CA",
  "conditions": {
    "temperature": 68,
    "humidity": 72,
    "wind_speed": 12,
    "uv_index": 6,
    "warnings": ["High UV Index"]
  },
  "updated_at": "2025-11-24T08:00:00Z"
}
```

---

## 💻 Installation & Setup

### Prerequisites
- Node.js 14+ 
- npm 6+
- Git
- Stripe account (for payments)
- SendGrid account (for emails)

### Step 1: Clone Repository
```bash
git clone https://github.com/Hostilian/OceanCarePPRPRT.git
cd OceanCarePPRPRT
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy example configuration
cp .env.example config/.env

# Edit with your settings
nano config/.env  # or open in your editor
```

### Step 4: Initialize Database
```bash
node scripts/migrate-database.js
```

### Step 5: Run Server
```bash
node src/server.js
```

Server will start on `http://localhost:3000`

### Step 6: Run Tests
```bash
npm test
```

---

## ⚙️ Configuration

### Environment Variables

#### Required for Production
```env
# Server
PORT=3000
NODE_ENV=production
SITE_URL=https://oceancare.org

# Security
JWT_SECRET=<generate with: openssl rand -base64 32>
CSRF_TOKEN_SECRET=<generate with: openssl rand -base64 32>

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/oceancare

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=no-reply@oceancare.org
```

#### Optional Services
```env
# News Feed
GNEWS_API_KEY=<from gnews.io>

# Error Tracking
SENTRY_DSN=<from sentry.io>

# Analytics
GOOGLE_ANALYTICS_ID=<from google.com/analytics>

# Maps (for debris location visualization)
GOOGLE_MAPS_API_KEY=<from google.com/maps/api>
```

### Feature Flags
```env
ENABLE_DONATIONS=true
ENABLE_VOLUNTEER=true
ENABLE_DEBRIS_REPORTING=true
ENABLE_CONTACT_FORM=true
ENABLE_NEWS_FEED=true
ENABLE_OCEAN_CONDITIONS=true
```

### Rate Limiting
```env
RATE_LIMIT_MAX_REQUESTS=100        # Per windowMs
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
STRICT_RATE_LIMIT_MAX_REQUESTS=10  # For sensitive endpoints
STRICT_RATE_LIMIT_WINDOW_MS=3600000 # 1 hour
```

---

## 🗄️ Database

### Schema

**users** table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**donations** table
```sql
CREATE TABLE donations (
  id INTEGER PRIMARY KEY,
  donor_email TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  donation_purpose TEXT,
  status TEXT DEFAULT 'completed',
  payment_method TEXT,
  stripe_payment_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**recurring_donations** table
```sql
CREATE TABLE recurring_donations (
  id INTEGER PRIMARY KEY,
  donor_email TEXT NOT NULL,
  donor_name TEXT NOT NULL,
  amount_monthly INTEGER NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**volunteers** table
```sql
CREATE TABLE volunteers (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  experience TEXT,
  availability TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**debris_reports** table
```sql
CREATE TABLE debris_reports (
  id INTEGER PRIMARY KEY,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  photo_url TEXT,
  status TEXT DEFAULT 'reported',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**contact_messages** table
```sql
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**impact_metrics** table
```sql
CREATE TABLE impact_metrics (
  id INTEGER PRIMARY KEY,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backups

Automated daily backups to `./backups/` at 2 AM UTC:
- Format: `oceancare-YYYY-MM-DDTHH-MM-SS.db`
- Retention: 30 days
- Stored in Git-ignored directory

Restore from backup:
```bash
cp backups/oceancare-2025-11-24T02-00-00.db oceancare.db
```

---

## 🔐 Security

### Key Security Features

✅ **HTTPS/TLS** - All production traffic encrypted  
✅ **JWT Authentication** - Stateless token-based auth  
✅ **Password Hashing** - bcryptjs with 12 salt rounds  
✅ **CSRF Protection** - CSRF token generation and validation  
✅ **XSS Prevention** - Input sanitization, HTML escaping  
✅ **SQL Injection Prevention** - Parameterized queries only  
✅ **Rate Limiting** - 100 requests/15 min, 10 requests/hour for sensitive endpoints  
✅ **Security Headers** - Helmet.js with strict CSP  
✅ **CORS Protection** - Whitelist trusted origins  
✅ **Input Validation** - Email, URL, phone validation  

### Compliance

- **GDPR** - User data collection with consent
- **CCPA** - Privacy policy and opt-out mechanisms
- **PCI DSS** - Payment Card Industry compliance (Stripe handles)

### Best Practices

1. **Never commit secrets** - Use .env files with .gitignore
2. **Rotate JWT secrets** - Every 90 days in production
3. **Use HTTPS only** - Always use TLS in production
4. **Update dependencies** - `npm audit` and patch monthly
5. **Monitor logs** - Use error tracking (Sentry recommended)
6. **Implement WAF** - Use Cloudflare or similar
7. **Regular backups** - Test restore procedures monthly

---

## 🚀 Deployment

### Recommended Platforms

#### Option 1: Vercel (Easiest)
```bash
npm install -g vercel
vercel login
vercel --prod
```

Configure environment variables in Vercel Dashboard:
- PORT=3000
- NODE_ENV=production
- DATABASE_URL=postgresql://... (use Railway for DB)
- JWT_SECRET, STRIPE_SECRET_KEY, SENDGRID_API_KEY, etc.

#### Option 2: Heroku
```bash
heroku login
heroku create oceancare-initiative
git push heroku main
heroku config:set JWT_SECRET=...
heroku logs -t
```

#### Option 3: AWS Lambda/API Gateway
See DEPLOYMENT_GUIDE.md for detailed instructions

### Database Migration (SQLite → PostgreSQL)

For production, upgrade from SQLite to PostgreSQL:

```bash
# Create PostgreSQL database
createdb oceancare

# Install psql client
npm install pg

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@host:5432/oceancare

# Run migration
node scripts/migrate-database.js
```

---

## ✅ Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- --testPathPattern=payment
```

### Test Coverage
```bash
npm test -- --coverage
```

### Key Test Files
- `tests/server.test.js` - Server initialization, routes
- (Integration tests to be added)

Current coverage: 21 tests passing ✅

---

## 🐛 Troubleshooting

### Server won't start
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution:** Change port or kill existing process
```bash
lsof -i :3000
kill -9 <PID>
```

### Database errors
```
Error: SQLITE_ERROR: no such table: users
```
**Solution:** Run migration script
```bash
node scripts/migrate-database.js
```

### Email not sending
- Verify SENDGRID_API_KEY in .env
- Check sender domain is verified in SendGrid
- Review SendGrid activity log for delivery status
- For SMTP: verify SMTP credentials and port

### Payment processing fails
- Verify STRIPE_SECRET_KEY starts with `sk_live_`
- Check Stripe webhook endpoint configuration
- Review Stripe logs at dashboard.stripe.com

### Missing environment variables
- Copy `config/.env.example` to `config/.env`
- Fill in all required keys
- Restart server

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm test`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request on GitHub

### Code Standards
- Use ESLint for style consistency
- Add tests for new features
- Document public functions with JSDoc
- Follow existing naming conventions

### Pull Request Checklist
- [ ] Tests passing
- [ ] No console.log() calls
- [ ] Updated documentation
- [ ] No credentials in code
- [ ] Reviewed by team member

---

## 📞 Support

**Need help?**
- 📖 Read the [QUICKSTART.md](./QUICKSTART.md) guide
- 🔒 Review [SECURITY.md](./SECURITY.md) for security questions
- 🚀 Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment issues
- 📋 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
- ✅ Review [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) before going live

**Contact Team**
- Team: team@oceancare.org
- Support: support@oceancare.org
- Emergencies: [emergency-contacts-configured-in-LAUNCH_CHECKLIST.md]

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

**OceanCare Initiative - Protecting Marine Ecosystems Worldwide 🌊**

*Version 1.0.0 | Production-Ready Platform*

*Last Updated: November 24, 2025*
