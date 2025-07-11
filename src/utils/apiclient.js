// src/utils/apiClient.js
import axios from 'axios';

const API_BASE_URL = 'https://api-inference.huggingface.co/models';
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

// Available models (these actually work with the API)
export const MODELS = {
    GPT2: 'gpt2',
    DISTILGPT2: 'distilgpt2',
    CODEGEN: 'microsoft/DialoGPT-medium'
};

export const generateCode = async (prompt, model = MODELS.GPT2) => {
    if (!API_KEY) {
        throw new Error('API key not found. Please set VITE_HUGGINGFACE_API_KEY in your .env file');
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/${model}`,
            {
                inputs: `Generate JavaScript code: ${prompt}\n\nCode:\n`,
                parameters: {
                    max_new_tokens: 200,
                    temperature: 0.7,
                    do_sample: true,
                    top_p: 0.9,
                    stop: ['\n\n\n', '```']
                },
                options: {
                    wait_for_model: true
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        // Extract generated text
        const result = Array.isArray(response.data)
            ? response.data[0]?.generated_text
            : response.data?.generated_text;

        if (!result) {
            throw new Error('No response from API');
        }

        // Clean up the response
        const cleanCode = result
            .replace(`Generate JavaScript code: ${prompt}\n\nCode:\n`, '')
            .trim();

        return cleanCode || '// No code generated';

    } catch (error) {
        console.error('API Error:', error);

        if (error.response?.status === 401) {
            throw new Error('Invalid API key');
        } else if (error.response?.status === 503) {
            throw new Error('Model is loading. Please try again in a moment.');
        } else if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else {
            throw new Error(error.message || 'Failed to generate code');
        }
    }
};