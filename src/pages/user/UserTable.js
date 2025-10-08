import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx"; // Add this at the top of the file
import axios from "axios";

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
import { Menu } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { CheckCircle } from "@mui/icons-material";

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
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { PolymorphicTable } from "polymorphic-table";
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
import _, { debounce } from "lodash";
import { render } from "react-dom";

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

const allColumns = [
  { id: "id", label: "User ID" },
  { id: "name", label: "Name" },
  { id: "department", label: "Department" },
  { id: "role", label: "Role" },
  { id: "email", label: "Email" },
  { id: "region", label: "Region" },
  { id: "storageUsed", label: "Storage" },
  { id: "manageStorage", label: "Manage Storage" },
  { id: "activeLicense", label: "Status" },
  { id: "actions", label: "Actions" },
];

export default function UserTable() {
  const [statusFilter, setStatusFilter] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [searchColumn, setSearchColumn] = useState("name");
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const [showRoleChange, setShowRoleChange] = useState(false);

  // const [order, setOrder] = useState("asc");
  const [order, setOrder] = useState({ columnId: null, descending: false });
  const [columnFilters, setColumnFilters] = useState({});
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

  // console.log("selected", selected);
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
  const [regions, setRegions] = useState([]);

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

  const getRegions = async () => {
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/getRegion`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"), // same as your other APIs
          },
        }
      );

      const data = response?.data || {};
      const regionsArray = Array.isArray(data.regions) ? data.regions : [];

      // normalize to array of strings
      const list = regionsArray
        .map((r) => (typeof r === "string" ? r : r?.regionName || ""))
        .filter(Boolean);

      return {
        list, // ✅ cleaned-up region strings for Autocomplete
        defaultRegion: data.defaultRegion || "",
      };
    } catch (error) {
      console.error("Error fetching regions:", error);
      return { list: [], defaultRegion: "" }; // safe fallback
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditData({});
    setSelectedDepartment(null);
  };

  const extractValue = (row, orderBy) => {
    switch (orderBy) {
      case "id":
        return row.id || "";
      case "name":
      case "email":
        return row[orderBy]?.toLowerCase() || "";
      case "department":
        return row.roles?.[0]?.department?.deptName?.toLowerCase() || "";
      case "role":
        return row.roles?.[0]?.roleName?.toLowerCase() || "";
      case "region": // ✅ NEW
        return row.region?.toLowerCase() || "";
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

      let deptObj = null;
      let roleObj = null;

      if (editData.department) {
        deptObj = fullDepartments.find(
          (d) =>
            d.deptName?.toLowerCase() === editData.department?.toLowerCase()
        );

        if (!deptObj) {
          toast.error("Invalid department selected.");
          return;
        }

        if (editData.role) {
          roleObj = deptObj.roles?.find(
            (r) => r.roleName?.toLowerCase() === editData.role?.toLowerCase()
          );

          if (!roleObj) {
            toast.error("Invalid role selected.");
            return;
          }
        }
      }

      const userPayload = {
        userId: editData.id,
        userName: editData.name.trim(),
        phoneNumber: editData.phoneNumber?.trim() || "",
        reportingManager: editData.reportingManager?.trim() || "",
        deptId: deptObj?.id || null,
        roleId: roleObj?.id || null,
        region: editData.region?.trim() || "", // ✅ Added
      };

      console.log("Final userPayload:", userPayload);

      await updateUser(userPayload);

      if (roleObj) {
        setUserRoleMap((prev) => ({
          ...prev,
          [editData.id]: roleObj.id,
        }));
      }

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

  // handle edit
  const handleEdit = async (e, row) => {
    console.log("Editing user:", row);

    try {
      const fullDepartments = await fetchFullDepartments();
      setFullDepartments(fullDepartments);

      const { list, defaultRegion } = await getRegions();
      setRegions(list);

      // Prefill region: current row > default from API > first option > ""
      const prefillRegion = row.region || defaultRegion || list[0] || "";

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
        reportingManager: row.reportingManager || "", // ✅ add this line
        department: deptName,
        role: matchedRole?.roleName || roleName,
        roles: row.roles || [],
        region: prefillRegion,
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

  const regionOptions = React.useMemo(
    () => [...new Set([editData.region, ...regions].filter(Boolean))],
    [regions, editData.region]
  );

  // handle bulk activate
  const handleActivateAll = async () => {
    // 1 Check if anything is selected
    if (!rowsData || rowsData.length === 0) {
      toast.warn("No users selected for activation.");
      return;
    }

    // 2 Build full user objects for backend
    const usersToActivate = rowData
      .filter((user) => selected.includes(user.id)) // only selected users
      .map((user) => ({
        ...user,
        active: true,
        permissions: {
          ...user.permissions,
          allowedStorageInBytesDisplay: "1GB",
        },
      }));

    console.log("Activating users:", usersToActivate);

    try {
      // 3 Call backend
      await toggleUserStatusByUsername(usersToActivate, page);

      // 4️⃣ Refresh data + cleanup
      await refetchUsers();
      setSelected([]);
      setRowData([]);

      toast.success("Selected users have been activated.");
    } catch (error) {
      console.error("Error activating users:", error);
      toast.error("Failed to activate selected users.");
    }
  };

  const options = ["10GB", "20GB"];
  //handle bulk download
  const handleBulkDownload = () => {
    console.log("rowsData", rowsData);

    if (!rowsData || rowsData.length === 0) {
      alert("No data to download");
      return;
    }

    const formatStatus = (row) => {
      if (row.active && !row.enabled) return "Pending";
      if (row.active && row.enabled) return "Active";
      return "Inactive";
    };

    const extractRowData = (row) => ({
      "User ID": row.id || "N/A",
      Name: row.name || "N/A",
      Department: row.roles?.[0]?.department?.deptName || "N/A",
      Role: row.roles?.[0]?.roleName || "N/A",
      "User Email": row.email || "N/A",
      Region: row.region || "N/A",
      "Phone Number": row.phoneNumber || "N/A",
      "Reporting Manager": row.reportingManager?.name || "N/A",
      "Storage Used": row.permissions?.displayStorage || "N/A",
      "Manage Storage": row.permissions?.allowedStorageInBytesDisplay || "N/A",
      "Active License": formatStatus(row),
    });

    const dataToDownload = rowsData.map(extractRowData);
    const headers = Object.keys(dataToDownload[0]);

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload, {
      header: headers,
    });

    worksheet["!cols"] = [
      { wch: 12 },
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

    const fileName =
      rowsData.length === 1
        ? `${rowsData[0].name?.replace(/\s+/g, "_")}-user.xlsx`
        : "selected-users.xlsx";

    XLSX.writeFile(workbook, fileName);

    setSelected([]);
    // setRowsData([]); // if you want to clear it after download

    setSnackbarMessage("User data downloaded successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const label = { inputProps: { "aria-label": "Switch demo" } };

  //handle delete
  const handleDelete = (rowsOrEvent, row) => {
    const key = "id";
    const currentRows = rowsData;
    let rowsToDelete = [];
    console.log("rowsOrEvent:", rowsData);

    // SINGLE ROW delete
    if (row) {
      if (row.email === adminEmail) {
        toast.warning("Admin user cannot be deleted");
        return;
      }
      rowsToDelete = [row];
    }
    // BULK delete from toolbar - rowsOrEvent is array of OBJECTS
    else if (Array.isArray(rowsOrEvent) && rowsOrEvent.length > 0) {
      // Check if it's an array of objects or IDs
      const firstItem = rowsOrEvent[0];

      if (typeof firstItem === "object" && firstItem !== null) {
        // Array of row objects (from PolymorphicTable)
        rowsToDelete = rowsData.filter((r) => r.email !== adminEmail);
        console.log("Bulk delete - row objects:", rowsToDelete);
      } else {
        // Array of IDs (fallback)
        rowsToDelete = currentRows.filter(
          (r) => rowsOrEvent.includes(r[key]) && r.email !== adminEmail
        );
        console.log("Bulk delete - IDs:", rowsToDelete);
      }

      if (!rowsToDelete.length) {
        toast.warning("No valid users selected for deletion.");
        return;
      }
    }
    // fallback to selected state (array of IDs)
    else {
      rowsToDelete = currentRows.filter(
        (r) => selected.includes(r[key]) && r.email !== adminEmail
      );
      console.log("Fallback delete from selected state:", rowsToDelete);

      if (!rowsToDelete.length) {
        toast.warning("No users selected for deletion.");
        return;
      }
    }

    console.log("Final rows to delete:", rowsToDelete);
    setDeleteUser(true);
    setRowData(rowsToDelete);
    setSelected(rowsToDelete.map((r) => r[key]));
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
  // handle status toggle
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
  //handle create user
  const handleCreateUser = () => {
    setCreateUser(true);
  };

  // 1. Fix refetchUsers to accept proper parameters
  const refetchUsers = async () => {
    setLoading(true);
    try {
      const adminEmail = sessionStorage.getItem("adminEmail");

      // Fetch ALL users at once for client-side filtering
      let allUsers = [];
      const firstPage = await fetchUsers(0, 100); // Get large page
      allUsers = firstPage.content || [];

      // Normalize storage
      const normalizedUsers = allUsers.map((user) => {
        const display = user.permissions?.allowedStorageInBytesDisplay;
        if (display) {
          const fixedDisplay = display
            .replace(/\.00\s?([A-Z]+)/, "$1")
            .replace(/\s+/g, "");
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

      // Sort admin first
      const sortedUsers = [...normalizedUsers].sort((a, b) => {
        if (a.email === adminEmail) return -1;
        if (b.email === adminEmail) return 1;
        return 0;
      });

      setRowsData(sortedUsers);
      setTotalCount(sortedUsers.length);
    } catch (error) {
      console.error("Error loading users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Simpler useEffect
  useEffect(() => {
    refetchUsers();
  }, []); // Only fetch once on mount

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
  }, [page, rowsPerPage, debouncedSearchQuery]);

  console.log(">>>rowssss", rowsData);

  const handleClose = () => {
    setMigrationDialog(false);
  };

  const userColumns = [
    {
      id: "user id",
      header: "id",
      accessor: "id",
      sortable: true,
      filterable: true,
      width: "200px",
    },

    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      filterable: true,
      width: "200px",
    },
    {
      id: "department",
      header: "Department",
      accessor: (row) => {
        const selectedRoleId = userRoleMap[row.id];
        const selectedRole = row.roles?.find(
          (role) => role.id === selectedRoleId
        );
        return (
          selectedRole?.department?.deptName ||
          row.roles?.[0]?.department?.deptName ||
          "N/A"
        );
      },
      sortable: true,
      filterable: true,
      width: "200px",
      render: (value, row) => {
        // You can still customize the display here if needed
        return value;
      },
    },

    {
      id: "email",
      header: "Email",
      accessor: "email",
      sortable: true,
      filterable: true,
      width: "250px",
    },
    {
      id: "role",
      header: "Role",
      sortable: true,
      filterable: true,
      width: "180px",

      //  Custom cell rendering
      render: (_, row) => {
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
          ...new Set(rolesInSameDept.map((role) => role.roleName)),
        ];

        return uniqueRoleNames.length > 0 ? uniqueRoleNames.join(", ") : "N/A";
      },
    },
    {
      id: "storageUsed",
      header: "StorageUsed",
      accessor: (row) => row.permissions?.displayStorage || "—",
      sortable: true,
      filterable: true,
      width: "150px",
      align: "center",
    },
    {
      id: "manage storage",
      header: "Manage Storage",
      accessor: (row) => row.permissions?.allowedStorageInBytesDisplay || "",
      width: "150px",
      align: "center",
      render: (_, row) => (
        <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
          <Select
            id={`manage-storage-${row.id}`}
            value={row.permissions?.allowedStorageInBytesDisplay || ""}
            onChange={async (e) => {
              const newDisplayValue = e.target.value;
              const newByteValue = toBytes(newDisplayValue);

              const updated = rowsData.map((r) =>
                r.id === row.id
                  ? {
                      ...r,
                      permissions: {
                        ...r.permissions,
                        allowedStorageInBytesDisplay: newDisplayValue,
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
                          allowedStorageInBytesDisplay: newDisplayValue,
                          allowedStorageInBytes: newByteValue,
                        },
                      }
                    : u
                );

                try {
                  await toggleUserStatusByUsername(updatedRows, page);
                  setRowsData(updatedRows);
                  toast.success(`Storage updated for ${row.name}`);
                } catch (error) {
                  toast.error(`Failed to update storage for ${row.name}`);
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
                "3GB",
                "5GB",
                "10GB",
                "20GB",
                "40GB",
                "60GB",
              ];
              const currentValue =
                row.permissions?.allowedStorageInBytesDisplay;
              const allOptions = predefinedOptions.includes(currentValue)
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
      ),
    },

    {
      id: "region",
      header: "region",
      accessor: "region",
      sortable: true,
      filterable: true,
      width: "150px",
      align: "center",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => {
        if (row.active && !row.enabled) return "Pending";
        if (row.active && row.enabled) return "Active";
        return "Inactive";
      },
      sortable: true,
      // filterable: true,
      width: "150px",
      render: (_, row) => (
        <Tooltip
          title={
            row.active && !row.enabled
              ? "Pending (Email Not Verified)"
              : !row.active
              ? "Inactive (Provide Storage)"
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
                      (!row.permissions?.allowedStorageInBytesDisplay ||
                        row.permissions?.allowedStorageInBytesDisplay ===
                          "0 KB"))
                  }
                />
              }
            />
          </span>
        </Tooltip>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      accessor: "actions",
      isActionColumn: true,
      width: "200px",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "8px" }}>
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
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(null, row)}
                  disabled={row.email === adminEmail}
                >
                  <Delete />
                </IconButton>
              </span>
            </Tooltip>
          </>
        </div>
      ),
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "whitesmoke",
        padding: "15px",
      }}
    >
      <Box
        elevation={24}
        sx={{
          overflow: "hidden",
          padding: "10px",
          borderRadius: "20px",
          animation: "slideInFromLeft 0.3s ease-in-out forwards",
          opacity: 0, // Start with opacity 0
          transform: "translateX(-50px)", // Start from left
          "@keyframes slideInFromLeft": {
            "0%": { opacity: 0, transform: "translateX(-50px)" },
            "100%": { opacity: 1, transform: "translateX(0)" },
          },
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <PolymorphicTable
            data={rowsData}
            columns={userColumns}
            serverSide={false}
            rowKey="id"
            showColumnToggles
            showFilters
            showPagination
            selectable
            stickyHeader
            tableHeight="85vh"
            tableWidth="93vw"
            //  Pagination props
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            selectedRowKeys={selected}
            onRowSelect={(selectedRows) => setSelected(selectedRows)}
            //  Keep existing toolbar
            renderToolbarIcons={(selected) =>
              selected.length > 0 && (
                <>
                  <Tooltip title="Delete Selected">
                    <IconButton onClick={() => handleDelete(selected)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Activate Selected">
                    <IconButton onClick={() => handleActivateAll(selected)}>
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Selected">
                    <IconButton onClick={() => handleBulkDownload()}>
                      <FileDownload />
                    </IconButton>
                  </Tooltip>
                </>
              )
            }
            showDefaultToolbarIcons={false}
            renderTableFooterRight={() => (
              <Tooltip title="Add New User">
                <IconButton
                  sx={{
                    bgcolor: "orange",
                    color: "white",
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                    "&:hover": {
                      backgroundColor: "orange",
                      animation: "glowBorder 1.5s ease-in-out infinite",
                    },
                  }}
                  onClick={handleCreateUser}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            )}
          />
        </div>
      </Box>
      {/* all dialog box here  */}
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
          open={createUser} //  Add this line
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

      <Dialog open={deleteUser} onClose={() => setDeleteUser(false)}>
        <DeleteUser
          handleClose={() => {
            setDeleteUser(false);
            setSelected([]); //  Clear selected IDs
            setRowData([]); //  Clear selected row data
            refetchUsers(); //  Then refresh the table
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

                  //  Exclude admin user
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
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
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
              display: "flex",
              alignItems: "center",
              fontFamily: '"Be Vietnam", sans-serif',
              color: "#fff",
            }}
          >
            Edit User
          </Typography>

          <IconButton
            onClick={handleCloseDialog} // make sure handleClose closes the dialog
            size="small"
            sx={{
              color: "#fff",
              width: 32,
              height: 32,
              border: "1px solid",
              borderColor: "#fff",
              bgcolor: "error.lighter",
              borderRadius: "50%",
              position: "relative",
              "&:hover": {
                transform: "rotate(180deg)",
              },
              transition: "transform 0.3s ease",
            }}
          >
            <Close
              sx={{
                fontSize: "1rem",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
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
                options={fullDepartments} //  from state
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
                onChange={(e) => {
                  const input = e.target.value;

                  //  Allow only digits
                  if (!/^\d*$/.test(input)) return;

                  //  Restrict to max 10 digits
                  if (input.length > 10) return;

                  setEditData((prev) => ({
                    ...prev,
                    phoneNumber: input,
                  }));
                }}
                error={Boolean(
                  editData.phoneNumber && editData.phoneNumber.length !== 10
                )}
                helperText={
                  editData.phoneNumber && editData.phoneNumber.length !== 10
                    ? "Phone number must be exactly 10 digits"
                    : ""
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                size="small"
                label="Reporting Manager"
                fullWidth
                value={editData.reportingManager || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    reportingManager: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid item xs={6}>
              <Autocomplete
                size="small"
                options={regionOptions} // array of strings
                value={editData.region || null} // current value
                onChange={(e, value) =>
                  setEditData((prev) => ({ ...prev, region: value || "" }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Region" fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSaveChanges}
            color="secondary"
            variant="contained"
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* select all logic here  */}

      {/* snack bar here  */}
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
    </Box>
  );
}
