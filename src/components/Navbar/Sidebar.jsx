/*

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
    Plus,
    PanelLeft,
    ArrowLeftToLine,
    ArrowRightToLine,
    ClipboardCopy,
    Eye,
    User,
    LogOut,
    ChevronDown,
    CircleUserRound
} from 'lucide-react';

const Navbar = ({ onSelect, onNewChat }) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            
            setLoading(true); 
            try {
                const q = query(
                    collection(db, 'users', user.uid, 'history'),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHistory(results);
            } catch (err) {
                console.error('Failed to fetch history:', err);
                toast.error("Error loading history!");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const handleCopy = useCallback(async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            toast.error("Copy failed!");
        }
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            console.log('Logging out...');
            await logout();
            setDropdownOpen(false);
        } catch (err) {
            console.error('Logout error:', err);
        }
    }, [logout]);

    return (
        <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div
                className={`transition-all duration-300 ease-in-out flex flex-col bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 relative ${
                    isOpen ? 'w-72' : 'w-16'
                }`}
            >
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group"
                        >
                            {isHovered
                                ? isOpen
                                    ? <ArrowLeftToLine size={20} className="text-slate-300 group-hover:text-white" />
                                    : <ArrowRightToLine size={20} className="text-slate-300 group-hover:text-white" />
                                : <PanelLeft size={20} className="text-slate-300 group-hover:text-white" />}
                        </button>
                        {isOpen && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Dex
                                </h1>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onNewChat}
                        className={`mt-4 w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium ${
                            !isOpen && 'justify-center'
                        }`}
                    >
                        <Plus size={18} />
                        {isOpen && 'New Chat'}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {isOpen && (
                        <>
                            <p className="text-xs text-gray-400 mb-2">Recents</p>
                            {loading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <p className="text-gray-500 text-sm">No history found.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {history.map((item) => (
                                        <li
                                            key={item.id}
                                            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200"
                                        >
                                            <p className="text-sm text-slate-300 truncate">{item.prompt}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => onSelect(item)}
                                                    className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300 transition-colors duration-200"
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(item.code)}
                                                    className="text-xs text-green-400 flex items-center gap-1 hover:text-green-300 transition-colors duration-200"
                                                >
                                                    <ClipboardCopy size={14} /> Copy
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
                <div className="p-4 border-t border-slate-700/50 relative profile-dropdown">
                    {isOpen ? (
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group"
                        >
                            <div className="w-8 h-8 rounded-full border-2 border-slate-600 group-hover:border-slate-500 transition-colors duration-200 overflow-hidden flex items-center justify-center bg-slate-700">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user?.displayName || 'User'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null}
                                <CircleUserRound 
                                    size={20} 
                                    className={`text-slate-400 ${user?.photoURL ? 'hidden' : 'block'}`}
                                />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-slate-200">{user?.displayName || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform duration-200 ${
                                    dropdownOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="p-1 rounded-full hover:bg-slate-700/50 transition-all duration-200"
                            >
                                <div className="w-8 h-8 rounded-full border-2 border-slate-600 hover:border-slate-500 overflow-hidden flex items-center justify-center bg-slate-700">
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user?.displayName || 'User'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <CircleUserRound 
                                        size={20} 
                                        className={`text-slate-400 ${user?.photoURL ? 'hidden' : 'block'}`}
                                    />
                                </div>
                            </button>
                        </div>
                    )}
                    {dropdownOpen && (
                        <div className={`absolute z-50 ${
                            isOpen 
                                ? 'bottom-full left-0 right-0 mb-2' 
                                : 'bottom-full right-0 w-48 mb-2'
                        } bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden`}>
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        console.log('Account settings clicked');
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-700/50 flex items-center gap-3 transition-colors duration-200"
                                >
                                    <User size={16} className="text-slate-400" />
                                    <span className="text-slate-200">Account Settings</span>
                                </button>
                                <hr className="border-slate-700" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors duration-200">
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;

*/

import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import HistoryList from './HistoryList';
import SidebarFooter from './SidebarFooter';

const Sidebar = ({ onSelect, onNewChat }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className={`transition-all duration-300 ease-in-out flex flex-col bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 relative ${isOpen ? 'w-72' : 'w-16'}`}>
                <SidebarHeader isOpen={isOpen} setIsOpen={setIsOpen} onNewChat={onNewChat} />
                <HistoryList isOpen={isOpen} onSelect={onSelect} />
                <SidebarFooter isOpen={isOpen} />
            </div>
        </div>
    );
};

export default React.memo(Sidebar);
