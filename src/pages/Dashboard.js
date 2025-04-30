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
    
    </Box>
  );
};

export default Dashboard;
