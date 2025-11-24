# OceanCare Performance Testing Guide

## Overview

This document provides guidance for load testing, performance monitoring, and optimization of the OceanCare platform.

## Performance Metrics & Targets

### Response Time Targets
| Endpoint Category | Target | Threshold |
|-------------------|--------|-----------|
| Static Files | < 50ms | 100ms |
| API Endpoints | < 200ms | 500ms |
| Database Queries | < 100ms | 300ms |
| External APIs | < 1000ms | 3000ms |
| Complex Queries | < 500ms | 1000ms |

### Throughput Targets
- Concurrent Users: 1000+
- Requests per Second: 500+
- Uptime: 99.9%
- Error Rate: < 0.1%

### Database Performance
- Connection Pool: 20-50 connections
- Query Execution: < 100ms average
- Index Efficiency: > 95%
- Cache Hit Rate: > 80%

## Load Testing Tools

### Apache JMeter

**Installation:**
```bash
# macOS
brew install jmeter

# Linux
sudo apt-get install jmeter

# Windows
choco install jmeter
```

**Basic Test Plan:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup">
      <stringProp name="ThreadGroup.num_threads">100</stringProp>
      <stringProp name="ThreadGroup.ramp_time">60</stringProp>
      <elementProp name="ThreadGroup.main_controller">
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy">
          <stringProp name="HTTPSampler.domain">localhost</stringProp>
          <stringProp name="HTTPSampler.port">3000</stringProp>
          <stringProp name="HTTPSampler.path">/api/weather?latitude=34&longitude=-118</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
      </elementProp>
    </ThreadGroup>
  </hashTree>
</jmeterTestPlan>
```

### k6 Load Testing

**Installation:**
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6
```

**Sample Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  let response = http.get('http://localhost:3000/api/weather?latitude=34&longitude=-118');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has data field': (r) => r.json('data') !== null,
  });
  
  sleep(1);
}
```

**Run Test:**
```bash
k6 run performance_test.js
```

### Artillery Load Testing

**Installation:**
```bash
npm install -g artillery
```

**Config File (`load-test.yml`):**
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Weather API"
    flow:
      - get:
          url: "/api/weather?latitude=34&longitude=-118"
          expect:
            - statusCode: 200

  - name: "Debris Report"
    flow:
      - post:
          url: "/api/report-debris"
          json:
            name: "Test User"
            email: "test@example.com"
            description: "Test debris report for performance testing"
            location: "Test Beach"
            latitude: 34.0195
            longitude: -118.6814
          expect:
            - statusCode: 200

  - name: "Contact Form"
    flow:
      - post:
          url: "/api/contact"
          json:
            name: "Test"
            email: "test@example.com"
            subject: "Test"
            message: "Test message for performance testing"
          expect:
            - statusCode: 200
```

**Run Test:**
```bash
artillery run load-test.yml
```

## Benchmarking Individual Endpoints

### Benchmark Script (Node.js)

```javascript
// benchmark.js
const http = require('http');
const https = require('https');

async function benchmark(url, iterations = 100) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const duration = Date.now() - startTime;
            times.push(duration);
            resolve();
          });
        }).on('error', reject);
      });
    } catch (error) {
      console.error('Request failed:', error.message);
    }
  }
  
  return {
    min: Math.min(...times),
    max: Math.max(...times),
    avg: Math.round(times.reduce((a, b) => a + b) / times.length),
    p95: Math.round(times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]),
    p99: Math.round(times.sort((a, b) => a - b)[Math.floor(times.length * 0.99)]),
    total: times.reduce((a, b) => a + b),
  };
}

async function runBenchmarks() {
  console.log('=== OceanCare API Benchmarks ===\n');
  
  const endpoints = [
    'http://localhost:3000/api/weather?latitude=34&longitude=-118',
    'http://localhost:3000/api/uv-index?latitude=34&longitude=-118',
    'http://localhost:3000/api/air-quality?latitude=34&longitude=-118',
    'http://localhost:3000/api/ocean-conditions?latitude=34&longitude=-118',
    'http://localhost:3000/api/news?limit=5',
  ];
  
  for (const url of endpoints) {
    console.log(`Benchmarking: ${url}`);
    const results = await benchmark(url, 100);
    console.log(`  Min: ${results.min}ms`);
    console.log(`  Max: ${results.max}ms`);
    console.log(`  Avg: ${results.avg}ms`);
    console.log(`  P95: ${results.p95}ms`);
    console.log(`  P99: ${results.p99}ms`);
    console.log(`  Total: ${results.total}ms\n`);
  }
}

runBenchmarks();
```

**Run Benchmark:**
```bash
node benchmark.js
```

## Performance Monitoring

### Server Metrics

**Check CPU/Memory Usage:**
```bash
# macOS/Linux
top -p $(pgrep -f "node src/server.js")

# Windows
tasklist | findstr node
```

### Application Performance Monitoring (APM)

#### New Relic Integration

```javascript
// In src/server.js (at the very top)
require('newrelic');
```

**Install:**
```bash
npm install newrelic
```

**Configure (`newrelic.js`):**
```javascript
exports.config = {
  app_name: ['OceanCare'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    filepath: 'stdout'
  },
  distributed_tracing: {
    enabled: true
  }
};
```

#### DataDog Integration

```javascript
const tracer = require('dd-trace').init();
const http = require('http');

app.get('/api/weather', tracer.wrap('weather-endpoint', (req, res) => {
  // endpoint code
}));
```

