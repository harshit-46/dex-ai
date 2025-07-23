import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../../utils/firebase';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Eye, ClipboardCopy } from 'lucide-react';

const HistoryList = ({ isOpen, onSelect }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error('Copy failed:', err);
            toast.error("Copy failed!");
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <p className="text-xs text-gray-400 mb-2">Recents</p>
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                </div>
            ) : history.length === 0 ? (
                <p className="text-gray-500 text-sm">No history found.</p>
            ) : (
                <ul className="space-y-3">
                    {history.map(item => (
                        <li
                            key={item.id}
                            className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200"
                        >
                            <p className="text-sm text-slate-300 truncate" title={item.prompt}>{item.prompt}</p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => onSelect?.(item)}
                                    className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300"
                                >
                                    <Eye size={14} /> View
                                </button>
                                <button
                                    onClick={() => handleCopy(item.code)}
                                    className="text-xs text-green-400 flex items-center gap-1 hover:text-green-300"
                                >
                                    <ClipboardCopy size={14} /> Copy
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryList;
