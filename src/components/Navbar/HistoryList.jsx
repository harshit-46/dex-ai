import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebase';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

const HistoryList = ({ isOpen }) => {
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

    if (!isOpen) return null;

    return (
        <div>
            {history.length > 0 ? (
                <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    <p className="text-xs text-gray-400 mb-2">Recents</p>
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {history.map(item => (
                                <li
                                    key={item.id}
                                    className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200"
                                >
                                    <p className="text-sm text-slate-300 truncate cursor-pointer" title={item.prompt}>{item.prompt}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default HistoryList;
