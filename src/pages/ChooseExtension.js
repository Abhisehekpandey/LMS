import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Tooltip,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const EXTENSION_GROUPS = [
  {
    label: "Documents",
    values: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "txt",
      "rtf",
      "ppt",
      "pptx",
      "xml",
      "json",
    ],
  },
  { label: "Archives", values: ["zip", "rar", "7z", "tar", "gz"] },
  {
    label: "Images",
    values: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg"],
  },
  {
    label: "Audio",
    values: ["mp3", "aac", "ogg", "m4a", "wav", "flac", "wma"],
  },
  {
    label: "Video",
    values: ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "3gp"],
  },
];

const ChooseExtension = () => {
  const [preCheckedExtensions, setPreCheckedExtensions] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // or 'error'
  });

  const theme = useTheme();
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newExtension, setNewExtension] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);
  const [globalFileSize, setGlobalFileSize] = useState("");
  const [globalFileSizeUnit, setGlobalFileSizeUnit] = useState("MB");
  const [fileBatchSize, setFileBatchSize] = useState("");


  const handleSaveGlobalSize = async () => {
    const limit = `${globalFileSize}${globalFileSizeUnit}`; // e.g., "30MB"

    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/addFileLimit`,
        {}, // empty body as per updated curl
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
            fileSize: limit, // ✅ sent in header
          },
        
        }
      );

      console.log("Global File Size Limit Saved:", response.data);
      setSnackbar({
        open: true,
        message: "Global file size limit saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to save file size limit:", error);
      setSnackbar({
        open: true,
        message: "Failed to save global file size limit.",
        severity: "error",
      });
    }
  };


 
  const handleSaveBatchSize = async () => {
    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/addBatchLimit`,
        { batchSizeLimit: parseInt(fileBatchSize, 10) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        }
      );

      console.log("File Batch Size Saved:", response.data);
      setSnackbar({
        open: true,
        message: "File batch size saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to save file batch size:", error);
      setSnackbar({
        open: true,
        message: "Failed to save file batch size.",
        severity: "error",
      });
    }
  };


  const isGroupFullySelected = (groupValues) =>
    groupValues.every((ext) => selectedExtensions.includes(ext));

  const handleToggleGroup = (groupValues, checked) => {
    setSelectedExtensions((prev) => {
      return checked
        ? [...prev, ...groupValues.filter((ext) => !prev.includes(ext))]
        : prev.filter((ext) => !groupValues.includes(ext));
    });
  };

  const handleToggle = (ext) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    );
  };

  const handleSave = async () => {
    const payload = {
      documents: [],
      archives: [],
      images: [],
      audio: [],
      video: [],
    };

    console.log(">>pay",payload)

   EXTENSION_GROUPS.forEach((group) => {
     const key = group.label.toLowerCase(); // 'Documents' -> 'documents'
     payload[key] = group.values.filter((ext) =>
       selectedExtensions.includes(ext)
     );
   });

    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/addExtensions`, // 🔁 Replace with actual endpoint
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        }
      );
      console.log("Extensions saved successfully:", response.data);
       setSelectedExtensions([]);
      setSnackbar({
        open: true,
        message: "Extensions saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving extensions:", error);
      setSnackbar({
        open: true,
        message: "Failed to save extensions. Please try again.",
        severity: "error",
      });
    }
  };

    useEffect(() => {
    const fetchAllowedExtensions = async () => {
      try {
        const response = await axios.get(
          `${window.__ENV__.REACT_APP_ROUTE}/tenants/getExtensionsAllowed`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: `${sessionStorage.getItem("adminEmail")}`,
            },
          }
        );

        const data = response.data;
        console.log("Extension response", data);

        const allPreChecked = Object.values(data).flat();
        setSelectedExtensions(allPreChecked);
        setPreCheckedExtensions(allPreChecked);

        // Add new extensions (not defined in EXTENSION_GROUPS)
        const knownExtensions = EXTENSION_GROUPS.flatMap(
          (group) => group.values
        );
        const newExtensionsMap = {};

        Object.entries(data).forEach(([category, extArray]) => {
          const groupLabel =
            category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(); // e.g., "documents" -> "Documents"

          extArray.forEach((ext) => {
            if (!knownExtensions.includes(ext)) {
              if (!newExtensionsMap[groupLabel]) {
                newExtensionsMap[groupLabel] = [];
              }
              newExtensionsMap[groupLabel].push(ext);
            }
          });
        });

        // Add new extensions to appropriate EXTENSION_GROUPS
        EXTENSION_GROUPS.forEach((group) => {
          const newExts = newExtensionsMap[group.label];
          if (newExts && newExts.length) {
            newExts.forEach((ext) => {
              if (!group.values.includes(ext)) {
                group.values.push(ext); // mutate in-place to reflect in UI
              }
            });
          }
        });
      } catch (error) {
        console.error("Failed to fetch allowed extensions:", error);
      }
    };

    fetchAllowedExtensions();
  }, []);



  const handleAddClick = (groupLabel) => {
    setActiveGroup(groupLabel);
    setNewExtension("");
    setOpenDialog(true);
  };

  const handleAddExtension = () => {
    if (!newExtension || !activeGroup) return;

    EXTENSION_GROUPS.forEach((group) => {
      if (
        group.label === activeGroup &&
        !group.values.includes(newExtension.toLowerCase())
      ) {
        group.values.push(newExtension.toLowerCase());
      }
    });

    setOpenDialog(false);
  };

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        height: "100vh",
        mt: "10px",
        pt: 2,
        px: 2,

        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#121212" : "#f9f9f9", // custom background
        color: (theme) => theme.palette.text.primary,
        ml: "90px",
        gap: 3,
      })}
    >
      <Paper
        elevation={2}
        sx={(theme) => ({
          borderRadius: 2,
          width: "70%",
          height: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#fff",
        })}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main,
            color: (theme) => theme.palette.primary.contrastText,
            px: 2,
            py: 1.5,
            borderRadius: "4px 4px 0 0",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Select File Extensions
          </Typography>
        </Box>

        <Box
          sx={(theme) => ({
            flexGrow: 1,
            overflowY: "auto",
            py: 2,
            px: 2,
            color: theme.palette.text.primary,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "3px",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
          })}
        >
          {EXTENSION_GROUPS.map((group) => (
            <Box key={group.label} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {group.label}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isGroupFullySelected(group.values)}
                      indeterminate={
                        group.values.some((ext) =>
                          selectedExtensions.includes(ext)
                        ) && !isGroupFullySelected(group.values)
                      }
                      onChange={(e) =>
                        handleToggleGroup(group.values, e.target.checked)
                      }
                    />
                  }
                  label="Select All"
                />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {group.values.map((ext) => (
                  
                  <Tooltip
                    title={
                      preCheckedExtensions.includes(ext) ? "Already added" : ""
                    }
                    arrow
                  >
                    <FormControlLabel
                      key={ext}
                      control={
                        <Checkbox
                          checked={selectedExtensions.includes(ext)}
                          onChange={() => handleToggle(ext)}
                          disabled={false} // optionally disable editing of pre-checked
                        />
                      }
                      label={ext}
                    />
                  </Tooltip>
                ))}
                <Tooltip title="Add Extension" arrow>
                  <AddCircleOutlineIcon
                    sx={{ cursor: "pointer", mt: 1 }}
                    onClick={() => handleAddClick(group.label)}
                    color="primary"
                  />
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.default
                : "#fff",
            borderTop: `1px solid ${
              theme.palette.mode === "dark" ? "#333" : "#ddd"
            }`,
            px: 2,
            py: 2,
            boxShadow: "0px -2px 4px rgba(0,0,0,0.05)",
          })}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={selectedExtensions.length === 0}
          >
            Save
          </Button>
          <Typography variant="caption" sx={{ ml: 2 }} color="text.secondary">
            {selectedExtensions.length} extension(s) selected
          </Typography>
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          width: "30%",
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main,
            color: (theme) => theme.palette.primary.contrastText,
            px: 2,
            py: 1.5,
            borderRadius: "4px 4px 0 0",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SettingsIcon sx={{ fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Settings
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Global File Size Limit
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                type="number"
                label="File Size"
                size="small"
                value={globalFileSize}
                onChange={(e) => setGlobalFileSize(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                fullWidth
              />
              <TextField
                select
                label="Unit"
                value={globalFileSizeUnit}
                size="small"
                onChange={(e) => setGlobalFileSizeUnit(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ minWidth: 100 }}
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </TextField>
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveGlobalSize}
              disabled={!globalFileSize}
              sx={{ mt: 2 }}
            >
              Save Limit
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              File Batch Size
            </Typography>
            <TextField
              type="number"
              label="Batch Size"
              size="small"
              value={fileBatchSize}
              onChange={(e) => setFileBatchSize(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSaveBatchSize}
              disabled={!fileBatchSize}
              sx={{ mt: 2 }}
            >
              Save Batch Size
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Add Extension to {activeGroup}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Extension"
            fullWidth
            size="small"
            value={newExtension}
            onChange={(e) => setNewExtension(e.target.value.trim())}
            helperText="Enter file extension without dot (e.g., mp5)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddExtension}
            variant="contained"
            disabled={!newExtension}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
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
    </Box>
  );
};

export default ChooseExtension;
