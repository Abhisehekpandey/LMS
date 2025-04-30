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
  FormControl,
  InputLabel,
  FormControlLabel,
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
  Close,
  Filter,
  FilterList,
} from "@mui/icons-material";
import styles from "./user.module.css";
import DeleteUser from "./DeleteUser";
import Migration from "./Migration";
import CreateUser from "./CreateUser";
import { toast } from "react-toastify";

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
    storageUsed: "200MB",
    manageStorage: "1 GB",
    status: false,
    avaliableStorage: "9 GB",
    phone: "1234567890",
  },
  {
    userName: "User5",
    id: "5",
    name: "Name5",
    department: "Backend",
    role: "N/A",
    email: "user5@appolo.com",
    storageUsed: "200MB",
    manageStorage: "1 GB",
    status: false,
    avaliableStorage: "9 GB",
    phone: "9876543201",
  },
  {
    userName: "User6",
    id: "3",
    name: "Name6",
    department: "Frontend",
    role: "N/A",
    email: "user6@appolo.com",
    storageUsed: "200MB",
    manageStorage: "1 GB",
    status: true,
    avaliableStorage: "9 GB",
    phone: "1234567890",
  },
];

const statusColors = {
  active: "#4caf50", // Green
  inactive: "#f44336", // Red
  pending: "#ff9800", // Orange
};

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [Storage, setStorage] = React.useState("");

  const handleChangeStorage = (event) => {
    setStorage(event.target.value);
  };

  const handleEdit = (e, row) => {
    console.log(row);
    setEditData(row);
    setEditDialogOpen(true);
  };
  // console.log(rowData);

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
    setRowData((prev) =>
      prev.map((d) =>
        d.name === rowId.name ? { ...d, isActive: !d.isActive } : d
      )
    );
    toast({
      open: true,
      message: `Department "${rowId.name}" ${
        !rowId.isActive ? "activated" : "deactivated"
      }`,
      severity: "success",
    });
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
      <Paper
        elevation={24}
        sx={{ width: "100%", overflow: "hidden", borderRadius: "28px" }}
      >
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
                {/* <TableCell align="center">USER NAME</TableCell> */}
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Department</TableCell>
                <TableCell align="center">Role</TableCell>
                <TableCell align="center">User email</TableCell>
                <TableCell align="center">Storage used</TableCell>
                <TableCell align="center">Manage storage</TableCell>
                <TableCell align="center">Active license</TableCell>
                <TableCell align="center">Actions</TableCell>
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
                          sx={{ padding: "10px 10px 10px 10px !important" }}
                          checked={isItemSelected}
                          onChange={() => handleClick(row)}
                        />
                      </TableCell>
                      {/* <TableCell
                        align="center"
                        sx={{ padding: "10px 10px 10px 10px !important" }}
                      >
                        {row.userName}
                      </TableCell> */}
                      <TableCell
                        align="center"
                        sx={{ padding: "10px 10px 10px 10px !important" }}
                      >
                        {row.name}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "10px 10px 10px 10px !important" }}
                      >
                        {row.department}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "10px 10px 10px 10px !important" }}
                      >
                        {row.role}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "10px 10px 10px 10px !important" }}
                      >
                        {row.email}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ padding: "10px 10px 10px 10px !important" }}
                      >
                        {row.storageUsed}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "10px 10px 10px 10px !important",
                        }}
                      >
                        <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                          <Select
                            id="demo-select-small"
                            value={Storage}
                            defaultValue="10GB"
                            onChange={handleChangeStorage}
                            displayEmpty
                            sx={{
                              borderRadius: "20px",
                              ".MuiSelect-outlined": {
                                height: "5px !important",
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em>10GB</em>
                            </MenuItem>
                            <MenuItem value={10}>20GB</MenuItem>
                            <MenuItem value={20}>40GB</MenuItem>
                            <MenuItem value={30}>60GB</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={row.status ? "Active" : "Inactive"}>
                          <FormControlLabel
                            control={
                              <IOSSwitch
                                checked={row.status}
                                onChange={() => handleStatusToggle(row)}
                              />
                            }
                          />
                        </Tooltip>
                        {/* <Tooltip title={row.status ? "Active" : "Inactive"}>
                          <Switch
                            size="small"
                            checked={row.status}
                            onChange={() => handleStatusToggle(row)}
                            sx={{
                              "& .MuiSwitch-switchBase": {
                                "&.Mui-checked": {
                                  // When active/checked
                                  color: "#2e7d32", // Green color
                                  "& + .MuiSwitch-track": {
                                    backgroundColor: "#4caf50", // Green track
                                    opacity: 0.5,
                                  },
                                },
                                "&.Mui-disabled": {
                                  "& + .MuiSwitch-track": {
                                    opacity: 0.5,
                                  },
                                },
                              },
                              "& .MuiSwitch-switchBase.Mui-checked:hover": {
                                backgroundColor: "rgba(46, 125, 50, 0.08)", // Green hover effect
                              },
                              // When inactive/unchecked
                              "& .MuiSwitch-switchBase:not(.Mui-checked)": {
                                color: "#d32f2f", // Red color
                                "& + .MuiSwitch-track": {
                                  backgroundColor: "#ef5350", // Red track
                                  opacity: 0.5,
                                },
                              },
                              "& .MuiSwitch-switchBase:not(.Mui-checked):hover":
                                {
                                  backgroundColor: "rgba(211, 47, 47, 0.08)", // Red hover effect
                                },
                            }}
                          />
                        </Tooltip> */}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "200px",
                          padding: "10px 10px 10px 10px !important",
                        }}
                      >
                        {hoveredRow === row.id && (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => handleEdit(e, row)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={handleDelete}
                            >
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
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                    "&:hover": {
                      backgroundColor: "#9c27b0", // Keep the background color on hover
                      animation: "glowBorderMigrate 1.5s ease-in-out infinite", // Apply glowing animation on hover
                    },
                    "@keyframes glowBorderMigrate": {
                      "0%": {
                        boxShadow: "0 0 0px 2px #9c27b0", // Start with soft glow
                        borderColor: "transparent", // Initial transparent border
                      },
                      "50%": {
                        boxShadow: "0 0 20px 5px #9c27b0",
                        borderColor: "#9c27b0", // Glowing orange border
                      },
                      "100%": {
                        boxShadow: "0 0 0px 2px #9c27b0", // Glow fades out
                        borderColor: "transparent", // Reset to transparent
                      },
                    },
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
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                    "&:hover": {
                      backgroundColor: "#d32f2f", // Keep the background color on hover
                      animation: "glowBorderDelete 1.5s ease-in-out infinite", // Apply glowing animation on hover
                    },
                    "@keyframes glowBorderDelete": {
                      "0%": {
                        boxShadow: "0 0 0px 2px #d32f2f", // Start with soft glow
                        borderColor: "transparent", // Initial transparent border
                      },
                      "50%": {
                        boxShadow: "0 0 20px 5px #d32f2f",
                        borderColor: "#d32f2f", // Glowing orange border
                      },
                      "100%": {
                        boxShadow: "0 0 0px 2px #d32f2f", // Glow fades out
                        borderColor: "transparent", // Reset to transparent
                      },
                    },
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
                    bgcolor: "rgba(46,125,50,1)", // Solid orange background color
                    color: "white",
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                    "&:hover": {
                      backgroundColor: "rgba(46,125,50,1)", // Keep the background color on hover
                      animation: "glowActivate 1.5s ease-in-out infinite", // Apply glowing animation on hover
                    },
                    "@keyframes glowActivate": {
                      "0%": {
                        boxShadow: "0 0 0px 2px rgba(46,125,50,1)", // Start with soft glow
                        borderColor: "transparent", // Initial transparent border
                      },
                      "50%": {
                        boxShadow: "0 0 20px 5px rgba(46,125,50,1)",
                        borderColor: "rgba(46,125,50,1)", // Glowing orange border
                      },
                      "100%": {
                        boxShadow: "0 0 0px 2px rgba(46,125,50,1)", // Glow fades out
                        borderColor: "transparent", // Reset to transparent
                      },
                    },
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
                    bgcolor: "#f5ac26", // Solid orange background color
                    color: "white",
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                    "&:hover": {
                      backgroundColor: "#f5ac26", // Keep the background color on hover
                      animation: "BorderDeactivate 1.5s ease-in-out infinite", // Apply glowing animation on hover
                    },
                    "@keyframes BorderDeactivate": {
                      "0%": {
                        boxShadow: "0 0 0px 2px #f5ac26", // Start with soft glow
                        borderColor: "transparent", // Initial transparent border
                      },
                      "50%": {
                        boxShadow: "0 0 20px 5px #f5ac26",
                        borderColor: "#f5ac26", // Glowing orange border
                      },
                      "100%": {
                        boxShadow: "0 0 0px 2px #f5ac26", // Glow fades out
                        borderColor: "transparent", // Reset to transparent
                      },
                    },
                  }}
                >
                  <Block />
                </IconButton>
              </Tooltip>
            )}
            {selected.length >= 1 && (
              <Tooltip title="Download Selected">
                <IconButton
                  variant="contained"
                  sx={{
                    backgroundColor: "rgba(25,118,210,1)",
                    color: "white",
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                    "&:hover": {
                      backgroundColor: "rgba(25,118,210,0.8)", // Keep the background color on hover
                      animation: "glowBorderDownload 1.5s ease-in-out infinite", // Apply glowing animation on hover
                    },
                    "@keyframes glowBorderDownload": {
                      "0%": {
                        boxShadow: "0 0 0px 2px rgba(25,118,210,0.8)", // Start with soft glow
                        borderColor: "transparent", // Initial transparent border
                      },
                      "50%": {
                        boxShadow: "0 0 20px 5px rgba(25,118,210,0.8)",
                        borderColor: "rgba(25,118,210,0.8)", // Glowing orange border
                      },
                      "100%": {
                        boxShadow: "0 0 0px 2px rgba(25,118,210,0.8)", // Glow fades out
                        borderColor: "transparent", // Reset to transparent
                      },
                    },
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
                  boxShadow:
                    "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                  "&:hover": {
                    backgroundColor: "rgb(251, 68, 36)", // Keep the background color on hover
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

        {/* create users */}
        <Dialog
          open={createUser}
          onClose={() => setCreateUser(false)}
          fullWidth
          maxWidth="md"
        >
          <CreateUser handleClose={() => setCreateUser(false)} />
        </Dialog>

        {/* edit dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              pb: 1,
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Be Vietnam", sans-serif',
              }}
            >
              EDIT USER
            </Typography>
            <IconButton
              onClick={() => setEditDialogOpen(false)}
              size="small"
              sx={{
                color: "error.main",
                border: "1px solid",
                borderColor: "error.light",
                bgcolor: "error.lighter",
                borderRadius: "50%",
                position: "relative",
                "&:hover": {
                  color: "error.dark",
                  borderColor: "error.main",
                  bgcolor: "error.lighter",
                  transform: "rotate(180deg)",
                },
                transition: "transform 0.3s ease",
              }}
            >
              <Close
                sx={{
                  fontSize: "1.1rem",
                  transition: "transform 0.2s ease",
                }}
              />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {/* First row */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  name="userName"
                  label="Username"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={editData.userName || ""}
                  // onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  name="name"
                  label="Full Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={editData.name || ""}
                  // onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  name="department"
                  label="Department"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={editData.department || ""}
                  // onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  name="role"
                  label="Role"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={editData.role || ""}
                  // onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="Email cannot be edited" placement="top">
                  <TextField
                    size="small"
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={editData.email || ""}
                    disabled
                    sx={{
                      backgroundColor: "#f5f5f5",
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "#666",
                      },
                      cursor: "not-allowed",
                    }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  name="phone"
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  variant="outlined"
                  value={editData.phone || ""}
                  // onChange={handleInputChange}
                  // sx={{ width: "40%" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  name="storageUsed"
                  label="Storage Used"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={editData.storageUsed || ""}
                  // onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            {/* <Button onClick={() => setEditDialogOpen(false)} color="inherit">
              Cancel
            </Button> */}
            <Button
              // onClick={saveEditedUser}
              variant="contained"
              color="primary"
              size="small"
              sx={{
                backgroundColor: "rgb(251, 68, 36)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgb(251, 68, 36)",
                  color: "white",
                },
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
