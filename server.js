const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Your GNews API Key
const API_KEY = 'd1ebf8a38da2b60015304b61977cd57c';

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint to fetch news
app.get('/api/news', async (req, res) => {
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
