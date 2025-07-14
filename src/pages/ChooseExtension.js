import React, { useState } from "react";
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
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

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
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newExtension, setNewExtension] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);
  const [globalFileSize, setGlobalFileSize] = useState("");
  const [globalFileSizeUnit, setGlobalFileSizeUnit] = useState("MB");
  const [fileBatchSize, setFileBatchSize] = useState("");

  const handleSaveGlobalSize = () => {
    const limit = `${globalFileSize} ${globalFileSizeUnit}`;
    console.log("Global File Size Saved:", limit);

    // Example API payload
    // await saveGlobalFileSizeLimitAPI({ limitValue: globalFileSize, unit: globalFileSizeUnit });
  };

  const handleSaveBatchSize = () => {
    console.log("File Batch Size Saved:", fileBatchSize);

    // Example API call
    // await saveBatchSizeAPI({ batchSize: fileBatchSize });
  };

  const isGroupFullySelected = (groupValues) =>
    groupValues.every((ext) => selectedExtensions.includes(ext));

  const handleToggleGroup = (groupValues, checked) => {
    setSelectedExtensions((prev) => {
      if (checked) {
        const toAdd = groupValues.filter((ext) => !prev.includes(ext));
        return [...prev, ...toAdd];
      } else {
        return prev.filter((ext) => !groupValues.includes(ext));
      }
    });
  };

  const handleToggle = (ext) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    );
  };

  const handleSave = () => {
    console.log("Saved Extensions:", selectedExtensions);
  };

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
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        height: "100vh",
        pt: 2,
        px: 2,
        backgroundColor: "#f9f9f9",
        ml: "130px", // shift entire layout if sidebar is fixed
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 0,
          borderRadius: 2,
          maxWidth: "1200px",
          width: "70%",
          height: "85vh",
          overflow: "hidden",
          mr: 3, // spacing between panels
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            // px: 4,
            py: 0,
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "#1976d2", // MUI blue
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              py: 1.5,
              px: 2,
              mb: 2,
              borderRadius: "4px 4px 0 0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              Select File Extensions
            </Typography>
          </Box>

          {EXTENSION_GROUPS.map((group) => (
            <Box key={group.label} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  px: 1,
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

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, px: 1 }}>
                {group.values.map((ext) => (
                  <FormControlLabel
                    key={ext}
                    control={
                      <Checkbox
                        checked={selectedExtensions.includes(ext)}
                        onChange={() => handleToggle(ext)}
                      />
                    }
                    label={ext}
                  />
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

          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "#fff",
              boxShadow: "0px -2px 4px rgba(0,0,0,0.05)",
              pt: 2,
              pb: 2,
              borderTop: "1px solid #ddd",
              display: "flex",
              justifyContent: "flex-start",
              gap: 4,
              zIndex: 10,
              px: 1,
            }}
          >
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={selectedExtensions.length === 0}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          width: "30%",
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Settings
        </Typography>

        {/* Global File Size Limit */}
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
            variant="contained"
            onClick={handleSaveGlobalSize}
            disabled={!globalFileSize}
            sx={{ mt: 2 }}
          >
            Save Limit
          </Button>
        </Box>

        {/* File Batch Size */}
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
            variant="contained"
            onClick={handleSaveBatchSize}
            disabled={!fileBatchSize}
            sx={{ mt: 2 }}
          >
            Save Batch Size
          </Button>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2", // Material UI blue
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
    </Box>
  );
};

export default ChooseExtension;
