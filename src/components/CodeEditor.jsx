/*


import React, { useState, useEffect, useCallback, useRef ,useImperativeHandle, forwardRef } from 'react';
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


const CodeEditor = forwardRef((props, ref ) => {

    const { selectedItem } = props;
    const [input, setInput] = useState('');
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


    useImperativeHandle(ref, () => ({
        clearEditor: () => {
            setPrompt('');
            setInput('');
            setCode('');
            setResponseText('');
            setStreamingText('');
            setError('');
        }
    }));

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
});

export default CodeEditor;


*/



import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
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
    Send,
    Sparkles,
    Code
} from 'lucide-react';

const CodeEditor = forwardRef((props, ref) => {
    const { selectedItem } = props;
    const [input, setInput] = useState('');
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [streamingText, setStreamingText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const { user } = useAuth();
    const promptRef = useRef(null);
    const abortControllerRef = useRef(null);
    const conversationEndRef = useRef(null);

    useImperativeHandle(ref, () => ({
        clearEditor: () => {
            setPrompt('');
            setInput('');
            setCode('');
            setResponseText('');
            setStreamingText('');
            setError('');
            setConversationHistory([]);
            setHasStartedChat(false);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        }
    }));


    useEffect(() => {
        if (selectedItem) {
            setPrompt(selectedItem.prompt || '');
            setInput(selectedItem.prompt || '');
            setCode(selectedItem.code || '');
            setLanguage(selectedItem.language || 'javascript');
            setResponseText(selectedItem.response || '');
            setStreamingText('');
            setError('');
            setHasStartedChat(true);

            setConversationHistory([{
                id: Date.now(),
                prompt: selectedItem.prompt || '',
                code: selectedItem.code || '',
                language: selectedItem.language || 'javascript',
                response: selectedItem.response || '',
                timestamp: new Date()
            }]);
        }
    }, [selectedItem]);

    const autoResizeTextarea = useCallback(() => {
        if (promptRef.current) {
            promptRef.current.style.height = 'auto';
            promptRef.current.style.height = Math.min(promptRef.current.scrollHeight, 120) + 'px';
        }
    }, []);

    useEffect(() => {
        autoResizeTextarea();
    }, [prompt, autoResizeTextarea]);


    useEffect(() => {
        if (conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversationHistory, streamingText, isStreaming]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        const currentPrompt = prompt.trim();
        setHasStartedChat(true);
        

        const userMessage = {
            id: Date.now(),
            prompt: currentPrompt,
            code: '',
            language: 'javascript',
            response: '',
            timestamp: new Date(),
            isLoading: true
        };
        
        setConversationHistory(prev => [...prev, userMessage]);
        setPrompt('');


        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setIsStreaming(true);
        setError('');
        setStreamingText('');

        try {
            const stream = await generateCodeStream(currentPrompt, {
                signal: abortControllerRef.current.signal
            });
            let result = '';
            let finalCode = '';
            let finalLanguage = 'javascript';
            let finalExplanation = '';

            for await (const chunk of stream) {
                if (abortControllerRef.current.signal.aborted) {
                    throw new Error('Request aborted');
                }
                result += chunk;
                setStreamingText(result);
            }

            const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
            const matches = [...result.matchAll(codeBlockRegex)];
            
            if (matches.length > 0) {
                const lastMatch = matches[matches.length - 1];
                finalLanguage = lastMatch[1] || language;
                finalCode = lastMatch[2].trim();
            }

            finalExplanation = result.replace(/```[\s\S]*?```/g, '').trim();

            setConversationHistory(prev => 
                prev.map(msg => 
                    msg.id === userMessage.id 
                        ? {
                            ...msg,
                            code: finalCode,
                            language: finalLanguage,
                            response: finalExplanation,
                            isLoading: false
                            }
                        : msg
                )
            );

            if (user && finalCode) {
                try {
                    await addDoc(collection(db, "users", user.uid, "history"), {
                        prompt: currentPrompt,
                        code: finalCode,
                        language: finalLanguage,
                        response: finalExplanation,
                        createdAt: serverTimestamp()
                    });
                    toast.success('Generated code saved to history');
                } catch (saveError) {
                    console.error("Failed to save to history:", saveError);
                    toast.error("Code generated but failed to save to history");
                }
            }
        } catch (err) {
            if (err.name === 'AbortError' || err.message === 'Request aborted') {
                toast.info('Code generation cancelled');
                setConversationHistory(prev => prev.filter(msg => msg.id !== userMessage.id));
            } else {
                console.error("Code generation error:", err);
                const errorMessage = `Failed to generate code: ${err.message || "Unknown error"}`;
                setError(errorMessage);
                setConversationHistory(prev => 
                    prev.map(msg => 
                        msg.id === userMessage.id 
                            ? { ...msg, error: errorMessage, isLoading: false }
                            : msg
                    )
                );
                toast.error("Code generation failed");
            }
        } finally {
            setLoading(false);
            setIsStreaming(false);
            setStreamingText('');
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleGenerate();
        }
        if (e.key === 'Escape' && isStreaming) {
            e.preventDefault();
            handleCancel();
        }
    };

    const copyCode = useCallback(async (codeText) => {
        if (!codeText.trim()) {
            toast.error('No code to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(codeText);
            toast.success('Code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            const textArea = document.createElement('textarea');
            textArea.value = codeText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success('Code copied to clipboard!');
            } catch (fallbackErr) {
                toast.error('Failed to copy code');
            }
            document.body.removeChild(textArea);
        }
    }, []);

    const downloadCode = useCallback((codeText, lang) => {
        if (!codeText.trim()) {
            toast.error('No code to download');
            return;
        }

        const getFileExtension = (language) => {
            const extensions = {
                javascript: 'js',
                typescript: 'ts',
                python: 'py',
                java: 'java',
                cpp: 'cpp',
                c: 'c',
                csharp: 'cs',
                go: 'go',
                rust: 'rs',
                php: 'php',
                ruby: 'rb',
                swift: 'swift',
                kotlin: 'kt',
                html: 'html',
                css: 'css',
                sql: 'sql',
                bash: 'sh',
                powershell: 'ps1',
            };
            return extensions[language.toLowerCase()] || 'txt';
        };

        const blob = new Blob([codeText], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `generated-code.${getFileExtension(lang)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success('Code downloaded successfully');
    }, []);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const renderConversationMessage = (message) => (
        <div key={message.id} className="mb-8">
            <div className="mb-4">
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-2xl p-4 ml-auto max-w-3xl">
                    <div className="flex items-start space-x-3">
                        <div className="bg-purple-600 rounded-full p-1.5 flex-shrink-0">
                            <Code className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-purple-200 text-sm font-medium mb-1">You asked</p>
                            <p className="text-white leading-relaxed">{message.prompt}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {message.error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 max-w-4xl">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-medium mb-1">Error</p>
                                <p className="text-red-300 text-sm">{message.error}</p>
                            </div>
                        </div>
                    </div>
                ) : message.isLoading ? (
                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 max-w-4xl">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                            <span className="text-sm text-gray-300">AI is generating response...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {message.response && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 max-w-4xl">
                                <div className="flex items-center space-x-2 mb-3">
                                    <CheckCircle className="h-5 w-5 text-blue-400" />
                                    <span className="text-blue-400 font-medium">AI Response</span>
                                </div>
                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.response}
                                </div>
                            </div>
                        )}

                        {message.code && (
                            <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden max-w-4xl">
                                <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700/50">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-300">Generated Code</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                            {message.language.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {message.code.split('\n').length} lines
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => copyCode(message.code)}
                                            className="flex items-center space-x-1 bg-green-600/20 border border-green-500/30 text-green-300 px-3 py-1 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                                        >
                                            <Copy className="h-4 w-4" />
                                            <span>Copy</span>
                                        </button>
                                        <button
                                            onClick={() => downloadCode(message.code, message.language)}
                                            className="flex items-center space-x-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-0">
                                    <pre className="bg-gray-900 text-gray-300 p-6 overflow-x-auto text-sm leading-relaxed">
                                        <code>{message.code}</code>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
            <div className="flex-1 flex flex-col">
                {!hasStartedChat ? (
                    <div className="flex-1 flex items-center justify-center px-4">
                        <div className="text-center max-w-2xl">
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
                                    <Sparkles className="h-10 w-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                                    Welcome to AI Code Generator
                                </h1>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Describe what you want to create, and I'll generate clean, functional code for you. 
                                    From simple functions to complex applications - just tell me what you need!
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-4 pt-8">
                        <div className="max-w-4xl mx-auto">
                            {conversationHistory.map(renderConversationMessage)}
                            {isStreaming && streamingText && (
                                <div className="mb-8">
                                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 max-w-4xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                                <span className="text-sm text-gray-300">AI is generating response...</span>
                                            </div>
                                            <button
                                                onClick={handleCancel}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Press Esc to cancel
                                            </button>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{streamingText}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={conversationEndRef} />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-md">
                <div className="max-w-4xl mx-auto p-4">
                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-4">
                            <div className="relative">
                                <textarea
                                    ref={promptRef}
                                    rows="2"
                                    className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                                    placeholder="Describe what you want to create... (Press Enter to send, Shift+Enter for new line)"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onInput={autoResizeTextarea}
                                    onKeyDown={handleKeyPress}
                                    disabled={isStreaming}
                                />
                                <div className="absolute right-2 bottom-2 flex space-x-2">
                                    {isStreaming && (
                                        <button
                                            onClick={handleCancel}
                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200"
                                            title="Cancel Generation (Esc)"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || !prompt.trim()}
                                        className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                        title="Generate Code (Enter)"
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
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CodeEditor;