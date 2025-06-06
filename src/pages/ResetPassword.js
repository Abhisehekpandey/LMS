import React, { useState } from "react";
import { useSearchParams } from "react-router-dom"; // import this
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/Back.jpg.jpg";
import { keyframes } from "@emotion/react";
import { resetPassword } from "../api/authApi.";

const floatAnimation = keyframes`
  0% { background-position-y: 0px; }
  50% { background-position-y: 20px; }
  100% { background-position-y: 0px; }
`;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

    const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // <-- extract token from URL

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };



// const handleReset = async (e) => {
//   e.preventDefault();
//   const validationErrors = validateForm();
//   if (Object.keys(validationErrors).length > 0) {
//     setErrors(validationErrors);
//     return;
//   }

//   try {
//     await resetPassword(formData.newPassword);
//     alert("Password reset successful!");
//     navigate("/login");
//   } catch (error) {
//     console.error("Reset failed:", error.message);
//     setErrors({ api: "Failed to reset password. Please try again." });
//   }
// };
 const handleReset = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // pass both newPassword and token to resetPassword function
      await resetPassword(formData.newPassword, token);
      alert("Password reset successful!");
      // navigate("/login");
      navigate("http://frontdms-test.apps.lab.ocp.lan/teamsync/home")
    } 
    catch (error) {
      console.error("Reset failed:", error.message);
      setErrors({ api: "Failed to reset password. Please try again." });
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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        animation: `${floatAnimation} 3s ease-in-out infinite`,
        p: 2,
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
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box maxWidth={400}>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              <Box component="span" sx={{ color: "#1e3a8a" }}>Angel</Box>
              <Box component="span" sx={{ color: "#ef4444" }}>Bot</Box>
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, color: "#374151" }}>
              Reset Your Password
            </Typography>
            <Typography variant="body1" sx={{ mt: 3, fontSize: "0.95rem", color: "#4b5563" }}>
              Enter and confirm your new password to regain access to your account.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 4,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box component="form" onSubmit={handleReset} sx={{ width: "100%", maxWidth: 400 }}>
            <Typography variant="h5" align="center" fontWeight={600} mb={3}>
              Set Password
            </Typography>

            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              margin="normal"
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />

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
              Reset Password
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Back to{" "}
              <Box component="span" onClick={() => navigate("/login")} sx={{ fontWeight: 600, cursor: "pointer", color: "#3b82f6" }}>
                Login
              </Box>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
