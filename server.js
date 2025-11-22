const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('SQLite database initialized');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Donations table
  db.run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donorEmail TEXT NOT NULL,
      donorName TEXT NOT NULL,
      amount REAL NOT NULL,
      purpose TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(donorEmail) REFERENCES users(email)
    )
  `);

  // Volunteers table
  db.run(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteerName TEXT NOT NULL,
      volunteerEmail TEXT NOT NULL,
      volunteerPhone TEXT,
      volunteerLocation TEXT NOT NULL,
      interestArea TEXT NOT NULL,
      experience TEXT NOT NULL,
      availability TEXT NOT NULL,
      motivation TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Debris reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS debris_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporterName TEXT NOT NULL,
      reporterEmail TEXT NOT NULL,
      debrisLocation TEXT NOT NULL,
      debrisType TEXT NOT NULL,
      debrisDescription TEXT NOT NULL,
      reportDate TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contact messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contactName TEXT NOT NULL,
      contactEmail TEXT NOT NULL,
      contactSubject TEXT NOT NULL,
      contactMessage TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// ============================================
// API ENDPOINTS FOR HCI PAPER PROTOTYPE
// ============================================

// 1. Fetch Ocean & Conservation News
app.get('/api/news', async (req, res) => {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    // Return sample data if no API key
    return res.json({
      articles: [
        {
          title: 'Global Coral Restoration Initiative Shows Promise',
          description: 'New techniques in coral propagation have resulted in 50,000+ corals successfully transplanted worldwide.',
          source: 'Ocean Science Today',
          publishedAt: new Date().toISOString(),
          url: '#'
        },
        {
          title: 'Ocean Cleanup Technology Removes 1 Million Plastic Pieces',
          description: 'Innovative cleanup projects remove record amounts of plastic from ocean gyres.',
          source: 'Marine Conservation News',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          url: '#'
        },
        {
          title: 'Sea Turtle Population Recovery in Southeast Asia',
          description: 'Protected nesting sites and reduced fishing pressure lead to population growth.',
          source: 'Wildlife & Nature',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          url: '#'
        }
      ]
    });
  }

  const url = `https://gnews.io/api/v4/search?q=ocean%20conservation%20OR%20marine%20life%20protection&lang=en&max=6&token=${apiKey}`;

  try {
    const newsResponse = await fetch(url);
    if (!newsResponse.ok) {
      const errorBody = await newsResponse.json();
      console.error('GNews API Error:', errorBody);
      return res.status(newsResponse.status).json({ error: 'Failed to fetch news', details: errorBody });
    }
    const newsData = await newsResponse.json();
    res.json(newsData);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Donation Endpoint (Task: Make Donation)
app.post('/api/donate', (req, res) => {
  const { donorName, donorEmail, amount, purpose } = req.body;

  if (!donorName || !donorEmail || !amount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // First, ensure user exists
  db.run(
    'INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)',
    [donorName, donorEmail],
    (err) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ success: false, message: 'Error processing donation' });
      }

      // Then insert donation
      db.run(
        'INSERT INTO donations (donorEmail, donorName, amount, purpose) VALUES (?, ?, ?, ?)',
        [donorEmail, donorName, amount, purpose || 'general'],
        function(err) {
          if (err) {
            console.error('Error inserting donation:', err);
            return res.status(500).json({ success: false, message: 'Error processing donation' });
          }

          res.json({
            success: true,
            message: 'Donation received. Thank you!',
            donation: {
              id: this.lastID,
              amount: amount,
              donor: donorName
            }
          });
        }
      );
    }
  );
});

// 3. Volunteer Signup Endpoint (Task: Register for Cleanup Event / Become Volunteer)
app.post('/api/volunteer', (req, res) => {
  const { volunteerName, volunteerEmail, volunteerPhone, volunteerLocation, interestArea, experience, availability, motivation } = req.body;

  if (!volunteerName || !volunteerEmail || !volunteerLocation || !interestArea || !experience || !availability || !motivation) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO volunteers (volunteerName, volunteerEmail, volunteerPhone, volunteerLocation, interestArea, experience, availability, motivation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [volunteerName, volunteerEmail, volunteerPhone, volunteerLocation, interestArea, experience, availability, motivation],
    function(err) {
      if (err) {
        console.error('Error inserting volunteer:', err);
        return res.status(500).json({ success: false, message: 'Error submitting application' });
      }

      res.json({
        success: true,
        message: 'Volunteer application submitted!',
        volunteer: {
          id: this.lastID,
          name: volunteerName,
          email: volunteerEmail,
          area: interestArea
        }
      });
    }
  );
});

// 4. Debris Report Endpoint (Task: Report Marine Debris)
app.post('/api/report-debris', (req, res) => {
  const { reporterName, reporterEmail, debrisLocation, debrisType, debrisDescription, reportDate } = req.body;

  if (!reporterName || !reporterEmail || !debrisLocation || !debrisType || !debrisDescription || !reportDate) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO debris_reports (reporterName, reporterEmail, debrisLocation, debrisType, debrisDescription, reportDate) VALUES (?, ?, ?, ?, ?, ?)',
    [reporterName, reporterEmail, debrisLocation, debrisType, debrisDescription, reportDate],
    function(err) {
      if (err) {
        console.error('Error inserting debris report:', err);
        return res.status(500).json({ success: false, message: 'Error submitting report' });
      }

      res.json({
        success: true,
        message: 'Debris report received. Thank you for helping us track ocean pollution!',
        report: {
          id: this.lastID,
          location: debrisLocation,
          type: debrisType
        }
      });
    }
  );
});

// 5. Contact Form Endpoint
app.post('/api/contact', (req, res) => {
  const { contactName, contactEmail, contactSubject, contactMessage } = req.body;

  if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO contact_messages (contactName, contactEmail, contactSubject, contactMessage) VALUES (?, ?, ?, ?)',
    [contactName, contactEmail, contactSubject, contactMessage],
    function(err) {
      if (err) {
        console.error('Error inserting contact message:', err);
        return res.status(500).json({ success: false, message: 'Error sending message' });
      }

      res.json({
        success: true,
        message: 'Message received. We\'ll respond within 24 hours.'
      });
    }
  );
});

// 6. Donor Login Endpoint
app.post('/api/donor-login', (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          name: user.name,
          email: user.email
        }
      });
    }
  );
});

// 7. Get Donor Dashboard Data
app.get('/api/donor/:email', (req, res) => {
  const { email } = req.params;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get donor's donations
    db.all(
      'SELECT * FROM donations WHERE donorEmail = ? ORDER BY createdAt DESC',
      [email],
      (err, donations) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

        res.json({
          success: true,
          donor: {
            name: user.name,
            email: user.email,
            totalDonated: totalDonated,
            donations: donations || []
          }
        });
      }
    );
  });
});

// Serve static files and fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🌊 OceanCare Initiative Server running at http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
