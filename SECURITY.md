# 🔒 OceanCare Security Guide

**Security best practices and configuration for OceanCare Initiative**

---

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Deployment Security](#deployment-security)
6. [Monitoring & Incident Response](#monitoring--incident-response)
7. [Compliance](#compliance)
8. [Security Checklist](#security-checklist)

---

## Security Overview

OceanCare implements defense-in-depth security with multiple layers of protection:

```
┌─────────────────────────────────────────┐
│        Browser / Client Application     │
├─────────────────────────────────────────┤
│    HTTPS/TLS Encryption (Transport)     │
├─────────────────────────────────────────┤
│    CORS / CSRF Protection (Network)     │
├─────────────────────────────────────────┤
│  Input Validation & Sanitization (App)  │
├─────────────────────────────────────────┤
│   Rate Limiting & DDoS Protection       │
├─────────────────────────────────────────┤
│  Authentication & Authorization (Auth)  │
├─────────────────────────────────────────┤
│   Database Encryption & Access Control  │
├─────────────────────────────────────────┤
│   Server & Infrastructure Security      │
└─────────────────────────────────────────┘
```

---

## Authentication & Authorization

### JWT Authentication

**Implementation:**

```javascript
// Generate token
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRY || '7d' }
);

// Use in API requests
fetch('/api/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Security Properties:**
- ✅ Signed with secret key
- ✅ Expiration time (7 days default)
- ✅ Role-based access control
- ✅ Cannot be forged without secret

### Password Security

**Password Hashing:**

```javascript
// Hash with bcryptjs (12 rounds)
const hash = await bcrypt.hash(password, 12);

// Verify
const match = await bcrypt.compare(password, hash);
```

**Requirements:**
- Minimum 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character

**Never:**
- Store plain text passwords
- Log passwords
- Send passwords in emails
- Use weak hashing algorithms

### CORS Configuration

**Allowed Origins (Production):**

```
https://oceancare.org
https://www.oceancare.org
```

**Implementation:**

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

---

## Data Protection

### Database Security

#### SQLite (Development Only)

```bash
# ❌ NOT recommended for production
# ❌ Single-file database vulnerable to access
# ❌ Limited encryption options
# ❌ No user access control
```

#### PostgreSQL (Production)

```bash
# ✅ Recommended for production
# ✅ Multi-user access control
# ✅ SSL/TLS connections
# ✅ At-rest encryption options
# ✅ Replication and failover support
```

**Configuration:**

```javascript
// Use SSL for database connections
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Set to true with proper certs
    }
  }
});
```

### Encryption at Rest

**Sensitive Data Fields:**
- Passwords (hashed with bcrypt)
- Payment tokens (stored encrypted, never raw card data)
- API keys (environment variables only)
- Personal information (optional encryption)

**Recommended:**
- Use database-level encryption (AWS KMS, Azure Key Vault)
- Enable transparent data encryption (TDE)
- Encrypt backups

### Encryption in Transit

**HTTPS/TLS Requirements:**

```javascript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

**SSL/TLS Configuration:**
- TLS 1.3 or higher
- Strong cipher suites
- Valid certificate from trusted CA
- Certificate auto-renewal (Let's Encrypt)

---

## API Security

### Input Validation

**All user input must be validated:**

```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

// Amount validation
if (amount < 0.50 || amount > 1000000) {
  return res.status(400).json({ error: 'Invalid amount' });
}

// Location validation
if (location.length < 2 || location.length > 200) {
  return res.status(400).json({ error: 'Invalid location' });
}
```

### Input Sanitization

**Prevent XSS and injection attacks:**

```javascript
// Remove HTML/script tags
const sanitized = input
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

// HTML encode special characters
const encoded = input
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
```

### SQL Injection Prevention

**Always use parameterized queries:**

```javascript
// ✅ SAFE - Uses parameterized query
db.run('SELECT * FROM users WHERE email = ?', [email], callback);

// ❌ UNSAFE - String concatenation
db.run(`SELECT * FROM users WHERE email = '${email}'`, callback);
```

### CSRF Protection

**Token-based protection:**

```javascript
// Generate token
const token = generateCSRFToken();

// Validate on unsafe requests
if (!validateCSRFToken(requestToken, sessionToken)) {
  return res.status(403).json({ error: 'CSRF validation failed' });
}
```

### Rate Limiting

**Prevents brute force and abuse:**

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // 100 requests per window
  message: 'Too many requests'
});

app.use('/api/', limiter);

// Strict limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10                    // 10 requests per hour
});

app.post('/api/donate', strictLimiter);
```

---

## Deployment Security

### Environment Variables

**Never commit secrets:**

```bash
# ✅ SAFE - Environment variable
const apiKey = process.env.STRIPE_SECRET_KEY;

# ❌ UNSAFE - Hardcoded
const apiKey = 'sk_live_xxxxx';
```

**Use `.env.example` for templates:**

```bash
STRIPE_SECRET_KEY=<add_your_key_here>
SENDGRID_API_KEY=<add_your_key_here>
JWT_SECRET=<generate_with_openssl>
```

### Security Headers

**Helmet.js configuration:**

```javascript
app.use(helmet());

// Headers added:
// X-Frame-Options: DENY (prevents clickjacking)
// X-Content-Type-Options: nosniff (prevents MIME sniffing)
// X-XSS-Protection: 1; mode=block (XSS protection)
// Strict-Transport-Security (HSTS)
// Content-Security-Policy (CSP)
```

### HTTPS/TLS

**Production requirements:**

```bash
# ✅ All connections must use HTTPS
# ✅ Valid certificate from trusted CA
# ✅ TLS 1.3 or higher
# ✅ Strong cipher suites
# ✅ HSTS enabled (min-age: 31536000)
# ✅ Certificate auto-renewal configured
```

### Firewall & Network

**Recommended AWS Security Groups:**

```
Inbound Rules:
  - Port 443 (HTTPS) from 0.0.0.0/0 ✅
  - Port 80 (HTTP) from 0.0.0.0/0 ✅ (redirect to HTTPS)
  - Port 3000 (App) from 0.0.0.0/0 ✅
  - Port 5432 (DB) from App Security Group only ✅
  
