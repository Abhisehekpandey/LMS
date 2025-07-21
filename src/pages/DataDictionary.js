import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  TextField,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Autocomplete,
  Chip,
  Checkbox, // ✅ ADD THIS LINE
} from "@mui/material";

import {
  AddCircle as AddCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";

// const DataDictionary = () => {
const DataDictionary = ({ searchResults = [] }) => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    key: "",
    value: "",
    applicableTo: "",
    selectedUsers: [],
    selectedDepartments: [],
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [deptPage, setDeptPage] = useState(0);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const fetchDataDictionary = async () => {
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/getAllDictionary`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      const fetchedData = response.data || [];
      setData(fetchedData);
    } catch (error) {
      console.error("Failed to fetch data dictionary:", error);
    }
  };


  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedRows.map(
        (_, index) => page * rowsPerPage + index
      );
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const fetchUsers = async (page = 0) => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/users`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            pageNumber: page.toString(),
          },
        }
      );
      const newUsers = response.data?.content || [];
      setUsers((prev) => [...prev, ...newUsers]);
      setLoadingUsers(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setLoadingUsers(false);
    }
  };

  const fetchDepartments = async (page = 0) => {
    try {
      setLoadingDepts(true);
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          params: {
            search: "",
            pageNumber: page,
            pageSize: 10,
          },
        }
      );
      const newDepts = response.data?.content || [];
      setDepartments((prev) => [...prev, ...newDepts]);
      setLoadingDepts(false);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setLoadingDepts(false);
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setNewEntry({
      key: "",
      value: "",
      applicableTo: "",
      selectedUsers: [],
      selectedDepartments: [],
    });
    setUsers([]);
    setUserPage(0);
    setDepartments([]);
    setDeptPage(0);
    setOpenDialog(true);
  };

  const handleEditRow = (row, index) => {
    setIsEditing(true);
    setEditIndex(index);
    setNewEntry(row);
    setUsers([]);
    setUserPage(0);
    setDepartments([]);
    setDeptPage(0);
    setOpenDialog(true);
  };

  const handleDeleteRow = (index) => {
    // const updated = [...rows];
    const updated = [...data];
    setData(updated);
    updated.splice(index, 1);
    setRows(updated);
    setSnackbarOpen(true);
  };

  // const handleSave = async () => {
  //   if (!newEntry.key || !newEntry.value || !newEntry.applicableTo) return;

  //   const payload = {
  //     key: newEntry.key,
  //     value: newEntry.value,
  //     applicableTo: newEntry.applicableTo,
  //     selectedUsers:
  //       newEntry.selectedUsers.length > 0 ? newEntry.selectedUsers : null,
  //     selectedDepartments:
  //       newEntry.selectedDepartments.length > 0
  //         ? newEntry.selectedDepartments
  //         : null,
  //   };

  //   try {
  //     await axios.post(
  //       `${window.__ENV__.REACT_APP_ROUTE}/tenants/data-dictionary`,
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
  //         },
  //       }
  //     );
  //   } catch (err) {
  //     console.error("Failed to save entry:", err);
  //   }

  //   if (isEditing) {
  //     const updated = [...rows];
  //     updated[editIndex] = newEntry;
  //     // setRows(updated);
  //      setData(updated);
  //   } else {
  //     // setRows([newEntry, ...rows]);
  //     // setPage(0);
  //       const updatedData = [newEntry, ...data];
  //       setData(updatedData);
  //       setPage(0);
  //   }

  //   setSnackbarOpen(true);
  //   setOpenDialog(false);
  // };
