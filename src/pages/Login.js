import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Link,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import backgroundImage from "../assets/Back.jpg.jpg";
import { loginUser } from "../api/authApi."; // assumes your login API call
import { keyframes } from "@emotion/react";
import CryptoJS from "crypto-js";
import { LogoContext } from "../context/LogoContext";
import APP_VERSION from "../version";

// 🔐 Encryption
function encryptFun(password, username) {
  const keybefore = username + "appolocomputers";
  const ivbefore = username + "costacloud012014";
  const key = CryptoJS.enc.Latin1.parse(keybefore.substring(0, 16));
  const iv = CryptoJS.enc.Latin1.parse(ivbefore.substring(0, 16));

  const ciphertext = CryptoJS.AES.encrypt(password, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  }).toString();

  return ciphertext;
}

// 🔁 Refresh token function
const refreshAccessToken = async () => {
  try {
    const formData = new FormData();
    formData.append("refreshToken", sessionStorage.getItem("refreshToken"));
    formData.append("userEmail", sessionStorage.getItem("adminEmail"));
    formData.append("appName", "TeamSync");

    const response = await fetch(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/public/refreshToken`,
      {
        method: "POST",
        body: formData,
        headers: {
          username: sessionStorage.getItem("adminEmail"), // ✅ added header
        },
      },
    );

    const data = await response.json();

    if (data.access_token) {
      sessionStorage.setItem("authToken", data.access_token);
      sessionStorage.setItem("refreshToken", data.refresh_token);
      sessionStorage.setItem(
        "tokenExpiry",
        Date.now() + data.expires_in * 1000,
      );
      sessionStorage.setItem(
        "refreshExpiry",
        Date.now() + data.refresh_expires_in * 1000,
      );

      return true;
    } else {
      console.warn("❌ Refresh failed:", data.message);
      clearSessionAndRedirect();
      return false;
    }
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    clearSessionAndRedirect();
    return false;
  }
};

// 🧹 Clears session and reloads app
const clearSessionAndRedirect = () => {
  clearInterval(sessionStorage.getItem("refreshIntervalId"));
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "/login"; // or use navigate if inside component
};

// ⏱ Sets interval to refresh token
const setupAutoRefresh = () => {
  const intervalId = setInterval(
    () => {
      refreshAccessToken();
    },
    25 * 60 * 1000,
  ); // every 25 mins
  sessionStorage.setItem("refreshIntervalId", intervalId);
};

// 🔁 Background animation
const floatAnimation = keyframes`
  0% { background-position-y: 0px; }
  50% { background-position-y: 20px; }
  100% { background-position-y: 0px; }
`;

const Login = () => {
  const { logoData } = useContext(LogoContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const encryptedPassword = encryptFun(formData.password, normalizedEmail);
      const data = await loginUser(normalizedEmail, encryptedPassword);

      const { access_token, refresh_token, expires_in, refresh_expires_in } =
        data;

      sessionStorage.setItem("authToken", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);
      sessionStorage.setItem("adminEmail", normalizedEmail);
      sessionStorage.setItem("tokenExpiry", Date.now() + expires_in * 1000);
      sessionStorage.setItem(
        "refreshExpiry",
        Date.now() + refresh_expires_in * 1000,
      );

      setupAutoRefresh(); // 🟢 Start auto refresh

      setSnackbar({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => {
        const deptAdmin = sessionStorage.getItem("deptAdmin") === "true";
        const superAdmin = sessionStorage.getItem("superAdmin") === "true";

        if (deptAdmin && !superAdmin) {
          navigate("/unit");
        } else {
          navigate("/imir");
        }
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Login failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eef2f7",
        overflow: "hidden",
        p: 2,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        animation: `${floatAnimation} 3s ease-in-out infinite`,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 4,
          overflow: "hidden",
          width: "100%",
          maxWidth: 1000,
          backgroundColor: "rgba(25, 118, 210, 0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.2)",
        }}
      >
        {/* Left Branding */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box maxWidth={400}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <img
                src={logoData.loginImage}
                alt="AngelBot Access Arc Logo"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "120px",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                mt: 3,
                color: "white",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {logoData.slogan}
            </Typography>
          </Box>
        </Box>

        {/* Right Login Form */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ width: "100%", maxWidth: 400 }}
          >
            <Typography variant="h5" align="center" fontWeight={600} mb={3}>
              Login
            </Typography>

            <TextField
              fullWidth
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              FormHelperTextProps={{ sx: { ml: 0 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              FormHelperTextProps={{ sx: { ml: 0 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* <Box sx={{ textAlign: "right", mt: 1 }}>
              <Link
                component={RouterLink}
                to="/forget-password"
                sx={{ fontSize: "0.9rem", color: "#3b82f6", fontWeight: 500 }}
              >
                Forgot Your Password?
              </Link>
            </Box> */}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={Loading}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "#3b82f6",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              {Loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don’t have an account?{" "}
              <Link
                component={RouterLink}
                to="/signup"
                sx={{ fontWeight: 600, color: "#3b82f6" }}
              >
                Signup
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <Typography
        variant="caption"
        sx={{
          position: "fixed",
          bottom: 10,
          right: 14,
          color: "rgba(0,0,0,0.45)",
          fontWeight: 600,
          letterSpacing: 0.5,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        v{APP_VERSION}
      </Typography>
    </Box>
  );
};

export default Login;
