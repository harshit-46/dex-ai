import React, { useState , useEffect } from 'react';
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
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('javascript');
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
            for await (const chunk of stream) {
                result += chunk;
                const codeMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
                const explanation = result.replace(/```[\s\S]*?```/, '').trim();
                if (codeMatch) {
                    setCode(codeMatch[1].trim());
                    setLanguage(detectLanguage(result));
                } else {
                    setCode('');
                }
                setResponseText(explanation);
            }

            if (user) {
                await addDoc(collection(db, "users", user.uid, "history"), {
                    prompt,
                    code,
                    language,
                    createdAt: serverTimestamp()
                });
            }
            setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
        } catch (err) {
            console.error("❌ Code generation error:", err);
            setError(`An error occurred while generating code: ${err.message || "Unknown error"}`);
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
        <div className="h-screen overflow-y-auto bg-gradient-to-br from-[#05070d] via-[#0d0f1b] to-[#0c0e14] text-white flex flex-col">
            <div className="w-full max-w-4xl mx-auto px-4 py-10">
                {/* Templates */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {templates.map((tpl, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleTemplateClick(tpl)}
                            className={`text-xs border border-gray-600 rounded-full px-3 py-1 hover:bg-gray-700 transition ${selectedTemplate === tpl ? 'bg-gray-700' : ''}`}
                        >
                            {tpl.split(':')[0]}
                        </button>
                    ))}
                </div>

                {/* Prompt */}
                <textarea
                    rows="5"
                    className="w-full p-4 bg-[#181a27] border border-gray-700 rounded-md resize-none focus:outline-none text-white mb-4"
                    placeholder="Ask Dex..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                {/* Generate */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-6 rounded-md transition font-semibold"
                    >
                        {loading ? "Generating..." : "🚀 Generate Code"}
                    </button>
                </div>

                {/* Controls */}
                {code && (
                    <div className="flex justify-center gap-4 flex-wrap mb-4">
                        <button onClick={handleExplainCode} className="border border-white text-sm px-4 py-1 rounded hover:bg-white hover:text-black transition">Explain</button>
                        <button onClick={downloadCode} className="bg-gray-700 text-sm px-4 py-1 rounded hover:bg-gray-600">📥 Download</button>
                        <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied!"); }} className="bg-gray-700 text-sm px-4 py-1 rounded hover:bg-gray-600">📋 Copy</button>
                    </div>
                )}

                {/* Explanation */}
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                {responseText &&
                    <p className="text-sm text-gray-300 mb-4 whitespace-pre-line">{responseText}</p>
                }

                {/* Editor */}
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
                            padding: { top: 20, bottom: 20 }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
