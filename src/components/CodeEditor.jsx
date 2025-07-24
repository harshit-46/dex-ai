import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateCodeStream } from '../utils/mistral';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
    Download, 
    Copy, 
    Brain, 
    Sparkles, 
    Code2, 
    FileText,
    Loader2,
    AlertCircle,
    CheckCircle,
    Settings,
    Maximize2,
    Minimize2,
    RefreshCw,
    Save
} from 'lucide-react';

const templates = [
    {
        text: "Write a function to check if a number is prime",
        category: "Algorithm",
        icon: "🔢"
    },
    {
        text: "Fix this bug in the code",
        category: "Debug",
        icon: "🐛"
    },
    {
        text: "Convert this JavaScript code to Python",
        category: "Convert",
        icon: "🔄"
    },
    {
        text: "Create a REST API endpoint",
        category: "Backend",
        icon: "🌐"
    },
    {
        text: "Write unit tests for this function",
        category: "Testing",
        icon: "🧪"
    },
    {
        text: "Optimize this code for performance",
        category: "Optimize",
        icon: "⚡"
    }
];

const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'php', label: 'PHP', icon: '🐘' }
];

const detectLanguage = (text) => {
    const match = text.match(/```(\w+)/);
    return match ? match[1] : 'javascript';
};

const CodeEditor = ({ selectedItem }) => {
    // Core state
    const [prompt, setPrompt] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    
    // UI state
    const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [wordWrap, setWordWrap] = useState(true);
    const [showMinimap, setShowMinimap] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const { user } = useAuth();
    const editorRef = useRef(null);
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

    // Auto-resize textarea
    const autoResizeTextarea = useCallback(() => {
        if (promptRef.current) {
            promptRef.current.style.height = 'auto';
            promptRef.current.style.height = promptRef.current.scrollHeight + 'px';
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
            let currentLanguage = 'javascript';

            for await (const chunk of stream) {
                result += chunk;
                setStreamingText(result);
                
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

            // Save to Firebase if user is authenticated and code was generated
            if (user && code) {
                try {
                    await addDoc(collection(db, "users", user.uid, "history"), {
                        prompt,
                        code,
                        language: currentLanguage,
                        createdAt: serverTimestamp()
                    });
                    toast.success('Code saved to history');
                } catch (saveError) {
                    console.error('Error saving to history:', saveError);
                    toast.error('Failed to save to history');
                }
            }

            // Smooth scroll to bottom
            setTimeout(() => {
                window.scrollTo({ 
                    top: document.body.scrollHeight, 
                    behavior: 'smooth' 
                });
            }, 100);

        } catch (err) {
            console.error("Code generation error:", err);
            setError(`Failed to generate code: ${err.message || "Unknown error"}`);
            toast.error("Code generation failed");
        } finally {
            setLoading(false);
            setIsStreaming(false);
        }
    };

    const handleExplainCode = useCallback(() => {
        if (!code.trim()) {
            toast.error('No code to explain');
            return;
        }
        setPrompt(`Explain this ${language} code:\n\n${code}`);
        setTimeout(() => handleGenerate(), 100);
    }, [code, language]);

    const handleTemplateClick = useCallback((template) => {
        setPrompt(template.text);
        setSelectedTemplate(template.text);
        if (promptRef.current) {
            promptRef.current.focus();
        }
    }, []);

    const downloadCode = useCallback(() => {
        if (!code.trim()) {
            toast.error('No code to download');
            return;
        }
        
        const blob = new Blob([code], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `dex-ai-code.${language === 'cpp' ? 'cpp' : language}`;
        link.click();
        toast.success('Code downloaded successfully');
    }, [code, language]);

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

    const saveCode = useCallback(async () => {
        if (!user) {
            toast.error('Please sign in to save code');
            return;
        }

        if (!code.trim()) {
            toast.error('No code to save');
            return;
        }

        try {
            await addDoc(collection(db, "users", user.uid, "savedCodes"), {
                prompt,
                code,
                language,
                createdAt: serverTimestamp()
            });
            toast.success('Code saved successfully!');
        } catch (err) {
            console.error('Error saving code:', err);
            toast.error('Failed to save code');
        }
    }, [user, code, prompt, language]);

    const clearAll = useCallback(() => {
        setPrompt('');
        setCode('');
        setResponseText('');
        setError('');
        setStreamingText('');
        setSelectedTemplate('');
        if (promptRef.current) {
            promptRef.current.focus();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Dex.ai Code Generator
                            </h1>
                            <p className="text-sm text-gray-400">AI-powered code generation and optimization</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                            title="Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </button>
                        <button
                            onClick={clearAll}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                            title="Clear All"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center py-8 px-4">
                <div className="w-full max-w-6xl space-y-6">
                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>Editor Settings</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                                    <select
                                        value={editorTheme}
                                        onChange={(e) => setEditorTheme(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="vs-dark">Dark</option>
                                        <option value="light">Light</option>
                                        <option value="hc-black">High Contrast</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                                    <input
                                        type="range"
                                        min="12"
                                        max="24"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <span className="text-sm text-gray-400">{fontSize}px</span>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={wordWrap}
                                            onChange={(e) => setWordWrap(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-300">Word Wrap</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={showMinimap}
                                            onChange={(e) => setShowMinimap(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-300">Show Minimap</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Editor Card */}
                    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
                        {/* Templates Section */}
                        <div className="p-6 border-b border-gray-700/50">
                            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                <Code2 className="h-5 w-5 text-purple-400" />
                                <span>Quick Templates</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {templates.map((template, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTemplateClick(template)}
                                        className={`flex items-center space-x-3 p-3 border border-gray-600/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200 text-left ${
                                            selectedTemplate === template.text 
                                                ? 'bg-purple-600/20 border-purple-500/50' 
                                                : ''
                                        }`}
                                    >
                                        <span className="text-2xl">{template.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium text-white">{template.text}</p>
                                            <p className="text-xs text-gray-400">{template.category}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt Input Section */}
                        <div className="p-6 border-b border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-lg font-semibold flex items-center space-x-2">
                                    <Brain className="h-5 w-5 text-blue-400" />
                                    <span>Describe what you want to create</span>
                                </label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-400">Language:</span>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.icon} {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <textarea
                                ref={promptRef}
                                rows="3"
                                className="w-full bg-gray-700/50 text-white border border-gray-600/50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                                placeholder="Example: Create a React component that displays a todo list with add, edit, and delete functionality..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onInput={autoResizeTextarea}
                            />
                        </div>

                        {/* Generate Button */}
                        <div className="p-6 border-b border-gray-700/50">
                            <div className="flex justify-center">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !prompt.trim()}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5" />
                                            <span>Generate Code</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Streaming Response */}
                        {isStreaming && streamingText && (
                            <div className="p-6 border-b border-gray-700/50">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                    <span className="text-sm text-gray-300">AI is generating response...</span>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{streamingText}</pre>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="p-6 border-b border-gray-700/50">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium">Error</p>
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Response Text */}
                        {responseText && !isStreaming && (
                            <div className="p-6 border-b border-gray-700/50">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <CheckCircle className="h-5 w-5 text-blue-400" />
                                        <span className="text-blue-400 font-medium">AI Explanation</span>
                                    </div>
                                    <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{responseText}</pre>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {code && (
                            <div className="p-6 border-b border-gray-700/50">
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={handleExplainCode}
                                        className="flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-colors"
                                    >
                                        <Brain className="h-4 w-4" />
                                        <span>Explain Code</span>
                                    </button>
                                    <button
                                        onClick={copyCode}
                                        className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg hover:bg-green-600/30 transition-colors"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span>Copy</span>
                                    </button>
                                    <button
                                        onClick={downloadCode}
                                        className="flex items-center space-x-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download</span>
                                    </button>
                                    {user && (
                                        <button
                                            onClick={saveCode}
                                            className="flex items-center space-x-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-600/30 transition-colors"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>Save</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Monaco Editor */}
                        {code && (
                            <div className={`relative ${isEditorFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
                                <div className="flex items-center justify-between p-4 bg-gray-900/50">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-300">Generated Code</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                                            {language.toUpperCase()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                                        className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                                    >
                                        {isEditorFullscreen ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <Editor
                                    height={isEditorFullscreen ? "calc(100vh - 80px)" : "500px"}
                                    language={language}
                                    theme={editorTheme}
                                    value={code}
                                    onMount={(editor) => (editorRef.current = editor)}
                                    options={{
                                        readOnly: false,
                                        fontSize,
                                        minimap: { enabled: showMinimap },
                                        wordWrap: wordWrap ? 'on' : 'off',
                                        padding: { top: 20, bottom: 20 },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        renderWhitespace: 'selection',
                                        smoothScrolling: true,
                                        cursorBlinking: 'smooth',
                                        bracketPairColorization: { enabled: true }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;