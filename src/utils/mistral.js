/*

import axios from "axios";
const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

export const generateCode = async (prompt, options = {}) => {
    const {
        maxTokens = 512,
        temperature = 0.7,
        model = 'mistral-large-latest',
        fallbackModel = 'mistral-small',
        maxRetries = 2,
        retryDelay = 3000
    } = options;

    let currentModel = model;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: currentModel,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature,
                },
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const fullResponse = response.data.choices[0].message.content.trim();
            const codeMatch = fullResponse.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = codeMatch ? codeMatch[1].trim() : '';
            const explanation = codeMatch
                ? fullResponse.replace(codeMatch[0], '').trim()
                : fullResponse;

            return { code, explanation };

        } catch (err) {
            const status = err.response?.status;
            const errorMsg = err.response?.data?.message || err.message;

            if (status === 429 && currentModel === model) {
                console.warn(`⚠️ Model ${model} hit capacity. Falling back to ${fallbackModel}...`);
                currentModel = fallbackModel;
                await new Promise((res) => setTimeout(res, retryDelay));
                continue;
            }

            if (status === 429 && attempt < maxRetries) {
                console.warn(`⏳ Retrying attempt ${attempt}...`);
                await new Promise((res) => setTimeout(res, retryDelay));
                continue;
            }

            console.error(`🔥 Mistral API error (${status}):`, errorMsg);
            return {
                code: `// Error generating code: ${errorMsg}`,
                explanation: ''
            };
        }
    }

    return {
        code: "// All attempts failed. Please try again later.",
        explanation: ''
    };
};

*/


import axios from "axios";
const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

export const generateCode = async (prompt, options = {}) => {
    const {
        maxTokens = 512,
        temperature = 0.7,
        model = 'mistral-large-latest',
        fallbackModel = 'mistral-small',
        maxRetries = 2,
        retryDelay = 3000
    } = options;

    let currentModel = model;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: currentModel,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature,
                },
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data.choices[0].message.content.trim();

        } catch (err) {
            const status = err.response?.status;
            const errorMsg = err.response?.data?.message || err.message;

            if (status === 429 && currentModel === model) {
                console.warn(`⚠️ Model ${model} hit capacity. Falling back to ${fallbackModel}...`);
                currentModel = fallbackModel;
                await new Promise((res) => setTimeout(res, retryDelay));
                continue;
            }

            if (status === 429 && attempt < maxRetries) {
                console.warn(`⏳ Retrying attempt ${attempt}...`);
                await new Promise((res) => setTimeout(res, retryDelay));
                continue;
            }

            console.error(`🔥 Mistral API error (${status}):`, errorMsg);
            return `// Error generating code: ${errorMsg}`;
        }
    }

    return "// All attempts failed. Please try again later.";
};