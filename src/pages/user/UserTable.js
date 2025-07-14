import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx"; // Add this at the top of the file
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
  Slide,
} from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
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
import Department from "../Department";
import { toast } from "react-toastify";
import { CircularProgress, keyframes } from "@mui/material";
import { activateAll, fetchUsers } from "../../api/userService";
import { toggleUserStatusByUsername } from "../../api/userService";
import { getDepartments } from "../../api/departmentService";
import { updateUser } from "../../api/userService";
// import { activateAll } from "../../api/userService";

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

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled overlay
const LoaderWrapper = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1300,
  animation: `${fadeIn} 0.5s ease-in-out`,
}));

// Styled CircularProgress
const CustomSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: "60px !important",
  height: "80px !important",
  thickness: 2,
}));

const rows = [
  {
    id: "1",
    name: "kunal kamboj",
    department: "Frontend",
    role: "Software Engineer",
    email: "kunal@appolo.com",
    storageUsed: "200 MB",
    manageStorage: "1 GB",
    status: false,

    phone: "1234567890",
  },
  {
    id: "2",
    name: "Pratibha thakur",
    department: "Frontend",
    role: "Frontend Developer",
    email: "pratibha@appolo.com",
    storageUsed: "200 MB",
    manageStorage: "1 GB",
    status: false,

    phone: "9876543201",
  },
  {
    id: "3",
    name: "Abhishek Panday",
    department: "Frontend",
    role: "Software Developer",
    email: "abhishek@appolo.com",
    storageUsed: "800 MB",
    manageStorage: "1 GB",
    status: true,

    phone: "1234567890",
  },
  {
    id: "4",
    name: "Dhruv Sethi",
    department: "Backend",
    role: "Manager",
    email: "dhruv@appolo.com",
    storageUsed: "800 MB",
    manageStorage: "1 GB",
    status: true,

    phone: "1234567890",
  },
  {
    id: "5",
    name: "Manish Yadav",
    department: "Backend",
    role: "Software engineer",
    email: "manish@appolo.com",
    storageUsed: "800 MB",
    manageStorage: "1 GB",
    status: true,

    phone: "1234567890",
  },
  {
    id: "6",
    name: "Prince Tiwari",
    department: "Backend",
    role: "Backend developer",
    email: "prince@appolo.com",
    storageUsed: "800 MB",
    manageStorage: "1 GB",
    status: true,

    phone: "1234567890",
  },
  {
    id: "7",
    name: "Dheeraj",
    department: "Frontend",
    role: "Senior Frontend Developer",
    email: "dheeraj@appolo.com",
    storageUsed: "800 MB",
    manageStorage: "1 GB",
    status: true,

    phone: "1234567890",
  },
];

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

