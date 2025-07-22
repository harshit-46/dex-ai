import { Plus, User, FolderOpen, PanelLeft } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-4 left-4 z-50 text-white p-2 rounded"
            >
                <PanelLeft size={14} />
            </button>
            <div
                className={`h-screen bg-[#1E1E1E] text-white transition-all duration-300 ease-in-out border-r border-gray-700 flex flex-col justify-between ${isOpen ? "w-64 px-4 py-6" : "w-16 px-2 py-6"
                    }`}
            >
                <div>
                    <div className={`text-xl font-semibold mb-6 ${isOpen ? "block" : "hidden"}`}>Claude</div>
                    {isOpen ? (
                        <button className="flex items-center gap-2 text-sm font-medium text-orange-400 mb-6">
                            <Plus size={16} />
                            New chat
                        </button>
                    ) : (
                        <button className="text-orange-400 mb-6">
                            <Plus size={16} />
                        </button>
                    )}
                    <div className="flex flex-col gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                            <User size={16} />
                            {isOpen && <span>Chats</span>}
                        </div>
                        <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                            <FolderOpen size={16} />
                            {isOpen && <span>Artifacts</span>}
                        </div>
                    </div>
                    {isOpen && (
                        <div className="mt-8">
                            <p className="text-xs text-gray-500 mb-2">Recents</p>
                            <ul className="text-sm space-y-2 text-gray-300">
                                {[
                                    "Greeting",
                                    "Panda Image Request",
                                    "Hugging Face Code Generation M...",
                                    "AI Code Editor Project Design",
                                ].map((item, i) => (
                                    <li key={i} className="truncate hover:text-white cursor-pointer">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-gray-700 pt-4">
                    <div className="bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        HG
                    </div>
                    {isOpen && (
                        <div className="flex flex-col">
                            <span>Harshit Gupta</span>
                            <span className="text-xs text-gray-500">Free plan</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
