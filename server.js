const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint to fetch news
app.get('/api/news', async (req, res) => {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not found.' });
  }
  const url = `https://gnews.io/api/v4/search?q=ocean%20OR%20nature%20conservation&lang=en&max=6&token=${apiKey}`;

  try {
    const newsResponse = await fetch(url);
    if (!newsResponse.ok) {
      // GNews API typically returns errors in the body, so we try to parse it
      const errorBody = await newsResponse.json();
      console.error('GNews API Error:', errorBody);
      return res.status(newsResponse.status).json({ error: 'Failed to fetch news from GNews', details: errorBody });
    }
    const newsData = await newsResponse.json();
    res.json(newsData);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fallback to index.html for single-page application (if you go this route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
