# OceanCare Developer Quick Reference

## Quick Start

### Installation
```bash
# Clone repository
git clone <repo>
cd OceanCarePPRPRT

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### API Server
```bash
npm start            # Start production server (port 3000)
npm run dev          # Start development server
```

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=sqlite:./oceancare.db
# For production: postgresql://user:pass@host:5432/oceancare

# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

# Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Email
SENDGRID_API_KEY=SG_...
# Or use SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External APIs
WEATHER_API=open-meteo (free, no key needed)
AIR_QUALITY_API=openaq (free)
```

---

## File Structure Quick Reference

```
src/
  ├── server.js           # Main Express app (1630 lines)
  └── external-apis.js    # Weather, UV, air quality APIs

public/
  ├── css/styles.css      # All styles (form, notifications, responsive)
  ├── js/
  │   ├── form-validator.js
  │   ├── toast.js
  │   └── enhanced-forms.js   # Form validation & notifications
  └── pages/              # HTML pages

tests/
  ├── integration.test.js      # API endpoint tests
  ├── enhanced-forms.test.js   # Form validation tests
  └── external-apis.test.js    # API integration tests

docs/
  └── OCEANCARE_MEGA_GUIDE.md  # Comprehensive guide
```

---

## Common Tasks

### Adding a New API Endpoint

```javascript
// In src/server.js

// 1. Define route
app.get('/api/new-endpoint', generalLimiter, (req, res) => {
  try {
    const { param1, param2 } = req.query;
    
    // Validate
    if (!param1 || !param2) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    // Process
    const result = processData(param1, param2);
    
    // Respond
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 2. Test it
// In tests/integration.test.js
test('GET /api/new-endpoint returns data', async () => {
  const response = await request(app)
    .get('/api/new-endpoint?param1=test&param2=value');
  
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

### Adding Form Validation

```html
<!-- In HTML file -->
<form class="enhanced-form" id="my-form">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <span class="error-message"></span>
  </div>
  
  <div class="form-group">
    <label for="phone">Phone</label>
    <input type="tel" id="phone" name="phone" minlength="10">
    <span class="error-message"></span>
  </div>
  
  <button type="submit" id="submit-btn">Submit</button>
</form>

<script src="/js/enhanced-forms.js"></script>
<script>
  // Auto-initialized with enhanced-form class
  // Or manually:
  const handler = new EnhancedFormHandler('#my-form');
</script>
```

### Updating Database Schema

```javascript
// 1. Add migration file: migrations/001-add-new-table.sql
CREATE TABLE new_table (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_table_name ON new_table(name);

// 2. Run migration
sqlite3 oceancare.db < migrations/001-add-new-table.sql

// 3. Update server.js database initialization
// Add table creation in db initialization code
```

### Adding External API Integration

```javascript
// In src/external-apis.js

async function getNewData(latitude, longitude) {
  const cacheKey = `newdata_${latitude}_${longitude}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  try {
    // Fetch from external API
    const url = `https://api.example.com/data?lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Cache result
    cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    logger.error('API error', { error: error.message });
    
    // Return fallback data
    return {
      value: 'N/A',
      status: 'fallback'
    };
  }
}

// Export
module.exports = { getNewData };

// Use in server
const externalApis = require('./external-apis');

app.get('/api/newdata', async (req, res) => {
  const data = await externalApis.getNewData(
    req.query.latitude,
    req.query.longitude
  );
  res.json({ success: true, data });
});
```

---

## Testing Quick Reference

### Run Tests
```bash
# All tests
npm test

# Single file
npm test -- tests/integration.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test
npm test -- --testNamePattern="Email Validation"
```

### Test Template
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('should do something', () => {
    const result = functionToTest();
    expect(result).toBe(expected);
  });
  
  test('should handle errors', () => {
    expect(() => functionToTest(bad)).toThrow();
  });
});
```

