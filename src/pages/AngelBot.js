import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Dashboard,
  Group,
  Warning,
} from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import axios from "axios";

import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  TablePagination,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { TextField } from "@mui/material";

import React, { useEffect, useState } from "react";
import { CircularProgress, keyframes, styled } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { NotificationImportant } from "@mui/icons-material";
import { WarningAmber } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Fade } from "@mui/material";
import { useTheme } from "@mui/material";
import { License } from "@mui/icons-material"; // Optional icon
import { VerifiedUser } from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material"; // already likely imported
import { fetchUsers } from "../api/userService";
import {
  getDepartments,
  getDashboardStats,
  getUserStorage,
  getDeptStorage,
} from "../api/departmentService";

import Loading from "../components/Loading";
import CreateUser from "./user/CreateUser";
import Slide from "@mui/material/Slide";

import {
  ArrowDropUp,
  ArrowDropDown,
  SortByAlpha,
  FilterList,
} from "@mui/icons-material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

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
const chartColors = {
  primary: "#1976d2", // Main blue color
  success: "#42a5f5", // Lighter blue
  warning: "#90caf9", // Even lighter blue
  error: "#d32f2f", // Keep red for error/warning states
  grey: "#bbdefb", // Lightest blue
  pending: "#64b5f6", // Medium blue
};

const commonPaperStyles = {
  p: 3,
  // mb: 2,
  borderRadius: 2,
  boxShadow: "0 2px 12px 0 rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  },
};
const getProgressBarColor = (percentage) => {
  if (percentage == 100) {
    // return "";
    return "#FF7F50";
  } else if (percentage > 30) {
    return "#4caf50";
  } else {
    return "rgb(255, 193, 7)";
  }
};

const userStatusMap = {
  abhishek: "Active",
  pratibha: "Inactive",
  ankit: "Pending",
  satyam: "Active",
  abhimanyu: "Pending",
  manish: "Inactive",
  prince: "Pending",
  kunal: "Active",
};
const headerCellStyle = {
  padding: "6px 10px",
  fontWeight: 600,
  fontSize: "0.8rem",
  textAlign: "left",
  color: "#ffff",
};

const rowCellStyle = {
  padding: "6px 10px",
  fontSize: "0.8rem",
  color: "#555",
  textAlign: "left",
};

