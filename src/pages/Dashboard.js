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
  Divider,
} from "@mui/material";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox"; // Add this import
import WifiProtectedSetupIcon from "@mui/icons-material/WifiProtectedSetup";

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
// First add this import at the top of your file if not already present
import { keyframes } from "@emotion/react";

import emailjs from "@emailjs/browser";
import { v4 as uuidv4 } from "uuid";
import UserTable from "./user/UserTable";
// import { Grid } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
// Add these imports at the top
import { debounce } from "lodash";
import { useMemo } from "react";
import { memo, useCallback } from "react";

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

const MemoizedTextField = memo(
  ({ label, name, value, onChange, error, helperText, ...props }) => (
    <TextField
      size="small"
      label={label}
      name={name}
      value={value || ""}
      onChange={onChange}
      error={error}
      helperText={helperText}
      inputProps={{
        autoComplete: "off",
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value && prevProps.error === nextProps.error
    );
  }
);

const MemoizedDepartmentField = memo(
  ({
    label,
    value,
    onChange,
    error,
    helperText,
    required = false,
    ...props
  }) => (
    <TextField
      size="small"
      label={label}
      value={value || ""}
      onChange={onChange}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth
      inputProps={{
        autoComplete: "off",
      }}
      {...props}
    />
  )
);

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

  const debouncedInputChange = useMemo(
    () =>
      debounce((name, value) => {
        setNewUserData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }, 100),
    []
  );

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

  const validateForm = useCallback((data) => {
    const errors = {};
    const validate = (field, value, message) => {
      if (!value?.trim()) {
        errors[field] = message;
      }
    };

    validate("name", data.name, "Name is required");
    validate("email", data.email, "Email is required");
    validate("username", data.username, "Username is required");

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format";
    }

    return errors;
  }, []);

  const handleAddUser = useCallback(async () => {
    if (formErrors.username || formErrors.email || formErrors.phone) return;

    // Pre-validate before proceeding
    const errors = validateForm(newUserData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Check duplicates using Set for better performance
    const existingUsernames = new Set(
      rows.map((user) => user.username?.toLowerCase())
    );
    const existingEmails = new Set(
      rows.map((user) => user.email?.toLowerCase())
    );

    if (existingUsernames.has(newUserData.username?.toLowerCase())) {
      setSnackbarMessage("Username already exists");
      setSnackbarOpen(true);
      return;
    }

    if (existingEmails.has(newUserData.email?.toLowerCase())) {
      setSnackbarMessage("Email already exists");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Create user object before async operations
      const newUser = {
        ...newUserData,
        department: newUserData.department || "",
        role: newUserData.role || "",
        status: "pending",
        manageStorage: "1GB",
      };

      // Update UI immediately
      setRows((prev) => [...prev, newUser]);
      setOpenAddUserDialog(false);
      setChangesMade(true);

      // Generate invite link and send email in parallel
      const inviteLink = generateInviteLink(newUserData.email);
      const emailPromise = sendInviteEmail(newUserData.email, inviteLink);

      // Handle async operations
      const emailSent = await emailPromise;
      if (!emailSent) {
        setSnackbarMessage("Email sending failed, but user was created");
        setSnackbarOpen(true);
        return;
      }

      // Update localStorage after successful operations
      localStorage.setItem("dashboardRows", JSON.stringify([...rows, newUser]));

      // Clear form
      setNewUserData({});
      setFormErrors({});
      showSnackbar("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbarMessage("Error adding user. Please try again.");
      setSnackbarOpen(true);
    }
  }, [newUserData, rows, formErrors, validateForm]);

  const AddUserButton = memo(({ onClick, disabled }) => (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      sx={{
        "&:active": {
          transform: "translateY(1px)",
        },
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          transition: "background-color 0.2s",
        },
        "&:active::after": {
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      }}
    >
      Add User
    </Button>
  ));

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedInputChange.cancel();
    };
  }, [debouncedInputChange]);

  // Open Add User Dialog
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false); // State for Add User dialog

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

  const handleInputChange = useCallback(
    (name) => (event) => {
      const { value } = event.target;

      requestAnimationFrame(() => {
        setNewUserData((prev) => ({
          ...prev,
          [name]: value,
        }));

        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      });
    },
    []
  );

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
      }}
    >
      <Box
        sx={{
          flexGrow: 1,marginLeft:'50px'
        }}
      >
        <Box
          sx={{
            // p: "10px",
            // marginLeft: "48px",
            overflow: "hidden",
            height: "calc(100vh - 48px)",
          }}
        >
          <Paper elevation={24}>
            <UserTable
            handleSaveChanges={handleSaveChanges}
            handleMigrationClick={handleMigrationClick}
            deactivateAll={deactivateAll}
            changesMade={changesMade}
            activateAll={activateAll}
            handleDeleteAll={handleDeleteAll}
            handleDelete={handleDelete}
              handleBulkDownload={handleBulkDownload}
              OpenUserDialog={() => setOpenAddUserDialog(true)}
            />
          </Paper>
        </Box>
      </Box>
      {/* create user */}
      <Dialog
        open={openAddUserDialog}
        onClose={() => setOpenAddUserDialog(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
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
            Add New User
          </Typography>

          <IconButton
            onClick={() => setOpenAddUserDialog(false)}
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

        <DialogContent sx={{ p: 2 }}>
          {/* Basic Information Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "black",
                fontFamily: '"Be Vietnam", sans-serif',
                fontWeight: "bold",
              }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MemoizedTextField
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={newUserData.username}
                  onChange={handleInputChange("username")}
                  error={Boolean(formErrors.username)}
                  helperText={formErrors.username}
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
              </Grid>
              <Grid item xs={6}>
                <MemoizedTextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={newUserData.name}
                  onChange={handleInputChange("name")}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
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
              </Grid>
            </Grid>
          </Box>

          {/* Department and Role Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "black",
                fontFamily: '"Be Vietnam", sans-serif',
                fontWeight: "bold",
              }}
            >
              Department & Role
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl
                  fullWidth
                  size="small"
                  error={Boolean(formErrors.department)}
                >
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
                        label="Department"
                        // required
                        error={Boolean(formErrors.department)}
                        helperText={formErrors.department}
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "40px", // Match height with other fields
                          },
                          "& .MuiOutlinedInput-root": {
                            padding: "0px 9px", // Adjust padding to match other fields
                          },
                        }}
                      />
                    )}
                    noOptionsText={
                      <Box sx={{ textAlign: "center", py: 1 }}>
                        <Typography
                          color="text.secondary"
                          sx={{ mb: 1, fontFamily: '"Be Vietnam", sans-serif' }}
                        >
                          No departments found
                        </Typography>
                        <Button
                          onClick={() => setShowAddDepartment(true)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<AddIcon />}
                          sx={{
                            fontFamily: '"Be Vietnam", sans-serif',
                          }}
                        >
                          Add New Department
                        </Button>
                      </Box>
                    }
                    ListboxProps={{
                      style: { maxHeight: 250 },
                    }}
                    size="small"
                    sx={{
                      "& .MuiAutocomplete-input": {
                        padding: "4.5px 4px !important", // Adjust input padding
                      },
                    }}
                    ListboxComponent={({ children, ...props }) => (
                      <ul {...props}>
                        {children}
                        <li
                          style={{
                            padding: "8px",
                            borderTop: "1px solid #eee",
                          }}
                        >
                          <Button
                            onClick={() => setShowAddDepartment(true)}
                            color="primary"
                            variant="outlined"
                            size="small"
                            fullWidth
                            startIcon={<AddIcon />}
                            sx={{
                              fontFamily: '"Be Vietnam", sans-serif',
                            }}
                          >
                            Add New Department
                          </Button>
                        </li>
                      </ul>
                    )}
                  />
                </FormControl>
              </Grid>
              {/* Add Department Dialog */}
              <Dialog
                open={showAddDepartment}
                onClose={() => setShowAddDepartment(false)}
                maxWidth="sm"
                fullWidth
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
                    Add New Department
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

                <DialogContent sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MemoizedDepartmentField
                        label="Department Name"
                        value={newDepartment.name}
                        onChange={(e) => {
                          setNewDepartment((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
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
                    </Grid>
                    <Grid item xs={6}>
                      <MemoizedDepartmentField
                        label="Display Name"
                        value={newDepartment.displayName}
                        onChange={(e) => {
                          setNewDepartment((prev) => ({
                            ...prev,
                            displayName: e.target.value.toUpperCase(),
                          }));
                        }}
                        required
                        error={
                          !newDepartment.displayName && newDepartment.submitted
                        }
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
                    </Grid>
                    <Grid item xs={12}>
                      <MemoizedDepartmentField
                        label="Reporting Manager"
                        value={newDepartment.reportingManager}
                        onChange={(e) => {
                          setNewDepartment((prev) => ({
                            ...prev,
                            reportingManager: e.target.value,
                          }));
                        }}
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
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel required>Storage Allocation</InputLabel>
                        <Select
                          value={newDepartment.storage || ""}
                          sx={{
                            fontFamily: '"Be Vietnam", sans-serif',
                            "& .MuiSelect-select": {
                              fontFamily: '"Be Vietnam", sans-serif',
                            },
                          }}
                          label="Storage Allocation *"
                          onChange={(e) =>
                            setNewDepartment((prev) => ({
                              ...prev,
                              storage: e.target.value,
                            }))
                          }
                          error={
                            !newDepartment.storage && newDepartment.submitted
                          }
                        >
                          {[25, 50, 75, 100, 150, 200].map((size) => (
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
                    </Grid>
                    <Grid item xs={6}>
                      <MemoizedDepartmentField
                        label="Initial Role"
                        value={newDepartment.initialRole}
                        onChange={(e) => {
                          setNewDepartment((prev) => ({
                            ...prev,
                            initialRole: e.target.value,
                          }));
                        }}
                        required
                        error={
                          !newDepartment.initialRole && newDepartment.submitted
                        }
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
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions
                  sx={{ p: 2, pt: 1, borderTop: "1px solid #eee" }}
                >
                  <Button
                    variant="contained"
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

                      // Update both state and localStorage
                      const updatedDepartments = [
                        ...departments,
                        newDeptWithRole,
                      ];
                      setDepartments(updatedDepartments);
                      localStorage.setItem(
                        "departments",
                        JSON.stringify(updatedDepartments)
                      );

                      setShowAddDepartment(false);
                      setNewDepartment({
                        name: "",
                        displayName: "",
                        initialRole: "",
                        storage: "",
                        reportingManager: "",
                        submitted: false,
                      });

                      setSnackbarMessage(
                        `Department "${newDepartment.name}" added successfully with role "${newDepartment.initialRole}"!`
                      );
                      setSnackbarOpen(true);
                    }}
                  >
                    Add Department
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog
                open={showAddRole}
                onClose={() => setShowAddRole(false)}
                maxWidth="sm"
                PaperProps={{
                  sx: {
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
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
                    Add New Role
                  </Typography>
                  <IconButton
                    onClick={() => setShowAddRole(false)}
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

                <DialogContent sx={{ p: 2 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    label="Role Name"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    sx={{ mt: 1 }}
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
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
                  <Button
                    onClick={handleAddRole}
                    variant="contained"
                    sx={{
                      bgcolor: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      fontFamily: '"Be Vietnam", sans-serif',
                    }}
                  >
                    Add Role
                  </Button>
                </DialogActions>
              </Dialog>

              <Grid item xs={4}>
                <FormControl
                  fullWidth
                  size="small"
                  error={Boolean(formErrors.role)}
                >
                  {/* <InputLabel >Role</InputLabel> */}
                  <InputLabel sx={{ fontFamily: '"Be Vietnam", sans-serif' }}>
                    Role
                  </InputLabel>
                  <Select
                    value={newUserData.role || ""}
                    label="Role *"
                    onChange={(e) => {
                      if (e.target.value === "add_new_role") {
                        setShowAddRole(true);
                      } else {
                        setNewUserData({
                          ...newUserData,
                          role: e.target.value,
                        });
                        setFormErrors({ ...formErrors, role: "" });
                      }
                    }}
                    disabled={!newUserData.department}
                    sx={{
                      fontFamily: '"Be Vietnam", sans-serif',
                      "& .MuiSelect-select": {
                        fontFamily: '"Be Vietnam", sans-serif',
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                    >
                      Select Role
                    </MenuItem>
                    {departments
                      .find((dept) => dept.name === newUserData.department)
                      ?.roles.map((role) => (
                        <MenuItem
                          key={role}
                          value={role}
                          sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                        >
                          {role}
                        </MenuItem>
                      ))}
                    <Divider />
                    <MenuItem
                      value="add_new_role"
                      sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AddIcon fontSize="small" />
                        <Typography
                          sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                        >
                          Add New Role
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                  {formErrors.role && (
                    <FormHelperText
                      sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                    >
                      {formErrors.role}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl
                  fullWidth
                  size="small"
                  error={Boolean(formErrors.reportingManager)}
                >
                  {/* <InputLabel>Reporting Manager</InputLabel> */}
                  <InputLabel sx={{ fontFamily: '"Be Vietnam", sans-serif' }}>
                    Reporting Manager
                  </InputLabel>
                  <Select
                    value={newUserData.reportingManager || ""}
                    label="Reporting Manager *"
                    onChange={(e) => {
                      setNewUserData({
                        ...newUserData,
                        reportingManager: e.target.value,
                      });
                      setFormErrors({ ...formErrors, reportingManager: "" });
                    }}
                    disabled={!newUserData.department}
                    sx={{
                      fontFamily: '"Be Vietnam", sans-serif',
                      "& .MuiSelect-select": {
                        fontFamily: '"Be Vietnam", sans-serif',
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                    >
                      Select Manager
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
                          sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
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
                    <FormHelperText
                      sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                    >
                      {formErrors.reportingManager}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Contact Information Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "black",
                fontFamily: '"Be Vietnam", sans-serif',
                fontWeight: "bold",
              }}
            >
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MemoizedTextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleInputChange("email")}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
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
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Storage"
                  name="storageUsed"
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
                  helperText={formErrors.storageUsed}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">GB</InputAdornment>
                    ),
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
              </Grid>
              <Grid item xs={3}>
                <MemoizedTextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={newUserData.phone}
                  onChange={handleInputChange("phone")}
                  error={Boolean(formErrors.phone)}
                  helperText={formErrors.phone}
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
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Download Template" placement="top">
                <IconButton
                  size="small"
                  onClick={handleTemplateDownload}
                  sx={{
                    backgroundColor: "primary.lighter",
                    border: "1px solid",
                    borderColor: "primary.light",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.100",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                    },
                    transition: "all 0.2s ease",
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DownloadIcon sx={{ fontSize: 20 }} />
                  </Box>
                </IconButton>
              </Tooltip>

              <Tooltip title="Bulk Upload" placement="top">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    backgroundColor: "success.lighter",
                    border: "1px solid",
                    borderColor: "success.light",
                    color: "success.main",
                    "&:hover": {
                      backgroundColor: "success.100",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
                    },
                    transition: "all 0.2s ease",
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <UploadFileIcon sx={{ fontSize: 20 }} />
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <AddUserButton
                onClick={handleAddUser}
                disabled={Boolean(
                  formErrors.username || formErrors.email || formErrors.phone
                )}
              />
            </Box>
          </Box>
        </DialogActions>
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
