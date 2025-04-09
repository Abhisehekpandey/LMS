import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
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
  Tooltip
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
import { Checkbox } from '@mui/material';

function Department({ departments, setDepartments, onThemeToggle }) {
  // Add pagination state
  const [page, setPage] = useState(0);
  // const [rowsPerPage] = useState(9);
  const [rowsPerPage, setRowsPerPage] = useState(25); // Default to 25 rows

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

  // Add these new state variables after other state declarations
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState({
    departmentIndex: null,
    roleIndex: null,
    value: "",
  });

  // Add these at the top of your component with other state declarations
const [selected, setSelected] = useState([]);

// Add these handler functions
const handleSelectAllClick = (event) => {
  if (event.target.checked) {
    const newSelected = sortedDepartments.map((dept) => dept.name);
    setSelected(newSelected);
    return;
  }
  setSelected([]);
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

  // const handleBulkUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   try {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       try {
  //         const data = new Uint8Array(e.target.result);
  //         const workbook = XLSX.read(data, { type: "array" });
  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const jsonData = XLSX.utils.sheet_to_json(worksheet);

  //         // Validation check
  //         const isValidData = jsonData.every(
  //           (row) =>
  //             row.Department &&
  //             row["Display Name"] &&
  //             row["Storage Allocated"] &&
  //             row.Roles &&
  //             row.Edit
  //         );

  //         if (!isValidData) {
  //           setSnackbar({
  //             open: true,
  //             message: "Invalid file format. Please use the correct template.",
  //             severity: "error",
  //           });
  //           return;
  //         }

  //         const skippedDepartments = [];
  //         const addedDepartments = [];
  //         const updatedDepartments = [];
  //         let updatedDepartmentsList = [...departments];

  //         jsonData.forEach((row) => {
  //           const existingDeptIndex = updatedDepartmentsList.findIndex(
  //             (d) => d.name === row.Department
  //           );

  //           const roles = row.Roles.includes("(")
  //             ? row.Roles.split("(")[1]
  //                 .split(")")[0]
  //                 .split(",")
  //                 .map((role) => role.trim())
  //             : row.Roles.split(",").map((role) => role.trim());

  //           // First check for existing departments
  //           if (existingDeptIndex !== -1) {
  //             // Department exists, check Edit value
  //             if (row.Edit.toString().toLowerCase() === "yes") {
  //               // Update the existing department
  //               updatedDepartmentsList[existingDeptIndex] = {
  //                 ...updatedDepartmentsList[existingDeptIndex],
  //                 displayName: row["Display Name"],
  //                 storage: row["Storage Allocated"],
  //                 roles: roles,
  //                 isActive: false,
  //               };
  //               updatedDepartments.push(row.Department);
  //             } else {
  //               // Skip if Edit is "No"
  //               skippedDepartments.push(row.Department);
  //             }
  //           } else {
  //             // New department, add it
  //             updatedDepartmentsList.push({
  //               name: row.Department,
  //               displayName: row["Display Name"],
  //               storage: row["Storage Allocated"] || "50GB",
  //               roles: roles,
  //               isActive: false,
  //             });
  //             addedDepartments.push(row.Department);
  //           }
  //         });

  //         // Update state and localStorage
  //         setDepartments(updatedDepartmentsList);
  //         localStorage.setItem(
  //           "departments",
  //           JSON.stringify(updatedDepartmentsList)
  //         );

  //         // Prepare message
  //         let message = [];
  //         if (addedDepartments.length > 0) {
  //           message.push(`Added ${addedDepartments.length} new departments`);
  //         }
  //         if (updatedDepartments.length > 0) {
  //           message.push(
  //             `Updated ${updatedDepartments.length} existing departments`
  //           );
  //         }
  //         if (skippedDepartments.length > 0) {
  //           message.push(
  //             `Skipped ${skippedDepartments.length} existing departments`
  //           );
  //         }

  //         setSnackbar({
  //           open: true,
  //           message: message.join(". ") || "No changes made",
  //           severity:
  //             addedDepartments.length > 0 || updatedDepartments.length > 0
  //               ? "success"
  //               : "info",
  //         });
  //       } catch (error) {
  //         console.error("Error processing file:", error);
  //         setSnackbar({
  //           open: true,
  //           message:
  //             "Error processing file. Please ensure it matches the template format.",
  //           severity: "error",
  //         });
  //       }
  //     };

  //     reader.readAsArrayBuffer(file);
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     setSnackbar({
  //       open: true,
  //       message: "Error uploading file",
  //       severity: "error",
  //     });
  //   }

  //   event.target.value = "";
  // };

  // const handleBulkUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
  
  //   try {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       try {
  //         const data = new Uint8Array(e.target.result);
  //         const workbook = XLSX.read(data, { type: "array" });
  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  //         // Validation check for required fields
  //         const isValidData = jsonData.every(
  //           (row) =>
  //             row.Department &&
  //             row["Display Name"] &&
  //             row["Storage Allocated"] &&
  //             row.Role !== undefined && // Changed from Roles to Role
  //             row.Status &&
  //             row.Edit !== undefined // Check if Edit exists but allow any value
  //         );
  
  //         if (!isValidData) {
  //           setSnackbar({
  //             open: true,
  //             message: "Invalid file format. Please use the correct template.",
  //             severity: "error",
  //           });
  //           return;
  //         }
  
  //         const skippedDepartments = [];
  //         const addedDepartments = [];
  //         const updatedDepartments = [];
  //         let updatedDepartmentsList = [...departments];
  
  //         // Group rows by department
  //         const departmentGroups = {};
  //         jsonData.forEach((row) => {
  //           if (!departmentGroups[row.Department]) {
  //             departmentGroups[row.Department] = [];
  //           }
  //           departmentGroups[row.Department].push(row);
  //         });
  
  //         // Process each department
  //         Object.entries(departmentGroups).forEach(([deptName, rows]) => {
  //           const existingDeptIndex = updatedDepartmentsList.findIndex(
  //             (d) => d.name === deptName
  //           );
  
  //           // Get all roles for this department
  //           const roles = rows.map(row => row.Role).filter(role => role); // Filter out empty roles
  
  //           if (existingDeptIndex !== -1) {
  //             // Department exists, check Edit value
  //             if (rows.some(row => row.Edit.toString().toLowerCase() === "yes")) {
  //               // Update the existing department
  //               updatedDepartmentsList[existingDeptIndex] = {
  //                 ...updatedDepartmentsList[existingDeptIndex],
  //                 displayName: rows[0]["Display Name"],
  //                 storage: rows[0]["Storage Allocated"],
  //                 roles: roles,
  //                 isActive: rows[0].Status.toLowerCase() === "active"
  //               };
  //               updatedDepartments.push(deptName);
  //             } else {
  //               skippedDepartments.push(deptName);
  //             }
  //           } else {
  //             // New department
  //             updatedDepartmentsList.push({
  //               name: deptName,
  //               displayName: rows[0]["Display Name"],
  //               storage: rows[0]["Storage Allocated"],
  //               roles: roles,
  //               isActive: rows[0].Status.toLowerCase() === "active"
  //             });
  //             addedDepartments.push(deptName);
  //           }
  //         });
  
  //         // Update state and localStorage
  //         setDepartments(updatedDepartmentsList);
  //         localStorage.setItem("departments", JSON.stringify(updatedDepartmentsList));
  
  //         // Prepare message
  //         let message = [];
  //         if (addedDepartments.length > 0) {
  //           message.push(`Added ${addedDepartments.length} new departments`);
  //         }
  //         if (updatedDepartments.length > 0) {
  //           message.push(`Updated ${updatedDepartments.length} existing departments`);
  //         }
  //         if (skippedDepartments.length > 0) {
  //           message.push(`Skipped ${skippedDepartments.length} existing departments`);
  //         }
  
  //         setSnackbar({
  //           open: true,
  //           message: message.join(". ") || "No changes made",
  //           severity: addedDepartments.length > 0 || updatedDepartments.length > 0 ? "success" : "info"
  //         });
  //       } catch (error) {
  //         console.error("Error processing file:", error);
  //         setSnackbar({
  //           open: true,
  //           message: "Error processing file. Please ensure it matches the template format.",
  //           severity: "error"
  //         });
  //       }
  //     };
  
  //     reader.readAsArrayBuffer(file);
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     setSnackbar({
  //       open: true,
  //       message: "Error uploading file",
  //       severity: "error"
  //     });
  //   }
  
  //   event.target.value = "";
  // };

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
  
          // Validation check for required fields
          const isValidData = jsonData.every(
            (row) =>
              row.Department &&
              row["Display Name"] &&
              row["Storage Allocated"] &&
              row.Role !== undefined && // Changed from Roles to Role
              row.Status &&
              row.Edit !== undefined // Check if Edit exists but allow any value
          );
  
          if (!isValidData) {
            setSnackbar({
              open: true,
              message: "Invalid file format. Please use the correct template.",
              severity: "error",
            });
            return;
          }
  
          const skippedDepartments = [];
          const addedDepartments = [];
          const updatedDepartments = [];
          let updatedDepartmentsList = [...departments];
  
          // Group rows by department
          const departmentGroups = {};
          jsonData.forEach((row) => {
            if (!departmentGroups[row.Department]) {
              departmentGroups[row.Department] = [];
            }
            departmentGroups[row.Department].push(row);
          });
  
          // Process each department
          Object.entries(departmentGroups).forEach(([deptName, rows]) => {
            const existingDeptIndex = updatedDepartmentsList.findIndex(
              (d) => d.name === deptName
            );
  
            // Get all roles for this department
            const roles = rows.map(row => row.Role).filter(role => role); // Filter out empty roles
  
            if (existingDeptIndex !== -1) {
              // Department exists, check Edit value
              if (rows.some(row => row.Edit.toString().toLowerCase() === "yes")) {
                // Update the existing department
                updatedDepartmentsList[existingDeptIndex] = {
                  ...updatedDepartmentsList[existingDeptIndex],
                  displayName: rows[0]["Display Name"],
                  storage: rows[0]["Storage Allocated"],
                  roles: roles,
                  isActive: rows[0].Status.toLowerCase() === "active"
                };
                updatedDepartments.push(deptName);
              } else {
                skippedDepartments.push(deptName);
              }
            } else {
              // New department
              updatedDepartmentsList.push({
                name: deptName,
                displayName: rows[0]["Display Name"],
                storage: rows[0]["Storage Allocated"],
                roles: roles,
                isActive: rows[0].Status.toLowerCase() === "active"
              });
              addedDepartments.push(deptName);
            }
          });
  
          // Update state and localStorage
          setDepartments(updatedDepartmentsList);
          localStorage.setItem("departments", JSON.stringify(updatedDepartmentsList));
  
          // Prepare message
          let message = [];
          if (addedDepartments.length > 0) {
            message.push(`Added ${addedDepartments.length} new departments`);
          }
          if (updatedDepartments.length > 0) {
            message.push(`Updated ${updatedDepartments.length} existing departments`);
          }
          if (skippedDepartments.length > 0) {
            message.push(`Skipped ${skippedDepartments.length} existing departments`);
          }
  
          setSnackbar({
            open: true,
            message: message.join(". ") || "No changes made",
            severity: addedDepartments.length > 0 || updatedDepartments.length > 0 ? "success" : "info"
          });
        } catch (error) {
          console.error("Error processing file:", error);
          setSnackbar({
            open: true,
            message: "Error processing file. Please ensure it matches the template format.",
            severity: "error"
          });
        }
      };
  
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbar({
        open: true,
        message: "Error uploading file",
        severity: "error"
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

  // Add sorting function
  const sortedDepartments = React.useMemo(() => {
    if (!departments) return [];

    return [...departments].sort((a, b) => {
      if (orderBy === "roles") {
        return order === "asc"
          ? a.roles.length - b.roles.length
          : b.roles.length - a.roles.length;
      }

      return order === "asc"
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    });
  }, [departments, order, orderBy]);

 
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "transparent",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "rgba(0, 0, 0, 0.02)",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04) !important",
    },
    "&.Mui-selected": {
      backgroundColor: "rgba(25, 118, 210, 0.08) !important",
    },
    "&.Mui-selected:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.12) !important",
    },
    "& .MuiTableCell-root": {
      padding: "2px 8px",
      height: "32px",
      fontSize: "0.875rem",
      color: "#333",
      borderBottom: "1px solid #e0e0e0",
      whiteSpace: "nowrap",
    },
    margin: 0,
    borderSpacing: 0,
    transition: "background-color 0.1s ease",
  }));

  // Add this function after other handlers
  const handleAddDepartment = () => {
    setNewDepartment((prev) => ({ ...prev, submitted: true }));

    if (
      !newDepartment.name ||
      !newDepartment.displayName ||
      !newDepartment.initialRole ||
      !newDepartment.storage
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
    };

    const updatedDepartments = [...departments, newDeptWithRole];
    setDepartments(updatedDepartments);

    // Store in localStorage
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));

    // setDepartments((prev) => [...prev, newDeptWithRole]);
    setShowAddDepartment(false);
    setNewDepartment({
      name: "",
      displayName: "",
      initialRole: "",
      storage: "50GB",
      submitted: false,
    });
    setSnackbar({
      open: true,
      message: `Department "${newDepartment.name}" added successfully with role "${newDepartment.initialRole}"!`,
      severity: "success",
    });
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

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === selectedDepartment.name
          ? { ...dept, roles: [...dept.roles, newRole.trim()] }
          : dept
      )
    );

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

  // const handleTemplateDownload = () => {
  //   const template = [
  //     {
  //       Department: "Example Department",
  //       "Display Name": "EXD",
  //       "Storage Allocated": "50GB",
  //       Roles: "3 (Role1, Role2, Role3)",
  //       Status: "Active", // Add Status column in template
  //       Edit: "No",
  //     },
  //   ];

  //   const workbook = XLSX.utils.book_new();
  //   const worksheet = XLSX.utils.json_to_sheet(template);

  //   const wscols = [
  //     { wch: 25 }, // Department
  //     { wch: 15 }, // Display Name
  //     { wch: 20 }, // Storage Allocated
  //     { wch: 50 }, // Combined Roles column
  //     { wch: 15 }, // Status column
  //     { wch: 10 }, // Edit column
  //   ];
  //   worksheet["!cols"] = wscols;

  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  //   XLSX.writeFile(workbook, "department_upload_template.xlsx");
  // };

  const handleTemplateDownload = () => {
    const template = [
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Storage Allocated": "50GB",
        Role: "Role1",
        Status: "Active",
        Edit: "No",
      },
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Storage Allocated": "50GB",
        Role: "Role2",
        Status: "Active",
        Edit: "No",
      },
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Storage Allocated": "50GB",
        Role: "Role3",
        Status: "Active",
        Edit: "No",
      }
    ];
  
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);
  
    const wscols = [
      { wch: 25 }, // Department
      { wch: 15 }, // Display Name
      { wch: 20 }, // Storage Allocated
      { wch: 30 }, // Role
      { wch: 15 }, // Status
      { wch: 10 }, // Edit
    ];
    worksheet["!cols"] = wscols;
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "department_upload_template.xlsx");
  };

  // const handleBulkDownloadSelected = (selectedItems) => {
  //   try {
  //     const selectedDepartments = departments.filter(dept => 
  //       selectedItems.includes(dept.name)
  //     );
  
  //     const exportData = selectedDepartments.map((dept) => ({
  //       Department: dept.name,
  //       "Display Name": dept.displayName,
  //       "Storage Allocated": dept.storage || "50GB",
  //       Roles: `${dept.roles.length} (${dept.roles.join(", ")})`,
  //       Status: dept.isActive ? "Active" : "Inactive",
  //       Edit: "No",
  //     }));
  
  //     const ws = XLSX.utils.json_to_sheet(exportData);
  
  //     const wscols = [
  //       { wch: 25 }, // Department
  //       { wch: 15 }, // Display Name
  //       { wch: 20 }, // Storage Allocated
  //       { wch: 50 }, // Combined Roles column
  //       { wch: 15 }, // Status column
  //       { wch: 10 }, // Edit column
  //     ];
  //     ws["!cols"] = wscols;
  
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "Selected Departments");
  //     XLSX.writeFile(wb, "selected_departments.xlsx");
  
  //     setSnackbar({
  //       open: true,
  //       message: `Successfully exported ${selectedItems.length} departments`,
  //       severity: "success",
  //     });
  //   } catch (error) {
  //     setSnackbar({
  //       open: true,
  //       message: "Error exporting selected departments",
  //       severity: "error",
  //     });
  //   }
  // };

  const handleBulkDownloadSelected = (selectedItems) => {
    try {
      const selectedDepartments = departments.filter(dept => 
        selectedItems.includes(dept.name)
      );
  
      // Create expanded data with separate rows for each role
      const exportData = selectedDepartments.flatMap((dept) => {
        // If department has no roles, create one row with empty role
        if (!dept.roles || dept.roles.length === 0) {
          return [{
            Department: dept.name,
            "Display Name": dept.displayName,
            "Storage Allocated": dept.storage || "50GB",
            Role: "",
            Status: dept.isActive ? "Active" : "Inactive",
            Edit: "No",
          }];
        }
  
        // Create a row for each role
        return dept.roles.map(role => ({
          Department: dept.name,
          "Display Name": dept.displayName,
          "Storage Allocated": dept.storage || "50GB",
          Role: role,
          Status: dept.isActive ? "Active" : "Inactive",
          Edit: "No",
        }));
      });
  
      const ws = XLSX.utils.json_to_sheet(exportData);
  
      const wscols = [
        { wch: 25 }, // Department
        { wch: 15 }, // Display Name
        { wch: 20 }, // Storage Allocated
        { wch: 30 }, // Role
        { wch: 15 }, // Status
        { wch: 10 }, // Edit
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
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: 0,
          transition: "margin-left 0.3s",
          overflow: "hidden",
        }}
      >
        <Navbar onThemeToggle={onThemeToggle} />
        {/* <Box sx={{ p: 3, marginLeft: "50px", overflow: "hidden" }}> */}
        <Box
          sx={{
            p: 0,
            marginLeft: "64px", // Keep the sidebar margin
            marginTop: "24px", // Add top margin for Navbar separation
            marginRight: "24px", // Add right margin
            overflow: "hidden",
            height: "calc(100vh - 64px)", // Adjust height to account for top margin
          }}
        >
          <TableContainer
            component={Paper}
          
            sx={{
              height: "calc(100vh - 96px)",
              "& .MuiTableHead-root": {
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              },
              "& .MuiTableCell-root": {
                padding: "2px 8px",
                height: "32px",
              },
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              overflow: "auto",
              position: "relative",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                <TableCell padding="checkbox"  sx={{ 
        width: "48px",
        padding: "2px 8px",
        height: "32px"
      }}>
      <Checkbox
        color="primary"
        indeterminate={selected.length > 0 && selected.length < sortedDepartments.length}
        checked={sortedDepartments.length > 0 && selected.length === sortedDepartments.length}
        onChange={handleSelectAllClick}
        inputProps={{
          'aria-label': 'select all departments',
        }}
        size="small"
      />
    </TableCell>
                  
                  {/* <TableCell sx={{ width: "200px", padding: "1px 8px" }}> */}
                  <TableCell
                    sx={{
                      width: "200px",
                      padding: "2px 8px",
                      height: "32px",
                      fontWeight: "bold",
                      color: "#444",
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleRequestSort("name")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Department
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell
                    sx={{
                      width: "150px",
                      padding: "2px 8px",
                      height: "32px",
                      fontWeight: "bold",
                      color: "#444",
                      textAlign: 'center'
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "displayName"}
                      direction={orderBy === "displayName" ? order : "asc"}
                      onClick={() => handleRequestSort("displayName")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Short Name
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell
                    sx={{
                      width: "150px",
                      padding: "2px 8px",
                      height: "32px",
                      fontWeight: "bold",
                      color: "#444",
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      Storage Allocated
                    </Typography>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell
                    sx={{
                      width: "150px",
                      padding: "2px 8px",
                      height: "32px",
                      fontWeight: "bold",
                      color: "#444",
                      textAlign:'center'
                      
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === "roles"}
                      direction={orderBy === "roles" ? order : "asc"}
                      onClick={() => handleRequestSort("roles")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Number of Roles
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell
                    sx={{
                      width: "150px",
                      padding: "2px 8px",
                      height: "32px",
                      fontWeight: "bold",
                      color: "#444",
                      textAlign: 'center'
                      

                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
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
                      {/* <StyledTableRow key={index}> */}
                      <StyledTableRow 
          hover
          onClick={(event) => handleClick(event, dept.name)}
          role="checkbox"
          aria-checked={isItemSelected}
          tabIndex={-1}
          selected={isItemSelected}
        >
          <TableCell padding="checkbox"  sx={{ 
                width: "48px",
                padding: "2px 8px",
                height: "32px"
              }}>
            <Checkbox
              color="primary"
              checked={isItemSelected}
              size="small"
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleClick(event, dept.name)}
            />
          </TableCell>
                      
                        <TableCell  sx={{ padding: "2px 8px" }}>{dept.name}</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: "2px 8px" }}>{dept.displayName}</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: "2px 8px" }}>{dept.storage}</TableCell>
                        <TableCell sx={{ padding: "2px 8px" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              justifyContent: 'center'
                            }}
                          >
                            {dept.roles.length}
                            <IconButton
                              size="small"
                              onClick={() => handleRowToggle(index)}
                            >
                              {openRows[index] ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setShowAddRoleDialog(true);
                              }}
                              sx={{
                                "&:hover": {
                                  color: "primary.main",
                                },
                              }}
                              title="Add New Role"
                            >
                              <ManageAccountsIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ padding: "2px 8px" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <Switch
                              size="small"
                              checked={dept.isActive}
                              onChange={() => handleDepartmentToggle(dept)}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#1976d2", // Brighter blue
                                },
                                "& .MuiSwitch-track": {
                                  backgroundColor: "#90caf9", // Light blue track
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
                                padding: "8px",
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
                                padding: "8px",
                              }}
                              title="Delete Department"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                      <StyledTableRow key={index}>
                        {/* <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={1}
                        > */}
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
                            {/* <Box sx={{ margin: 1 }}> */}
                            <Box
                              sx={{
                                margin: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.01)",
                                borderRadius: 0,
                                padding: 0,
                              }}
                            >
                              {/* <List dense> */}
                              {/* <List dense sx={{ padding: 0 }}> */}
                              <List
                                dense
                                sx={{
                                  padding: 0,
                                  margin: 0,
                                  "& .MuiListItem-root": {
                                    padding: "2px 8px",
                                    minHeight: "32px",
                                    borderBottom: "1px solid #f0f0f0",
                                  },
                                }}
                              >
                                {dept.roles.map((role, roleIndex) => (
                                  <ListItem
                                    key={roleIndex}
                                    sx={{
                                      height: "32px",
                                      "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                      },
                                    }}
                                    secondaryAction={
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                          // edge="end"
                                          size="small"
                                          onClick={() =>
                                            handleEditRole(
                                              index,
                                              roleIndex,
                                              role
                                            )
                                          }
                                          // sx={{
                                          //   "&:hover": {
                                          //     color: "primary.main",
                                          //   },
                                          // }}
                                          sx={{
                                            padding: "4px",
                                            "& .MuiSvgIcon-root": {
                                              fontSize: "1.1rem",
                                            },
                                          }}
                                          title="Edit Role"
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          // edge="end"
                                          size="small"
                                          onClick={() =>
                                            handleDeleteRole(index, roleIndex)
                                          }
                                          // sx={{
                                          //   "&:hover": {
                                          //     color: "error.main",
                                          //   },
                                          // }}
                                          sx={{
                                            padding: "4px",
                                            "& .MuiSvgIcon-root": {
                                              fontSize: "1.1rem",
                                            },
                                          }}
                                          title="Delete Role"
                                        >
                                          <DeleteIcon
                                            fontSize="small"
                                            color="error"
                                          />
                                        </IconButton>
                                      </Box>
                                    }
                                  >
                                    <ListItemText
                                      primary={role}
                                      sx={{ marginLeft: 2 }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </StyledTableRow>
                    </React.Fragment>
                  )})}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={departments?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage} // Add this line
            rowsPerPageOptions={[25, 50]}
            sx={{
              position: "sticky",
              bottom: 0,
              bgcolor: "white",
              borderTop: "1px solid #ddd",
              "& .MuiToolbar-root": {
                height: "36px",
                minHeight: "36px",
                paddingLeft: "16px",
                paddingRight: "16px",
              },
              "& .MuiTablePagination-select": {
                paddingTop: 0,
                paddingBottom: 0,
              },
            }}
          />
        </Box>
      </Box>

      
      <Box sx={{ position: "fixed", bottom: 48, right: 36, zIndex: 1000 }}>
  <input
    type="file"
    ref={fileInputRef}
    onChange={handleBulkUpload}
    accept=".xlsx,.xls"
    style={{ display: "none" }}
  />
  
  {/* Add conditional Bulk Download SpeedDial */}
  {selected.length > 0 && (
    <SpeedDial
      ariaLabel="Bulk Download"
      icon={<DownloadIcon />}
      direction="left"
      // sx={{ position: 'absolute', bottom: 60 }}
      sx={{ 
        position: 'absolute', 
        bottom: 45, // Adjust this value to position it above the main SpeedDial
        right: 0,
      }}
      FabProps={{
        sx: {
          bgcolor: "blue",
          "&:hover": {
            bgcolor: "blue",
          },
          width: 25,
          height: 25,
          "& .MuiSpeedDialIcon-root": {
            fontSize: "1.2rem",
            color: "white",
          },
        },
      }}
      onClick={() => handleBulkDownloadSelected(selected)}
    />
  )}

  <SpeedDial
  ariaLabel="Department actions"
  icon={<FolderIcon />}
  onClick={() => setShowAddDepartment(true)}  // Add onClick here
  direction="left"
  FabProps={{
    sx: {
      bgcolor: "blue",
      "&:hover": {
        bgcolor: "blue",
      },
      width: 25,
      height: 25,
      "& .MuiSpeedDialIcon-root": {
        fontSize: "1.2rem",
        color: "white",
      },
    },
  }}
>
  {/* Remove SpeedDialAction as we don't need it anymore */}
</SpeedDial>
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

      {/* Add Department Dialog */}
      <Dialog
        open={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        maxWidth="sm"
      >
        <DialogTitle>Add New Department</DialogTitle>
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
            />
            <FormControl fullWidth size="small">
              <InputLabel id="storage-label">Storage Allocation</InputLabel>
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
              >
                {[0,25, 50, 75, 100, 150, 200].map((size) => (
                  <MenuItem key={size} value={`${size}GB`}>
                    {size} GB
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Display Name"
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
            />
          </Box>

    <Box sx={{ 
  display: "flex", 
  justifyContent: "space-between", // Change from center to space-between
  alignItems: "center",
  gap: 2, 
  mt: 3,
  pt: 2,
  borderTop: "1px solid #eee",
  width: "100%" // Add width
}}>
  <Box sx={{ display: "flex", gap: 1 }}> {/* Left side container */}
    <Tooltip title="Bulk Upload">
      <IconButton
        onClick={() => fileInputRef.current?.click()}
        sx={{
          color: "primary.main",
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        <UploadFileIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Download Template">
      <IconButton
        onClick={handleTemplateDownload}
        sx={{
          color: "primary.main",
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  </Box>
  <Box sx={{ display: "flex", gap: 1 }}> {/* Right side - buttons */}
    <Button
      onClick={() => {
        setShowAddDepartment(false);
        setNewDepartment({
          name: "",
          displayName: "",
          initialRole: "",
          storage: "50GB",
          submitted: false,
        });
      }}
    >
      Cancel
    </Button>
    <Button onClick={handleAddDepartment} color="primary" variant="contained">
      Add
    </Button>
  </Box>
  <Box sx={{ display: "flex", gap: 1 }}> {/* Right side container - for future use if needed */}
    {/* Add any additional buttons/actions here */}
  </Box>
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
