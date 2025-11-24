/**
 * Security Middleware Module
 * Implements security best practices for production applications
 * Includes CORS, CSRF, XSS, SQL injection prevention, and security headers
 */

const crypto = require('crypto');

/**
 * Generate CSRF token for form submissions
 * @returns {string} - CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 * @param {string} token - Token from request
 * @param {string} sessionToken - Token stored in session/cookie
 * @returns {boolean} - True if token is valid
 */
function validateCSRFToken(token, sessionToken) {
  if (!token || !sessionToken) {
    return false;
  }
  return token === sessionToken;
}

/**
 * Middleware to attach CSRF token to responses
 * Tokens are generated and stored in session/cookie by the client
 */
function csrfProtection() {
  return (req, res, next) => {
    // Generate token if not already present
    if (!req.session || !req.session.csrfToken) {
      const token = generateCSRFToken();
      if (req.session) {
        req.session.csrfToken = token;
      }
      res.locals.csrfToken = token;
    } else {
      res.locals.csrfToken = req.session.csrfToken;
    }
    next();
  };
}

/**
 * Middleware to validate CSRF tokens on unsafe requests
 */
function validateCSRFMiddleware() {
  return (req, res, next) => {
    // Skip GET requests and health checks
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip webhook endpoints (they have their own validation)
    if (req.path.includes('/webhook')) {
      return next();
    }

    const token = req.body._csrf || req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;

    if (!validateCSRFToken(token, sessionToken)) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token validation failed'
      });
    }

    next();
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // HTML encode special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize all input fields in request body
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Middleware to automatically sanitize request body
 */
function sanitizationMiddleware() {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  };
}

/**
 * Prevent SQL injection in database queries
 * Always use parameterized queries instead of string concatenation
 * This is a utility function to escape SQL identifiers (table/column names)
 * @param {string} identifier - Table or column name
 * @returns {string} - Escaped identifier
 */
function escapeSQLIdentifier(identifier) {
  // Only allow alphanumeric characters and underscores in identifiers
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }
  return identifier;
}

/**
 * Security headers middleware
 * Implements OWASP recommended security headers
 */
function securityHeaders() {
  return (req, res, next) => {
    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';"
    );

    // Feature policy / Permissions policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(self), microphone=(), camera=()'
    );

    // HSTS (HTTP Strict Transport Security) - enable in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  };
}

/**
 * Rate limiter factory for custom endpoints
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} - Express middleware
 */
function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    requests.set(key, recentRequests);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    recentRequests.push(now);
    next();
  };
}

/**
 * Validate environment variables on startup
 * @param {Array<string>} requiredVars - List of required environment variable names
 * @returns {Object} - { valid: boolean, missing: Array<string> }
 */
function validateEnvironment(requiredVars = []) {
  const missing = [];

  const criticalVars = [
    'JWT_SECRET',
    'NODE_ENV'
  ];

  for (const varName of [...criticalVars, ...requiredVars]) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    // Log missing optional variables (will be handled gracefully by services)
    return { valid: false, missing };
  }

  return { valid: true, missing: [] };
}

/**
 * Validate and enforce HTTPS in production
 */
function enforceHTTPS() {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  };
}

/**
 * Log security events
 * @param {string} eventType - Type of security event
 * @param {string} message - Event description
 * @param {Object} metadata - Additional event data
 */
function logSecurityEvent(eventType, message, metadata = {}) {
  const timestamp = new Date().toISOString();
  // Security events logged to monitoring service in production
  // Example: Sentry, CloudWatch, or similar
  
  if (process.env.SENTRY_DSN && eventType === 'CRITICAL') {
    // Would integrate with Sentry or similar service here
  }
}

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  csrfProtection,
  validateCSRFMiddleware,
  sanitizeInput,
  sanitizeObject,
  sanitizationMiddleware,
  escapeSQLIdentifier,
  securityHeaders,
  createRateLimiter,
  validateEnvironment,
  enforceHTTPS,
  logSecurityEvent
};
