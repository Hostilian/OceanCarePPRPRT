const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Import custom modules
const auth = require('./auth');
const payment = require('./payment');
const email = require('./email');
const security = require('./security');
const externalApis = require('./external-apis');

const app = express();
const port = process.env.PORT || 3000;

// Initialize email service
const emailStatus = email.initializeEmailService();

// Validate critical environment variables
const envValidation = security.validateEnvironment(['STRIPE_SECRET_KEY', 'SENDGRID_API_KEY']);
// Missing environment variables will be handled gracefully by each service

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true
}));
app.use(security.securityHeaders());
app.use(security.sanitizationMiddleware());
app.use(security.enforceHTTPS());

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
// Persistent SQLite database - stores data even after server restart
// Database file is created in the project root directory
const dbPath = path.join(__dirname, '../oceancare.db');
const fs = require('fs');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    initDB();
  }
});


function initDB() {
  // Initialize all database tables with proper schema

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    purpose TEXT,
    payment_method TEXT,
    stripe_payment_id TEXT UNIQUE,
    receipt_url TEXT,
    status TEXT DEFAULT 'completed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS recurring_donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_id TEXT UNIQUE,
    subscription_id TEXT UNIQUE,
    email TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    interval TEXT DEFAULT 'monthly',
    status TEXT DEFAULT 'active',
    next_billing_date DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    area TEXT,
    experience TEXT,
    availability TEXT,
    hours_contributed REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS debris_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    location TEXT,
    debris_type TEXT,
    quantity TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    photo_base64 TEXT,
    status TEXT DEFAULT 'pending',
    cleanup_date DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    response TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS impact_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    source TEXT
  )`);
}

function extractCoordinates(query = {}) {
  const rawLat = query.latitude ?? query.lat;
  const rawLon = query.longitude ?? query.lon ?? query.lng ?? query.long;

  const latitude = rawLat !== undefined ? parseFloat(rawLat) : null;
  const longitude = rawLon !== undefined ? parseFloat(rawLon) : null;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: 'Latitude and longitude required' };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { error: 'Invalid coordinates. Latitude must be -90 to 90, Longitude -180 to 180.' };
  }

  return { latitude, longitude };
}

// News API
app.get('/api/news', async (req, res) => {
  const limit = resolveNewsLimit(req.query.limit);
  const token = process.env.GNEWS_API_KEY;

  if (!token) {
    const fallbackArticles = getFallbackArticles(limit);
    return res.json(buildNewsResponse(fallbackArticles, { source: 'fallback-static', fallback: true, limit }));
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=ocean%20conservation&lang=en&max=${limit}&token=${token}`;
    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok || !Array.isArray(payload.articles)) {
      throw new Error(`GNews API responded with status ${response.status}`);
    }

    const articles = payload.articles.map((article, index) => normalizeArticle(article, index));

    res.json(buildNewsResponse(articles, { source: 'gnews', limit }));
  } catch (error) {
    console.warn('News API error:', error.message || error);
    const fallbackArticles = getFallbackArticles(limit);
    res.json(buildNewsResponse(fallbackArticles, { source: 'fallback-static', fallback: true, limit }));
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

function resolveNewsLimit(rawLimit) {
  const parsed = parseInt(rawLimit, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, 12);
  }
  return 6;
}

const NEWS_IMAGE_FALLBACKS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-019bbcef3a1f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'
];

