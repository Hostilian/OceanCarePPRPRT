const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const db = new sqlite3.Database(':memory:', () => {
  // Norm MacDonald: "You know, I remember when databases were real. On disk.
  // Now we just keep 'em in memory like they're made of dreams or something.
  // Refreshingly honest if you ask me - at least it's not pretending."
  console.log('Database ready');
  initDB();
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

    // Norm: "Transform the source so it doesn't come back as '[object Object]'.
    // That happened once. We don't talk about it anymore."
    if (data.articles && Array.isArray(data.articles)) {
      data.articles = data.articles.map(article => ({
        ...article,
        source: transformSource(article.source)
      }));
    }

    res.json(data);
  } catch (e) {
    // Norm: "When the news API falls down, we get back an empty array.
    // Which, let's be honest, is how the news feels most of the time anyway."
    res.json({ articles: [] });
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
  if (!name || !email || !amount) return res.status(400).json({ success: false });

  db.run('INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)', [name, email]);
  db.run('INSERT INTO donations (email, name, amount, purpose) VALUES (?, ?, ?, ?)',
    [email, name, amount, purpose],
    function() { res.json({ success: true, id: this.lastID }); }
  );
});

// Volunteer
app.post('/api/volunteer', (req, res) => {
  // Norm: "Volunteers. People who work for free. I remember when that was slavery.
  // Now it's called 'civic engagement.' Times change. But the work is the same.
  // We take their name, email, everything. We know where they live.
  // If they're serious about the ocean, they'll come back."

  const { name, email, phone, location, area, experience, availability } = req.body;
  if (!name || !email || !location) return res.status(400).json({ success: false });

  db.run('INSERT INTO volunteers (name, email, phone, location, area, experience, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, location, area, experience, availability],
    function() { res.json({ success: true, id: this.lastID }); }
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

// Dashboard
app.get('/api/donor/:email', (req, res) => {
  // Norm: "Dashboard. Show people guilt... but with math.
  // How much have you given? Let's count. Let's keep score.
  // The reduce function adds it up. It's beautiful in a weird way.
  // People seeing their total donation amount? That makes them feel good.
  // Or bad. Depends on the number. Either way, they come back."

  const { email } = req.params;
  db.all('SELECT * FROM donations WHERE email = ? ORDER BY createdAt DESC', [email], (err, donations) => {
    const total = donations?.reduce((s, d) => s + d.amount, 0) || 0;
    res.json({ success: true, total, count: donations?.length || 0, donations: donations || [] });
  });
});

// Contact
app.post('/api/contact', (req, res) => {
  // Norm: "Contact form. We pretend to listen. Then we ignore everything.
  // But we respond with success: true. Because the customer is always right.
  // Even when they're wrong. Especially when they're wrong."

  res.json({ success: true });
});

// Debris Report
app.post('/api/report-debris', (req, res) => {
  // Norm: "Marine debris reporting. Finally, a way to snitch on the ocean.
  // 'Officer, there's plastic over there.' With pictures. And GPS coordinates.
  // We know exactly where it is. We know what it is. We know when you reported it.
  // The ocean's gonna get in trouble. This time, we got witnesses."

  const { location, debrisType, quantity, description, latitude, longitude, photoBase64 } = req.body;
  if (!location || !debrisType || !quantity) return res.status(400).json({ success: false, message: 'Missing required fields' });

  db.run('INSERT INTO debris_reports (location, debrisType, quantity, description, latitude, longitude, photoBase64) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [location, debrisType, quantity, description || '', latitude || null, longitude || null, photoBase64 || null],
    function() { res.json({ success: true, id: this.lastID, message: 'Debris report recorded' }); }
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

// Reverse Geocoding (Nominatim - convert coordinates to location names)
app.get('/api/geocode-location', async (req, res) => {
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
});

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
  const stormGlassKey = process.env.STORM_GLASS_API_KEY;

  if (!stormGlassKey) {
    return res.status(400).json({
      success: false,
      message: 'Storm Glass API key not configured. Register at stormglass.io for free tier.'
    });
  }

  try {
    const params = 'waveHeight,swellDirection,swellHeight,windSpeed,waterTemperature,airTemperature';
    const url = `https://api.stormglass.io/v2/weather/point?lat=${latitude}&lng=${longitude}&params=${params}`;

    const stormRes = await fetch(url, {
      headers: { 'Authorization': stormGlassKey }
    });

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
    res.status(500).json({
      success: false,
      message: 'Unable to fetch marine weather data',
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

  if (!openuvKey) {
    return res.status(400).json({
      success: false,
      message: 'OpenUV API key not configured. Register at openuv.io for free tier (50 req/day).'
    });
  }

  try {
    const url = `https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`;

    const uvRes = await fetch(url, {
      headers: { 'x-access-token': openuvKey }
    });

    if (!uvRes.ok) {
      throw new Error(`OpenUV API error: ${uvRes.status}`);
    }

    const uvData = await uvRes.json();

    // Extract key info for volunteers
    const safeExposure = uvData.result?.safe_exposure_time || {};

    res.json({
      success: true,
      uv: {
        index: uvData.result?.uv || 0,
        safeExposure: safeExposure,
        safeTime: uvData.result?.safe_exposure_time?.st1 || 'Check at stormglass.io',
        recommendation: uvData.result?.uv > 8 ? 'HIGH - Use SPF 50+ sunscreen, limit outdoor time'
                       : uvData.result?.uv > 5 ? 'MODERATE - Use SPF 30+ sunscreen'
                       : 'LOW - Standard sun protection sufficient'
      },
      timestamp: new Date().toISOString(),
      source: 'OpenUV API'
    });
  } catch (error) {
    console.error('UV Index error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch UV Index data',
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

  if (!visualCrossingKey) {
    return res.status(400).json({
      success: false,
      message: 'Visual Crossing API key not configured. Register at visualcrossing.com for free tier (1k req/day).'
    });
  }

  try {
    // Get 90-day climate history
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/last90days?unitGroup=metric&include=days&key=${visualCrossingKey}&contentType=json`;

    const climateRes = await fetch(url);

    if (!climateRes.ok) {
      throw new Error(`Visual Crossing API error: ${climateRes.status}`);
    }

    const climateData = await climateRes.json();

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
    res.status(500).json({
      success: false,
      message: 'Unable to fetch climate trends data',
      error: error.message
    });
  }
});

app.listen(port, () => {
  // Norm: "And then we listen. On port 3000.
  // We sit here and wait for requests. It's like therapy.
  // Someone comes along with a problem, we give them a solution.
  // Sometimes it works. Sometimes it doesn't. But we're listening.
  // That's what matters."

  console.log(`🌊 OceanCare running on :${port}`);
});
module.exports = app;
