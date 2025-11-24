const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  message: 'Too many requests to this endpoint. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' // Don't rate-limit GET requests
});

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Apply strict rate limiter to sensitive POST endpoints
app.post('/api/donate', strictLimiter);
app.post('/api/volunteer', strictLimiter);
app.post('/api/report-debris', strictLimiter);
app.post('/api/contact', strictLimiter);
// Persistent SQLite database - stores data even after server restart
// Database file is created in the project root directory
const dbPath = path.join(__dirname, '../oceancare.db');
const backupDir = path.join(__dirname, '../.backups');
const fs = require('fs');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Database backup function
function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(backupDir, `oceancare-${timestamp}.db`);

  try {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✅ Database backup created: ${backupPath}`);

      // Clean up old backups (keep last 30 days)
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

      fs.readdirSync(backupDir).forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Old backup deleted: ${file}`);
        }
      });
    }
  } catch (error) {
    console.error('Database backup error:', error);
  }
}

// Schedule daily backups at 2 AM
const scheduleBackup = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(2, 0, 0, 0);

  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const timeUntilBackup = target - now;

  setTimeout(() => {
    backupDatabase();
    // Repeat daily
    setInterval(backupDatabase, 24 * 60 * 60 * 1000);
  }, timeUntilBackup);
};

if (require.main === module) {
  // Perform initial backup on startup when running the server directly
  backupDatabase();
  scheduleBackup();
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log(`✅ Database initialized at: ${dbPath}`);
    initDB();
  }
});


