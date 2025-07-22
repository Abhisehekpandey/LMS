import React, { useState, useEffect } from "react";
import { TableSortLabel } from "@mui/material";

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
import { Add } from "@mui/icons-material";
import axios from "axios";

// const DataDictionary = () => {
const DataDictionary = ({ searchResults = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const fetchDataDictionary = async () => {
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/getAllDictionary`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        }
      );
      console.log("responseDictionary", response);

      const fetchedData = (response.data.data || []).map((item) => ({
        ...item,
        applicableTo: item.applicatbleTo || "All", // Normalize here
      }));

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
            username: `${sessionStorage.getItem("adminEmail")}`,
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
            username: `${sessionStorage.getItem("adminEmail")}`,
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

  const handleSave = async () => {
    console.log("newEntry", newEntry);
    if (!newEntry.key || !newEntry.value || !newEntry.applicableTo) return;

    const payload = {
      id: isEditing ? newEntry.id : undefined, // required for update
      key: newEntry.key,
      value: newEntry.value,
      applicatbleTo:
        newEntry.applicableTo?.charAt(0).toUpperCase() +
        newEntry.applicableTo?.slice(1),
      usernames: newEntry.selectedUsers?.map((u) => u.name) || [],
      deptNames: newEntry.selectedDepartments?.map((d) => d.deptName) || [],
    };

    try {
      if (isEditing) {
        await axios.put(
          `${window.__ENV__.REACT_APP_ROUTE}/tenants/updateDictionary`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: `${sessionStorage.getItem("adminEmail")}`,
            },
          }
        );
        const updated = [...data];
        updated[editIndex] = newEntry;
        setData(updated);
      } else {
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

  const filteredRows =
    Array.isArray(searchResults) && searchResults.length > 0
      ? searchResults
      : Array.isArray(data)
      ? data
      : [];

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key]?.toString().toLowerCase() ?? "";
    const bVal = b[sortConfig.key]?.toString().toLowerCase() ?? "";

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedRows = sortedRows.slice(
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
    const applicable = entry.applicableTo?.toLowerCase(); // <-- now this works

    if (applicable === "user") {
      return "User";
    } else if (applicable === "department") {
      return "Department";
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
                // sx={{
                //   backgroundColor: "#1976d2",
                // }}
                sx={{
                  height: 36, // ⬅️ reduce row height
                  backgroundColor: "#1976d2",
                  "& td": {
                    padding: "6px 8px", // ⬅️ reduce cell padding
                  },
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
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                  align="center"
                  sortDirection={
                    sortConfig.key === "id" ? sortConfig.direction : false
                  }
                >
                  <TableSortLabel
                    active={sortConfig.key === "id"}
                    direction={
                      sortConfig.key === "id" ? sortConfig.direction : "asc"
                    }
                    onClick={() => handleSort("id")}
                  >
                    S.No
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                  align="center"
                  sortDirection={
                    sortConfig.key === "key" ? sortConfig.direction : false
                  }
                >
                  <TableSortLabel
                    active={sortConfig.key === "key"}
                    direction={
                      sortConfig.key === "key" ? sortConfig.direction : "asc"
                    }
                    onClick={() => handleSort("key")}
                  >
                    KEY
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                  align="center"
                  sortDirection={
                    sortConfig.key === "value" ? sortConfig.direction : false
                  }
                >
                  <TableSortLabel
                    active={sortConfig.key === "value"}
                    direction={
                      sortConfig.key === "value" ? sortConfig.direction : "asc"
                    }
                    onClick={() => handleSort("value")}
                  >
                    VALUE
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  }}
                  align="center"
                  sortDirection={
                    sortConfig.key === "applicableTo"
                      ? sortConfig.direction
                      : false
                  }
                >
                  <TableSortLabel
                    active={sortConfig.key === "applicableTo"}
                    direction={
                      sortConfig.key === "applicableTo"
                        ? sortConfig.direction
                        : "asc"
                    }
                    onClick={() => handleSort("applicableTo")}
                  >
                    APPLICABLE TO
                  </TableSortLabel>
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
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditRow(row, globalIndex)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            setDeleteDialogOpen(true);
                            setDeleteTarget(row); // Save full row so we have access to its ID
                          }}
                        >
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
          rowsPerPageOptions={[10, 15]}
          // component="div"
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
              justifyContent: "flex-start", // ✅ Aligns pagination to the left
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.main", // MUI blue
            color: "white",
            fontWeight: "bold",
          }}
        >
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{deleteTarget?.key}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              try {
                await axios.delete(
                  `${window.__ENV__.REACT_APP_ROUTE}/tenants/deleteDictionary/${deleteTarget?.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "authToken"
                      )}`,
                    },
                  }
                );
                setData((prev) =>
                  prev.filter((item) => item.id !== deleteTarget?.id)
                );
                setSnackbarOpen(true);
              } catch (err) {
                console.error("Delete failed", err);
              } finally {
                setDeleteDialogOpen(false);
              }
            }}
            variant="contained"
            color="error"
          >
            Confirm
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
            bottom: 20,
            right: 38,
            backgroundColor: "primary.main",
            color: "#fff",
            boxShadow: 3,
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            bgcolor: "orange", // Solid orange background color
            color: "white",
            boxShadow:
              "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
            "&:hover": {
              backgroundColor: "orange", // Keep the background color on hover
              animation: "glowBorder 1.5s ease-in-out infinite", // Apply glowing animation on hover
            },
            "@keyframes glowBorder": {
              "0%": {
                boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)", // Start with soft glow
                borderColor: "transparent", // Initial transparent border
              },
              "50%": {
                boxShadow: "0 0 20px 5px rgba(251, 68, 36, 0.8)", // Stronger glow
                borderColor: "rgb(251, 68, 36)", // Glowing orange border
              },
              "100%": {
                boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)", // Glow fades out
                borderColor: "transparent", // Reset to transparent
              },
            },
          }}
        >
          <Add fontSize="medium" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DataDictionary;
