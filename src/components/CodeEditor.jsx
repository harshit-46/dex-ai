import React, { useState, useEffect } from 'react';
import { generateCodeStream } from '../utils/mistral';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const templates = [
    "Write a function to check if a number is prime",
    "Fix this bug in the code",
    "Convert this JavaScript code to Python"
];

const detectLanguage = (text) => {
    const match = text.match(/```(\w+)/);
    return match ? match[1] : 'javascript';
};

const CodeEditor = ({ selectedItem }) => {
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (selectedItem) {
            setPrompt(selectedItem.prompt);
            setCode(selectedItem.code || '');
            setLanguage(selectedItem.language || 'javascript');
            setResponseText('');
        }
    }, [selectedItem]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setCode('');
        setResponseText('');

        try {
            const stream = await generateCodeStream(prompt);
            let result = '';
            let currentLanguage = 'javascript';

            for await (const chunk of stream) {
                result += chunk;
                const codeMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
                const explanation = result.replace(/```[\s\S]*?```/, '').trim();

                if (codeMatch) {
                    setCode(codeMatch[1].trim());
                    currentLanguage = detectLanguage(result);
                    setLanguage(currentLanguage);
                } else {
                    setCode('');
                }
                setResponseText(explanation);
            }

            if (user && code) {
                await addDoc(collection(db, "users", user.uid, "history"), {
                    prompt,
                    code,
                    language: currentLanguage,
                    createdAt: serverTimestamp()
                });
            }

            setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
        } catch (err) {
            console.error("Code generation error:", err);
            setError(`An error occurred: ${err.message || "Unknown error"}`);
            toast.error("Failed to generate code.");
        } finally {
            setLoading(false);
        }
    };

    const handleExplainCode = () => {
        if (!code.trim()) return;
        setPrompt(`Explain this code:\n\n${code}`);
        handleGenerate();
    };

    const handleTemplateClick = (template) => {
        setPrompt(template);
        setSelectedTemplate(template);
    };

    const downloadCode = () => {
        const blob = new Blob([code], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `dex-code.${language}`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl bg-[#101012]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6">

                {/* Templates */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {templates.map((tpl, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleTemplateClick(tpl)}
                            className={`text-xs border border-gray-600 rounded-full px-3 py-1 hover:bg-gray-700 transition ${selectedTemplate === tpl ? 'bg-gray-700' : ''
                                }`}
                        >
                            {tpl}
                        </button>
                    ))}
                </div>

                {/* Prompt Input */}
                <textarea
                    rows="4"
                    className="w-full bg-[#0e0e0e] text-white border border-gray-700 rounded-lg p-4 mb-4 focus:outline-none resize-none"
                    placeholder="How can I help you today?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                {/* Generate Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md"
                    >
                        {loading ? 'Generating...' : '🚀 Generate Code'}
                    </button>
                </div>

                {/* Action Buttons */}
                {code && (
                    <div className="flex justify-center flex-wrap gap-4 mb-6">
                        <button
                            onClick={handleExplainCode}
                            className="border border-white px-4 py-1 rounded hover:bg-white hover:text-black text-sm"
                        >
                            🧠 Explain
                        </button>
                        <button
                            onClick={downloadCode}
                            className="bg-gray-700 px-4 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                            📥 Download
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success('Code copied!');
                            }}
                            className="bg-gray-700 px-4 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                            📋 Copy
                        </button>
                    </div>
                )}

                {/* Explanation/Error */}
                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}
                {responseText && (
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{responseText}</pre>
                )}

                {/* Monaco Editor */}
                {code && (
                    <Editor
                        height="400px"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        options={{
                            readOnly: true,
                            fontSize: 14,
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            padding: { top: 20, bottom: 20 },
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
