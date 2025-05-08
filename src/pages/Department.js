import React, { useState, useRef, useEffect } from "react";
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
import { Card, CardContent } from "@mui/material";
import { CircularProgress, keyframes } from '@mui/material';


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

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Drawer from "@mui/material/Drawer";

import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { ManageAccounts as ManageAccountsIcon } from "@mui/icons-material";
import ClickAwayListener from "@mui/material/ClickAwayListener";

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
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1300,
  animation: `${fadeIn} 0.5s ease-in-out`,
}));

// Styled CircularProgress
const CustomSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: '60px !important',
  height: '80px !important',
  thickness: 2,
}));

function Department({ departments, setDepartments, onThemeToggle }) {
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(9); // Default to 25 rows

  const [openRows, setOpenRows] = useState({});

  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

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
    storage: "50GB", // Default storage value

    departmentModerator: "", // Add this line
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

  // Add these new state variables after other state declarations
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState({
    departmentIndex: null,
    roleIndex: null,
    value: "",
  });

  const storageOptions = [
    "0GB",
    "25GB",
    "50GB",
    "75GB",
    "100GB",
    "150GB",
    "200GB",
  ];

  const handleStorageChange = (name, newStorage) => {
    const updated = departments.map((dept) =>
      dept.name === name ? { ...dept, storage: newStorage } : dept
    );
    setDepartments(updated);
  };

  // Add these at the top of your component with other state declarations
  const [selected, setSelected] = useState([]);
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

  const handleDeleteRole = (deptName, roleIndex) => {
    setDepartments((prevDepartments) => {
      return prevDepartments.map((dept) => {
        if (dept.name !== deptName) return dept;

        if (dept.roles.length <= 1) {
          setSnackbar({
            open: true,
            message:
              "Cannot delete the last role. Department must have at least one role.",
            severity: "error",
          });
          return dept;
        }

        const updatedRoles = dept.roles.filter((_, i) => i !== roleIndex);
        return { ...dept, roles: updatedRoles };
      });
    });

    setSnackbar({
      open: true,
      message: "Role deleted successfully",
      severity: "success",
    });
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
              i === editingRole.roleIndex ? editingRole.value : role
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
        "Department Moderator": dept.departmentModerator, // Added Department Owner
        "Storage Allocated": dept.storage || "50GB",
        Roles: `${dept.roles.length} (${dept.roles.join(", ")})`,
        Status: dept.isActive ? "Active" : "Inactive", // Add Status column
        Edit: "No",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);

      // Updated column widths to include Status
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
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Required columns
          const requiredColumns = {
            Department: false,
            "Display Name": false,
            "Department Moderator": false, // Added Department Owner
            "Storage Allocated": false,
            Role: false,
            Status: false,
            Edit: false,
            Delete: false,
          };

          // Check which columns are present in the first row
          if (jsonData.length > 0) {
            const firstRow = jsonData[0];
            Object.keys(firstRow).forEach((column) => {
              if (requiredColumns.hasOwnProperty(column)) {
                requiredColumns[column] = true;
              }
            });
          }

          // Find missing columns
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

          // Validate data in each row
          const invalidRows = [];
          jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // Add 2 because Excel rows start at 1 and we skip header
            const errors = [];

            if (!row.Department) errors.push("Department");
            if (!row["Display Name"]) errors.push("Display Name");
            if (!row["Department Moderator"])
              errors.push("Department Moderator"); // Added validation
            if (!row["Storage Allocated"]) errors.push("Storage Allocated");
            if (row.Role === undefined) errors.push("Role");
            if (!row.Status) errors.push("Status");
            if (row.Edit === undefined) errors.push("Edit");
            if (row.Delete === undefined) errors.push("Delete");

            if (errors.length > 0) {
              invalidRows.push(
                `Row ${rowNumber} missing values for: ${errors.join(", ")}`
              );
            }
          });

          if (invalidRows.length > 0) {
            setSnackbar({
              open: true,
              message: `Data validation failed:\n${invalidRows.join("\n")}`,
              severity: "error",
            });
            return;
          }

          // Validation check
          const isValidData = jsonData.every(
            (row) =>
              row.Department &&
              row["Display Name"] &&
              row["Storage Allocated"] &&
              row.Role !== undefined &&
              row.Status &&
              row.Edit !== undefined &&
              row.Delete !== undefined
          );

          if (!isValidData) {
            setSnackbar({
              open: true,
              message: "Invalid file format. Please use the correct template.",
              severity: "error",
            });
            return;
          }

          // Group rows by department
          const departmentGroups = {};
          jsonData.forEach((row) => {
            if (!departmentGroups[row.Department]) {
              departmentGroups[row.Department] = [];
            }
            departmentGroups[row.Department].push(row);
          });

          let updatedDepartmentsList = [...departments];

          let operationSummary = {
            added: [],
            updated: [],
            deleted: [],
            rolesAdded: {},
            rolesDeleted: {},
            rolesUpdated: {},
            skipped: [],
          };

          // Process each department
          Object.entries(departmentGroups).forEach(([deptName, rows]) => {
            const existingDeptIndex = updatedDepartmentsList.findIndex(
              (d) => d.name === deptName
            );

            if (existingDeptIndex !== -1) {
              if (rows[0].Edit?.toString().toLowerCase() === "yes") {
                // Update department details
                updatedDepartmentsList[existingDeptIndex] = {
                  ...updatedDepartmentsList[existingDeptIndex],
                  displayName: rows[0]["Display Name"],
                  departmentModerator: rows[0]["Department Moderator"],
                  storage: rows[0]["Storage Allocated"],
                  isActive: rows[0].Status.toLowerCase() === "active",
                };
                operationSummary.updated.push(deptName);
              } else {
                operationSummary.skipped.push(deptName);
              }

              // Track role changes
              const initialRoles = [
                ...updatedDepartmentsList[existingDeptIndex].roles,
              ];

              // Process role deletions
              const updatedRoles = updatedDepartmentsList[
                existingDeptIndex
              ].roles.filter(
                (role) =>
                  !rows.some(
                    (row) =>
                      row.Role === role &&
                      row.Delete?.toString().toLowerCase() === "yes"
                  )
              );

              // Track deleted roles
              const deletedRoles = initialRoles.filter(
                (role) => !updatedRoles.includes(role)
              );
              if (deletedRoles.length > 0) {
                operationSummary.rolesDeleted[deptName] = deletedRoles;
              }

              // Add new roles
              const initialRolesCount = updatedRoles.length;
              rows.forEach((row) => {
                if (
                  row.Delete?.toString().toLowerCase() !== "yes" &&
                  !updatedRoles.includes(row.Role) &&
                  row.Role
                ) {
                  updatedRoles.push(row.Role);
                }
              });

              // Track added roles
              const addedRoles = updatedRoles.slice(initialRolesCount);
              if (addedRoles.length > 0) {
                operationSummary.rolesAdded[deptName] = addedRoles;
              }

              if (updatedRoles.length === 0) {
                // Remove department if no roles remain
                updatedDepartmentsList = updatedDepartmentsList.filter(
                  (_, index) => index !== existingDeptIndex
                );
                operationSummary.deleted.push(deptName);
              } else {
                updatedDepartmentsList[existingDeptIndex].roles = updatedRoles;
              }
            } else {
              // New department
              const newDeptRoles = rows
                .filter((row) => row.Delete?.toString().toLowerCase() !== "yes")
                .map((row) => row.Role)
                .filter((role) => role);

              if (newDeptRoles.length > 0) {
                updatedDepartmentsList.push({
                  name: deptName,
                  displayName: rows[0]["Display Name"],
                  departmentModerator: rows[0]["Department Moderator"],
                  storage: rows[0]["Storage Allocated"],
                  roles: newDeptRoles,
                  isActive: rows[0].Status.toLowerCase() === "active",
                });
                operationSummary.added.push(deptName);
                operationSummary.rolesAdded[deptName] = newDeptRoles;
              }
            }
          });

          // Update state and localStorage
          setDepartments(updatedDepartmentsList);
          localStorage.setItem(
            "departments",
            JSON.stringify(updatedDepartmentsList)
          );

          let summaryMessages = [];

          if (operationSummary.added.length > 0) {
            summaryMessages.push(
              `Added departments: ${operationSummary.added.join(", ")}`
            );
          }

          if (operationSummary.updated.length > 0) {
            summaryMessages.push(
              `Updated departments: ${operationSummary.updated.join(", ")}`
            );
          }

          if (operationSummary.deleted.length > 0) {
            summaryMessages.push(
              `Deleted departments: ${operationSummary.deleted.join(", ")}`
            );
          }

          Object.entries(operationSummary.rolesAdded).forEach(
            ([dept, roles]) => {
              summaryMessages.push(
                `Added roles in ${dept}: ${roles.join(", ")}`
              );
            }
          );

          Object.entries(operationSummary.rolesDeleted).forEach(
            ([dept, roles]) => {
              summaryMessages.push(
                `Deleted roles in ${dept}: ${roles.join(", ")}`
              );
            }
          );

          if (operationSummary.skipped.length > 0) {
            summaryMessages.push(
              `Skipped departments (no changes): ${operationSummary.skipped.join(
                ", "
              )}`
            );
          }

          setSnackbar({
            open: true,
            message:
              summaryMessages.length > 0
                ? summaryMessages.join("\n")
                : "No changes were made",
            severity: "success",
          });
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
      console.error("Error uploading file:", error);
      setSnackbar({
        open: true,
        message: "Error uploading file",
        severity: "error",
      });
    }

    event.target.value = "";
  };

  // Add pagination handlers
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

      // ... existing sorting logic for other columns
      return order === "asc"
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    });
  }, [departments, filteredDepartments, order, orderBy]);

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

  const handleAddDepartment = () => {
    setNewDepartment((prev) => ({ ...prev, submitted: true }));

    if (
      !newDepartment.name ||
      !newDepartment.displayName ||
      // !newDepartment.initialRole ||
      !newDepartment.storage ||
      // !newDepartment.reportingManager ||
      !newDepartment.departmentModerator
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    if (departments.some((dept) => dept.name === newDepartment.name)) {
      setSnackbar({
        open: true,
        message: "Department already exists",
        severity: "error",
      });
      return;
    }

    const newDeptWithRole = {
      name: newDepartment.name,
      displayName: newDepartment.displayName,
      // roles: [newDepartment.initialRole],
      roles: newDepartment.initialRole ? [newDepartment.initialRole] : [],

      storage: newDepartment.storage,
      // reportingManager: newDepartment.reportingManager,
      departmentModerator: newDepartment.departmentModerator,
      userCount: 0, // Initialize user count
      isActive: true, // Initialize as active
      createdAt: new Date().toISOString(), // Add creation timestamp
    };

    const updatedDepartments = [...departments, newDeptWithRole];

    try {
      // Update state and localStorage
      setDepartments(updatedDepartments);
      localStorage.setItem("departments", JSON.stringify(updatedDepartments));

      // Reset form
      setShowAddDepartment(false);
      setNewDepartment({
        name: "",
        displayName: "",
        initialRole: "",
        storage: "50GB",
        // reportingManager: "",
        submitted: false,
      });

      // Show success message
      setSnackbar({
        open: true,
        message: `Department "${newDepartment.name}" added successfully with role "${newDepartment.initialRole}"!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding department:", error);
      setSnackbar({
        open: true,
        message: "Error adding department. Please try again.",
        severity: "error",
      });
    }
  };

  // Add new handler function
  const handleAddRole = () => {
    if (!newRole.trim()) {
      setSnackbar({
        open: true,
        message: "Role name cannot be empty",
        severity: "error",
      });
      return;
    }

    if (selectedDepartment.roles.includes(newRole.trim())) {
      setSnackbar({
        open: true,
        message: "Role already exists in this department",
        severity: "error",
      });
      return;
    }

    // Update departments state with new role
    const updatedDepartments = departments.map((dept) =>
      dept.name === selectedDepartment.name
        ? { ...dept, roles: [...dept.roles, newRole.trim()] }
        : dept
    );

    // Update state and localStorage
    setDepartments(updatedDepartments);
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));

    setSnackbar({
      open: true,
      message: `Role "${newRole}" added to department "${selectedDepartment.name}"`,
      severity: "success",
    });
    setNewRole("");
    setShowAddRoleDialog(false);
  };

  // Add after other handler functions
  const handleDepartmentToggle = (dept) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.name === dept.name ? { ...d, isActive: !d.isActive } : d
      )
    );
    setSnackbar({
      open: true,
      message: `Department "${dept.name}" ${!dept.isActive ? "activated" : "deactivated"
        }`,
      severity: "success",
    });
  };

  const handleEditDepartment = (dept) => {
    setEditedDepartment({
      ...dept,
      originalName: dept.name,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteDepartment = () => {
    setDepartments((prev) =>
      prev.filter((d) => d.name !== departmentToDelete.name)
    );
    setDeleteDialogOpen(false);
    setSnackbar({
      open: true,
      message: `Department "${departmentToDelete.name}" deleted successfully`,
      severity: "success",
    });
    setDepartmentToDelete(null);
  };

  const handleTemplateDownload = () => {
    const template = [
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Department Moderator": "John Doe", // Added Department Owner
        "Storage Allocated": "50GB",
        Role: "Role1",
        Status: "Active",
        Edit: "No",
        Delete: "No", // Added Delete column
      },
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Department Moderator": "John Doe", // Added Department Owner
        "Storage Allocated": "50GB",
        Role: "Role2",
        Status: "Active",
        Edit: "No",
        Delete: "No", // Added Delete column
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);

    const wscols = [
      { wch: 25 }, // Department
      { wch: 15 }, // Display Name
      { wch: 25 }, // Department Owner
      { wch: 20 }, // Storage Allocated
      { wch: 30 }, // Role
      { wch: 15 }, // Status
      { wch: 10 }, // Edit
      { wch: 10 }, // Delete
    ];
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "department_upload_template.xlsx");
  };

  const handleBulkDownloadSelected = (selectedItems) => {
    try {
      const selectedDepartments = departments.filter((dept) =>
        selectedItems.includes(dept.name)
      );

      const exportData = selectedDepartments.flatMap((dept) => {
        if (!dept.roles || dept.roles.length === 0) {
          return [
            {
              Department: dept.name,
              "Display Name": dept.displayName,
              "Department Moderator": dept.departmentModerator, // Added Department Owner
              "Storage Allocated": dept.storage || "50GB",
              Role: "",
              Status: dept.isActive ? "Active" : "Inactive",
              Edit: "No",
              Delete: "No", // Added Delete column
            },
          ];
        }

        return dept.roles.map((role) => ({
          Department: dept.name,
          "Display Name": dept.displayName,
          "Department Moderator": dept.departmentModerator, // Added Department Owner
          "Storage Allocated": dept.storage || "50GB",
          Role: role,
          Status: dept.isActive ? "Active" : "Inactive",
          Edit: "No",
          Delete: "No", // Added Delete column
        }));
      });

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 25 }, // Department
        { wch: 15 }, // Display Name
        { wch: 25 }, // Department Owner
        { wch: 20 }, // Storage Allocated
        { wch: 30 }, // Role
        { wch: 15 }, // Status
        { wch: 10 }, // Edit
        { wch: 10 }, // Delete
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
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Error exporting selected departments",
        severity: "error",
      });
    }
  };
  // useEffect(() => {
  //   // Simulate API call delay or loading state
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500); // 1.5 seconds

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);


  // if (loading) {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       height="100vh"
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (loading) {
    return (
      <LoaderWrapper>
        <CustomSpinner />
      </LoaderWrapper>
    );
  }

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
                  onChange={handleSelectAllClick}
                  inputProps={{
                    "aria-label": "select all departments",
                  }}
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
            {sortedDepartments
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((dept, index) => {
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
                          value={dept.storage}
                          onChange={(e) =>
                            handleStorageChange(dept.name, e.target.value)
                          }
                          sx={{
                            width: "100px",
                            height: "30px",
                            borderRadius: "28px",
                          }}
                        >
                          {storageOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      <TableCell
                        sx={{ padding: "2px 8px", textAlign: "center" }}
                      >
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
                          <Tooltip
                            title={dept.isActive ? "Active" : "Inactive"}
                          >
                            <FormControlLabel
                              control={
                                <IOSSwitch
                                  size="small"
                                  checked={dept.isActive}
                                  onChange={() => handleDepartmentToggle(dept)}
                                />
                              }
                            />
                          </Tooltip>

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
                                left: "75%", // Center horizontally within the cell
                                transform: "translateX(-50%)", // Center adjust
                                width: "250px",
                                backgroundColor: "#ffff",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                zIndex: 3,
                                marginTop: "4px", // Small gap from the count
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
                                          backgroundColor:
                                            "rgba(0, 0, 0, 0.02)",
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
                                        {role}
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
                                            // onClick={() =>
                                            //   handleEditRole(
                                            //     index,
                                            //     roleIndex,
                                            //     role
                                            //   )
                                            // }
                                            onClick={() =>
                                              handleEditRole(
                                                dept.name,
                                                roleIndex,
                                                role
                                              )
                                            }
                                            sx={{
                                              padding: "2px",
                                              color: "primary.main",
                                              "&:hover": {
                                                backgroundColor:
                                                  "primary.lighter",
                                              },
                                            }}
                                            title="Edit Role"
                                          >
                                            <EditIcon
                                              sx={{ fontSize: "0.875rem" }}
                                            />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            // onClick={() =>
                                            //   handleDeleteRole(index, roleIndex)
                                            // }
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
                                                backgroundColor:
                                                  "error.lighter",
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
          rowsPerPageOptions={[9, 18, 27]}
          component="div"
          count={departments?.length}
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
                  // "&:hover": {
                  //   bgcolor: "orange",
                  // },
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
            top: "5%",
            left: "35%",
            // transform: "translate(-50%, -50%)",
            m: 0,
            height: "auto", // dynamic height
            maxHeight: "95vh", // prevent it from overflowin
            overflow: "hidden", // avoid extra scrollbars
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
        <Box sx={{ height: "70%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,

              backgroundColor: "primary.main"
            }}
          >
            <Typography variant="h6" sx={{ color: "#ffff" }}>New Department</Typography>
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
                      onChange: (e) =>
                        setNewDepartment((prev) => ({
                          ...prev,
                          name: e.target.value,
                        })),
                      error: !newDepartment.name && newDepartment.submitted,
                      helperText:
                        !newDepartment.name && newDepartment.submitted
                          ? "Department name is required"
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
                      error:
                        !newDepartment.initialRole && newDepartment.submitted,
                      helperText:
                        !newDepartment.initialRole && newDepartment.submitted
                          ? "At least one role is required"
                          : "",
                    },
                  ].map((field, index) => (
                    <TextField
                      key={index}
                      fullWidth
                      size="small"
                      label={field.label}
                      value={field.value}
                      onChange={field.onChange}
                      error={field.error}
                      helperText={field.helperText}
                      required
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Second Card - Storage Allocation */}
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={!newDepartment.storage && newDepartment.submitted}
                  >
                    <InputLabel id="storage-label">
                      Storage Allocation
                    </InputLabel>
                    <Select
                      labelId="storage-label"
                      value={newDepartment.storage || "50GB"}
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
                        <MenuItem key={size} value={`${size}GB`}>
                          {size} GB
                        </MenuItem>
                      ))}
                    </Select>
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
            // transform: "translate(-50%, -50%)",
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
            backgroundColor: "primary.main"
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
              />
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
          <Button onClick={handleAddRole} variant="contained" color="primary" sx={{ background: "rgb(251, 68, 36)", }}>
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
            top: "30%",
            left: "40%",
            transform: "translate(-50%, -50%)",
            m: 0,
            height: "auto", // dynamic height
            maxHeight: "95vh", // prevent it from overflowin
            overflow: "hidden", // avoid extra scrollbars
            width: "450px",
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
            padding: 1

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
              size: "small"
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form Fields */}
        <Card elevation={1} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                size="small"
                label="Department Name"
                fullWidth
                required
                value={editedDepartment?.name || ""}
                onChange={(e) =>
                  setEditedDepartment((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
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
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
        >
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            sx={{ background: "rgb(251, 68, 36)", }}
            variant="contained"
            color="primary"
            onClick={() => {
              setDepartments((prev) =>
                prev.map((d) =>
                  d.name === editedDepartment.originalName
                    ? { ...editedDepartment, name: editedDepartment.name }
                    : d
                )
              );
              setEditDialogOpen(false);
              setSnackbar({
                open: true,
                message: "Department updated successfully",
                severity: "success",
              });
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete department "{departmentToDelete?.name}
          "? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDepartment} color="error">
            Delete
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
    </Box>
  );
}

export default Department;
