/**
 * External API Integration Module
 * Handles integration with weather, UV index, and climate data services
 * Includes fallbacks for graceful degradation
 */

const fetch = require('node-fetch');

// Cache for API responses (5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get weather data from Open-Meteo API (free, no authentication required)
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} - Weather data
 */
async function getWeatherData(latitude, longitude) {
  const cacheKey = `weather_${latitude}_${longitude}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data: data.current,
      timestamp: Date.now()
    });
    
    return data.current;
  } catch (error) {
    console.error('Weather API error:', error.message);
    return getWeatherFallback();
  }
}

/**
 * Get UV index data from Open-Meteo API
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} - UV index data
 */
async function getUVIndexData(latitude, longitude) {
  const cacheKey = `uv_${latitude}_${longitude}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=uv_index,uv_index_clear_sky&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`UV API error: ${response.status}`);
    
    const data = await response.json();
    
    // Determine UV warning level
    const uvIndex = data.current.uv_index;
    let warning = 'Safe';
    if (uvIndex >= 3 && uvIndex < 6) warning = 'Moderate';
    if (uvIndex >= 6 && uvIndex < 8) warning = 'High';
    if (uvIndex >= 8) warning = 'Very High';
    
    const result = {
      uv_index: uvIndex,
      warning_level: warning,
      recommendation: getUVRecommendation(uvIndex)
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('UV API error:', error.message);
    return getUVIndexFallback();
  }
}

/**
 * Get air quality data from Open-AQ API
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} - Air quality data
 */
async function getAirQualityData(latitude, longitude) {
  const cacheKey = `air_quality_${latitude}_${longitude}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${process.env.WAQI_API_KEY || 'demo'}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Air quality API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.status !== 'ok') throw new Error('Invalid air quality response');
    
    const result = {
      aqi: data.data.aqi,
      main_pollutant: data.data.dominentpol,
      station: data.data.city?.name || 'Unknown',
      last_update: data.data.time?.iso
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Air quality API error:', error.message);
    return getAirQualityFallback();
  }
}

/**
 * Get ocean debris heat map data (simulated with mock data)
 * In production, this would connect to satellite or crowdsourced data
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Object>} - Debris hotspot data
 */
async function getDebrisHeatmapData(latitude, longitude, radiusKm = 50) {
  const cacheKey = `debris_heatmap_${latitude}_${longitude}_${radiusKm}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    // Simulate data from recent debris reports in our database
    // This would be enhanced with satellite data in production
    const debrisHotspots = [
      {
        name: 'North Coastal Zone',
        latitude: latitude + 0.5,
        longitude: longitude + 0.5,
        density: 'High',
        reports_last_30_days: 12,
        primary_debris: ['plastic bags', 'bottles', 'microplastics']
      },
      {
        name: 'Central Bay Area',
        latitude: latitude,
        longitude: longitude,
        density: 'Medium',
        reports_last_30_days: 8,
        primary_debris: ['fishing nets', 'foam', 'plastic wrap']
      },
      {
        name: 'South Harbor Zone',
        latitude: latitude - 0.3,
        longitude: longitude - 0.3,
        density: 'Moderate',
        reports_last_30_days: 5,
        primary_debris: ['cans', 'plastic bags', 'rubber']
      }
    ];
    
    // Filter by radius (simple distance calculation)
    const filtered = debrisHotspots.filter(hotspot => {
      const distance = Math.sqrt(
        Math.pow(hotspot.latitude - latitude, 2) + 
        Math.pow(hotspot.longitude - longitude, 2)
      );
      return distance * 111 <= radiusKm; // Rough km conversion
    });
    
    const result = {
      center: { latitude, longitude },
      radius_km: radiusKm,
      hotspots: filtered,
      total_reports: filtered.reduce((sum, h) => sum + h.reports_last_30_days, 0),
      last_updated: new Date().toISOString()
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Debris heatmap error:', error.message);
    return getDebrisHeatmapFallback();
  }
}

/**
 * Get climate trends (temperature, precipitation, etc.)
 * Uses historical data averages as fallback
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @returns {Promise<Object>} - Climate trend data
 */
async function getClimateTrends(latitude, longitude) {
  const cacheKey = `climate_trends_${latitude}_${longitude}`;
  
  // Check cache (longer TTL for climate data - 1 day)
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      console.log('✓ Climate trends from cache');
      return cached.data;
    }
  }

  try {
    // Use Open-Meteo archive data for climate trends
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Climate API error: ${response.status}`);
    
    const data = await response.json();
    
    // Calculate trends
    const temps = data.daily.temperature_2m_max;
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const tempTrend = temps[temps.length - 1] - temps[0];
    
    const result = {
      period_days: 90,
      average_temperature_f: Math.round(avgTemp * 10) / 10,
      temperature_trend_f: Math.round(tempTrend * 10) / 10,
      trend_direction: tempTrend > 0 ? 'warming' : 'cooling',
      precipitation_days: data.daily.precipitation_sum.filter(p => p > 0).length,
      last_updated: new Date().toISOString()
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Climate trends error:', error.message);
    return getClimateTrendsFallback();
  }
}

/**
 * Get UV recommendation based on index
 * @param {number} uvIndex - Current UV index
 * @returns {string} - Recommendation text
 */
function getUVRecommendation(uvIndex) {
  if (uvIndex < 3) return 'No protection required. Sunglasses recommended.';
  if (uvIndex < 6) return 'Wear SPF 30+ sunscreen. Limit sun exposure during midday.';
  if (uvIndex < 8) return 'Wear SPF 50+ sunscreen, hat, and protective clothing. Avoid sun exposure.';
  return 'Avoid sun exposure. Stay indoors. Wear maximum protection if outdoors.';
}

/**
 * Weather data fallback
 * @returns {Object} - Default weather data
 */
function getWeatherFallback() {
  return {
    temperature_2m: 72,
    relative_humidity_2m: 65,
    weather_code: 1,
    wind_speed_10m: 10,
    note: 'Using fallback data'
  };
}

/**
 * UV index data fallback
 * @returns {Object} - Default UV data
 */
function getUVIndexFallback() {
  return {
    uv_index: 5,
    warning_level: 'High',
    recommendation: 'Wear SPF 50+ sunscreen and protective clothing.',
    note: 'Using fallback data'
  };
}

/**
 * Air quality data fallback
 * @returns {Object} - Default air quality data
 */
function getAirQualityFallback() {
  return {
    aqi: 50,
    main_pollutant: 'PM2.5',
    station: 'Unknown',
    note: 'Using fallback data'
  };
}

/**
 * Debris heatmap data fallback
 * @returns {Object} - Default heatmap data
 */
function getDebrisHeatmapFallback() {
  return {
    center: { latitude: 0, longitude: 0 },
    hotspots: [],
    total_reports: 0,
    note: 'Using fallback data'
  };
}

/**
 * Climate trends fallback
 * @returns {Object} - Default climate data
 */
function getClimateTrendsFallback() {
  return {
    period_days: 90,
    average_temperature_f: 72,
    temperature_trend_f: 2.5,
    trend_direction: 'warming',
    precipitation_days: 15,
    note: 'Using fallback data'
  };
}

/**
 * Clear cache (useful for testing)
 */
function clearCache() {
  cache.clear();
}

module.exports = {
  getWeatherData,
  getUVIndexData,
  getAirQualityData,
  getDebrisHeatmapData,
  getClimateTrends,
  clearCache
};
