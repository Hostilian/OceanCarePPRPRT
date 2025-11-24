# OceanCare Monitoring & Observability Guide

## Overview

This guide covers monitoring, logging, and observability strategies for the OceanCare platform in production.

## Core Principles

1. **Observability First**: Instrument code from the start
2. **Multiple Signals**: Logs, metrics, traces, and alerts
3. **Actionable Alerts**: Only alert on issues that need action
4. **Retention Policy**: Balance storage costs with investigation needs
5. **Security**: Protect sensitive data in logs

---

## Application Logging

### Log Levels

```javascript
// In src/server.js

const logger = {
  error: (msg, context) => console.error(`[ERROR] ${msg}`, context),
  warn: (msg, context) => console.warn(`[WARN] ${msg}`, context),
  info: (msg, context) => console.log(`[INFO] ${msg}`, context),
  debug: (msg, context) => {
    if (process.env.DEBUG) console.log(`[DEBUG] ${msg}`, context);
  }
};

// Usage
logger.error('Payment failed', { amount: 50, error: err.message });
logger.info('User registered', { userId: 123, email: 'user@example.com' });
logger.debug('Cache hit', { key: 'weather_34_-118', ttl: 250 });
```

### Structured Logging

```javascript
// Bad: Unstructured
console.log('User logged in');

// Good: Structured JSON
const logEntry = {
  timestamp: new Date().toISOString(),
  level: 'INFO',
  service: 'oceancare',
  event: 'user_login',
  userId: 123,
  email: 'user@example.com',
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
};

console.log(JSON.stringify(logEntry));
```

### Winston Logger Configuration

```javascript
// Install: npm install winston

const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'oceancare' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Logging Best Practices

```javascript
// ❌ Don't log sensitive data
logger.error('Payment failed', { token: 'sk_test_12345...', amount: 50 });

// ✅ Do log relevant context without secrets
logger.error('Payment failed', { 
  paymentId: 'pay_123',
  amount: 50,
  error: 'insufficient_funds',
  userId: 789
});

// ❌ Don't log raw errors
logger.error(err);

// ✅ Do log structured error information
logger.error('Database query failed', {
  error: err.message,
  code: err.code,
  query: 'SELECT * FROM volunteers WHERE id = ?',
  duration: 250
});

// ❌ Don't log on every request
app.get('/', (req, res) => {
  logger.info('GET /');
  res.send('OK');
});

// ✅ Do log only important events
app.post('/api/donate', (req, res) => {
  logger.info('Donation submitted', {
    amount: req.body.amount,
    userId: req.user.id
  });
});
```

---

## Metrics & Monitoring

### Key Metrics to Track

**Application Metrics:**
```javascript
const metrics = {
  // Request metrics
  requests_total: 0,
  requests_duration_ms: [],
  requests_errors: 0,
  
  // Business metrics
  donations_total: 0,
  donations_amount: 0,
  volunteers_registered: 0,
  debris_reports: 0,
  
  // System metrics
  memory_usage_mb: 0,
  cpu_usage_percent: 0,
  active_connections: 0,
  cache_hits: 0,
  cache_misses: 0
};
```

### Prometheus Metrics

```javascript
// Install: npm install prom-client

const prometheus = require('prom-client');

// Request counter
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Response time histogram
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Custom business metrics
const donationsTotal = new prometheus.Counter({
  name: 'donations_total',
  help: 'Total donations',
  labelNames: ['purpose', 'status']
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ 
      method: req.method, 
      route: req.route?.path || req.path,
      status: res.statusCode 
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path
    }, duration);
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Datadog Integration

```javascript
const StatsD = require('node-statsd').StatsD;

const client = new StatsD({
  host: process.env.DATADOG_HOST || 'localhost',
  port: 8125,
  prefix: 'oceancare.',
  mock: process.env.NODE_ENV === 'test'
});

// Track request
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    client.histogram('request.duration', duration, [
      `method:${req.method}`,
      `route:${req.route?.path}`,
      `status:${res.statusCode}`
    ]);
    
    client.increment('request.count', [
      `method:${req.method}`,
      `status:${res.statusCode}`
    ]);
  });
  
  next();
});

// Track business events
app.post('/api/donate', (req, res) => {
  client.increment('donation.submitted', [
    `purpose:${req.body.purpose}`,
    `amount:${req.body.amount}`
  ]);
  
  client.gauge('donation.amount', req.body.amount);
});
```

