# OceanCare Initiative - Security Hardening Checklist

Complete this checklist before production launch.

## Code Security

- [ ] **Remove all hardcoded secrets**
  - [ ] No API keys in source code
  - [ ] No passwords in comments
  - [ ] No test credentials in production code
  - Run: `grep -r "sk_live\|pk_live\|password\|secret" src/ --exclude-dir=node_modules`

- [ ] **Remove debug code**
  - [x] No console.log statements (COMPLETED)
  - [ ] No commented-out code
  - [ ] No debugging breakpoints
  - [ ] No verbose error messages exposing internals
  
- [ ] **Audit dependencies**
  ```bash
  npm audit
  npm audit fix
  npm outdated
  ```
  - [ ] No known vulnerabilities
  - [ ] Critical and high vulnerabilities patched
  - [ ] All dependencies up to date

- [ ] **Remove unused dependencies**
  ```bash
  npx depcheck
  ```

- [ ] **Enable strict mode**
  - [ ] All .js files start with `'use strict';`
  - [ ] All modules in strict mode

## Authentication & Authorization

- [ ] **Generate strong JWT secret**
  - Secret length: 32+ characters
  - Algorithm: HS256 (HMAC SHA-256)
  - Generated cryptographically secure random
  - Different per environment (dev/staging/prod)
  - **Command:** `openssl rand -base64 32`

- [ ] **Implement password hashing**
  - [x] bcryptjs configured
  - [ ] Rounds: minimum 12
  - [ ] Test: `npm run test:password-hash`

- [ ] **Enable HTTPS everywhere**
  - [ ] All routes redirect HTTP → HTTPS
  - [ ] HSTS header enabled (1 year minimum)
  - [ ] Certificate valid and updated
  - [ ] Auto-renewal configured

- [ ] **Session security**
  - [ ] Session timeout: 1 hour
  - [ ] Secure cookie flags: HttpOnly, Secure, SameSite
  - [ ] Session storage: secure backend (not localStorage)

- [ ] **API Key security**
  - [ ] No API keys in URL parameters
  - [ ] API keys in Authorization header only
  - [ ] Rate limiting on all endpoints
  - [ ] Request signing/verification where applicable

## Database Security

- [ ] **Use PostgreSQL in production**
  - [ ] SQLite only for development
  - [ ] PostgreSQL with strong credentials

- [ ] **Database credentials**
  - [ ] Password: 20+ characters, mixed case, symbols
  - [ ] Stored in environment variables only
  - [ ] Limited-privilege user created
  - [ ] Root/admin never in production

- [ ] **Connection security**
  - [ ] Use SSL/TLS for remote connections
  - [ ] Connection pooling enabled
  - [ ] Max connections limited
  - [ ] Idle timeout: 5 minutes

- [ ] **Prepared statements**
  - [x] No string interpolation in queries
  - [x] Parameterized queries throughout
  - [ ] Test: `npm run test:sql-injection`

- [ ] **Encryption**
  - [ ] Sensitive data encrypted at rest
  - [ ] PII encrypted (email, phone if stored)
  - [ ] Encryption key: secure, rotated
  - [ ] No plaintext passwords stored

- [ ] **Database backups**
  - [ ] Automated daily backups
  - [ ] 30-day retention minimum
  - [ ] Backups encrypted
  - [ ] Restore tested monthly
  - [ ] Off-site backup storage

- [ ] **SQL injection prevention**
  - [x] All queries parameterized
  - [x] No dynamic SQL construction
  - [ ] Test with: `npm run test:security`

## API Security

- [ ] **Input validation**
  - [x] All user inputs validated
  - [x] Schema validation on POST/PUT
  - [x] Type checking enforced
  - [x] Length limits enforced
  - [ ] Test: `npm run test:validation`

- [ ] **Output encoding**
  - [ ] HTML output escaped
  - [ ] JSON properly formatted
  - [ ] No sensitive data in error messages
  - [ ] Client error messages vague (e.g., "Invalid credentials" not "User not found")

