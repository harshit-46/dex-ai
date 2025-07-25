/*

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


*/


import React, { useRef, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import Sidebar from '../components/Navbar/Sidebar';

const Home = () => {
    const editorRef = useRef(); // create a ref
    const [selectedItem, setSelectedItem] = useState(null);

    const handleNewChat = () => {
        setSelectedItem(null); // clear selection
        editorRef.current?.clearEditor(); // call the exposed method on CodeEditor
    };

    return (
        <div className="w-screen h-screen flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    onSelect={(item) => {
                        console.log('Sending prompt:', item);
                        setSelectedItem(item);
                    }}
                    onNewChat={handleNewChat} // pass to sidebar
                />
                <div className="flex-1 overflow-auto">
                    <CodeEditor ref={editorRef} selectedItem={selectedItem} />
                </div>
            </div>
        </div>
    );
};

export default Home;
