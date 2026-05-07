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
  Stack,
  styled,
  IconButton,
  Tooltip,
} from "@mui/material";
import { NAVBAR_LOGO_STYLE } from "../context/LogoContext";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  DesktopWindows as DesktopWindowsIcon,
  Smartphone as SmartphoneIcon,
  Save as SaveIcon,
  Login as LoginIcon,
  ViewQuilt as HeaderIcon,
  SmartToy as ChatbotIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// --- Styled Components ---

const StyledPageContainer = styled(Box)(({ theme }) => ({
  marginLeft: "65px",
  padding: theme.spacing(4),
  minHeight: "100vh",
  background: theme.palette.mode === "dark"
    ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
    : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  [theme.breakpoints.down("sm")]: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const PremiumCard = styled(motion(Paper))(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: "24px",
  height: "100%",
  background: theme.palette.mode === "dark"
    ? "rgba(30, 41, 59, 0.7)"
    : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  border: theme.palette.mode === "dark"
    ? "1px solid rgba(255, 255, 255, 0.08)"
    : "1px solid rgba(0, 0, 0, 0.05)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 15px 35px -5px rgba(0, 0, 0, 0.3)"
    : "0 10px 25px -3px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
}));

const GradientHeader = styled(Box)(({ theme, color1, color2 }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  "& .icon-container": {
    padding: theme.spacing(1.2),
    borderRadius: "16px",
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 8px 16px -4px ${color1}55`,
  },
  "& .title-text": {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: theme.palette.text.primary,
    letterSpacing: "-0.01em",
  }
}));

const ActionButton = styled(Button)(({ theme, color1, color2, variant }) => ({
  padding: "12px 32px",
  borderRadius: "16px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 700,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  ...(variant === "contained" ? {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
    boxShadow: `0 8px 20px -5px ${color1}66`,
    color: "#fff",
    "&:hover": {
      background: `linear-gradient(135deg, ${color2} 0%, ${color1} 100%)`,
      boxShadow: `0 12px 25px -5px ${color1}88`,
      transform: "translateY(-3px)",
    },
  } : {
    border: `2px solid ${color1}33`,
    color: color1,
    "&:hover": {
      background: `${color1}08`,
      border: `2px solid ${color1}`,
      transform: "translateY(-3px)",
    },
  }),
  "&.Mui-disabled": {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

// --- Reusable Section Component ---

const ThemeSection = ({ title, icon: Icon, color1, color2, children, delay = 0 }) => (
  <Grid item xs={12}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <PremiumCard>
        <GradientHeader color1={color1} color2={color2}>
          <div className="icon-container">
            <Icon sx={{ fontSize: 24 }} />
          </div>
          <Typography className="title-text">{title}</Typography>
        </GradientHeader>
        {children}
      </PremiumCard>
    </motion.div>
  </Grid>
);

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
  const [saveLoading, setSaveLoading] = useState(false);

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
        toast.error("Image compression failed.");
      }
    }
  };

  const handleFileRemove = (field) => {
    setForm({ ...form, [field]: "" });
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const payload = {
        appName: form.applicationName,
        favicon: form.feviconLogo,
        loginImage: form.loginLogo,
        bgImage: form.loginBackground,
        slogan: form.loginSlogan,
        mainApplogo: form.mainAppHeaderLogo,
        docuTalkLogo: form.chatbot1Logo,
        docuTalkName: form.chatbot1Name,
        dbTalkName: form.chatbot2Name,
        dbTalkLogo: form.chatbot2Logo,
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
        chatbot1Name: "",
        chatbot1Logo: "",
        chatbot2Name: "",
        chatbot2Logo: "",
      });

      Object.values(fileInputRefs).forEach((ref) => {
        if (ref.current) ref.current.value = null;
      });

      toast.success(response.data.message || "Theme settings saved successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          })
        );
        return;
      }
      toast.error(error.response?.data?.message || error.message || "Error saving theme settings.");
    } finally {
      setSaveLoading(false);
    }
  };

  const renderImageUploader = (field, labelText) => (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "20px",
        textAlign: "center",
        border: "2px dashed rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.4)",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": {
          borderColor: "primary.main",
          background: "rgba(255,255,255,0.7)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box>
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={2}>
          {labelText}
        </Typography>
        {form[field] ? (
          <Box sx={{ position: "relative", mb: 2 }}>
            <Box
              component="img"
              src={form[field]}
              alt={field}
              sx={{
                width: "100%",
                height: 120,
                objectFit: "contain",
                borderRadius: "12px",
                padding: "8px",
                background: "#fff",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
              }}
            />
            <Tooltip title="Remove Image">
              <IconButton
                size="small"
                onClick={() => {
                  handleFileRemove(field);
                  if (fileInputRefs[field]?.current)
                    fileInputRefs[field].current.value = null;
                }}
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  bgcolor: "error.main",
                  color: "white",
                  "&:hover": { bgcolor: "error.dark" },
                  boxShadow: 2,
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box
            sx={{
              height: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
              color: "text.disabled",
            }}
          >
            <ImageIcon sx={{ fontSize: 40, opacity: 0.5 }} />
            <Typography variant="caption">No image selected</Typography>
          </Box>
        )}
      </Box>

      {!form[field] && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          fullWidth
          sx={{
            borderRadius: "12px",
            py: 1.2,
            textTransform: "none",
            fontWeight: 700,
            color: "primary.main",
            background: (theme) => theme.palette.mode === "dark"
              ? "rgba(59, 130, 246, 0.08)"
              : "rgba(37, 99, 235, 0.05)",
            border: "1.5px solid",
            borderColor: (theme) => theme.palette.mode === "dark"
              ? "rgba(59, 130, 246, 0.3)"
              : "rgba(37, 99, 235, 0.2)",
            "&:hover": {
              background: (theme) => theme.palette.mode === "dark"
                ? "rgba(59, 130, 246, 0.15)"
                : "rgba(37, 99, 235, 0.1)",
              borderColor: "primary.main",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
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
    </Box>
  );

  const renderPreviewModal = () => (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "24px", overflow: "hidden" }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          background: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
        }}
      >
        <Typography variant="h6" fontWeight="700" color="primary">Theme Preview</Typography>
        <ToggleButtonGroup
          value={deviceView}
          exclusive
          onChange={(e, v) => v && setDeviceView(v)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: "10px",
              px: 2,
              mx: 0.5,
              border: "none",
              background: "rgba(0,0,0,0.05)",
              "&.Mui-selected": {
                background: "primary.main",
                color: "white",
                "&:hover": { background: "primary.dark" }
              }
            }
          }}
        >
          <ToggleButton value="desktop">
            <DesktopWindowsIcon fontSize="small" sx={{ mr: 1 }} />
            Desktop
          </ToggleButton>
          <ToggleButton value="mobile">
            <SmartphoneIcon fontSize="small" sx={{ mr: 1 }} />
            Mobile
          </ToggleButton>
        </ToggleButtonGroup>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box
          sx={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "20px",
            overflow: "hidden",
            width: deviceView === "mobile" ? 320 : "100%",
            mx: "auto",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(90deg, #1e40af, #3b82f6)",
              px: 3,
              display: "flex",
              alignItems: "center",
              height: 64,
            }}
          >
            {form.mainAppHeaderLogo ? (
              <Box
                component="img"
                src={form.mainAppHeaderLogo}
                alt="Header Logo"
                sx={NAVBAR_LOGO_STYLE}
              />
            ) : (
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ color: "white", fontWeight: 700 }}>L</Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              position: "relative",
              height: deviceView === "mobile" ? 480 : 350,
              backgroundImage: form.loginBackground
                ? `url(${form.loginBackground})`
                : "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: deviceView === "mobile" ? "column" : "row",
                borderRadius: "20px",
                overflow: "hidden",
                width: deviceView === "mobile" ? "100%" : "90%",
                maxWidth: 650,
                backdropFilter: "blur(20px)",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.1)",
                  gap: 2,
                }}
              >
                {form.loginLogo ? (
                  <Box
                    component="img"
                    src={form.loginLogo}
                    alt="Login Logo"
                    sx={{ maxWidth: 120, height: "auto", objectFit: "contain" }}
                  />
                ) : (
                  <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 32 }}>🏛</Typography>
                  </Box>
                )}
                {form.loginSlogan && (
                  <Typography sx={{ color: "white", fontWeight: 600, fontSize: 13, textAlign: "center", opacity: 0.9 }}>
                    {form.loginSlogan}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  flex: 1.2,
                  p: 4,
                  background: "rgba(255,255,255,0.95)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#1e293b", mb: 1 }}>Login</Typography>
                <Box sx={{ height: 40, borderRadius: "10px", border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }} />
                <Box sx={{ height: 40, borderRadius: "10px", border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }} />
                <Box sx={{ height: 40, borderRadius: "10px", bgcolor: "#3b82f6", mt: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight="700" mt={5} mb={3} color="primary">Asset Summary</Typography>
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
              <Grid item xs={12} sm={4} key={key}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    textAlign: "center",
                    bgcolor: "rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                    {label}
                  </Typography>
                  <Box
                    component="img"
                    src={form[key]}
                    alt={label}
                    sx={{ width: "100%", height: 80, objectFit: "contain", borderRadius: "8px" }}
                  />
                </Paper>
              </Grid>
            ) : null
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <Button
          onClick={() => setPreviewOpen(false)}
          variant="outlined"
          sx={{ borderRadius: "12px", px: 4, textTransform: "none", fontWeight: 700 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <StyledPageContainer>
      <Grid container spacing={4}>
        <AnimatePresence>
          {/* Login Page Section */}
          <ThemeSection
            title="Login Page Settings"
            icon={LoginIcon}
            color1="#3b82f6"
            color2="#2dd4bf"
            delay={0.1}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>Application Name</Typography>
                <TextField
                  fullWidth
                  placeholder="Enter application name"
                  value={form.applicationName}
                  onChange={handleChange("applicationName")}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>Login Slogan</Typography>
                <TextField
                  fullWidth
                  placeholder="Enter catchy slogan"
                  value={form.loginSlogan}
                  onChange={handleChange("loginSlogan")}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
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
          </ThemeSection>

          {/* Main App Header Section */}
          <ThemeSection
            title="Main App Header"
            icon={HeaderIcon}
            color1="#8b5cf6"
            color2="#d946ef"
            delay={0.2}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                {renderImageUploader("mainAppHeaderLogo", "Header Logo")}
              </Grid>
            </Grid>
          </ThemeSection>

          {/* Chatbot Settings Section */}
          <ThemeSection
            title="Chatbot Settings"
            icon={ChatbotIcon}
            color1="#f59e0b"
            color2="#ef4444"
            delay={0.3}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>DocuTalk Name</Typography>
                <TextField
                  fullWidth
                  placeholder="e.g., DocuTalk Assistant"
                  value={form.chatbot1Name}
                  onChange={handleChange("chatbot1Name")}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderImageUploader("chatbot1Logo", "DocuTalk Logo")}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>DBTalk Name</Typography>
                <TextField
                  fullWidth
                  placeholder="e.g., DBTalk Assistant"
                  value={form.chatbot2Name}
                  onChange={handleChange("chatbot2Name")}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderImageUploader("chatbot2Logo", "DBTalk Logo")}
              </Grid>
            </Grid>
          </ThemeSection>
        </AnimatePresence>
      </Grid>

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={3}
        mt={8}
        mb={4}
      >
        <motion.div whileHover={{ scale: 1.05 }}>
          <ActionButton
            variant="outlined"
            color1="#64748b"
            startIcon={<VisibilityIcon />}
            onClick={() => setPreviewOpen(true)}
          >
            Preview All
          </ActionButton>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <ActionButton
            variant="contained"
            color1="#2563eb"
            color2="#1d4ed8"
            startIcon={saveLoading ? <SaveIcon /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={saveLoading}
          >
            {saveLoading ? "Saving..." : "Save Settings"}
          </ActionButton>
        </motion.div>
      </Box>

      {renderPreviewModal()}
    </StyledPageContainer>
  );
};

export default ThemeSetting;
