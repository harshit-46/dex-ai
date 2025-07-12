const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_API_KEY = import.meta.env.VITE_FIREWORKS_API_KEY;

export const generateCode = async (prompt, options = {}) => {
    const {
        model = 'accounts/fireworks/models/claude-3-sonnet:20240229',
        temperature = 0.5,
        maxTokens = 2048,
    } = options;

    try {
        const response = await fetch(FIREWORKS_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                model,
                temperature,
                max_tokens: maxTokens,
                messages: [
                    { role: 'system', content: 'You are a helpful AI coding assistant.' },
                    { role: 'user', content: prompt },
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Fireworks fetch error:', errorData);
            return '// Fireworks API error: ' + (errorData.error?.message || response.statusText);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || '// No output generated.';
    } catch (error) {
        console.error('🔥 Network or parsing error:', error);
        return '// Unexpected error while calling Fireworks API.';
    }
};