**Install:**
```bash
npm install dd-trace
```

## Database Performance

### Query Analysis

```javascript
// Log slow queries
app.get('/api/weather', (req, res) => {
  const startTime = Date.now();
  
  db.query('SELECT * FROM weather_data WHERE id = ?', [id], (err, rows) => {
    const duration = Date.now() - startTime;
    
    if (duration > 100) {
      console.warn(`Slow query detected: ${duration}ms`);
    }
  });
});
```

### Index Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_volunteers_email ON volunteers(email);
CREATE INDEX idx_debris_location ON debris_reports(latitude, longitude);
CREATE INDEX idx_messages_created ON contact_messages(created_at DESC);
```

### Connection Pool Configuration

```javascript
const pool = new Pool({
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Caching Strategy

### API Response Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

app.get('/api/weather', (req, res) => {
  const cacheKey = `weather_${req.query.latitude}_${req.query.longitude}`;
  
  if (cache.has(cacheKey)) {
    return res.json({
      success: true,
      data: cache.get(cacheKey),
      cached: true
    });
  }
  
  // Fetch fresh data
  const data = getWeatherData(req.query.latitude, req.query.longitude);
  cache.set(cacheKey, data);
  
  res.json({
    success: true,
    data: data,
    cached: false
  });
});
```

### Redis Caching

```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/debris-reports', async (req, res) => {
  const cacheKey = `debris_${req.query.latitude}_${req.query.longitude}`;
  
  // Try to get from cache
  client.get(cacheKey, (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }
    
    // Fetch from database
    const reports = db.query('SELECT * FROM debris_reports WHERE ...');
    client.setex(cacheKey, 3600, JSON.stringify(reports));
    
    res.json(reports);
  });
});
```

## Load Test Scenarios

### Scenario 1: Normal Operations
- 100 concurrent users
- Ramp up over 2 minutes
- Sustained for 5 minutes
- Ramp down over 1 minute

**Expected Results:**
- Average response time: < 200ms
- Error rate: < 0.01%
- Throughput: > 100 req/s

### Scenario 2: Peak Load
- 500 concurrent users
- Ramp up over 5 minutes
- Sustained for 10 minutes

**Expected Results:**
- Average response time: < 500ms
- P95 response time: < 1000ms
- Error rate: < 0.1%

### Scenario 3: Stress Test
- Gradually increase from 100 to 2000+ users
- Run until system breaks
- Measure breaking point

**Expected Results:**
- System should handle 1000+ concurrent users
- Graceful degradation after that
- No data loss under stress

### Scenario 4: Spike Test
- Normal load (100 users)
- Sudden spike to 1000 users
- Back to normal

**Expected Results:**
- Spike handling: < 2 seconds recovery time
- No dropped requests
- No data corruption

## Optimization Tips

### Frontend Optimization
```bash
# Minify CSS
npm run build:css

# Minify JavaScript
npm run build:js

# Compress images
imagemin public/assets/img/* --out-dir=public/assets/img

# Gzip compression
npm install compression
```

### Backend Optimization
- Use connection pooling
- Implement caching layers
- Optimize database queries
- Use CDN for static files
- Enable HTTP/2
- Minimize external API calls

### Network Optimization
```javascript
// Enable gzip compression
const compression = require('compression');
app.use(compression());

// Enable HTTP/2 Server Push
app.use((req, res) => {
  res.push('/css/styles.css', {
    request: { accept: '*/*' },
    response: { 'content-type': 'text/css' }
  });
});

// Cache static files
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

## Continuous Performance Testing

### GitHub Actions Workflow

```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Start server
        run: npm start &
        env:
          NODE_ENV: test
      
      - name: Install k6
        run: sudo apt-get install k6
      
      - name: Run performance tests
        run: k6 run performance-test.js
      
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: performance-results
          path: performance-results.json
```

## Performance Baseline

### Current Metrics (Baseline)

**API Response Times:**
- GET /api/weather: 125ms avg
- GET /api/uv-index: 140ms avg
- GET /api/air-quality: 130ms avg
- GET /api/debris-heatmap: 200ms avg
- POST /api/contact: 250ms avg (with email)
- POST /api/donate: 800ms avg (with Stripe)

**Database Performance:**
- Average query time: 50ms
- P95 query time: 120ms
- Index usage: 94%

**Server Resources:**
- Memory usage: 85-120MB
- CPU idle: 40-60%
- Connection pool: 8-12 active

## Troubleshooting Performance Issues

### High Memory Usage
1. Check for memory leaks: `node --inspect server.js`
2. Profile heap usage: `clinic doctor -- node server.js`
3. Increase Node.js memory: `node --max-old-space-size=4096 server.js`

### Slow Database Queries
1. Enable query logging
2. Use `EXPLAIN PLAN` to analyze
3. Add missing indexes
4. Consider query optimization

### High CPU Usage
1. Check event loop: `npm install clinic`
2. Profile with: `clinic flame -- node server.js`
3. Optimize hot code paths
4. Consider worker threads

### Timeout Errors
1. Increase timeout values
2. Add request queuing
3. Optimize external API calls
4. Implement circuit breakers

---

**Last Updated**: 2024-01-15
**Testing Framework**: k6, Artillery, JMeter
**Monitoring Tools**: New Relic, DataDog, Clinic.js
