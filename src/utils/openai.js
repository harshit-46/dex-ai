import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta';
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

export const generateCode = async (prompt) => {
    try {
        const response = await axios.post(
            HUGGINGFACE_API_URL,
            {
                inputs: `### Task:\n${prompt}\n\n### Response:\n`,
                parameters: {
                    max_new_tokens: 200,
                    return_full_text: false,
                    temperature: 0.5,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                },
            }
        );

        const output = Array.isArray(response.data)
            ? response.data[0]?.generated_text
            : response.data?.generated_text;

        return output || '// No output generated.';
    } catch (err) {
        console.error('HuggingFace API error:', err.response?.data || err.message);
        return '// Error generating code from Zephyr';
    }
};
