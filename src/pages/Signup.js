import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/Back.jpg.jpg";
import { keyframes } from "@emotion/react";

const floatAnimation = keyframes`
  0% { background-position-y: 0px; }
  50% { background-position-y: 20px; }
  100% { background-position-y: 0px; }
`;

const Signup = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organization: "",
    adminName: "",
    domain: "",
    emailPrefix: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fullEmail =
    formData.emailPrefix && formData.domain
      ? `${formData.emailPrefix}@${formData.domain}`
      : "";

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organization)
      newErrors.organization = "Organization is required";
    if (!formData.adminName) newErrors.adminName = "Admin name is required";
    if (!formData.domain) {
      newErrors.domain = "Domain is required";
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = "Invalid domain";
    }

    if (!formData.emailPrefix) {
      newErrors.email = "Admin email prefix is required";
    } else if (!/\S+@\S+\.\S+/.test(fullEmail)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Store full email for backend submission
    const finalData = {
      ...formData,
      email: fullEmail,
    };

    sessionStorage.setItem("user", JSON.stringify(finalData));
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eef2f7",
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
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Make background transparent
          boxShadow: "none", // Ensure no shadow
        }}
      >
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
          <Box maxWidth={400} textAlign="left">
            <Typography
              variant="h3"
              sx={{
                fontSize: "2.75rem",
                fontWeight: 900,
                letterSpacing: "-1px",
                lineHeight: 1.2,
              }}
            >
              <Box component="span" sx={{ color: "#1e293b" }}>
                Team
              </Box>
              <Box component="span" sx={{ color: "#ff4b5c", fontWeight: 900 }}>
                Sync
              </Box>
              <Box
                component="span"
                sx={{ color: "#9333ea", fontWeight: 900, pl: 1 }}
              >
                ×
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
                maxWidth: "90%",
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
            onSubmit={handleSignup}
            sx={{ width: "100%", maxWidth: 400 }}
          >
            <Typography variant="h5" align="center" fontWeight={600} mb={3}>
              Signup Organization
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                label="Organization Name"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                error={!!errors.organization}
                helperText={errors.organization}
              />
              <TextField
                fullWidth
                label="Admin Name"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                error={!!errors.adminName}
                helperText={errors.adminName}
              />
            </Box>

            <TextField
              fullWidth
              label="Domain"
              name="domain"
              margin="normal"
              value={formData.domain}
              onChange={handleChange}
              error={!!errors.domain}
              helperText={errors.domain}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Admin Email"
              name="emailPrefix"
              margin="normal"
              value={formData.emailPrefix}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
                endAdornment: formData.domain && (
                  <InputAdornment position="end" sx={{ fontWeight: 600 }}>
                    @{formData.domain}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={formData.password}
              onChange={handleChange}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
              sx={{
                py: 1.5,
                mt: 2,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Signup
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have account?{" "}
              <Link
                onClick={() => navigate("/login")}
                sx={{ cursor: "pointer", fontWeight: 600 }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
