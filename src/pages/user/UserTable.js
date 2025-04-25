import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  Switch,
  Tooltip,
  styled,
  Dialog,
  DialogTitle,
  Button,
  DialogContent,
  Grid,
  DialogActions,
  Typography,
  alpha,
  Autocomplete,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Add,
  Settings,
  Dashboard,
  People,
  Storage,
  FileDownload,
  WifiProtectedSetup,
  PowerSettingsNew,
  Block,
} from "@mui/icons-material";
import styles from "./user.module.css";
import DeleteUser from "./DeleteUser";
import Migration from "./Migration";

const CustomSwitch = styled(Switch)(({ theme, checked }) => ({
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "blue",
  },
  "& .MuiSwitch-switchBase + .MuiSwitch-track": {
    backgroundColor: "rgba(255, 165, 0, 0.5)",
  },
  "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": {
    color: "blue",
  },
  "& .MuiSwitch-thumb": {
    color: "orange",
  },
}));

const rows = [
  {
    userName: "User2",
    id: "2",
    name: "Name2",
    department: "Backend",
    role: "N/A",
    email: "user2@appolo.com",
    storageUsed: "10GB",
    manageStorage: "1 GB",
    status: false,
    avaliableStorage: "9 GB",
  },
  {
    userName: "User5",
    id: "5",
    name: "Name5",
    department: "Backend",
    role: "N/A",
    email: "user5@appolo.com",
    storageUsed: "10GB",
    manageStorage: "1 GB",
    status: false,
    avaliableStorage: "9 GB",
  },
  {
    userName: "User6",
    id: "3",
    name: "Name6",
    department: "Frontend",
    role: "N/A",
    email: "user6@appolo.com",
    storageUsed: "10GB",
    manageStorage: "1 GB",
    status: false,
    avaliableStorage: "9 GB",
  },
];

const columns = [
  "USER NAME",
  "NAME",
  "DEPARTMENT",
  "ROLE",
  "USER EMAIL",
  "STORAGE USED",
  "MANAGE STORAGE",
  "TOOLS",
];

const statusColors = {
  active: "#4caf50", // Green
  inactive: "#f44336", // Red
  pending: "#ff9800", // Orange
};

