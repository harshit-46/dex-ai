// src/components/CodeEditor.jsx
import { useState } from 'react';
import { generateCode, MODELS } from '../utils/apiClient';
import { Play, Loader2, Copy, Check } from 'lucide-react';

const CodeEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedModel, setSelectedModel] = useState(MODELS.GPT2);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedCode('');

        try {
            const code = await generateCode(prompt, selectedModel);
            setGeneratedCode(code);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (generatedCode) {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleGenerate();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    AI Code Generator
                </h1>

                {/* Model Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Model:
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={MODELS.GPT2}>GPT-2 (Most Reliable)</option>
                        <option value={MODELS.DISTILGPT2}>DistilGPT-2 (Faster)</option>
                        <option value={MODELS.CODEGEN}>DialoGPT (Conversational)</option>
                    </select>
                </div>

                {/* Prompt Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe what code you want to generate:
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., a function that sorts an array of numbers, a React component that displays a todo list, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Press Ctrl+Enter to generate
                    </p>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Generate Code
                        </>
                    )}
                </button>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Generated Code Display */}
                {generatedCode && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Generated Code:
                            </h3>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;