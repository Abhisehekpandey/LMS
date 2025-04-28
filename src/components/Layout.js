// components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div >
            <Sidebar />
            <div >
                <Navbar />
                <main >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