function initDB() {
  // Norm: "Database schemas. The art of organizing data before you realize
  // you need completely different data. It's like planning a marriage."

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY,
    email TEXT,
    name TEXT,
    amount REAL,
    purpose TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS volunteers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    area TEXT,
    experience TEXT,
    availability TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS debris_reports (
    id INTEGER PRIMARY KEY,
    location TEXT,
    debrisType TEXT,
    quantity TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    photoBase64 TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// News API
app.get('/api/news', async (req, res) => {
  // Norm: "You know what's funny about news APIs? They charge you money
  // to tell you what's already on the internet. That's entrepreneurship right there.
  // But when they don't work, we got fallback data. See, that's good programming."

  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    return res.json({ articles: [
      { title: 'Coral Restoration Success', description: '50K corals restored globally', source: 'Ocean News', publishedAt: new Date().toISOString(), image: 'https://via.placeholder.com/320x180/0077BE/FFFFFF?text=Coral' },
      { title: 'Sea Turtle Population Growing', description: 'Protected nesting sites helping recovery', source: 'Marine Life', publishedAt: new Date(Date.now() - 86400000).toISOString(), image: 'https://via.placeholder.com/320x180/0077BE/FFFFFF?text=Turtle' },
      { title: 'Ocean Cleanup Record', description: '1M pieces of plastic removed', source: 'Conservation News', publishedAt: new Date(Date.now() - 172800000).toISOString(), image: 'https://via.placeholder.com/320x180/0077BE/FFFFFF?text=Cleanup' }
    ]});
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=ocean%20conservation&lang=en&max=6&token=${key}`;
    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || !data.articles) {
      throw new Error(`GNews API responded with status ${r.status}`);
    }

    // Norm: "Transform the source so it doesn't come back as '[object Object]'.
    // That happened once. We don't talk about it anymore."
    const articles = Array.isArray(data.articles)
      ? data.articles.map(article => {
          if (article && Object.prototype.hasOwnProperty.call(article, 'source')) {
            return {
              ...article,
              source: transformSource(article.source)
            };
          }
          return { ...article };
        })
      : [];

    res.json({ ...data, articles });
  } catch (e) {
    // Norm: "When the news API falls down, we get back an empty array.
    // Which, let's be honest, is how the news feels most of the time anyway."
    console.warn('GNews fetch failed, returning fallback data:', e.message);
    const now = Date.now();
    res.json({
      articles: [
        {
          title: 'Global Coral Restoration Hits New Milestone',
          description: 'Community-led coral nurseries restore 50,000 coral fragments across three oceans.',
          source: 'OceanCare Newsroom',
          publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          url: 'https://oceancare.example.org/news/coral-restoration-milestone'
        },
        {
          title: 'Coastal Communities Rally for Seagrass Protection',
          description: 'Over 15,000 volunteers join monthly cleanups safeguarding vital blue carbon habitats.',
          source: 'Marine Conservation Daily',
          publishedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
          url: 'https://oceancare.example.org/news/seagrass-protection'
        },
        {
          title: 'Innovative Fishing Gear Reduces Bycatch by 40%',
          description: 'OceanCare partners with fisheries to deploy AI-powered detection buoys protecting marine life.',
          source: 'Sustainable Seas Report',
          publishedAt: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80',
          url: 'https://oceancare.example.org/news/bycatch-reduction'
        }
      ]
    });
  }
});

function transformSource(source) {
  // Norm: "This function handles the fact that GNews returns source as either
  // a string, an object with a name, or an object with a URL.
  // It's like they couldn't decide what a source is. Kind of like my marriage."

  if (!source) return 'OceanCare News';

  if (typeof source === 'string') return source.trim() || 'OceanCare News';

  if (typeof source === 'object') {
    if (source.name) return String(source.name).trim() || 'OceanCare News';
    if (source.url) {
      try {
        // Norm: "Extract the hostname. URL parsing is the second hardest problem in programming.
        // First is naming things. Third is off-by-one errors."
        const url = new URL(source.url);
        return url.hostname.replace(/^www\./, '');
      } catch (e) {
        return 'OceanCare News';
      }
    }
  }

  return 'OceanCare News';
}

// Donations
app.post('/api/donate', (req, res) => {
  // Norm: "Donations. Money. I remember when people just kept their money.
  // Now they give it away for the ocean. I respect that.
  // INSERT OR IGNORE - that's what I do at Thanksgiving. First donation wins.
  // Sometimes people give twice. We're only grateful once. That's economics."

  const { name, email, amount, purpose } = req.body;

  // Validate required fields
  if (!name || !email || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and amount are required.'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  // Validate name length
  if (name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 100 characters.'
    });
  }

  // Validate amount is a positive number
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0 || amountNum > 1000000) {
    return res.status(400).json({
      success: false,
      message: 'Donation amount must be a number between $0.01 and $1,000,000.'
    });
  }

  // Validate purpose length if provided
  if (purpose && purpose.trim().length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Purpose must be 500 characters or less.'
    });
  }

  db.run('INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)', [name, email]);
  db.run('INSERT INTO donations (email, name, amount, purpose) VALUES (?, ?, ?, ?)',
    [email, name.trim(), amountNum, purpose?.trim() || null],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error while recording donation.'
        });
      }
      res.json({ success: true, id: this.lastID, message: 'Thank you for your donation!' });
    }
  );
});

// Volunteer
app.post('/api/volunteer', (req, res) => {
  // Norm: "Volunteers. People who work for free. I remember when that was slavery.
  // Now it's called 'civic engagement.' Times change. But the work is the same.
  // We take their name, email, everything. We know where they live.
  // If they're serious about the ocean, they'll come back."

  const { name, email, phone, location, area, experience, availability } = req.body;

  // Validate required fields
  if (!name || !email || !location) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and location are required.'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  // Validate name length
  if (name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 100 characters.'
    });
  }

  // Validate phone if provided
  if (phone && phone.trim().length > 0) {
    const phoneRegex = /^[\d\-\s\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number (at least 7 digits).'
      });
    }
  }

  // Validate location length
  if (location.trim().length < 2 || location.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Location must be between 2 and 100 characters.'
    });
  }

  // Validate experience length if provided
  if (experience && experience.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Experience description must be 1000 characters or less.'
    });
  }

  db.run('INSERT INTO volunteers (name, email, phone, location, area, experience, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name.trim(), email.trim(), phone?.trim() || null, location.trim(), area?.trim() || null, experience?.trim() || null, availability?.trim() || null],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error while recording volunteer signup.'
        });
      }
      res.json({ success: true, id: this.lastID, message: 'Thank you for volunteering! We will contact you soon.' });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  // Norm: "Email as password. That's... actually kind of genius.
  // No password to remember. No 'Password123!'. Just your email.
  // It's so simple it's dumb. But it works. Like me."

  const { email } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (user) return res.json({ success: true, user });
    res.json({ success: false });
  });
});

app.post('/api/donor-login', (req, res) => {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required to sign in.'
    });
  }

  const lookupEmail = email.trim();

  db.get('SELECT name, email FROM users WHERE LOWER(email) = LOWER(?)', [lookupEmail], (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error while verifying donor account.'
      });
    }

    if (!user) {
      return res.json({
        success: false,
        message: 'We could not find a donor account for that email. Make a donation to create one.'
      });
    }

    res.json({
      success: true,
      donor: {
        name: user.name,
        email: user.email
      }
    });
  });
});

// Dashboard
app.get('/api/donor/:email', (req, res) => {
  // Norm: "Dashboard. Show people guilt... but with math.
  // How much have you given? Let's count. Let's keep score.
  // The reduce function adds it up. It's beautiful in a weird way.
  // People seeing their total donation amount? That makes them feel good.
  // Or bad. Depends on the number. Either way, they come back."

  const emailParam = req.params.email;

  if (!emailParam || !emailParam.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.'
    });
  }

  const lookupEmail = emailParam.trim();

  db.get('SELECT name, email FROM users WHERE LOWER(email) = LOWER(?)', [lookupEmail], (userErr, user) => {
    if (userErr) {
      return res.status(500).json({
        success: false,
        message: 'Database error while loading donor profile.'
      });
    }

    db.all('SELECT amount, purpose, createdAt FROM donations WHERE LOWER(email) = LOWER(?) ORDER BY createdAt DESC', [lookupEmail], (donErr, donationRows) => {
      if (donErr) {
        return res.status(500).json({
          success: false,
          message: 'Database error while loading donation history.'
        });
      }

      const donations = (donationRows || []).map((row) => ({
        amount: Number(row.amount) || 0,
        purpose: row.purpose || 'General Fund',
        date: row.createdAt
      }));

      if (!user && donations.length === 0) {
        return res.json({
          success: false,
          message: 'No donor record found for that email.'
        });
      }

      const totalDonated = donations.reduce((sum, entry) => sum + entry.amount, 0);

      res.json({
        success: true,
        donor: {
          name: user?.name || lookupEmail,
          email: user?.email || lookupEmail,
          totalDonated,
          donations
        }
      });
    });
  });
});

// Contact
app.post('/api/contact', (req, res) => {
  // Norm: "Contact form. We pretend to listen. Then we ignore everything.
  // But we respond with success: true. Because the customer is always right.
  // Even when they're wrong. Especially when they're wrong."

  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  // Validate name length
  if (name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 100 characters.'
    });
  }

  // Validate phone if provided
  if (phone && phone.trim().length > 0) {
    const phoneRegex = /^[\d\-\s\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number (at least 7 digits).'
      });
    }
  }

  // Validate message length
  if (message.trim().length < 10 || message.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Message must be between 10 and 5000 characters.'
    });
  }

  // Validate subject if provided
  if (subject && subject.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Subject must be 200 characters or less.'
    });
  }

  // For now, just log and respond with success
  console.log('Contact form submission:', { name, email, phone, subject, message, timestamp: new Date().toISOString() });

  res.json({
    success: true,
    message: 'Thank you for contacting us. We will review your message and respond within 24-48 hours.'
  });
});

// Debris Report
app.post('/api/report-debris', (req, res) => {
  // Norm: "Marine debris reporting. Finally, a way to snitch on the ocean.
  // 'Officer, there's plastic over there.' With pictures. And GPS coordinates.
  // We know exactly where it is. We know what it is. We know when you reported it.
  // The ocean's gonna get in trouble. This time, we got witnesses."

  const { location, debrisType, quantity, description, latitude, longitude, photoBase64 } = req.body;

  // Validate required fields
  if (!location || !debrisType || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'Location, debris type, and quantity are required.'
    });
  }

  // Validate location length
  if (location.trim().length < 2 || location.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Location must be between 2 and 200 characters.'
    });
  }

  // Validate debrisType
  const validTypes = ['plastic', 'plastic_bags', 'fishing_net', 'glass', 'metal', 'foam', 'rubber', 'wood', 'other'];
  if (!validTypes.includes(debrisType.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Debris type must be one of: ${validTypes.join(', ')}`
    });
  }

  // Validate quantity is a positive number
  const quantityNum = parseInt(quantity);
  if (isNaN(quantityNum) || quantityNum <= 0 || quantityNum > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a number between 1 and 10,000 items.'
    });
  }

  // Validate description length if provided
  if (description && description.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be 1000 characters or less.'
    });
  }

  // Validate coordinates if provided
  if (latitude !== null && latitude !== undefined) {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90.'
      });
    }
  }

  if (longitude !== null && longitude !== undefined) {
    const lon = parseFloat(longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180.'
      });
    }
  }

  // Validate photoBase64 size if provided (max 5MB base64)
  if (photoBase64 && photoBase64.length > 5242880) {
    return res.status(413).json({
      success: false,
      message: 'Photo must be 5MB or smaller.'
    });
  }

  db.run('INSERT INTO debris_reports (location, debrisType, quantity, description, latitude, longitude, photoBase64) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [location.trim(), debrisType.toLowerCase(), quantityNum, description?.trim() || '', latitude || null, longitude || null, photoBase64 || null],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error while recording debris report.'
        });
      }
      res.json({ success: true, id: this.lastID, message: 'Debris report recorded. Thank you for helping protect our oceans!' });
    }
  );
});

