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
              <Layout>
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
              <Layout>
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
              <Layout>
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
              <Layout>
                <LDAPConfig />
              </Layout>
            }
          />
          <Route
            path="/choose-extension"
            element={
              <Layout>
                <ChooseExtension />
              </Layout>
            }
          />
          <Route
            path="/department-type-setting"
            element={
              <Layout>
                <DepartmentTypeSetting />
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

