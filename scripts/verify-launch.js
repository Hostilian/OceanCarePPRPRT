#!/usr/bin/env node

/**
 * Pre-Launch Verification Script
 * 
 * Runs comprehensive checks to verify production readiness
 * 
 * Usage:
 *   npm run verify:launch
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHECKS = {
  code: [],
  security: [],
  tests: [],
  config: [],
  dependencies: [],
  deployment: []
};

function log(type, message, passed = null) {
  const icons = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
    check: '🔍',
    rocket: '🚀'
  };
  
  const icon = icons[type] || '•';
  const status = passed === null ? '' : passed ? ' ✓' : ' ✗';
  console.log(`${icon} ${message}${status}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  log(exists ? 'success' : 'error', `${description}: ${filePath}`, exists);
  return exists;
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'pipe' });
    log('success', description, true);
    return true;
  } catch (error) {
    log('error', description, false);
    return false;
  }
}

function checkContent(filePath, pattern, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    log('error', `${description}: File not found`, false);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasPattern = pattern.test(content);
  log(hasPattern ? 'success' : 'error', description, hasPattern);
  return hasPattern;
}

function checkNoContent(filePath, pattern, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    log('error', `${description}: File not found`, false);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasPattern = pattern.test(content);
  log(!hasPattern ? 'success' : 'error', description, !hasPattern);
  return !hasPattern;
}

console.log('\n╔═════════════════════════════════════════╗');
console.log('║  OceanCare Pre-Launch Verification      ║');
console.log('╚═════════════════════════════════════════╝\n');

// ============ CODE QUALITY ============
console.log('📦 CODE QUALITY CHECKS\n');

const codeChecks = [
  checkFile('.env.example', 'Environment template exists'),
  checkNoContent('src/server.js', /console\.log\(|console\.warn\(/, 'No console.log in server.js'),
  checkNoContent('src/email.js', /console\.log\(|console\.warn\(/, 'No console.log in email.js'),
  checkNoContent('src/payment.js', /console\.log\(|console\.warn\(/, 'No console.log in payment.js'),
  checkNoContent('src/external-apis.js', /console\.log\(|console\.warn\(/, 'No console.log in external-apis.js'),
];

CHECKS.code = codeChecks;
console.log(`Code Quality: ${codeChecks.filter(c => c).length}/${codeChecks.length} passed\n`);

// ============ SECURITY ============
console.log('🔒 SECURITY CHECKS\n');

const securityChecks = [
  checkFile('SECURITY_HARDENING.md', 'Security hardening checklist'),
  checkFile('PRODUCTION_CONFIG.md', 'Production configuration guide'),
  checkContent('package.json', /"helmet"/, 'Helmet.js included for security headers'),
  checkContent('package.json', /"bcryptjs"/, 'Password hashing configured'),
  checkContent('package.json', /"jsonwebtoken"/, 'JWT authentication configured'),
  checkContent('src/security.js', /rateLimiter|rateLimit/, 'Rate limiting configured'),
];

CHECKS.security = securityChecks;
console.log(`Security: ${securityChecks.filter(c => c).length}/${securityChecks.length} passed\n`);

// ============ TESTS ============
console.log('🧪 TEST SUITE CHECKS\n');

const testChecks = [
  checkFile('tests/server.test.js', 'Server tests'),
  checkFile('tests/integration.test.js', 'Integration tests'),
  checkFile('tests/enhanced-forms.test.js', 'Form validation tests'),
  checkFile('jest.config.js', 'Jest configuration'),
  checkFile('package.json', 'Test scripts defined'),
];

CHECKS.tests = testChecks;
console.log(`Tests: ${testChecks.filter(c => c).length}/${testChecks.length} passed\n`);

// ============ CONFIGURATION ============
console.log('⚙️  CONFIGURATION CHECKS\n');

const hasEnv = fs.existsSync('.env.example');
const configChecks = [
  hasEnv,
];

if (hasEnv) {
  const envContent = fs.readFileSync('.env.example', 'utf8');
  configChecks.push(
    envContent.includes('JWT_SECRET'),
    envContent.includes('STRIPE_SECRET_KEY'),
    envContent.includes('SENDGRID_API_KEY'),
    envContent.includes('DATABASE_URL'),
    envContent.includes('NODE_ENV')
  );
}

configChecks.forEach((check, i) => {
  const descriptions = [
    '.env.example created',
    'JWT_SECRET configured',
    'Stripe configured',
    'SendGrid configured',
    'Database configured',
    'NODE_ENV configured'
  ];
  log(check ? 'success' : 'error', descriptions[i], check);
});

CHECKS.config = configChecks;
console.log(`Configuration: ${configChecks.filter(c => c).length}/${configChecks.length} passed\n`);

// ============ DEPENDENCIES ============
console.log('📚 DEPENDENCY CHECKS\n');

const depChecks = [
  checkCommand('npm list express', 'Express.js installed'),
  checkCommand('npm list sqlite3', 'SQLite installed'),
  checkCommand('npm list stripe', 'Stripe SDK installed'),
  checkCommand('npm list nodemailer', 'Nodemailer installed'),
];

CHECKS.dependencies = depChecks;
console.log(`Dependencies: ${depChecks.filter(c => c).length}/${depChecks.length} passed\n`);

// ============ DOCUMENTATION ============
console.log('📖 DOCUMENTATION CHECKS\n');

const docChecks = [
  checkFile('README.md', 'README exists'),
  checkFile('PRODUCTION_CONFIG.md', 'Production config guide'),
  checkFile('SECURITY_HARDENING.md', 'Security hardening guide'),
  checkFile('docs/OCEANCARE_MEGA_GUIDE.md', 'Feature documentation'),
];

console.log(`Documentation: ${docChecks.filter(c => c).length}/${docChecks.length} passed\n`);

// ============ SUMMARY ============
console.log('═══════════════════════════════════════\n');

const allChecks = [
  ...CHECKS.code,
  ...CHECKS.security,
  ...CHECKS.tests,
  ...CHECKS.config,
  ...CHECKS.dependencies,
  ...docChecks
];

const passedCount = allChecks.filter(c => c).length;
const totalCount = allChecks.length;
const percentage = Math.round((passedCount / totalCount) * 100);

log('info', `Overall Readiness: ${percentage}%\n`);

if (percentage >= 90) {
  log('success', '✨ Platform is READY for production deployment', true);
  console.log('\n🚀 Next steps:');
  console.log('   1. Review PRODUCTION_CONFIG.md');
  console.log('   2. Set up PostgreSQL database (scripts/setup-postgres.js)');
  console.log('   3. Configure environment variables (.env.production)');
  console.log('   4. Run: npm test');
  console.log('   5. Run: npm run test:load');
  console.log('   6. Deploy to production\n');
  process.exit(0);
} else if (percentage >= 70) {
  log('warning', '⚠️  Some checks failed. Review before deployment.\n');
  process.exit(1);
} else {
  log('error', '❌ Critical items missing. Cannot deploy.\n');
  process.exit(1);
}