export default function UserTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = useState([]);
  const [createUser, setCreateUser] = useState(false);
  const [checked, setChecked] = useState(false);
  const [rowsData, setRowsData] = useState(rows);
  const [deleteUser, setDeleteUser] = useState(false);
  const [rowData, setRowData] = useState();
  const [selectAllData, setSelectAllData] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [migrationDialog, setMigrationDialog] = useState(false);

  console.log(rowData);

  const handleMigration = () => {
    setMigrationDialog(true);
  };

  const handleActivateAll = () => {
    const updated = rowsData.map((row) =>
      selected.includes(row.id) ? { ...row, status: true } : row
    );
    setRowsData(updated);
  };

  const options = ["10GB", "20GB"];

  const handleBulkDownload = () => {
    let dataToDownload = [];

    if (selected.length > 0) {
      dataToDownload = rows
        .filter((row) => selected.includes(row.id))
        .map(({ activeLicense, ...row }) => ({
          ...row,
          edit: "No",
        }));
    } else {
      dataToDownload = rows.map(({ activeLicense, ...row }) => ({
        ...row,
        edit: "No",
      }));
    }

    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }

    // Convert JSON to CSV
    const csvHeaders = Object.keys(dataToDownload[0]).join(",");
    const csvRows = dataToDownload.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`) // Handle quotes
        .join(",")
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSelected([]); // Clear selection AFTER download
  };

  // console.log(rowData)   //Table row data
  // console.log(selected); //array

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const handleDelete = (e, row) => {
    // console.log(selected);
    setDeleteUser(true);
  };

  const handleStatusToggle = (rowId) => {
    const updatedRows = [...rowsData];
    const rowIndex = updatedRows.findIndex((row) => row.id === rowId); // Find the row by id
    if (rowIndex !== -1) {
      updatedRows[rowIndex].status = !updatedRows[rowIndex].status; // Toggle the status
      setRowsData(updatedRows); // Update the state
    }
  };

  const handleCreateUser = () => {
    setCreateUser(true);
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     setSelectAllData(true); // Open the dialog
  //   } else {
  //     setSelected([]); // Deselect all
  //   }
  // };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Select all row ids
      const allIds = rows.map((row) => row.id);
      // setSelected(allIds);

      // Get full data of selected rows
      const selectedFullRows = rows.filter((r) => allIds.includes(r.id));
      setRowData(selectedFullRows);

      // Set selectAllData flag
      setSelectAllData(true);
    } else {
      // Deselect all rows
      setSelected([]); // Clear selected ids

      // Directly get the full data of rows that were selected
      const selectedFullRows = rows.filter((r) => selected.includes(r.id));
      setRowData(selectedFullRows); // Update row data with the selected rows

      // Set selectAllData flag to false
      setSelectAllData(false);
    }
  };

  const handleClick = (row) => {
    const selectedIndex = selected.indexOf(row.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row.id];
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

    // 💡 Optional: If you also want full selected row data
    const selectedFullRows = rows.filter((r) => newSelected.includes(r.id));
    setRowData(selectedFullRows);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Box
      sx={{
        p: "10px",
        bgcolor: "whitesmoke",
        overflow: "hidden",
        height: "calc(100vh - 48px)",
      }}
    >
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "84vh", height: "84vh" }}>
          <Table stickyHeader>
            <TableHead className={styles.tableHeader}>
              <TableRow
                sx={{ boxShadow: "0 -2px 8px 0 rgba(0, 0, 0, 0.2) !important" }}
              >
                <TableCell padding="checkbox">
                  {/* <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < rows.length
                  }
                  checked={
                    rowsData.length > 0 && selected.length === rowsData.length
                  }
                  onChange={handleSelectAllClick}
                /> */}
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < rows.length
                    }
                    checked={selected.length === rows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell align="center">USER NAME</TableCell>
                <TableCell align="center">NAME</TableCell>
                <TableCell align="center">DEPARTMENT</TableCell>
                <TableCell align="center">ROLE</TableCell>
                <TableCell align="center">USER EMAIL</TableCell>
                <TableCell align="center">STORAGE USED</TableCell>
                <TableCell align="center">MANAGE STORAGE</TableCell>
                <TableCell align="center" sx={{ width: "200px" }}>
                  TOOLS
                </TableCell>
                {/* {columns.map((column) => (
                  <TableCell key={column} align="center">
                    {column}
                  </TableCell>
                ))} */}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      selected={isItemSelected}
                      onMouseEnter={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleClick(row)}
                        />
                      </TableCell>
                      <TableCell align="center">{row.userName}</TableCell>
                      <TableCell align="center">{row.name}</TableCell>
                      <TableCell align="center">{row.department}</TableCell>
                      <TableCell align="center">{row.role}</TableCell>
                      <TableCell align="center">{row.email}</TableCell>
                      <TableCell align="center">{row.storageUsed}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <Autocomplete
                          size="small"
                          options={options}
                          defaultValue="2GB"
                          sx={{ width: 130 }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              defaultValue="2GB"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ width: "200px" }}>
                        {hoveredRow === row.id && (
                          <>
                            <Tooltip title={row.status ? "Active" : "Inactive"}>
                              <Switch
                                sx={{
                                  "& .MuiSwitch-switchBase": {
                                    "&.Mui-checked": {
                                      color: statusColors.active,
                                      "& + .MuiSwitch-track": {
                                        backgroundColor: alpha(
                                          statusColors.active,
                                          0.5
                                        ),
                                      },
                                    },
                                  },
                                  "& .MuiSwitch-thumb": {
                                    backgroundColor:
                                      (row.status || "pending") === "active"
                                        ? statusColors.active
                                        : (row.status || "pending") ===
                                          "pending"
                                        ? statusColors.pending
                                        : statusColors.inactive,
                                  },
                                  "& .MuiSwitch-track": {
                                    backgroundColor:
                                      (row.status || "pending") === "active"
                                        ? alpha(statusColors.active, 0.5)
                                        : (row.status || "pending") ===
                                          "pending"
                                        ? alpha(statusColors.pending, 0.5)
                                        : alpha(statusColors.inactive, 0.5),
                                  },
                                }}
                                checked={row.status}
                                onChange={() => handleStatusToggle(row.id)} // Use row.id to uniquely identify the row
                                inputProps={{ "aria-label": "status switch" }}
                              />
                            </Tooltip>

                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TablePagination
            rowsPerPageOptions={[10, 30, 60, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          <div
            style={{
              gap: "5px",
              marginRight: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {selected.length >= 1 && (
              <Tooltip title="Migrate Selected Users">
                <IconButton
                  sx={{
                    bgcolor: "#9c27b0", // Solid orange background color
                    color: "white",
                    "&:hover": { bgcolor: "#9c27b0" },
                  }}
                  onClick={handleMigration}
                >
                  <WifiProtectedSetup />
                </IconButton>
              </Tooltip>
            )}
            {selected.length > 1 && (
              <Tooltip title="Delete">
                <IconButton
                  sx={{
                    bgcolor: "#d32f2f", // Solid orange background color
                    color: "white",
                    "&:hover": { bgcolor: "#d32f2f" },
                  }}
                  onClick={handleDelete}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
            {selected.length > 1 && (
              <Tooltip title="Activate Selected Users">
                <IconButton
                  sx={{
                    bgcolor: "#9c27b0", // Solid orange background color
                    color: "white",
                    "&:hover": { bgcolor: "#9c27b0" },
                  }}
                  onClick={handleActivateAll}
                >
                  <PowerSettingsNew />
                </IconButton>
              </Tooltip>
            )}
            {selected.length > 1 && (
              <Tooltip title="Deactivate Selected Users">
                <IconButton
                  sx={{
                    bgcolor: "#9c27b0", // Solid orange background color
                    color: "white",
                    "&:hover": { bgcolor: "#9c27b0" },
                  }}
                >
                  <Block />
                </IconButton>
              </Tooltip>
            )}
            {selected.length >= 1 && (
              <Tooltip title="Download Selected">
                <IconButton
                  sx={{
                    bgcolor: "#0034dd", // Solid orange background color
                    color: "white",
                    "&:hover": { bgcolor: "#0034dd" },
                  }}
                  onClick={handleBulkDownload}
                >
                  <FileDownload />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Add New User">
              <IconButton
                sx={{
                  bgcolor: "rgb(251, 68, 36)", // Solid orange background color
                  color: "white",
                  "&:hover": { bgcolor: "rgb(251, 68, 36)" },
                }}
                onClick={handleCreateUser}
              >
                <Add />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* delete Dialog */}
        <Dialog open={deleteUser} onClose={() => setDeleteUser(false)}>
          <DeleteUser
            handleClose={() => setDeleteUser(false)}
            rowId={selected}
          />
        </Dialog>

        {/* select all rows */}
        <Dialog
          open={selectAllData}
          onClose={() => setSelectAllData(false)}
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "13px", padding: "3px 7px" }}>
            Select Users
          </DialogTitle>

          {/* Action buttons */}
          <DialogContent dividers>
            <Typography>
              Do you want to select all users or just the current page
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              style={{
                backgroundColor: "#9e9e9e",
                color: "white",
                // padding: "8px 12px",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
              onClick={() => {
                setSelected([]); // Deselect all rows
                setSelectAllData(false); // Close the dialog
              }}
            >
              Cancel
            </Button>
            <div style={{ gap: "4px" }}>
              <Button
                style={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  marginRight: "4px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                onClick={() => {
                  const currentPageRows = rows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((n) => n.id);
                  setSelected(currentPageRows); // Select only the current page
                  setSelectAllData(false);
                }}
              >
                Select Current Page (
                {
                  rows.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  ).length
                }
                rows)
              </Button>

              <Button
                style={{
                  backgroundColor: "#d32f2f",
                  color: "white",
                  // padding: "8px 12px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                onClick={() => {
                  setSelected(rows.map((n) => n.id)); // Select all rows
                  setSelectAllData(false);
                }}
              >
                Select All Rows ({rows.length})
              </Button>
            </div>
          </DialogActions>
        </Dialog>

        {/* migration */}
        <Dialog
          open={migrationDialog}
          onClose={() => setMigrationDialog(false)}
          fullWidth
        >
          <Migration
            handleClos={() => setMigrationDialog(false)}
            rowData={rowData}
          />
        </Dialog>
      </Paper>
    </Box>
  );
}
