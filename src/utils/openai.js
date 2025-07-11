// src/utils/openai.js
import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/completions';

export const generateCode = async (prompt) => {
    try {
        const response = await axios.post(
            OPENAI_URL,
            {
                model: 'text-davinci-003',
                prompt: `Generate code for: ${prompt}`,
                temperature: 0.5,
                max_tokens: 150,
                n: 1,
                stop: null,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error generating code:', error);
        return '// Error generating code. Please try again.';
    }
};
