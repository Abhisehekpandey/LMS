import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  DialogContent as MuiDialogContent,
} from "@mui/material";
import Login, { clearSessionAndRedirect } from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
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
import FeedbackDashboard from "./pages/FeedBackDashboard";
import FeedbackTable from "./pages/FeedbackTable";
import Configuration from "./pages/Configuration";
import { LogoProvider } from "./context/LogoContext";

function App() {
  const [dictionarySearchResults, setDictionarySearchResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [sessionModal, setSessionModal] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    const handleSessionExpired = (e) => {
      // 🚫 Prevent session expired modal on public auth pages
      const publicRoutes = [
        "/login",
        "/signup",
        "/forget-password",
        "/set-password",
        "/reset-password",
      ];
      const isPublicRoute = publicRoutes.some((route) =>
        window.location.pathname.startsWith(route),
      );

      if (isPublicRoute) return;

      setSessionModal({
        open: true,
        message:
          e.detail?.message ||
          "Your session has expired. Please login again to continue.",
      });
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const handleLogout = () => {
    setSessionModal({ open: false, message: "" });
    clearSessionAndRedirect();
  };

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
      <LogoProvider>
        <Router>
          <Routes>
            {/* Public routes — wrapped in PublicRoute to redirect logged-in users away */}
            {/* OLD: no guard — logged-in users could visit /login and then freely navigate to protected routes */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/signup" element={<Signup />} /> */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route path="/set-password" element={<ResetPassword />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route
              path="/reset-password/:token"
              element={<ResetAdminPassword />}
            />

            {/* Protected routes — wrapped in Layout and ProtectedRoute */}
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
              path="/unit"
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
              path="/imir"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <AngelBot onThemeToggle={toggleTheme} />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/company-dashboard"
              element={
                <Layout>
                  <ProtectedRoute>
                    <CompanyDashboard onThemeToggle={toggleTheme} />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/ldap-config"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <LDAPConfig />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/choose-extension"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <ChooseExtension />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/department-type-setting"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <DepartmentTypeSetting />
                  </ProtectedRoute>
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
                  <ProtectedRoute>
                    <DataDictionary searchResults={dictionarySearchResults} />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/feed-context"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <FeedbackDashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/feedback-table"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <FeedbackTable />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/theme-setting"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <ThemeSetting />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/configuration"
              element={
                <Layout onThemeToggle={toggleTheme}>
                  <ProtectedRoute>
                    <Configuration />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/activate/:token"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ActivateAccount />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* Redirect root to signup */}
            <Route path="/" element={<Navigate to="/signup" />} />
          </Routes>
        </Router>

        {/* Global Session Expiry Modal */}
        <Dialog
          open={sessionModal.open}
          onClose={(e, reason) => {
            if (reason !== "backdropClick") {
              setSessionModal({ open: false, message: "" });
            }
          }}
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "error.main", pb: 1 }}>
            Session Expired
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "text.primary", fontSize: "1rem" }}>
              {sessionModal.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={handleLogout}
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                py: 1,
              }}
            >
              Login Again
            </Button>
          </DialogActions>
        </Dialog>
      </LogoProvider>
    </ThemeProvider>
  );
}

export default App;
