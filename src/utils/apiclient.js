import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta';
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateCode = async (prompt, options = {}) => {
    const {
        maxTokens = 500,
        temperature = 0.3,
        maxRetries = 3,
        language = 'javascript',
    } = options;

    const formattedPrompt = `You are a coding assistant. Generate ${language} code for the following task:\n\n${prompt}\n\nCode:\n`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                HUGGINGFACE_API_URL,
                {
                    inputs: formattedPrompt,
                    parameters: {
                        max_new_tokens: maxTokens,
                        temperature,
                        top_p: 0.9,
                        do_sample: true,
                        stop: ["</code>", "```", "\n\n\n"]
                    },
                    options: {
                        wait_for_model: true
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const data = response.data;
            let output;

            if (Array.isArray(data)) {
                output = data[0]?.generated_text;
            } else {
                output = data?.generated_text;
            }

            const cleanOutput = output?.replace(formattedPrompt, '').trim();
            return cleanOutput || '// No code generated.';

        } catch (err) {
            console.error(`HuggingFace API error (attempt ${attempt}/${maxRetries}):`, err.response?.data || err.message);

            if (err.response?.status === 503 && attempt < maxRetries) {
                console.log(`Model loading, retrying in ${attempt * 2}s...`);
                await delay(attempt * 2000);
                continue;
            }

            if (err.response?.status === 401) {
                return '// Invalid API key. Please check your HuggingFace key.';
            }

            if (err.response?.status === 429) {
                return '// Rate limit exceeded. Try again shortly.';
            }

            if (attempt === maxRetries) {
                return `// Error generating code: ${err.message}`;
            }

            await delay(1000 * attempt);
        }
    }
};
