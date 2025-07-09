import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
} from "@mui/material";

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
  { label: "Archives", values: ["zip", "rar", "7z", "tar", "gz"] },
];

const ChooseExtension = () => {
  const [selectedExtensions, setSelectedExtensions] = useState([]);

  const handleToggle = (ext) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    );
  };

  const handleSave = () => {
    console.log("Saved Extensions:", selectedExtensions);
    // Save to localStorage or send to backend here
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        // minHeight: "100vh",
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
          p: 0, // remove padding here — apply inside child
          borderRadius: 2,
          maxWidth: "1200px",
          width: "100%",
          height: "85vh",
          overflow: "hidden", // Paper should not scroll
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
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)", // subtle shadow to cover below

              py: 0,
              px: 0, // ✅ ensures consistent left/right padding
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {group.label}
              </Typography>
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
              </Box>
            </Box>
          ))}

          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "#fff",
              boxShadow: "0px -2px 4px rgba(0,0,0,0.05)", // top shadow instead
              pt: 2,
              pb: 2,
              borderTop: "1px solid #ddd",
              display: "flex",
              justifyContent: "flex-start",
              gap: 4,
              zIndex: 10,
            }}
          >
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedExtensions([])}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChooseExtension;