const AngelBot = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const userTableRef = React.useRef(null);
  const [negativeCount, setNegativeCount] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showBlockWarning, setShowBlockWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [licenseExpiryDate] = useState(new Date("2025-12-31")); // Replace with your actual expiry date
  const [addLicenseDialogOpen, setAddLicenseDialogOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({ name: "", expiryDate: "" });
  const [filteredUsers, setFilteredUsers] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [userPageData, setUserPageData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [userTableLoading, setUserTableLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'error', 'warning', 'info', 'success'

  const defaultStatusData = [
    { value: 500, name: "Used", color: "#91CC75" },
    { value: 484, name: "Available", color: "#5470C6" },
  ];

  const defaultDistributionData = [
    { value: 500, name: "User", color: "#FAC858" },
    { value: 484, name: "Department", color: "#5470C6" },
  ];

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // or "error"
  });

  const [licenses, setLicenses] = useState([
    {
      id: 1,
      name: "IAF-38M-15TB",
      issueDate: "2025-07-30",
      expiryDate: "2028-09-30", // 38 months later
    },
  ]);

  const [nextExpiringLicense, setNextExpiringLicense] = useState("");
  const [currentLicenseIndex, setCurrentLicenseIndex] = useState(0);
  const [openCreateUser, setOpenCreateUser] = useState(false);

  // 🔹 Region Management States
  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [regions, setRegions] = useState([]);
  const [newRegion, setNewRegion] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("");
  const [regionError, setRegionError] = useState("");

  const activeConfig = {
    storageStatusData: [
      { value: 100, name: "Used", color: "#91CC75" },
      { value: 110, name: "Available", color: "#FAC858" },
    ],
    storageDistributionData: [
      { value: 130, name: "User", color: "#91CC75" },
      { value: 150, name: "Department", color: "#FAC858" },
    ],
  };

  const [storageStatusData, setStorageStatusData] = useState(
    activeConfig.storageStatusData,
  );
  const [storageDistributionData, setStorageDistributionData] = useState(
    activeConfig.storageDistributionData,
  );

  const [userRowsPerPage, setUserRowsPerPage] = useState(7);
  const [userPage, setUserPage] = useState(0);
  const [deptPage, setDeptPage] = useState(0);
  const [deptRowsPerPage, setDeptRowsPerPage] = useState(7);
  const [userStorageTotalElements, setUserStorageTotalElements] = useState(0);
  const [deptStorageTotalElements, setDeptStorageTotalElements] = useState(0);

  const [selectedChart, setSelectedChart] = useState("Active"); // preselect Active
  const [backButton, setBackButton] = useState(false); // hidden initially

  const [userSortOption, setUserSortOption] = useState("high"); // Default option

  const [getSortedStorageUsers, setSortedStorageUsers] = useState([]);

  const [deptSortOption, setDeptSortOption] = useState("high");

  const [getSortedDepartments, setSortedDepartments] = useState([]);

  const [storageTab, setStorageTab] = useState("status"); // "status" or "distribution"
  // const [licenseFilter, setLicenseFilter] = useState("all");
  const [licenseFilter, setLicenseFilter] = useState("active");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const saveRegions = async (regions, defaultRegion) => {
    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/addRegion`, // ✅ adjust endpoint
        {
          regions,
          defaultRegion,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"), // same as your other APIs
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error saving regions:", error);
      throw error;
    }
  };

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
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  };

  const deleteRegion = async (regionName) => {
    try {
      const response = await axios.delete(
        `${window.__ENV__.REACT_APP_ROUTE
        }/tenants/deleteIn?value=${encodeURIComponent(regionName)}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"), // same as your other APIs
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting region:", error);
      throw error;
    }
  };

  const convertDisplayToGB = (value) => {
    if (!value || typeof value !== "string") return 0;

    const match = value.match(/([\d.]+)\s*(KB|MB|GB|B)/i);
    if (!match) return 0;

    const number = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case "B":
        return number / 1024 ** 3;
      case "KB":
        return number / 1024 ** 2;
      case "MB":
        return number / 1024;
      case "GB":
        return number;
      default:
        return 0;
    }
  };

  const convertDisplayToMB = (value) => {
    if (!value || typeof value !== "string") return 0;

    const match = value.match(/([\d.]+)\s*(KB|MB|GB|B)/i);
    if (!match) return 0;

    const number = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case "B":
        return number / (1024 * 1024);
      case "KB":
        return number / 1024;
      case "MB":
        return number;
      case "GB":
        return number * 1024;
      default:
        return 0;
    }
  };

  const fetchAllUsers = async () => {
    let allUsers = [];
    let page = 0;

    // First fetch to determine total pages
    const firstResponse = await fetchUsers(page);
    const firstPageUsers = firstResponse?.content || [];
    const totalPages = firstResponse?.totalPages || 1;

    allUsers = [...firstPageUsers];

    // Fetch remaining pages (if any)
    for (let i = 1; i < totalPages; i++) {
      const response = await fetchUsers(i);
      const pageUsers = response?.content || [];
      allUsers = [...allUsers, ...pageUsers];
    }

    return allUsers;
  };

  const fetchAllDepartments = async () => {
    let allDepartments = [];
    let page = 0;
    const pageSize = 10;

    try {
      const firstResponse = await getDepartments(page, pageSize);

      const totalPages = firstResponse?.totalPages || 1;

      allDepartments = [...(firstResponse?.content || [])];

      for (let i = 1; i < totalPages; i++) {
        const response = await getDepartments(i, pageSize);
        allDepartments = [...allDepartments, ...(response?.content || [])];
      }

      return allDepartments;
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
  };

  useEffect(() => {
    const today = new Date();
    const currentLicense = licenses[currentLicenseIndex];

    if (!currentLicense) return;

    const expiryDate = new Date(currentLicense.expiryDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= -10) {
      setShowBlockWarning(true);
    }

    if (diffDays <= 0) {
      setNegativeCount(Math.abs(diffDays));
      setRemainingDays(0);
    } else {
      setRemainingDays(diffDays);
    }

    setNextExpiringLicense(currentLicense.name);
  }, [licenses, currentLicenseIndex]);

  const getRemainingDays = () => remainingDays;

  const BlockWarningDialog = () => (
    <Dialog
      open={showBlockWarning}
      onClose={() => setShowBlockWarning(false)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 350,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: chartColors.error,
        }}
      >
        <Warning color="error" />
        Account Block Warning
      </DialogTitle>
      <DialogContent>
        <Typography>
          Your account has exceeded the grace period of 10 days after license
          expiry. Please renew your license immediately to avoid service
          interruption.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowBlockWarning(false)}>Close</Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            // Add your renewal logic here
            setShowBlockWarning(false);
          }}
        >
          Renew Now
        </Button>
      </DialogActions>
    </Dialog>
  );

  const mapSortToApi = (option) => {
    switch (option) {
      case "high":
        return "HTL";
      case "low":
        return "LTH";
      case "az":
        return "ASC";
      case "za":
        return "DSC";
      default:
        return "HTL";
    }
  };

  const loadUserStorageData = async (page, rowsPerPage, sortOption) => {
    try {
      const res = await getUserStorage(
        page + 1,
        rowsPerPage,
        mapSortToApi(sortOption),
      );
      const mapped = (res.content || []).map((u) => ({
        name: u.name,
        storageUsed: u.consumedStorage,
        storageAllocated: u.allocatedStorage,
      }));
      setSortedStorageUsers(mapped);
      setUserStorageTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch user storage data:", err);
    }
  };

  const loadDeptStorageData = async (page, rowsPerPage, sortOption) => {
    try {
      const res = await getDeptStorage(
        page + 1,
        rowsPerPage,
        mapSortToApi(sortOption),
      );
      const mapped = (res.content || []).map((d) => ({
        name: d.name,
        storageUsed: d.consumedStorage,
        storageAllocated: d.allocatedStorage,
      }));
      setSortedDepartments(mapped);
      setDeptStorageTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch dept storage data:", err);
    }
  };

  const sortUsers = (sortOption) => {
    // OLD: client-side sort (commented out)
    // let sortedUsers = [...getSortedStorageUsers];
    // switch (sortOption) {
    //   case "high": sortedUsers.sort((a, b) => b.storageUsed / b.storageAllocated - a.storageUsed / a.storageAllocated); break;
    //   case "low":  sortedUsers.sort((a, b) => a.storageUsed / a.storageAllocated - b.storageUsed / b.storageAllocated); break;
    //   case "az":   sortedUsers.sort((a, b) => a.name.localeCompare(b.name)); break;
    //   case "za":   sortedUsers.sort((a, b) => b.name.localeCompare(a.name)); break;
    //   default: break;
    // }
    // setSortedStorageUsers(sortedUsers);

    // NEW: server-side sort
    setUserPage(0);
    loadUserStorageData(0, userRowsPerPage, sortOption);
  };

  const sortDepartments = (sortOption) => {
    // OLD: client-side sort (commented out)
    // let sortedDepartments = [...getSortedDepartments];
    // switch (sortOption) {
    //   case "high": sortedDepartments.sort((a, b) => b.storage / b.storageAllocated - a.storage / a.storageAllocated); break;
    //   case "low":  sortedDepartments.sort((a, b) => a.storage / a.storageAllocated - b.storage / b.storageAllocated); break;
    //   case "az":   sortedDepartments.sort((a, b) => a.name.localeCompare(b.name)); break;
    //   case "za":   sortedDepartments.sort((a, b) => b.name.localeCompare(a.name)); break;
    //   default: break;
    // }
    // setSortedDepartments(sortedDepartments);

    // NEW: server-side sort
    setDeptPage(0);
    loadDeptStorageData(0, deptRowsPerPage, sortOption);
  };

  const [userStatsData, setUserStatsData] = useState([
    { name: "Active", value: 0, color: "#91CC75" },
    { name: "Inactive", value: 0, color: "#EE6666" },
    // { name: "Pending", value: 0, color: "#5470C6" },
  ]);

  // Helper function to format value as MB or GB
  const formatSize = (val) => {
    return val < 1024 ? `${val} MB` : `${(val / 1024).toFixed(1)}`;
  };

  const formatSizeGB = (val) => {
    return `${val.toFixed(2)} GB`;
  };

  const getLicenseStatus = (expiryDate) => {
    const today = new Date();
    const expDate = new Date(expiryDate);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "Expired", daysLeft: 0 };
    if (diffDays <= 30) return { status: "Expiring Soon", daysLeft: diffDays };
    return { status: "Active", daysLeft: diffDays };
  };
  const filteredLicenses = licenses.filter((license) => {
    const { status } = getLicenseStatus(license.expiryDate);
    if (licenseFilter === "all") return true;
    return status.toLowerCase() === licenseFilter;
  });

  const LicenseStatus = {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const valueFormatted = params.value;
        return `${params.name}: ${valueFormatted} (${params.percent}%)`;
      },
    },

    legend: {
      orient: "horizontal",
      left: "left",
      textStyle: {
        color: isDark ? "#fff" : "#000",
        fontWeight: "bold",
        // fontWeight: "bold",
      },
      formatter: function (name) {
        const item = userStatsData.find((d) => d.name === name);
        return `${name} ${item?.value || 0}`;
      },
    },

    series: [
      {
        name: "Status",
        type: "pie",
        radius: "75%",
        center: ["50%", "50%"],
        label: {
          position: "inside",
          fontSize: 13,
          formatter: "{d}%",
        },
        data: userStatsData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
          label: { show: true, formatter: "{d}%" },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  // const formatSizestorage = (val) => {
  //   return val < 1024
  //     ? `${val.toFixed(1)} MB`
  //     : `${(val / 1024).toFixed(1)} GB`;
  // };
  const formatSizestorage = (val) => {
    return `${val.toFixed(1)} GB`;
  };

  const storageStatus = {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const valueFormatted = formatSizestorage(params.value);
        return `${params.name}: ${valueFormatted} (${params.percent}%)`;
      },
    },

    legend: {
      orient: "horizontal",
      left: "center",
      textStyle: {
        color: isDark ? "#fff" : "#000",
        fontWeight: "bold",
      },
      formatter: function (name) {
        const item = storageStatusData.find((d) => d.name === name);
        if (!item) return name;
        return `${name} (${formatSizestorage(item.value)})`; // ✅ Adds GB or MB
      },
    },

    series: [
      {
        name: "Status",
        type: "pie",
        radius: "75%",
        center: ["50%", "50%"],

        label: {
          position: "inside",
          fontSize: 13,
          formatter: (params) => {
            return params.percent > 0 ? `${params.percent}%` : "";
          },
        },

        data: storageStatusData.map((item) => ({
          value: item?.value,
          name: item.name,
          itemStyle: { color: item.color },
          label: { show: true, formatter: "{d}%" },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const storageDistribution = {
    tooltip: {
      trigger: "item",

      formatter: function (params) {
        return `${params.name}: ${formatSizeGB(params.value)} (${params.percent
          }%)`;
      },
    },

    legend: {
      orient: "horizontal",
      left: "center",
      textStyle: {
        color: isDark ? "#fff" : "#000",
        fontWeight: "bold",
      },
      formatter: function (name) {
        const item = storageDistributionData.find((d) => d.name === name);
        return `${name} (${item ? formatSizeGB(item.value) : "0 GB"})`;
      },
    },

    series: [
      {
        name: "Status",
        type: "pie",
        radius: "75%",
        center: ["50%", "50%"],

        label: {
          position: "inside",
          fontSize: 13,

          formatter: function (params) {
            return `${formatSizeGB(params.value)} (${params.percent}%)`;
          },
        },

        data: storageDistributionData.map((item) => ({
          value: item?.value,
          name: item.name,
          itemStyle: { color: item.color },
          label: { show: true, formatter: "{d}%" },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const handleChartClick = (params) => {
    const name = params.name;

    if (selectedChart === name) return;

    setSelectedChart(name);
    setBackButton(name !== "Active");

    // TODO: replace with new storage-by-status API when ready
    // fetchAllUsers().then((allUsers) => {
    //   const filtered = allUsers.filter((user) => {
    //     if (name === "Active") return user.active && user.enabled;
    //     if (name === "Pending") return user.active && !user.enabled;
    //     if (name === "Inactive") return !user.active;
    //     return false;
    //   });

    //   setFilteredUsers(filtered);

    //   let usedStorage = 0;
    //   let totalAllocated = 0;

    //   filtered.forEach((user) => {
    //     const used = convertDisplayToMB(user.permissions?.displayStorage);
    //     const allowed = convertDisplayToMB(
    //       user.permissions?.allowedStorageInBytesDisplay,
    //     );
    //     usedStorage += used;
    //     totalAllocated += allowed;
    //   });

    //   const availableStorage = Math.max(totalAllocated - usedStorage, 0);

    //   setStorageStatusData([
    //     { name: "Used", value: usedStorage, color: "#91CC75" },
    //     { name: "Available", value: availableStorage, color: "#FAC858" },
    //   ]);
    // });

    setTimeout(() => {
      userTableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleBack = () => {
    setSelectedChart("Active");
    setBackButton(false);

    // TODO: replace with new storage-by-status API when ready
    // fetchAllUsers().then((users) => {
    //   const activeUsers = users.filter((user) => user.active && user.enabled);

    //   let usedStorage = 0;
    //   let totalAllocated = 0;

    //   activeUsers.forEach((user) => {
    //     const used = convertDisplayToMB(user.permissions?.displayStorage);
    //     const allowed = convertDisplayToMB(
    //       user.permissions?.allowedStorageInBytesDisplay,
    //     );
    //     usedStorage += used;
    //     totalAllocated += allowed;
    //   });

    //   const availableStorage = Math.max(totalAllocated - usedStorage, 0);

    //   setStorageStatusData([
    //     { name: "Used", value: usedStorage, color: "#91CC75" },
    //     { name: "Available", value: availableStorage, color: "#FAC858" },
    //   ]);

    //   setFilteredUsers(activeUsers);
    // });
  };

  const handleUserRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setUserRowsPerPage(newSize);
    setUserPage(0);
    loadUserStorageData(0, newSize, userSortOption);
  };

  const handleUserPageChange = (event, newPage) => {
    setUserPage(newPage);
    loadUserStorageData(newPage, userRowsPerPage, userSortOption);
  };

  const handleDeptPageChange = (event, newPage) => {
    setDeptPage(newPage);
    loadDeptStorageData(newPage, deptRowsPerPage, deptSortOption);
  };

  const handleDeptRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setDeptRowsPerPage(newSize);
    setDeptPage(0);
    loadDeptStorageData(0, newSize, deptSortOption);
  };

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true);

        // ✅ NEW: fetch chart stats from dedicated API
        const stats = await getDashboardStats();

        setUserStatsData([
          { name: "Active", value: stats.userStats.active, color: "#91CC75" },
          {
            name: "Inactive",
            value: stats.userStats.inactive,
            color: "#EE6666",
          },
          // { name: "Pending", value: stats.userStats.pending, color: "#5470C6" },
        ]);

        setStorageStatusData([
          {
            name: "Used",
            value: stats.storageStats.totalUsed,
            color: "#91CC75",
          },
          {
            name: "Available",
            value: stats.storageStats.totalAvailable,
            color: "#FAC858",
          },
        ]);

        setStorageDistributionData([
          {
            name: "User",
            value: stats.storageDistributionStats.totalAllocatedToUsers,
            color: "#91CC75",
          },
          {
            name: "Department",
            value: stats.storageDistributionStats.totalAllocatedToDepartments,
            color: "#FAC858",
          },
        ]);

        // NEW: load storage tables from dedicated APIs
        await loadUserStorageData(0, userRowsPerPage, userSortOption);
        await loadDeptStorageData(0, deptRowsPerPage, deptSortOption);

        // ⬇️ OLD users/departments table logic (commented out, kept for reference)

        // const users = await fetchAllUsers();
        // const activeUsers = users.filter((user) => user.active && user.enabled);
        // setFilteredUsers(activeUsers);

        // const userStorageData = users.map((user) => {
        //   const name = user.name;
        //   const storageUsed = convertDisplayToGB(user.permissions?.displayStorage);
        //   const storageAllocated = convertDisplayToGB(user.permissions?.allowedStorageInBytesDisplay);
        //   return {
        //     id: user.id,
        //     name,
        //     storageUsed: Number(storageUsed.toFixed(2)),
        //     storageAllocated: Number(storageAllocated.toFixed(2)) || 1,
        //   };
        // });
        // userStorageData.sort((a, b) => b.storageUsed / b.storageAllocated - a.storageUsed / a.storageAllocated);
        // setSortedStorageUsers(userStorageData);

        // const departments = await fetchAllDepartments();
        // const departmentStorageData = departments.map((dept) => {
        //   const name = dept.deptName || "Unnamed Dept";
        //   const storageUsed = convertDisplayToGB(dept?.permissions?.displayStorage);
        //   const storageAllocated = convertDisplayToGB(dept?.permissions?.allowedStorageInBytesDisplay);
        //   return {
        //     id: dept.id,
        //     name,
        //     storageUsed: storageUsed,
        //     storageAllocated: Number(storageAllocated.toFixed(2)) || 1,
        //   };
        // });
        // departmentStorageData.sort((a, b) => b.storageUsed / b.storageAllocated - a.storageUsed / a.storageAllocated);
        // setSortedDepartments(departmentStorageData);

        // let totalUserStorage = 0;
        // let totalDepartmentStorage = 0;
        // let active = 0, pending = 0, inactive = 0;
        // users.forEach((user) => {
        //   if (user.active && user.enabled) active++;
        //   else if (user.active && !user.enabled) pending++;
        //   else if (!user.active) inactive++;
        //   const allowed = convertDisplayToGB(user.permissions?.allowedStorageInBytesDisplay);
        //   totalUserStorage += allowed;
        // });
        // let usedStorage = 0; let totalAllocatedStorage = 0;
        // activeUsers.forEach((user) => {
        //   const used = convertDisplayToMB(user.permissions?.displayStorage);
        //   const allowed = convertDisplayToMB(user.permissions?.allowedStorageInBytesDisplay);
        //   usedStorage += used;
        //   totalAllocatedStorage += allowed;
        // });
        // const availableStorage = Math.max(totalAllocatedStorage - usedStorage, 0);
        // setUserStatsData([
        //   { name: "Active", value: active, color: "#91CC75" },
        //   { name: "Inactive", value: inactive, color: "#EE6666" },
        //   { name: "Pending", value: pending, color: "#5470C6" },
        // ]);
        // setStorageStatusData([
        //   { name: "Used", value: usedStorage, color: "#91CC75" },
        //   { name: "Available", value: availableStorage, color: "#FAC858" },
        // ]);
        // departments.forEach((dept) => {
        //   const allowed = convertDisplayToGB(dept?.permissions?.allowedStorageInBytesDisplay);
        //   totalDepartmentStorage += allowed;
        // });
        // setStorageDistributionData([
        //   { name: "User", value: totalUserStorage, color: "#91CC75" },
        //   { name: "Department", value: Number(totalDepartmentStorage.toFixed(2)), color: "#FAC858" },
        // ]);

        // departments.forEach((dept) => {
        //   const allowed = convertDisplayToGB(
        //     dept?.permissions?.allowedStorageInBytesDisplay,
        //   );
        //   totalDepartmentStorage += allowed;
        // });

        // setStorageDistributionData([
        //   { name: "User", value: totalUserStorage, color: "#91CC75" },
        //   {
        //     name: "Department",
        //     value: Number(totalDepartmentStorage.toFixed(2)),
        //     color: "#FAC858",
        //   },
        // ]);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, []);

  const LicenseCountdownBox = React.memo(({ licenses, chartColors }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const theme = useTheme();

    // Auto switch and progress bar
    React.useEffect(() => {
      const interval = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            setCurrentIndex((prev) => (prev + 1) % licenses.length);
            return 0;
          }
          return old + 5;
        });
      }, 150); // Smooth progress every 150ms (3s total)

      return () => clearInterval(interval);
    }, [licenses.length]);

    return (
      <Box
        sx={{
          mt: 2,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          height: 140,
        }}
      >
        <Box
          sx={{
            display: "flex",
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: "transform 1s ease-in-out",
            width: `${licenses.length * 100}%`,
          }}
        >
          {licenses.map((license, i) => {
            const { status, daysLeft } = getLicenseStatus(license.expiryDate);
            const label = `${status} — ${license.expiryDate}`;

            const { bg, color } =
              status === "Expired"
                ? { bg: alpha("#f44336", 0.1), color: "#f44336" }
                : status === "Expiring Soon"
                  ? { bg: alpha("#ff9800", 0.1), color: "#ff9800" }
                  : { bg: alpha("#4caf50", 0.1), color: "#4caf50" };

            return (
              <Box
                key={i}
                sx={{
                  flex: "0 0 100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    padding: 2,
                    borderRadius: 3,
                    boxShadow: `0 2px 10px ${alpha(color, 0.3)}`,
                    backgroundColor: bg,
                    minWidth: 250,
                    maxWidth: 300,
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: color,
                    }}
                  >
                    {/* <License fontSize="small" /> */}
                    <VerifiedUser fontSize="small" />

                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {license.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          status === "Expired"
                            ? "#f44336"
                            : status === "Expiring Soon"
                              ? "#ff9800"
                              : "#4caf50",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        mt: 0.5,
                      }}
                    >
                      {status}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: color, fontWeight: 500 }}
                  >
                    {label}
                  </Typography>

                  <Typography
                    variant="h3"
                    sx={{
                      color: color,
                      fontWeight: 800,
                      fontSize: "2.5rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {daysLeft}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: color,
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      letterSpacing: 1,
                    }}
                  >
                    DAYS LEFT
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  });

  // TODO: replace with new storageUsers API when ready
  // const loadUserPage = async (page) => {
  //   try {
  //     setUserTableLoading(true);
  //     const response = await fetchUsers(page);
  //     setUserPageData(response?.content || []);
  //     setTotalPages(response?.totalPages || 1);
  //   } catch (err) {
  //     console.error("Failed to fetch paginated users:", err);
  //   } finally {
  //     setUserTableLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   loadUserPage(0);
  // }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Box className="child-container">
          <div className="child">
            <Box
              sx={{
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
              <Grid
                container
                spacing={2}
                sx={{ justifyContent: "center", alignItems: "stretch" }}
              >
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <CardHeader
                      sx={{ padding: "0px !important" }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Group color="primary" />
                          <Typography variant="h6">User Status</Typography>
                        </div>
                      }
                    />
                    <CardContent
                      sx={{
                        mb: "auto",
                        pb: "0 !important",
                        display: "flex",
                        width: "100%",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <ReactECharts
                          option={LicenseStatus}
                          style={{ height: 300, width: "100%" }}
                          onEvents={{
                            click: handleChartClick,
                          }}
                        />
                      </div>
                    </CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                      }}
                    >
                      {/* <Tooltip title="Add User" arrow>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => setOpenCreateUser(true)} // ✅ open dialog
                          sx={{
                            backgroundColor: (theme) =>
                              theme.palette.primary.light,
                            color: (theme) =>
                              theme.palette.primary.contrastText,
                            "&:hover": {
                              backgroundColor: (theme) =>
                                theme.palette.primary.main,
                              boxShadow: 3,
                            },
                            borderRadius: 2,
                            transition: "all 0.3s ease-in-out",
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Tooltip> */}
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <CardHeader
                      sx={{ padding: "0px !important" }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Group color="primary" />

                          <Typography variant="h6">
                            {storageTab === "status"
                              ? "Storage Status"
                              : "Storage Distribution"}
                          </Typography>
                        </div>
                      }
                    />

                    <CardContent
                      sx={{
                        mb: "auto",
                        pb: "0 !important",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: 300,
                          position: "relative",
                        }}
                      >
                        <Fade
                          in={storageTab === "status"}
                          timeout={500}
                          unmountOnExit
                          appear
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          >
                            <ReactECharts
                              option={storageStatus}
                              style={{ height: "100%", width: "100%" }}
                            />
                          </Box>
                        </Fade>

                        <Fade
                          in={storageTab === "distribution"}
                          timeout={500}
                          unmountOnExit
                          appear
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          >
                            <ReactECharts
                              option={storageDistribution}
                              style={{ height: "100%", width: "100%" }}
                            />
                          </Box>
                        </Fade>
                      </Box>

                      <IconButton
                        onClick={() =>
                          setStorageTab((prev) =>
                            prev === "status" ? "distribution" : "status",
                          )
                        }
                        sx={{
                          mt: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "50%",
                          backgroundColor: "background.paper",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        {storageTab === "status" ? (
                          <ArrowForward />
                        ) : (
                          <ArrowBack />
                        )}
                      </IconButton>

                      {selectedChart && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "text.secondary",
                            fontWeight: "bold",
                            mt: 1,
                          }}
                        >
                          Showing data for: {selectedChart}
                        </Typography>
                      )}

                      {/* {selectedChart && (
                        <Button
                          size="small"
                          onClick={handleBack}
                          sx={{
                            mt: 1,
                            textTransform: "none",
                            fontWeight: 600,
                            color: "primary.main",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          ← Back to Overview
                        </Button>
                      )} */}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardHeader
                      sx={{ padding: "0px !important" }}
                      title={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Dashboard color="primary" />
                            <Typography variant="h6">License Status</Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <input
                              type="file"
                              id="license-upload"
                              accept=".json"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (file.type !== "application/json") {
                                  setSnackbar({
                                    open: true,
                                    message: "Only JSON files are allowed.",
                                    severity: "error",
                                  });
                                  return;
                                }

                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    const data = JSON.parse(
                                      event.target.result,
                                    );

                                    if (!data.name || !data.expiryDate) {
                                      setSnackbar({
                                        open: true,
                                        message:
                                          "JSON must contain 'name' and 'expiryDate'.",
                                        severity: "error",
                                      });
                                      return;
                                    }

                                    const newLicense = {
                                      id: licenses.length + 1,
                                      name: data.name,
                                      expiryDate: data.expiryDate,
                                    };

                                    setLicenses((prev) => [
                                      ...prev,
                                      newLicense,
                                    ]);
                                    setSnackbar({
                                      open: true,
                                      message: "License uploaded successfully.",
                                      severity: "success",
                                    });
                                  } catch (err) {
                                    setSnackbar({
                                      open: true,
                                      message: "Invalid JSON file.",
                                      severity: "error",
                                    });
                                  }
                                };

                                reader.readAsText(file);
                              }}
                            />

                            {/* Tooltip works now ✅ */}
                            {/* <Tooltip title="Add License" arrow>
                              <label htmlFor="license-upload">
                                <IconButton
                                  component="span"
                                  color="primary"
                                  size="small"
                                  sx={{
                                    backgroundColor: (theme) =>
                                      theme.palette.primary.light,
                                    color: (theme) =>
                                      theme.palette.primary.contrastText,
                                    "&:hover": {
                                      backgroundColor: (theme) =>
                                        theme.palette.primary.main,
                                      boxShadow: 3,
                                    },
                                    borderRadius: 2,
                                    transition: "all 0.3s ease-in-out",
                                  }}
                                >
                                  <Add />
                                </IconButton>
                              </label>
                            </Tooltip> */}

                            {/* <Tooltip title="Create Command" arrow>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={async () => {
                                  try {
                                    const data = await getRegions();
                                    // Assuming backend returns something like { regions: ["US", "EU"], defaultRegion: "US" }
                                    setRegions(data.regions || []);
                                    setDefaultRegion(data.defaultRegion || "");
                                    setOpenRegionDialog(true);
                                  } catch (error) {
                                    setSnackbar({
                                      open: true,
                                      message: "Failed to load regions.",
                                      severity: "error",
                                    });
                                  }
                                }}
                                sx={{
                                  backgroundColor: (theme) =>
                                    theme.palette.primary.light,
                                  color: (theme) =>
                                    theme.palette.primary.contrastText,
                                  "&:hover": {
                                    backgroundColor: (theme) =>
                                      theme.palette.primary.main,
                                    boxShadow: 3,
                                  },
                                  borderRadius: 2,
                                  transition: "all 0.3s ease-in-out",
                                }}
                              >
                                <Add />
                              </IconButton>
                            </Tooltip> */}
                          </Box>
                        </Box>
                      }
                    />

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center", // center vertically
                        gap: 3,
                        padding: "0px",
                        paddingBottom: "0px",
                      }}
                    >
                      <LicenseCountdownBox
                        licenses={licenses}
                        currentLicenseIndex={currentLicenseIndex}
                        setCurrentLicenseIndex={setCurrentLicenseIndex}
                        remainingDays={remainingDays}
                        nextExpiringLicense={nextExpiringLicense}
                        chartColors={chartColors}
                      />

                      <Box
                        sx={{
                          mt: 1,
                          border: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
                          borderRadius: 2,
                          maxHeight: 200,
                          overflowY: "auto",
                          backgroundColor: isDark ? "#121212" : "#fff",
                          "&::-webkit-scrollbar": {
                            width: "4px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: isDark ? "#666" : "#ccc",
                            borderRadius: "4px",
                          },
                          "&::-webkit-scrollbar-track": {
                            backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5",
                          },
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            tableLayout: "fixed",
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                background: isDark ? "#2b2b2b" : "#f5f5f5",
                                color: isDark ? "#fff" : "#000",
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
                              }}
                            >
                              {[
                                "Name",
                                "Issue Date",
                                "Expiry Date",
                                "Status",
                                "Days Left",
                                "Alert",
                              ].map((header, i) => (
                                <th
                                  key={header}
                                  style={{
                                    padding: "8px",
                                    fontWeight: "600",
                                    fontSize: "0.9rem",
                                    textAlign: i === 4 ? "center" : "left",
                                    color: isDark ? "#fff" : "#000",
                                  }}
                                >
                                  {header === "Alert" ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 600,
                                          color: isDark ? "#fff" : "#000",
                                        }}
                                      >
                                        Alert
                                      </Typography>

                                      <FormControl
                                        size="small"
                                        sx={{
                                          width: 100,
                                          "& .MuiOutlinedInput-root": {
                                            height: 32,
                                            fontSize: "0.75rem",
                                            paddingRight: "32px", // Make space for icon
                                            backgroundColor: isDark
                                              ? "#424242"
                                              : "#fff",
                                          },
                                          "& .MuiSelect-select": {
                                            padding: "4px 8px",
                                            display: "flex",
                                            alignItems: "center",
                                          },
                                          "& .MuiSelect-icon": {
                                            right: 8,
                                            top: "calc(50% - 12px)", // center vertically
                                            color: isDark ? "#ccc" : "#555",
                                          },
                                        }}
                                      >
                                        <Select
                                          value={licenseFilter}
                                          onChange={(e) =>
                                            setLicenseFilter(e.target.value)
                                          }
                                          displayEmpty
                                          renderValue={() => ""}
                                        >
                                          <MenuItem value="all">All</MenuItem>
                                          <MenuItem value="active">
                                            Active
                                          </MenuItem>
                                          <MenuItem value="expired">
                                            Expired
                                          </MenuItem>
                                          <MenuItem value="expiring soon">
                                            Expiring Soon
                                          </MenuItem>
                                        </Select>
                                      </FormControl>
                                    </Box>
                                  ) : (
                                    header
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLicenses.map((license, index) => {
                              const { status, daysLeft } = getLicenseStatus(
                                license.expiryDate,
                              );
                              const colorMap = {
                                Active: "#4caf50",
                                "Expiring Soon": "#ff9800",
                                Expired: "#f44336",
                              };

                              const isSelected = index === currentLicenseIndex;

                              return (
                                <tr
                                  key={index}
                                  onClick={() => {
                                    const originalIndex = licenses.findIndex(
                                      (l) => l.id === license.id,
                                    );
                                    if (originalIndex !== -1) {
                                      setCurrentLicenseIndex(originalIndex);
                                    }
                                  }}
                                  style={{
                                    borderBottom: `1px solid ${isDark ? "#333" : "#eee"
                                      }`,
                                    cursor: "pointer",
                                    backgroundColor: isSelected
                                      ? isDark
                                        ? "#263238"
                                        : "rgba(25, 118, 210, 0.05)"
                                      : isDark
                                        ? "#1e1e1e"
                                        : "#fff",
                                    color: isDark ? "#e0e0e0" : "#000",
                                    transition:
                                      "background-color 0.3s ease-in-out",
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: "8px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {license.name}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {license.issueDate || "—"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {license.expiryDate}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      fontSize: "0.875rem",
                                      color: colorMap[status],
                                      fontWeight: 600,
                                    }}
                                  >
                                    {status}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {daysLeft}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {status === "Expired" ? (
                                      <Tooltip
                                        title={`Your license "${license.name}" has expired. Please upgrade your plan.`}
                                        arrow
                                      >
                                        <WarningAmber
                                          sx={{
                                            color: "#f44336",
                                            cursor: "default",
                                          }}
                                          fontSize="small"
                                        />
                                      </Tooltip>
                                    ) : (
                                      <Typography
                                        variant="caption"
                                        color={
                                          isDark ? "grey.500" : "text.secondary"
                                        }
                                      >
                                        —
                                      </Typography>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  {selectedChart && filteredUsers && (
                    <Paper
                      ref={userTableRef}
                      elevation={2}
                      sx={{
                        mt: 4,
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 3,
                        backgroundColor: isDark ? "#1e1e1e" : "#fff",
                        border: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: isDark ? "#fff" : "#000",
                        }}
                      >
                        {selectedChart} Users
                      </Typography>

                      <Box
                        sx={{
                          maxHeight: 350,
                          overflowY: "auto",
                          border: `1px solid ${isDark ? "#555" : "#ccc"}`,
                          borderRadius: "6px",
                          backgroundColor: isDark ? "#121212" : "#fafafa",
                          "&::-webkit-scrollbar": {
                            width: "5px",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: alpha(chartColors.primary, 0.2),
                            borderRadius: "10px",
                          },
                          "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: alpha(chartColors.primary, 0.5),
                          },
                        }}
                      >
                        <table
                          className="user-table"
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                          }}
                        >
                          <thead
                            style={{
                              backgroundColor: isDark ? "#333" : "#1976d2",
                              color: "#fff",
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            <tr>
                              <th style={headerCellStyle}>Name</th>
                              <th style={headerCellStyle}>Used</th>
                              <th style={headerCellStyle}>Allocated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  style={{
                                    padding: "8px",
                                    fontSize: "0.875rem",
                                    color: isDark ? "#aaa" : "#000",
                                  }}
                                >
                                  No users found.
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((user, index) => (
                                <tr
                                  key={index}
                                  style={{
                                    borderBottom: `1px solid ${isDark ? "#333" : "#f0f0f0"
                                      }`,
                                    backgroundColor: isDark
                                      ? index % 2 === 0
                                        ? "#1c1c1c"
                                        : "#222"
                                      : index % 2 === 0
                                        ? "#fafafa"
                                        : "#fff",
                                  }}
                                >
                                  <td
                                    style={{
                                      ...rowCellStyle,
                                      color: isDark ? "#eee" : "#000",
                                    }}
                                  >
                                    {user.name}
                                  </td>
                                  <td
                                    style={{
                                      ...rowCellStyle,
                                      color: isDark ? "#eee" : "#000",
                                    }}
                                  >
                                    {user.permissions?.displayStorage || "—"}
                                  </td>
                                  <td
                                    style={{
                                      ...rowCellStyle,
                                      color: isDark ? "#eee" : "#000",
                                    }}
                                  >
                                    {user.permissions
                                      ?.allowedStorageInBytesDisplay || "—"}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </Box>
                    </Paper>
                  )}
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ marginTop: "20px", marginBottom: "15px" }}
                >
                  <Paper elevation={0} sx={commonPaperStyles}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                        gap: 1,
                      }}
                    >
                      <Dashboard color="primary" />
                      <Typography variant="h6" color="primary">
                        Storage Used (By Users)
                      </Typography>

                      <FormControl
                        size="small"
                        sx={{ display: "flex", marginLeft: "auto" }}
                      >
                        <Select
                          value={userSortOption}
                          onChange={(e) => {
                            const value = e.target.value;
                            setUserSortOption(value);
                            sortUsers(value); // Call sort logic
                          }}
                          displayEmpty
                          renderValue={(value) => {
                            switch (value) {
                              case "high":
                                return (
                                  <>
                                    <FilterList />
                                  </>
                                );
                              case "low":
                                return (
                                  <>
                                    <ArrowDownward />
                                  </>
                                );
                              case "az":
                                return (
                                  // <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <>
                                    <SortByAlpha />
                                  </>
                                  // </div>
                                );
                              case "za":
                                return (
                                  // <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <>
                                    <SortByAlpha
                                      sx={{ transform: "rotate(180deg)" }}
                                    />
                                  </>
                                  // </div>
                                );
                              default:
                                return null;
                            }
                          }}
                        >
                          <MenuItem value="high">
                            High Usage
                            <ArrowUpward />
                          </MenuItem>
                          <MenuItem value="low">
                            Low Usage
                            <ArrowDownward />
                          </MenuItem>
                          <MenuItem value="az">A-Z</MenuItem>
                          <MenuItem value="za">Z-A</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box
                      sx={{
                        maxHeight: 350,
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                          width: "5px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: alpha(chartColors.primary, 0.2),
                          borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: alpha(chartColors.primary, 0.5),
                        },
                      }}
                    >
                      {getSortedStorageUsers.map((user, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            mb: 0.5,
                            borderRadius: 1.5,
                            backgroundColor:
                              index % 2 === 0
                                ? alpha(chartColors.primary, 0.02)
                                : alpha(chartColors.primary, 0.06),
                            "&:hover": {
                              backgroundColor: alpha(chartColors.primary, 0.1),
                              transform: "translateY(-1px)",
                              transition: "all 0.2s ease-in-out",
                            },
                          }}
                        >
                          <Box sx={{ minWidth: 120 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: chartColors.primary,
                                fontSize: "0.875rem",
                              }}
                            >
                              {user.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.75rem",
                              }}
                            >
                              {`${user.storageUsed}/${user.storageAllocated}GB`}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, mx: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                user.storageAllocated
                                  ? (user.storageUsed / user.storageAllocated) *
                                  100
                                  : 0
                              }
                              sx={{
                                height: 10,
                                borderRadius: 2,
                                [`&.MuiLinearProgress-root`]: {
                                  backgroundColor: alpha(
                                    chartColors.primary,
                                    0.12,
                                  ),
                                },
                                [`& .MuiLinearProgress-bar`]: {
                                  borderRadius: 3,
                                  backgroundColor: getProgressBarColor(
                                    user.storageAllocated
                                      ? (user.storageUsed /
                                        user.storageAllocated) *
                                      100
                                      : 0,
                                  ),
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 40,
                              textAlign: "right",
                              fontWeight: 600,
                              color: chartColors.primary,
                              fontSize: "0.875rem",
                            }}
                          >
                            {`${Math.round(
                              user.storageAllocated
                                ? (user.storageUsed / user.storageAllocated) *
                                100
                                : 0,
                            )}%`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <TablePagination
                      component="div"
                      count={userStorageTotalElements}
                      page={userPage}
                      onPageChange={handleUserPageChange}
                      rowsPerPage={userRowsPerPage}
                      onRowsPerPageChange={handleUserRowsPerPageChange}
                      rowsPerPageOptions={[7, 10, 15, 20]}
                      sx={{
                        mt: 1,
                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                        {
                          margin: 0,
                        },
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6} sx={{ marginTop: "20px" }}>
                  <Paper elevation={0} sx={commonPaperStyles}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                        gap: 1,
                      }}
                    >
                      <Dashboard color="primary" />
                      <Typography variant="h6" color="primary">
                        Storage Used (By Units)
                      </Typography>
                      <FormControl
                        size="small"
                        sx={{ display: "flex", marginLeft: "auto" }}
                      >
                        <Select
                          value={deptSortOption}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDeptSortOption(value);
                            sortDepartments(value);
                          }}
                          displayEmpty
                          renderValue={(value) => {
                            switch (value) {
                              case "high":
                                return (
                                  <>
                                    <FilterList />
                                  </>
                                );
                              case "low":
                                return (
                                  <>
                                    <ArrowDownward />
                                  </>
                                );
                              case "az":
                                return (
                                  <>
                                    <SortByAlpha />
                                  </>
                                );
                              case "za":
                                return (
                                  <>
                                    <SortByAlpha
                                      sx={{ transform: "rotate(180deg)" }}
                                    />
                                  </>
                                );
                              default:
                                return null;
                            }
                          }}
                        >
                          <MenuItem value="high">
                            High Usage <ArrowUpward />
                          </MenuItem>
                          <MenuItem value="low">
                            Low Usage <ArrowDownward />
                          </MenuItem>
                          <MenuItem value="az">A-Z</MenuItem>
                          <MenuItem value="za">Z-A</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box
                      sx={{
                        maxHeight: 350,
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                          width: "5px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: alpha(chartColors.primary, 0.2),
                          borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: alpha(chartColors.primary, 0.5),
                        },
                      }}
                    >
                      {getSortedDepartments.map((dept, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            mb: 0.5,
                            borderRadius: 1.5,
                            backgroundColor:
                              index % 2 === 0
                                ? alpha(chartColors.primary, 0.02)
                                : alpha(chartColors.primary, 0.06),
                            "&:hover": {
                              backgroundColor: alpha(chartColors.primary, 0.1),
                              transform: "translateY(-1px)",
                              transition: "all 0.2s ease-in-out",
                            },
                          }}
                        >
                          <Box sx={{ minWidth: 120 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: chartColors.primary,
                                fontSize: "0.875rem",
                              }}
                            >
                              {dept.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.75rem",
                              }}
                            >
                              {`${dept.storageUsed}/${dept.storageAllocated}GB`}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, mx: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                dept.storageAllocated
                                  ? (dept.storageUsed / dept.storageAllocated) *
                                  100
                                  : 0
                              }
                              sx={{
                                height: 10,
                                borderRadius: 2,
                                [`&.MuiLinearProgress-root`]: {
                                  backgroundColor: alpha(
                                    chartColors.primary,
                                    0.12,
                                  ),
                                },
                                [`& .MuiLinearProgress-bar`]: {
                                  borderRadius: 3,
                                  backgroundColor: getProgressBarColor(
                                    dept.storageAllocated
                                      ? (dept.storageUsed /
                                        dept.storageAllocated) *
                                      100
                                      : 0,
                                  ),
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 40,
                              textAlign: "right",
                              fontWeight: 600,
                              color: chartColors.primary,
                              fontSize: "0.875rem",
                            }}
                          >
                            {`${Math.round(
                              dept.storageAllocated
                                ? (dept.storageUsed / dept.storageAllocated) *
                                100
                                : 0,
                            )}%`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <TablePagination
                      component="div"
                      count={deptStorageTotalElements}
                      page={deptPage}
                      onPageChange={handleDeptPageChange}
                      rowsPerPage={deptRowsPerPage}
                      onRowsPerPageChange={handleDeptRowsPerPageChange}
                      rowsPerPageOptions={[7, 10, 15, 20]}
                      sx={{
                        mt: 1,
                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                        {
                          margin: 0,
                        },
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            <Dialog
              open={addLicenseDialogOpen}
              onClose={() => setAddLicenseDialogOpen(false)}
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
                sx={{ backgroundColor: "primary.main", color: "#ffff" }}
              >
                Add New License
              </DialogTitle>
              <DialogContent
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                <TextField
                  label="License Name"
                  fullWidth
                  value={newLicense.name}
                  onChange={(e) =>
                    setNewLicense({ ...newLicense, name: e.target.value })
                  }
                />
                <TextField
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newLicense.expiryDate}
                  onChange={(e) =>
                    setNewLicense({ ...newLicense, expiryDate: e.target.value })
                  }
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddLicenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newLicense.name && newLicense.expiryDate) {
                      licenses.push({ ...newLicense, id: licenses.length + 1 });
                      setAddLicenseDialogOpen(false);
                      setNewLicense({ name: "", expiryDate: "" });
                    }
                  }}
                  sx={{ background: "rgb(251, 68, 36)" }}
                  variant="contained"
                >
                  Add
                </Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </div>
        </Box>
      )}

      <Dialog
        open={openCreateUser}
        onClose={() => setOpenCreateUser(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth={false}
      >
        <CreateUser
          handleClose={() => setOpenCreateUser(false)}
          showSnackbar={showSnackbar}
        />
      </Dialog>

      <Dialog
        open={openRegionDialog}
        onClose={() => setOpenRegionDialog(false)}
        maxWidth="md" // ✅ wider than "sm"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "400px", // ✅ increase height
            minWidth: "1200px", // ✅ increase width
            borderRadius: 2, // rounded corners
          },
        }}
      >
        {/* <DialogTitle
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main,
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Create Regions
        </DialogTitle> */}
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
            Create Command
          </Typography>

          <IconButton
            onClick={() => setOpenRegionDialog(false)}
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
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
            <TextField
              label="Command Name"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              error={!!regionError}
              helperText={regionError}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => {
                const regex = /^[A-Za-z0-9\-_ ]{1,12}$/; // ✅ only A-Z, 0-9, -, _, and space (1–12 chars)
                if (!regex.test(newRegion)) {
                  setRegionError(
                    "Command must be 1-12 chars, only letters, numbers, spaces, - or _",
                  );
                  return;
                }
                if (regions.includes(newRegion)) {
                  setRegionError("Command already exists.");
                  return;
                }
                if (regions.length >= 25) {
                  setRegionError("Maximum 25 commands allowed.");
                  return;
                }

                setRegions([...regions, newRegion]);
                setNewRegion("");
                setRegionError("");
              }}
            >
              Add
            </Button>
          </Box>

          {/* Regions List */}
          <Box
            sx={{
              mt: 2,
              maxHeight: 250, // ✅ enough for ~5 rows
              overflowY: "auto",
              pr: 1, // add space for scrollbar
              "&::-webkit-scrollbar": {
                width: "5px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(chartColors.primary, 0.2),
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: alpha(chartColors.primary, 0.5),
              },
            }}
          >
            {regions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No commands added yet.
              </Typography>
            ) : (
              regions.map((region, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {/* Region name */}
                  <Typography>{region}</Typography>

                  {/* Actions aligned together */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      size="small"
                      variant={
                        defaultRegion === region ? "contained" : "outlined"
                      }
                      color="primary"
                      onClick={() => setDefaultRegion(region)}
                      sx={{ minWidth: 90 }}
                    >
                      {defaultRegion === region ? "Default" : "Set Default"}
                    </Button>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={async () => {
                        try {
                          await deleteRegion(region);
                          setRegions(regions.filter((r) => r !== region));
                          if (defaultRegion === region) setDefaultRegion("");
                          setSnackbar({
                            open: true,
                            message: `Command "${region}" deleted successfully.`,
                            severity: "success",
                          });
                        } catch (error) {
                          setSnackbar({
                            open: true,
                            message: "Failed to delete command.",
                            severity: "error",
                          });
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              borderRadius: "8px",
            }}
            onClick={async () => {
              if (regions.length === 0) {
                setRegionError("At least one command is required.");
                return;
              }
              if (!defaultRegion) {
                setRegionError("Please select a default command.");
                return;
              }

              try {
                const result = await saveRegions(regions, defaultRegion);
                setSnackbar({
                  open: true,
                  message: "Commands saved successfully!",
                  severity: "success",
                });

                setOpenRegionDialog(false);
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: "Failed to save commands.",
                  severity: "error",
                });
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AngelBot;
