import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateCodeStream } from '../utils/mistral';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
    Copy,
    Download,
    Loader2,
    AlertCircle,
    CheckCircle,
    Send
} from 'lucide-react';


const CodeEditor = ({selectedItem}) => {

    const[input , setInput] = useState('');

    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [streamingText, setStreamingText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const { user } = useAuth();
    const promptRef = useRef(null);

    useEffect(() => {
        if (selectedItem) {
            setPrompt(selectedItem.prompt);
            setCode(selectedItem.code || '');
            setLanguage(selectedItem.language || 'javascript');
            setResponseText('');
            setError('');
            setStreamingText('');
        }
    }, [selectedItem]);

    useEffect(() => {
        if (selectedItem) {
            // Set input field and output fields
            setInput(selectedItem.prompt);
            setCode(selectedItem.code);
            setResponseText(selectedItem.response);
        }
    }, [selectedItem]);

    useEffect(() => {
        if (prompt) {
            setInput(prompt); 
        }
    }, [prompt]);

    const autoResizeTextarea = useCallback(() => {
        if (promptRef.current) {
            promptRef.current.style.height = 'auto';
            promptRef.current.style.height = Math.min(promptRef.current.scrollHeight, 200) + 'px';
        }
    }, []);

    useEffect(() => {
        autoResizeTextarea();
    }, [prompt, autoResizeTextarea]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }
    
        setLoading(true);
        setIsStreaming(true);
        setError('');
        setCode('');
        setResponseText('');
        setStreamingText('');
    
        try {
            const stream = await generateCodeStream(prompt);
            let result = '';
            let finalCode = '';
            let finalLanguage = 'javascript';
            let finalExplanation = '';
    
            for await (const chunk of stream) {
                result += chunk;
                setStreamingText(result);
            }
    
            const codeMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
            finalCode = codeMatch ? codeMatch[1].trim() : '';
            const langMatch = result.match(/```(\w+)/);
            finalLanguage = langMatch ? langMatch[1] : language;
            finalExplanation = result.replace(/```[\s\S]*?```/, '').trim();
            setCode(finalCode);
            setLanguage(finalLanguage);
            setResponseText(finalExplanation);
    
            if (user && finalCode) {
                await addDoc(collection(db, "users", user.uid, "history"), {
                    prompt,
                    code: finalCode,
                    language: finalLanguage,
                    response: finalExplanation,
                    createdAt: serverTimestamp()
                });
                toast.success('Generated code saved to history');
            }
        } catch (err) {
            console.error("Code generation error:", err);
            setError(`Failed to generate code: ${err.message || "Unknown error"}`);
            toast.error("Code generation failed");
        } finally {
            setLoading(false);
            setIsStreaming(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const copyCode = useCallback(async () => {
        if (!code.trim()) {
            toast.error('No code to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            toast.success('Code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Failed to copy code');
        }
    }, [code]);

    const downloadCode = useCallback(() => {
        if (!code.trim()) {
            toast.error('No code to download');
            return;
        }

        const blob = new Blob([code], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `generated-code.${language === 'cpp' ? 'cpp' : language}`;
        link.click();
        toast.success('Code downloaded successfully');
    }, [code, language]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="p-6">
                        <div className="relative">
                            <textarea
                                ref={promptRef}
                                rows="3"
                                className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                                placeholder="Describe what you want to create... (Press Ctrl+Enter to generate)"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onInput={autoResizeTextarea}
                                onKeyDown={handleKeyPress}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !prompt.trim()}
                                className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                title="Generate Code (Ctrl+Enter)"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {isStreaming && streamingText && (
                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                <span className="text-sm text-gray-300">AI is generating response...</span>
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{streamingText}</pre>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-gray-800/60 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 font-medium">Error</p>
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {responseText && !isStreaming && (
                    <div className="bg-gray-800/60 backdrop-blur-md border border-blue-500/20 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <CheckCircle className="h-5 w-5 text-blue-400" />
                                    <span className="text-blue-400 font-medium">AI Response</span>
                                </div>
                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {responseText}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {code && !isStreaming && (
                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">

                        <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700/50">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Generated Code</span>
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                    {language.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={copyCode}
                                    className="flex items-center space-x-1 bg-green-600/20 border border-green-500/30 text-green-300 px-3 py-1 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span>Copy</span>
                                </button>
                                <button
                                    onClick={downloadCode}
                                    className="flex items-center space-x-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-0">
                            <pre className="bg-gray-900 text-gray-300 p-6 overflow-x-auto text-sm leading-relaxed">
                                <code>{code}</code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
