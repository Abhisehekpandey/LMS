import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(sessionStorage.getItem('user'));

    // Check if user is authenticated
    if (!user) {
        return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    return children; // Render children if authenticated
};

export default ProtectedRoute;