export default function UserTable() {
  const [showDeptChange, setShowDeptChange] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [departmentPage, setDepartmentPage] = useState(0);
  const [hasMoreDepartments, setHasMoreDepartments] = useState(true);
  const loadingDepartments = useRef(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [totalCount, setTotalCount] = useState(0);
  const adminEmail = sessionStorage.getItem("adminEmail");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = useState([]);
  const [createUser, setCreateUser] = useState(false);
  const [checked, setChecked] = useState(false);
  // const [rowsData, setRowsData] = useState(rows);
  const [rowsData, setRowsData] = useState([]);

  const [deleteUser, setDeleteUser] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [selectAllData, setSelectAllData] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [migrationDialog, setMigrationDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [Storage, setStorage] = React.useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  <Autocomplete
    options={departments}
    getOptionLabel={(option) => option.deptName || ""}
    value={departments.find((d) => d.deptName === editData.department) || null}
    onChange={(e, value) => {
      setEditData((prev) => ({
        ...prev,
        department: value?.deptName || "",
      }));
    }}
    ListboxProps={{
      style: { maxHeight: 300, overflow: "auto" },
      onScroll: (event) => {
        const listboxNode = event.currentTarget;
        const threshold = 50;
        if (
          listboxNode.scrollTop + listboxNode.clientHeight >=
          listboxNode.scrollHeight - threshold
        ) {
          loadMoreDepartments();
        }
      },
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        size="small"
        label="Department"
        fullWidth
        variant="outlined"
      />
    )}
  />;

  const handleSaveChanges = async () => {
    const deptObj = departments.find((d) => d.deptName === editData.department);

    const userPayload = {
      ...editData,
      departmentId: deptObj?.id, // Assuming backend expects department ID
      // other fields as required by backend
    };

    try {
      await updateUser(userPayload); // 👈 Call the API
      toast.success("User updated successfully!");
      setEditDialogOpen(false); // Close dialog
      refetchUsers(); // Refresh table
    } catch (error) {
      toast.error("Failed to update user.");
    }
  };

  const loadMoreDepartments = async () => {
    if (loadingDepartments.current || !hasMoreDepartments) return;
    loadingDepartments.current = true;

    try {
      const res1 = await getDepartments(departmentPage, 10);
      const res = res1?.content || [];

      const newDepartments = res.map((dept) => ({
        ...dept,
        roles: (dept.roles || []).map((role) => role.roleName),
      }));

      if (newDepartments.length < 10) setHasMoreDepartments(false);
      setDepartments((prev) => [...prev, ...newDepartments]);
      setDepartmentPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      loadingDepartments.current = false;
    }
  };

  useEffect(() => {
    loadMoreDepartments();
  }, []);

  const handleMigrationComplete = (updatedRows) => {
    setRowsData(updatedRows);
  };

  const handleChangeStorage = (event) => {
    setStorage(event.target.value);
  };

  const handleEdit = (e, row) => {
    const deptName = row.roles?.[0]?.department?.deptName || "";
    const roleName = row.roles?.[0]?.roleName || "";

    setEditData({
      ...row,
      department: deptName,
      role: roleName,
    });

    // ✅ Set selected department object
    const matchingDept = departments.find((d) => d.deptName === deptName);
    setSelectedDepartment(matchingDept || null);

    setEditDialogOpen(true);
  };

  // console.log(rowData);

  const handleMigration = () => {
    setMigrationDialog(true);
  };

  const handleActivateAll = async () => {
    const usersToActivate = rowsData
      .filter((row) => selected.includes(row.id))
      .map((user) => ({
        id: user.id,
        active: true,
      }));

    if (usersToActivate.length === 0) {
      toast.warn("No users selected for activation.");
      return;
    }

    try {
      await activateAll(usersToActivate); // ✅ new API call

      // Update local state
      setRowsData((prev) =>
        prev.map((user) =>
          selected.includes(user.id) ? { ...user, active: true } : user
        )
      );

      toast.success("Selected users have been activated.");
    } catch (error) {
      console.error("Error activating users:", error);
      toast.error("Failed to activate selected users.");
    }
  };

  const options = ["10GB", "20GB"];

  const handleBulkDownload = () => {
    if (!rowData || rowData.length === 0) {
      alert("No data to download");
      return;
    }

    const formatStatus = (row) => {
      if (row.active && !row.enabled) return "Pending";
      if (row.active && row.enabled) return "Active";
      return "Inactive";
    };

    const extractRowData = (row) => ({
      Name: row.name || "N/A",
      Department: row.roles?.[0]?.department?.deptName || "N/A",
      Role: row.roles?.[0]?.roleName || "N/A",
      "User Email": row.email || "N/A",
      "Phone Number": row.phone || "N/A",
      "Reporting Manager": row.reportingManager?.name || "N/A",
      "Storage Used": row.permissions?.displayStorage || "N/A",
      "Manage Storage": row.permissions?.allowedStorageInBytesDisplay || "N/A",
      "Active License": formatStatus(row),
    });

    const dataToDownload = rowData.map(extractRowData);
    const headers = Object.keys(dataToDownload[0]);

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload, {
      header: headers,
    });

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 30 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Users");
    XLSX.writeFile(workbook, "selected-users.xlsx");

    setSelected([]);
    setRowData([]);

    // ✅ Show success message
    setSnackbarMessage("User data downloaded successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const handleDelete = (e, row) => {
    setDeleteUser(true);
  };

  const toBytes = (display) => {
    if (!display || typeof display !== "string") return 0;

    const trimmed = display.trim().toUpperCase(); // "1.00 GB" => "1.00 GB"
    const match = trimmed.match(/^([\d.]+)\s*(KB|MB|GB|TB)$/);

    if (!match) return 0;

    const num = parseFloat(match[1]);
    const unit = match[2];

    const unitMap = {
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };

    return num * unitMap[unit];
  };

  const handleStatusToggle = async (username) => {
    const user = rowsData.find((u) => u.name === username);
    if (!user) return;

    const newStatus = !user.active;
    const selectedStorage =
      user.permissions?.allowedStorageInBytesDisplay || "0KB";
    const selectedStorageBytes = toBytes(selectedStorage);

    // Update only the targeted user in the full list
    const updatedRows = rowsData.map((u) =>
      u.name === username
        ? {
            ...u,
            active: newStatus,
            permissions: {
              ...u.permissions,
              allowedStorageInBytesDisplay: selectedStorage,
              allowedStorageInBytes: selectedStorageBytes,
              active: newStatus,
            },
          }
        : u
    );

    try {
      await toggleUserStatusByUsername(updatedRows, page); // send full payload
      setRowsData(updatedRows); // update state

      let statusMessage = "";
      if (newStatus && !user.enabled) {
        statusMessage = `User "${user.name}" is pending email verification`;
      } else if (newStatus && user.enabled) {
        statusMessage = `User "${user.name}" has been activated`;
      } else {
        statusMessage = `User "${user.name}" has been deactivated`;
      }
      toast.success(statusMessage);
    } catch (error) {
      console.error("Failed to update users", error);
      toast.error("Failed to update users.");
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

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allIds = rowsData.map((row) => row.id);
      // setSelected(allIds);

      const selectedFullRows = rowsData.filter((r) => allIds.includes(r.id));
      setRowData(selectedFullRows);

      // Set selectAllData flag
      setSelectAllData(true);
    } else {
      // Deselect all rows
      setSelected([]); // Clear selected ids

      // Directly get the full data of rows that were selected
      const selectedFullRows = rowsData.filter((r) => selected.includes(r.id));
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
    const selectedFullRows = rowsData.filter((r) => newSelected.includes(r.id));
    setRowData(selectedFullRows);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const refetchUsers = async () => {
    setLoading(true);
    try {
      const users = await fetchUsers(page);
      const adminEmail = sessionStorage.getItem("adminEmail");

      const sortedUsers = [...users.content].sort((a, b) => {
        if (a.email === adminEmail) return -1;
        if (b.email === adminEmail) return 1;
        return 0;
      });

      setRowsData(sortedUsers);
      setTotalCount(users.totalElements);
    } catch (error) {
      console.error("Error loading users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    refetchUsers();
  }, [page, rowsPerPage]);

  console.log(">>>rowssss", rowsData);

  const handleClose = () => {
    setMigrationDialog(false);
  };

  return (
    <Box
      sx={{
        marginLeft: "14px",
        bgcolor: "whitesmoke",
        overflow: "hidden",
        height: "calc(100vh - 48px)",
        padding: "15px",
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "20px",
          animation: "slideInFromLeft 0.3s ease-in-out forwards",
          opacity: 0, // Start with opacity 0
          transform: "translateX(-50px)", // Start from left
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
        className="PaperUI"
      >
        <TableContainer sx={{ maxHeight: "83vh", height: "80vh" }}>
          <Table stickyHeader>
            <TableHead className={styles.tableHeader}>
              <TableRow
                sx={{ boxShadow: "0 -2px 8px 0 rgba(0, 0, 0, 0.2) !important" }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === rowsData.length}
                    indeterminate={
                      selected.length > 0 && selected.length < rowsData.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                {/* <TableCell align="center">USER NAME</TableCell> */}
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Department</TableCell>
                <TableCell align="center">Role</TableCell>
                <TableCell align="center">User email</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: 140,
                  }}
                >
                  Storage used
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: 140,
                  }}
                >
                  Manage storage
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: 140,
                  }}
                >
                  Active license
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsData.map((row, index) => {
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
                        sx={{ padding: "1px 1px 1px 1px !important" }}
                        checked={isItemSelected}
                        onChange={() => handleClick(row)}
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ padding: "10px 10px 10px 10px !important" }}
                    >
                      {/* {row.name} */}
                      {row.name}
                      {row.email === adminEmail && " (admin)"}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ padding: "10px 10px 10px 10px !important" }}
                    >
                      {/* {row.department} */}
                      {row.roles && row.roles.length > 0
                        ? row.roles[0].department?.deptName || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ padding: "10px 10px 10px 10px !important" }}
                    >
                      {/* {row.role} */}
                      {row.roles && row.roles.length > 0
                        ? row.roles[0].roleName || "N/A"
                        : "N/A"}
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
                      {/* {row.storageUsed} */}
                      {row.permissions?.displayStorage || "N/A"}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        padding: "2px 8px",
                      }}
                    >
                      <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                        <Select
                          id={`manage-storage-${row.id}`}
                          value={
                            row.permissions?.allowedStorageInBytesDisplay || ""
                          }
                          onChange={async (e) => {
                            const newDisplayValue = e.target.value;
                            const newByteValue = toBytes(newDisplayValue);

                            const updated = rowsData.map((r) =>
                              r.id === row.id
                                ? {
                                    ...r,
                                    permissions: {
                                      ...r.permissions,
                                      allowedStorageInBytesDisplay:
                                        newDisplayValue,
                                      allowedStorageInBytes: newByteValue,
                                    },
                                  }
                                : r
                            );

                            setRowsData(updated);

                            if (row.active) {
                              const updatedRows = rowsData.map((u) =>
                                u.id === row.id
                                  ? {
                                      ...u,
                                      permissions: {
                                        ...u.permissions,
                                        allowedStorageInBytesDisplay:
                                          newDisplayValue,
                                        allowedStorageInBytes: newByteValue,
                                      },
                                    }
                                  : u
                              );

                              try {
                                await toggleUserStatusByUsername(
                                  updatedRows,
                                  page
                                );
                                setRowsData(updatedRows);
                                toast.success(
                                  `Storage updated for ${row.name}`
                                );
                              } catch (error) {
                                toast.error(
                                  `Failed to update storage for ${row.name}`
                                );
                              }
                            }
                          }}
                          displayEmpty
                          sx={{
                            width: "100px",
                            height: "30px",
                            borderRadius: "28px",
                          }}
                        >
                          {(() => {
                            const predefinedOptions = [
                              "1GB",
                              "5GB",
                              "3GB",
                              "10GB",
                              "20GB",
                              "40GB",
                              "60GB",
                            ];
                            const currentValue =
                              row.permissions?.allowedStorageInBytesDisplay;
                            const allOptions = predefinedOptions.includes(
                              currentValue
                            )
                              ? predefinedOptions
                              : [currentValue, ...predefinedOptions];
                            return allOptions.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ));
                          })()}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip
                        title={
                          row.active && !row.enabled
                            ? "Pending (Email Not Verified)"
                            : !row.active
                            ? "Inactive (Provide Storage"
                            : "Active"
                        }
                      >
                        <span>
                          <FormControlLabel
                            control={
                              <IOSSwitch
                                checked={row.active && row.enabled}
                                onChange={() => handleStatusToggle(row.name)}
                                disabled={
                                  // Disable if:
                                  // 1. user is pending (active but not enabled), OR
                                  // 2. storage is not provided
                                  (row.active && !row.enabled) ||
                                  (!row.active &&
                                    (!row.permissions
                                      ?.allowedStorageInBytesDisplay ||
                                      row.permissions
                                        ?.allowedStorageInBytesDisplay ===
                                        "0 KB"))
                                }
                              />
                            }
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        width: "200px",
                        padding: "10px 10px 10px 10px !important",
                      }}
                    >
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

                      {/* )} */}
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
            count={totalCount} // ✅ correct total count
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
            <div
              style={{
                gap: "5px",
                marginRight: "7px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {selected.length > 0 && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "bold",
                    color: "#333",
                    marginRight: "10px",
                  }}
                >
                  Total Selected: {selected.length} User
                  {selected.length > 1 ? "s" : ""}
                </Typography>
              )}
            </div>

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
            // handleClose={() => setDeleteUser(false)}
            handleClose={() => {
              setDeleteUser(false);
              refetchUsers(); // 👈 Add this to refresh the list after deletion
            }}
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
                  const currentPageRows = rowsData.map((n) => n.id);
                  setSelected(currentPageRows); // Select only the current page
                  setRowData(rowsData); // Store current page data
                  setSelectAllData(false);
                }}
              >
                Select Current Page ({rowsData.length} rows)
              </Button>

              <Button
                style={{
                  backgroundColor: "#d32f2f",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                onClick={async () => {
                  try {
                    setSelectAllData(false); // Close dialog

                    let allUsers = [];
                    let page = 0;
                    let totalPages = 1;

                    const firstResponse = await fetchUsers(0);
                    totalPages = firstResponse.totalPages;
                    allUsers = [...firstResponse.content];

                    const remainingFetches = [];
                    for (let p = 1; p < totalPages; p++) {
                      remainingFetches.push(fetchUsers(p));
                    }

                    const results = await Promise.all(remainingFetches);
                    results.forEach((res) => {
                      allUsers.push(...res.content);
                    });

                    // ✅ Select all user IDs
                    const allIds = allUsers.map((u) => u.id);
                    setSelected(allIds);
                    setRowData(allUsers); // Store all user data in rowData
                  } catch (error) {
                    console.error("Failed to fetch all users:", error);
                    alert("Something went wrong while selecting all users.");
                  }
                }}
              >
                Select All Page Users
              </Button>
            </div>
          </DialogActions>
        </Dialog>

        {/* migration */}
        <Dialog open={migrationDialog} onClose={handleClose} fullWidth>
          <Migration
            handleClos={handleClose}
            rowData={rowData}
            rows={rowsData}
            onMigrationComplete={handleMigrationComplete}
          />
        </Dialog>

        {/* create users */}
        <Dialog
          open={createUser}
          onClose={() => setCreateUser(false)}
          fullWidth
          keepMounted
          TransitionComponent={Transition}
          aria-describedby="alert-dialog-slide-description"
          maxWidth="md"
          sx={{
            animation: "slideInFromLeft 0.2s ease-in-out forwards",
            opacity: 0, // Start with opacity 0
            transform: "translateX(-50px)", // Start from left
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
          {/* <CreateUser handleClose={() => setCreateUser(false)} /> */}
          <CreateUser
            handleClose={() => setCreateUser(false)}
            // onUserCreated={refetchUsers}
            onUserCreated={(page, newUserEmails) => {
              refetchUsers(page, newUserEmails);
            }}
            showSnackbar={(message, severity = "success") => {
              setSnackbarMessage(message);
              setSnackbarSeverity(severity);
              setSnackbarOpen(true);
            }}
            allUsers={rowsData} // <-- pass all users here
          />
          {/* <Department allUsers={rowsData} /> */}
        </Dialog>

        {/* edit dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          sx={{
            animation: "slideInFromLeft 0.2s ease-in-out forwards",
            opacity: 0, // Start with opacity 0
            transform: "translateX(-50px)", // Start from left
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
          <DialogTitle
            sx={{
              pb: 1,
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
              backgroundColor: "primary.main",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Be Vietnam", sans-serif',
                color: "#ffff",
              }}
            >
              EDIT USER
            </Typography>
            <IconButton
              onClick={() => setEditDialogOpen(false)}
              size="small"
              sx={{
                color: "#ffff",
                border: "1px solid",
                borderColor: "#ffff",
                bgcolor: "error.lighter",
                borderRadius: "50%",
                position: "relative",
                "&:hover": {
                  color: "#ffff",
                  borderColor: "#ffff",
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
                  name="name"
                  label="Full Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Grid>

              <Grid item xs={8}>
                {showDeptChange ? (
                  <Autocomplete
                    options={departments}
                    getOptionLabel={(option) => option.deptName || ""}
                    value={selectedDepartment}
                    onChange={(e, value) => {
                      if (!value) {
                        // If no selection made, keep previous department
                        const existing = departments.find(
                          (d) => d.deptName === editData.department
                        );
                        setSelectedDepartment(existing || null);
                        return;
                      }

                      // New department selected
                      setSelectedDepartment(value);
                      setEditData((prev) => ({
                        ...prev,
                        department: value.deptName || "",
                      }));
                    }}
                    onBlur={() => {
                      // Restore to previous department if nothing selected and field loses focus
                      if (!selectedDepartment) {
                        const existing = departments.find(
                          (d) => d.deptName === editData.department
                        );
                        setSelectedDepartment(existing || null);
                      }
                    }}
                    ListboxProps={{
                      style: { maxHeight: 300, overflow: "auto" },
                      onScroll: (event) => {
                        const listboxNode = event.currentTarget;
                        const threshold = 50;
                        if (
                          listboxNode.scrollTop + listboxNode.clientHeight >=
                          listboxNode.scrollHeight - threshold
                        ) {
                          loadMoreDepartments();
                        }
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Department"
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      size="small"
                      label="Department"
                      fullWidth
                      value={editData.department || ""}
                      InputProps={{ readOnly: true }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowDeptChange(true)}
                    >
                      Change
                    </Button>
                  </Box>
                )}
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
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, role: e.target.value }))
                  }
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
                  value={editData.phoneNumber || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
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
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
