import React, { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import axios from "axios";

import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  TableSortLabel,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import { FormHelperText } from "@mui/material";

import { Autocomplete } from "@mui/material";
import { Card, CardContent } from "@mui/material";
import { CircularProgress, keyframes } from "@mui/material";
import { getDepartments } from "../api/departmentService";
import { createDepartment } from "../api/departmentService";
import { createRole } from "../api/departmentService";

import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FolderIcon from "@mui/icons-material/Folder";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BusinessIcon from "@mui/icons-material/Business";
// or
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  People as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  Work as DepartmentRolesIcon,
  Timeline as TimelineIcon,
  ManageAccounts as LDAPIcon,
  Dashboard as DashboardIcon,
  Add,
} from "@mui/icons-material";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Drawer from "@mui/material/Drawer";

import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { ManageAccounts as ManageAccountsIcon } from "@mui/icons-material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { deleteRole } from "../api/departmentService";

// Add this import with other imports
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Checkbox } from "@mui/material";
import styles from "./department.module.css";
import { fetchUsers } from "../api/userService";
import { fetchUsersByDepartment } from "../api/userService";
import { updateDepartment } from "../api/departmentService";
import { deleteDepartment } from "../api/departmentService";
import { updateDepartmentStorage } from "../api/departmentService";
import { toggleUserStatusByUsername } from "../api/userService";
import { updateDepartmentStoragePermission } from "../api/departmentService";

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

// Fade-in animation
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

