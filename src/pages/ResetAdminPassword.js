import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Snackbar,
  Link,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import backgroundImage from "../assets/Back.jpg.jpg";
import { keyframes } from "@emotion/react";
import { resetAdminPassword } from "../api/authApi.";

const floatAnimation = keyframes`
  0% { background-position-y: 0px; }
  50% { background-position-y: 20px; }
  100% { background-position-y: 0px; }
`;

const ResetAdminPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  console.log("Token from URL path:", token);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrengthMsg, setPasswordStrengthMsg] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getPasswordStrengthMessage = (password) => {
    const strongPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}])[A-Za-z\d@$!%*?&#^()[\]{}]{8,16}$/;

    if (!password) return "";
    if (!strongPattern.test(password)) {
      return "Weak password: must include uppercase, lowercase, number, special character, 8–16 characters.";
    }
    return "Strong password";
  };

  const validateForm = () => {
    const newErrors = {};
    const strongPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}])[A-Za-z\d@$!%*?&#^()[\]{}]{8,16}$/;

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!strongPattern.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must include uppercase, lowercase, number, and special character, 8–16 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "newPassword") {
      setPasswordStrengthMsg(getPasswordStrengthMessage(value));
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await resetAdminPassword(formData.newPassword.trim(), token);
      setSnackbar({
        open: true,
        message: "Password reset successful!",
        severity: "success",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Reset failed:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          "Failed to set password. Please try again.",
        severity: "error",
      });
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
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backgroundColor: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(5px)",
            borderRight: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            <Box component="span" sx={{ color: "#1e3a8a" }}>
              Angel
            </Box>
            <Box component="span" sx={{ color: "#ef4444" }}>
              Bot
            </Box>
          </Typography>
          <Typography variant="h6" mt={1} fontWeight={600}>
            Set Your Password
          </Typography>
          <Typography
            variant="body2"
            mt={2}
            textAlign="center"
            sx={{ maxWidth: 300 }}
          >
            Enter and confirm your new password to regain access to your
            account.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backgroundColor: "rgba(255,255,255,0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            component="form"
            onSubmit={handleReset}
            sx={{ width: "100%", maxWidth: 400 }}
          >
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              FormHelperTextProps={{ sx: { ml: 0 } }}
              margin="normal"
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
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {formData.newPassword && passwordStrengthMsg && (
              <Typography
                variant="body2"
                sx={{
                  color: passwordStrengthMsg.includes("Strong")
                    ? "success.main"
                    : "error.main",
                  ml: 0,
                  mt: -1,
                }}
              >
                {passwordStrengthMsg}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              FormHelperTextProps={{ sx: { ml: 0 } }}
              margin="normal"
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
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: "#3b82f6",
              }}
            >
              Reset Password
            </Button>

            <Typography variant="body2" align="center" mt={2}>
              Back to{" "}
              <Link
                onClick={() => navigate("/login")}
                sx={{ fontWeight: 600, color: "#3b82f6", cursor: "pointer" }}
              >
                Login
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
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ResetAdminPassword;
