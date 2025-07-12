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
                {/* Prompt Sidebar */}
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

                {/* Output Section */}
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