// Ocean Conditions (Weather + Air Quality)
app.get('/api/ocean-conditions', async (req, res) => {
  // Norm: "Ocean conditions. The weather, the air, the vibe of the ocean.
  // We get this from Open-Meteo because they don't charge money.
  // They believe in free data. I believe in them."

  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    // Fetch weather data from Open-Meteo (free, no API key needed)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wave_height,weather_code,relative_humidity_2m,uv_index&temperature_unit=fahrenheit`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    // Fetch air quality from OpenAQ (free tier)
    const aqUrl = `https://api.openaq.org/v2/latest?coordinates=${latitude},${longitude}&limit=1`;
    let airQuality = null;
    try {
      const aqRes = await fetch(aqUrl);
      const aqData = await aqRes.json();
      if (aqData.results && aqData.results.length > 0) {
        const result = aqData.results[0];
        airQuality = {
          location: result.location,
          lastUpdate: result.lastUpdated,
          measurements: result.measurements || []
        };
      }
    } catch (e) {
      console.log('OpenAQ fetch failed, continuing with weather data');
    }

    res.json({
      success: true,
      weather: weatherData.current || {},
      airQuality: airQuality,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ocean conditions error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch ocean conditions', error: error.message });
  }
});

async function handleReverseGeocode(req, res) {
  // Norm: "Reverse geocoding. Taking numbers and turning them into words.
  // Nominatim does this for free. They're OpenStreetMap. They believe in the people."

  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    // Nominatim reverse geocoding (free, OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OceanCareInitiative' }
    });
    const data = await response.json();

    res.json({
      success: true,
      address: data.address || {},
      location: data.name || 'Unknown location',
      displayName: data.display_name || '',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ success: false, message: 'Unable to geocode location', error: error.message });
  }
}

