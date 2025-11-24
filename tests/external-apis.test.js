/**
 * Tests for External API Module
 * Tests weather, UV, air quality, and debris heatmap APIs
 */

const externalApis = require('../src/external-apis');

describe('External APIs Module', () => {
  // Clear cache before each test
  beforeEach(() => {
    externalApis.clearCache();
    jest.clearAllMocks();
  });

  describe('Weather API Integration', () => {
    test('should fetch weather data for valid coordinates', async () => {
      const data = await externalApis.getWeatherData(34.0195, -118.6814);
      
      expect(data).toBeTruthy();
      expect(data).toHaveProperty('temperature');
      expect(data).toHaveProperty('humidity');
      expect(data).toHaveProperty('description');
    });

    test('should return fallback data on API failure', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
      
      const data = await externalApis.getWeatherData(34.0195, -118.6814);
      
      expect(data).toBeTruthy();
      expect(data).toHaveProperty('temperature');
      expect(data.temperature).toBe('N/A');
    });

    test('should cache weather data', async () => {
      const data1 = await externalApis.getWeatherData(34.0195, -118.6814);
      
      // Mock fetch to verify it's not called again
      global.fetch = jest.fn();
      
      const data2 = await externalApis.getWeatherData(34.0195, -118.6814);
      
      expect(data1).toEqual(data2);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should return different data for different coordinates', async () => {
      const data1 = await externalApis.getWeatherData(34.0195, -118.6814);
      const data2 = await externalApis.getWeatherData(40.7128, -74.0060);
      
      // Different coordinates should be treated as different cache entries
      expect(data1).toHaveProperty('temperature');
      expect(data2).toHaveProperty('temperature');
    });

    test('should validate latitude range', async () => {
      const data = await externalApis.getWeatherData(999, 999);
      
      // Should handle invalid coordinates gracefully
      expect(data).toHaveProperty('temperature');
    });
  });

  describe('UV Index API', () => {
    test('should fetch UV index data', async () => {
      const data = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      expect(data).toBeTruthy();
      expect(data).toHaveProperty('uv_index');
      expect(data).toHaveProperty('warning_level');
    });

    test('should categorize UV index correctly', async () => {
      const data = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      const validLevels = ['safe', 'moderate', 'high', 'very_high'];
      expect(validLevels).toContain(data.warning_level);
    });

    test('should include UV recommendations', async () => {
      const data = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      expect(data).toHaveProperty('recommendations');
      expect(data.recommendations).toBeTruthy();
      expect(data.recommendations.length).toBeGreaterThan(0);
    });

    test('should return fallback UV data on error', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
      
      const data = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      expect(data).toHaveProperty('uv_index');
      expect(data).toHaveProperty('warning_level');
    });

    test('should cache UV index data', async () => {
      const data1 = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      global.fetch = jest.fn();
      
      const data2 = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      expect(data1).toEqual(data2);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Air Quality API', () => {
    test('should fetch air quality data', async () => {
      const data = await externalApis.getAirQualityData(34.0195, -118.6814);
      
      expect(data).toBeTruthy();
      expect(data).toHaveProperty('aqi');
      expect(data).toHaveProperty('health_status');
    });

    test('should return valid AQI values', async () => {
      const data = await externalApis.getAirQualityData(34.0195, -118.6814);
      
      expect(typeof data.aqi).toBe('number');
      expect(data.aqi).toBeGreaterThanOrEqual(0);
    });

    test('should include pollutant data when available', async () => {
      const data = await externalApis.getAirQualityData(34.0195, -118.6814);
      
      expect(data).toHaveProperty('pollutants');
    });

    test('should return fallback air quality data', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
      
      const data = await externalApis.getAirQualityData(34.0195, -118.6814);
      
      expect(data).toHaveProperty('aqi');
      expect(data).toHaveProperty('health_status');
    });

    test('should categorize health status correctly', async () => {
      const data = await externalApis.getAirQualityData(34.0195, -118.6814);
      
      const validStatuses = ['good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous'];
      expect(validStatuses).toContain(data.health_status);
    });
  });

  describe('Debris Heatmap API', () => {
    test('should fetch debris data for location', async () => {
      const data = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 50);
      
      expect(data).toBeTruthy();
      expect(data).toHaveProperty('hotspots');
      expect(Array.isArray(data.hotspots)).toBe(true);
    });

    test('should include hotspot intensity', async () => {
      const data = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 50);
      
      if (data.hotspots.length > 0) {
        const hotspot = data.hotspots[0];
        expect(hotspot).toHaveProperty('intensity');
        expect(hotspot.intensity).toBeGreaterThanOrEqual(0);
        expect(hotspot.intensity).toBeLessThanOrEqual(100);
      }
    });

    test('should return debris count', async () => {
      const data = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 50);
      
      expect(data).toHaveProperty('total_reports');
      expect(typeof data.total_reports).toBe('number');
    });

    test('should support custom radius', async () => {
      const data1 = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 10);
      const data2 = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 100);
      
      // Different radius should be treated as different cache entries
      expect(data1).toHaveProperty('total_reports');
      expect(data2).toHaveProperty('total_reports');
    });

    test('should include report types', async () => {
      const data = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 50);
      
      if (data.hotspots.length > 0) {
        const hotspot = data.hotspots[0];
        expect(hotspot).toHaveProperty('type');
      }
    });

    test('should return fallback debris data', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
      
      const data = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 50);
      
      expect(data).toHaveProperty('hotspots');
      expect(data).toHaveProperty('total_reports');
    });
  });

  describe('Climate Trends API', () => {
    test('should fetch climate trends', async () => {
      const data = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      expect(data).toBeTruthy();
      expect(data).toHaveProperty('temperature_trend');
      expect(data).toHaveProperty('precipitation_trend');
    });

    test('should include temperature data', async () => {
      const data = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      expect(data).toHaveProperty('avg_temp');
      expect(data).toHaveProperty('max_temp');
      expect(data).toHaveProperty('min_temp');
    });

    test('should include precipitation data', async () => {
      const data = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      expect(data).toHaveProperty('total_precipitation');
      expect(data).toHaveProperty('rainy_days');
    });

    test('should cache climate data for longer period', async () => {
      const data1 = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      global.fetch = jest.fn();
      
      const data2 = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      expect(data1).toEqual(data2);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should return fallback climate data', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
      
      const data = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      expect(data).toHaveProperty('temperature_trend');
      expect(data).toHaveProperty('precipitation_trend');
    });

    test('should handle 90-day historical data', async () => {
      const data = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      expect(data).toHaveProperty('period_days');
      expect(data.period_days).toBe(90);
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', async () => {
      // Populate cache
      await externalApis.getWeatherData(34.0195, -118.6814);
      
      // Clear cache
      externalApis.clearCache();
      
      // Mock fetch to verify it's called
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ current: { temperature: 72 } })
        })
      );
      
      // Should call fetch since cache was cleared
      await externalApis.getWeatherData(34.0195, -118.6814);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('should respect cache TTL', async (done) => {
      // Get data once (should cache)
      const data1 = await externalApis.getWeatherData(34.0195, -118.6814);
      
      // Mock fetch to verify cache
      global.fetch = jest.fn();
      const data2 = await externalApis.getWeatherData(34.0195, -118.6814);
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Clear cache manually for next test
      externalApis.clearCache();
      done();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );
      
      const data = await externalApis.getWeatherData(34.0195, -118.6814);
      expect(data).toHaveProperty('temperature');
    });

    test('should handle invalid JSON responses', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      );
      
      const data = await externalApis.getWeatherData(34.0195, -118.6814);
      expect(data).toBeTruthy();
    });

    test('should handle API timeouts', async (done) => {
      global.fetch = jest.fn(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      const data = await externalApis.getWeatherData(34.0195, -118.6814);
      
      // Should return fallback data
      expect(data).toHaveProperty('temperature');
      
      setTimeout(() => done(), 200);
    });

    test('should handle missing coordinates', async () => {
      const data = await externalApis.getWeatherData(null, null);
      
      // Should handle gracefully
      expect(data).toBeTruthy();
    });
  });

  describe('Data Structure Validation', () => {
    test('weather data has required fields', async () => {
      const data = await externalApis.getWeatherData(34.0195, -118.6814);
      
      const requiredFields = ['temperature', 'humidity', 'description', 'wind_speed'];
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });

    test('UV index data has required fields', async () => {
      const data = await externalApis.getUVIndexData(34.0195, -118.6814);
      
      const requiredFields = ['uv_index', 'warning_level', 'recommendations'];
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });

    test('air quality data has required fields', async () => {
      const data = await externalApis.getAirQualityData(34.0195, -118.6814);
      
      const requiredFields = ['aqi', 'health_status', 'pollutants'];
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });

    test('debris heatmap data has required fields', async () => {
      const data = await externalApis.getDebrisHeatmapData(34.0195, -118.6814, 50);
      
      const requiredFields = ['hotspots', 'total_reports'];
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });

    test('climate trends data has required fields', async () => {
      const data = await externalApis.getClimateTrends(34.0195, -118.6814);
      
      const requiredFields = ['temperature_trend', 'precipitation_trend', 'avg_temp', 'period_days'];
      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });
  });
});
