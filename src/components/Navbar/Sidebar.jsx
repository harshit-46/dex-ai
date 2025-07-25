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
