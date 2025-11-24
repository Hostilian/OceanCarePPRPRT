const DEFAULT_LOCATION = { lat: 37.7749, lon: -122.4194, label: 'San Francisco, CA' };

const IMPACT_CONSTANTS = {
  donationToCo2: 2.6, // lbs of CO₂ offset per dollar
  volunteerToCo2: 1.4, // lbs offset per hour
  donationToPlastic: 0.35, // kg per dollar (grants, cleanup robots)
  volunteerToPlastic: 12, // kg per hour (average cleanup yield)
  reportToPlastic: 18, // kg per verified debris report resolved
  donationToHabitat: 4, // sq ft restored per dollar
  volunteerToHabitat: 3, // sq ft restored per hour via coral nursery prep
  donationToMarine: 0.06, // marine species supported per dollar
  reportToMarine: 4 // species protected per rapid response
};

const state = {
  newsArticles: []
};

const NEWS_CARD_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  setTimeout(loadAPIData, 800);
  initImpactCalculator();
  initClimateTrends();
  loadNewsGrid();
});

function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  for (const anchor of anchors) {
    anchor.addEventListener('click', event => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

async function loadAPIData() {
  const { lat, lon } = await getUserLocation();

  await Promise.all([
    updateWeather(lat, lon),
    updateUV(lat, lon),
    updateAirQuality(lat, lon)
  ]);
}

async function getUserLocation() {
  if (!navigator.geolocation) {
    return DEFAULT_LOCATION;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      label: 'Your location'
    };
  } catch (error) {
    return DEFAULT_LOCATION;
  }
}

async function updateWeather(lat, lon) {
  try {
    const response = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}`);
    if (!response.ok) throw new Error('Weather response error');
    const data = await response.json();
    if (data.success === false) {
      throw new Error(data.message || 'Weather request failed');
    }
    const payload = data.data || data;
    const tempValue = document.getElementById('temp-value');
    const windValue = document.getElementById('wind-value');
    if (tempValue && payload.temperature_2m !== undefined) {
      tempValue.textContent = `${Math.round(payload.temperature_2m)}°F`;
    }
    if (windValue && payload.wind_speed_10m !== undefined) {
      windValue.textContent = `${Math.round(payload.wind_speed_10m)} mph`;
    }
  } catch (error) {
    console.error('Weather widget error', error);
  }
}

async function updateUV(lat, lon) {
  try {
    const response = await fetch(`/api/uv-index?latitude=${lat}&longitude=${lon}`);
    if (!response.ok) throw new Error('UV response error');
    const data = await response.json();
    if (data.success === false) {
      throw new Error(data.message || 'UV request failed');
    }
    const payload = data.data || data;
    const uvValue = document.getElementById('uv-value');
    const uvLevel = document.getElementById('uv-level');
    if (uvValue && payload.uv_index !== undefined) {
      uvValue.textContent = payload.uv_index;
    }
    if (uvLevel) {
      uvLevel.textContent = payload.warning_level || payload.recommendation || 'Moderate';
    }
  } catch (error) {
    console.error('UV widget error', error);
  }
}

async function updateAirQuality(lat, lon) {
  try {
    const response = await fetch(`/api/air-quality?latitude=${lat}&longitude=${lon}`);
    if (!response.ok) throw new Error('AQI response error');
    const data = await response.json();
    if (data.success === false) {
      throw new Error(data.message || 'Air quality request failed');
    }
    const payload = data.data || data;
    const aqiValue = document.getElementById('aqi-value');
    if (aqiValue && payload.aqi !== undefined) {
      aqiValue.textContent = payload.aqi;
    }
  } catch (error) {
    console.error('AQI widget error', error);
  }
}

function initImpactCalculator() {
  const donationInput = document.getElementById('impact-donation-input');
  const volunteerInput = document.getElementById('impact-volunteer-input');
  const volunteerValue = document.getElementById('impact-volunteer-value');
  const debrisInput = document.getElementById('impact-debris-input');
  const debrisValue = document.getElementById('impact-debris-value');
  const quickButtons = document.querySelectorAll('.impact-quick');
  const summaryText = document.getElementById('impact-summary-text');

  if (!donationInput || !volunteerInput || !debrisInput) {
    return;
  }

  const recalculate = () => {
    const donation = parseFloat(donationInput.value) || 0;
    const volunteerHours = parseFloat(volunteerInput.value) || 0;
    const debrisReports = parseFloat(debrisInput.value) || 0;

    const co2Offset = (donation * IMPACT_CONSTANTS.donationToCo2) + (volunteerHours * IMPACT_CONSTANTS.volunteerToCo2);
    const plasticRemoved = (donation * IMPACT_CONSTANTS.donationToPlastic) + (volunteerHours * IMPACT_CONSTANTS.volunteerToPlastic) + (debrisReports * IMPACT_CONSTANTS.reportToPlastic);
    const habitatRestored = (donation * IMPACT_CONSTANTS.donationToHabitat) + (volunteerHours * IMPACT_CONSTANTS.volunteerToHabitat);
    const marineProtected = (donation * IMPACT_CONSTANTS.donationToMarine) + (debrisReports * IMPACT_CONSTANTS.reportToMarine);

    setImpactOutput('co2', `${Math.round(co2Offset).toLocaleString()} lbs`);
    setImpactOutput('plastic', `${Math.round(plasticRemoved).toLocaleString()} kg`);
    setImpactOutput('habitat', `${Math.round(habitatRestored).toLocaleString()} sq ft`);
    setImpactOutput('marine', `${Math.round(marineProtected).toLocaleString()} species`);

    if (summaryText) {
      const monthlyPhrase = donation > 0 ? `$${donation.toLocaleString()}` : 'Your plan';
      summaryText.textContent = `${monthlyPhrase} + ${volunteerHours} volunteer hrs funds ${Math.round(plasticRemoved).toLocaleString()}kg of cleanup and protects ${Math.round(marineProtected).toLocaleString()} marine animals.`;
    }
  };

  for (const button of quickButtons) {
    button.addEventListener('click', () => {
      const amount = Number(button.dataset.amount || 0);
      donationInput.value = amount;
      for (const sibling of quickButtons) {
        sibling.classList.remove('btn-primary');
      }
      button.classList.add('btn-primary');
      recalculate();
    });
  }

  donationInput.addEventListener('input', () => {
    for (const button of quickButtons) {
      button.classList.remove('btn-primary');
    }
    recalculate();
  });

  volunteerInput.addEventListener('input', () => {
    if (volunteerValue) {
      volunteerValue.textContent = volunteerInput.value;
    }
    recalculate();
  });

  debrisInput.addEventListener('input', () => {
    if (debrisValue) {
      debrisValue.textContent = debrisInput.value;
    }
    recalculate();
  });

  recalculate();
}

function setImpactOutput(key, value) {
  const el = document.querySelector(`[data-impact-output="${key}"]`);
  if (el) {
    el.textContent = value;
  }
}

function initClimateTrends() {
  const form = document.getElementById('climate-form');
  const locationInput = document.getElementById('climate-location');
  const status = document.getElementById('climate-status');
  const useLocationBtn = document.getElementById('climate-use-location');

  if (!form || !locationInput) {
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = locationInput.value.trim();
    if (!query) {
      if (status) {
        status.textContent = 'Enter a city, beach, or coordinates to fetch trends.';
      }
      return;
    }
    await fetchClimateForQuery(query);
  });

  if (useLocationBtn) {
    useLocationBtn.addEventListener('click', async () => {
      if (!navigator.geolocation) {
        if (status) {
          status.textContent = 'Geolocation not available. Please enter a location instead.';
        }
        return;
      }
      if (status) {
        status.textContent = 'Detecting your coordinates…';
      }
      navigator.geolocation.getCurrentPosition(async position => {
        await fetchClimate({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: 'Your location'
        });
      }, () => {
        if (status) {
          status.textContent = 'Unable to fetch location. Enter a city or coordinates manually.';
        }
      }, { timeout: 5000 });
    });
  }
}

async function fetchClimateForQuery(query) {
  const status = document.getElementById('climate-status');
  if (status) {
    status.textContent = 'Contacting Nominatim for coordinates…';
  }
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Geocoding failed');
    const results = await response.json();
    if (!Array.isArray(results) || !results.length) {
      throw new Error('No location found');
    }
    const match = results[0];
    await fetchClimate({ lat: match.lat, lon: match.lon, label: match.display_name });
  } catch (error) {
    if (status) {
      status.textContent = `Unable to geocode location: ${error.message}`;
    }
  }
}

async function fetchClimate({ lat, lon, label }) {
  const status = document.getElementById('climate-status');
  if (status) {
    status.textContent = 'Loading climate trends…';
  }
  try {
    const response = await fetch(`/api/climate-trends?latitude=${lat}&longitude=${lon}`);
    if (!response.ok) throw new Error('Climate endpoint unavailable');
    const data = await response.json();
    if (data.success === false) {
      throw new Error(data.message || 'Climate request failed');
    }
    const payload = data.data || data.climateTrends || data;
    updateClimateCards(payload, label);
    if (status) {
      status.textContent = `90-day climate trends for ${label || 'selected location'}`;
    }
  } catch (error) {
    if (status) {
      status.textContent = `Unable to load climate data: ${error.message}`;
    }
  }
}

function updateClimateCards(data, label) {
  const tempEl = document.getElementById('climate-temp');
  const trendEl = document.getElementById('climate-trend');
  const trendChangeEl = document.getElementById('climate-trend-change');
  const precipEl = document.getElementById('climate-precip');

  if (tempEl && data.average_temperature_f !== undefined) {
    tempEl.textContent = `${data.average_temperature_f} °F`;
  }
  if (trendEl) {
    const direction = (data.trend_direction || 'stable').toUpperCase();
    trendEl.textContent = direction;
  }
  if (trendChangeEl && data.temperature_trend_f !== undefined) {
    const delta = Math.round(Number(data.temperature_trend_f) * 10) / 10;
    trendChangeEl.textContent = `${delta > 0 ? '+' : ''}${delta} °F over ${data.period_days || 90} days (${label || 'location'})`;
  }
  if (precipEl && data.precipitation_days !== undefined) {
    precipEl.textContent = `${data.precipitation_days} days`;
  }
}

async function loadNewsGrid() {
  const grid = document.getElementById('news-grid');
  const preview = document.getElementById('news-preview');
  if (!grid) {
    return;
  }
  try {
    const response = await fetch('/api/news?limit=6');
    if (!response.ok) throw new Error('News endpoint error');
    const data = await response.json();
    const articles = Array.isArray(data.articles) ? data.articles.slice(0, 6) : [];
    state.newsArticles = articles;
    if (!articles.length) {
      grid.innerHTML = '<div class="card" style="padding: var(--space-6);"><p>No headlines available.</p></div>';
      return;
    }
    grid.innerHTML = articles.map(article => createNewsCard(article)).join('');
    if (preview && articles[0]) {
      preview.innerHTML = `
        <p style="font-weight: var(--fw-semibold); margin-bottom: var(--space-2); color: var(--color-text);">
          ${articleTitle(articles[0])}
        </p>
        <p style="font-size: var(--text-xs); color: var(--color-text-lighter);">
          ${formatDate(articles[0].publishedAt)}
        </p>
      `;
    }
  } catch (error) {
    console.error('News grid error', error);
    grid.innerHTML = '<div class="card" style="padding: var(--space-6);"><p>Unable to load news right now.</p></div>';
    if (preview) {
      preview.textContent = 'News service temporarily unavailable.';
    }
  }
}

function createNewsCard(article) {
  const title = articleTitle(article);
  const description = article.description || 'Full story available on our news page.';
  const source = typeof article.source === 'string'
    ? article.source
    : article.source?.name || 'OceanCare Newswire';
  const published = formatDate(article.publishedAt);
  const url = article.url || '#';
  const image = article.image || NEWS_CARD_FALLBACK_IMAGE;
  const altText = `${title} — ${source}`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeSource = escapeHtml(source);
  const safePublished = escapeHtml(published);
  const safeUrl = escapeAttribute(url);
  const safeImage = escapeAttribute(image);
  const safeAlt = escapeAttribute(altText);
  const safeFallback = escapeAttribute(NEWS_CARD_FALLBACK_IMAGE);

  return `
    <article class="card news-card">
        <div class="news-card-media">
            <img src="${safeImage}" alt="${safeAlt}" loading="lazy" onerror="this.onerror=null;this.src='${safeFallback}';">
        </div>
        <div class="news-card-body">
            <p class="news-card-source">${safeSource}</p>
            <h3>${safeTitle}</h3>
            <p style="color: var(--color-text-light); flex: 1;">${safeDescription}</p>
            <p style="font-size: var(--text-xs); color: var(--color-text-lighter);">${safePublished}</p>
            <a class="news-card-link" href="${safeUrl}" target="_blank" rel="noopener">Read More →</a>
        </div>
    </article>
  `;
}

function escapeHtml(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(value) {
  return escapeHtml(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function articleTitle(article) {
  return article.title || 'Ocean conservation update';
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    return value;
  }
}
