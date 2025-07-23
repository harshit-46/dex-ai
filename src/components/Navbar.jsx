import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Plus, PanelLeft, ArrowLeftToLine, ArrowRightToLine , ClipboardCopy, Eye} from "lucide-react";
import toast from 'react-hot-toast';

const Navbar = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
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
        <div className="h-screen flex border border-blue-600">
            <div
                className={`bg-red-500 text-white transition-all duration-300 ease-in-out border-r border-gray-700 flex flex-col ${isOpen ? "w-60" : "w-16"
                    }`}
            >
                {/* Header and Toggle */}
                <div className="px-2 py-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="text-white p-2 rounded cursor-pointer mb-4 transition"
                    >
                        {isHovered
                            ? isOpen
                                ? <ArrowLeftToLine size={20} />
                                : <ArrowRightToLine size={20} />
                            : <PanelLeft size={20} />}
                    </button>

                    {isOpen && (
                        <div className="text-xl font-semibold mb-4">Dex</div>
                    )}

                    {isOpen ? (
                        <button className="flex items-center gap-2 text-sm font-medium text-orange-400 mb-4">
                            <Plus size={20} />
                            New chat
                        </button>
                    ) : (
                        <button className="text-orange-400 p-2 mb-4">
                            <Plus size={20} />
                        </button>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {isOpen && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-300 mb-2">Recents</p>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
