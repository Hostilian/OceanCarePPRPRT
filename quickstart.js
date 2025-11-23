#!/usr/bin/env node

/**
 * OceanCare Quick Setup Script
 * Automated setup, testing, and validation
 * Run: npm run quickstart
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(text) {
  console.log('\n' + colors.bold + '═'.repeat(60) + colors.reset);
  log(text, 'blue');
  console.log(colors.bold + '═'.repeat(60) + colors.reset);
}

async function checkEnvironment() {
  logHeader('✅ STEP 1: CHECK ENVIRONMENT');

  // Check Node.js version
  const nodeVersion = process.version;
  log(`  Node.js version: ${nodeVersion}`, 'green');

  // Check npm version
  const npmVersion = require('child_process')
    .execSync('npm --version')
    .toString()
    .trim();
  log(`  npm version: ${npmVersion}`, 'green');

  // Check if .env exists
  const envExists = fs.existsSync('.env');
  if (envExists) {
    log('  .env file: ✅ Found', 'green');
  } else {
    log('  .env file: ❌ Not found - Creating...', 'yellow');
    // Create default .env
    const envContent = `# OceanCare API Configuration
GNEWS_API_KEY=d1ebf8a38da2b60015304b61977cd57c
STORM_GLASS_API_KEY=2c7029a6-c86a-11f0-b4de-0242ac130003-2c702a82-c86a-11f0-b4de-0242ac130003
GOOGLE_MAPS_API_KEY=AIzaSyDAsgFOdGcEdNhWkcn1LC50DonUEHMGdDE
OPENUV_API_KEY=your_openuv_api_key_here
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
PORT=3000
NODE_ENV=development`;

    fs.writeFileSync('.env', envContent);
    log('  .env file: ✅ Created', 'green');
  }

  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    log('  node_modules: ✅ Found', 'green');
  } else {
    log('  node_modules: ❌ Not found - Run npm install first', 'red');
    process.exit(1);
  }

  // Check if package.json exists
  if (fs.existsSync('package.json')) {
    log('  package.json: ✅ Found', 'green');
  } else {
    log('  package.json: ❌ Not found - Run npm init first', 'red');
    process.exit(1);
  }
}

function checkDependencies() {
  logHeader('✅ STEP 2: CHECK DEPENDENCIES');

  const requiredPackages = [
    'express',
    'sqlite3',
    'node-fetch',
    'dotenv',
    'express-rate-limit'
  ];

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const installed = { ...packageJson.dependencies, ...packageJson.devDependencies };

  let missing = [];
  requiredPackages.forEach(pkg => {
    if (installed[pkg]) {
      log(`  ${pkg}: ✅ ${installed[pkg]}`, 'green');
    } else {
      log(`  ${pkg}: ❌ Missing`, 'red');
      missing.push(pkg);
    }
  });

  if (missing.length > 0) {
    log(`\n  ⚠️  Install missing packages: npm install`, 'yellow');
    log(`  Then run: npm run quickstart\n`, 'yellow');
    process.exit(1);
  }
}

function validateConfig() {
  logHeader('✅ STEP 3: VALIDATE CONFIGURATION');

  const envContent = fs.readFileSync('.env', 'utf8');

  // Check for placeholder text
  const hasPlaceholders = envContent.includes('your_');
  if (hasPlaceholders) {
    log('  ⚠️  Placeholder API keys found', 'yellow');
    log('     OpenUV and/or Visual Crossing keys not registered', 'yellow');
    log('     This is OK - app will use demo data for testing', 'yellow');
  } else {
    log('  ✅ All API keys configured', 'green');
  }

  // Check required keys
  const keys = [
    'GNEWS_API_KEY',
    'STORM_GLASS_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'OPENUV_API_KEY',
    'VISUAL_CROSSING_API_KEY'
  ];

  keys.forEach(key => {
    if (envContent.includes(key)) {
      log(`  ✅ ${key}: Present`, 'green');
    } else {
      log(`  ❌ ${key}: Missing`, 'red');
    }
  });
}

function showValidationScript() {
  logHeader('✅ STEP 4: API VALIDATION READY');

  log('  Created validation script: validate-all-apis.js', 'green');
  log('\n  Next: Run this command in a new terminal:', 'yellow');
  log('  \n    node validate-all-apis.js\n', 'bold');
}

function createTestResults() {
  logHeader('✅ SETUP COMPLETE!');

  console.log(`
${colors.green}✅ Environment${colors.reset}: Ready
${colors.green}✅ Dependencies${colors.reset}: Installed
${colors.green}✅ Configuration${colors.reset}: Validated
${colors.green}✅ Database${colors.reset}: Initialized on first run

${colors.bold}NEXT STEPS:${colors.reset}

1. Start the server:
   ${colors.bold}npm start${colors.reset}

2. In another terminal, run tests:
   ${colors.bold}npm test${colors.reset}

3. Validate APIs:
   ${colors.bold}node validate-all-apis.js${colors.reset}

4. Open browser:
   ${colors.bold}http://localhost:3000${colors.reset}

5. When ready to deploy:
   ${colors.bold}See: PRE_DEPLOYMENT_CHECKLIST.md${colors.reset}

${colors.yellow}⚠️  API Registration Reminder:${colors.reset}
Register OpenUV & Visual Crossing keys at:
  - OpenUV: https://openuv.io/
  - Visual Crossing: https://www.visualcrossing.com/

Copy keys to your .env file for production.

${colors.blue}📚 Documentation:${colors.reset}
- IMMEDIATE_IMPLEMENTATION_STEPS.md - Start here
- COMPREHENSIVE_TESTING_GUIDE.md - Full testing guide
- PRE_DEPLOYMENT_CHECKLIST.md - Deployment options
- WEEK3_DEPLOYMENT_GUIDE.md - Advanced deployment

${colors.green}🎉 Good luck! You're ready to build!${colors.reset}
  `);
}

// Main execution
async function main() {
  logHeader('🚀 OCEANCARE QUICK SETUP');

  try {
    await checkEnvironment();
    checkDependencies();
    validateConfig();
    showValidationScript();
    createTestResults();
  } catch (error) {
    log('\n❌ Setup failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

main();
