const request = require('supertest');
const app = require('../src/server');
const fetch = require('node-fetch');

// Mock node-fetch
jest.mock('node-fetch');

const { Response } = jest.requireActual('node-fetch');

describe('OceanCare API - Comprehensive Test Suite', () => {
  // ============= NEWS ENDPOINT TESTS =============
  describe('GET /api/news', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return news articles on successful fetch', async () => {
      process.env.GNEWS_API_KEY = 'test-api-key';

      const mockNewsData = { articles: [{ title: 'Ocean News' }] };
      const mockResponse = Promise.resolve(
        new Response(JSON.stringify(mockNewsData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      fetch.mockImplementation(() => mockResponse);

      const res = await request(app).get('/api/news');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockNewsData);
    });

    it('should return fallback data when GNEWS_API_KEY is not set', async () => {
      delete process.env.GNEWS_API_KEY;
      const res = await request(app).get('/api/news');
      expect(res.statusCode).toEqual(200);
      expect(res.body.articles).toBeDefined();
      expect(Array.isArray(res.body.articles)).toBe(true);
    });

    it('should handle GNews API errors gracefully', async () => {
      process.env.GNEWS_API_KEY = 'test-api-key';

      const mockErrorResponse = Promise.resolve(
        new Response(JSON.stringify({ error: 'GNews API Error' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      fetch.mockImplementation(() => mockErrorResponse);
      const res = await request(app).get('/api/news');

      expect(res.statusCode).toEqual(200);
      expect(res.body.articles).toBeDefined();
    });

    it('should handle network errors and return empty articles', async () => {
        process.env.GNEWS_API_KEY = 'test-api-key';

        fetch.mockImplementation(() => Promise.reject(new Error('Network failure')));

        const res = await request(app).get('/api/news');
        expect(res.statusCode).toEqual(200);
        expect(res.body.articles).toBeDefined();
    });
  });

  // ============= DONATIONS ENDPOINT TESTS =============
  describe('POST /api/donate', () => {
    it('should accept valid donation', async () => {
      const res = await request(app)
        .post('/api/donate')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          amount: 50,
          purpose: 'Coral restoration'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject donation missing required fields', async () => {
      const res = await request(app)
        .post('/api/donate')
        .send({
          name: 'John Doe',
          email: 'john@example.com'
          // missing amount
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject donation with invalid amount', async () => {
      const res = await request(app)
        .post('/api/donate')
        .send({
          name: 'John Doe',
          email: 'jane@example.com',
          amount: -50,
          purpose: 'Coral restoration'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============= VOLUNTEER ENDPOINT TESTS =============
  describe('POST /api/volunteer', () => {
    it('should accept valid volunteer registration', async () => {
      const res = await request(app)
        .post('/api/volunteer')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-0123',
          location: 'San Francisco',
          area: 'cleanup',
          experience: 'beginner',
          availability: 'weekends'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject volunteer missing required fields', async () => {
      const res = await request(app)
        .post('/api/volunteer')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com'
          // missing required fields
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  // ============= GEOCODING ENDPOINT TESTS =============
  describe('GET /api/reverse-geocode', () => {
    it('should handle missing coordinates', async () => {
      const res = await request(app)
        .get('/api/reverse-geocode');

      expect(res.statusCode).toEqual(400);
    });
  });

  // ============= CACHED CONDITIONS ENDPOINT TESTS =============
  describe('GET /api/ocean-conditions-cached', () => {
    it('should require latitude and longitude', async () => {
      const res = await request(app)
        .get('/api/ocean-conditions-cached');

      expect(res.statusCode).toEqual(500);
    });
  });

  // ============= DEBRIS REPORTS ENDPOINT TESTS =============
  describe('POST /api/report-debris', () => {
    it('should accept valid debris report', async () => {
      const res = await request(app)
        .post('/api/report-debris')
        .send({
          location: 'Pacific Coast',
          latitude: 37.7749,
          longitude: -122.4194,
          debrisType: 'plastic_bags',
          quantity: '10-50',
          description: 'Large pile of plastic bags'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject debris report missing required fields', async () => {
      const res = await request(app)
        .post('/api/report-debris')
        .send({
          location: 'Pacific Coast'
          // missing required fields
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  // ============= DEBRIS RETRIEVAL ENDPOINT TESTS =============
  describe('GET /api/debris-reports', () => {
    it('should return list of debris reports', async () => {
      const res = await request(app)
        .get('/api/debris-reports');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ============= CONTACT ENDPOINT TESTS =============
  describe('POST /api/contact', () => {
    it('should accept valid contact message', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Bob Johnson',
          email: 'bob@example.com',
          message: 'How can I help?'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject contact message with missing fields', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Bob Johnson'
          // missing email and message
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  // ============= MARINE WEATHER ENDPOINT TESTS =============
  describe('GET /api/marine-weather', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    it('should return error when Storm Glass API key not configured', async () => {
      delete process.env.STORM_GLASS_API_KEY;
      delete process.env.STORMGLASS_API_KEY;
      const res = await request(app)
        .get('/api/marine-weather?latitude=37.7749&longitude=-122.4194');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============= UV INDEX ENDPOINT TESTS =============
  describe('GET /api/uv-index', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    it('should return error when OpenUV API key not configured', async () => {
      delete process.env.OPENUV_API_KEY;
      const res = await request(app)
        .get('/api/uv-index?latitude=37.7749&longitude=-122.4194');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============= CLIMATE TRENDS ENDPOINT TESTS =============
  describe('GET /api/climate-trends', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    it('should return error when Visual Crossing API key not configured', async () => {
      delete process.env.VISUAL_CROSSING_API_KEY;
      const res = await request(app)
        .get('/api/climate-trends?latitude=37.7749&longitude=-122.4194');

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============= MAPS API KEY ENDPOINT TESTS =============
  describe('GET /api/get-maps-key', () => {
    it('should return error when Google Maps key not configured', async () => {
      const originalKey = process.env.GOOGLE_MAPS_API_KEY;
      delete process.env.GOOGLE_MAPS_API_KEY;

      const res = await request(app).get('/api/get-maps-key');

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toBe(false);

      process.env.GOOGLE_MAPS_API_KEY = originalKey;
    });

    it('should return API key when configured', async () => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key-123';
      const res = await request(app).get('/api/get-maps-key');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.apiKey).toBe('test-maps-key-123');
    });
  });
});
