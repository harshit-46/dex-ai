// server/index.js (CommonJS)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
console.log("Loaded API Key:", process.env.OPENAI_API_KEY);
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful AI coding assistant.' },
                    { role: 'user', content: `Generate code for: ${prompt}` }
                ],
                temperature: 0.5,
                max_tokens: 300,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ code: response.data.choices[0].message.content.trim() });
    } catch (err) {
        console.error('OpenAI error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate code' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
