#!/usr/bin/env node

/**
 * OceanCare Initiative - Week 1 Launch Setup Helper
 * Run this after registering API keys to verify setup is correct
 * Usage: node launch-setup-helper.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
  header: (msg) => console.log(`\n${colors.magenta}${msg}${colors.reset}\n`)
};

// Check 1: .env file exists
function checkEnvFile() {
  log.section('1. Environment File Check');

  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    log.error('.env file not found');
    return false;
  }

  log.success('.env file exists');

  // Read and check for placeholders
  const envContent = fs.readFileSync(envPath, 'utf8');

  const requiredKeys = [
    'STORMGLASS_API_KEY',
    'OPENUV_API_KEY',
    'VISUAL_CROSSING_API_KEY',
    'GNEWS_API_KEY',
    'GOOGLE_MAPS_API_KEY'
  ];

  let allKeysPresent = true;

  requiredKeys.forEach(key => {
    const hasKey = envContent.includes(`${key}=`);
    const hasPlaceholder = envContent.includes(`your_${key.toLowerCase()}_here`);

    if (!hasKey) {
      log.error(`${key} not found in .env`);
      allKeysPresent = false;
    } else if (hasPlaceholder) {
      log.warn(`${key} still has placeholder text`);
      allKeysPresent = false;
    } else {
      log.success(`${key} configured`);
    }
  });

  return allKeysPresent;
}

// Check 2: node_modules exists
function checkNodeModules() {
  log.section('2. Dependencies Check');

  const modulesPath = path.join(__dirname, 'node_modules');

  if (!fs.existsSync(modulesPath)) {
    log.error('node_modules not found - run: npm install');
    return false;
  }

  log.success('Dependencies installed');

  // Check key packages
  const requiredPackages = [
    'express',
    'sqlite3',
    'dotenv',
    'express-rate-limit',
    'node-fetch'
  ];

  let allPackagesPresent = true;

  requiredPackages.forEach(pkg => {
    const pkgPath = path.join(modulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      log.success(`${pkg} present`);
    } else {
      log.error(`${pkg} missing`);
      allPackagesPresent = false;
    }
  });

  return allPackagesPresent;
}

// Check 3: Server file exists
function checkServerFile() {
  log.section('3. Server File Check');

  const serverPath = path.join(__dirname, 'server.js');

  if (!fs.existsSync(serverPath)) {
    log.error('server.js not found');
    return false;
  }

  log.success('server.js exists');
  return true;
}

// Check 4: Test file exists
function checkTestFile() {
  log.section('4. Test File Check');

  const testPath = path.join(__dirname, 'server.test.js');

  if (!fs.existsSync(testPath)) {
    log.error('server.test.js not found');
    return false;
  }

  log.success('server.test.js exists');
  return true;
}

// Check 5: Frontend pages exist
function checkFrontendPages() {
  log.section('5. Frontend Pages Check');

  const pagesDir = path.join(__dirname, 'pages');
  const requiredPages = [
    'contact.html',
    'how-to-help.html',
    'login.html',
    'projects.html',
    'report-debris.html',
    'team.html',
    'volunteer.html'
  ];

  let allPagesPresent = true;

  if (!fs.existsSync(pagesDir)) {
    log.error('pages/ directory not found');
    return false;
  }

  requiredPages.forEach(page => {
    const pagePath = path.join(pagesDir, page);
    if (fs.existsSync(pagePath)) {
      log.success(`${page} present`);
    } else {
      log.error(`${page} missing`);
      allPagesPresent = false;
    }
  });

  return allPagesPresent;
}

// Check 6: Database setup
function checkDatabase() {
  log.section('6. Database Check');

  const dbPath = path.join(__dirname, 'oceancare.db');
  const backupDir = path.join(__dirname, '.backups');

  if (!fs.existsSync(dbPath)) {
    log.warn('oceancare.db not found - will be created when server starts');
  } else {
    log.success('oceancare.db exists');
  }

  if (!fs.existsSync(backupDir)) {
    log.warn('.backups/ directory not found - will be created when server starts');
  } else {
    log.success('.backups/ directory exists');

    // Count backup files
    const backups = fs.readdirSync(backupDir).filter(f => f.startsWith('oceancare-'));
    log.success(`${backups.length} backup(s) found`);
  }

  return true;
}

// Main execution
async function main() {
  log.header('🌊 OceanCare Initiative - Week 1 Launch Setup Helper 🌊');

  console.log('Checking your setup...\n');

  const checks = [
    { name: 'Environment File', fn: checkEnvFile },
    { name: 'Dependencies', fn: checkNodeModules },
    { name: 'Server File', fn: checkServerFile },
    { name: 'Test File', fn: checkTestFile },
    { name: 'Frontend Pages', fn: checkFrontendPages },
    { name: 'Database', fn: checkDatabase }
  ];

  const results = checks.map(check => ({
    ...check,
    result: check.fn()
  }));

  // Summary
  log.section('Summary');

  const passed = results.filter(r => r.result).length;
  const total = results.length;

  console.log(`Checks passed: ${passed}/${total}\n`);

  if (passed === total) {
    log.success('All checks passed! You are ready to:');
    console.log(`
  1. Run the validation script:
     ${colors.cyan}node validate-api-keys.js${colors.reset}

  2. Run the test suite:
     ${colors.cyan}npm test${colors.reset}

  3. Start the development server:
     ${colors.cyan}npm start${colors.reset}
    `);
  } else {
    log.error(`${total - passed} check(s) failed. Please resolve above issues and retry.`);
    process.exit(1);
  }
}

main().catch(error => {
  log.error(`Setup check failed: ${error.message}`);
  process.exit(1);
});
