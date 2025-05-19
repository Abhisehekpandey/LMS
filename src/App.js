import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Department from './pages/Department';
import Role from './pages/Role';
import AngelBot from './pages/AngelBot';
import LDAPConfig from './pages/LDAPConfig';
import CompanyDashboard from './pages/CompanyDashboard';
import ActivateAccount from './components/ActivateAccount';
import Layout from './components/Layout';
import './App.css';
import Loading from './components/Loading';

// 👇 Ye inner component Router ke andar hona chahiye
const AppRoutesWithLoader = ({ toggleTheme }) => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([
        { name: 'Engineering', displayName: 'ENG', departmentModerator: "Abhishek", roles: ['Developer', 'Tech Lead', 'Software Architect'], storage: '100GB' },
        { name: 'Marketing', displayName: 'MKT', departmentModerator: "Kunal", roles: ['Marketing Manager', 'Content Writer', 'SEO Specialist'], storage: '50GB' },
        { name: 'Sales', displayName: 'SLS', departmentModerator: "Pratibha", roles: ['Sales Rep', 'Sales Manager', 'Account Executive'], storage: '50GB' },
        { name: 'Human Resource', displayName: 'HR', departmentModerator: "Satyam", roles: ['HR Manager', 'Recruiter', 'HR Assistant'], storage: '50GB' },
        { name: 'Finance', displayName: 'FIN', departmentModerator: "Ankit", roles: ['Accountant', 'Financial Analyst', 'Controller'], storage: '100GB' },
        { name: 'Information Technology', displayName: 'ITS', departmentModerator: "Keshav", roles: ['System Admin', 'Support Engineer', 'Network Engineer'], storage: '200GB' },
        { name: 'Operations', displayName: 'OPS', departmentModerator: "Shivam", roles: ['Operations Manager', 'Project Manager', 'Business Analyst'], storage: '75GB' }
    ]);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 800); // Adjust delay if needed
        return () => clearTimeout(timeout);
    }, [location.pathname]);

    if (loading) return <Loading />;

    return (
        <Layout>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/user" element={
                    <ProtectedRoute>
                        <Dashboard onThemeToggle={toggleTheme} departments={departments} setDepartments={setDepartments} />
                    </ProtectedRoute>
                } />
                <Route path="/department" element={
                    <ProtectedRoute>
                        <Department onThemeToggle={toggleTheme} departments={departments} setDepartments={setDepartments} />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/signup" />} />
                <Route path="/angelbot" element={<AngelBot onThemeToggle={toggleTheme} />} />
                <Route path="/ldap-config" element={<LDAPConfig />} />
                <Route path="/company-dashboard" element={<CompanyDashboard onThemeToggle={toggleTheme} />} />
                <Route path="/activate/:token" element={<ActivateAccount />} />
            </Routes>
        </Layout>
    );
};

export default function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [departments, setDepartments] = useState([
        // your dummy department data
    ]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const toggleTheme = () => setDarkMode(prev => !prev);

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <AppRoutesWithLoader
                    toggleTheme={toggleTheme}
                    departments={departments}
                    setDepartments={setDepartments}
                />
            </Router>
        </ThemeProvider>
    );
}
