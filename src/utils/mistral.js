import axios from "axios";
const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

export const generateCode = async (prompt, options = {}) => {
    try {
        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: 'mistral-large-latest',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: options.maxTokens || 512,
                temperature: options.temperature || 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (err) {
        if (err.response?.status === 429) {
            console.warn('🚨 Rate limit hit:', err.response.data);
            return '// You’ve hit the rate limit. Please wait a moment and try again.';
        }
        console.error('Mistral API Error:', err);
        return '// Error generating code.';
    }
};
