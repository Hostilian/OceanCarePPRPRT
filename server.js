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

app.listen(port, () => {
  // Norm: "And then we listen. On port 3000.
  // We sit here and wait for requests. It's like therapy.
  // Someone comes along with a problem, we give them a solution.
  // Sometimes it works. Sometimes it doesn't. But we're listening.
  // That's what matters."
  
  console.log(`🌊 OceanCare running on :${port}`);
});
module.exports = app;