const NEWS_FALLBACK_ARTICLES = [
  {
    title: 'Global Coral Restoration Hits New Milestone',
    description: 'Community-led coral nurseries restore 50,000 coral fragments across three oceans.',
    source: 'OceanCare Newswire',
    url: 'https://www.oceancare.org/news/global-coral-restoration-milestone'
  },
  {
    title: 'Coastal Communities Rally for Seagrass Protection',
    description: 'Over 15,000 volunteers join monthly cleanups safeguarding vital blue carbon habitats.',
    source: 'Marine Conservation Daily',
    url: 'https://www.oceancare.org/news/coastal-community-seagrass-protection'
  },
  {
    title: 'Innovative Fishing Gear Reduces Bycatch by 40%',
    description: 'OceanCare partners with fisheries to deploy AI-powered detection buoys protecting marine life.',
    source: 'Sustainable Seas Report',
    url: 'https://www.oceancare.org/news/ai-buoys-reduce-bycatch'
  },
  {
    title: 'New Debris Tracking Network Expands to 25 Countries',
    description: 'Volunteers deploy smart sensors on coastlines to alert nearby cleanup crews.',
    source: 'OceanCare Newswire',
    url: 'https://www.oceancare.org/news/debris-tracking-network-expands'
  },
  {
    title: 'Seagrass Sanctuaries Secure Fresh Funding',
    description: 'Public-private partnership unlocks $12M to restore critical blue carbon ecosystems.',
    source: 'Blue Carbon Journal',
    url: 'https://www.oceancare.org/news/seagrass-funding-2025'
  },
  {
    title: 'Indigenous Guardians Lead Reef Monitoring',
    description: 'Community scientists map coral health in partnership with OceanCare labs.',
    source: 'Indigenous Oceans Collective',
    url: 'https://www.oceancare.org/news/indigenous-reef-monitoring'
  }
];

function getFallbackArticles(limit = 6) {
  const cappedLimit = Math.min(limit || 6, 12);
  const now = Date.now();
  return Array.from({ length: cappedLimit }, (_, index) => {
    const base = NEWS_FALLBACK_ARTICLES[index % NEWS_FALLBACK_ARTICLES.length];
    return normalizeArticle({
      ...base,
      publishedAt: new Date(now - index * 6 * 60 * 60 * 1000).toISOString(),
      image: base.image || NEWS_IMAGE_FALLBACKS[index % NEWS_IMAGE_FALLBACKS.length]
    }, index);
  });
}

function normalizeArticle(article = {}, index = 0) {
  const title = typeof article.title === 'string' && article.title.trim()
    ? article.title.trim()
    : 'Ocean conservation update';
  const description = typeof article.description === 'string' && article.description.trim()
    ? article.description.trim()
    : (typeof article.content === 'string' && article.content.trim())
      ? article.content.trim()
      : 'Full story available on our news page.';
  const publishedAt = article.publishedAt || article.published_at || article.date || new Date().toISOString();
  const url = article.url || article.link || '#';
  const image = article.image || article.image_url || article.imageUrl || NEWS_IMAGE_FALLBACKS[index % NEWS_IMAGE_FALLBACKS.length];

  return {
    id: article.id || url || `oceancare-news-${index}`,
    title,
    description,
    url,
    image,
    publishedAt,
    source: transformSource(article.source),
    author: article.author || null,
    content: article.content || null
  };
}

function buildNewsResponse(articles, meta = {}) {
  return {
    success: true,
    articles,
    count: articles.length,
    limit: meta.limit || articles.length,
    fallback: Boolean(meta.fallback),
    source: meta.source || 'gnews',
    timestamp: new Date().toISOString()
  };
}

// Donations - Create payment intent for one-time donation
app.post('/api/donate/create-payment-intent', strictLimiter, async (req, res) => {
  try {
    const { name, email, amount, purpose } = req.body;

    // Validate required fields
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and amount are required.'
      });
    }

    if (!auth.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters.'
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0.50 || amountNum > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be between $0.50 and $1,000,000.'
      });
    }

    // Create Stripe payment intent
    const paymentResult = await payment.createDonationPaymentIntent(
      amountNum * 100, // Convert to cents
      email,
      name.trim(),
      purpose?.trim() || null
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create payment intent: ' + paymentResult.error
      });
    }

    res.json(paymentResult);
  } catch (error) {
    console.error('Donation payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing donation.'
    });
  }
});

