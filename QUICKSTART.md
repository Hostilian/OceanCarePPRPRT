# 🌊 OceanCare Initiative - Quick Start Guide

**Get OceanCare running in under 5 minutes**

---

## ✨ System Requirements

- **Node.js:** 16+ 
- **npm:** 8+
- **Git:** Latest version
- **Disk space:** 500MB minimum

---

## 🚀 Installation (5 minutes)

### Step 1: Clone Repository

```bash
git clone https://github.com/Hostilian/OceanCarePPRPRT.git
cd OceanCarePPRPRT
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:** "added 256 packages"

### Step 3: Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# For development, the defaults work fine!
# For production, update the values in .env
```

### Step 4: Start Development Server

```bash
npm start
```

**Expected output:**
```
🌊 OceanCare Initiative Platform 🌊

✅ Server Status
   • Server running on port 3000
   • Environment: development
   
✅ Security Features
   • CORS enabled
   • Helmet security headers active
   
✅ Core Services
   • Email service: ⚠️  Not configured (optional)
   • Payment processing: ⚠️  Not configured (required for donations)
```

### Step 5: Open in Browser

Visit: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Run Tests

```bash
npm test
```

**Expected output:** "21 passed"

---

## 📝 Next Steps

### Local Development

1. **Open homepage:** http://localhost:3000
2. **Test volunteer signup:** http://localhost:3000/volunteer.html
3. **Test donation:** http://localhost:3000 (click "Make a Donation")
4. **Report debris:** http://localhost:3000/report-debris.html
5. **View API docs:** See `API_DOCUMENTATION.md`

### Configuration (Optional)

Create a `.env` file with these optional services:

```bash
# Stripe (for real payments)
STRIPE_SECRET_KEY=sk_test_your_test_key

# SendGrid (for email notifications)
SENDGRID_API_KEY=SG.your_api_key
```

See `.env.example` for all available options.

### Deploy to Production

Choose your platform:

- **[Vercel](DEPLOYMENT_GUIDE.md#deployment-to-vercel)** (Recommended)
- **[Heroku](DEPLOYMENT_GUIDE.md#deployment-to-heroku)**
- **[Railway](https://railway.app)**
- **[Render](https://render.com)**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🎮 API Quick Test

### Test Donation

```bash
curl -X POST http://localhost:3000/api/donate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "amount": 25.00,
    "purpose": "Coral Restoration"
  }'
```

### Test Volunteer Signup

```bash
curl -X POST http://localhost:3000/api/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Chen",
    "email": "sarah@example.com",
    "location": "San Francisco, CA",
    "area": "beach_cleanup"
  }'
```

### Test Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Great initiative!"
  }'
```

### Get News

```bash
curl http://localhost:3000/api/news | json_pp
```

---

## 📂 Project Structure

```
OceanCarePPRPRT/
├── public/               # Static files served to browser
│   ├── index.html        # Homepage
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── pages/            # Individual page HTML files
├── src/
│   ├── server.js         # Main Express server
│   ├── auth.js           # Authentication & JWT
│   ├── payment.js        # Stripe payment processing
│   ├── email.js          # Email notifications
│   └── security.js       # Security middleware
├── tests/
│   └── server.test.js    # Test suite
├── config/
│   ├── .env              # Environment variables (local)
│   └── vercel.json       # Vercel deployment config
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md             # This file
```

---

## 🔧 Common Commands

```bash
# Start development server
npm start

# Run tests
npm test

# View logs
npm start 2>&1

# Database backup
# Automatic daily at 2 AM, but manual:
node -e "require('./src/server.js')" 

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
PORT=3001 npm start
```

### Module not found error

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Database errors

```bash
# Reset database (WARNING: deletes all data!)
rm oceancare.db
npm start
```

### Cannot find python

Some native modules need Python:

```bash
# macOS
brew install python3

# Windows
# Download from python.org

# Linux
sudo apt-get install python3
```

---

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Vercel/Heroku setup
- **[Security Guide](SECURITY.md)** - Security best practices (coming soon)
- **[Mega Guide](docs/OCEANCARE_MEGA_GUIDE.md)** - Comprehensive guide

---

## 💬 Support

### Getting Help

1. **Check Troubleshooting section above**
2. **Read API_DOCUMENTATION.md**
3. **Review DEPLOYMENT_GUIDE.md**
4. **Contact support:** support@oceancare.org

### Report Issues

```bash
# Open issue on GitHub
# https://github.com/Hostilian/OceanCarePPRPRT/issues
```

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm test`)
- [ ] `.env` configured with production values
- [ ] Stripe account set up with API keys
- [ ] SendGrid/email service configured
- [ ] Database backups enabled
- [ ] HTTPS/SSL configured
- [ ] Monitoring and alerting set up
- [ ] Team trained on deployment
- [ ] Runbooks created for operations

See `DEPLOYMENT_GUIDE.md` for detailed checklist.

---

## 📋 Feature Checklist

**Core Features:**
- ✅ Homepage with mission and impact
- ✅ Donation system (with Stripe)
- ✅ Volunteer registration
- ✅ Debris reporting with GPS
- ✅ Contact form
- ✅ Real-time ocean data
- ✅ News aggregation
- ✅ User dashboard (coming soon)
- ✅ Email notifications
- ✅ Rate limiting & security

**Production Ready:**
- ✅ Error handling
- ✅ Input validation
- ✅ Security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Database backups
- ✅ Logging
- ✅ Test suite

---

## 🎉 What's Next?

### Immediate (Week 1)
1. Customize branding and colors
2. Update team information
3. Configure email service
4. Test all forms locally
5. Deploy to staging

### Short Term (Week 2-4)
1. Set up Stripe payments
2. Configure custom domain
3. Set up monitoring
4. Train team
5. Go live!

### Medium Term (Month 2-3)
1. Implement admin dashboard
2. Add user authentication
3. Create impact reports
4. Mobile app
5. Advanced analytics

---

## 📞 Contact

**Email:** support@oceancare.org  
**Phone:** +1 (555) OCEAN-CARE  
**Website:** https://oceancare.org  
**GitHub:** https://github.com/Hostilian/OceanCarePPRPRT

---

**🌊 Ready to protect our oceans? Let's go!**

*OceanCare Initiative - Protecting oceans, one action at a time.*
