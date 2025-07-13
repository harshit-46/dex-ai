/*

import React, { useState } from 'react';
import { generateCode } from '../utils/mistral';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('// Your generated code will appear here');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setCode('// Generating code...');
        setResponseText('');

        try {
            const { code, explanation } = await generateCode(prompt);
            setCode(code || '// No code block found');
            setResponseText(explanation || '');
        } catch (err) {
            setError('An error occurred while generating code.');
            setCode('// Error generating code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-[#0f0f0f] text-white flex flex-col">
            <header className="px-8 py-6 flex items-center justify-between border-b border-gray-800 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight">⚡ dex.ai</h1>
                <span className="text-sm text-gray-400">AI-Powered Code Generator</span>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <aside className="w-full md:w-1/3 lg:w-1/4 p-6 bg-[#181818] border-r border-gray-800 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">Ask anything</h2>
                    <textarea
                        rows="8"
                        className="w-full p-3 bg-[#1f1f1f] border border-gray-700 rounded-md resize-none focus:outline-none text-white"
                        placeholder="Describe the code you want..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-md transition font-semibold text-center"
                    >
                        🚀 {loading ? 'Generating...' : 'Generate Code'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </aside>

                <section className="flex-1 bg-[#0f0f0f] p-6 overflow-auto">
                    {responseText && (
                        <div className="mb-4 text-gray-300 leading-relaxed space-y-3">
                            {responseText.split('\n').map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                        </div>
                    )}
                    <Editor
                        height="65vh"
                        defaultLanguage="javascript"
                        language="javascript"
                        theme="vs-dark"
                        value={code}
                        options={{
                            readOnly: true,
                            fontSize: 14,
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            padding: { top: 20, bottom: 20 }
                        }}
                    />
                </section>
            </main>
        </div>
    );
};

export default CodeEditor;

*/



// src/components/CodeEditor.jsx
import React, { useState } from 'react';
import { generateCode } from '../utils/mistral';
import Editor from '@monaco-editor/react';
import { Sparkles } from 'lucide-react';

const CodeEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('// Your generated code will appear here');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setCode('// Generating code...');
        setResponseText('');

        try {
            const result = await generateCode(prompt, {
                maxTokens: 600,
                temperature: 0.4
            });

            const codeMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const explanation = result.replace(/```[\s\S]*?```/, '').trim();

            setCode(codeMatch ? codeMatch[1].trim() : '// No code block found.');
            setResponseText(explanation);
        } catch (err) {
            setError('An error occurred while generating code.');
            setCode('// Error generating code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-b from-[#0a0c10] via-[#0d1117] to-[#0a0c10] text-white font-sans overflow-hidden">
            <header className="px-8 py-6 flex items-center justify-between border-b border-gray-800 shadow-md backdrop-blur-md">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={28} /> dex.ai
                </h1>
                <span className="text-sm text-gray-400">AI-Powered Code Generator</span>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 h-full">
                <aside className="col-span-1 p-8 bg-[#0e111b] border-r border-gray-800 flex flex-col gap-6 shadow-md">
                    <h2 className="text-lg font-semibold">Prompt</h2>
                    <textarea
                        rows="8"
                        className="w-full p-3 bg-[#181a27] border border-gray-700 rounded-md resize-none focus:outline-none text-white"
                        placeholder="Describe the code you want..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-md transition font-semibold"
                    >
                        {loading ? 'Generating...' : '🚀 Generate Code'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </aside>

                <section className="col-span-2 flex flex-col p-6 space-y-4 bg-[#0a0c10] overflow-hidden">
                    {responseText && (
                        <div className="bg-[#12141c] p-4 rounded-md text-sm text-gray-300 leading-relaxed border border-gray-800 max-h-40 overflow-y-auto">
                            {responseText}
                        </div>
                    )}
                    <div className="flex-1 rounded-md border border-gray-800 overflow-hidden">
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
                                padding: { top: 20, bottom: 20 }
                            }}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CodeEditor;