// Donations - Confirm payment and record in database
app.post('/api/donate/confirm', strictLimiter, async (req, res) => {
  try {
    const { paymentIntentId, name, email, amount, purpose } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required.'
      });
    }

    // Confirm payment with Stripe
    const confirmResult = await payment.confirmPayment(paymentIntentId);

    if (!confirmResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment confirmation failed: ' + confirmResult.message
      });
    }

    // Record donation in database
    db.run(
      `INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)`,
      [name, email]
    );

    db.run(
      `INSERT INTO donations (email, name, amount, purpose, payment_method, stripe_payment_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        name.trim(),
        amount,
        purpose?.trim() || null,
        'stripe',
        paymentIntentId,
        'completed'
      ],
      async function(err) {
        if (err) {
          console.error('Database error recording donation:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error while recording donation.'
          });
        }

        // Send confirmation email
        const emailResult = await email.sendDonationConfirmation(
          email,
          name,
          amount,
          purpose || 'General Ocean Conservation',
          confirmResult.receipt_url || null
        );

        // Send notification to support
        await email.sendSupportNotification('donation', {
          name,
          email,
          amount,
          purpose
        });

        res.json({
          success: true,
          id: this.lastID,
          message: 'Thank you for your generous donation!',
          emailSent: emailResult.success && !emailResult.skipped
        });
      }
    );
  } catch (error) {
    console.error('Donation confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while confirming donation.'
    });
  }
});

// Donations - Legacy endpoint for backward compatibility
app.post('/api/donate', strictLimiter, async (req, res) => {
  try {
    const { name, email, amount, purpose } = req.body;

    // Validate required fields
    if (!name || !email || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and amount are required.'
      });
    }

    if (!auth.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters.'
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be a number between $0.01 and $1,000,000.'
      });
    }

    if (purpose && purpose.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Purpose must be 500 characters or less.'
      });
    }

    // Record donation in database
    db.run('INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)', [name, email]);
    db.run('INSERT INTO donations (email, name, amount, purpose, status) VALUES (?, ?, ?, ?, ?)',
      [email, name.trim(), amountNum, purpose?.trim() || null, 'pending'],
      async function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error while recording donation.'
          });
        }

        // Send notification
        await email.sendSupportNotification('donation', {
          name,
          email,
          amount: amountNum,
          purpose: purpose || 'General'
        });

        res.json({
          success: true,
          id: this.lastID,
          message: 'Thank you for your donation!'
        });
      }
    );
  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing donation.'
    });
  }
});

// Volunteer Signup
app.post('/api/volunteer', strictLimiter, async (req, res) => {
  try {
    const { name, email, phone, location, area, experience, availability } = req.body;

    // Validate required fields
    if (!name || !email || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and location are required.'
      });
    }

    if (!auth.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

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

    // Insert user first
    db.run('INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)', [name.trim(), email.trim()]);

    // Insert volunteer record
    db.run(
      `INSERT INTO volunteers (name, email, phone, location, area, experience, availability, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        phone?.trim() || null,
        location.trim(),
        area?.trim() || null,
        experience?.trim() || null,
        availability?.trim() || null,
        'active'
      ],
      async function(err) {
        if (err) {
          console.error('Volunteer signup database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error while recording volunteer signup.'
          });
        }

        // Send confirmation email
        const emailResult = await email.sendVolunteerConfirmation(
          email.trim(),
          name.trim(),
          location.trim(),
          area?.trim() || 'General'
        );

        // Send notification to support
        await email.sendSupportNotification('volunteer', {
          name: name.trim(),
          email: email.trim(),
          location: location.trim(),
          area: area?.trim() || 'Not specified'
        });

        res.json({
          success: true,
          id: this.lastID,
          message: 'Thank you for volunteering! We will contact you soon.',
          emailSent: emailResult.success && !emailResult.skipped
        });
      }
    );
  } catch (error) {
    console.error('Volunteer signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing volunteer signup.'
    });
  }
});

// Dashboard - Look up donor info by email
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

