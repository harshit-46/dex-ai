import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ClipboardCopy, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const HistoryPanel = ({ onSelect }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
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
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Copied to clipboard!');
    };

    return (
        <aside className="w-full md:w-1/4 bg-[#0f111a] text-white border-r border-gray-800 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">📜 History</h2>

            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : history.length === 0 ? (
                <p className="text-gray-500 text-sm">No history found.</p>
            ) : (
                <ul className="space-y-4">
                    {history.map((item) => (
                        <li
                            key={item.id}
                            className="bg-[#181a27] p-3 rounded-md border border-gray-700 hover:bg-[#20222f] transition"
                        >
                            <p className="text-sm text-gray-300 truncate">{item.prompt}</p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => onSelect(item)}
                                    className="text-xs text-purple-400 flex items-center gap-1 hover:underline"
                                >
                                    <Eye size={14} /> View
                                </button>
                                <button
                                    onClick={() => handleCopy(item.code)}
                                    className="text-xs text-green-400 flex items-center gap-1 hover:underline"
                                >
                                    <ClipboardCopy size={14} /> Copy
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default HistoryPanel;
