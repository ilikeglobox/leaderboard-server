const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'leaderboard.json');

// Middlewares
app.use(cors());
app.use(express.json());

// Create the leaderboard file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
}

// Home route to test server
app.get('/', (req, res) => {
    res.send('Leaderboard server is running ✅');
});

// POST /submit — update or add player
app.post('/submit', (req, res) => {
    const { playerId, name, rebirths } = req.body;

    if (!playerId || !name || typeof rebirths !== 'number') {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const existing = data.find(p => p.playerId === playerId);

    if (existing) {
        existing.name = name;
        existing.rebirths = rebirths;
    } else {
        data.push({ playerId, name, rebirths });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// GET /leaderboard — return top 5
app.get('/leaderboard', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const sorted = data.sort((a, b) => b.rebirths - a.rebirths).slice(0, 5);
    res.json(sorted);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
