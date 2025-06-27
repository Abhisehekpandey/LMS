import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Snackbar,
  Link,
} from "@mui/material";
import { FormHelperText } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/Back.jpg.jpg";
import { keyframes } from "@emotion/react";
import { resetAdminPassword } from "../api/authApi.";
import { Link as RouterLink } from "react-router-dom";


const floatAnimation = keyframes`
  0% { background-position-y: 0px; }
  50% { background-position-y: 20px; }
  100% { background-position-y: 0px; }
`;

const ForgetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [passwordStrengthMsg, setPasswordStrengthMsg] = useState("");


  const navigate = useNavigate();

  const getPasswordStrengthMessage = (password) => {
    const strongPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}])[A-Za-z\d@$!%*?&#^()[\]{}]{8,16}$/;
  

    if (!password) return "";
    if (!strongPattern.test(password)) {
      return "Weak password: must include uppercase, lowercase, number, and special character, 8–16 characters.";
    }
    return "Strong password";
  };
  

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
    newErrors.email = "Invalid email format";
  }

  if (!formData.newPassword) {
    newErrors.newPassword = "New password is required";
  } else if (formData.newPassword.length < 8) {
    newErrors.newPassword = "Password must be at least 8 characters";
  } else if (formData.newPassword.length > 16) {
    newErrors.newPassword = "Password must not exceed 16 characters";
  }

  if (!formData.confirmPassword) {
    newErrors.confirmPassword = "Confirm password is required";
  } else if (formData.newPassword !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  return newErrors;
};


  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Show password strength message for newPassword field
    if (name === "newPassword") {
      const strengthMsg = getPasswordStrengthMessage(value);
      setPasswordStrengthMsg(strengthMsg);
    }
  };
  

  const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    const response = await resetAdminPassword({
      email: formData.email,
      newPassword: formData.newPassword,
    });

    setSnackbar({
      open: true,
      message: response.message || "Password reset successfully!",
      severity: "success",
    });

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        animation: `${floatAnimation} 3s ease-in-out infinite`,
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 500,
          p: 4,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          borderRadius: 4,
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
        }}
      >
        <Typography variant="h5" align="center" fontWeight={600} mb={3}>
          Reset Password
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
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
            label="New Password"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={formData.newPassword}
            onChange={handleChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
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
          {formData.newPassword && passwordStrengthMsg && (
            <FormHelperText
              sx={{
                color: passwordStrengthMsg.includes("Strong")
                  ? "success.main"
                  : "error.main",
                ml: 0,
                mt: -1,
              }}
            >
              {passwordStrengthMsg}
            </FormHelperText>
          )}

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5, fontWeight: 600, borderRadius: 2 }}
          >
            Reset Password
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Back to{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ fontWeight: 600, color: "#3b82f6" }}
            >
              Login
            </Link>
          </Typography>
        </Box>

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
      </Paper>
    </Box>
  );
};

export default ForgetPassword;
