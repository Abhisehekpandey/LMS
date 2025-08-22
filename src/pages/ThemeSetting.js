import React, { useState, useRef } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
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
    feviconLogo: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const compressAndConvertToBase64 = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    return await imageCompression.getDataUrlFromFile(compressedFile);
  };

  const handleFileUpload = (field) => async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const base64 = await compressAndConvertToBase64(file);
        setForm({ ...form, [field]: base64 });
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Image compression failed.",
          severity: "error",
        });
      }
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
    <Grid item xs={12} sm={4}>
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
            ref={fileInputRefs[field]}
            onChange={handleFileUpload(field)}
          />
        </Button>
        {form[field] && (
          <Button
            color="error"
            onClick={() => {
              handleFileRemove(field);
              if (fileInputRefs[field]?.current) {
                fileInputRefs[field].current.value = null;
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

         
          <Grid item xs={12}>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <Box flex={1} minWidth={200}>
                {renderImageUploader("loginLogo", "Login Logo")}
              </Box>
              <Box flex={1} minWidth={200}>
                {renderImageUploader(
                  "loginBackground",
                  "Login Background Image"
                )}
              </Box>
              <Box flex={1} minWidth={200}>
                {renderImageUploader("feviconLogo", "Favicon Logo")}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Main App Header Logo
        </Typography>
        <Grid container spacing={2}>
          {renderImageUploader("mainAppHeaderLogo", "Header Logo")}
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

