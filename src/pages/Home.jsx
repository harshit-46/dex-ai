import React from 'react';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';

const Home = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col">
            <nav className="flex items-center justify-between bg-[#0f0f0f] border-b border-gray-800 px-6 py-4 shadow-sm">
                <div className="text-white font-bold text-xl">dex.ai</div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-400 hidden sm:block">{user?.email}</p>
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Code Editor UI */}
            <div className="flex-1 overflow-hidden">
                <CodeEditor />
            </div>
        </div>
    );
};

export default Home;