### Testing API Endpoints
```bash
# Using curl
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com",...}'

# Using httpie
http POST localhost:3000/api/contact \
  name=Test email=test@example.com ...

# Using curl with variables
lat=34.0195
lon=-118.6814
curl "http://localhost:3000/api/weather?latitude=$lat&longitude=$lon"
```

---

## Debugging

### Enable Debug Mode
```bash
DEBUG=* npm start
```

### Use Node Inspector
```bash
node --inspect src/server.js
# Then visit chrome://inspect
```

### Check Server Status
```bash
# Health check
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/ready

# Metrics
curl http://localhost:3000/metrics
```

### View Logs
```bash
# PM2 logs (if using PM2)
pm2 logs oceancare

# File logs
tail -f logs/error.log
tail -f logs/combined.log
```

---

## Performance Tips

### Database
```javascript
// ❌ Bad: N+1 queries
users.forEach(user => {
  db.query('SELECT * FROM donations WHERE user_id = ?', user.id);
});

// ✅ Good: Single query
db.query('SELECT * FROM donations WHERE user_id IN (?)', [userIds]);
```

### Caching
```javascript
// ❌ Bad: No caching
app.get('/api/expensive', (req, res) => {
  const data = expensiveOperation();
  res.json(data);
});

// ✅ Good: With caching
const cache = new Map();
app.get('/api/expensive', (req, res) => {
  if (cache.has('key')) return res.json(cache.get('key'));
  const data = expensiveOperation();
  cache.set('key', data);
  res.json(data);
});
```

### External APIs
```javascript
// ✅ Good: Fallback data
try {
  const data = await fetchExternalAPI();
  res.json({ success: true, data });
} catch {
  res.json({ success: true, data: FALLBACK_DATA });
}
```

---

## Deployment Checklist

```bash
# 1. Test
npm test
npm run test:coverage

# 2. Build/prepare
npm install --production

# 3. Configure
# Update .env with production values

# 4. Database
# Backup existing database
# Run migrations if needed

# 5. Start
npm start
# Or with PM2: pm2 start src/server.js --name oceancare

# 6. Verify
curl http://localhost:3000/health
curl http://localhost:3000/ready

# 7. Monitor
pm2 logs oceancare
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run test:watch     # Watch tests
npm run lint           # Check code style

# Production
npm start              # Start production server
npm test              # Run tests once

# Database
npm run db:migrate    # Run migrations
npm run db:backup     # Backup database
npm run db:restore    # Restore database

# Performance
npm run test:coverage # Test coverage
npm run benchmark     # Performance benchmark
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT: no such file or directory` | Missing .env | `cp .env.example .env` |
| `Cannot find module` | Dependency not installed | `npm install` |
| `EADDRINUSE: address already in use` | Port 3000 in use | `kill -9 $(lsof -t -i :3000)` or change PORT |
| `Payment failed` | Wrong Stripe key | Check STRIPE_SECRET_KEY in .env |
| `Email not sent` | SendGrid/SMTP issue | Check email credentials in .env |
| `Database locked` | SQLite concurrency | Switch to PostgreSQL for production |
| `Test timeout` | Async code not completing | Add `jest.setTimeout(10000)` or check promises |

---

## Documentation Files

- **Full Guide**: docs/OCEANCARE_MEGA_GUIDE.md
- **API Reference**: API_TESTING_GUIDE.md
- **Test Suite**: TEST_SUITE_DOCUMENTATION.md
- **Performance**: PERFORMANCE_TESTING_GUIDE.md
- **Deployment**: DEPLOYMENT_READINESS_CHECKLIST.md
- **Monitoring**: MONITORING_AND_OBSERVABILITY_GUIDE.md
- **Project Summary**: FINAL_IMPLEMENTATION_SUMMARY.md

---

## Getting Help

1. **Check documentation**: Refer to guides above
2. **Read error messages**: They usually point to the problem
3. **Check logs**: `pm2 logs oceancare` or tail logs files
4. **Search code**: Use grep for similar implementations
5. **Ask team**: Document your question and context

---

## Last Updated
2024-01-15

## Version
1.0.0 - Production Ready

---

**Happy coding! 🚀**
