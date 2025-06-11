import React, { useState } from "react";
import { Person } from "@mui/icons-material";
import {
  DialogTitle,
  Typography,
  List,
  ListItem,
  Box,
  Button,
  Checkbox,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Avatar,
} from "@mui/material";

const Migration = ({ handleClos, rowData, rows, onMigrationComplete }) => {
  console.log("rowData", rowData);
  console.log("rrrr", rows);
  const [selectedStorage, setSelectedStorage] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  const selectedIds = rowData.map((u) => u.id);

  const getAvailableStorageMB = (user) => {
    const manage =
      parseFloat(
        user.permissions?.allowedStorageInBytesDisplay?.replace(/[^0-9.]/g, "")
      ) || 0;
    const used =
      parseFloat(user.permissions?.displayStorage?.replace(/[^0-9.]/g, "")) ||
      0;
    const isGB = user.permissions?.allowedStorageInBytesDisplay
      ?.toLowerCase()
      .includes("gb");
    const manageMB = isGB ? manage * 1024 : manage;
    return manageMB - used;
  };

  const totalStorage = rows.reduce((acc, curr) => {
    if (selectedStorage[curr.id]) {
      const val = parseFloat(
        curr.permissions?.allowedStorageInBytesDisplay?.replace(/[^0-9.]/g, "")
      );
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0);

  const totalDataStorage = rows.reduce((acc, curr) => {
    if (selectedIds.includes(curr.id)) {
      const val = parseFloat(
        curr.permissions?.displayStorage?.replace(/[^0-9.]/g, "")
      );
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0);
  console.log("dataaaa", totalDataStorage);

  const availableStorageMB = selectedUser
    ? getAvailableStorageMB(selectedUser)
    : 0;
  // const isError = selectedUser && totalDataStorage > availableStorageMB;
  const anyStorageSelected = Object.values(selectedStorage).some(Boolean);
  const isError =
    selectedUser &&
    !anyStorageSelected &&
    totalDataStorage > availableStorageMB;

  const handleStorageCheckboxChange = (userId) => {
    setSelectedStorage((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleMigrate = () => {
    if (!selectedUser) return;

    let dataToMigrate = 0;
    let storageToMigrate = 0;

    rows.forEach((user) => {
      if (selectedIds.includes(user.id)) {
        const data =
          parseFloat(
            user.permissions?.displayStorage?.replace(/[^0-9.]/g, "")
          ) || 0;
        dataToMigrate += data;

        if (selectedStorage[user.id]) {
          const storage =
            parseFloat(
              user.permissions?.allowedStorageInBytesDisplay?.replace(
                /[^0-9.]/g,
                ""
              )
            ) || 0;
          const isGB = user.permissions?.allowedStorageInBytesDisplay
            ?.toLowerCase()
            .includes("gb");
          storageToMigrate += isGB ? storage * 1024 : storage;
        }
      }
    });

    const updatedRows = rows.map((user) => {
      if (user.id === selectedUser.id) {
        const currentUsed =
          parseFloat(
            user.permissions?.displayStorage?.replace(/[^0-9.]/g, "")
          ) || 0;
        const currentManage =
          parseFloat(
            user.permissions?.allowedStorageInBytesDisplay?.replace(
              /[^0-9.]/g,
              ""
            )
          ) || 0;
        const isGB = user.permissions?.allowedStorageInBytesDisplay
          ?.toLowerCase()
          .includes("gb");
        const manageInMB = isGB ? currentManage * 1024 : currentManage;

        const newUsed = currentUsed + dataToMigrate;
        const newManage = manageInMB + storageToMigrate;

        const updatedManageDisplay =
          newManage >= 1024
            ? `${(newManage / 1024).toFixed(2)} GB`
            : `${newManage.toFixed(2)} MB`;

        return {
          ...user,
          permissions: {
            ...user.permissions,
            displayStorage: `${newUsed.toFixed(2)} MB`,
            allowedStorageInBytesDisplay: updatedManageDisplay,
          },
        };
      }

      if (selectedIds.includes(user.id)) {
        return {
          ...user,
          permissions: {
            ...user.permissions,
            displayStorage: "0 MB",
            allowedStorageInBytesDisplay: "0 MB",
          },
        };
      }

      return user;
    });

    const updatedTarget = updatedRows.find((u) => u.id === selectedUser.id);
    setSelectedUser(updatedTarget);
    onMigrationComplete(updatedRows);
    setSelectedStorage({});
    alert("Migration completed.");
  };

  const userOptions = rows.filter((user) => !selectedIds.includes(user.id));

  return (
    <Box>
      <DialogTitle sx={{ p: 1, backgroundColor: "primary.main" }}>
        <Box sx={{ p: 2, backgroundColor: "primary.main", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle2" color="#ffff">
              Total Data to Migrate: {totalDataStorage.toFixed(2)} MB
            </Typography>
            <Typography variant="subtitle2" color="#ffff">
              Total Storage to Migrate: {totalStorage.toFixed(2)} GB
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: 0 }} dividers>
        <List>
          {rows
            .filter((row) => selectedIds.includes(row.id))
            .map((row) => (
              <ListItem key={row.id}>
                <Box
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
                    {row.name}
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
                      {row.permissions?.displayStorage || "0 MB"}
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
                      {row.permissions?.allowedStorageInBytesDisplay || "N/A"}
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
            getOptionLabel={(option) => option?.name || ""}
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
                  <Typography variant="caption" color="text.secondary">
                    Available Storage:{" "}
                    {getAvailableStorageMB(option).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{ width: "300px" }}
                label="Select Target User"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
          {isError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              Can't be migrated: not enough memory, please increase storage.
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="text" onClick={handleClos}>
            Cancel
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={!selectedUser || isError}
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
          >
            Migrate
          </Button>
        </Box>
      </DialogActions>
    </Box>
  );
};

export default Migration;
