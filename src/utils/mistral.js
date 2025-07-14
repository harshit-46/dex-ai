// src/utils/mistral.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

// 🔁 Streaming version: returns a stream reader
// utils/mistral.js
export const generateCodeStream = async (prompt) => {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
            stream: true
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Mistral API error: ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    return {
        async *[Symbol.asyncIterator]() {
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");

                for (let line of lines) {
                    line = line.trim();
                    if (!line.startsWith("data:")) continue;

                    const jsonStr = line.replace("data: ", "");
                    if (jsonStr === "[DONE]") return;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) yield content;
                    } catch (e) {
                        console.warn("⚠️ Stream parse error:", e.message);
                    }
                }

                buffer = lines[lines.length - 1];
            }
        }
    };
};


// 🧱 Fallback version: full response with retries + fallback model
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
