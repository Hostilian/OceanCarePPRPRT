const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Your GNews API Key
const API_KEY = process.env.GNEWS_API_KEY;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint to fetch news
app.get('/api/news', async (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({
            message:
                'GNews API key is missing. Please set the GNEWS_API_KEY environment variable.',
        });
    }
    try {
        const url = `https://gnews.io/api/v4/search?q=ocean%20OR%20nature%20conservation&lang=en&max=6&token=${API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ message: 'Failed to fetch news from GNews API.' });
    }
});

// Serve the index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Navigate to this URL in your browser to see the website.');
});
