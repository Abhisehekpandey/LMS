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
        justifyContent: "center",
        alignItems: "flex-start",
        height: "100vh",
        margin: "0 auto",
        pt: 2,
        px: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 0,
          borderRadius: 2,
          maxWidth: "1200px",
          width: "100%",
          height: "85vh",
          overflow: "hidden",
          ml: 5,
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            px: 4,
            py: 0,
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "#fff",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              py: 0,
              px: 0,
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#00318e",
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