const handleSave = async () => {
  if (!newEntry.key || !newEntry.value || !newEntry.applicableTo) return;

  const payload = {
    key: newEntry.key,
    value: newEntry.value,
    applicatbleTo:
      newEntry.applicableTo.charAt(0).toUpperCase() +
      newEntry.applicableTo.slice(1), // Capitalize (User/Department/All)
    usernames: newEntry.selectedUsers?.map((u) => u.username) || [],
    deptNames: newEntry.selectedDepartments?.map((d) => d.deptName) || [],
  };

  try {
    await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/addDictionary`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );

    if (isEditing) {
      const updated = [...data];
      updated[editIndex] = newEntry;
      setData(updated);
    } else {
      const updatedData = [newEntry, ...data];
      setData(updatedData);
      setPage(0);
    }

    setSnackbarOpen(true);
    setOpenDialog(false);
  } catch (err) {
    console.error("Failed to save entry:", err);
  }
};

  const filteredRows = searchResults.length > 0 ? searchResults : data;

  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    if (newEntry.applicableTo === "user" && users.length === 0) {
      fetchUsers(0);
    } else if (
      newEntry.applicableTo === "department" &&
      departments.length === 0
    ) {
      fetchDepartments(0);
    }
  }, [newEntry.applicableTo]);

  const handleUserScroll = (e) => {
    const bottom =
      e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10;
    if (bottom && !loadingUsers) {
      const nextPage = userPage + 1;
      fetchUsers(nextPage);
      setUserPage(nextPage);
    }
  };
  useEffect(() => {
    fetchDataDictionary();
  }, []);


  const handleDeptScroll = (e) => {
    const bottom =
      e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10;
    if (bottom && !loadingDepts) {
      const nextPage = deptPage + 1;
      fetchDepartments(nextPage);
      setDeptPage(nextPage);
    }
  };

  const getApplicableToText = (entry) => {
    if (entry.applicableTo === "user") {
      return entry.selectedUsers?.map((u) => u.name).join(", ") || "User";
    } else if (entry.applicableTo === "department") {
      return (
        entry.selectedDepartments?.map((d) => d.deptName).join(", ") ||
        "Department"
      );
    }
    return "All";
  };

  return (
    // <Box sx={{ p: 3, ml: "72px" }}>
    <Box sx={{ pt: 1.5, px: 3, ml: "72px" }}>
      <Paper
        elevation={20}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "20px",
          animation: "slideInFromLeft 0.3s ease-in-out forwards",
          opacity: 0,
          transform: "translateX(-50px)",
          "@keyframes slideInFromLeft": {
            "0%": {
              opacity: 0,
              transform: "translateX(-50px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateX(0)",
            },
          },
        }}
      >
        <TableContainer sx={{ maxHeight: "80vh", height: "80vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#1976d2",
                }}
              >
                <TableCell padding="checkbox" align="center">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paginatedRows.length
                    }
                    checked={
                      paginatedRows.length > 0 &&
                      selected.length === paginatedRows.length
                    }
                    onChange={handleSelectAllClick}
                    sx={{ color: "black" }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                >
                  S.No
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                >
                  KEY
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                >
                  VALUE
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                >
                  APPLICABLE TO
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((row, index) => {
                const globalIndex = page * rowsPerPage + index;
                return (
                  <TableRow
                    key={globalIndex}
                    hover
                    selected={isSelected(globalIndex)}
                    sx={{
                      height: 36, // ⬅️ reduce row height
                      "& td": {
                        padding: "6px 8px", // ⬅️ reduce cell padding
                      },
                    }}
                  >
                    <TableCell padding="checkbox" align="center">
                      <Checkbox
                        checked={isSelected(globalIndex)}
                        onChange={() => handleClick(globalIndex)}
                        size="small" // ⬅️ smaller checkbox
                      />
                    </TableCell>
                    <TableCell align="center">{globalIndex + 1}</TableCell>
                    <TableCell align="center">{row.key}</TableCell>
                    <TableCell align="center">{row.value}</TableCell>
                    <TableCell align="center">
                      {getApplicableToText(row)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            "& .MuiTablePagination-toolbar": {
              px: 2,
              py: 1,
            },
          }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          {isEditing ? "Edit Entry" : "Add Data Dictionary Entry"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Key"
            fullWidth
            value={newEntry.key}
            onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
          />
          <TextField
            label="Value"
            fullWidth
            value={newEntry.value}
            onChange={(e) =>
              setNewEntry({ ...newEntry, value: e.target.value })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Applicable To</InputLabel>
            <Select
              value={newEntry.applicableTo}
              label="Applicable To"
              onChange={(e) =>
                setNewEntry({ ...newEntry, applicableTo: e.target.value })
              }
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>

          {newEntry.applicableTo === "user" && (
            <Autocomplete
              multiple
              value={newEntry.selectedUsers}
              onChange={(e, newValue) =>
                setNewEntry({ ...newEntry, selectedUsers: newValue })
              }
              onOpen={() => {
                if (users.length === 0) fetchUsers(0);
              }}
              options={users}
              getOptionLabel={(option) => option.name || ""}
              loading={loadingUsers}
              ListboxProps={{
                onScroll: handleUserScroll,
                style: { maxHeight: 200, overflowY: "auto" },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Users"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsers ? (
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.name} {...getTagProps({ index })} />
                ))
              }
            />
          )}

          {newEntry.applicableTo === "department" && (
            <Autocomplete
              multiple
              value={newEntry.selectedDepartments}
              onChange={(e, newValue) =>
                setNewEntry({ ...newEntry, selectedDepartments: newValue })
              }
              onOpen={() => {
                if (departments.length === 0) fetchDepartments(0);
              }}
              options={departments}
              getOptionLabel={(option) => option.deptName || ""}
              loading={loadingDepts}
              ListboxProps={{
                onScroll: handleDeptScroll,
                style: { maxHeight: 200, overflowY: "auto" },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Departments"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingDepts ? (
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option.deptName} {...getTagProps({ index })} />
                ))
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Operation successful!
        </Alert>
      </Snackbar>
      <Tooltip title="Add New Entry">
        <IconButton
          onClick={handleOpenDialog}
          sx={{
            position: "fixed",
            bottom: 50,
            right: 32,
            backgroundColor: "primary.main",
            color: "#fff",
            boxShadow: 3,
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          <AddCircleIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DataDictionary;
