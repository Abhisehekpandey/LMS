import React, { useState } from "react";
import { useRef } from "react";

import axios from "axios"; // Make sure this import exists at the top
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import { Upload, Delete } from "@mui/icons-material";

const ThemeSetting = () => {
  const fileInputRefs = {
    loginLogo: useRef(),
    loginBackground: useRef(),
    feviconLogo: useRef(),
    mainAppHeaderLogo: useRef(),
  };
  const [form, setForm] = useState({
    applicationName: "",
    loginSlogan: "",
    loginLogo: "",
    loginBackground: "",
    mainAppHeaderLogo: "",
    feviconLogo: "", // <-- Added
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleFileUpload = (field) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, [field]: reader.result }); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileRemove = (field) => {
    setForm({ ...form, [field]: "" });
  };

  const handleSaveSettings = async () => {
    try {
      const payload = {
        appName: form.applicationName,
        favicon: form.feviconLogo,
        loginImage: form.loginLogo,
        bgImage: form.loginBackground,
        slogan: form.loginSlogan,
        mainApplogo: form.mainAppHeaderLogo,
      };

      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/addLogo`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );

      setForm({
        applicationName: "",
        loginSlogan: "",
        loginLogo: "",
        loginBackground: "",
        mainAppHeaderLogo: "",
        feviconLogo: "",
      });

      Object.values(fileInputRefs).forEach((ref) => {
        if (ref.current) ref.current.value = null;
      });

      setSnackbar({
        open: true,
        message: response.data.message || "Theme settings saved successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error saving theme settings.",
        severity: "error",
      });
    }
  };

  const renderImageUploader = (field, labelText) => (
    <Grid item xs={12}>
      <Typography variant="subtitle2" mb={1}>
        {labelText}
      </Typography>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Upload
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRefs[field]} // <-- use ref
            onChange={handleFileUpload(field)}
          />
        </Button>
        {form[field] && (
          <Button
            color="error"
            onClick={() => {
              handleFileRemove(field);
              if (fileInputRefs[field]?.current) {
                fileInputRefs[field].current.value = null; // <-- reset input
              }
            }}
            startIcon={<Delete />}
          >
            Remove
          </Button>
        )}
      </Box>
      {form[field] && (
        <Box
          component="img"
          src={form[field]}
          alt={field}
          sx={{
            maxWidth: 200,
            maxHeight: 100,
            border: "1px solid #ddd",
            borderRadius: 1,
          }}
        />
      )}
    </Grid>
  );

  return (
    <Box sx={{ ml: { xs: "10px", sm: "80px" }, p: 4 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "black" }}
      >
        Theming
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Login Settings
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Application Name"
              value={form.applicationName}
              onChange={handleChange("applicationName")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Login Slogan"
              value={form.loginSlogan}
              onChange={handleChange("loginSlogan")}
            />
          </Grid>

          {/* Row for logos: 3 items side by side */}
          <Grid item xs={12} sm={4}>
            {renderImageUploader("loginLogo", "Login Logo")}
          </Grid>
          <Grid item xs={12} sm={4}>
            {renderImageUploader("loginBackground", "Login Background Image")}
          </Grid>
          <Grid item xs={12} sm={4}>
            {renderImageUploader("feviconLogo", "Favicon Logo")}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Main App Header Logo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderImageUploader("mainAppHeaderLogo", "Header Logo")}
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          sx={{ px: 4, py: 1.5 }}
        >
          Save Settings
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ThemeSetting;
