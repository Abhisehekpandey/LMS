import React, { useState } from "react";
import { Person } from "@mui/icons-material";
import {
  DialogTitle,
  Typography,
  List,
  ListItem,
  Box,
  Divider,
  Button,
  Checkbox,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Avatar,
} from "@mui/material";

const Migration = ({ handleClos, rowData, rows }) => {
  const [selectedStorage, setSelectedStorage] = useState({});

  const handleStorageCheckboxChange = (userId) => {
    setSelectedStorage((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const totalStorage = rowData.reduce((acc, curr) => {
    if (selectedStorage[curr.id]) {
      const num = parseFloat(curr.manageStorage);
      return acc + (isNaN(num) ? 0 : num);
    }
    return acc;
  }, 0);

  const totalDataStorage = rowData.reduce((acc, curr) => {
    const num = parseFloat(curr.storageUsed); // extracts 10 from "10GB"
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const userOptions = rows.filter(
    (user) => !rowData.some((selected) => selected.id === user.id)
  );

  const requiredStorage = 10; // Example: Required is 10GB

  const [selectedUser, setSelectedUser] = useState(null);

  const getAvailable = (user) =>
    parseFloat(user?.availableStorage?.replace("GB", "")) || 0;

  const isError = selectedUser && getAvailable(selectedUser) < requiredStorage;

  return (
    <Box>
      <DialogTitle sx={{ p: 1, backgroundColor: "primary.main" }}>
        <Box sx={{ p: 2, backgroundColor: "primary.main", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle2" color="#ffff">
              Total Data to Migrate: {totalDataStorage} MB
            </Typography>
            <Typography variant="subtitle2" color="#ffff">
              Total Storage to Migrate: {totalStorage} GB
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: "0" }} dividers>
        <List>
          {rowData.map((row, index) => (
            <ListItem key={index}>
              <Box
                key={index}
                sx={{
                  p: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  width: "inherit",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#1976d2", minWidth: "200px" }}
                >
                  {row.userName}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox {...label} disabled checked />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.813rem", color: "#666", mr: 1 }}
                  >
                    Data
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#2e7d32", fontWeight: 500 }}
                  >
                    {row.storageUsed}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    {...label}
                    checked={!!selectedStorage[row.id]}
                    onChange={() => handleStorageCheckboxChange(row.id)}
                  />

                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.813rem", color: "#666", mr: 1 }}
                  >
                    Storage
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#2e7d32", fontWeight: 500 }}
                  >
                    {row.manageStorage}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Autocomplete
            fullWidth
            options={userOptions}
            getOptionLabel={(option) => option?.name || ""} // <-- use userName here
            value={selectedUser}
            sx={{ width: "300px" }}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                  <Person fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>

                  {/* <Typography variant="caption" color="text.secondary">
                    Available Storage:{" "}
                    {(() => {
                      const manage =
                        parseFloat(
                          option.manageStorage?.replace(/[^0-9.]/g, "")
                        ) || 0;
                      const used =
                        parseFloat(
                          option.storageUsed?.replace(/[^0-9.]/g, "")
                        ) || 0;


                      const isManageInGB = option.manageStorage
                        ?.toLowerCase()
                        .includes("gb");
                      const isUsedInGB = option.storageUsed
                        ?.toLowerCase()
                        .includes("gb");

                      
                      const manageMB = isManageInGB ? manage * 1024 : manage;
                      const usedMB = isUsedInGB ? used * 1024 : used;

                    

                      const available = manageMB - usedMB;

                      return `${available.toFixed(2)} MB`;
                    })()}
                  </Typography> */}

<Typography variant="caption" color="text.secondary">
  Available Storage: {
    (() => {
      const manage = parseFloat(option.manageStorage?.replace(/[^0-9.]/g, "")) || 0;
      const used = parseFloat(option.storageUsed?.replace(/[^0-9.]/g, "")) || 0;

      const isManageInGB = option.manageStorage?.toLowerCase().includes("gb");

      const manageMB = isManageInGB ? manage * 1024 : manage;
      const usedMB = used; // already in MB

      const available = manageMB - usedMB;

      return `${available.toFixed(2)} MB`;
    })()
  }
</Typography>

                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{ width: "300px" }} // also fixed typo: no space in "200px"
                label="Select Target User"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="text" onClick={handleClos}>
            Cancel
          </Button>
          <Button
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgb(251, 68, 36)",
                color: "white",
              },
            }}
            variant="contained"
            color="primary"
            disabled={!selectedUser} // disabled when no user selected
          >
            Migrate
          </Button>
        </Box>
      </DialogActions>
    </Box>
  );
};

export default Migration;