Outbound Rules:
  - All traffic to 0.0.0.0/0 ✅
```

---

## Monitoring & Incident Response

### Security Monitoring

**Log all security events:**

```javascript
// Log failed authentication
console.log('[SECURITY] Failed login attempt', { email, ip, timestamp });

// Log rate limit violations
console.log('[SECURITY] Rate limit exceeded', { ip, endpoint, timestamp });

// Log suspicious activity
console.log('[SECURITY] SQL injection attempt detected', { payload, ip });
```

### Error Logging

**Never expose sensitive information:**

```javascript
// ✅ Safe error response
return res.status(500).json({
  error: 'Database error',
  requestId: uuid()  // For support reference
});

// ❌ Unsafe error response
return res.status(500).json({
  error: 'Database connection failed at 192.168.1.1:5432'
});
```

### Incident Response

**If security incident occurs:**

1. **Immediate Actions (First Hour)**
   - Disable affected accounts
   - Isolate affected systems
   - Enable enhanced logging
   - Notify security team

2. **Investigation (First Day)**
   - Determine scope of breach
   - Identify affected users
   - Preserve evidence
   - Contact impacted parties

3. **Recovery (24-48 Hours)**
   - Patch vulnerability
   - Validate fixes
   - Monitor for reinfection
   - Post-mortem analysis

4. **Communication (Ongoing)**
   - Update users
   - Post status updates
   - Provide remediation guidance
   - Publish security advisory

---

## Compliance

### GDPR (European Users)

**Requirements:**
- ✅ Privacy policy prominently displayed
- ✅ Explicit consent before data collection
- ✅ Data deletion on request (right to be forgotten)
- ✅ Data portability (download own data)
- ✅ Breach notification within 72 hours

### CCPA (California Users)

**Requirements:**
- ✅ Privacy policy with CCPA notices
- ✅ Opt-out for data sales
- ✅ Right to delete personal information
- ✅ Right to know what data is collected

### PCI DSS (Payment Card Industry)

**Requirements:**
- ✅ Never store raw card data
- ✅ Use PCI-compliant payment processor (Stripe)
- ✅ Encrypt cardholder data in transit
- ✅ Regular security assessments
- ✅ Annual penetration testing

**OceanCare Compliance:**
- ✅ All payments through Stripe (PCI Level 1)
- ✅ Zero card data stored locally
- ✅ HTTPS for all transactions
- ✅ Secure token handling

### SOC 2 (Service Organization Control)

**Prepare for SOC 2 Type II audits:**
- ✅ Document security controls
- ✅ Implement change management
- ✅ Maintain audit logs
- ✅ Conduct security training
- ✅ Perform regular assessments

---

## Security Checklist

### Development Phase

- [ ] Use parameterized queries for all database operations
- [ ] Validate all user input
- [ ] Sanitize output to prevent XSS
- [ ] Use HTTPS for all connections
- [ ] Store sensitive data in environment variables
- [ ] Hash passwords with bcryptjs (12 rounds)
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Use security headers (Helmet)
- [ ] Log security events

### Pre-Deployment Phase

- [ ] Run security audit (`npm audit`)
- [ ] Review sensitive code paths
- [ ] Test all authentication flows
- [ ] Verify HTTPS/TLS configuration
- [ ] Test rate limiting
- [ ] Verify error message sanitization
- [ ] Review environment variable list
- [ ] Create incident response plan
- [ ] Train team on security practices
- [ ] Prepare security documentation

### Post-Deployment Phase

- [ ] Monitor application logs
- [ ] Set up security alerts
- [ ] Verify HSTS header
- [ ] Test CORS restrictions
- [ ] Monitor for suspicious activity
- [ ] Review failed authentication attempts
- [ ] Test incident response procedures
- [ ] Schedule regular security audits
- [ ] Update dependencies regularly
- [ ] Maintain security documentation

### Ongoing Maintenance

- [ ] Weekly: Review logs for anomalies
- [ ] Weekly: Check dependency updates
- [ ] Monthly: Security audit
- [ ] Monthly: Backup verification
- [ ] Quarterly: Penetration testing
- [ ] Quarterly: Compliance review
- [ ] Annually: Full security assessment

---

## Reporting Security Issues

**Please report security vulnerabilities responsibly:**

1. **Do not** post vulnerability publicly
2. **Email:** security@oceancare.org
3. **Include:**
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

4. **Timeline:**
   - 24 hours: Initial acknowledgment
   - 48 hours: Initial assessment
   - 7 days: Patch release
   - 14 days: Public disclosure

---

## Resources

### Security Testing Tools

- **OWASP ZAP** - Web application security scanner
- **npm audit** - Dependency vulnerability scanner
- **Snyk** - Real-time vulnerability monitoring
- **Burp Suite** - Web penetration testing

### Security Frameworks

- **OWASP Top 10** - Common vulnerabilities
- **CWE/SANS Top 25** - Most dangerous weaknesses
- **NIST Cybersecurity Framework** - Industry standards

### Further Reading

- [OWASP Secure Coding](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Stripe Security](https://stripe.com/docs/security)

---

**Protecting OceanCare. Protecting the planet.** 🌊🔒

*For security questions or concerns, contact: security@oceancare.org*
