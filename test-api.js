// Quick API test script
const http = require('http');

// Test donation endpoint
const donationData = JSON.stringify({
  donorName: 'Test Donor',
  donorEmail: 'test@oceancare.org',
  amount: 50,
  purpose: 'Coral Restoration'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/donate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': donationData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✓ Donation API Response:', parsed.success ? 'SUCCESS' : 'FAILED');
      if (parsed.donation) {
        console.log('  - Donation ID:', parsed.donation.id);
        console.log('  - Amount:', parsed.donation.amount);
      }
    } catch (e) {
      console.log('✗ Failed to parse response:', e.message);
    }
  });
});

req.on('error', (err) => {
  console.log('✗ API Error:', err.message);
  process.exit(1);
});

req.write(donationData);
req.end();
