import React, { useState } from 'react';
import { generateCode } from '../utils/mistral';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('// Your generated code will appear here');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setCode('// Generating code...');

        try {
            const result = await generateCode(prompt, {
                maxTokens: 500,
                temperature: 0.3,
                language: 'javascript',
            });
            setCode(result);
        } catch (err) {
            setError('An error occurred while generating code.');
            setCode('// Error generating code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-[#0f0f0f] text-white flex flex-col font-sans overflow-hidden">
            <header className="px-10 py-6 flex items-center justify-between border-b border-gray-800 shadow-md bg-[#111]">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-orange-500">⚡</span> <span>dex.ai</span>
                </h1>
                <span className="text-sm text-gray-400 italic">AI-Powered Code Generator</span>
            </header>

            <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_2fr] overflow-hidden">
                <aside className="bg-[#181818] border-r border-gray-800 p-6 flex flex-col gap-4">
                    <h2 className="text-xl font-semibold mb-2">Prompt</h2>
                    <textarea
                        rows="10"
                        className="w-full p-4 bg-[#1f1f1f] border border-gray-700 rounded-md resize-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Describe the code you want..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-semibold py-2 rounded-md shadow-md transition"
                    >
                        {loading ? 'Generating...' : '🚀 Generate Code'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </aside>

                <section className="bg-[#0f0f0f] p-6 overflow-auto">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        language="javascript"
                        theme="vs-dark"
                        value={code}
                        options={{
                            readOnly: true,
                            fontSize: 14,
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            padding: { top: 20, bottom: 20 },
                            scrollBeyondLastLine: false,
                        }}
                    />
                </section>
            </main>
        </div>
    );
};

export default CodeEditor;