// Reverse Geocoding (Nominatim - convert coordinates to location names)
app.get('/api/geocode-location', handleReverseGeocode);
app.get('/api/reverse-geocode', handleReverseGeocode);

// Cache for ocean conditions (1 hour cache to reduce API calls)
const conditionsCache = new Map();
app.get('/api/ocean-conditions-cached', async (req, res) => {
  // Norm: "Caching. Because fetching the same data 100 times is like asking the same question 100 times.
  // Eventually people stop answering."

  const { latitude, longitude } = req.query;
  const cacheKey = `${latitude},${longitude}`;
  const now = Date.now();
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  if (conditionsCache.has(cacheKey)) {
    const cached = conditionsCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      return res.json({ ...cached.data, fromCache: true });
    }
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wave_height,weather_code,relative_humidity_2m,uv_index&temperature_unit=fahrenheit`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const responseData = {
      success: true,
      weather: weatherData.current || {},
      timestamp: new Date().toISOString(),
      fromCache: false
    };

    conditionsCache.set(cacheKey, { data: responseData, timestamp: now });
    res.json(responseData);
  } catch (error) {
    console.error('Cached ocean conditions error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch ocean conditions' });
  }
});

app.get('/api/get-maps-key', (req, res) => {
  // Norm MacDonald: "Google Maps API key. Stored safely in environment variables.
  // Not exposed to the frontend. Well, not directly. We proxy it through here.
  // It's called 'defense in depth.' Or is it? Either way, it's better than hardcoding."

  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!mapsKey) {
    return res.status(500).json({
      success: false,
      message: 'Google Maps API key not configured'
    });
  }

  res.json({
    success: true,
    apiKey: mapsKey,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debris-reports', (req, res) => {
  // Norm: "Fetch all debris reports. For mapping.
  // We query the database, convert lat/long to map markers,
  // and hand it all back. The ocean's crime scene, visualized."

  db.all(`SELECT id, location, latitude, longitude, debrisType, quantity, description, createdAt
          FROM debris_reports
          ORDER BY createdAt DESC
          LIMIT 100`, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch debris reports' });
    }

    res.json({
      success: true,
      data: rows || [],
      timestamp: new Date().toISOString()
    });
  });
});

// Marine-specific weather from Storm Glass
app.get('/api/marine-weather', async (req, res) => {
  // Norm MacDonald: "Storm Glass. For when Open-Meteo isn't ocean-y enough.
  // Waves, swell, water temperature. This is what the fish would care about,
  // if they were sophisticated enough to use APIs."

  const { latitude, longitude } = req.query;
  const stormGlassKey = process.env.STORM_GLASS_API_KEY || process.env.STORMGLASS_API_KEY;
  console.log('Storm Glass Key:', stormGlassKey ? 'Present' : 'Missing');

  if (!stormGlassKey) {
    return res.status(400).json({
      success: false,
      message: 'Storm Glass API key not configured. Register at stormglass.io for free tier.'
    });
  }

  // Validate coordinates are within valid ranges
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.'
    });
  }

  try {
    const params = 'waveHeight,swellDirection,swellHeight,windSpeed,waterTemperature,airTemperature';
    const url = `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&params=${params}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    const stormRes = await fetch(url, {
      headers: { 'Authorization': stormGlassKey },
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Handle different error status codes
    if (stormRes.status === 402) {
      return res.status(402).json({
        success: false,
        message: 'Storm Glass API quota exceeded. Free tier allows 50 requests/day. Try again tomorrow or upgrade.',
        statusCode: 402
      });
    }

    if (stormRes.status === 401 || stormRes.status === 403) {
      return res.status(401).json({
        success: false,
        message: 'Storm Glass API key invalid or unauthorized. Check stormglass.io account.',
        statusCode: stormRes.status
      });
    }

    if (!stormRes.ok) {
      throw new Error(`Storm Glass API error: ${stormRes.status}`);
    }

    const stormData = await stormRes.json();

    res.json({
      success: true,
      marineWeather: stormData,
      timestamp: new Date().toISOString(),
      source: 'Storm Glass API'
    });
  } catch (error) {
    console.error('Marine weather error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'Storm Glass API request timed out. Service may be slow, try again in a moment.',
        statusCode: 504
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to fetch marine weather data. Storm Glass API may be temporarily unavailable.',
      error: error.message
    });
  }
});

