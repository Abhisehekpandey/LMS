import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Department from "./pages/Department";
import Role from "./pages/Role";
import AngelBot from "./pages/AngelBot";
import LDAPConfig from "./pages/LDAPConfig";
import CompanyDashboard from "./pages/CompanyDashboard";
import ActivateAccount from "./components/ActivateAccount";
import Layout from "./components/Layout";
import "./App.css";
import UserTable from "./pages/user/UserTable";
import ResetPassword from "./pages/ResetPassword";
import ForgetPassword from "./pages/ForgetPassword";
import ResetAdminPassword from "./pages/ResetAdminPassword";
import ChooseExtension from "./pages/ChooseExtension";
import DepartmentTypeSetting from "./pages/DepartmentTypeSetting";
import DataDictionary from "./pages/DataDictionary";
import FeedContext from "./pages/FeedContext";
import ThemeSetting from "./pages/ThemeSetting";

function App() {
  const [dictionarySearchResults, setDictionarySearchResults] = useState([]);

  const [darkMode, setDarkMode] = useState(false);

  const [departments, setDepartments] = useState([]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public routes — without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/set-password" element={<ResetPassword />} />
          <Route path="/forget-password" element={<ForgetPassword />} />

          <Route
            path="/reset-password/:token"
            element={<ResetAdminPassword />}
          />

          {/* Protected routes — with Layout */}
          <Route
            path="/user"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <ProtectedRoute>
                  <Dashboard
                    onThemeToggle={toggleTheme}
                    departments={departments}
                    setDepartments={setDepartments}
                  />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/department"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <ProtectedRoute>
                  <Department
                    onThemeToggle={toggleTheme}
                    departments={departments}
                    setDepartments={setDepartments}
                  />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path="/angelbot"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <AngelBot onThemeToggle={toggleTheme} />
              </Layout>
            }
          />
          <Route
            path="/company-dashboard"
            element={
              <Layout>
                <CompanyDashboard onThemeToggle={toggleTheme} />
              </Layout>
            }
          />
          <Route
            path="/ldap-config"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <LDAPConfig />
              </Layout>
            }
          />
          <Route
            path="/choose-extension"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <ChooseExtension />
              </Layout>
            }
          />
          <Route
            path="/department-type-setting"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <DepartmentTypeSetting />
              </Layout>
            }
          />

          <Route
            path="/data-dictionary"
            element={
              <Layout
                onThemeToggle={toggleTheme}
                onSearch={setDictionarySearchResults}
              >
                <DataDictionary searchResults={dictionarySearchResults} />
              </Layout>
            }
          />

          <Route
            path="/feed-context"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <FeedContext />
              </Layout>
            }
          />

          <Route
            path="/theme-setting"
            element={
              <Layout onThemeToggle={toggleTheme}>
                <ThemeSetting />
              </Layout>
            }
          />

          <Route
            path="/activate/:token"
            element={
              <Layout>
                <ActivateAccount />
              </Layout>
            }
          />

          {/* Redirect root to signup */}
          <Route path="/" element={<Navigate to="/signup" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