- [ ] **Rate limiting**
  - [x] General: 100 requests / 15 minutes
  - [x] Sensitive endpoints: 10 requests / 15 minutes
  - [ ] Per-user rate limiting
  - [ ] IP-based rate limiting
  - [ ] Test: `npm run test:rate-limit`

- [ ] **CORS configuration**
  - [ ] Only whitelisted origins allowed
  - [ ] Credentials not sent unnecessarily
  - [ ] Preflight requests handled
  - [ ] Test: `npm run test:cors`

- [ ] **CSP Headers**
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' for trusted sources
  ```

- [ ] **Security headers**
  - [x] Helmet.js configured
  - [x] X-Frame-Options: DENY
  - [x] X-Content-Type-Options: nosniff
  - [x] X-XSS-Protection: 1; mode=block
  - [ ] Test: `curl -I https://yourdomain.com | grep X-`

## File Upload Security

- [ ] **File upload restrictions**
  - [ ] Whitelist allowed file types
  - [ ] Maximum file size enforced
  - [ ] Virus scanning enabled (if applicable)
  - [ ] Files stored outside web root
  - [ ] Random filename generation

- [ ] **Prevent code execution**
  - [ ] .htaccess blocks script execution in uploads
  - [ ] Uploads not in web-accessible directory
  - [ ] No double-extension files allowed

## Secrets Management

- [ ] **.env.example created** (template only, no real values)
  - [x] Provided as reference
  - [ ] In version control (no secrets!)

- [ ] **.env not in git**
  - [ ] .gitignore includes: `.env, .env.*.local, *.pem, *.key`
  - [ ] Verify: `git ls-files | grep -E "\\.env|secret|key"`

- [ ] **Secrets rotation schedule**
  - [ ] JWT secret: every 90 days
  - [ ] API keys: every 180 days
  - [ ] Database password: every 90 days
  - [ ] Stripe keys: immediately if compromised

- [ ] **Secrets storage**
  - [ ] 1Password / LastPass / Vault for team access
  - [ ] Audit logs for access
  - [ ] Rotation documented

## Monitoring & Logging

- [ ] **Error handling**
  - [x] Errors logged server-side
  - [ ] Errors not exposed to client
  - [ ] Stack traces only in development
  - [ ] 500 error: "Internal server error" to client

- [ ] **Security event logging**
  - [ ] Failed login attempts logged
  - [ ] Admin actions logged
  - [ ] Authorization failures logged
  - [ ] Suspicious patterns detected

- [ ] **Log security**
  - [ ] Logs not readable by world
  - [ ] Logs stored securely
  - [ ] Log retention: 90 days minimum
  - [ ] Sensitive data not logged (passwords, tokens, PII)

- [ ] **Monitoring alerts**
  - [ ] Alert on high error rate (>1%)
  - [ ] Alert on repeated failed logins
  - [ ] Alert on unusual traffic patterns
  - [ ] Alert on database issues
  - [ ] Alert on certificate expiration (30 days before)

## Third-Party Services

- [ ] **Stripe integration**
  - [ ] Live API key (not test key)
  - [ ] Webhook endpoint secured
  - [ ] Webhook signature verified
  - [ ] Sensitive card data never stored
  - [ ] PCI compliance: Level 1 (using Stripe)

- [ ] **SendGrid integration**
  - [ ] API key with minimal scopes
  - [ ] Domain verified and authenticated
  - [ ] Bounce handling configured
  - [ ] Unsubscribe links included
  - [ ] DKIM/SPF/DMARC configured

- [ ] **External APIs**
  - [ ] API keys scoped to minimum needed
  - [ ] API rate limits understood
  - [ ] Fallback behavior if API fails
  - [ ] Error handling for API failures

## Infrastructure Security

- [ ] **Network security**
  - [ ] Firewall configured
  - [ ] Only needed ports open (80, 443)
  - [ ] SSH key authentication (not password)
  - [ ] SSH key 4096-bit RSA minimum
  - [ ] SSH timeout configured