---

## Distributed Tracing

### OpenTelemetry Integration

```javascript
const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { registerInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-trace-jaeger');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

// Initialize tracer
const jaegerExporter = new JaegerExporter({
  host: process.env.JAEGER_HOST || 'localhost',
  port: process.env.JAEGER_PORT || 6831
});

const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));

opentelemetry.trace.setGlobalTracerProvider(tracerProvider);

// Get tracer
const tracer = opentelemetry.trace.getTracer('oceancare');

// Create spans
app.post('/api/donate', async (req, res) => {
  const span = tracer.startSpan('donate_payment');
  
  try {
    // Validate
    const validateSpan = tracer.startSpan('validate_donation', {
      parent: span
    });
    validateDonation(req.body);
    validateSpan.end();
    
    // Process payment
    const paymentSpan = tracer.startSpan('process_payment', {
      parent: span
    });
    const result = await processPayment(req.body);
    paymentSpan.end();
    
    // Send confirmation
    const emailSpan = tracer.startSpan('send_email', {
      parent: span
    });
    await sendConfirmationEmail(req.body.email);
    emailSpan.end();
    
    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
    res.json({ success: true });
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
    res.status(400).json({ success: false, error: error.message });
  } finally {
    span.end();
  }
});
```

---

## Error Tracking

### Sentry Integration

```javascript
// Install: npm install @sentry/node

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true })
  ]
});

// Attach to Express
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

// Capture exceptions
try {
  await processPayment(donation);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'payment_processing'
    },
    contexts: {
      donation: {
        amount: donation.amount,
        purpose: donation.purpose
      }
    }
  });
}

// Capture messages
Sentry.captureMessage('Donation processed successfully', {
  level: 'info',
  tags: {
    event: 'donation_success'
  }
});
```

---

## Health Checks

### Liveness & Readiness Probes

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Readiness check (includes dependencies)
app.get('/ready', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    externalApis: false
  };
  
  try {
    // Check database
    await db.query('SELECT 1');
    checks.database = true;
  } catch (e) {
    checks.database = false;
  }
  
  try {
    // Check cache
    await redis.ping();
    checks.redis = true;
  } catch (e) {
    checks.redis = false;
  }
  
  const allHealthy = Object.values(checks).every(v => v);
  
  res.status(allHealthy ? 200 : 503).json({
    ready: allHealthy,
    checks
  });
});
```

### Kubernetes Probes

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oceancare
spec:
  template:
    spec:
      containers:
      - name: oceancare
        image: oceancare:latest
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
```

---

## Alerting

### Alert Rules (Prometheus)

```yaml
groups:
  - name: oceancare
    rules:
    
    # High error rate
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
      for: 5m
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value }} errors/second"
    
    # High response time
    - alert: HighResponseTime
      expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
      for: 5m
      annotations:
        summary: "High response time"
        description: "P95 response time is {{ $value }}s"
    
    # Memory usage
    - alert: HighMemoryUsage
      expr: process_resident_memory_bytes / 1024 / 1024 > 500
      for: 5m
      annotations:
        summary: "High memory usage"
        description: "Memory usage is {{ $value }}MB"
    
    # Database errors
    - alert: DatabaseConnectionError
      expr: increase(db_errors_total[5m]) > 5
      for: 5m
      annotations:
        summary: "Database connection errors"
        description: "{{ $value }} database errors in last 5 minutes"
```

### Slack Notifications

```javascript
// npm install @slack/webhook

const { IncomingWebhook } = require('@slack/webhook');

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

function alertSlack(alert) {
  webhook.send({
    text: `⚠️ Alert: ${alert.title}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${alert.title}*\n${alert.description}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Severity*\n${alert.severity}`
          },
          {
            type: 'mrkdwn',
            text: `*Time*\n${new Date().toISOString()}`
          }
        ]
      }
    ]
  });
}

// Usage
if (errorRate > 0.01) {
  alertSlack({
    title: 'High Error Rate',
    description: `Error rate is ${errorRate} (threshold: 0.01)`,
    severity: 'Critical'
  });
}
```

---

