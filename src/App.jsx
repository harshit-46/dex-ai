// src/App.jsx
import React from 'react';
import CodeEditor from './components/CodeEditor';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="text-center py-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold">⚡ dex.ai</h1>
        <p className="text-sm text-gray-400">Your AI-Powered Code Editor</p>
      </header>

      <main className="p-4">
        <CodeEditor />
      </main>

      <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-700">
        © {new Date().getFullYear()} dex.ai — Powered by OpenAI
      </footer>
    </div>
  );
};

export default App;
