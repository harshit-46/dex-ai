import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import Sidebar from '../components/Navbar/Sidebar';

const Home = () => {
    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <div className="w-screen h-screen flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    onSelect={(item) => {
                        console.log('Sending prompt:', item);
                        setSelectedItem(item);
                    }}
                />
                <div className="flex-1 overflow-auto">
                    <CodeEditor selectedItem={selectedItem} />
                </div>
            </div>
        </div>
    );
};

export default Home;