// Contact Form Submission
app.post('/api/contact', strictLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    if (!auth.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

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

    // Record contact message in database
    db.run(
      `INSERT INTO contact_messages (name, email, subject, message, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        subject?.trim() || 'No subject',
        message.trim(),
        'new'
      ],
      async function(err) {
        if (err) {
          console.error('Contact form database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error while recording contact message.'
          });
        }

        // Send confirmation email to user
        const confirmResult = await email.sendContactFormConfirmation(
          email.trim(),
          name.trim(),
          subject?.trim() || 'Your Message'
        );

        // Send notification to support
        await email.sendSupportNotification('contact', {
          name: name.trim(),
          email: email.trim(),
          subject: subject?.trim() || 'No subject',
          message: message.trim()
        });

        res.json({
          success: true,
          id: this.lastID,
          message: 'Thank you for contacting us. We will review your message and respond within 24-48 hours.',
          emailSent: confirmResult.success && !confirmResult.skipped
        });
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing contact form.'
    });
  }
});

// Debris Report Submission
app.post('/api/report-debris', strictLimiter, async (req, res) => {
  try {
    const { location, debrisType, quantity, description, latitude, longitude, photoBase64, reporterName, reporterEmail } = req.body;

    // Validate required fields
    if (!location || !debrisType || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Location, debris type, and quantity are required.'
      });
    }

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

    // Record debris report in database
    db.run(
      `INSERT INTO debris_reports (location, debris_type, quantity, description, latitude, longitude, photo_base64, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location.trim(),
        debrisType.toLowerCase(),
        quantityNum,
        description?.trim() || null,
        latitude || null,
        longitude || null,
        photoBase64 || null,
        'pending'
      ],
      async function(err) {
        if (err) {
          console.error('Debris report database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error while recording debris report.'
          });
        }

        // Send confirmation email if email provided
        if (reporterEmail && auth.isValidEmail(reporterEmail)) {
          await email.sendDebrisReportConfirmation(
            reporterEmail,
            reporterName || 'Ocean Guardian',
            { latitude, longitude },
            this.lastID
          );

          // Send notification to support
          await email.sendSupportNotification('debris', {
            name: reporterName || 'Anonymous',
            latitude,
            longitude,
            debrisType,
            quantity: quantityNum
          });
        }

        res.json({
          success: true,
          id: this.lastID,
          message: 'Debris report recorded. Thank you for helping protect our oceans!'
        });
      }
    );
  } catch (error) {
    console.error('Debris report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing debris report.'
    });
  }
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
      // OpenAQ optional - graceful degradation
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

// ===== ENHANCED EXTERNAL API ENDPOINTS =====

async function handleUVIndexRequest(req, res) {
  try {
    const coords = extractCoordinates(req.query);

    if (coords.error) {
      return res.status(400).json({ success: false, message: coords.error });
    }

    const uvData = await externalApis.getUVIndexData(coords.latitude, coords.longitude);

    res.json({
      success: true,
      data: uvData,
      coordinates: coords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('UV Index endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch UV index data',
      error: error.message
    });
  }
}

async function handleClimateRequest(req, res) {
  try {
    const coords = extractCoordinates(req.query);

    if (coords.error) {
      return res.status(400).json({ success: false, message: coords.error });
    }

    const climateData = await externalApis.getClimateTrends(coords.latitude, coords.longitude);

    res.json({
      success: true,
      data: climateData,
      coordinates: coords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Climate Data endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch climate data',
      error: error.message
    });
  }
}

// Weather data endpoint
app.get('/api/weather', generalLimiter, async (req, res) => {
  try {
    const coords = extractCoordinates(req.query);

    if (coords.error) {
      return res.status(400).json({ success: false, message: coords.error });
    }

    const weatherData = await externalApis.getWeatherData(coords.latitude, coords.longitude);

    res.json({
      success: true,
      data: weatherData,
      coordinates: coords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weather endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch weather data',
      error: error.message
    });
  }
});

// UV Index endpoints (primary + alias for legacy frontend path)
app.get('/api/uv-index', generalLimiter, handleUVIndexRequest);
app.get('/api/uv', generalLimiter, handleUVIndexRequest);

// Air Quality endpoint
app.get('/api/air-quality', generalLimiter, async (req, res) => {
  try {
    const coords = extractCoordinates(req.query);

    if (coords.error) {
      return res.status(400).json({ success: false, message: coords.error });
    }

    const aqData = await externalApis.getAirQualityData(coords.latitude, coords.longitude);

    res.json({
      success: true,
      data: aqData,
      coordinates: coords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Air Quality endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch air quality data',
      error: error.message
    });
  }
});

// Debris Heatmap endpoint
app.get('/api/debris-heatmap', generalLimiter, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude required'
      });
    }

    const heatmapData = await externalApis.getDebrisHeatmapData(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius) || 50
    );

    res.json({
      success: true,
      data: heatmapData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debris Heatmap endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch debris heatmap data',
      error: error.message
    });
  }
});

// Climate Trends endpoints (support both legacy and new paths)
app.get('/api/climate-data', generalLimiter, handleClimateRequest);
app.get('/api/climate-trends', generalLimiter, handleClimateRequest);

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
    // Server started successfully - for production use logging service
  });
}

module.exports = app;