## Dashboard & Visualization

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "OceanCare Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[1m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[1m])"
          }
        ]
      },
      {
        "title": "Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "process_resident_memory_bytes / 1024 / 1024"
          }
        ]
      },
      {
        "title": "Donations Total",
        "targets": [
          {
            "expr": "donations_total"
          }
        ]
      },
      {
        "title": "Active Volunteers",
        "targets": [
          {
            "expr": "volunteers_active"
          }
        ]
      }
    ]
  }
}
```

---

## Log Retention & Storage

### Log Rotation

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '30d'
    })
  ]
});
```

### CloudWatch Logs (AWS)

```javascript
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new WinstonCloudWatch({
      logGroupName: '/oceancare/application',
      logStreamName: `${process.env.NODE_ENV}-${process.env.HOSTNAME}`,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      messageFormatter: ({level, message, meta}) => 
        `[${level}] ${message} ${JSON.stringify(meta)}`
    })
  ]
});
```

---

## Performance Profiling

### Node.js Profiling

```bash
# Enable profiling
node --prof src/server.js

# Process profile
node --prof-process isolate-*.log > profile.txt

# View results
cat profile.txt
```

### Clinic.js

```bash
# Install
npm install -g clinic

# Profile application
clinic doctor -- node src/server.js

# Visit results at http://localhost:27519
```

---

## Security Monitoring

### Failed Login Tracking

```javascript
let failedLogins = {};

app.post('/api/auth/login', (req, res) => {
  const email = req.body.email;
  const key = `failed_${email}`;
  
  // Check failed attempts
  if (failedLogins[key] > 5) {
    logger.warn('Too many failed login attempts', { email });
    return res.status(429).json({ error: 'Too many attempts' });
  }
  
  // Attempt login
  const user = authenticateUser(email, req.body.password);
  
  if (!user) {
    failedLogins[key] = (failedLogins[key] || 0) + 1;
    logger.warn('Failed login attempt', { 
      email, 
      attempts: failedLogins[key] 
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Success
  delete failedLogins[key];
  res.json({ token: generateToken(user) });
});
```

### Suspicious Activity Alerts

```javascript
function checkSuspiciousActivity(req) {
  const suspicious = {
    unusualTime: new Date().getHours() < 6 || new Date().getHours() > 23,
    newLocation: isNewLocation(req.ip),
    newDevice: isNewDevice(req.get('user-agent')),
    largeTransaction: req.body.amount > 10000,
    rapidRequests: hasRapidRequests(req.ip)
  };
  
  if (Object.values(suspicious).filter(v => v).length > 2) {
    logger.warn('Suspicious activity detected', {
      userId: req.user.id,
      ip: req.ip,
      suspicious
    });
    
    // Could trigger additional verification
  }
}
```

---

## Compliance Monitoring

### GDPR Data Logging

```javascript
// Don't log personal data directly
logger.info('User updated email', {
  userId: 123, // ✅ OK
  oldEmail: 'user@example.com' // ❌ Remove
});

// Better approach
const hash = crypto.createHash('sha256')
  .update(email)
  .digest('hex');

logger.info('User updated email', {
  userId: 123,
  emailHash: hash
});
```

### Audit Logging

```javascript
async function auditLog(action, details) {
  await db.query(
    'INSERT INTO audit_logs (action, details, timestamp) VALUES (?, ?, ?)',
    [action, JSON.stringify(details), new Date()]
  );
  
  logger.info(`Audit: ${action}`, details);
}

// Usage
await auditLog('donation_created', {
  donationId: 1001,
  amount: 50,
  userId: 123
});

await auditLog('user_data_exported', {
  userId: 456,
  dataTypes: ['profile', 'donations', 'reports']
});

await auditLog('user_data_deleted', {
  userId: 789,
  reason: 'user_requested_deletion'
});
```

---

## Conclusion

Comprehensive monitoring ensures:
- ✅ Quick issue detection
- ✅ Performance optimization
- ✅ Compliance & security
- ✅ Data-driven decisions
- ✅ Improved user experience

**Monitor, alert, and improve continuously!**

---

**Last Updated**: 2024-01-15
**Document Version**: 1.0
**Related Docs**: PERFORMANCE_TESTING_GUIDE.md, DEPLOYMENT_READINESS_CHECKLIST.md
