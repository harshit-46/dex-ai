import React, { useState } from 'react';
import { Plus, PanelLeft, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';

const SidebarHeader = ({ isOpen, setIsOpen, onNewChat }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
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
                onClick={() => onNewChat?.()}
                className={`mt-4 w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium ${!isOpen && 'justify-center'}`}
            >
                <Plus size={18} />
                {isOpen && 'New Chat'}
            </button>
        </div>
    );
};

export default SidebarHeader;
