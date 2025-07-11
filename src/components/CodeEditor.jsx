// src/components/CodeEditor.jsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { generateCode } from '../utils/openai';

const CodeEditor = () => {
    const [code, setCode] = useState('// Type your prompt below and click Generate');
    const [language, setLanguage] = useState('javascript');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;

        setLoading(true);
        setError('');
        try {
            const generated = await generateCode(prompt);
            setCode(generated);
        } catch (err) {
            setError('⚠️ Failed to generate code. Check your API key or internet.');
            setCode('// Error: Could not fetch code from AI.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6 max-w-screen-lg mx-auto">
            <Editor
                height="60vh"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
            />

            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                <input
                    type="text"
                    placeholder="🔍 Describe what you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded shadow-sm"
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate Code'}
                </button>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default CodeEditor;
