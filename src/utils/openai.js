// src/utils/openai.js
import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export const generateCode = async (prompt) => {
    try {
        const response = await axios.post(
            OPENAI_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful coding assistant.' },
                    { role: 'user', content: `Generate code for: ${prompt}` }
                ],
                temperature: 0.5,
                max_tokens: 300,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating code:', error);
        return '// Error generating code. Please try again.';
    }
};
