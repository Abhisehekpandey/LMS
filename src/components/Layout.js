// components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;

    // Check if current path is login or signup
    const isAuthPage = path === '/login' || path === '/signup' || path === '/';

    // If on auth pages, render only the children without Sidebar and Navbar
    if (isAuthPage) {
        return (
            <main style={{ width: '100%', height: '100vh' }}>
                {children}
            </main>
        );
    }

    // For all other pages, render the complete layout with Sidebar and Navbar
    return (
        <div>
            <Sidebar />
            <div >
                <Navbar />
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;