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
import React, { useState } from "react";

const Migration = ({ handleClose, rowData }) => {
  const totalStorage = rowData.reduce((acc, curr) => {
    const num = parseFloat(curr.storageUsed); // extracts 10 from "10GB"
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const totalManageStorage = rowData.reduce((acc, curr) => {
    const num = parseFloat(curr.manageStorage); // extracts 10 from "10GB"
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const options = ['The Godfather', 'Pulp Fiction'];

  const userOptions = [
    { id: 1, userName: "Satyam Aggrawal", availableStorage: "9GB" },
    { id: 2, userName: "Abhishek Pandey", availableStorage: "9GB" },
  ];
  
  const requiredStorage = 10; // Example: Required is 10GB
  
    const [selectedUser, setSelectedUser] = useState(null);
  
    const getAvailable = (user) =>
      parseFloat(user?.availableStorage?.replace("GB", "")) || 0;
  
    const isError =
      selectedUser && getAvailable(selectedUser) < requiredStorage;
  

  return (
    <Box>
      {/* Header */}
      <DialogTitle sx={{ p: 1 }}>
        <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Data to Migrate: {totalStorage} GB
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Total Storage to Migrate: {totalManageStorage} GB
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      {/* Migrating Rows List */}
      <DialogContent sx={{ padding: "0" }} dividers>
        <List>
          {rowData.map((row, index) => (
            <ListItem key={index}>
              {/* <Typography variant="body2" color="text.primary">
              {row.userName} — Data: {row.storageUsed} — Storage: {row.manageStorage}
            </Typography> */}

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
                    {totalStorage} GB
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox {...label} />
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
                    {totalManageStorage} GB
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      {/* Target user dropdown (for now just a box, you can replace with Select) */}
      {/* <Box sx={{ p: 2, border: "1px solid red", borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="error">
          Satyam Aggrawal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Available Storage: 9GB
        </Typography>
      </Box> */}

      {/* Error message */}
      {/* <Typography variant="caption" color="error" sx={{ px: 2 }}>
        Target user doesn't have enough available storage. Available: 9GB, Required: {totalStorage}GB
      </Typography> */}

      {/* Buttons */}
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
        getOptionLabel={(option) => option.name}
        value={selectedUser}
        onChange={(event, newValue) => setSelectedUser(newValue)}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
              <Person fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2">{option.userName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Available Storage: {option.availableStorage}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            sx={{width:'200 px'}}
            label="Select Target User"
            error={isError}
            helperText={
              isError
                ? `Target user doesn't have enough available storage. Available: ${selectedUser.availableStorage}, Required: ${requiredStorage}GB`
                : ""
            }
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" disabled>
            Migrate
          </Button>
        </Box>
      </DialogActions>
    </Box>
  );
};

export default Migration;
