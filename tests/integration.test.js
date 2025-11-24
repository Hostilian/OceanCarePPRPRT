/**
 * Integration Tests for OceanCare API
 * Tests payment flows, email sending, authentication, and database operations
 */

const request = require('supertest');
const app = require('../src/server');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Test database file
const TEST_DB = path.join(__dirname, '../test-oceancare.db');

describe('OceanCare API Integration Tests', () => {
  let db;
  let server;

  // Setup: Create test database
  beforeAll((done) => {
    db = new sqlite3.Database(TEST_DB, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        return done(err);
      }

      // Create test tables
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY,
            donor_email TEXT NOT NULL,
            donor_name TEXT NOT NULL,
            amount INTEGER NOT NULL,
            donation_purpose TEXT,
            status TEXT DEFAULT 'completed',
            payment_method TEXT,
            stripe_payment_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS volunteers (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            experience TEXT,
            availability TEXT,
            location TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `, done);
      });
    });
  });

  // Cleanup: Remove test database
  afterAll((done) => {
    if (db) {
      db.close(() => {
        try {
          const fs = require('fs');
          if (fs.existsSync(TEST_DB)) {
            fs.unlinkSync(TEST_DB);
          }
        } catch (e) {
          console.log('Cleanup warning:', e.message);
        }
        done();
      });
    } else {
      done();
    }
  });

  describe('POST /api/contact - Contact Form Submission', () => {
    test('should submit a contact form successfully', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Partnership Inquiry',
          message: 'I would like to discuss a partnership.'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('messageId');
    });

    test('should reject contact form without required fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com'
          // Missing subject and message
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject contact form with invalid email', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          subject: 'Test',
          message: 'Test message'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate message minimum length', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test',
          message: 'X' // Too short
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/volunteer - Volunteer Registration', () => {
    test('should register a volunteer successfully', async () => {
      const response = await request(app)
        .post('/api/volunteer')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-0123',
          experience: 'intermediate',
          availability: ['weekends'],
          location: 'California'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('volunteerId');
    });

    test('should reject duplicate email registration', async () => {
      // Register once
      await request(app)
        .post('/api/volunteer')
        .send({
          name: 'Jane Smith',
          email: 'jane2@example.com',
          phone: '555-0123',
          experience: 'intermediate',
          availability: ['weekends'],
          location: 'California'
        });

      // Try to register again with same email
      const response = await request(app)
        .post('/api/volunteer')
        .send({
          name: 'John Doe',
          email: 'jane2@example.com',
          phone: '555-9999',
          experience: 'beginner',
          availability: ['weekdays'],
          location: 'New York'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate required volunteer fields', async () => {
      const response = await request(app)
        .post('/api/volunteer')
        .send({
          name: 'Jane Smith'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/report-debris - Debris Reporting', () => {
    test('should submit a debris report successfully', async () => {
      const response = await request(app)
        .post('/api/report-debris')
        .send({
          name: 'Test Reporter',
          email: 'reporter@example.com',
          description: 'Plastic bags near shore',
          location: 'Malibu Beach, CA',
          latitude: 34.0195,
          longitude: -118.6814,
          photo_url: 'https://example.com/photo.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('reportId');
    });

    test('should validate GPS coordinates', async () => {
      const response = await request(app)
        .post('/api/report-debris')
        .send({
          name: 'Test Reporter',
          email: 'reporter@example.com',
          description: 'Debris',
          location: 'Beach',
          latitude: 999, // Invalid
          longitude: 999 // Invalid
        });

      expect(response.status).toBe(400);
    });

    test('should require description for debris report', async () => {
      const response = await request(app)
        .post('/api/report-debris')
        .send({
          name: 'Test Reporter',
          email: 'reporter@example.com',
          location: 'Beach',
          latitude: 34.0195,
          longitude: -118.6814
          // Missing description
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/donate - Donation Submission', () => {
    test('should submit a donation successfully', async () => {
      const response = await request(app)
        .post('/api/donate')
        .send({
          name: 'John Donor',
          email: 'donor@example.com',
          amount: 50,
          purpose: 'coral_restoration'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should validate donation amount', async () => {
      const response = await request(app)
        .post('/api/donate')
        .send({
          name: 'John Donor',
          email: 'donor@example.com',
          amount: 0, // Invalid
          purpose: 'coral_restoration'
        });

      expect(response.status).toBe(400);
    });

    test('should require email for donation', async () => {
      const response = await request(app)
        .post('/api/donate')
        .send({
          name: 'John Donor',
          amount: 50,
          purpose: 'coral_restoration'
          // Missing email
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/news - News Feed', () => {
    test('should return news articles', async () => {
      const response = await request(app)
        .get('/api/news?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    test('should limit news results', async () => {
      const response = await request(app)
        .get('/api/news?limit=3');

      expect(response.status).toBe(200);
      expect(response.body.articles.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/ocean-conditions - Ocean Conditions', () => {
    test('should return ocean conditions for valid coordinates', async () => {
      const response = await request(app)
        .get('/api/ocean-conditions?latitude=34.0195&longitude=-118.6814');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('weather');
    });

    test('should require latitude and longitude', async () => {
      const response = await request(app)
        .get('/api/ocean-conditions');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/weather - Weather Data', () => {
    test('should return weather data for valid coordinates', async () => {
      const response = await request(app)
        .get('/api/weather?latitude=34.0195&longitude=-118.6814');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/uv-index - UV Index Data', () => {
    test('should return UV index for valid coordinates', async () => {
      const response = await request(app)
        .get('/api/uv-index?latitude=34.0195&longitude=-118.6814');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/air-quality - Air Quality Data', () => {
    test('should return air quality for valid coordinates', async () => {
      const response = await request(app)
        .get('/api/air-quality?latitude=34.0195&longitude=-118.6814');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Security Tests', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/');

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    test('should reject XSS attempts', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: '<script>alert("XSS")</script>',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test'
        });

      // Should either reject or sanitize
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should enforce rate limiting on sensitive endpoints', async () => {
      // Make multiple requests quickly
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          request(app)
            .post('/api/donate')
            .send({
              name: 'Test',
              email: `test${i}@example.com`,
              amount: 50
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    }).timeout(10000);
  });
});

module.exports = {};
