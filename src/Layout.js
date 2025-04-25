// src/components/MainLayout.js
import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const Layout = ({ children, onThemeToggle }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, ml: '240px' }}>
                <Navbar onThemeToggle={onThemeToggle} />
                <Box p={3}>{children}</Box>
            </Box>
        </Box>
    );
};

export default Layout;
