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
  Card,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Upload,
  Delete,
  Visibility,
  DesktopWindows,
  Smartphone,
} from "@mui/icons-material";

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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [deviceView, setDeviceView] = useState("desktop");

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
    <Card
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        textAlign: "center",
        transition: "0.3s",
        "&:hover": { boxShadow: 5 },
      }}
    >
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
        {labelText}
      </Typography>
      {form[field] ? (
        <>
          <Box
            component="img"
            src={form[field]}
            alt={field}
            sx={{
              maxWidth: "100%",
              height: 100,
              objectFit: "contain",
              mb: 2,
              borderRadius: 1,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            fullWidth
            onClick={() => {
              handleFileRemove(field);
              if (fileInputRefs[field]?.current)
                fileInputRefs[field].current.value = null;
            }}
          >
            Remove
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          component="label"
          startIcon={<Upload />}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1,
            textTransform: "none",
          }}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRefs[field]}
            onChange={handleFileUpload(field)}
          />
        </Button>
      )}
    </Card>
  );

  const renderPreviewModal = () => (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight="bold">Theme Preview</Typography>
        <ToggleButtonGroup
          value={deviceView}
          exclusive
          onChange={(e, v) => v && setDeviceView(v)}
          size="small"
        >
          <ToggleButton value="desktop">
            <DesktopWindows fontSize="small" sx={{ mr: 0.5 }} />
            Desktop
          </ToggleButton>
          <ToggleButton value="mobile">
            <Smartphone fontSize="small" sx={{ mr: 0.5 }} />
            Mobile
          </ToggleButton>
        </ToggleButtonGroup>
      </DialogTitle>

      <DialogContent dividers>
        {/* NEW: full app preview wrapper */}
        <Box
          sx={{
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: 3,
            overflow: "hidden",
            width: deviceView === "mobile" ? 320 : "100%",
            mx: "auto",
          }}
        >
          {/* NEW: simulated app header bar showing mainAppHeaderLogo */}
          <Box
            sx={{
              background: "linear-gradient(90deg, #1565c0, #1976d2)",
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minHeight: 52,
            }}
          >
            {form.mainAppHeaderLogo ? (
              <Box
                component="img"
                src={form.mainAppHeaderLogo}
                alt="Header Logo"
                sx={{ height: 36, maxWidth: 120, objectFit: "contain" }}
              />
            ) : (
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "white", fontSize: 18 }}>☰</Typography>
              </Box>
            )}
            <Typography
              sx={{ color: "white", fontWeight: 700, fontSize: deviceView === "mobile" ? 13 : 15 }}
            >
              {form.applicationName || "Application Name"}
            </Typography>
          </Box>

          {/* OLD login preview area — kept as-is, now sits below the header bar */}
          {/* OLD: was the only element, now wrapped inside the outer Box */}
          <Box
            sx={{
              position: "relative",
              height: deviceView === "mobile" ? 400 : 320,
              backgroundColor: "#f5f5f5",
              backgroundImage: form.loginBackground
                ? `url(${form.loginBackground})`
                : "linear-gradient(135deg, #ece9e6, #ffffff)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {form.feviconLogo && (
              <Box
                component="img"
                src={form.feviconLogo}
                alt="Favicon"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  position: "absolute",
                  top: 16,
                  left: 16,
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "white",
                }}
              />
            )}

            {form.loginLogo && (
              <Box
                component="img"
                src={form.loginLogo}
                alt="Login Logo"
                sx={{
                  maxWidth: deviceView === "mobile" ? 100 : 150,
                  maxHeight: 80,
                  mb: 2,
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: 2,
                  p: 1,
                }}
              />
            )}

            {form.applicationName && (
              <Typography
                variant={deviceView === "mobile" ? "h6" : "h5"}
                fontWeight="bold"
                sx={{ color: "#333", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                {form.applicationName}
              </Typography>
            )}

            {form.loginSlogan && (
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 1, color: "#555", fontStyle: "italic",
                  textAlign: "center", px: 2,
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                {form.loginSlogan}
              </Typography>
            )}

            {/* NEW: placeholder when no login assets are set */}
            {!form.loginBackground && !form.loginLogo && !form.applicationName && !form.loginSlogan && (
              <Typography sx={{ color: "#aaa", fontStyle: "italic", fontSize: 14 }}>
                Upload a login logo or background to preview
              </Typography>
            )}
          </Box>
        </Box>

        <Typography
          variant="h6"
          mt={3}
          mb={2}
          fontWeight="bold"
          color="primary"
        >
          Uploaded Assets
        </Typography>
        <Grid container spacing={3}>
          {[
            { key: "loginLogo", label: "Login Logo" },
            { key: "loginBackground", label: "Login Background" },
            { key: "feviconLogo", label: "Favicon Logo" },
            { key: "mainAppHeaderLogo", label: "Header Logo" },
          ].map(({ key, label }) =>
            form[key] ? (
              <Grid item xs={12} sm={6} key={key}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "#fafafa",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    {label}
                  </Typography>
                  <Box
                    component="img"
                    src={form[key]}
                    alt={label}
                    sx={{
                      maxWidth: "100%",
                      height: 120,
                      objectFit: "contain",
                      borderRadius: 1,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                </Paper>
              </Grid>
            ) : null
          )}
        </Grid>

        {!Object.values(form).some((v) => v) && (
          <Typography
            mt={3}
            textAlign="center"
            color="text.secondary"
            fontStyle="italic"
          >
            No images uploaded yet.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ ml: { xs: 2, sm: 8 }, p: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          mb: 4,
          background: (theme) =>
            theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
          Login Page Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Application Name"
              value={form.applicationName}
              onChange={handleChange("applicationName")}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Login Slogan"
              value={form.loginSlogan}
              onChange={handleChange("loginSlogan")}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            {renderImageUploader("loginLogo", "Login Logo")}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderImageUploader("loginBackground", "Background Image")}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderImageUploader("feviconLogo", "Favicon")}
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
          Main App Header
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderImageUploader("mainAppHeaderLogo", "Header Logo")}
          </Grid>
        </Grid>
      </Paper>

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        mt={4}
      >
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Visibility />}
          onClick={() => setPreviewOpen(true)}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Preview All
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          sx={{
            px: 5,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: 3,
            "&:hover": { boxShadow: 6 },
          }}
        >
          Save Settings
        </Button>
      </Box>

      {renderPreviewModal()}

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
