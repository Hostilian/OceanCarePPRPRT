const request = require('supertest');
const app = require('./server');
const fetch = require('node-fetch');

// Mock node-fetch
jest.mock('node-fetch');

const { Response } = jest.requireActual('node-fetch');

describe('API Endpoints', () => {
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

    it('should return 500 if GNEWS_API_KEY is not set', async () => {
      delete process.env.GNEWS_API_KEY;
      const res = await request(app).get('/api/news');
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBe('API key not found.');
    });

    it('should return a 500 error if the fetch fails', async () => {
      process.env.GNEWS_API_KEY = 'test-api-key';

      const mockErrorResponse = Promise.resolve(
        new Response(JSON.stringify({ error: 'GNews API Error' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      fetch.mockImplementation(() => mockErrorResponse);
      const res = await request(app).get('/api/news');

      // The status code should be what the GNews API returned
      expect(res.statusCode).toEqual(503);
      expect(res.body.error).toBe('Failed to fetch news from GNews');
    });

    it('should return a 500 error on a network error', async () => {
        process.env.GNEWS_API_KEY = 'test-api-key';

        fetch.mockImplementation(() => Promise.reject(new Error('Network failure')));

        const res = await request(app).get('/api/news');
        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toBe('Internal Server Error');
    });
  });
});