// UV Index data from OpenUV for volunteer safety
app.get('/api/uv-index', async (req, res) => {
  // Norm MacDonald: "UV Index. Because our volunteers are about to spend hours
  // in the sun cleaning up garbage. We owe it to them to tell them when the
  // sun is angriest."

  const { latitude, longitude } = req.query;
  const openuvKey = process.env.OPENUV_API_KEY;

  // Check if key is missing
  if (!openuvKey || openuvKey.includes('your_')) {
    return res.status(400).json({
      success: false,
      message: 'OpenUV API key not configured. Register at openuv.io to enable UV index feature.'
    });
  }

  // Validate coordinates
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.'
    });
  }

  try {
    const url = `https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const uvRes = await fetch(url, {
      headers: { 'x-access-token': openuvKey },
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Handle different error status codes
    if (uvRes.status === 402) {
      return res.status(402).json({
        success: false,
        message: 'OpenUV API quota exceeded. Free tier allows 50 requests/day. Try again tomorrow.',
        statusCode: 402
      });
    }

    if (uvRes.status === 401 || uvRes.status === 403) {
      return res.status(401).json({
        success: false,
        message: 'OpenUV API key invalid. Check openuv.io account.',
        statusCode: uvRes.status
      });
    }

    if (!uvRes.ok) {
      throw new Error(`OpenUV API error: ${uvRes.status}`);
    }

    const uvData = await uvRes.json();

    // Extract key info for volunteers
    const safeExposure = uvData.result?.safe_exposure_time || {};
    const uvIndex = uvData.result?.uv || 0;

    res.json({
      success: true,
      uv: {
        index: uvIndex,
        safeExposure: safeExposure,
        safeTime: uvData.result?.safe_exposure_time?.st1 || 'Check at openuv.io',
        recommendation: uvIndex > 8 ? 'HIGH - Use SPF 50+ sunscreen, limit outdoor time'
                       : uvIndex > 5 ? 'MODERATE - Use SPF 30+ sunscreen'
                       : 'LOW - Standard sun protection sufficient'
      },
      timestamp: new Date().toISOString(),
      source: 'OpenUV API'
    });
  } catch (error) {
    console.error('UV Index error:', error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'OpenUV API request timed out. Try again in a moment.',
        statusCode: 504
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to fetch UV Index data. OpenUV API may be temporarily unavailable.',
      error: error.message
    });
  }
});

// Climate trends from Visual Crossing
app.get('/api/climate-trends', async (req, res) => {
  // Norm MacDonald: "Climate trends. Long-term data so our donors can see
  // the bigger picture. 30, 60, 90 days of temperature and precipitation.
  // It's like a crystal ball, but with statistics."

  const { latitude, longitude } = req.query;
  const visualCrossingKey = process.env.VISUAL_CROSSING_API_KEY;

  // Check if key is missing
  if (!visualCrossingKey || visualCrossingKey.includes('your_')) {
    return res.status(400).json({
      success: false,
      message: 'Visual Crossing API key not configured. Register at visualcrossing.com to enable climate trends feature.'
    });
  }

  // Validate coordinates
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.'
    });
  }

  try {
    // Get 90-day climate history
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/last90days?unitGroup=metric&include=days&key=${visualCrossingKey}&contentType=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const climateRes = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout);

    // Handle different error status codes
    if (climateRes.status === 402) {
      return res.status(402).json({
        success: false,
        message: 'Visual Crossing API quota exceeded. Free tier allows 1000 requests/day. Try again tomorrow.',
        statusCode: 402
      });
    }

    if (climateRes.status === 401 || climateRes.status === 403) {
      return res.status(401).json({
        success: false,
        message: 'Visual Crossing API key invalid. Check visualcrossing.com account.',
        statusCode: climateRes.status
      });
    }

    if (!climateRes.ok) {
      throw new Error(`Visual Crossing API error: ${climateRes.status}`);
    }

    const climateData = await climateRes.json();

    // Check if we got valid data
    if (!climateData.days || climateData.days.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No climate data found for this location. Try a major city or landmark.'
      });
    }

    // Calculate trends from historical data
    const days = climateData.days || [];
    const tempAvg = days.length > 0
      ? (days.reduce((sum, d) => sum + (d.temp || 0), 0) / days.length).toFixed(1)
      : 0;
    const precipTotal = days.length > 0
      ? (days.reduce((sum, d) => sum + (d.precip || 0), 0)).toFixed(1)
      : 0;

    res.json({
      success: true,
      climateTrends: {
        period: '90-day historical',
        averageTemperature: `${tempAvg}°C`,
        totalPrecipitation: `${precipTotal}mm`,
        daysCounted: days.length,
        trend: tempAvg > 20 ? 'Warming' : tempAvg < 10 ? 'Cooling' : 'Stable'
      },
      rawData: climateData,
      timestamp: new Date().toISOString(),
      source: 'Visual Crossing API'
    });
  } catch (error) {
    console.error('Climate trends error:', error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'Visual Crossing API request timed out. Try again in a moment.',
        statusCode: 504
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to fetch climate trends data. Visual Crossing API may be temporarily unavailable.',
      error: error.message
    });
  }
});

// ===== GLOBAL ERROR HANDLING MIDDLEWARE =====

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404);
  
  // Return HTML for browser requests, JSON for API requests
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../public/404.html'));
  } else {
    res.json({
      success: false,
      error: 'Not Found',
      message: `The requested resource ${req.originalUrl} does not exist`,
      status: 404
    });
  }
});

// Global Error Handler (must be last)
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', {
    message: err.message,
    status: err.status || 500,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Return HTML for browser requests
  if (req.accepts('html')) {
    res.status(status);
    if (status === 500) {
      res.sendFile(path.join(__dirname, '../public/500.html'));
    } else {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error ${status}</title>
          <link rel="stylesheet" href="/css/styles.css">
        </head>
        <body>
          <div style="text-align: center; padding: 100px 20px; color: var(--color-text-light);">
            <h1>${status}</h1>
            <p>${message}</p>
            <a href="/">← Back to Home</a>
          </div>
        </body>
        </html>
      `);
    }
  } else {
    // Return JSON for API requests
    res.status(status).json({
      success: false,
      error: message,
      status: status,
      ...(process.env.NODE_ENV === 'development' && { details: err.stack })
    });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    // Norm: "And then we listen. On port 3000.
    // We sit here and wait for requests. It's like therapy.
    // Someone comes along with a problem, we give them a solution.
    // Sometimes it works. Sometimes it doesn't. But we're listening.
    // That's what matters."

    console.log(`🌊 OceanCare running on :${port}`);
  });
}

module.exports = app;
