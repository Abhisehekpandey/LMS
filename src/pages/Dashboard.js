// src/pages/Dashboard.js
import React, { useState, useRef, useEffect } from "react";
import {
  FormHelperText,
  Snackbar,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  TableSortLabel,
  TablePagination,
  InputLabel,
} from "@mui/material";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox"; // Add this import
import WifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';

import { Grid } from "@mui/material";
import { FormControlLabel } from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { InputAdornment } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save"; // Import Save Icon
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download"; // Import Download Icon
import PersonAddIcon from "@mui/icons-material/PersonAdd"; // Import Add User Icon
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import * as XLSX from "xlsx"; // Import xlsx library
import { Autocomplete } from "@mui/material";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { visuallyHidden } from "@mui/utils";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

import FileDownloadIcon from "@mui/icons-material/FileDownload"; // For download
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"; // For delete
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew"; // For activate
import BlockIcon from "@mui/icons-material/Block"; // For deactivate
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"; // For save changes

import emailjs from "@emailjs/browser";
import { v4 as uuidv4 } from "uuid";

const EMAIL_SERVICE_ID = "service_4h54d19";
const EMAIL_TEMPLATE_ID = "template_so0uw3n";
const EMAIL_USER_ID = "oL2IlUt62rbTK2_vD";
const INVITE_EXPIRY_HOURS = 24;

const createData = (
  username,
  name,
  department,
  role,
  email,
  storageUsed,
  status, // Add status parameter
  phone, // Add phone parameter
  reportingManager // Add this parameter
) => {
  return {
    username,
    name,
    department,
    role,
    email,
    storageUsed,
    manageStorage: "1GB",
    status: status || "pending", // Set default status as pending
    phone: phone || "", // Add phone field with default empty string
    reportingManager: reportingManager || "", // Add this field
  };
};

// Sample data
const initialRows = [
  createData(
    "jdoe.jsbs",
    "John Doe",
    "Engineering",
    "Developer",
    "john.doe@example.com",
    "50GB",
    "active",
    "aaa"
  ),
  createData(
    "j.smith",
    "Jane Smith",
    "Marketing",
    "Manager",
    "jane.smith@example.com",
    "30GB",
    "inactive",
    "bbbb"
  ),
  createData(
    "ajohn.son",
    "Alice Johnson",
    "Sales",
    "Sales Rep",
    "alice.johnson@example.com",
    "20GB",
    "pending",
    "ccc"
  ),
  createData(
    "bbrown.ssn",
    "Bob Brown",
    "HR",
    "HR Manager",
    "bob.brown@example.com",
    "10GB",
    "active",
    "ddd"
  ),
  createData(
    "bbrown.bns",
    "Bob Brown123",
    "HR",
    "HR Manager",
    "bob111.brown@example.com",
    "10GB",
    "active",
    "eeee"
  ),
  createData(
    "cblack.snsns",
    "Charlie Black",
    "Finance",
    "Analyst",
    "charlie.black@example.com",
    "15GB",
    "active",
    "fff"
  ),
  createData(
    "dprince.sss",
    "Diana Prince",
    "IT",
    "Support",
    "diana.prince@example.com",
    "25GB",
    "pending",
    "gggg"
  ),
  createData(
    "ehunt.ns",
    "Ethan Hunt",
    "Operations",
    "Manager",
    "ethan.hunt@example.com",
    "40GB",
    "pending",
    "hhhh"
  ),
  createData(
    "fglen.snsn",
    "Fiona Glenanne",
    "Marketing",
    "Executive",
    "fiona.glenanne@example.com",
    "35GB",
    "pending",
    "iii"
  ),
  createData(
    "gclooney.sss",
    "George Clooney",
    "Sales",
    "Director",
    "george.clooney@example.com",
    "45GB",
    "pending",
    "jjjj"
  ),
  createData(
    "hmontana.sbsj",
    "Hannah Montana",
    "HR",
    "Recruiter",
    "hannah.montana@example.com",
    "5GB",
    "pending",
    "kkkk"
  ),
];

const defaultRoles = [
  "Developer",
  "Manager",
  "Sales Rep",
  "HR Manager",
  "Analyst",
  "Support",
  "Executive",
  "Director",
];
const statusColors = {
  active: "#4caf50", // Green
  inactive: "#f44336", // Red
  pending: "#ff9800", // Orange
};

emailjs.init(EMAIL_USER_ID);