- [ ] **Server hardening**
  - [ ] OS security updates applied
  - [ ] Non-root user runs application
  - [ ] File permissions: 644 (files), 755 (directories)
  - [ ] umask: 0027
  - [ ] SELinux or AppArmor enabled (Linux)

- [ ] **DDoS protection**
  - [ ] Cloudflare or similar enabled
  - [ ] Rate limiting at edge
  - [ ] Bot detection enabled

- [ ] **Backup security**
  - [ ] Backups encrypted
  - [ ] Backup storage: secure, access-controlled
  - [ ] Restore tested monthly
  - [ ] Disaster recovery plan documented

## Compliance & Privacy

- [ ] **GDPR compliance** (if applicable)
  - [ ] Privacy policy published
  - [ ] Cookie consent implemented
  - [ ] Data retention policy documented
  - [ ] Right to deletion implemented
  - [ ] Data export implemented
  - [ ] Data processing agreement with third parties

- [ ] **CCPA compliance** (if California users)
  - [ ] Privacy policy updated
  - [ ] Opt-out mechanism for data sales
  - [ ] Data access requests handled

- [ ] **Terms of Service**
  - [ ] Published and agreed to
  - [ ] Updated for launch features
  - [ ] Legal review completed

## Testing & Validation

- [ ] **Security testing**
  ```bash
  npm run test:security
  npm audit
  npm run test:owasp-top-10
  ```

- [ ] **Penetration testing**
  - [ ] Manual review of authentication
  - [ ] Manual review of API endpoints
  - [ ] Input fuzzing (basic)
  - [ ] Professional pentest scheduled (post-launch)

- [ ] **Load testing**
  ```bash
  npm run test:load -- --duration 60 --connections 100
  ```
  - [ ] No security degradation under load
  - [ ] Rate limiting still active
  - [ ] Timeouts configured

- [ ] **Browser security**
  - [ ] No sensitive data in localStorage
  - [ ] Secure cookie flags: HttpOnly, Secure, SameSite
  - [ ] XSS protection tested
  - [ ] CSRF tokens on forms

## Pre-Launch Security Audit

### Day Before Launch

1. **Code review**
   - [ ] No hardcoded secrets
   - [ ] No debug logging
   - [ ] Dependencies audit clean
   - [ ] Security headers in place

2. **Configuration review**
   - [ ] All environment variables set
   - [ ] HTTPS enforced
   - [ ] Database backed up
   - [ ] Email service tested

3. **Infrastructure check**
   - [ ] Firewall rules correct
   - [ ] SSL certificate valid
   - [ ] DNS configured
   - [ ] Monitoring alerts configured

4. **Service verification**
   - [ ] Stripe webhook responds
   - [ ] SendGrid can send emails
   - [ ] External APIs accessible
   - [ ] Database connections work

### Launch Day

- [ ] Monitor error logs every 5 minutes
- [ ] Monitor performance metrics
- [ ] Check Stripe dashboard for failed payments
- [ ] Check email delivery rates
- [ ] Verify mobile app works
- [ ] Test user signup flow
- [ ] Test donation flow

### Post-Launch

- [ ] Monitor for 24 hours continuously
- [ ] Check daily for security alerts
- [ ] Review logs for anomalies
- [ ] Confirm backups are running
- [ ] Test restore procedure
- [ ] Schedule security review (1 week post-launch)

## Incident Response

If security issue discovered:

1. **Contain**: Disable affected functionality if necessary
2. **Assess**: Determine scope and impact
3. **Communicate**: Notify users if data compromised
4. **Fix**: Patch vulnerability
5. **Verify**: Test fix thoroughly
6. **Deploy**: Roll out fix to production
7. **Monitor**: Watch for exploits
8. **Document**: Record incident for review

---

## Security Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Stripe Security Documentation](https://stripe.com/docs/security)

---

## Sign-Off

- [ ] Security lead review completed
- [ ] CTO approval obtained
- [ ] All items checked
- [ ] Ready for production deployment

**Date Completed:** ________________
**Reviewed By:** ________________
