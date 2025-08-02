const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'leaderboard.json';

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.post('/submit', (req, res) => {
    const { playerId, name, rebirths } = req.body;
    if (!playerId || !name || typeof rebirths !== 'number') {
        return res.status(400).send({ error: 'Invalid data' });
    }

    let data = JSON.parse(fs.readFileSync(DATA_FILE));
    const existing = data.find(p => p.playerId === playerId);

    if (existing) {
        existing.rebirths = rebirths;
        existing.name = name;
    } else {
        data.push({ playerId, name, rebirths });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    res.send({ success: true });
});

app.get('/leaderboard', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    const sorted = data.sort((a, b) => b.rebirths - a.rebirths).slice(0, 5);
    res.json(sorted);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
