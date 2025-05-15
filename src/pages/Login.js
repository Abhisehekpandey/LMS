import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/Back.jpg.jpg";
import { loginUser } from "../api/authApi.";

import { keyframes } from "@emotion/react";

const floatAnimation = keyframes`
  0% { background-position-y: 0px; }
  50% { background-position-y: 20px; }
  100% { background-position-y: 0px; }
`;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [Loading,setLoading]=useState(false)

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
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

    setLoading(true); // Set loading state before API call

    try {
      // Call the loginUser function from authApi.js
      const data = await loginUser(formData.email, formData.password);
      console.log(">>final",data)

      // Assuming the response contains a JWT token
      const { access_token } = data;
    

      // Save token in sessionStorage or localStorage
      sessionStorage.setItem("authToken", access_token);

      // Redirect to dashboard or home page after successful login
      navigate("/angelbot");
    } catch (error) {
      console.error("Login failed:", error.message);
      setErrors({ login: error.message });
    } finally {
      setLoading(false); // Reset loading state after API call
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        "@keyframes bgMove": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-3%, -3%) scale(1.03)" },
        },
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",
        animation: `${floatAnimation} 3s ease-in-out infinite`,
      }}
    >
      {/* Main container */}
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 4,
          overflow: "hidden",
          width: "100%",
          maxWidth: 1000,
          // backgroundColor: "transparent", // Make background transparent
            backgroundColor: "rgba(255, 255, 255, 0.6)",
          boxShadow: "none", // Ensure no shadow
        }}
      >
        {/* Left section: Branding */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: "rgba(255, 255, 255, 0.2)", // Light transparent layer
            backdropFilter: "blur(2px)", // Blur effect
            WebkitBackdropFilter: "blur(2px)", // Safari support
            border: "1px solid rgba(255, 255, 255, 0.3)", // Optional subtle border
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box maxWidth={400}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, fontSize: "2.75rem", lineHeight: 1.2 }}
            >
              <Box component="span" sx={{ color: "#1e3a8a" }}>
                Angel
              </Box>
              <Box component="span" sx={{ color: "#ef4444" }}>
                Bot
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 1,
                fontWeight: 600,
                color: "#374151",
                fontSize: "1.25rem",
                position: "relative",
                display: "inline-block",
                pb: 0.5,
              }}
            >
              Access Arc
              <Box
                component="span"
                sx={{
                  display: "block",
                  height: "2px",
                  width: "100%",
                  backgroundColor: "#d1d5db",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                }}
              />
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 3,
                fontSize: "0.95rem",
                fontWeight: 400,
                color: "#4b5563",
                lineHeight: 1.6,
              }}
            >
              AccessArc is a robust license management system designed to
              streamline and curate your company software privileges. It ensures
              efficient allocation and monitoring of licenses, optimizing usage
              and compliance. With AccessArc, you gain full control over your
              software assets, reducing costs and enhancing operational
              efficiency.
            </Typography>
          </Box>
        </Box>

        {/* Right section: Login Form */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: "rgba(255, 255, 255, 0.2)", // Light transparent layer
            backdropFilter: "blur(10px)", // Blur effect
            WebkitBackdropFilter: "blur(10px)", // Safari support
            border: "1px solid rgba(255, 255, 255, 0.3)", // Optional subtle border
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

            {errors.login && (
              <Typography
                color="error"
                variant="body2"
                align="center"
                sx={{ mb: 2 }}
              >
                {errors.login}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
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
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
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

            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Link
                href="#"
                sx={{
                  fontSize: "0.9rem",
                  color: "#3b82f6",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Forgot Your Password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
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
              Login
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don’t have an account?{" "}
              <Link
                onClick={() => navigate("/signup")}
                sx={{ fontWeight: 600, cursor: "pointer", color: "#3b82f6" }}
              >
                Signup
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
