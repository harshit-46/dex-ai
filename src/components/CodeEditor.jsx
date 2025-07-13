import React, { useState } from 'react';
import { generateCode } from '../utils/mistral';
import Editor from '@monaco-editor/react';
import { Sparkles } from 'lucide-react';

const CodeEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setCode('');
        setResponseText('');

        try {
            const result = await generateCode(prompt, {
                maxTokens: 600,
                temperature: 0.4
            });

            const codeMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const explanation = result.replace(/```[\s\S]*?```/, '').trim();

            setCode(codeMatch ? codeMatch[1].trim() : '');
            setResponseText(explanation);
        } catch (err) {
            setError('An error occurred while generating code.');
            setCode('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-[#05070d] via-[#0d0f1b] to-[#0c0e14] text-white flex flex-col">
            <header className="px-10 py-6 flex items-center justify-between border-b border-gray-800 shadow-sm">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={28} /> dex.ai
                </h1>
                <span className="text-sm text-gray-400">AI-Powered Code Generator</span>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <aside className="w-full md:w-1/3 lg:w-1/4 px-6 py-8 bg-[#0f111a] border-r border-gray-800 flex flex-col gap-6">
                    <h2 className="text-xl font-semibold">Prompt</h2>
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
                        className="mt-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-md transition font-semibold text-center"
                    >
                        {loading ? 'Generating...' : '🚀 Generate Code'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {responseText && (
                        <div className="mt-4 text-sm text-gray-300 whitespace-pre-line">
                            {responseText}
                        </div>
                    )}
                </aside>

                {code && (
                    <section className="flex-1 bg-[#0a0b10] p-6 overflow-auto">
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
                    </section>
                )}
            </main>
        </div>
    );
};

export default CodeEditor;