import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Link,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/Back.jpg.jpg"; // or replace with your background
// import { resetAdminPassword } from "../api/authApi"; 
import { ForgetAdminPassword } from "../api/authApi.";

import { Link as RouterLink } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Invalid email format");
      return;
    }

    try {
      const response = await ForgetAdminPassword({ email: trimmedEmail });

      setSnackbar({
        open: true,
        message: response.message || "Activation link sent to your email!",
        severity: "success",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || err.message || "Something went wrong",
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
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: "100%",
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Team<span style={{ color: "#EF4444" }}>Sync</span>{" "}
          <span style={{ color: "#8b5cf6" }}>✕</span>
        </Typography>
        <Typography variant="h6" fontWeight="600" mt={1}>
          Access Arc
        </Typography>

        <Typography variant="h6" mt={4} fontWeight="600">
          Forget Your Password?
        </Typography>
        <Typography variant="body2" mt={1} mb={3}>
          Forget your password? No need to worry. Tell us your email and we will
          send you the Activation link.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value.trimStart());
              setError("");
            }}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: <Email sx={{ mr: 1 }} />,
            }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              backgroundColor: "#3B82F6",
            }}
          >
            Send
          </Button>
        </Box>

        <Typography variant="body2" mt={2}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{ fontWeight: 600, color: "#3b82f6" }}
          >
            Sign In?
          </Link>
        </Typography>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ForgetPassword;

