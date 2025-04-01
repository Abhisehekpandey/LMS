// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Department from './pages/Department'
import Role from './pages/Role';
import AngelBot from './pages/AngelBot';
import LDAPConfig from './pages/LDAPConfig';


function App() {
    const [darkMode, setDarkMode] = useState(false);
    // const [departments, setDepartments] = useState([
    //     { name: 'Engineering', displayName: 'ENG', roles: ['Developer', 'Tech Lead', 'Software Architect'] },
    //     { name: 'Marketing', displayName: 'MKT', roles: ['Marketing Manager', 'Content Writer', 'SEO Specialist'] },
    //     { name: 'Sales', displayName: 'SLS', roles: ['Sales Rep', 'Sales Manager', 'Account Executive'] },
    //     { name: 'HR', displayName: 'HRM', roles: ['HR Manager', 'Recruiter', 'HR Assistant'] },
    //     { name: 'Finance', displayName: 'FIN', roles: ['Accountant', 'Financial Analyst', 'Controller'] },
    //     { name: 'IT', displayName: 'ITS', roles: ['System Admin', 'Support Engineer', 'Network Engineer'] },
    //     { name: 'Operations', displayName: 'OPS', roles: ['Operations Manager', 'Project Manager', 'Business Analyst'] }
    // ]);
    const [departments, setDepartments] = useState([
        { name: 'Engineering', displayName: 'ENG', roles: ['Developer', 'Tech Lead', 'Software Architect'], storage: '100GB' },
        { name: 'Marketing', displayName: 'MKT', roles: ['Marketing Manager', 'Content Writer', 'SEO Specialist'], storage: '50GB' },
        { name: 'Sales', displayName: 'SLS', roles: ['Sales Rep', 'Sales Manager', 'Account Executive'], storage: '50GB' },
        { name: 'HR', displayName: 'HRM', roles: ['HR Manager', 'Recruiter', 'HR Assistant'], storage: '30GB' },
        { name: 'Finance', displayName: 'FIN', roles: ['Accountant', 'Financial Analyst', 'Controller'], storage: '40GB' },
        { name: 'IT', displayName: 'ITS', roles: ['System Admin', 'Support Engineer', 'Network Engineer'], storage: '200GB' },
        { name: 'Operations', displayName: 'OPS', roles: ['Operations Manager', 'Project Manager', 'Business Analyst'], storage: '75GB' }
    ]);
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light', // Set theme mode based on darkMode state
        },
    });

    const toggleTheme = () => {
      console.log(">>>>abhi>>>>")
        setDarkMode((prevMode) => !prevMode); // Toggle the darkMode state
    };

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route 
                        path="/user" 
                        element={
                            <ProtectedRoute>
                                <Dashboard onThemeToggle={toggleTheme} departments={departments} setDepartments={setDepartments} /> {/* Pass the toggleTheme function */}
                            </ProtectedRoute>
                        } 
                    />
                     <Route 
                        path="/department" 
                        element={
                            <ProtectedRoute>
                                <Department onThemeToggle={toggleTheme} departments={departments} setDepartments={setDepartments} /> {/* Pass the toggleTheme function */}
                            </ProtectedRoute>
                        } 
                    />
                     <Route 
                        path="/role" 
                        element={
                            <ProtectedRoute>
                                <Role onThemeToggle={toggleTheme} departments={departments} /> {/* Pass the toggleTheme function */}
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/" element={<Navigate to="/signup" />} />
                    <Route path="/angelbot" element={<AngelBot onThemeToggle={toggleTheme} />} />
                    <Route path="/ldap-config" element={<LDAPConfig />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;