function Department({ departments, setDepartments, onThemeToggle }) {
  const [tabValue, setTabValue] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);

  const [allDepartments, setAllDepartments] = useState([]);
  const [migrationPage, setMigrationPage] = useState(0);
  const [hasMoreDepartments, setHasMoreDepartments] = useState(true);

  const [targetDepartment, setTargetDepartment] = useState("");

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredPage, setFilteredPage] = useState(0);
  const [hasMoreFilteredUsers, setHasMoreFilteredUsers] = useState(true);
  const loadingFilteredUsers = useRef(false);

  const [userOptions, setUserOptions] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const loadingUsers = useRef(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const anchorRef = useRef(null);

  const [isAdminRole, setIsAdminRole] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 25 rows

  const [openRows, setOpenRows] = useState({});

  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [totalDepartments, setTotalDepartments] = useState(0);

  // Add after other state declarations
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add these states after other state declarations
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    displayName: "",
    initialRole: "",
    storage: "", // <-- Make it blank to enforce validation
    departmentModerator: "",
    selectedUser: [], // ✅ now an array
    submitted: false,
  });

  // Add after other state declarations
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Add after other state declarations
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [editedDepartment, setEditedDepartment] = useState(null);
  // First, add a new state for managing row expansion
  const [expandedRows, setExpandedRows] = useState({});
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [departmentToMigrate, setDepartmentToMigrate] = useState(null);

  // Add these new state variables after other state declarations
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState({
    departmentIndex: null,
    roleIndex: null,
    value: "",
  });

  const [allUsers, setAllUsers] = useState([]);
  const [duplicateDepartmentError, setDuplicateDepartmentError] =
    useState(false);

  const getStorageOptions = (deptAllowedValue) => {
    const baseOptions = [
      "0 GB",
      "25 GB",
      "50 GB",
      "75 GB",
      "100 GB",
      "150 GB",
      "200 GB",
    ];

    // Include dept value if not already in the list
    if (deptAllowedValue && !baseOptions.includes(deptAllowedValue)) {
      return [...baseOptions, deptAllowedValue];
    }

    return baseOptions;
  };

  const loadingDepartments = useRef(false);

  console.log("AllDepartment", allDepartments);
  console.log("departmentMigrat", departmentToMigrate);
  console.log("targetDepatment", targetDepartment);

  const loadMoreDepartments = async () => {
    if (loadingDepartments.current || !hasMoreDepartments) return;
    loadingDepartments.current = true;

    try {
      const res = await getDepartments(migrationPage, 10); // 10 per page
      const newDepts = res.content || [];
      console.log(">>newDe", newDepts);

      setAllDepartments((prev) => [...prev, ...newDepts]);
      setMigrationPage((prev) => prev + 1);
      if (newDepts.length < 10) setHasMoreDepartments(false);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      loadingDepartments.current = false;
    }
  };

  const handleOpenMigration = (dept) => {
    setDepartmentToMigrate(dept);
    setMigrationDialogOpen(true);
    setDeleteDialogOpen(false);

    // 🔥 Reset and load first page
    setAllDepartments([]);
    setMigrationPage(0);
    setHasMoreDepartments(true);
    loadMoreDepartments();
  };

  const handleUpdateDepartment = async () => {
    if (
      !editedDepartment?.name ||
      !editedDepartment?.displayName ||
      !editedDepartment?.departmentModerator
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    const payload = {
      deptName: editedDepartment.name.trim(),
      deptDisplayName: editedDepartment.displayName.trim(),
      deptModerator: editedDepartment.departmentModerator.trim(),
    };

    try {
      await updateDepartment(payload);

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.name === editedDepartment.originalName
            ? {
                ...dept,
                name: payload.deptName,
                displayName: payload.deptDisplayName,
                departmentModerator: payload.deptModerator,
              }
            : dept
        )
      );

      setSnackbar({
        open: true,
        message: "Department updated successfully",
        severity: "success",
      });

      setEditDialogOpen(false);
      setEditedDepartment(null);
    } catch (error) {
      console.error("Failed to update department:", error);
      setSnackbar({
        open: true,
        message: "Failed to update department. Please try again.",
        severity: "error",
      });
    }
  };

  const loadFilteredUsers = async () => {
    if (
      loadingFilteredUsers.current ||
      !hasMoreFilteredUsers ||
      !editedDepartment
    )
      return;
    loadingFilteredUsers.current = true;

    try {
      const res = await fetchUsersByDepartment(
        editedDepartment.name,
        filteredPage,
        10
      );
      const users = res?.data?.users || [];

      if (users.length < 10) setHasMoreFilteredUsers(false);

      // ✅ store only name and id (or just name if id not needed)
      const simplifiedUsers = users.map((u) => ({
        name: u.email,
        id: u.id, // optional, if you need it later
      }));

      setFilteredUsers((prev) => [...prev, ...simplifiedUsers]);
      setFilteredPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load users by department:", error);
    } finally {
      loadingFilteredUsers.current = false;
    }
  };

  const loadMoreUsers = async () => {
    if (loadingUsers.current || !hasMoreUsers) return;
    loadingUsers.current = true;

    try {
      const res = await fetchUsers(userPage);
      const users = res?.content || [];

      if (users.length < 10) setHasMoreUsers(false);

      setUserOptions((prev) => [...prev, ...users]);
      setUserPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      loadingUsers.current = false;
    }
  };

  const toBytes = (value) => {
    const num = parseFloat(value);
    const unit = value.replace(/[0-9.\s]/g, "").toLowerCase();

    switch (unit) {
      case "kb":
        return num * 1024;
      case "mb":
        return num * 1024 ** 2;
      case "gb":
        return num * 1024 ** 3;
      case "tb":
        return num * 1024 ** 4;
      default:
        return num; // assume already in bytes
    }
  };

  const handleStorageChange = async (deptName, newStorageDisplay) => {
    try {
      const res = await getDepartments(page, rowsPerPage);
      const allDepts = res.content;

      const targetDept = allDepts.find((d) => d.deptName === deptName);
      if (!targetDept) throw new Error("Target department not found");

      const payload = [
        {
          permissions: {
            id: targetDept.permissions?.id || "",
            userId: targetDept.deptName,
            deptName: targetDept.deptName,
            accessLevel: "EDITOR",
            accessCode: 111000,
            allowedStorageInBytes: toBytes(newStorageDisplay), // ✅ convert string to bytes
            allowedStorageInBytesDisplay: newStorageDisplay,
            currentStorageInBytes:
              targetDept.permissions?.currentStorageInBytes || 0,
            isDMS_CreateType: false,
            licenseTier: "PREMIUM",
            tenantId: targetDept.tenantId,
          },
        },
      ];

      await updateDepartmentStoragePermission(payload, page);

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.name === deptName
            ? { ...dept, allowedStorage: newStorageDisplay }
            : dept
        )
      );

      setSnackbar({
        open: true,
        message: `Storage updated to ${newStorageDisplay} for ${deptName}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Storage update failed:", error);
      setSnackbar({
        open: true,
        message: `Failed to update storage for ${deptName}`,
        severity: "error",
      });
    }
  };

  const [selected, setSelected] = useState([]);
  const [selectAllData, setSelectAllData] = useState(false);
  const [rowData, setRowData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  // Add this handler function
  const handleSearch = (results) => {
    if (!results || results.length === 0) {
      setFilteredDepartments([]);
      setSearchQuery("");
      return;
    }

    const filtered = departments.filter((dept) =>
      results.some(
        (result) =>
          result.name === dept.name ||
          result.displayName === dept.displayName ||
          result.roles.some((role) => dept.roles.includes(role))
      )
    );

    setFilteredDepartments(filtered);
    setSearchQuery(results.query || "");
  };

  // Add these handler functions
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = sortedDepartments.map((dept) => dept.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Add this handler function
  const handleToggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Add this handler function
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  const handleEditRole = (deptName, roleIndex, currentRole) => {
    setEditingRole({
      departmentName: deptName,
      roleIndex: roleIndex,
      value: currentRole,
    });
    setEditRoleDialog(true);
  };

  const handleDeleteRole = async (deptName, roleIndex) => {
    const department = departments.find((d) => d.name === deptName);
    if (!department) return;

    const roleToDelete = department.roles[roleIndex];
    console.log("roleToDeelete", roleToDelete);
    if (!roleToDelete || !roleToDelete.id) return;

    if (department.roles.length <= 1) {
      setSnackbar({
        open: true,
        message:
          "Cannot delete the last role. Department must have at least one role.",
        severity: "error",
      });
      return;
    }

    try {
      await deleteRole(roleToDelete.id); // ✅ pass role ID

      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.name === deptName
            ? {
                ...dept,
                roles: dept.roles.filter((_, i) => i !== roleIndex),
              }
            : dept
        )
      );

      setSnackbar({
        open: true,
        message: `Role "${roleToDelete.roleName}" deleted successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete role:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete role "${roleToDelete.roleName}"`,
        severity: "error",
      });
    }
  };

  const handleSaveRole = () => {
    if (!editingRole.value.trim()) {
      setSnackbar({
        open: true,
        message: "Role name cannot be empty",
        severity: "error",
      });
      return;
    }

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === editingRole.departmentName
          ? {
              ...dept,
              roles: dept.roles.map((role, i) =>
                i === editingRole.roleIndex ? editingRole.value : role.roleName
              ),
            }
          : dept
      )
    );

    setEditRoleDialog(false);
    setSnackbar({
      open: true,
      message: "Role updated successfully",
      severity: "success",
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBulkDownload = () => {
    try {
      const exportData = departments.map((dept) => ({
        Department: dept.name,
        "Display Name": dept.displayName,
        "Department Moderator": dept.departmentModerator,
        "Storage Allocated":
          dept?.permissions?.allowedStorageInBytesDisplay || "50GB",
        "Storage Consumed": dept?.permissions?.displayStorage || "0KB",
        Roles: `${dept.roles.length} (${dept.roles.join(", ")})`,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 25 }, // Department
        { wch: 15 }, // Display Name
        { wch: 25 }, // Department Owner
        { wch: 20 }, // Storage Allocated
        { wch: 50 }, // Combined Roles column
        { wch: 15 }, // Status column
        { wch: 10 }, // Edit column
      ];
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Departments");
      XLSX.writeFile(wb, "departments.xlsx");

      setSnackbar({
        open: true,
        message: "Departments exported successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error exporting departments",
        severity: "error",
      });
    }
  };

  const fileInputRef = useRef(null);

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Required columns
          const requiredColumns = {
            Department: false,
            "Display Name": false,
            "Department Moderator": false,
            "Storage Allocated": false,
            "Storage Consumed": false,
            Role: false,
          };

          if (jsonData.length > 0) {
            const firstRow = jsonData[0];
            Object.keys(firstRow).forEach((column) => {
              if (requiredColumns.hasOwnProperty(column)) {
                requiredColumns[column] = true;
              }
            });
          }

          const missingColumns = Object.entries(requiredColumns)
            .filter(([_, present]) => !present)
            .map(([column]) => column);

          if (missingColumns.length > 0) {
            setSnackbar({
              open: true,
              message: `Invalid file format. Missing required columns: ${missingColumns.join(
                ", "
              )}`,
              severity: "error",
            });
            return;
          }

          // Validate each row
          const invalidRows = [];
          jsonData.forEach((row, index) => {
            const rowNumber = index + 2;
            const errors = [];

            if (!row.Department) errors.push("Department");
            if (!row["Display Name"]) errors.push("Display Name");
            if (!row["Department Moderator"])
              errors.push("Department Moderator");
            if (!row["Storage Allocated"]) errors.push("Storage Allocated");
            if (row["Storage Consumed"] === undefined) {
              row["Storage Consumed"] = 0;
            }
            if (!row.Role) errors.push("Role");

            if (errors.length > 0) {
              invalidRows.push(
                `Row ${rowNumber} missing: ${errors.join(", ")}`
              );
            }
          });

          if (invalidRows.length > 0) {
            setSnackbar({
              open: true,
              message: `Validation failed:\n${invalidRows.join("\n")}`,
              severity: "error",
            });
            return;
          }

          // ✅ Transform rows to API payload
          const apiPayload = jsonData.map((row) => ({
            deptName: row["Department"],
            deptDisplayName: row["Display Name"],
            deptModerator: row["Department Moderator"],
            role: row["Role"],
            storage: row["Storage Allocated"],
          }));

          // ✅ Send API request
          try {
            await axios.post(
              `${window.__ENV__.REACT_APP_ROUTE}/tenants/BulkUpload`,
              apiPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${sessionStorage.getItem(
                    "authToken"
                  )}`,
                  username: `${sessionStorage.getItem("adminEmail")}`,
                },
              }
            );

            setSnackbar({
              open: true,
              message: "Bulk department upload successful",
              severity: "success",
            });

            // Optionally: refresh department list after upload
            // fetchDepartments();
          } catch (apiError) {
            console.error("API error:", apiError);
            setSnackbar({
              open: true,
              message: "Bulk upload failed. Please try again.",
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error processing file:", error);
          setSnackbar({
            open: true,
            message:
              "Error processing file. Please ensure it matches the template format.",
            severity: "error",
          });
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File read error:", error);
      setSnackbar({
        open: true,
        message: "Error uploading file.",
        severity: "error",
      });
    }

    event.target.value = ""; // Clear the file input
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowToggle = (index) => {
    setOpenRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Add sorting handler
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedDepartments = React.useMemo(() => {
    const deptToSort =
      filteredDepartments.length > 0 ? filteredDepartments : departments;

    if (!deptToSort) return [];

    return [...deptToSort].sort((a, b) => {
      if (orderBy === "roles") {
        return order === "asc"
          ? a.roles.length - b.roles.length
          : b.roles.length - a.roles.length;
      }

      const aVal = a[orderBy] || "";
      const bVal = b[orderBy] || "";

      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [departments, filteredDepartments, order, orderBy]);
  console.log("SSSS", sortedDepartments);

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "#ffffff",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#fffff",
    },
    "&:hover": {
      backgroundColor: "#f1f5f9 !important",
    },
    "&.Mui-selected": {
      backgroundColor: "rgba(25, 118, 210, 0.08) !important",
    },
    "&.Mui-selected:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.12) !important",
    },
    "& .MuiTableCell-root": {
      padding: "12px 16px",
      fontSize: "0.8125rem",
      color: "#334155",
      borderBottom: "1px solid #e2e8f0",
      whiteSpace: "nowrap",
      // ...commonTextStyle,
    },
    transition: "background-color 0.2s ease",
  }));

  // const handleAddDepartment = async () => {
  //   setNewDepartment((prev) => ({ ...prev, submitted: true }));

  //   const { name, displayName, departmentModerator, initialRole, storage } =
  //     newDepartment;

  //   if (!name || !displayName || !departmentModerator || !storage) {
  //     setSnackbar({
  //       open: true,
  //       message: "Please fill all required fields",
  //       severity: "error",
  //     });
  //     return;
  //   }

  //   const payload = {
  //     deptName: name.trim(),
  //     deptDisplayName: displayName.trim(),
  //     deptModerator: departmentModerator.trim(),
  //     storage: storage.trim(),
  //     role: initialRole.trim(),
  //   };

  //   try {
  //     await createDepartment(payload);

  //     const refreshed = await getDepartments();
  //     const mapped = refreshed.content.map((dept) => ({
  //       name: dept.deptName,
  //       displayName: dept.deptDisplayName,
  //       departmentModerator:
  //         dept.deptModerator || dept.permissions?.deptUsername || "",
  //       storage: dept.permissions?.displayStorage || "0 GB",
  //       allowedStorage:
  //         cleanDisplay(dept.permissions?.allowedStorageInBytesDisplay) ||
  //         "0 GB",
  //       roles: dept.roles?.map((r) => r.roleName) || [],
  //       userCount: dept.numberOfUsers || 0,
  //       isActive: dept.permissions?.active || false,
  //       createdAt: dept.createdOn,
  //     }));
  //     setDepartments(mapped);

  //     setTotalDepartments(refreshed.totalElements);

  //     setShowAddDepartment(false);

  //     setNewDepartment({
  //       name: "",
  //       displayName: "",
  //       initialRole: "",
  //       storage: "", // reset to empty
  //       departmentModerator: "",
  //       submitted: false,
  //     });

  //     setSnackbar({
  //       open: true,
  //       message: `Department "${payload.deptName}" created successfully.`,
  //       severity: "success",
  //     });
  //   } catch (error) {
  //     const errorMessage =
  //       error?.response?.data?.error || // ✅ NEW correct path
  //       error?.response?.data?.error || // fallback
  //       "Failed to create department. Please try again."; // final fallback

  //     console.log("errrrrr", errorMessage);

  //     if (/already exists/i.test(errorMessage)) {
  //       console.log("Duplicate department detected");
  //       setDuplicateDepartmentError(true);
  //     }

  //     setSnackbar({
  //       open: true,
  //       message: errorMessage,
  //       severity: "error",
  //     });
  //   }
  // };
  const handleAddDepartment = async () => {
    setNewDepartment((prev) => ({ ...prev, submitted: true }));

    const {
      name,
      displayName,
      departmentModerator,
      initialRole,
      storage,
      selectedUser,
    } = newDepartment;

    if (
      !name ||
      !displayName ||
      !departmentModerator ||
      !storage ||
      selectedUser.length === 0
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    const payload = {
      deptName: name.trim(),
      deptDisplayName: displayName.trim(),
      deptModerator: departmentModerator.trim(),
      storage: storage.trim(),
      role: initialRole.trim(),
      selectedUsers: selectedUser.map((u) => u.name), // ✅ send names of selected users
    };

    try {
      await createDepartment(payload);

      const refreshed = await getDepartments();
      const mapped = refreshed.content.map((dept) => ({
        name: dept.deptName,
        displayName: dept.deptDisplayName,
        departmentModerator:
          dept.deptModerator || dept.permissions?.deptUsername || "",
        storage: dept.permissions?.displayStorage || "0 GB",
        allowedStorage:
          cleanDisplay(dept.permissions?.allowedStorageInBytesDisplay) ||
          "0 GB",
        roles: dept.roles?.map((r) => r.roleName) || [],
        userCount: dept.numberOfUsers || 0,
        isActive: dept.permissions?.active || false,
        createdAt: dept.createdOn,
      }));
      setDepartments(mapped);
      setTotalDepartments(refreshed.totalElements);
      setShowAddDepartment(false);

      setNewDepartment({
        name: "",
        displayName: "",
        initialRole: "",
        storage: "",
        departmentModerator: "",
        selectedUser: [], // ✅ reset
        submitted: false,
      });

      setSnackbar({
        open: true,
        message: `Department "${payload.deptName}" created successfully.`,
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        "Failed to create department. Please try again.";

      console.log("errrrrr", errorMessage);

      if (/already exists/i.test(errorMessage)) {
        console.log("Duplicate department detected");
        setDuplicateDepartmentError(true);
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setSnackbar({
        open: true,
        message: "Role name cannot be empty",
        severity: "error",
      });
      return;
    }

    try {
      const payload = {
        department: selectedDepartment.name.trim(),
        role: newRole.trim(),
        isAdmin: isAdminRole,
      };

      await createRole(payload); // ✅ API call

      // ✅ Update departments list
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.name === selectedDepartment.name
            ? {
                ...dept,
                roles: [
                  ...dept.roles,
                  { roleName: newRole.trim(), isAdmin: isAdminRole },
                ],
              }
            : dept
        )
      );

      // ✅ Update selectedDepartment
      setSelectedDepartment((prev) => ({
        ...prev,
        roles: [
          ...prev.roles,
          { roleName: newRole.trim(), isAdmin: isAdminRole },
        ],
      }));

      setSnackbar({
        open: true,
        message: `Role "${newRole}" added successfully.`,
        severity: "success",
      });

      // ✅ Reset form
      setNewRole("");
      setShowAddRoleDialog(false);
      setIsAdminRole(false);
    } catch (error) {
      console.error("Failed to create role:", error);
      setSnackbar({
        open: true,
        message: "Failed to create role. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDepartmentToggle = (dept) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.name === dept.name ? { ...d, isActive: !d.isActive } : d
      )
    );
    setSnackbar({
      open: true,
      message: `Department "${dept.name}" ${
        !dept.isActive ? "activated" : "deactivated"
      }`,
      severity: "success",
    });
  };

  const handleEditDepartment = (dept) => {
    setEditedDepartment({
      ...dept,
      originalName: dept.name,
      departmentModerator: dept.departmentModerator || "", // ✅ add this
    });
    setEditDialogOpen(true);
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete?.name) return;

    try {
      await deleteDepartment(departmentToDelete.name);

      setDepartments((prev) =>
        prev.filter((d) => d.name !== departmentToDelete.name)
      );

      setSnackbar({
        open: true,
        message: `Department "${departmentToDelete.name}" deleted successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete department "${departmentToDelete.name}"`,
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };
  const handleTemplateDownload = () => {
    const headers = [
      "Department", // e.g., "IT"
      "Display Name", // e.g., "Information Technology"
      "Department Moderator", // e.g., "john.doe@example.com"
      "Storage Allocated", // e.g., "50 GB"
      "Storage Consumed", // e.g., "10 GB"
      "Role", // e.g., "Admin"
    ];

    const dummyData = [
      [
        "IT",
        "Information Technology",
        "john.doe@example.com",
        "50 GB",
        "10 GB",
        "Admin",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Department_Template.xlsx");
  };

  const handleBulkDownloadSelected = (selectedItems) => {
    try {
      const sourceData = rowData.length > 0 ? rowData : departments;
      const selectedDepartments = sourceData.filter((dept) =>
        selectedItems.includes(dept.name)
      );

      console.log(">>ssss", selectedDepartments);

      const exportData = selectedDepartments.flatMap((dept) => {
        if (!dept.roles || dept.roles.length === 0) {
          return [
            {
              Department: dept.name,
              "Display Name": dept.displayName,
              "Department Moderator": dept.departmentModerator,
              "Storage Allocated": dept.allowedStorage || "N/A",
              "Storage Consumed": dept.storage || "N/A",
              Role: "",
            },
          ];
        }

        return dept.roles.map((role) => ({
          Department: dept.name,
          "Display Name": dept.displayName,
          "Department Moderator": dept.departmentModerator,
          "Storage Allocated": dept.allowedStorage || "N/A",
          "Storage Consumed": dept.storage || "N/A",
          Role: role.roleName,
        }));
      });

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 25 }, // Department
        { wch: 15 }, // Display Name
        { wch: 25 }, // Department Moderator
        { wch: 20 }, // Storage Allocated
        { wch: 20 }, // Storage Consumed
        { wch: 30 }, // Role
      ];
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Selected Departments");
      XLSX.writeFile(wb, "selected_departments.xlsx");

      setSnackbar({
        open: true,
        message: `Successfully exported ${selectedItems.length} departments`,
        severity: "success",
      });
      setSelected([]);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Error exporting selected departments",
        severity: "error",
      });
    }
  };
  const cleanDisplay = (val) => {
    if (!val) return "";
    const [num, unit] = val.trim().split(/\s+/); // splits "25.00 GB" → ["25.00", "GB"]
    const rounded = parseFloat(num);
    return `${
      Number.isInteger(rounded) ? rounded : Math.floor(rounded)
    }${unit}`;
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        // const apiDepartments = await getDepartments();
        console.log("ppppp", page);
        const departmentData = await getDepartments(page, rowsPerPage);
        const apiDepartments = departmentData.content || [];
        console.log("apiDepartment", apiDepartments);

        setTotalDepartments(departmentData.totalElements || 0);

        // Map backend data to expected frontend format
        const mapped = apiDepartments.map((dept) => ({
          name: dept.deptName,
          displayName: dept.deptDisplayName,
          departmentModerator:
            dept.deptModerator || dept.permissions?.deptUsername || "",
          // storage: dept.permissions?.allowedStorageInBytesDisplay || "0 GB",
          storage: dept.permissions?.displayStorage || "0 GB",
          // allowedStorage:
          //   cleanDisplay(dept.permissions?.allowedStorageInBytesDisplay) ||
          //   "0 GB", // 🔥
          allowedStorage:
            dept.permissions?.allowedStorageInBytesDisplay === "0 bytes"
              ? "0 GB"
              : dept.permissions?.allowedStorageInBytesDisplay || "0 GB",

          // roles: dept.roles?.map((r) => r.roleName) || [],
          roles: dept.roles || [],

          userCount: dept.numberOfUsers || 0,
          isActive: dept.permissions?.active || false,
          createdAt: dept.createdOn,
        }));

        setDepartments(mapped);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch departments",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadMoreUsers();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100% ",
        marginLeft: "80px",
        marginTop: "12px",
        marginRight: "18px",
        overflow: "hidden",

        bgcolor: "#f5f5f5", // Whitesmoke background for the main container
        borderRadius: "20px",
        boxShadow: "2px 1px 11px 5px rgba(0, 0, 0, 0.2)!important",
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
    >
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 120px)",
          height: "calc(100vh - 120px)",
          backgroundColor: "#ffffff",
          "& .MuiTableHead-root": {
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#ffff",
            boxShadow: "0 1px 2px 0 rgba(59, 52, 52, 0.05)",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            backgroundColor: "#ffff",

            borderBottom: "2px solid #94a3b8", // Changed border color and made it thicker
            fontSize: "0.875rem",
            fontWeight: "700 !important",
            color: "#475569",
            height: "30px",
            padding: "2px 16px",
          },
          "& .MuiTableCell-root": {
            padding: "8px 16px",
            fontSize: "0.8125rem",
            color: "#334155",
            borderBottom: "1px solid #e2e8f0",
          },
          "& .MuiTable-root": {
            // borderCollapse: "separate",
            borderSpacing: 0,
            border: "1px solid #e2e8f0",
          },
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <Table sx={{ border: "0px solid #e2e8f0 !important" }}>
          <TableHead className={styles.tableHeader}>
            <TableRow
              sx={{ boxShadow: "0 -2px 8px 0 rgba(0, 0, 0, 0.2) !important" }}
            >
              <TableCell
                padding="checkbox"
                sx={{ width: "48px", textAlign: "center" }}
              >
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < sortedDepartments.length
                  }
                  checked={
                    sortedDepartments.length > 0 &&
                    selected.length === sortedDepartments.length
                  }
                  onChange={() => setSelectAllData(true)} // ✅ New line
                  inputProps={{ "aria-label": "select all departments" }}
                  size="small"
                />
              </TableCell>

              <TableCell
                sx={{
                  width: "100px",
                  padding: "8px 8px",
                  height: "40px",
                  fontWeight: "bold",
                  color: "#444",
                  // textAlign: "center",
                }}
              >
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleRequestSort("name")}
                  sx={{
                    "& .MuiTableSortLabel-icon": {
                      fontSize: "1.125rem",
                      color: "#64748b",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold !important",
                      fontSize: "15px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Department
                  </Typography>
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  width: "150px",
                  padding: "8px 8px",
                  height: "40px",
                  fontWeight: "bold",
                  color: "#444",
                  textAlign: "center",
                }}
              >
                <TableSortLabel
                  active={orderBy === "displayName"}
                  direction={orderBy === "displayName" ? order : "asc"}
                  onClick={() => handleRequestSort("displayName")}
                  sx={{
                    "& .MuiTableSortLabel-icon": {
                      fontSize: "1.125rem",
                      color: "#64748b",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold !important",
                      fontSize: "15px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Short name
                  </Typography>
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  // ...commonTextStyle,
                  width: "200px",
                  padding: "2px 8px",
                  height: "32px",
                  fontWeight: "bold",
                  color: "#444",
                  textAlign: "center",
                  alignItems: "center",
                }}
              >
                <TableSortLabel
                  active={orderBy === "departmentModerator"}
                  direction={orderBy === "departmentModerator" ? order : "asc"}
                  onClick={() => handleRequestSort("departmentModerator")}
                  sx={{
                    "& .MuiTableSortLabel-icon": {
                      fontSize: "1.125rem",
                      color: "#64748b",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      // ...commonTextStyle,
                      fontWeight: "bold !important",
                      fontSize: "15px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Department Moderator
                  </Typography>
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  width: "150px",
                  padding: "2px 8px",
                  height: "32px",
                  fontWeight: "bold",
                  color: "#444",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold !important",
                    fontSize: "15px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Storage
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: "150px",
                  padding: "2px 8px",
                  height: "32px",
                  fontWeight: "bold",
                  color: "#444",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold !important",
                    fontSize: "15px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Manage Storage
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  width: "150px",
                  padding: "2px 8px",
                  height: "32px",
                  fontWeight: "bold",
                  color: "#444",
                  textAlign: "center",
                }}
              >
                <TableSortLabel
                  active={orderBy === "roles"}
                  direction={orderBy === "roles" ? order : "asc"}
                  onClick={() => handleRequestSort("roles")}
                  sx={{
                    "& .MuiTableSortLabel-icon": {
                      fontSize: "1.125rem",
                      color: "#64748b",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      // ...commonTextStyle,
                      fontWeight: "bold !important",
                      fontSize: "15px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Number of Role
                  </Typography>
                </TableSortLabel>
              </TableCell>

              {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
              <TableCell
                sx={{
                  // ...commonTextStyle,
                  width: "150px",
                  padding: "2px 8px",
                  height: "32px",
                  fontWeight: "bold",
                  color: "#444",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body1"
                  // fontWeight="bold"
                  sx={{
                    fontWeight: "bold !important",
                    fontSize: "15px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDepartments?.map((dept, index) => {
              const isItemSelected = isSelected(dept.name);
              return (
                <React.Fragment key={index}>
                  <StyledTableRow
                    hover
                    // onClick={(event) => handleClick(event, dept.name)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{
                      cursor: "default", // Change cursor to default instead of pointer
                    }}
                  >
                    <TableCell
                      padding="checkbox"
                      sx={{
                        width: "48px",
                        padding: "2px 8px",
                        height: "32px",
                        textAlign: "center",
                      }}
                    >
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        size="small"
                        // onClick={(event) => event.stopPropagation()}
                        onChange={(event) => handleClick(event, dept.name)}
                      />
                    </TableCell>

                    <TableCell sx={{ padding: "2px 8px" }}>
                      {dept.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        // ...commonTextStyle,
                        textAlign: "center",
                        padding: "2px 8px",
                      }}
                    >
                      {dept.displayName}
                    </TableCell>
                    <TableCell
                      sx={{
                        // ...commonTextStyle,
                        textAlign: "center",
                        padding: "2px 8px",
                      }}
                    >
                      {dept.departmentModerator}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        padding: "2px 8px",
                      }}
                    >
                      {dept.storage}
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: "center",
                        padding: "2px 8px",
                      }}
                    >
                      <Select
                        // value={dept.storage}
                        value={dept.allowedStorage}
                        onChange={(e) =>
                          handleStorageChange(dept.name, e.target.value)
                        }
                        sx={{
                          width: "100px",
                          height: "30px",
                          borderRadius: "28px",
                        }}
                      >
                        {getStorageOptions(dept.allowedStorage).map(
                          (option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </TableCell>

                    <TableCell sx={{ padding: "2px 8px", textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="body2">
                          {dept.roles?.length || 0}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => handleRowToggle(index)}
                          sx={{
                            padding: "2px",
                            color: "#64748b",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          <KeyboardArrowDownIcon
                            sx={{
                              fontSize: "1.1rem",
                              transition: "transform 0.2s ease-in-out",
                              transform: openRows[index]
                                ? "rotate(-180deg)"
                                : "rotate(0)",
                            }}
                          />
                        </IconButton>

                        <Tooltip title="Add Role">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedDepartment(dept);
                              setShowAddRoleDialog(true);
                            }}
                            sx={{
                              padding: "2px",
                              color: "primary.main",
                              "&:hover": {
                                backgroundColor: "primary.lighter",
                              },
                            }}
                          >
                            <AddCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ padding: "2px 8px" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditDepartment(dept)}
                          sx={{
                            color: "#1976d2", // Brighter blue
                            "&:hover": {
                              backgroundColor: "#e3f2fd", // Light blue background on hover
                              color: "#1565c0", // Darker blue on hover
                            },
                            padding: "4px",
                          }}
                          title="Edit Department"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDepartmentToDelete(dept);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{
                            color: "#d32f2f", // Brighter red
                            "&:hover": {
                              backgroundColor: "#ffebee", // Light red background on hover
                              color: "#c62828", // Darker red on hover
                            },
                            padding: "4px",
                          }}
                          title="Delete Department"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </StyledTableRow>

                  <StyledTableRow key={index}>
                    <TableCell
                      style={{
                        paddingBottom: 0,
                        paddingTop: 0,
                        borderBottom: "none",
                        height: "auto",
                      }}
                      colSpan={6}
                    >
                      <ClickAwayListener
                        onClickAway={() =>
                          setOpenRows((prev) => ({ ...prev, [index]: false }))
                        }
                      >
                        <Collapse
                          in={openRows[index]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              left: "75%",
                              transform: "translateX(-50%)",
                              width: "250px",
                              backgroundColor: "#ffff",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              zIndex: 3,
                              marginTop: "4px",
                              maxHeight: "240px",
                              overflowY: "auto",

                              // ✅ Custom scrollbar width
                              "&::-webkit-scrollbar": {
                                width: "6px", // set to 6px or smaller
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#cbd5e1", // light gray
                                borderRadius: "4px",
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f5f9", // optional
                              },
                            }}
                          >
                            <Table size="small" aria-label="roles">
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      backgroundColor: "#f1f5f9",
                                      fontWeight: "600 !important",
                                      color: "#475569",
                                      fontSize: "0.75rem",
                                      borderBottom: "1px solid #e2e8f0",
                                      padding: "8px 12px",
                                      // ...commonTextStyle,
                                    }}
                                  >
                                    Role Name
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      backgroundColor: "#f1f5f9",
                                      fontWeight: "600 !important",
                                      color: "#475569",
                                      fontSize: "0.75rem",
                                      borderBottom: "1px solid #e2e8f0",
                                      padding: "8px 12px",
                                      width: "60px",
                                    }}
                                  >
                                    Actions
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dept.roles.map((role, roleIndex) => (
                                  <TableRow
                                    key={roleIndex}
                                    sx={{
                                      "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                      },
                                      "& td": {
                                        borderBottom:
                                          roleIndex === dept.roles.length - 1
                                            ? "none"
                                            : "1px solid #e2e8f0",
                                      },
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        // ...commonTextStyle,
                                        padding: "6px 12px",
                                        fontSize: "0.75rem",
                                        color: "#334155",
                                      }}
                                    >
                                      {role.roleName}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{
                                        padding: "4px 8px",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 0.5,
                                          justifyContent: "flex-end",
                                        }}
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleDeleteRole(
                                              dept.name,
                                              roleIndex
                                            )
                                          }
                                          sx={{
                                            padding: "2px",
                                            color: "error.main",
                                            "&:hover": {
                                              backgroundColor: "error.lighter",
                                            },
                                          }}
                                          title="Delete Role"
                                        >
                                          <DeleteIcon
                                            sx={{ fontSize: "0.875rem" }}
                                          />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </ClickAwayListener>
                    </TableCell>
                  </StyledTableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "#ffffff",
          // borderTop: '1px solid #e2e8f0',
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={totalDepartments}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "row-reverse",
            pr: 2,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBulkUpload}
            accept=".xlsx,.xls"
            style={{ display: "none" }}
          />
          <Tooltip title="Add Department" placement="left">
            <SpeedDial
              ariaLabel="Department actions"
              icon={<Add />}
              onClick={() => setShowAddDepartment(true)}
              direction="left"
              FabProps={{
                sx: {
                  bgcolor: "orange",

                  "&:hover": {
                    backgroundColor: "orange", // Keep the background color on hover
                    animation: "glowBorder 1.5s ease-in-out infinite", // Apply glowing animation on hover
                  },
                  width: 37,
                  height: 30,
                  "& .MuiSpeedDialIcon-root": {
                    fontSize: "1.2rem",
                    color: "white",
                  },
                },
              }}
            />
          </Tooltip>

          {selected.length > 0 && (
            <Tooltip title="Bulk Download" placement="left">
              <SpeedDial
                ariaLabel="Bulk Download"
                icon={<FileDownloadIcon />}
                direction="left"
                color="primary"
                FabProps={{
                  sx: {
                    width: 37,
                    height: 30,
                    "& .MuiSpeedDialIcon-root": {
                      fontSize: "1.2rem",
                      color: "white",
                    },
                  },
                }}
                onClick={() => handleBulkDownloadSelected(selected)}
              />
            </Tooltip>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Drawer
        anchor="left"
        open={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "absolute",
            top: "9%",
            left: "23%",
            width: "800px",
            height: "80vh", // ✅ fixed height
            maxHeight: "80vh",
            overflow: "hidden", // ✅ scroll handled inside
            animation: "slideInFromLeft 0.2s ease-in-out forwards",
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
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,

              backgroundColor: "primary.main",
            }}
          >
            <Typography variant="h6" sx={{ color: "#ffff" }}>
              New Department
            </Typography>
            <IconButton
              onClick={() => setShowAddDepartment(false)}
              size="small"
              sx={{
                color: "#ffff",
                width: 32,
                height: 32,
                border: "1px solid",
                borderColor: "#ffff",
                bgcolor: "error.lighter",
                borderRadius: "50%",
                position: "relative",
                "&:hover": {
                  // color: "error.dark",
                  // borderColor: "error.main",
                  // bgcolor: "error.lighter",
                  transform: "rotate(180deg)",
                },
                transition: "transform 0.3s ease",
              }}
            >
              <CloseIcon
                sx={{ fontSize: "1.1rem", transition: "transform 0.2s ease" }}
              />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              {/* First Card - Grouped Text Fields */}
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {[
                    {
                      label: "Department Name",
                      value: newDepartment.name,

                      onChange: (e) => {
                        setNewDepartment((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        setDuplicateDepartmentError(false); // reset on input
                      },
                      error:
                        (!newDepartment.name && newDepartment.submitted) ||
                        duplicateDepartmentError,
                      helperText:
                        !newDepartment.name && newDepartment.submitted
                          ? "Department name is required"
                          : duplicateDepartmentError
                          ? "Department with this name already exists"
                          : "",
                    },
                    {
                      label: "Short Name",

                      value: newDepartment.displayName,
                      onChange: (e) =>
                        setNewDepartment((prev) => ({
                          ...prev,
                          displayName: e.target.value.toUpperCase(),
                        })),
                      error:
                        !newDepartment.displayName && newDepartment.submitted,
                      helperText:
                        !newDepartment.displayName && newDepartment.submitted
                          ? "Display name is required"
                          : "Short form",
                    },
                    {
                      label: "Department Moderator",
                      value: newDepartment.departmentModerator,
                      onChange: (e) =>
                        setNewDepartment((prev) => ({
                          ...prev,
                          departmentModerator: e.target.value,
                        })),
                      error:
                        !newDepartment.departmentModerator &&
                        newDepartment.submitted,
                      helperText:
                        !newDepartment.departmentModerator &&
                        newDepartment.submitted
                          ? "Department Moderator is required"
                          : "",
                    },

                    {
                      label: "Initial Role",
                      value: newDepartment.initialRole,
                      onChange: (e) =>
                        setNewDepartment((prev) => ({
                          ...prev,
                          initialRole: e.target.value,
                        })),
                      error: false,
                      helperText: "Optional: You can add roles later",
                    },
                  ].map((field, index) => {
                    if (field.label === "Department Moderator") {
                      return (
                        <React.Fragment key={index}>
                          <Autocomplete
                            size="small"
                            fullWidth
                            options={userOptions}
                            getOptionLabel={(option) => option.email || ""}
                            value={
                              userOptions.find((u) => u.name === field.value) ||
                              null
                            }
                            onChange={(event, newValue) =>
                              setNewDepartment((prev) => ({
                                ...prev,
                                departmentModerator: newValue?.email || "",
                              }))
                            }
                            ListboxProps={{
                              style: { maxHeight: 300, overflow: "auto" },
                              onScroll: (event) => {
                                const listboxNode = event.currentTarget;
                                const threshold = 50;
                                if (
                                  listboxNode.scrollTop +
                                    listboxNode.clientHeight >=
                                  listboxNode.scrollHeight - threshold
                                ) {
                                  loadMoreUsers();
                                }
                              },
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Department Moderator"
                                FormHelperTextProps={{ sx: { ml: 0 } }}
                                error={field.error}
                                helperText={field.helperText}
                                required
                              />
                            )}
                          />

                          {/* ✅ New Select User Field */}
                          <Autocomplete
                            multiple
                            size="small"
                            fullWidth
                            options={userOptions}
                            getOptionLabel={(option) => option.name || ""}
                            value={newDepartment.selectedUser}
                            onChange={(event, newValue) =>
                              setNewDepartment((prev) => ({
                                ...prev,
                                selectedUser: newValue,
                              }))
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            ListboxProps={{
                              style: { maxHeight: 300, overflow: "auto" },
                              onScroll: (event) => {
                                const listboxNode = event.currentTarget;
                                const threshold = 50;
                                if (
                                  listboxNode.scrollTop +
                                    listboxNode.clientHeight >=
                                  listboxNode.scrollHeight - threshold
                                ) {
                                  loadMoreUsers();
                                }
                              },
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Users"
                                FormHelperTextProps={{ sx: { ml: 0 } }}
                                error={
                                  newDepartment.submitted &&
                                  newDepartment.selectedUser.length === 0
                                }
                                helperText={
                                  newDepartment.submitted &&
                                  newDepartment.selectedUser.length === 0
                                    ? "At least one user must be selected"
                                    : ""
                                }
                                required
                              />
                            )}
                          />
                        </React.Fragment>
                      );
                    }

                    return (
                      <TextField
                        key={index}
                        fullWidth
                        size="small"
                        FormHelperTextProps={{ sx: { ml: 0 } }}
                        label={field.label}
                        value={field.value}
                        onChange={field.onChange}
                        error={field.error}
                        helperText={field.helperText}
                        required
                      />
                    );
                  })}
                </CardContent>
              </Card>

              {/* Second Card - Storage Allocation */}
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={!newDepartment.storage && newDepartment.submitted}
                    FormHelperTextProps={{ sx: { ml: 0 } }} // ✅ Add here
                  >
                    <InputLabel id="storage-label">
                      Storage Allocation
                    </InputLabel>
                    <Select
                      labelId="storage-label"
                      value={newDepartment.storage}
                      label="Storage Allocation"
                      onChange={(e) =>
                        setNewDepartment((prev) => ({
                          ...prev,
                          storage: e.target.value,
                        }))
                      }
                      required
                    >
                      {[0, 25, 50, 75, 100, 150, 200].map((size) => (
                        <MenuItem key={size} value={`${size} GB`}>
                          {size} GB
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {!newDepartment.storage && newDepartment.submitted
                        ? "Storage allocation is required"
                        : ""}
                    </FormHelperText>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderTop: "1px solid #eee",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Download Template">
                <IconButton
                  onClick={handleTemplateDownload}
                  size="small"
                  sx={{
                    backgroundColor: "primary.lighter",
                    border: "1px solid",
                    borderColor: "primary.light",
                    color: "primary.main",
                    px: 1,
                    height: 36,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "primary.100",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2">Download Template</Typography>
                    <DownloadIcon sx={{ fontSize: 20 }} />
                  </Box>
                </IconButton>
              </Tooltip>

              <Tooltip title="Bulk Upload" componentsProps={{}}>
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                  sx={{
                    backgroundColor: "primary.dark",
                    border: "1px solid",
                    borderColor: "primary.light",
                    color: "white",
                    px: 1,
                    height: 36,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                      transform: "translateY(-1px)",
                      // boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2">Bulk Upload</Typography>
                    <UploadFileIcon sx={{ fontSize: 20 }} />
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              onClick={handleAddDepartment}
              variant="contained"
              sx={{
                background: "rgb(251, 68, 36)",
                "&:hover": {
                  background: "rgb(251, 68, 36)",
                },
                px: 3,
                py: 0.7,
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Drawer
        anchor="left"
        open={showAddRoleDialog}
        onClose={() => {
          setShowAddRoleDialog(false);
          setNewRole("");
        }}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "absolute",
            top: "30%",
            left: "40%",

            m: 0,
            height: "auto", // dynamic height
            maxHeight: "95vh", // prevent it from overflowin
            overflow: "hidden", // avoid extra scrollbars
            width: "350px",
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
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "primary.main",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffff" }}>
            Add Role to {selectedDepartment?.name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              setShowAddRoleDialog(false);
              setNewRole("");
            }}
            sx={{
              color: "#ffff",
              border: "1px solid",
              borderColor: "#ffff",
              bgcolor: "error.lighter",
              "&:hover": {
                // bgcolor: "error.light",
                transform: "rotate(180deg)",
              },
              transition: "all 0.3s ease",
              borderRadius: "50%",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, flexGrow: 1 }}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="New Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                sx={{ mb: 2 }}
              />
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={isAdminRole}
                    onChange={(e) => setIsAdminRole(e.target.checked)}
                    color="primary"
                  />
                }
                label="Admin Role"
              /> */}
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            onClick={() => {
              setShowAddRoleDialog(false);
              setNewRole("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddRole}
            variant="contained"
            color="primary"
            sx={{ background: "rgb(251, 68, 36)" }}
          >
            Add
          </Button>
        </Box>
      </Drawer>

      <Drawer
        anchor="left"
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            // boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "absolute",
            top: "20%",
            left: "35%",
            transform: "translate(-50%, -50%)",
            m: 0,
            height: "auto", // dynamic height
            maxHeight: "95vh", // prevent it from overflowin
            overflow: "hidden", // avoid extra scrollbars
            width: "550px",
            padding: "10px",
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
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "primary.main",
            // borderRadius:"20px",
            margin: 0,
            padding: 1,
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffff" }}>
            Edit Department
          </Typography>
          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{
              color: "#ffff",
              border: "1px solid",
              borderColor: "#ffff",
              bgcolor: "error.lighter",
              "&:hover": {
                // bgcolor: "error.light",
                transform: "rotate(180deg)",
              },
              transition: "all 0.3s ease",
              borderRadius: "50%",
              size: "small",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Card elevation={1} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Tooltip title="Department Name cannot be edited" arrow>
                <TextField
                  fullWidth
                  size="small"
                  label="Department Name"
                  value={editedDepartment?.name || ""}
                  disabled
                  helperText="This field is locked"
                />
              </Tooltip>

              <TextField
                size="small"
                label="Display Name"
                fullWidth
                required
                value={editedDepartment?.displayName || ""}
                onChange={(e) =>
                  setEditedDepartment((prev) => ({
                    ...prev,
                    displayName: e.target.value.toUpperCase(),
                  }))
                }
              />

              <Box display="flex" alignItems="center" gap={1} mt={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Department Moderator"
                  value={editedDepartment?.departmentModerator || ""}
                  InputProps={{
                    readOnly: true,
                  }}
                />

                <Button
                  variant="outlined"
                  size="small"
                  ref={anchorRef}
                  onClick={() => {
                    setShowUserDropdown(true);
                    setFilteredUsers([]); // reset list
                    setFilteredPage(0); // reset page
                    setHasMoreFilteredUsers(true); // reset scroll
                    loadFilteredUsers(); // 🔥 fetch on click
                  }}
                >
                  Select New Moderator
                </Button>
              </Box>

              <Popper
                open={showUserDropdown}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                disablePortal={false}
                flip={false}
                transition
                modifiers={[
                  {
                    name: "zIndex",
                    enabled: true,
                    phase: "write",
                    fn({ state }) {
                      state.styles.popper.zIndex = 1600;
                    },
                  },
                ]}
              >
                {({ TransitionProps }) => (
                  <Grow {...TransitionProps}>
                    <Paper
                      sx={{ maxHeight: 300, overflowY: "auto", width: 300 }}
                    >
                      <Box
                        sx={{ maxHeight: 300, overflowY: "auto" }}
                        onScroll={(event) => {
                          const { scrollTop, clientHeight, scrollHeight } =
                            event.currentTarget;
                          if (scrollTop + clientHeight >= scrollHeight - 50) {
                            loadFilteredUsers(); // 🔁 loads more filtered users
                          }
                        }}
                      >
                        {filteredUsers.map((user, index) => (
                          <MenuItem
                            key={index}
                            onClick={() => {
                              setEditedDepartment((prev) => ({
                                ...prev,
                                departmentModerator: user.name,
                              }));
                              setShowUserDropdown(false);
                            }}
                          >
                            {user.name}
                          </MenuItem>
                        ))}
                        {filteredUsers.length === 0 && (
                          <MenuItem disabled>No users found</MenuItem>
                        )}
                      </Box>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
        >
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>

          <Button
            onClick={handleUpdateDepartment}
            variant="contained"
            sx={{
              background: "rgb(251, 68, 36)",
              "&:hover": {
                background: "rgb(251, 68, 36)",
              },
              px: 3,
              py: 0.7,
            }}
          >
            Save
          </Button>
        </Box>
      </Drawer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Confirm Delete
        </DialogTitle>

        <DialogContent>
          Are you sure you want to delete department "{departmentToDelete?.name}
          "? This action cannot be undone.
        </DialogContent>

        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Box>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteDepartment}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              handleOpenMigration(departmentToDelete);
              setMigrationDialogOpen(true);
              setDepartmentToMigrate(departmentToDelete);
              setDeleteDialogOpen(false);
              setAllDepartments([]); // reset list
              setMigrationPage(0);
              setHasMoreDepartments(true);
              loadMoreDepartments(); // fetch first page
            }}
          >
            Migration
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Migrate Users
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Migrate users from <b>{departmentToMigrate?.name}</b> to:
          </Typography>

          <Box
            sx={{
              maxHeight: 250,
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 1,
              mt: 1,
              p: 1,
              bgcolor: "#f9f9f9",
            }}
            onScroll={(e) => {
              const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
              if (scrollTop + clientHeight >= scrollHeight - 50) {
                loadMoreDepartments(); // fetch more
              }
            }}
          >
            {allDepartments
              .filter((d) => d.deptName !== departmentToMigrate?.name)
              .map((dept) => (
                <MenuItem
                  key={dept.deptName}
                  selected={targetDepartment === dept.deptName}
                  onClick={() => setTargetDepartment(dept.deptName)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor:
                      targetDepartment === dept.deptName
                        ? "#e3f2fd"
                        : "transparent",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {dept.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dept.deptName}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMigrationDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!targetDepartment) {
                setSnackbar({
                  open: true,
                  message: "Please select a target department.",
                  severity: "error",
                });
                return;
              }

              setSnackbar({
                open: true,
                message: `Users migrated to ${targetDepartment}`,
                severity: "success",
              });
              setMigrationDialogOpen(false);
            }}
          >
            Migrate
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editRoleDialog}
        onClose={() => setEditRoleDialog(false)}
        maxWidth="xs"
      >
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={editingRole.value}
            onChange={(e) =>
              setEditingRole((prev) => ({ ...prev, value: e.target.value }))
            }
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={selectAllData}
        onClose={() => setSelectAllData(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2", // Material UI blue[700]
            color: "white",
            fontWeight: "bold",
          }}
        >
          Select Departments
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Do you want to select all departments or just those on the current
            page?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectAllData(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const currentIds = sortedDepartments.map((d) => d.name);
              setSelected(currentIds);
              setRowData(sortedDepartments);
              setSelectAllData(false);
            }}
          >
            Select Current Page ({sortedDepartments.length})
          </Button>
          <Button
            color="error"
            onClick={async () => {
              try {
                setLoading(true);
                const first = await getDepartments(0, rowsPerPage);
                let allDepartments = [...first.content];
                const totalPages = first.totalPages;

                const promises = [];
                for (let i = 1; i < totalPages; i++) {
                  promises.push(getDepartments(i, rowsPerPage));
                }

                const results = await Promise.all(promises);
                results.forEach((res) => {
                  allDepartments.push(...res.content);
                });

                const mapped = allDepartments.map((dept) => ({
                  name: dept.deptName,
                  displayName: dept.deptDisplayName,
                  departmentModerator:
                    dept.deptModerator || dept.permissions?.deptUsername || "",
                  storage: dept.permissions?.displayStorage || "0 GB",
                  allowedStorage:
                    dept.permissions?.allowedStorageInBytesDisplay || "0 GB",
                  roles: dept.roles?.map((r) => r.roleName) || [],
                  userCount: dept.numberOfUsers || 0,
                  isActive: dept.permissions?.active || false,
                  createdAt: dept.createdOn,
                }));

                setSelected(mapped.map((d) => d.name));
                setRowData(mapped);
                setSelectAllData(false);
              } catch (error) {
                console.error("Error selecting all departments:", error);
                setSnackbar({
                  open: true,
                  message: "Failed to fetch all departments",
                  severity: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            Select All Departments
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Department;
