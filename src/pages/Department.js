import React, { useState, useRef } from "react";
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
} from "@mui/material";
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
} from "@mui/icons-material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { ManageAccounts as ManageAccountsIcon } from "@mui/icons-material";

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

// Add this after your imports
const commonTextStyle = {
  fontFamily: '"Be Vietnam", sans-serif',
};

function Department({ departments, setDepartments, onThemeToggle }) {
  // Add pagination state
  const [page, setPage] = useState(0);
  // const [rowsPerPage] = useState(9);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 25 rows

  const [openRows, setOpenRows] = useState({});

  // Add sorting state
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");

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
    reportingManager: "", // Add this field
    departmentOwner: "", // Add this line
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
  // Add these new handler functions
  const handleEditRole = (deptIndex, roleIndex, currentRole) => {
    setEditingRole({
      departmentIndex: deptIndex,
      roleIndex: roleIndex,
      value: currentRole,
    });
    setEditRoleDialog(true);
  };

  const handleDeleteRole = (deptIndex, roleIndex) => {
    const department = sortedDepartments[deptIndex];
    if (department.roles.length <= 1) {
      setSnackbar({
        open: true,
        message:
          "Cannot delete the last role. Department must have at least one role.",
        severity: "error",
      });
      return;
    }

    setDepartments((prev) =>
      prev.map((dept, idx) =>
        idx === deptIndex
          ? { ...dept, roles: dept.roles.filter((_, i) => i !== roleIndex) }
          : dept
      )
    );

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
      prev.map((dept, idx) =>
        idx === editingRole.departmentIndex
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

  // Add handleSnackbarClose function
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBulkDownload = () => {
    try {
      const exportData = departments.map((dept) => ({
        Department: dept.name,
        "Display Name": dept.displayName,
        "Department Owner": dept.departmentOwner, // Added Department Owner
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
            "Department Owner": false, // Added Department Owner
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
            if (!row["Department Owner"]) errors.push("Department Owner"); // Added validation
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
                  departmentOwner: rows[0]["Department Owner"],
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
                  departmentOwner: rows[0]["Department Owner"],
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
      ...commonTextStyle,
    },
    transition: "background-color 0.2s ease",
  }));

  const handleAddDepartment = () => {
    setNewDepartment((prev) => ({ ...prev, submitted: true }));

    if (
      !newDepartment.name ||
      !newDepartment.displayName ||
      !newDepartment.initialRole ||
      !newDepartment.storage ||
      !newDepartment.reportingManager ||
      !newDepartment.departmentOwner
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
      roles: [newDepartment.initialRole],
      storage: newDepartment.storage,
      reportingManager: newDepartment.reportingManager,
      departmentOwner: newDepartment.departmentOwner,
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
        reportingManager: "",
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
        "Department Owner": "John Doe", // Added Department Owner
        "Storage Allocated": "50GB",
        Role: "Role1",
        Status: "Active",
        Edit: "No",
        Delete: "No", // Added Delete column
      },
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Department Owner": "John Doe", // Added Department Owner
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
              "Department Owner": dept.departmentOwner, // Added Department Owner
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
          "Department Owner": dept.departmentOwner, // Added Department Owner
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

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        height: "100% ",
        marginLeft: "60px",
        marginTop: "12px",
        marginRight: "18px",
        overflow: "hidden",
        // backgroundColor: "#f5f5f5", // Add this line for whitesmoke background
        // bgcolor: "whitesmoke !important",
        bgcolor: "#f5f5f5", // Whitesmoke background for the main container
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 80px)",
          height: "calc(100vh - 80px)",
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
            // borderBottom: "2px solid #e2e8f0",
            borderBottom: "2px solid #94a3b8", // Changed border color and made it thicker
            fontSize: "0.875rem",
            fontWeight: "700 !important",
            color: "#475569",
            height: "30px",
            padding: "2px 16px",
            ...commonTextStyle,
          },
          "& .MuiTableCell-root": {
            padding: "8px 16px",
            fontSize: "0.8125rem",
            color: "#334155",
            borderBottom: "1px solid #e2e8f0",
            ...commonTextStyle,
          },
          "& .MuiTable-root": {
            borderCollapse: "separate",
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
            {/* <TableRow> */}
            <TableRow
              sx={{ boxShadow: "0 -2px 8px 0 rgba(0, 0, 0, 0.2) !important" }}
            >
              <TableCell padding="checkbox" sx={{ width: "48px" }}>
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
                  ...commonTextStyle,
                  width: "150px",
                  padding: "8px 8px",
                  height: "40px",
                  fontWeight: "bold",
                  color: "#444",
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
                    // fontWeight="bold"

                    sx={{
                      ...commonTextStyle,
                      // fontWeight: "bold",
                      fontWeight: "700 !important",
                      fontSize: "13px",
                    }}
                  >
                    DEPARTMENT
                  </Typography>
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  ...commonTextStyle,
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
                    // fontWeight="bold"
                    sx={{
                      ...commonTextStyle,
                      // fontWeight: "bold",
                      fontWeight: "700 !important",
                      fontSize: "13px",
                    }}
                  >
                    SHORT NAME
                  </Typography>
                </TableSortLabel>
              </TableCell>

              <TableCell
                sx={{
                  ...commonTextStyle,
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
                  active={orderBy === "departmentOwner"}
                  direction={orderBy === "departmentOwner" ? order : "asc"}
                  onClick={() => handleRequestSort("departmentOwner")}
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
                      ...commonTextStyle,
                      fontWeight: "700 !important",
                      fontSize: "13px",
                    }}
                  >
                    DEPARTMENT OWNER
                  </Typography>
                </TableSortLabel>
              </TableCell>
              {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
              <TableCell
                sx={{
                  ...commonTextStyle,
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
                    ...commonTextStyle,
                    // fontWeight: "bold",
                    fontWeight: "700 !important",
                    fontSize: "13px",
                  }}
                >
                  STORAGE ALLOCATED
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  ...commonTextStyle,
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
                      ...commonTextStyle,
                      fontWeight: "700 !important",
                      fontSize: "13px",
                    }}
                  >
                    NUMBER OF ROLES
                  </Typography>
                </TableSortLabel>
              </TableCell>

              {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
              <TableCell
                sx={{
                  ...commonTextStyle,
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
                    ...commonTextStyle,
                    // fontWeight: "bold",
                    fontWeight: "700 !important",
                    fontSize: "13px",
                  }}
                >
                  ACTIONS
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

                      <TableCell
                        sx={{ ...commonTextStyle, padding: "2px 8px" }}
                      >
                        {dept.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...commonTextStyle,
                          textAlign: "center",
                          padding: "2px 8px",
                        }}
                      >
                        {dept.displayName}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...commonTextStyle,
                          textAlign: "center",
                          padding: "2px 8px",
                        }}
                      >
                        {dept.departmentOwner}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...commonTextStyle,
                          textAlign: "center",
                          padding: "2px 8px",
                        }}
                      >
                        {dept.storage}
                      </TableCell>

                      <TableCell
                        sx={{ ...commonTextStyle, padding: "2px 8px" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            justifyContent: "center",
                            cursor: "pointer",
                            "&:hover": {
                              "& .MuiSvgIcon-root": {
                                color: "primary.main",
                              },
                            },
                          }}
                          onClick={() => handleRowToggle(index)}
                        >
                          {dept.roles.length}{" "}
                          {/* Display roles count instead of userCount */}
                          <KeyboardArrowDownIcon
                            sx={{
                              fontSize: "1.1rem",
                              color: "#64748b",
                              transition: "transform 0.2s ease-in-out",
                              transform: openRows[index]
                                ? "rotate(-180deg)"
                                : "rotate(0)",
                            }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{ ...commonTextStyle, padding: "2px 8px" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Switch
                            size="small"
                            checked={dept.isActive}
                            onChange={() => handleDepartmentToggle(dept)}
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
                              width: "200px",
                              backgroundColor: "#ffff",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              zIndex: 2,
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
                                      ...commonTextStyle,
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
                                      ...commonTextStyle,
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
                                        ...commonTextStyle,
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
                                          onClick={() =>
                                            handleEditRole(
                                              index,
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
                                          onClick={() =>
                                            handleDeleteRole(index, roleIndex)
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
                      </TableCell>
                    </StyledTableRow>
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>

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
            component="div"
            count={departments?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[9, 18, 27]}
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
                icon={<DepartmentRolesIcon />}
                onClick={() => setShowAddDepartment(true)}
                direction="left"
                FabProps={{
                  sx: {
                    bgcolor: "rgb(251, 68, 36)",
                    "&:hover": {
                      bgcolor: "rgb(251, 68, 36)",
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
      </TableContainer>

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

      <Dialog
        open={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            "& .MuiDialogTitle-root": commonTextStyle,
            "& .MuiDialogContent-root": commonTextStyle,
            "& .MuiDialogContentText-root": commonTextStyle,
          },
        }}
      >
        {/* <DialogTitle>Add New Department</DialogTitle> */}
        <DialogTitle
          sx={{
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Be Vietnam", sans-serif',
            }}
          >
            New Department
          </Typography>
          <IconButton
            onClick={() => setShowAddDepartment(false)}
            size="small"
            sx={{
              color: "error.main",
              width: 32,
              height: 32,
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
            <CloseIcon
              sx={{
                fontSize: "1.1rem",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              size="small"
              label="Department Name"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              fullWidth
              required
              error={!newDepartment.name && newDepartment.submitted}
              helperText={
                !newDepartment.name && newDepartment.submitted
                  ? "Department name is required"
                  : ""
              }
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel
                id="storage-label"
                sx={{
                  fontFamily: '"Be Vietnam", sans-serif',
                }}
              >
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
                error={!newDepartment.storage && newDepartment.submitted}
                sx={{
                  fontFamily: '"Be Vietnam", sans-serif',
                  "& .MuiSelect-select": {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
              >
                {[0, 25, 50, 75, 100, 150, 200].map((size) => (
                  <MenuItem
                    key={size}
                    value={`${size}GB`}
                    sx={{
                      fontFamily: '"Be Vietnam", sans-serif',
                    }}
                  >
                    {size} GB
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Short Name"
              value={newDepartment.displayName}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  displayName: e.target.value.toUpperCase(),
                }))
              }
              required
              error={!newDepartment.displayName && newDepartment.submitted}
              helperText={
                !newDepartment.displayName && newDepartment.submitted
                  ? "Display name is required"
                  : "Short form"
              }
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
            <TextField
              size="small"
              label="Department Owner"
              value={newDepartment.departmentOwner}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  departmentOwner: e.target.value,
                }))
              }
              required
              error={!newDepartment.departmentOwner && newDepartment.submitted}
              helperText={
                !newDepartment.departmentOwner && newDepartment.submitted
                  ? "Department Owner is required"
                  : ""
              }
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
            <TextField
              size="small"
              label="Initial Role"
              value={newDepartment.initialRole}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  initialRole: e.target.value,
                }))
              }
              required
              error={!newDepartment.initialRole && newDepartment.submitted}
              helperText={
                !newDepartment.initialRole && newDepartment.submitted
                  ? "At least one role is required"
                  : ""
              }
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
            <TextField
              size="small"
              label="Reporting Manager"
              value={newDepartment.reportingManager}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  reportingManager: e.target.value,
                }))
              }
              required
              error={!newDepartment.reportingManager && newDepartment.submitted}
              helperText={
                !newDepartment.reportingManager && newDepartment.submitted
                  ? "Reporting Manager is required"
                  : ""
              }
              fullWidth
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              sx={{ mt: 2 }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: "1px solid #eee",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip
                title="Download Template"
                componentsProps={{
                  tooltip: {
                    sx: commonTextStyle,
                  },
                }}
              >
                <IconButton
                  onClick={handleTemplateDownload}
                  size="small"
                  sx={{
                    backgroundColor: "success.lighter",
                    border: "1px solid",
                    borderColor: "success.light",
                    color: "success.main",
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "success.100",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DownloadIcon sx={{ fontSize: 20 }} />
                  </Box>
                </IconButton>
              </Tooltip>
              <Tooltip
                title="Bulk Upload"
                componentsProps={{
                  tooltip: {
                    sx: commonTextStyle,
                  },
                }}
              >
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                  sx={{
                    backgroundColor: "primary.lighter",
                    border: "1px solid",
                    borderColor: "primary.light",
                    color: "primary.main",
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "primary.100",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <UploadFileIcon sx={{ fontSize: 20 }} />
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              onClick={handleAddDepartment}
              variant="contained"
              sx={{
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                px: 3,
                py: 0.7,
                fontFamily: '"Be Vietnam", sans-serif',
              }}
            >
              Add
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddRoleDialog}
        onClose={() => {
          setShowAddRoleDialog(false);
          setNewRole("");
        }}
        maxWidth="xs"
      >
        <DialogTitle>Add Role to {selectedDepartment?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Role"
            fullWidth
            variant="outlined"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddRoleDialog(false);
              setNewRole("");
            }}
            sx={{
              ...commonTextStyle,
              // other styles
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddRole} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              size="small"
              label="Department Name"
              value={editedDepartment?.name || ""}
              onChange={(e) =>
                setEditedDepartment((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              fullWidth
              required
            />
            <TextField
              size="small"
              label="Display Name"
              value={editedDepartment?.displayName || ""}
              onChange={(e) =>
                setEditedDepartment((prev) => ({
                  ...prev,
                  displayName: e.target.value.toUpperCase(),
                }))
              }
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
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
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
