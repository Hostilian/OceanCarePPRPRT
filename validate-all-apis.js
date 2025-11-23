#!/usr/bin/env node

/**
 * OceanCare API Validation Script
 * Tests all 8 APIs and reports status
 * Run: node validate-all-apis.js
 */

const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

// Test data
const testCoords = {
  latitude: 34.0195,
  longitude: -118.4912
};

const APIs = [
  {
    id: 1,
    name: 'GNews',
    endpoint: '/api/news',
    required: 'articles',
    description: 'Ocean conservation news'
  },
  {
    id: 2,
    name: 'Open-Meteo (Weather)',
    endpoint: `/api/ocean-conditions-cached?latitude=${testCoords.latitude}&longitude=${testCoords.longitude}`,
    required: 'temperature',
    description: 'Current ocean conditions'
  },
  {
    id: 3,
    name: 'OpenAQ (Air Quality)',
    endpoint: `/api/ocean-conditions-cached?latitude=${testCoords.latitude}&longitude=${testCoords.longitude}`,
    required: 'aqi',
    description: 'Air quality data'
  },
  {
    id: 4,
    name: 'Nominatim (Geocoding)',
    endpoint: `/api/geocode-location?latitude=${testCoords.latitude}&longitude=${testCoords.longitude}`,
    required: 'location',
    description: 'Reverse geocoding'
  },
  {
    id: 5,
    name: 'Google Maps',
    endpoint: '/api/get-maps-key',
    required: 'apiKey',
    description: 'Interactive mapping'
  },
  {
    id: 6,
    name: 'Storm Glass (Marine Weather)',
    endpoint: `/api/marine-weather?latitude=${testCoords.latitude}&longitude=${testCoords.longitude}`,
    required: 'waveHeight',
    description: 'Marine weather data'
  },
  {
    id: 7,
    name: 'OpenUV (UV Index)',
    endpoint: `/api/uv-index?latitude=${testCoords.latitude}&longitude=${testCoords.longitude}`,
    required: 'uv',
    description: 'UV safety index'
  },
  {
    id: 8,
    name: 'Visual Crossing (Climate)',
    endpoint: `/api/climate-trends?latitude=${testCoords.latitude}&longitude=${testCoords.longitude}`,
    required: 'climateTrends',
    description: '90-day climate trends'
  }
];

// Color codes for console output
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

async function testAPI(api) {
  try {
    const url = `${BASE_URL}${api.endpoint}`;
    const response = await fetch(url, {
      timeout: 5000
    });

    const data = await response.json();

    // Check if response indicates success
    let isWorking = false;
    let status = '';

    if (data.success === false) {
      if (data.mode === 'demo') {
        status = 'DEMO (working with fallback)';
        isWorking = true;
      } else {
        status = `ERROR: ${data.message}`;
        isWorking = false;
      }
    } else if (api.required in data || api.required in (data[Object.keys(data)[0]] || {})) {
      status = 'WORKING';
      isWorking = true;
    } else if (data.articles || data.climateTrends || data.uv) {
      status = 'WORKING';
      isWorking = true;
    } else {
      status = 'Unknown response format';
      isWorking = null;
    }

    return {
      api: api.name,
      working: isWorking,
      status,
      statusCode: response.status,
      responseTime: Date.now(),
      endpoint: api.endpoint
    };
  } catch (error) {
    return {
      api: api.name,
      working: false,
      status: `ERROR: ${error.message}`,
      endpoint: api.endpoint,
      error: error
    };
  }
}

async function validateAllAPIs() {
  logHeader('🧪 OCEANCARE API VALIDATION TEST');

  log(`\nTesting ${APIs.length} APIs...`, 'yellow');
  log(`Base URL: ${BASE_URL}\n`, 'yellow');

  const results = [];
  let passed = 0;
  let failed = 0;
  let demo = 0;

  // Test each API sequentially
  for (const api of APIs) {
    const result = await testAPI(api);
    results.push(result);

    if (result.working === true) {
      if (result.status === 'DEMO (working with fallback)') {
        demo++;
        log(
          `${colors.bold}[${result.api}]${colors.reset} ⚠️  DEMO - ${result.status}`,
          'yellow'
        );
      } else {
        passed++;
        log(
          `${colors.bold}[${result.api}]${colors.reset} ✅ ${result.status}`,
          'green'
        );
      }
    } else {
      failed++;
      log(
        `${colors.bold}[${result.api}]${colors.reset} ❌ ${result.status}`,
        'red'
      );
    }
  }

  // Summary
  logHeader('📊 VALIDATION SUMMARY');

  console.log(`
  ${colors.green}✅ Working APIs:${colors.reset} ${passed}
  ${colors.yellow}⚠️  Demo Mode APIs:${colors.reset} ${demo}
  ${colors.red}❌ Failed APIs:${colors.reset} ${failed}
  ${colors.bold}Total:${colors.reset} ${passed + demo + failed}/${APIs.length}
  `);

  // Detailed results table
  logHeader('📋 DETAILED RESULTS');

  console.log('\n' + colors.bold + 'API'.padEnd(25) + 'Status'.padEnd(35) + 'Code' + colors.reset);
  console.log('-'.repeat(60));

  results.forEach((result, index) => {
    let statusColor = 'reset';
    let statusSymbol = '?';

    if (result.working === true) {
      if (result.status.includes('DEMO')) {
        statusColor = 'yellow';
        statusSymbol = '⚠️ ';
      } else {
        statusColor = 'green';
        statusSymbol = '✅';
      }
    } else {
      statusColor = 'red';
      statusSymbol = '❌';
    }

    const apiName = `${statusSymbol} ${result.api}`.padEnd(25);
    const statusText = result.status.substring(0, 30).padEnd(35);
    const code = result.statusCode ? result.statusCode.toString() : 'N/A';

    console.log(
      colors[statusColor] + apiName + statusText + code + colors.reset
    );
  });

  // Recommendations
  logHeader('💡 RECOMMENDATIONS');

  if (failed > 0) {
    log('\n⚠️  Some APIs failed. Check the following:', 'yellow');
    results
      .filter(r => r.working === false)
      .forEach(r => {
        log(`\n   ${r.api}:`, 'yellow');
        log(`   ${r.status}`, 'red');
        if (r.error) {
          log(`   Debug: ${r.error.message}`, 'red');
        }
      });

    log('\n   Action Items:', 'yellow');
    log('   1. Check if server is running: npm start', 'yellow');
    log('   2. Verify .env file has all API keys', 'yellow');
    log('   3. Check database is initialized', 'yellow');
    log('   4. Look at server logs for errors', 'yellow');
  }

  if (demo > 0) {
    log('\n⚠️  Some APIs are in DEMO mode (no key configured):', 'yellow');
    results
      .filter(r => r.status && r.status.includes('DEMO'))
      .forEach(r => {
        log(`   - ${r.api}`, 'yellow');
      });

    log('\n   This is OK for testing! But register API keys for production:', 'yellow');
    log('   - OpenUV: https://openuv.io/', 'yellow');
    log('   - Visual Crossing: https://www.visualcrossing.com/', 'yellow');
  }

  if (passed === APIs.length) {
    log('\n✅ All APIs are working perfectly!', 'green');
    log('You are ready for deployment! 🚀\n', 'green');
  } else if (passed + demo === APIs.length) {
    log('\n✅ All APIs are functional (with demo fallbacks)!', 'green');
    log('Consider registering OpenUV & Visual Crossing for production.\n', 'yellow');
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run validation
validateAllAPIs().catch(error => {
  log('Fatal error during validation:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
