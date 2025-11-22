#!/usr/bin/env node

/**
 * OceanCare API Key Validation Script
 * Run this after adding API keys to .env to verify they work
 * Usage: node validate-api-keys.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

const testTimeout = 10000; // 10 seconds

async function testStormGlass() {
  log.section('Testing Storm Glass API');

  const apiKey = process.env.STORMGLASS_API_KEY;

  if (!apiKey || apiKey === 'your_stormglass_api_key_here') {
    log.warn('STORMGLASS_API_KEY not set in .env file');
    return false;
  }

  try {
    log.info('Fetching weather data from Storm Glass...');
    const response = await Promise.race([
      fetch('https://api.stormglass.io/v2/weather/point?lat=37.7749&lng=-122.4194&params=windSpeed,waveHeight', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), testTimeout)
      )
    ]);

    const data = await response.json();

    if (data.hours && data.hours.length > 0) {
      log.success('Storm Glass API working correctly');
      console.log(`   🌊 Latest data: ${JSON.stringify(data.hours[0]).substring(0, 50)}...`);
      return true;
    } else if (data.error) {
      log.error(`Storm Glass API error: ${data.error}`);
      return false;
    } else {
      log.success('Storm Glass API responding (no data available)');
      return true;
    }
  } catch (error) {
    log.error(`Storm Glass API test failed: ${error.message}`);
    return false;
  }
}

async function testOpenUV() {
  log.section('Testing OpenUV API');

  const apiKey = process.env.OPENUV_API_KEY;

  if (!apiKey || apiKey === 'your_openuv_api_key_here') {
    log.warn('OPENUV_API_KEY not set in .env file');
    return false;
  }

  try {
    log.info('Fetching UV index data from OpenUV...');
    const response = await Promise.race([
      fetch(`https://api.openuv.io/api/v1/uv?lat=37.7749&lng=-122.4194&apikey=${apiKey}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), testTimeout)
      )
    ]);

    const data = await response.json();

    if (data.result && data.result.uv !== undefined) {
      log.success('OpenUV API working correctly');
      console.log(`   ☀️  Current UV Index: ${data.result.uv}`);
      return true;
    } else if (data.error) {
      log.error(`OpenUV API error: ${data.error}`);
      return false;
    } else {
      log.success('OpenUV API responding (no data available)');
      return true;
    }
  } catch (error) {
    log.error(`OpenUV API test failed: ${error.message}`);
    return false;
  }
}

async function testVisualCrossing() {
  log.section('Testing Visual Crossing API');

  const apiKey = process.env.VISUAL_CROSSING_API_KEY;

  if (!apiKey || apiKey === 'your_visual_crossing_api_key_here') {
    log.warn('VISUAL_CROSSING_API_KEY not set in .env file');
    return false;
  }

  try {
    log.info('Fetching climate data from Visual Crossing...');
    const response = await Promise.race([
      fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/37.7749,-122.4194/next7days?unitGroup=metric&key=${apiKey}&contentType=json`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), testTimeout)
      )
    ]);

    const data = await response.json();

    if (data.days && data.days.length > 0) {
      log.success('Visual Crossing API working correctly');
      console.log(`   🌍 Forecast days available: ${data.days.length}`);
      return true;
    } else if (data.errorCode) {
      log.error(`Visual Crossing API error: ${data.message}`);
      return false;
    } else {
      log.success('Visual Crossing API responding (no data available)');
      return true;
    }
  } catch (error) {
    log.error(`Visual Crossing API test failed: ${error.message}`);
    return false;
  }
}

async function testGoogleMaps() {
  log.section('Testing Google Maps API');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    log.warn('GOOGLE_MAPS_API_KEY not set in .env file');
    return false;
  }

  log.success('Google Maps API key is configured');
  console.log('   Note: Full validation requires browser environment');
  return true;
}

async function testGNews() {
  log.section('Testing GNews API');

  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey || apiKey === 'your_gnews_api_key_here') {
    log.warn('GNEWS_API_KEY not set in .env file');
    return false;
  }

  try {
    log.info('Fetching news from GNews...');
    const response = await Promise.race([
      fetch(`https://gnews.io/api/v4/search?q=ocean&token=${apiKey}&lang=en`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), testTimeout)
      )
    ]);

    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      log.success('GNews API working correctly');
      console.log(`   📰 Articles found: ${data.articles.length}`);
      return true;
    } else if (data.errors) {
      log.error(`GNews API error: ${data.errors[0]}`);
      return false;
    } else {
      log.success('GNews API responding (no articles available)');
      return true;
    }
  } catch (error) {
    log.error(`GNews API test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗`);
  console.log(`║   OceanCare API Key Validation Tool    ║`);
  console.log(`║   Testing all external API integrations ║`);
  console.log(`╚════════════════════════════════════════╝${colors.reset}\n`);

  const results = {
    stormGlass: await testStormGlass(),
    openUV: await testOpenUV(),
    visualCrossing: await testVisualCrossing(),
    googleMaps: await testGoogleMaps(),
    gNews: await testGNews()
  };

  // Summary
  log.section('Summary');
  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  console.log(`${colors.blue}Status: ${passCount}/${totalCount} APIs configured${colors.reset}\n`);

  Object.entries(results).forEach(([api, status]) => {
    const name = api.replace(/([A-Z])/g, ' $1').trim();
    if (status) {
      log.success(`${name} ✓`);
    } else {
      log.warn(`${name} ✗`);
    }
  });

  console.log('');

  if (passCount === totalCount) {
    log.success('All APIs are properly configured! Ready to launch.');
    console.log('\n💡 Next step: npm test\n');
    process.exit(0);
  } else {
    log.warn(`${totalCount - passCount} API(s) need attention. Please check .env file.`);
    console.log('\n💡 Make sure to add API keys to .env file before testing.\n');
    process.exit(1);
  }
}

main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
