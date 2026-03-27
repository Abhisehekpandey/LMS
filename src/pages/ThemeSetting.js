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
import { NAVBAR_LOGO_STYLE } from "../context/LogoContext";
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
    chatbot1Logo: useRef(),
    chatbot2Logo: useRef(),
  };

  const [form, setForm] = useState({
    applicationName: "",
    loginSlogan: "",
    loginLogo: "",
    loginBackground: "",
    mainAppHeaderLogo: "",
    feviconLogo: "",
    chatbot1Name: "",
    chatbot1Logo: "",
    chatbot2Name: "",
    chatbot2Logo: "",
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
        chatbot1Name: form.chatbot1Name,
        chatbot1Logo: form.chatbot1Logo,
        chatbot2Name: form.chatbot2Name,
        chatbot2Logo: form.chatbot2Logo,
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
        },
      );

      setForm({
        applicationName: "",
        loginSlogan: "",
        loginLogo: "",
        loginBackground: "",
        mainAppHeaderLogo: "",
        feviconLogo: "",
        chatbot1Name: "",
        chatbot1Logo: "",
        chatbot2Name: "",
        chatbot2Logo: "",
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
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
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
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: 64,
            }}
          >
            {form.mainAppHeaderLogo ? (
              // OLD: width: 220, height: 44 in a nested container — still too small
              // OLD: width: "100%" — made it span full header like the actual navbar
              <Box
                component="img"
                src={form.mainAppHeaderLogo}
                alt="Header Logo"
                sx={NAVBAR_LOGO_STYLE}
              />
            ) : (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "white", fontSize: 18 }}>
                  ☰
                </Typography>
              </Box>
            )}
            {/* OLD: showed application name in header — removed from preview per user request */}
            {/* <Typography
              sx={{ color: "white", fontWeight: 700, fontSize: deviceView === "mobile" ? 13 : 15 }}
            >
              {form.applicationName || "Application Name"}
            </Typography> */}
          </Box>

          {/* Login page preview — two-panel layout matching actual login page */}
          <Box
            sx={{
              position: "relative",
              height: deviceView === "mobile" ? 420 : 300,
              backgroundImage: form.loginBackground
                ? `url(${form.loginBackground})`
                : "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            {/* OLD: favicon shown in top-left — removed from preview per user request */}
            {/* {form.feviconLogo && ( ... )} */}

            {/* Two-panel card matching actual login layout */}
            <Box
              sx={{
                display: "flex",
                flexDirection: deviceView === "mobile" ? "column" : "row",
                borderRadius: 2,
                overflow: "hidden",
                width: deviceView === "mobile" ? "90%" : "80%",
                maxWidth: 600,
                backdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {/* Left — branding panel */}
              <Box
                sx={{
                  flex: 1,
                  p: deviceView === "mobile" ? 2 : 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.12)",
                  borderRight:
                    deviceView === "mobile"
                      ? "none"
                      : "1px solid rgba(255,255,255,0.15)",
                  borderBottom:
                    deviceView === "mobile"
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "none",
                  gap: 1,
                }}
              >
                {form.loginLogo ? (
                  <Box sx={{ width: "100%", height: "100%", flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={form.loginLogo}
                      alt="Login Logo"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ color: "white", fontSize: 26 }}>
                      🏛
                    </Typography>
                  </Box>
                )}
                {form.loginSlogan && (
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: 11,
                      textAlign: "center",
                      mt: 0.5,
                    }}
                  >
                    {form.loginSlogan}
                  </Typography>
                )}
              </Box>

              {/* Right — sign-in form mock */}
              <Box
                sx={{
                  flex: 1,
                  p: deviceView === "mobile" ? 2 : 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.88)",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, mb: 0.5, color: "#222" }}
                >
                  Login
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 28,
                    borderRadius: 1,
                    border: "1px solid #ccc",
                    bgcolor: "#f9f9f9",
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 10, color: "#aaa" }}>
                    Email
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 28,
                    borderRadius: 1,
                    border: "1px solid #ccc",
                    bgcolor: "#f9f9f9",
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 10, color: "#aaa" }}>
                    Password
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 28,
                    borderRadius: 1,
                    bgcolor: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 0.5,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 11, color: "white", fontWeight: 600 }}
                  >
                    Login
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* OLD: version badge shown in preview — removed per user request */}
            {/* <Typography variant="caption" sx={{ position: "absolute", bottom: 8, right: 10 }}>
              v{APP_VERSION}
            </Typography> */}
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
            { key: "chatbot1Logo", label: "DocuTalk Logo" },
            { key: "chatbot2Logo", label: "DBTalk Logo" },
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
            ) : null,
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

      {/* <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          mt: 4,
          background: (theme) =>
            theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
          Chatbot Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
         
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="DocuTalk Name"
              value={form.chatbot1Name}
              onChange={handleChange("chatbot1Name")}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderImageUploader("chatbot1Logo", "DocuTalk Logo")}
          </Grid>

         
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="DBTalk Name"
              value={form.chatbot2Name}
              onChange={handleChange("chatbot2Name")}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderImageUploader("chatbot2Logo", "DBTalk Logo")}
          </Grid>
        </Grid>
      </Paper> */}

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