const Dashboard = ({ onThemeToggle, departments, setDepartments }) => {
  const [rows, setRows] = useState(() => {
    const savedRows = localStorage.getItem("dashboardRows");
    return savedRows ? JSON.parse(savedRows) : initialRows;
  });
  const [selected, setSelected] = useState([]); // State to manage selected rows
  const [filter, setFilter] = useState("All"); // State to manage filter
  const [anchorEl, setAnchorEl] = useState(null); // State for filter dropdown
  const [openDialog, setOpenDialog] = useState(false); // State for confirmation dialog
  const [userToDelete, setUserToDelete] = useState(null); // State to track which user to delete
  const [editDialogOpen, setEditDialogOpen] = useState(false); // State for edit dialog
  const [userToEdit, setUserToEdit] = useState(null); // State to track which user to edit
  const [editedUserData, setEditedUserData] = useState({}); // State to hold edited user data
  const [storageOptions, setStorageOptions] = useState({}); // State to manage storage options for each user
  const [order, setOrder] = useState("asc"); // State for sorting order
  const [orderBy, setOrderBy] = useState("name"); // State for sorting column
  const [changesMade, setChangesMade] = useState(false); // State to track if changes were made
  const [newUserData, setNewUserData] = useState({}); // State to hold new user data

  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for snackbar message

  // Pagination state
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(25); // Rows per page

  // State for hovered row
  const [hoveredRow, setHoveredRow] = useState(null); // Track hovered row

  const [formErrors, setFormErrors] = useState({});

  // Add these state variables inside the Dashboard component
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // const [departments, setDepartments] = useState(defaultDepartments);
  const [roles, setRoles] = useState(defaultRoles);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    shortName: "",
    roles: [],
    initialRole: "",
  });
  const [newRole, setNewRole] = useState("");
  const [selectedDepartmentForRole, setSelectedDepartmentForRole] =
    useState("");

  const [searchResults, setSearchResults] = useState([]);

  // Add these state variables
  const [selectAllDialogOpen, setSelectAllDialogOpen] = useState(false);
  const [selectAllPending, setSelectAllPending] = useState(false);
  // Add this state for tracking checkbox selections
  const [migrationOptions, setMigrationOptions] = useState({});

  // Add this state after other useState declarations
  const [selectUserOpen, setSelectUserOpen] = useState(false);
  const [selectedUserAnchor, setSelectedUserAnchor] = useState(null);

  // Add these state variables
  const [targetUser, setTargetUser] = useState(null);
  const [migrationError, setMigrationError] = useState("");

  // Add this function to calculate total data
  const calculateTotalData = (selectedUsers) => {
    return selectedUsers.reduce(
      (total, user) => total + parseInt(user.storageUsed),
      0
    );
  };

  // Add this function to calculate total storage
  const calculateTotalStorage = (selectedUsers, options) => {
    return selectedUsers.reduce((total, user) => {
      return (
        total +
        (options[user.id]?.storage ? parseInt(user.storageAllocated) : 0)
      );
    }, 0);
  };

  // Add this function to calculate totals
  const calculateTotals = (selectedUsers, options) => {
    return selectedUsers.reduce(
      (acc, user) => {
        if (options[user.id]?.data) {
          acc.totalData += parseInt(user.storageUsed);
        }
        if (options[user.id]?.storage) {
          acc.totalStorage += parseInt(user.storageAllocated);
        }
        return acc;
      },
      { totalData: 0, totalStorage: 0 }
    );
  };

  // Add this handler function
  const handleSelectUserClick = (event) => {
    setSelectedUserAnchor(event.currentTarget);
    setSelectUserOpen(true);
  };

  // Add this handler function
  const handleSelectUserClose = () => {
    setSelectedUserAnchor(null);
    setSelectUserOpen(false);
  };
  // Add this handler
  const handleSearch = (results) => {
    if (results.length === 0) {
      // If search is cleared, show all rows
      setSearchResults([]);
    } else {
      // Update filtered results
      setSearchResults(results);
    }
  };

  // Add these state variables inside your Dashboard component
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [selectedUsersData, setSelectedUsersData] = useState([]);

  const handleMigrationClick = () => {
    const selectedUsersInfo = rows
      .filter((row) => selected.includes(row.name))
      .map((user) => ({
        id: user.name,
        name: user.name,
        // Remove 'GB' and convert to number for calculations
        storageUsed: parseInt(user.manageStorage.replace("GB", "")),
        storageAllocated: parseInt(user.storageUsed.replace("GB", "")),
        status: user.status,
      }));

    // Initialize migration options with data always true and storage false
    const initialOptions = {};
    selectedUsersInfo.forEach((user) => {
      initialOptions[user.id] = {
        data: true, // Data migration is always required
        storage: false, // Storage migration is optional
      };
    });

    // Calculate total data to be migrated
    const totalData = selectedUsersInfo.reduce(
      (sum, user) => sum + user.storageUsed,
      0
    );
    console.log("Total data to be migrated:", totalData + "GB");

    // Set states for the migration dialog
    setMigrationOptions(initialOptions);
    setSelectedUsersData(selectedUsersInfo);
    setMigrationDialogOpen(true);

    // Optional: Log initial state for debugging
    console.log("Selected users for migration:", selectedUsersInfo);
    console.log("Initial migration options:", initialOptions);
  };

  const handleMigrate = (targetUser) => {
    // Parse target user's storage values
    const targetStorageAllocated = parseInt(
      targetUser.storageUsed.replace("GB", "")
    );
    const targetStorageUsed = parseInt(
      targetUser.manageStorage.replace("GB", "")
    );
    const targetAvailableStorage = targetStorageAllocated - targetStorageUsed;

    // Calculate total data and storage to migrate
    const totalDataToMigrate = selectedUsersData.reduce(
      (total, user) => total + parseInt(user.storageUsed),
      0
    );

    const totalStorageToMigrate = selectedUsersData.reduce(
      (total, user) =>
        total +
        (migrationOptions[user.id]?.storage
          ? parseInt(user.storageAllocated)
          : 0),
      0
    );

    // Check if only data is being migrated
    const isOnlyDataMigration = totalStorageToMigrate === 0;

    if (isOnlyDataMigration) {
      // Check if target has enough available storage for data
      if (totalDataToMigrate > targetAvailableStorage) {
        setMigrationError(
          `Target user doesn't have enough available storage. Available: ${targetAvailableStorage}GB, Required: ${totalDataToMigrate}GB`
        );
        return false;
      }

      // Update rows with data migration only - now includes equal case
      if (totalDataToMigrate <= targetAvailableStorage) {
        setRows((prevRows) =>
          prevRows.map((row) => {
            if (row.name === targetUser.name) {
              const newManageStorage = targetStorageUsed + totalDataToMigrate;
              return {
                ...row,
                manageStorage: `${newManageStorage}GB`,
              };
            }
            if (selected.includes(row.name)) {
              return {
                ...row,
                manageStorage: "0GB",
                status: "inactive",
              };
            }
            return row;
          })
        );
      }
    } else {
      // Handle both data and storage migration
      const newTargetStorageNeeded =
        totalStorageToMigrate + targetStorageAllocated;
      const newTargetManageStorage = targetStorageUsed + totalDataToMigrate;

      // Update rows with both data and storage migration
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.name === targetUser.name) {
            return {
              ...row,
              storageUsed: `${newTargetStorageNeeded}GB`,
              manageStorage: `${newTargetManageStorage}GB`,
            };
          }
          if (selected.includes(row.name)) {
            return {
              ...row,
              storageUsed: "0GB",
              manageStorage: "0GB",
              status: "inactive",
            };
          }
          return row;
        })
      );
    }

    // Save changes to localStorage
    localStorage.setItem("dashboardRows", JSON.stringify(rows));
    setChangesMade(true);

    // Clear selections and close dialog
    setSelected([]);
    setMigrationDialogOpen(false);
    setSnackbarMessage("Migration completed successfully");
    setSnackbarOpen(true);

    return true;
  };
  // Add this validation function at the top level of your component
  const validateStorageInput = (value) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue;
  };

  // Add these functions to handle new departments and roles
  const handleAddDepartment = () => {
    if (
      newDepartment.name &&
      newDepartment.displayName &&
      !departments.some((dept) => dept.name === newDepartment.name)
    ) {
      const newDeptWithRoles = {
        ...newDepartment,
        roles: [], // Initialize empty roles array
      };
      setDepartments((prev) => [...prev, newDeptWithRoles]);
      setNewDepartment({ name: "", displayName: "", roles: [] });
      setShowAddDepartment(false);
      setSnackbarMessage(
        `Department "${newDepartment.name}" added successfully!`
      );
      setSnackbarOpen(true);
    }
  };

  const handleAddRole = () => {
    if (newRole && newUserData.department) {
      // Find the department
      const department = departments.find(
        (dept) => dept.name === newUserData.department
      );

      // Check if role already exists (case-insensitive)
      const roleExists = department?.roles.some(
        (existingRole) => existingRole.toLowerCase() === newRole.toLowerCase()
      );

      if (roleExists) {
        setSnackbarMessage(
          `Role "${newRole}" already exists in ${newUserData.department} department`
        );
        setSnackbarOpen(true);
        return;
      }

      // If role doesn't exist, add it
      setDepartments((prev) =>
        prev.map((dept) => {
          if (dept.name === newUserData.department) {
            return {
              ...dept,
              roles: [...dept.roles, newRole],
            };
          }
          return dept;
        })
      );
      setNewRole("");
      setShowAddRole(false);
      setSnackbarMessage(
        `Role "${newRole}" added to ${newUserData.department} department successfully!`
      );
      setSnackbarOpen(true);
    }
  };
  const handleBulkDownload = () => {
    let dataToDownload = [];

    if (selected.length > 0) {
      // Download only selected users
      dataToDownload = rows
        .filter((row) => selected.includes(row.name))
        .map(({ activeLicense, ...row }) => ({
          // Remove activeLicense from download
          ...row,
          edit: "No",
        }));
    } else {
      // Download all users
      dataToDownload = rows.map(({ activeLicense, ...row }) => ({
        // Remove activeLicense from download
        ...row,
        edit: "No",
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_data.xlsx");
  };
  // Show snackbar
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleAddUser = async () => {
    const errors = {};
    // Validate all required fields
    if (!newUserData.name?.trim()) errors.name = "Name is required";
    if (!newUserData.reportingManager) {
      errors.reportingManager = "Reporting Manager is required";
    }
    if (!newUserData.department) errors.department = "Department is required";
    if (!newUserData.role) errors.role = "Role is required";
    if (!newUserData.email?.trim()) errors.email = "Email is required";
    if (!newUserData.storageUsed?.trim())
      errors.storageUsed = "Storage allocation is required";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newUserData.email && !emailRegex.test(newUserData.email)) {
      errors.email = "Invalid email format";
    }

    if (!newUserData.username?.trim()) errors.username = "Username is required";
    // Add username uniqueness check
    const isDuplicateUsername = rows.some(
      (user) =>
        user.username?.toLowerCase() === newUserData.username?.toLowerCase()
    );
    if (isDuplicateUsername) {
      setSnackbarMessage("This username is already in use");
      setSnackbarOpen(true);
      return;
    }

    // Check for duplicate email
    const isDuplicateEmail = rows.some(
      (user) => user.email.toLowerCase() === newUserData.email?.toLowerCase()
    );

    if (isDuplicateEmail) {
      setSnackbarMessage("This email address is already in use");
      setSnackbarOpen(true);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const inviteLink = generateInviteLink(newUserData.email);
    console.log("Generated invite link:", inviteLink); // Debug log
    const emailSent = await sendInviteEmail(newUserData.email, inviteLink);
    console.log("Email send result:", emailSent); // Debug log
    if (!emailSent) {
      setSnackbarMessage("Error sending invite email. Please try again.");
      setSnackbarOpen(true);
      return;
    }

    const updatedRows = [
      ...rows,
      {
        ...newUserData,
        status: "pending",
        manageStorage: "1GB",
      },
    ];
    setRows(updatedRows);
    localStorage.setItem("dashboardRows", JSON.stringify(updatedRows));
    setNewUserData({});
    setFormErrors({});
    setOpenAddUserDialog(false);
    setChangesMade(true);
    showSnackbar("User added successfully");
  };

  // Handle input change for new user
  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Open Add User Dialog
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false); // State for Add User dialog

  const handleToggle = (name) => {
    if (selected.length > 0) {
      // If there are selected rows, toggle all selected rows
      setRows((prevRows) =>
        prevRows.map((row) =>
          selected.includes(row.name)
            ? { ...row, activeLicense: !row.activeLicense }
            : row
        )
      );
    } else {
      // If no rows are selected, toggle only the clicked row
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.name === name
            ? { ...row, activeLicense: !row.activeLicense }
            : row
        )
      );
    }
    setChangesMade(true);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectAllPending(true);
      setSelectAllDialogOpen(true);
    } else {
      setSelected([]);
    }
  };

  // Add the selection dialog handler functions
  const handleSelectAllDialogClose = () => {
    setSelectAllDialogOpen(false);
    setSelectAllPending(false);
  };

  const handleSelectAllConfirm = (selectAll) => {
    if (selectAll) {
      // Select all users across all pages
      const allNames = rows.map((row) => row.name);
      setSelected(allNames);
    } else {
      // Select only current page users
      const currentPageNames = filteredRows
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row) => row.name);
      setSelected(currentPageNames);
    }
    setSelectAllDialogOpen(false);
    setSelectAllPending(false);
  };

  const handleSelectOne = (name) => {
    const currentIndex = selected.indexOf(name);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(name);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget); // Open filter dropdown
  };

  const handleFilterClose = () => {
    setAnchorEl(null); // Close filter dropdown
  };

  const handleFilterChange = (status) => {
    setFilter(status); // Set the selected filter
    handleFilterClose(); // Close the dropdown
  };

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (order === "asc") {
      // Convert strings to lowercase for case-insensitive comparison
      return String(a[orderBy] || "").toLowerCase() <
        String(b[orderBy] || "").toLowerCase()
        ? -1
        : 1;
    } else {
      return String(a[orderBy] || "").toLowerCase() >
        String(b[orderBy] || "").toLowerCase()
        ? -1
        : 1;
    }
  });

  const filteredRows = sortedRows.filter((row) => {
    // First apply search filter if search results exist
    if (searchResults.length > 0) {
      const isInSearchResults = searchResults.some(
        (searchRow) => searchRow.name === row.name
      );
      if (!isInSearchResults) return false;
    }

    // Then apply status filter
    if (filter === "Active") return row.status === "active";
    if (filter === "Inactive") return row.status === "inactive";
    if (filter === "Pending") return row.status === "pending";
    return true; // Show all rows for 'All'
  });

  // Activate all selected users
  const activateAll = () => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        selected.includes(row.name) ? { ...row, activeLicense: true } : row
      )
    );
    setSelected([]); // Clear selection after activation
    setChangesMade(true);
  };

  // Deactivate all selected users
  const deactivateAll = () => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        selected.includes(row.name) ? { ...row, activeLicense: false } : row
      )
    );
    setSelected([]); // Clear selection after deactivation
    setChangesMade(true);
  };

  // Handle edit action
  const handleEdit = (name) => {
    const user = rows.find((row) => row.name === name);
    setUserToEdit(user);
    setEditedUserData(user); // Set the initial data for editing
    setEditDialogOpen(true); // Open the edit dialog
  };

  // Modify the handleDelete function
  const handleDelete = (name) => {
    if (selected.length > 0) {
      // If there are selected rows, confirm deletion for all selected rows
      setUserToDelete(selected.join(", "));
    } else {
      // If no rows are selected, delete only the clicked row
      setUserToDelete(name);
    }
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    let usersToDelete;
    let updatedRows;

    if (selected.length > 0) {
      // Delete all selected rows
      usersToDelete = rows.filter((row) => selected.includes(row.name));
      updatedRows = rows.filter((row) => !selected.includes(row.name));
    } else {
      // Delete single row
      usersToDelete = rows.filter((row) => row.name === userToDelete);
      updatedRows = rows.filter((row) => row.name !== userToDelete);
    }

    // Update departments by removing roles that are no longer used
    setDepartments((prevDepartments) => {
      const departmentUsage = new Map();

      // Count remaining users per department and role
      updatedRows.forEach((row) => {
        if (!departmentUsage.has(row.department)) {
          departmentUsage.set(row.department, new Set());
        }
        departmentUsage.get(row.department).add(row.role);
      });

      // Update departments
      return prevDepartments
        .map((dept) => {
          const usedRoles = departmentUsage.get(dept.name);
          if (!usedRoles) {
            // If department has no more users, remove it
            return null;
          }
          return {
            ...dept,
            roles: dept.roles.filter((role) => usedRoles.has(role)),
          };
        })
        .filter(Boolean); // Remove null departments
    });

    // Update rows
    setRows(updatedRows);
    localStorage.setItem("dashboardRows", JSON.stringify(updatedRows));
    setSelected([]);
    setOpenDialog(false);
    setUserToDelete(null);
    setChangesMade(true);

    // Show success message
    const message =
      selected.length > 0
        ? `Successfully deleted ${selected.length} users and updated departments`
        : `Successfully deleted user "${userToDelete}" and updated departments`;
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Add an effect to handle changes
  useEffect(() => {
    if (changesMade) {
      localStorage.setItem("dashboardRows", JSON.stringify(rows));
    }
  }, [rows, changesMade]);

  // Add cleanup function
  useEffect(() => {
    return () => {
      if (changesMade) {
        localStorage.setItem("dashboardRows", JSON.stringify(rows));
      }
    };
  }, []);

  // Cancel delete action
  const cancelDelete = () => {
    setOpenDialog(false); // Close the dialog
    setUserToDelete(null); // Clear the user to delete
  };

  // Update the saveEditedUser function
  const saveEditedUser = () => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.name === userToEdit.name ? { ...row, ...editedUserData } : row
      )
    );

    // Save to localStorage immediately
    const updatedRows = rows.map((row) =>
      row.name === userToEdit.name ? { ...row, ...editedUserData } : row
    );
    localStorage.setItem("dashboardRows", JSON.stringify(updatedRows));

    setEditDialogOpen(false);
    setUserToEdit(null);
    setSnackbarMessage("User details updated successfully");
    setSnackbarOpen(true);
  };

  // Handle input change in edit dialog
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prevData) => ({ ...prevData, [name]: value }));
    // setChangesMade(true);
  };

  // Update the handleStorageChange function
  const handleStorageChange = (name, value) => {
    const updatedRows = rows.map((row) => {
      if (row.name === name) {
        return {
          ...row,
          manageStorage: value, // Only update manageStorage, leave storageUsed unchanged
        };
      }
      return row;
    });

    setRows(updatedRows);
    localStorage.setItem("dashboardRows", JSON.stringify(updatedRows));
    setChangesMade(true);
  };

  const handleSaveChanges = () => {
    localStorage.setItem("dashboardRows", JSON.stringify(rows));
    setChangesMade(false);
    setSnackbarMessage("Changes saved successfully");
    setSnackbarOpen(true);
  };

  // Add useEffect to handle changes
  useEffect(() => {
    if (changesMade) {
      localStorage.setItem("dashboardRows", JSON.stringify(rows));
    }
  }, [rows, changesMade]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // Handle mouse enter and leave for row focus
  const handleMouseEnter = (name) => {
    setHoveredRow(name);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  // Modify the handleBulkUpload function:

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate the data structure
        const isValidData = jsonData.every(
          (row) =>
            row.username &&
            row.name &&
            row.department &&
            row.role &&
            row.email &&
            row.storageUsed &&
            row.edit
        );

        if (!isValidData) {
          setSnackbarMessage(
            "Invalid file format. Please use the correct template."
          );
          setSnackbarOpen(true);
          return;
        }

        const existingEmails = new Set(
          rows.map((row) => row.email.toLowerCase())
        );
        const existingNames = new Set(
          rows.map((row) => row.name.toLowerCase())
        );
        const duplicateEmails = [];
        const duplicateNames = [];
        const newUsers = [];
        const updatedUsers = [];
        const ignoredRows = [];
        const emailEditAttempts = []; // New array to track email edit attemptsl

        jsonData.forEach((user) => {
          if (user.edit?.toLowerCase() === "yes") {
            const existingUserIndex = rows.findIndex(
              (row) => row.email.toLowerCase() === user.email.toLowerCase()
            );

            if (existingUserIndex >= 0) {
              const existingEmail = rows[existingUserIndex].email;
              updatedUsers.push({
                ...user,
                email: existingEmail,
                status: rows[existingUserIndex].status, // Preserve existing status
              });
            } else {
              ignoredRows.push({
                ...user,
                reason: "User not found for editing",
              });
            }
          } else {
            const isDuplicateEmail = existingEmails.has(
              user.email.toLowerCase()
            );
            const isDuplicateName = existingNames.has(user.name.toLowerCase());

            if (isDuplicateEmail) {
              duplicateEmails.push(user.email);
              ignoredRows.push({ ...user, reason: "Duplicate email" });
            } else if (isDuplicateName) {
              duplicateNames.push(user.name);
              ignoredRows.push({ ...user, reason: "Duplicate name" });
            } else {
              newUsers.push({
                ...user,
                status: "pending", // Set status as pending for new users
                manageStorage: "1GB",
                phone: user.phone || "",
              });
              existingEmails.add(user.email.toLowerCase());
              existingNames.add(user.name.toLowerCase());
            }
          }
        });

        // Update existing users
        let updatedRows = [...rows];
        updatedUsers.forEach((userToUpdate) => {
          updatedRows = updatedRows.map((row) =>
            row.email.toLowerCase() === userToUpdate.email.toLowerCase()
              ? { ...userToUpdate, email: row.email }
              : row
          );
        });

        // Add new users with pending status
        updatedRows = [...updatedRows, ...newUsers];
        setRows(updatedRows);
        localStorage.setItem("dashboardRows", JSON.stringify(updatedRows));
        setChangesMade(true);

        const message = [
          `Successfully processed ${jsonData.length} rows:`,
          `- ${newUsers.length} new users added (with pending status)`,
          `- ${updatedUsers.length} users updated`,
          `- ${ignoredRows.length} rows ignored`,
        ].join("\n");

        setSnackbarMessage(message);
        setSnackbarOpen(true);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Upload error:", error);
      setSnackbarMessage("Error processing file. Please try again.");
      setSnackbarOpen(true);
    }

    event.target.value = "";
  };
  // Add this handler function inside the Dashboard component
  const handleDeleteAll = () => {
    if (selected.length > 0) {
      setUserToDelete(selected.join(", "));
      setOpenDialog(true);
    }
  };

  // Add this function to reset to initial data
  const resetToInitialData = () => {
    setRows(initialRows);
    localStorage.removeItem("dashboardRows");
    setChangesMade(false);
    setSnackbarMessage("Reset to initial data successful");
    setSnackbarOpen(true);
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04) !important", // Lighter hover color
      cursor: "pointer",
    },
    "& .MuiTableCell-root": {
      padding: "1px 8px",
      height: "20px", // Reduced height
      fontSize: "0.875rem",
      whiteSpace: "nowrap",
      borderBottom: "1px solid #eee",
    },

    "&.Mui-selected": {
      backgroundColor: "rgba(25, 118, 210, 0.08) !important", // Lighter selection color
    },
    transition: "background-color 0.1s ease",
  }));

  const handleTemplateDownload = () => {
    const template = [
      {
        Username: "K_Sawhney15",
        Name: "Kapil Sahwhey",
        Department: "Department Name",
        Role: "Role Name/Designaton",
        Email: "Kapil@Example.Com",
        StorageUsed: "10GB",
        Status: "Inactive",
        Phone: "1234567890",
        "Reporting Manager": "Manager Name",
        Edit: "No",
      },
    ];

    // Add column width specifications
    const wscols = [
      { wch: 15 }, // username
      { wch: 20 }, // name
      { wch: 20 }, // department
      { wch: 15 }, // role
      { wch: 25 }, // email
      { wch: 15 }, // storageUsed
      { wch: 15 }, // status
      { wch: 15 }, // phone
      { wch: 25 }, // reporting manager
      { wch: 10 }, // edit
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);

    // Define header style
    const headerStyle = {
      font: {
        bold: true,
        sz: 12,
        color: { rgb: "000000" },
      },
      fill: {
        fgColor: { rgb: "FFFFFF" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Apply style to header row
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;

      worksheet[address].s = headerStyle;

      // Ensure cell properties are set
      if (!worksheet[address].v) worksheet[address].v = "";
      worksheet[address].t = "s"; // Set type as string
    }

    // Set column widths
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Write file with specific options to ensure styles are preserved
    XLSX.writeFile(workbook, "user_upload_template.xlsx", {
      bookSST: false,
      type: "binary",
      cellStyles: true,
      compression: true,
    });
  };

  useEffect(() => {
    const storedDepartments = localStorage.getItem("departments");
    if (storedDepartments) {
      setDepartments(JSON.parse(storedDepartments));
    } else {
      // Initialize with default departments if none exist
      localStorage.setItem("departments", JSON.stringify(departments));
    }
  }, []);

  // Update handleStatusChange
  const handleStatusChange = (name, newStatus) => {
    if (newStatus === "pending") {
      return;
    }
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.name === name
          ? {
              ...row,
              status: newStatus,
            }
          : row
      )
    );
    setChangesMade(true);
    // Update localStorage immediately
    const updatedRows = rows.map((row) =>
      row.name === name ? { ...row, status: newStatus } : row
    );
    localStorage.setItem("dashboardRows", JSON.stringify(updatedRows));
  };

  // Add these functions inside Dashboard component
  const generateInviteLink = (email) => {
    const token = uuidv4();
    const inviteLink = `${window.location.origin}/activate/${token}`;

    // Store the token and email mapping
    const invites = JSON.parse(localStorage.getItem("pendingInvites") || "{}");
    // invites[token] = email;
    invites[token] = {
      email,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours expiry
    };
    localStorage.setItem("pendingInvites", JSON.stringify(invites));

    return inviteLink;
  };

  // Update the sendInviteEmail function
  const sendInviteEmail = async (email, inviteLink) => {
    try {
      const response = await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        {
          to_email: email,
          invite_link: inviteLink,
          message: `Click the following link to activate your account: ${inviteLink}`,
        },
        EMAIL_USER_ID
      );

      if (response.status === 200) {
        console.log("Email sent successfully");
        return true;
      } else {
        console.error("Failed to send email:", response);
        return false;
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      return false;
    }
  };

  useEffect(() => {
    const cleanupExpiredInvites = () => {
      const invites = JSON.parse(
        localStorage.getItem("pendingInvites") || "{}"
      );
      const now = new Date();

      const validInvites = Object.entries(invites).reduce(
        (acc, [token, data]) => {
          if (new Date(data.expiry) > now) {
            acc[token] = data;
          }
          return acc;
        },
        {}
      );

      localStorage.setItem("pendingInvites", JSON.stringify(validInvites));
    };

    // Clean up on mount and every hour
    cleanupExpiredInvites();
    const interval = setInterval(cleanupExpiredInvites, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar /> {/* Add Sidebar */}
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: 0,
          transition: "margin-left 0.3s",
          overflow: "hidden",
        }}
      >
        <Navbar onThemeToggle={onThemeToggle} onSearch={handleSearch} />
        <Box
          sx={{
            p: 0,
            marginLeft: "48px",
            overflow: "hidden",
            height: "calc(100vh - 48px)",
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              height: "calc(100vh - 48px)", // Adjusted for 48px navbar + margins/padding
              "& .MuiTableHead-root": {
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                padding: "1px 8px",
                height: "20px",
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              },
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "0px",
              overflow: "auto",
              position: "relative",
            }}
          >
            <Table>
              <TableHead>
                {/* <TableRow sx={{ height: "10px", padding: "2px" }}> */}
                <TableRow>
                  {" "}
                  {/* Set header row height */}
                  <TableCell padding="checkbox" sx={{ width: "40px" }}>
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredRows.length
                      }
                      checked={
                        filteredRows.length > 0 &&
                        selected.length === filteredRows.length
                      }
                      onChange={handleSelectAll}
                      inputProps={{
                        "aria-label": "select all users",
                      }}
                      size="small"
                    />
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "2px" }}> */}
                  <TableCell
                    sx={{
                      width: "150px",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      color: "#444",
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      <TableSortLabel
                        active={orderBy === "username"}
                        direction={orderBy === "username" ? order : "asc"}
                        onClick={() => handleRequestSort("username")}
                      >
                        User Name
                      </TableSortLabel>
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "150px", padding: "2px" }}>
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={orderBy === "name" ? order : "asc"}
                        onClick={() => handleRequestSort("name")}
                      >
                        Name
                      </TableSortLabel>
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "150px", padding: "2px" }}>
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      <TableSortLabel
                        active={orderBy === "department"}
                        direction={orderBy === "department" ? order : "asc"}
                        onClick={() => handleRequestSort("department")}
                      >
                        Department
                      </TableSortLabel>
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "150px", padding: "2px" }}>
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      <TableSortLabel
                        active={orderBy === "role"}
                        direction={orderBy === "role" ? order : "asc"}
                        onClick={() => handleRequestSort("role")}
                      >
                        Role
                      </TableSortLabel>
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "200px", padding: "2px" }}>
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      <TableSortLabel
                        active={orderBy === "email"}
                        direction={orderBy === "email" ? order : "asc"}
                        onClick={() => handleRequestSort("email")}
                      >
                        User Email
                      </TableSortLabel>
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "150px", padding: "2px" }}>
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      <TableSortLabel
                        active={orderBy === "storageUsed"}
                        direction={orderBy === "storageUsed" ? order : "asc"}
                        onClick={() => handleRequestSort("storageUsed")}
                      >
                        Storage Used
                      </TableSortLabel>
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "150px", padding: "2px" }}>
                    <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                      Manage Storage
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "140px", padding: "2px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        // justifyContent: 'flex-start',
                        // gap: 0.5,
                        justifyContent: "space-between", // Change from flex-start to space-between
                        width: "100%", // Ensure the box takes full width
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold" fontFamily={"sans-serif"}>
                        Tools
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {" "}
                        {/* Add margin to create separation */}
                        <IconButton
                          onClick={handleFilterClick}
                          size="small"
                          sx={{
                            padding: "2px",
                            marginLeft: "4px",
                          }}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleFilterClose}
                        >
                          <MenuItem onClick={() => handleFilterChange("All")}>
                            All
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleFilterChange("Active")}
                          >
                            Active
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleFilterChange("Inactive")}
                          >
                            Inactive
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleFilterChange("Pending")}
                          >
                            Pending
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length > 0 ? (
                  filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const isItemSelected = isSelected(row.name);
                      return (
                        <StyledTableRow
                          key={row.name}
                          hover
                          onMouseEnter={() => handleMouseEnter(row.name)}
                          onMouseLeave={handleMouseLeave}
                          selected={isItemSelected}
                          sx={{
                            backgroundColor:
                              hoveredRow === row.name
                                ? "rgba(0, 0, 0, 0.04)" // Lighter hover color
                                : "inherit",
                            height: "20px",
                            transition: "background-color 0.1s ease",
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ padding: "3px" }}>
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              onChange={() => handleSelectOne(row.name)}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: "2px 8px",
                              color: "#333",
                              fontSize: "0.875rem",
                              
                            }}
                          >
                            {row.username}
                          </TableCell>
                          {/* 
                          <TableCell sx={{ padding: "3px" }}>
                            {row.name}
                          </TableCell> */}
                          <TableCell
                            sx={{
                              padding: "2px 8px",
                              color: "#333",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.name}
                          </TableCell>
                          {/* <TableCell sx={{ padding: "3px" }}>
                            {row.department}
                          </TableCell> */}
                          <TableCell
                            sx={{
                              padding: "2px 8px",
                              color: "#333",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.department}
                          </TableCell>
                          {/* <TableCell sx={{ padding: "3px" }}>
                            {row.role}
                          </TableCell> */}
                          <TableCell
                            sx={{
                              padding: "2px 8px",
                              color: "#333",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.role}
                          </TableCell>
                          {/* <TableCell sx={{ padding: "3px" }}>
                            {row.email}
                          </TableCell> */}
                          <TableCell
                            sx={{
                              padding: "2px 8px",
                              color: "#333",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.email}
                          </TableCell>
                          {/* <TableCell sx={{ padding: "3px" }}>
                            {row.storageUsed}
                          </TableCell> */}
                          <TableCell
                            sx={{
                              padding: "2px 8px",
                              color: "#333",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.storageUsed}
                          </TableCell>

                          <TableCell
                            sx={{
                              width: "150px",
                              padding: "2px",
                              height: "20px",
                            }}
                          >
                            <FormControl
                              fullWidth
                              size="small"
                              disabled={row.storageUsed === "0GB"} // Disable if storage is 0GB
                              sx={{
                                minWidth: 80,
                                "& .MuiOutlinedInput-root": {
                                  height: "24px",
                                  fontSize: "0.875rem",
                                  backgroundColor:
                                    row.storageUsed === "0GB"
                                      ? "#f5f5f5"
                                      : "white",
                                  "& fieldset": {
                                    borderColor: "#e0e0e0",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#bdbdbd",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#1976d2",
                                  },
                                  "&.Mui-disabled": {
                                    backgroundColor: "#f5f5f5",
                                    cursor: "not-allowed",
                                  },
                                },
                                "& .MuiSelect-select": {
                                  padding: "2px 8px",
                                  paddingRight: "24px !important",
                                },
                              }}
                            >
                              <Select
                                value={row.manageStorage || row.storageUsed}
                                onChange={(e) =>
                                  handleStorageChange(row.name, e.target.value)
                                }
                                disabled={row.storageUsed === "0GB"} // Disable if storage is 0GB
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      maxHeight: 200,
                                      "& .MuiMenuItem-root": {
                                        height: "24px",
                                        fontSize: "0.875rem",
                                        padding: "2px 8px",
                                        minHeight: "auto",
                                      },
                                    },
                                  },
                                }}
                              >
                                {![1, 2, 3, 5, 10, 15, 20, 25, 50]
                                  .map((size) => `${size}GB`)
                                  .includes(row.manageStorage) && (
                                  <MenuItem
                                    value={row.manageStorage}
                                    sx={{
                                      "&.Mui-selected": {
                                        backgroundColor: "#e3f2fd",
                                      },
                                      "&.Mui-selected:hover": {
                                        backgroundColor: "#bbdefb",
                                      },
                                    }}
                                  >
                                    {row.manageStorage}
                                  </MenuItem>
                                )}

                                {[1, 2, 3, 5, 10, 15, 20, 25, 50].map(
                                  (size) => (
                                    <MenuItem
                                      key={size}
                                      value={`${size}GB`}
                                      sx={{
                                        "&.Mui-selected": {
                                          backgroundColor: "#e3f2fd",
                                        },
                                        "&.Mui-selected:hover": {
                                          backgroundColor: "#bbdefb",
                                        },
                                      }}
                                    >
                                      {size} GB
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                          </TableCell>

                         
                          <TableCell
  sx={{
    width: "150px",
    padding: "2px",
    height: "20px",
  }}
>
  {hoveredRow === row.name && !isSelected(row.name) && ( // Only show if row is hovered AND not selected
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        position: "relative",
        zIndex: 1000,
      }}
    >
      <Tooltip
        title={
          (row.status || "pending")
            .charAt(0)
            .toUpperCase() +
          (row.status || "pending").slice(1)
        }
        placement="top"
      >
        <Box>
          <Switch
            checked={row.status === "active"}
            onChange={(e) => {
              let newStatus;
              newStatus = e.target.checked ? "active" : "inactive";
              handleStatusChange(row.name, newStatus);
            }}
            sx={{
              "& .MuiSwitch-switchBase": {
                "&.Mui-checked": {
                  color: statusColors.active,
                  "& + .MuiSwitch-track": {
                    backgroundColor: alpha(statusColors.active, 0.5),
                  },
                },
              },
              "& .MuiSwitch-thumb": {
                backgroundColor:
                  (row.status || "pending") === "active"
                    ? statusColors.active
                    : (row.status || "pending") === "pending"
                    ? statusColors.pending
                    : statusColors.inactive,
              },
              "& .MuiSwitch-track": {
                backgroundColor:
                  (row.status || "pending") === "active"
                    ? alpha(statusColors.active, 0.5)
                    : (row.status || "pending") === "pending"
                    ? alpha(statusColors.pending, 0.5)
                    : alpha(statusColors.inactive, 0.5),
              },
            }}
            size="small"
          />
        </Box>
      </Tooltip>
      <IconButton
        onClick={() => handleEdit(row.name)}
        disabled={selected.length > 1}
        sx={{ padding: "4px" }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={() => handleDelete(row.name)}
        sx={{ padding: "4px" }}
      >
        <DeleteIcon fontSize="small" color="error" />
      </IconButton>
    </Box>
  )}
  {hoveredRow === row.name && isSelected(row.name) && ( // Only show delete icon when selected
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconButton
        onClick={() => handleDelete(row.name)}
        sx={{ padding: "4px" }}
      >
        <DeleteIcon fontSize="small" color="error" />
      </IconButton>
    </Box>
  )}
</TableCell>
                        </StyledTableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="h6" color="textSecondary">
                        No Users Exist
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            {/* <Box sx={{ position: "fixed", bottom: 16, right: 16 }}> */}
            <Box
              sx={{
                position: "absolute",
                bottom: 180,
                right: 16,
                zIndex: 1000,
                display: "flex",
                gap: 3,
                flexDirection: "column", // Stack items vertically
                alignItems: "flex-end", // Align items to the right
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleBulkUpload}
                accept=".xlsx,.xls"
                style={{ display: "none" }}
              />
              {selected.length === 0 && (
                <Tooltip title="Add New User" placement="left">
                  <SpeedDial
                    ariaLabel="Add new user"
                    icon={<PersonAddIcon />}
                    direction="left"
                    onClick={() => setOpenAddUserDialog(true)}
                    FabProps={{
                      size: "small",
                      sx: {
                        bgcolor: "#1976d2",
                        "&:hover": {
                          bgcolor: "#1565c0",
                        },
                        width: 30,
                        height: 30,
                      },
                    }}
                  />
                </Tooltip>
              )}

              {selected.length === 1 && (
                <Tooltip title="Download Selected User" placement="left">
                  <SpeedDial
                    ariaLabel="Download selected"
                    icon={<FileDownloadIcon />}
                    direction="left"
                    FabProps={{
                      size: "small",
                      sx: {
                        bgcolor: "#2e7d32",
                        "&:hover": {
                          bgcolor: "#1b5e20",
                        },
                        width: 30,
                        height: 30,
                      },
                    }}
                    onClick={() => {
                      handleBulkDownload();
                      setSelected([]);
                    }}
                  />
                </Tooltip>
              )}

              {selected.length > 1 && (
                <>
                  <Tooltip title="Download Selected Users" placement="left">
                    <SpeedDial
                      ariaLabel="Download selected"
                      icon={<FileDownloadIcon />}
                      direction="left"
                      FabProps={{
                        size: "small",
                        sx: {
                          bgcolor: "#2e7d32",
                          "&:hover": {
                            bgcolor: "#1b5e20",
                          },
                          width: 30,
                          height: 30,
                        },
                      }}
                      onClick={() => {
                        handleBulkDownload();
                        setSelected([]);
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="Delete Selected Users" placement="left">
                    <SpeedDial
                      ariaLabel="Delete selected"
                      icon={<DeleteForeverIcon />}
                      direction="left"
                      FabProps={{
                        size: "small",
                        sx: {
                          bgcolor: "#d32f2f",
                          "&:hover": {
                            bgcolor: "#c62828",
                          },
                          width: 30,
                          height: 30,
                        },
                      }}
                      onClick={handleDeleteAll}
                    />
                  </Tooltip>

                  <Tooltip title="Activate Selected Users" placement="left">
                    <SpeedDial
                      ariaLabel="Activate selected"
                      icon={<PowerSettingsNewIcon />}
                      direction="left"
                      FabProps={{
                        size: "small",
                        sx: {
                          bgcolor: "#388e3c",
                          "&:hover": {
                            bgcolor: "#2e7d32",
                          },
                          width: 30,
                          height: 30,
                        },
                      }}
                      onClick={activateAll}
                    />
                  </Tooltip>

                  <Tooltip title="Deactivate Selected Users" placement="left">
                    <SpeedDial
                      ariaLabel="Deactivate selected"
                      icon={<BlockIcon />}
                      direction="left"
                      FabProps={{
                        size: "small",
                        sx: {
                          bgcolor: "#f44336",
                          "&:hover": {
                            bgcolor: "#d32f2f",
                          },
                          width: 30,
                          height: 30,
                        },
                      }}
                      onClick={deactivateAll}
                    />
                  </Tooltip>
                </>
              )}

              {/* // Add this after your existing SpeedDial components, inside the same Box component */}
              {selected.length >= 1 && (
                <Tooltip title="Migrate Selected Users" placement="left">
                  <SpeedDial
                    ariaLabel="Migrate selected"
                    icon={< WifiProtectedSetupIcon />}
                    direction="left"
                    FabProps={{
                      size: "small",
                      sx: {
                        bgcolor: "#9c27b0",
                        "&:hover": {
                          bgcolor: "#7b1fa2",
                        },
                        width: 30,
                        height: 30,
                      },
                    }}
                    onClick={handleMigrationClick}
                  />
                </Tooltip>
              )}
            </Box>

            <Box
              sx={{
                position: "fixed",
                bottom: 100,
                right: 16,
                zIndex: 500,
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  position: "fixed",
                  bottom: 100,
                  right: 16,
                  zIndex: 500,
                }}
              >
                {changesMade && (
                  <Tooltip title="Save All Changes" placement="left">
                    <SpeedDial
                      ariaLabel="Save changes"
                      icon={<SaveOutlinedIcon />}
                      direction="left"
                      onClick={handleSaveChanges}
                      FabProps={{
                        size: "small",
                        sx: {
                          bgcolor: "#ffc107",
                          "&:hover": {
                            bgcolor: "#ffb300",
                          },
                          width: 30,
                          height: 30,
                          "& .MuiSpeedDialIcon-root": {
                            fontSize: "1.5rem",
                            color: "rgba(0, 0, 0, 0.87)",
                          },
                        },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openAddUserDialog}
        onClose={() => setOpenAddUserDialog(false)}
        maxWidth="sm"
      >
        <DialogContent>
          <Box sx={{ position: "relative", pb: 2 }}>
            <IconButton
              onClick={() => setOpenAddUserDialog(false)}
              sx={{
                position: "absolute",
                right: -8,
                top: -8,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <TextField
            required
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={newUserData.username || ""}
            onChange={(e) => {
              setNewUserData({ ...newUserData, username: e.target.value });
              setFormErrors({ ...formErrors, username: "" });
            }}
            error={Boolean(formErrors.username)}
            helperText={formErrors.username}
          />
          <TextField
            autoFocus
            required
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newUserData.name || ""}
            onChange={(e) => {
              setNewUserData({ ...newUserData, name: e.target.value });
              setFormErrors({ ...formErrors, name: "" });
            }}
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControl fullWidth error={Boolean(formErrors.department)}>
              <Autocomplete
                value={
                  departments.find(
                    (dept) => dept.name === newUserData.department
                  ) || null
                }
                onChange={(event, newValue) => {
                  if (newValue) {
                    setNewUserData((prev) => ({
                      ...prev,
                      department: newValue.name,
                      role: "",
                    }));
                  } else {
                    setNewUserData((prev) => ({
                      ...prev,
                      department: "",
                      role: "",
                    }));
                  }
                }}
                options={departments}
                getOptionLabel={(option) =>
                  `${option.name} / ${option.displayName}`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Department"
                    variant="outlined"
                    required
                    error={Boolean(formErrors.department)}
                    helperText={formErrors.department}
                  />
                )}
                noOptionsText={
                  <Box sx={{ textAlign: "center", py: 1 }}>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      No departments found
                    </Typography>
                    <Button
                      onClick={() => setShowAddDepartment(true)}
                      color="primary"
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      Add New Department
                    </Button>
                  </Box>
                }
                ListboxProps={{
                  style: { maxHeight: 250 },
                }}
                ListboxComponent={({ children, ...props }) => (
                  <ul {...props}>
                    {children}
                    <li style={{ padding: "8px" }}>
                      <Button
                        onClick={() => setShowAddDepartment(true)}
                        color="primary"
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        Add New Department
                      </Button>
                    </li>
                  </ul>
                )}
                renderOption={(props, option) => (
                  <li {...props}>{`${option.name} / ${option.displayName}`}</li>
                )}
                isOptionEqualToValue={(option, value) =>
                  option.name === value.name
                }
              />
            </FormControl>

            <FormControl fullWidth error={Boolean(formErrors.role)}>
              <Select
                required
                value={newUserData.role || ""}
                onChange={(e) => {
                  if (e.target.value === "add_new_role") {
                    setShowAddRole(true);
                  } else {
                    setNewUserData({ ...newUserData, role: e.target.value });
                    setFormErrors({ ...formErrors, role: "" });
                  }
                }}
                displayEmpty
                disabled={!newUserData.department}
              >
                <MenuItem value="" disabled>
                  Select Role
                </MenuItem>
                {departments.find(
                  (dept) => dept.name === newUserData.department
                )?.roles.length === 0 ? (
                  <MenuItem
                    value=""
                    disabled
                    sx={{ color: "text.secondary", fontStyle: "italic" }}
                  >
                    No roles available for this department
                  </MenuItem>
                ) : (
                  departments
                    .find((dept) => dept.name === newUserData.department)
                    ?.roles.map((role, index) => (
                      <MenuItem key={index} value={role}>
                        {role}
                      </MenuItem>
                    ))
                )}
                <MenuItem
                  value="add_new_role"
                  sx={{ borderTop: "1px solid #ccc" }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddRole(true);
                    }}
                    color="primary"
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    Add New Role
                  </Button>
                </MenuItem>
              </Select>
              {formErrors.role && (
                <FormHelperText>{formErrors.role}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              fullWidth
              error={Boolean(formErrors.reportingManager)}
              disabled={!newUserData.department}
            >
              <InputLabel>Reporting Manager</InputLabel>
              <Select
                value={newUserData.reportingManager || ""}
                onChange={(e) => {
                  setNewUserData({
                    ...newUserData,
                    reportingManager: e.target.value,
                  });
                  setFormErrors({ ...formErrors, reportingManager: "" });
                }}
                label="Reporting Manager"
              >
                <MenuItem value="" disabled>
                  Select Reporting Manager
                </MenuItem>
                {newUserData.department &&
                  departments.find(
                    (dept) => dept.name === newUserData.department
                  )?.reportingManager && (
                    <MenuItem
                      value={
                        departments.find(
                          (dept) => dept.name === newUserData.department
                        ).reportingManager
                      }
                    >
                      {
                        departments.find(
                          (dept) => dept.name === newUserData.department
                        ).reportingManager
                      }
                    </MenuItem>
                  )}
              </Select>
              {formErrors.reportingManager && (
                <FormHelperText>{formErrors.reportingManager}</FormHelperText>
              )}
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              required
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={newUserData.email || ""}
              onChange={(e) => {
                setNewUserData({ ...newUserData, email: e.target.value });
                setFormErrors({ ...formErrors, email: "" });
              }}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
            />

            <TextField
              required
              margin="dense"
              name="storageUsed"
              label="Storage"
              type="text"
              fullWidth
              variant="outlined"
              value={
                newUserData.storageUsed
                  ? newUserData.storageUsed.replace("GB", "")
                  : ""
              }
              onChange={(e) => {
                const numericValue = validateStorageInput(e.target.value);
                setNewUserData({
                  ...newUserData,
                  storageUsed: numericValue ? `${numericValue}GB` : "",
                });
                setFormErrors({ ...formErrors, storageUsed: "" });
              }}
              error={Boolean(formErrors.storageUsed)}
              helperText={formErrors.storageUsed || ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">GB</InputAdornment>
                ),
              }}
              sx={{ width: "40%" }}
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone Number"
              type="tel"
              variant="outlined"
              value={newUserData.phone || ""}
              onChange={(e) => {
                setNewUserData({ ...newUserData, phone: e.target.value });
                setFormErrors({ ...formErrors, phone: "" });
              }}
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
              sx={{ width: "40%" }}
            />
          </Box>

          {/* Add Department and Role section moved to bottom */}
          <Box sx={{ mt: 4, borderTop: "1px solid #ccc", pt: 2 }}>
            {showAddDepartment && (
              <Dialog
                open={showAddDepartment}
                onClose={() => setShowAddDepartment(false)}
                maxWidth="sm"
              >
                <DialogTitle>Add New Department</DialogTitle>
                <DialogContent>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
                      error={
                        !newDepartment.displayName && newDepartment.submitted
                      }
                      helperText={
                        !newDepartment.displayName && newDepartment.submitted
                          ? "Display name is required"
                          : "Short form"
                      }
                      sx={{ width: "30%" }}
                      // helperText="Short form"
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
                      error={
                        !newDepartment.reportingManager &&
                        newDepartment.submitted
                      }
                      helperText={
                        !newDepartment.reportingManager &&
                        newDepartment.submitted
                          ? "Reporting Manager is required"
                          : ""
                      }
                      fullWidth
                    />

                    <FormControl fullWidth size="small">
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
                        error={
                          !newDepartment.storage && newDepartment.submitted
                        }
                      >
                        {[25, 50, 75, 100, 150, 200].map((size) => (
                          <MenuItem key={size} value={`${size}GB`}>
                            {size} GB
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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
                      error={
                        !newDepartment.initialRole && newDepartment.submitted
                      }
                      helperText={
                        !newDepartment.initialRole && newDepartment.submitted
                          ? "At least one role is required"
                          : ""
                      }
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
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
                  <Button
                    onClick={() => {
                      setNewDepartment((prev) => ({
                        ...prev,
                        submitted: true,
                      }));

                      if (
                        !newDepartment.name ||
                        !newDepartment.displayName ||
                        !newDepartment.initialRole ||
                        !newDepartment.storage ||
                        !newDepartment.reportingManager
                      ) {
                        setSnackbarMessage("Please fill all required fields");
                        setSnackbarOpen(true);
                        return;
                      }

                      if (
                        departments.some(
                          (dept) => dept.name === newDepartment.name
                        )
                      ) {
                        setSnackbarMessage("Department already exists");
                        setSnackbarOpen(true);
                        return;
                      }

                      const newDeptWithRole = {
                        name: newDepartment.name,
                        displayName: newDepartment.displayName,
                        roles: [newDepartment.initialRole],
                        storage: newDepartment.storage,
                        reportingManager: newDepartment.reportingManager,
                      };

                      const updatedDepartments = [
                        ...departments,
                        newDeptWithRole,
                      ];
                      setDepartments(updatedDepartments);

                      // Store in localStorage
                      localStorage.setItem(
                        "departments",
                        JSON.stringify(updatedDepartments)
                      );

                      // setDepartments((prev) => [...prev, newDeptWithRole]);
                      setShowAddDepartment(false);
                      setNewDepartment({
                        name: "",
                        displayName: "",
                        initialRole: "",
                        storage: "50GB",
                        reportingManager: "",
                        submitted: false,
                      });
                      setSnackbarMessage(
                        `Department "${newDepartment.name}" added successfully with role "${newDepartment.initialRole}"!`
                      );
                      setSnackbarOpen(true);
                    }}
                    color="primary"
                  >
                    Add
                  </Button>
                </DialogActions>
              </Dialog>
            )}
            {showAddRole && (
              <Dialog
                open={showAddRole}
                onClose={() => setShowAddRole(false)}
                maxWidth="sm"
              >
                <DialogTitle>Add New Role</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    size="small"
                    label="New Role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setShowAddRole(false);
                      setNewRole("");
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleAddRole} // Replace the existing onClick with handleAddRole
                    color="primary"
                  >
                    Add
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>

          <DialogActions
            sx={{
              borderTop: "1px solid #eee",
              padding: "16px 24px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Left side - Template and Upload icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Download Template" placement="top">
                  <IconButton
                    onClick={handleTemplateDownload}
                    size="small"
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
                <Tooltip title="Bulk Upload" placement="top">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    size="small"
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
              </Box>

              {/* Right side - Submit button */}
              <Button
                onClick={handleAddUser}
                color="primary"
                variant="contained"
              >
                Submit
              </Button>
            </Box>
          </DialogActions>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* Are you sure you want to delete the user "{userToDelete}"? */}
            {selected.length > 0
              ? `Are you sure you want to delete the selected users: ${userToDelete}?`
              : `Are you sure you want to delete the user "${userToDelete}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogContent sx={{ pt: 6, pb: 1 }}>
          <Box sx={{ position: "relative", mb: 1, mt: -1 }}>
            <IconButton
              onClick={() => setEditDialogOpen(false)}
              sx={{
                position: "absolute",
                right: -12,
                top: -25,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* First row */}
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField
              size="small"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUserData.username || ""}
              onChange={handleInputChange}
            />
            <TextField
              size="small"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUserData.name || ""}
              onChange={handleInputChange}
            />
          </Box>

          {/* Second row */}
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField
              size="small"
              name="department"
              label="Department"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUserData.department || ""}
              onChange={handleInputChange}
            />
            <TextField
              size="small"
              name="role"
              label="Role"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUserData.role || ""}
              onChange={handleInputChange}
            />
          </Box>

          {/* Third row */}
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            <Tooltip title="Email cannot be edited" placement="top">
              <TextField
                size="small"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={editedUserData.email || ""}
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
            <TextField
              size="small"
              name="phone"
              label="Phone Number"
              type="tel"
              variant="outlined"
              value={editedUserData.phone || ""}
              onChange={handleInputChange}
              sx={{ width: "40%" }}
            />
            <TextField
              size="small"
              name="storageUsed"
              label="Storage Used"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUserData.storageUsed || ""}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1, pt: 0 }}>
          {/* <Button onClick={() => setEditDialogOpen(false)} color="inherit">
      Cancel
    </Button> */}
          <Button
            onClick={saveEditedUser}
            variant="contained"
            color="primary"
            size="small"
            sx={{
              fontSize: "0.875rem",
              py: 0.5, // Reduced vertical padding
              px: 2, // Adjusted horizontal padding
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={selectAllDialogOpen}
        onClose={handleSelectAllDialogClose}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            fontSize: "1.1rem",
            borderBottom: "1px solid #eee",
          }}
        >
          Select Users
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <DialogContentText
            sx={{
              fontSize: "0.9rem",
              color: "text.secondary",
              mb: 1,
            }}
          >
            Do you want to select all users or just the current page?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            pt: 1,
            borderTop: "1px solid #eee",
            gap: 1,
          }}
        >
          <Button
            onClick={handleSelectAllDialogClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSelectAllConfirm(false)}
            variant="outlined"
            size="small"
            sx={{
              px: 2,
              "&:hover": {
                backgroundColor: "primary.50",
              },
            }}
          >
            Current Page ({rowsPerPage})
          </Button>
          <Button
            onClick={() => handleSelectAllConfirm(true)}
            variant="contained"
            size="small"
            sx={{
              px: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
                backgroundColor: "primary.dark",
              },
            }}
          >
            All Users ({rows.length})
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {/* <DialogTitle
          sx={{
            borderBottom: "1px solid #eee",
            pb: 1,
            fontSize: "1.1rem",
          }}
        >
          Migrate Users Storage
        </DialogTitle> */}

        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{ mb: 2, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Total Data to Migrate:{" "}
                {selectedUsersData.reduce((total, user) => {
                  return total + parseInt(user.storageUsed);
                }, 0)}
                GB
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Total Storage to Migrate:{" "}
                {selectedUsersData.reduce((total, user) => {
                  return (
                    total +
                    (migrationOptions[user.id]?.storage
                      ? parseInt(user.storageAllocated)
                      : 0)
                  );
                }, 0)}
                GB
              </Typography>
            </Box>
          </Box>

          {/* List of selected users */}
          {selectedUsersData.map((user, index) => (
            <Box
              key={index}
              sx={{
                mb: 1,
                p: 1,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                backgroundColor: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#1976d2", minWidth: "200px" }}
              >
                {user.name}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                {/* Data checkbox - always checked and disabled */}
                <FormControlLabel
                  control={
                    <Checkbox checked={true} disabled={true} size="small" />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
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
                        {user.storageUsed}GB
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />

                {/* Storage checkbox - optional */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={migrationOptions[user.id]?.storage || false}
                      onChange={(e) => {
                        setMigrationOptions((prev) => ({
                          ...prev,
                          [user.id]: {
                            ...prev[user.id],
                            storage: e.target.checked,
                          },
                        }));
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.813rem", color: "#666", mr: 1 }}
                      >
                        Storage
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#1976d2", fontWeight: 500 }}
                      >
                        {user.storageAllocated}GB
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
            </Box>
          ))}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid #eee",
            p: 1.5,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Target user selection */}
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <Select
              value={targetUser?.name || ""}
              displayEmpty
              onChange={(e) => {
                const selected = rows.find(
                  (user) => user.name === e.target.value
                );
                setTargetUser(selected);
                setMigrationError("");
              }}
              error={Boolean(migrationError)}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" color="text.secondary">
                  Select Target User
                </Typography>
              </MenuItem>

              {rows
                .filter(
                  (row) =>
                    !selectedUsersData.some(
                      (selected) => selected.name === row.name
                    )
                )
                .map((user) => {
                  // Calculate available storage
                  const storageAllocated = parseInt(
                    user.storageUsed.replace("GB", "")
                  );
                  const storageUsed = parseInt(
                    user.manageStorage.replace("GB", "")
                  );
                  const availableStorage = storageAllocated - storageUsed;

                  return (
                    <MenuItem key={user.name} value={user.name}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccountCircleIcon
                          sx={{ color: "#666", fontSize: 20 }}
                        />
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Available Storage: {availableStorage}GB
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  );
                })}
            </Select>
            {migrationError && (
              <FormHelperText error>{migrationError}</FormHelperText>
            )}
          </FormControl>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => setMigrationDialogOpen(false)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleMigrate(targetUser)}
              disabled={!targetUser || Boolean(migrationError)}
            >
              Migrate
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Dashboard;
