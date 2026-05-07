import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  Stack,
  styled,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  SettingsInputComponent as AttributeIcon,
  Save as SaveIcon,
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
  padding: theme.spacing(3),
  borderRadius: "20px",
  height: "100%",
  background: theme.palette.mode === "dark"
    ? "rgba(30, 41, 59, 0.7)"
    : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  border: theme.palette.mode === "dark"
    ? "1px solid rgba(255, 255, 255, 0.08)"
    : "1px solid rgba(0, 0, 0, 0.05)",
  boxShadow: theme.palette.mode === "dark"
    ? "0 15px 25px -5px rgba(0, 0, 0, 0.25)"
    : "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 20px 30px -5px rgba(0, 0, 0, 0.35)"
      : "0 15px 20px -5px rgba(0, 0, 0, 0.12)",
  },
}));

const GradientHeader = styled(Box)(({ theme, color1, color2 }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2.5),
  "& .icon-container": {
    padding: theme.spacing(1.2),
    borderRadius: "14px",
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 6px 12px -3px ${color1}55`,
  },
  "& .title-text": {
    fontWeight: 700,
    fontSize: "1.15rem",
    color: theme.palette.text.primary,
    letterSpacing: "-0.01em",
  }
}));

const ActionButton = styled(Button)(({ theme, color1, color2 }) => ({
  padding: "10px 28px",
  borderRadius: "14px",
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
  boxShadow: `0 6px 15px -3px ${color1}44`,
  transition: "all 0.3s ease",
  color: "#fff",
  "&:hover": {
    background: `linear-gradient(135deg, ${color2} 0%, ${color1} 100%)`,
    boxShadow: `0 10px 20px -5px ${color1}55`,
    transform: "translateY(-2px)",
  },
  "&.Mui-disabled": {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

// --- Reusable Section Component ---

const ConfigurationSection = ({ title, icon: Icon, color1, color2, children, delay = 0 }) => (
  <Grid item xs={12} lg={6}>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay }}
    >
      <PremiumCard>
        <GradientHeader color1={color1} color2={color2}>
          <div className="icon-container">
            <Icon sx={{ fontSize: 22 }} />
          </div>
          <Typography className="title-text">{title}</Typography>
        </GradientHeader>
        <Stack spacing={3}>
          {children}
        </Stack>
      </PremiumCard>
    </motion.div>
  </Grid>
);

// --- Main Page Component ---

const Configuration = () => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const hasFetched = useRef(false);
  const originalConfig = useRef(null); // To track initial values

  const [config, setConfig] = useState({
    uploadSize: "",
    uploadUnit: "",
    uploadBatchLimit: "",
    downloadSize: "",
    downloadUnit: "",
    downloadBatchLimit: "",
    attributesLimit: "",
  });

  const fetchConfig = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    setLoading(true);
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/getConfig`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );

      if (response.data) {
        const { uploadConfig, downloadConfig, typeConfig } = response.data;

        const parseSize = (sizeStr) => {
          if (!sizeStr || sizeStr === "") return { size: "", unit: "" };
          const sizeOnly = sizeStr.toString().replace(/[^0-9]/g, '');
          const unitOnly = sizeStr.toString().replace(/[^a-zA-Z]/g, '').toUpperCase();
          return {
            size: sizeOnly || "",
            unit: unitOnly || "MB"
          };
        };

        const uploadData = uploadConfig?.maxfilesize || uploadConfig?.maxFileSize || uploadConfig?.maxFilesize || "";
        const downloadData = downloadConfig?.maxdownloadsize || downloadConfig?.maxDownloadSize || downloadConfig?.maxDownloadsize || "";

        const upload = parseSize(uploadData);
        const download = parseSize(downloadData);

        const fetchedState = {
          uploadSize: upload.size,
          uploadUnit: upload.unit,
          uploadBatchLimit: uploadConfig?.batchLimit?.toString() || "",
          downloadSize: download.size,
          downloadUnit: download.unit,
          downloadBatchLimit: downloadConfig?.exportLimit?.toString() || "",
          attributesLimit: typeConfig?.maxAttributes?.toString() || "",
        };

        setConfig(fetchedState);
        originalConfig.current = fetchedState; // Save for comparison
      }
    } catch (error) {
      console.error("Failed to fetch configuration:", error);
      toast.error("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (field) => (event) => {
    setConfig({ ...config, [field]: event.target.value });
  };

  // Validation Logic
  const uploadSizeVal = Number(config.uploadSize);
  const isUploadSizeNegative = uploadSizeVal < 0;
  const isUploadSizeEmpty = config.uploadSize.trim() === "";
  const isUploadSizeInvalid =
    isUploadSizeNegative ||
    isUploadSizeEmpty ||
    (config.uploadUnit === "GB" && uploadSizeVal > 1) ||
    (config.uploadUnit === "MB" && uploadSizeVal > 1024) ||
    (config.uploadUnit === "KB" && uploadSizeVal > 1048576);

  const uploadBatchLimitVal = Number(config.uploadBatchLimit);
  const isUploadBatchLimitNegative = uploadBatchLimitVal < 0;
  const isUploadBatchLimitInvalid = isUploadBatchLimitNegative || uploadBatchLimitVal > 30;

  const downloadSizeVal = Number(config.downloadSize);
  const isDownloadSizeNegative = downloadSizeVal < 0;

  const downloadBatchLimitVal = Number(config.downloadBatchLimit);
  const isDownloadExportLimitNegative = downloadBatchLimitVal < 0;
  const isDownloadExportLimitInvalid = isDownloadExportLimitNegative || downloadBatchLimitVal > 10;

  const attributesLimitVal = Number(config.attributesLimit);
  const isAttributesLimitNegative = attributesLimitVal < 0;

  const isSaveDisabled =
    isUploadSizeInvalid ||
    isUploadBatchLimitInvalid ||
    isDownloadExportLimitInvalid ||
    isDownloadSizeNegative ||
    isAttributesLimitNegative ||
    saveLoading;

  const handleSave = async () => {
    if (isUploadSizeInvalid || isUploadBatchLimitInvalid || isDownloadExportLimitInvalid) {
      toast.error("Please correct the limits before saving.");
      return;
    }

    setSaveLoading(true);

    // Build Partial Payload (Only send changed values)
    const payload = {};
    const original = originalConfig.current;

    // Check Upload Changes
    if (config.uploadSize !== original?.uploadSize || config.uploadUnit !== original?.uploadUnit || config.uploadBatchLimit !== original?.uploadBatchLimit) {
      payload.uploadConfig = {};
      if (config.uploadSize !== original?.uploadSize || config.uploadUnit !== original?.uploadUnit) {
        payload.uploadConfig.maxFileSize = `${config.uploadSize} ${config.uploadUnit}`;
      }
      if (config.uploadBatchLimit !== original?.uploadBatchLimit) {
        payload.uploadConfig.batchLimit = Number(config.uploadBatchLimit) || 0;
      }
    }

    // Check Download Changes
    if (config.downloadSize !== original?.downloadSize || config.downloadUnit !== original?.downloadUnit || config.downloadBatchLimit !== original?.downloadBatchLimit) {
      payload.downloadConfig = {
        maxDownloadSize: config.downloadSize.trim() !== "" ? `${config.downloadSize} ${config.downloadUnit}` : null,
        exportLimit: Number(config.downloadBatchLimit) || 0
      };
    }

    // Check Type Changes
    if (config.attributesLimit !== original?.attributesLimit) {
      payload.typeConfig = {
        maxAttributes: Number(config.attributesLimit) || 0
      };
    }

    // If nothing changed, don't even make the API call
    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected.");
      setSaveLoading(false);
      return;
    }

    try {
      await axios.patch(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/updateConfig`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );
      toast.success("Configurations updated successfully!");
      originalConfig.current = config; // Update original to current for next save
    } catch (error) {
      console.error("Failed to update configuration:", error);
      const errorMessage = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || "Failed to save configurations.";
      toast.error(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <StyledPageContainer>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
        <Box>
          <Typography variant="h5" fontWeight="700" color="primary" sx={{ letterSpacing: "-0.01em", mb: 0.5 }}>
            System Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Platform Limits and Configurations.
          </Typography>
        </Box>

        {loading && <CircularProgress size={24} />}
      </Box>

      <Grid container spacing={3.5}>
        <AnimatePresence>
          <ConfigurationSection key="static-upload" title="Upload Configuration" icon={UploadIcon} color1="#3b82f6" color2="#2dd4bf">
            <Box>
              <Typography variant="subtitle2" fontWeight="600" color="text.secondary" mb={1}>Max File Size</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={config.uploadSize}
                  onChange={handleChange("uploadSize")}
                  error={isUploadSizeInvalid}
                  helperText={
                    isUploadSizeNegative
                      ? "Value cannot be negative"
                      : isUploadSizeEmpty
                        ? "Value cannot be empty"
                        : isUploadSizeInvalid ? "Cannot exceed 1 GB" : ""
                  }
                  inputProps={{ min: 0 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select value={config.uploadUnit} onChange={handleChange("uploadUnit")} sx={{ borderRadius: "12px" }} displayEmpty>
                    <MenuItem value="" disabled>Select</MenuItem>
                    <MenuItem value="KB">KB</MenuItem>
                    <MenuItem value="MB">MB</MenuItem>
                    <MenuItem value="GB">GB</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="600" color="text.secondary" mb={1}>Batch Limit</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={config.uploadBatchLimit}
                onChange={handleChange("uploadBatchLimit")}
                error={isUploadBatchLimitInvalid}
                helperText={
                  isUploadBatchLimitNegative
                    ? "Value cannot be negative"
                    : isUploadBatchLimitInvalid ? "Maximum limit is 30" : ""
                }
                inputProps={{ min: 0 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Box>
          </ConfigurationSection>

          <ConfigurationSection key="static-download" title="Download Configuration" icon={DownloadIcon} color1="#8b5cf6" color2="#d946ef">
            <Box>
              <Typography variant="subtitle2" fontWeight="600" color="text.secondary" mb={1}>Max Download Size</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={config.downloadSize}
                  onChange={handleChange("downloadSize")}
                  error={isDownloadSizeNegative}
                  helperText={isDownloadSizeNegative ? "Value cannot be negative" : ""}
                  inputProps={{ min: 0 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select value={config.downloadUnit} onChange={handleChange("downloadUnit")} sx={{ borderRadius: "12px" }} displayEmpty>
                    <MenuItem value="" disabled>Select</MenuItem>
                    <MenuItem value="KB">KB</MenuItem>
                    <MenuItem value="MB">MB</MenuItem>
                    <MenuItem value="GB">GB</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="600" color="text.secondary" mb={1}>Export Limit</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={config.downloadBatchLimit}
                onChange={handleChange("downloadBatchLimit")}
                error={isDownloadExportLimitInvalid}
                helperText={
                  isDownloadExportLimitNegative
                    ? "Value cannot be negative"
                    : isDownloadExportLimitInvalid ? "Maximum limit is 10" : ""
                }
                inputProps={{ min: 0 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Box>
          </ConfigurationSection>

          <ConfigurationSection key="static-attributes" title="Attribute Constraints" icon={AttributeIcon} color1="#f59e0b" color2="#ef4444">
            <Box>
              <Typography variant="subtitle2" fontWeight="600" color="text.secondary" mb={1}>Max Attributes per Type</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={config.attributesLimit}
                onChange={handleChange("attributesLimit")}
                error={isAttributesLimitNegative}
                helperText={isAttributesLimitNegative ? "Value cannot be negative" : ""}
                inputProps={{ min: 0 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Box>
          </ConfigurationSection>
        </AnimatePresence>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 6, mb: 4 }}>
        <motion.div whileHover={!isSaveDisabled ? { scale: 1.05 } : {}}>
          <ActionButton
            color1="#2563eb"
            color2="#1d4ed8"
            startIcon={saveLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : <SaveIcon sx={{ fontSize: 20 }} />}
            onClick={handleSave}
            disabled={isSaveDisabled}
            sx={{ px: 6, py: 1.2 }}
          >
            {saveLoading ? "Saving..." : "Save Changes"}
          </ActionButton>
        </motion.div>
      </Box>
    </StyledPageContainer>
  );
};

export default Configuration;
