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
import SearchIcon from "@mui/icons-material/Search";

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
import { TableSortLabel } from "@mui/material";
import { searchUsers } from "../../api/userService";
import { debounce } from "lodash";

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
  const [searchColumn, setSearchColumn] = useState("name");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const [showRoleChange, setShowRoleChange] = useState(false);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(""); // column field

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
  const [userRoleMap, setUserRoleMap] = useState({});
  const [fullDepartments, setFullDepartments] = useState([]);

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

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditData({});
    setSelectedDepartment(null);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getComparator = (order, orderBy) => {
    return (a, b) => {
      if (a.email === adminEmail) return -1;
      if (b.email === adminEmail) return 1;

      const valA = extractValue(a, orderBy);
      const valB = extractValue(b, orderBy);

      if (order === "desc") {
        if (valB < valA) return -1;
        if (valB > valA) return 1;
      } else {
        if (valA < valB) return -1;
        if (valA > valB) return 1;
      }
      return 0;
    };
  };

  const descendingComparator = (a, b, orderBy) => {
    const valA = extractValue(a, orderBy);
    const valB = extractValue(b, orderBy);

    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
  };

  const extractValue = (row, orderBy) => {
    switch (orderBy) {
      case "name":
      case "email":
        return row[orderBy]?.toLowerCase() || "";
      case "department":
        return row.roles?.[0]?.department?.deptName?.toLowerCase() || "";
      case "role":
        return row.roles?.[0]?.roleName?.toLowerCase() || "";
      case "storageUsed":
        return toBytes(row.permissions?.displayStorage);
      default:
        return "";
    }
  };

  const fetchFullDepartments = async () => {
    try {
      const res = await getDepartments();
      console.log("rrrrrr", res);
      return res.content || [];
    } catch (error) {
      console.error("Failed to fetch full departments:", error);
      return [];
    }
  };

  const handleSaveChanges = async () => {
    console.log("editData:", editData);

    try {
      const fullDepartments = await fetchFullDepartments();

      const deptObj = fullDepartments.find(
        (d) => d.deptName?.toLowerCase() === editData.department?.toLowerCase()
      );

      if (!deptObj) {
        toast.error("Invalid department selected.");
        return;
      }

      const roleObj = deptObj.roles?.find(
        (r) => r.roleName?.toLowerCase() === editData.role?.toLowerCase()
      );

      if (!roleObj) {
        toast.error("Invalid role selected.");
        return;
      }

      const userPayload = {
        userId: editData.id,
        userName: editData.name.trim(),
        phoneNumber: editData.phoneNumber.trim(),
        deptId: deptObj.id,
        roleId: roleObj.id,
      };

      console.log("Final userPayload:", userPayload);

      await updateUser(userPayload);

      setUserRoleMap((prev) => ({
        ...prev,
        [editData.id]: roleObj.id,
      }));

      toast.success("User updated successfully!");
      setEditDialogOpen(false);
      refetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
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

  const handleEdit = async (e, row) => {
    console.log("Editing user:", row);

    try {
      const fullDepartments = await fetchFullDepartments();
      setFullDepartments(fullDepartments);

      const savedRoleId = userRoleMap[row.id];
      const currentRole =
        row.roles?.find((r) => r.id === savedRoleId) || row.roles?.[0];

      const deptName = currentRole?.department?.deptName || "";
      const roleName = currentRole?.roleName || "";

      const deptObj = fullDepartments.find(
        (d) => d.deptName?.toLowerCase() === deptName?.toLowerCase()
      );

      const matchedRole = deptObj?.roles?.find(
        (r) => r.roleName?.toLowerCase() === roleName?.toLowerCase()
      );

      const newEditData = {
        id: row.id,
        name: row.name || "",
        email: row.email || "",
        phoneNumber: row.phoneNumber || "",
        department: deptName,
        role: matchedRole?.roleName || roleName,
        roles: row.roles || [],
      };

      setEditData(newEditData);
      setSelectedDepartment(deptObj || null);
      setEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to load departments", error);
      toast.error("Unable to fetch departments. Please try again.");
    }
  };

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
    console.log("rowData", rowData);
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
      "Phone Number": row.phoneNumber || "N/A",
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
    // XLSX.writeFile(workbook, "selected-users.xlsx");
    const fileName =
      rowData.length === 1
        ? `${rowData[0].name?.replace(/\s+/g, "_")}-user.xlsx`
        : "selected-users.xlsx";

    XLSX.writeFile(workbook, fileName);

    setSelected([]);
    setRowData([]);

    // ✅ Show success message
    setSnackbarMessage("User data downloaded successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const handleDelete = (e, row) => {
    if (row) {
      setDeleteUser(true);
      setRowData([row]);
      setSelected([row.id]);
    } else {
      if (selected.length === 0) {
        toast.warning("No users selected for deletion.");
        return;
      }

      const selectedFullRows = rowsData.filter((r) => selected.includes(r.id));
      setDeleteUser(true);
      setRowData(selectedFullRows); // send all selected users
    }
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
      const allIds = rowsData
        .filter((row) => row.email !== adminEmail) // exclude current admin
        .map((row) => row.id);

      setSelected(allIds);

      const selectedFullRows = rowsData.filter((r) => allIds.includes(r.id));
      setRowData(selectedFullRows);

      setSelectAllData(true);
    } else {
      setSelected([]);

      const selectedFullRows = rowsData.filter((r) => selected.includes(r.id));
      setRowData(selectedFullRows);

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

    const selectedFullRows = rowsData.filter((r) => newSelected.includes(r.id));
    setRowData(selectedFullRows);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const refetchUsers = async () => {
    setLoading(true);
    try {
      const adminEmail = sessionStorage.getItem("adminEmail");

      // ✅ Decide API based on search
      let users;
      if (debouncedSearchQuery.trim()) {
        users = await searchUsers(
          page,
          rowsPerPage,
          searchColumn,
          debouncedSearchQuery.trim()
        );
      } else {
        // users = await fetchUsers(page);
        users = await fetchUsers(page, rowsPerPage);
      }
      // ✅ Normalize storage format like "1.00 GB" → "1GB"
      const normalizedUsers = (users.content || []).map((user) => {
        const display = user.permissions?.allowedStorageInBytesDisplay;
        if (display) {
          const fixedDisplay = display
            .replace(/\.00\s?([A-Z]+)/, "$1") // remove ".00" before GB/MB/etc.
            .replace(/\s+/g, ""); // remove spaces
          return {
            ...user,
            permissions: {
              ...user.permissions,
              allowedStorageInBytesDisplay: fixedDisplay,
            },
          };
        }
        return user;
      });

      // ✅ Put admin email first
      const sortedUsers = [...normalizedUsers].sort((a, b) => {
        if (a.email === adminEmail) return -1;
        if (b.email === adminEmail) return 1;
        return 0;
      });

      setRowsData(sortedUsers);
      setTotalCount(users.totalElements || 0);
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
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // wait 500ms after user stops typing

    return () => {
      clearTimeout(handler); // cleanup if user keeps typing
    };
  }, [searchQuery]);
  useEffect(() => {
    refetchUsers();
  }, [page, rowsPerPage, searchColumn, debouncedSearchQuery]);

  console.log(">>>rowssss", rowsData);

  const handleClose = () => {
    setMigrationDialog(false);
  };

  const filteredRows = rowsData.filter((row) => {
    const query = searchQuery.toLowerCase();

    if (searchColumn === "name") {
      return row.name?.toLowerCase().includes(query);
    }

    if (searchColumn === "email") {
      return row.email?.toLowerCase().includes(query);
    }

    if (searchColumn === "department") {
      const selectedRoleId = userRoleMap[row.id];
      const selectedRole = row.roles?.find(
        (role) => role.id === selectedRoleId
      );
      const department =
        selectedRole?.department?.deptName ||
        row.roles?.[0]?.department?.deptName ||
        "";
      return department?.toLowerCase().includes(query);
    }

    if (searchColumn === "role") {
      const selectedRoleId = userRoleMap[row.id];
      const selectedRole = row.roles?.find(
        (role) => role.id === selectedRoleId
      );
      const deptId = selectedRole?.department?.id;
      const rolesInSameDept = row.roles.filter(
        (role) => role.department?.id === deptId
      );
      const roleNames = rolesInSameDept.map((role) => role.roleName).join(", ");
      return roleNames.toLowerCase().includes(query);
    }

    return true;
  });

  const sortedRows = [...filteredRows].sort(getComparator(order, orderBy));

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
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ px: 2, mb: 2, py: 1 }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                height: 30,
                "& .MuiInputBase-root": {
                  height: 30,
                  fontSize: "0.8rem",
                },
              }}
            >
              <InputLabel>Filter By</InputLabel>
              <Select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                label="Filter By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="department">Department</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 250,
                height: 30,
                "& .MuiInputBase-root": {
                  height: 30,
                  fontSize: "0.8rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              color="error"
              onClick={() => setSearchQuery("")}
              disabled={!searchQuery.trim()} // ✅ disable if input is empty or just spaces
              sx={{
                height: 30,
                padding: "0 12px",
                fontSize: "0.75rem",
                minWidth: 80,
                whiteSpace: "nowrap",
              }}
            >
              ✖ CLEAR
            </Button>
          </Box>

          <Table stickyHeader>
            <TableHead className={styles.tableHeader}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === rowsData.length}
                    indeterminate={
                      selected.length > 0 && selected.length < rowsData.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>

                <TableCell
                  align="center"
                  sortDirection={orderBy === "name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  align="center"
                  sortDirection={orderBy === "department" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "department"}
                    direction={orderBy === "department" ? order : "asc"}
                    onClick={() => handleRequestSort("department")}
                  >
                    Department
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  align="center"
                  sortDirection={orderBy === "role" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "role"}
                    direction={orderBy === "role" ? order : "asc"}
                    onClick={() => handleRequestSort("role")}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  align="center"
                  sortDirection={orderBy === "email" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={() => handleRequestSort("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  align="center"
                  sortDirection={orderBy === "name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "storageUsed"}
                    direction={orderBy === "storageUsed" ? order : "asc"}
                    onClick={() => handleRequestSort("storageUsed")}
                  >
                    Storage Used
                  </TableSortLabel>
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
              {sortedRows.map((row, index) => {
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
                        disabled={row.email === adminEmail} // ✅ Disable admin's checkbox
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
                      {(() => {
                        const selectedRoleId = userRoleMap[row.id];
                        const selectedRole = row.roles?.find(
                          (role) => role.id === selectedRoleId
                        );
                        const deptName =
                          selectedRole?.department?.deptName ||
                          row.roles?.[0]?.department?.deptName;
                        return deptName || "N/A";
                      })()}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ padding: "10px 10px 10px 10px !important" }}
                    >
                      {(() => {
                        const selectedRoleId = userRoleMap[row.id];
                        const selectedRole = row.roles?.find(
                          (role) => role.id === selectedRoleId
                        );
                        const deptId = selectedRole?.department?.id;

                        if (!deptId) return row.roles?.[0]?.roleName || "N/A";

                        const rolesInSameDept = row.roles.filter(
                          (role) => role.department?.id === deptId
                        );
                        const uniqueRoleNames = [
                          ...new Set(
                            rolesInSameDept.map((role) => role.roleName)
                          ),
                        ];

                        return uniqueRoleNames.length > 0
                          ? uniqueRoleNames.join(", ")
                          : "N/A";
                      })()}
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
                        <Tooltip
                          title={
                            row.email === adminEmail
                              ? "Admin user cannot be edited"
                              : "Edit User"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => handleEdit(e, row)}
                              disabled={row.email === adminEmail}
                            >
                              <Edit />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            row.email === adminEmail
                              ? "Admin user cannot be deleted"
                              : "Delete User"
                          }
                        >
                          <span>
                            <Tooltip
                              title={
                                row.email === adminEmail
                                  ? "Admin user cannot be deleted"
                                  : "Delete User"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => handleDelete(e, row)}
                                  disabled={row.email === adminEmail}
                                >
                                  <Delete />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </span>
                        </Tooltip>
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
            // rowsPerPageOptions={[10]}
            rowsPerPageOptions={[10, 20, 30, 50, 100]}
            component="div"
            count={totalCount}
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

        <Dialog open={deleteUser} onClose={() => setDeleteUser(false)}>
          <DeleteUser
            handleClose={() => {
              setDeleteUser(false);
              setSelected([]); // ✅ Clear selected IDs
              setRowData([]); // ✅ Clear selected row data
              refetchUsers(); // ✅ Then refresh the table
            }}
            rowId={selected}
          />
        </Dialog>

        <Dialog
          open={selectAllData}
          onClose={() => setSelectAllData(false)}
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "13px", padding: "3px 7px" }}>
            Select Users
          </DialogTitle>

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
                  const filteredPageRows = rowsData.filter(
                    (n) => n.email !== adminEmail
                  );
                  const currentPageIds = filteredPageRows.map((n) => n.id);

                  setSelected(currentPageIds); // Select only non-admin users
                  setRowData(filteredPageRows); // Store current page data without admin
                  setSelectAllData(false); // Mark selectAllData as false
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

                    // ✅ Exclude admin user
                    const nonAdminUsers = allUsers.filter(
                      (u) => u.email !== adminEmail
                    );

                    const allIds = nonAdminUsers.map((u) => u.id);
                    setSelected(allIds);
                    setRowData(nonAdminUsers); // Store only non-admin users
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

        <Dialog open={migrationDialog} onClose={handleClose} fullWidth>
          <Migration
            handleClos={handleClose}
            rowData={rowData}
            rows={rowsData}
            onMigrationComplete={handleMigrationComplete}
          />
        </Dialog>

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
          <CreateUser
            open={createUser} // 👈 Add this line
            handleClose={() => setCreateUser(false)}
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
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              backgroundColor: (theme) => theme.palette.primary.main,
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Edit User
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Full Name"
                  fullWidth
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="Email cannot be edited">
                  <span>
                    <TextField
                      size="small"
                      label="Email"
                      fullWidth
                      value={editData.email || ""}
                      disabled
                      sx={{ pointerEvents: "none" }} // ensures tooltip still shows
                    />
                  </span>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                {console.log("Selected Department Roles:", selectedDepartment)}

                <Autocomplete
                  size="small"
                  options={fullDepartments} // ✅ from state
                  getOptionLabel={(option) => option.deptName}
                  value={
                    fullDepartments.find(
                      (d) => d.deptName === editData.department
                    ) || null
                  }
                  onChange={(e, value) => {
                    setEditData((prev) => ({
                      ...prev,
                      department: value?.deptName || "",
                      role: "",
                    }));
                    setSelectedDepartment(value || null); // updates role dropdown
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Department" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {console.log(
                  "Roles in selectedDepartment:",
                  selectedDepartment?.roles
                )}

                <Autocomplete
                  size="small"
                  options={selectedDepartment?.roles || []}
                  getOptionLabel={(option) => option.roleName || ""}
                  value={
                    selectedDepartment?.roles?.find(
                      (r) => r.roleName === editData.role
                    ) || null
                  }
                  onChange={(e, value) => {
                    setEditData((prev) => ({
                      ...prev,
                      role: value?.roleName || "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        selectedDepartment?.roles?.length > 0
                          ? "Role"
                          : "No roles available"
                      }
                      fullWidth
                      disabled={selectedDepartment?.roles?.length === 0}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  size="small"
                  label="Phone Number"
                  fullWidth
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
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} color="secondary">
              Save
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
