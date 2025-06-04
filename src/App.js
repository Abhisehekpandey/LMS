// src/App.js
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

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [departments, setDepartments] = useState([
    {
      name: "Engineering",
      displayName: "ENG",
      departmentModerator: "Abhishek",
      roles: ["Developer", "Tech Lead", "Software Architect"],
      storage: "100GB",
    },
    {
      name: "Marketing",
      displayName: "MKT",
      departmentModerator: "Kunal",
      roles: ["Marketing Manager", "Content Writer", "SEO Specialist"],
      storage: "50GB",
    },
    {
      name: "Sales",
      displayName: "SLS",
      departmentModerator: "Pratibha",
      roles: ["Sales Rep", "Sales Manager", "Account Executive"],
      storage: "50GB",
    },
    {
      name: "Human Resource",
      displayName: "HR",
      departmentModerator: "Satyam",
      roles: ["HR Manager", "Recruiter", "HR Assistant"],
      storage: "50GB",
    },
    {
      name: "Finance",
      displayName: "FIN",
      departmentModerator: "Ankit",
      roles: ["Accountant", "Financial Analyst", "Controller"],
      storage: "100GB",
    },
    {
      name: "Information Technology",
      displayName: "ITS",
      departmentModerator: "Keshav",
      roles: ["System Admin", "Support Engineer", "Network Engineer"],
      storage: "200GB",
    },
    {
      name: "Operations",
      displayName: "OPS",
      departmentModerator: "Shivam",
      roles: ["Operations Manager", "Project Manager", "Business Analyst"],
      storage: "75GB",
    },
  ]);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light", // Set theme mode based on darkMode state
    },
  });

  const toggleTheme = () => {
    console.log(">>>>abhi>>>>");
    setDarkMode((prevMode) => !prevMode); // Toggle the darkMode state
  };

  return (
    // <ThemeProvider theme={theme}>
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <Dashboard
                  onThemeToggle={toggleTheme}
                  departments={departments}
                  setDepartments={setDepartments}
                />{" "}
                {/* Pass the toggleTheme function */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/department"
            element={
              <ProtectedRoute>
                <Department
                  onThemeToggle={toggleTheme}
                  departments={departments}
                  setDepartments={setDepartments}
                />{" "}
                {/* Pass the toggleTheme function */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute>
                <ResetPassword />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/signup" />} />
          <Route
            path="/angelbot"
            element={<AngelBot onThemeToggle={toggleTheme} />}
          />
          <Route path="/ldap-config" element={<LDAPConfig />} />
          <Route
            path="/company-dashboard"
            element={<CompanyDashboard onThemeToggle={toggleTheme} />}
          />
          <Route path="/activate/:token" element={<ActivateAccount />} />
        </Routes>
      </Layout>
    </Router>
    // </ThemeProvider>
  );
}

export default App;
