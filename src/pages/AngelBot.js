import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Dashboard,
  Group,
  Warning,
} from "@mui/icons-material";
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
import { TextField } from "@mui/material";

import React, { useEffect, useState } from "react";

import ReactECharts from "echarts-for-react";

import { WarningAmber } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Fade } from "@mui/material";
import { useTheme } from "@mui/material";
import { License } from "@mui/icons-material"; // Optional icon
import { VerifiedUser } from "@mui/icons-material";


import {

  SortByAlpha,
  FilterList,
} from "@mui/icons-material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";



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
  if (percentage === 100) {
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
  const [negativeCount, setNegativeCount] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showBlockWarning, setShowBlockWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [licenseExpiryDate] = useState(new Date("2025-12-31")); // Replace with your actual expiry date
  const [addLicenseDialogOpen, setAddLicenseDialogOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({ name: "", expiryDate: "" });
  const [filteredUsers, setFilteredUsers] = useState(null);

  const defaultStatusData = [
    { value: 500, name: "Used", color: "#91CC75" },
    { value: 484, name: "Available", color: "#5470C6" },
  ];

  const defaultDistributionData = [
    { value: 500, name: "User", color: "#FAC858" },
    { value: 484, name: "Department", color: "#5470C6" },
  ];

  const [licenses] = useState([
    { id: 1, name: "License A", expiryDate: "2025-05-10" },
    { id: 2, name: "License B", expiryDate: "2025-08-01" },
    { id: 3, name: "License C", expiryDate: "2025-06-10" }, // this is soonest
    { id: 4, name: "License D", expiryDate: "2025-12-31" },
  ]);

  const [nextExpiringLicense, setNextExpiringLicense] = useState("");
  const [currentLicenseIndex, setCurrentLicenseIndex] = useState(0);

  const [storageStatusData, setStorageStatusData] = useState(defaultStatusData);
  const [storageDistributionData, setStorageDistributionData] = useState(
    defaultDistributionData
  );
  const [userRowsPerPage, setUserRowsPerPage] = useState(7);
  const [userPage, setUserPage] = useState(0);
  const [deptPage, setDeptPage] = useState(0);
  const [deptRowsPerPage, setDeptRowsPerPage] = useState(7);
  const [backButton, setBackButton] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  // const [userSortOption, setUserSortOption] = useState('highest');

  const [userSortOption, setUserSortOption] = useState("high"); // Default option
  const [getSortedStorageUsers, setSortedStorageUsers] = useState([
    { id: 1, name: "abhishek", storageUsed: 200, storageAllocated: 200 },
    { id: 2, name: "pratibha", storageUsed: 250, storageAllocated: 300 },
    { id: 3, name: "ankit", storageUsed: 150, storageAllocated: 200 },
    { id: 4, name: "satyam", storageUsed: 150, storageAllocated: 200 },
    { id: 5, name: "abhimanyu", storageUsed: 50, storageAllocated: 200 },
    { id: 6, name: "manish", storageUsed: 150, storageAllocated: 200 },
    { id: 7, name: "prince", storageUsed: 50, storageAllocated: 200 },
    { id: 8, name: "kunal", storageUsed: 50, storageAllocated: 50 },
  ]);

  const [deptSortOption, setDeptSortOption] = useState("high");
  const [getSortedDepartments, setSortedDepartments] = useState([
    { id: 1, name: "IT", storage: 100, storageAllocated: 200 },
    { id: 2, name: "Engineering", storage: 200, storageAllocated: 300 },
    { id: 3, name: "Operations", storage: 150, storageAllocated: 200 },
    { id: 14, name: "Marketing", storage: 50, storageAllocated: 100 },
    { id: 145, name: "Sales", storage: 120, storageAllocated: 200 },
    { id: 17, name: "Finance", storage: 150, storageAllocated: 250 },
    { id: 18, name: "HR", storage: 150, storageAllocated: 200 },
  ]);

  const [storageTab, setStorageTab] = useState("status"); // "status" or "distribution"
  const [licenseFilter, setLicenseFilter] = useState("all");

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





  const sortUsers = (sortOption) => {
    let sortedUsers = [...getSortedStorageUsers];
    switch (sortOption) {
      case "high":
        sortedUsers.sort(
          (a, b) =>
            b.storageUsed / b.storageAllocated -
            a.storageUsed / a.storageAllocated
        );
        break;
      case "low":
        sortedUsers.sort(
          (a, b) =>
            a.storageUsed / a.storageAllocated -
            b.storageUsed / b.storageAllocated
        );
        break;
      case "az":
        sortedUsers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        sortedUsers.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    setSortedStorageUsers(sortedUsers);
  };

  const sortDepartments = (sortOption) => {
    let sortedDepartments = [...getSortedDepartments];

    switch (sortOption) {
      case "high":
        sortedDepartments.sort(
          (a, b) =>
            b.storage / b.storageAllocated - a.storage / a.storageAllocated
        );
        break;
      case "low":
        sortedDepartments.sort(
          (a, b) =>
            a.storage / a.storageAllocated - b.storage / b.storageAllocated
        );
        break;
      case "az":
        sortedDepartments.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        sortedDepartments.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setSortedDepartments(sortedDepartments);
  };

  const data = [
    { value: 500, name: "Active", color: "#91CC75" }, // 500 MB
    { value: 580, name: "Inactive", color: "#EE6666" }, // 580 MB
    { value: 1048, name: "Pending", color: "#5470C6" }, // 1.0 GB
    { value: 484, name: "Available", color: "#FAC858" }, // 484 MB
  ];

  // Helper function to format value as MB or GB
  const formatSize = (val) => {
    return val < 1024 ? `${val} MB` : `${(val / 1024).toFixed(1)}`;
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
      formatter: function (name) {
        const item = data.find((d) => d.name === name);
        return `${name} ${item.value}`;
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
          formatter: "{d}%", // Shows percent inside each slice
        },
        data: data.map((item) => ({
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

  // Helper function to format value as MB or GB
  const formatSizestorage = (val) => {
    return val < 1024 ? `${val} ` : `${(val / 1024).toFixed(1)} `;
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
      formatter: function (name) {
        const item = storageStatusData.find((d) => d.name === name);
        return `${name} (${formatSize(item.value)})`;
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
        const valueFormatted = formatSizestorage(params.value);
        return `${params.name}: ${valueFormatted} (${params.percent}%)`;
      },
    },
    legend: {
      orient: "horizontal",
      left: "center",
      formatter: function (name) {
        const item = storageDistributionData.find((d) => d.name === name);
        return `${name} (${formatSize(item.value)})`;
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

    if (selectedChart === name) return; // No toggle

    // Chart config
    const chartConfig = {
      Pending: {
        storageStatusData: [
          { value: 0, name: "Used", color: "#91CC75" },
          { value: 100, name: "Available", color: "#FAC858" },
        ],
        storageDistributionData: [
          { value: 0, name: "User", color: "#91CC75" },
          { value: 100, name: "Department", color: "#FAC858" },
        ],
      },

      Active: {
        storageStatusData: [
          { value: 100, name: "Used", color: "#91CC75" },
          { value: 110, name: "Available", color: "#FAC858" },
        ],
        storageDistributionData: [
          { value: 130, name: "User", color: "#91CC75" },
          { value: 150, name: "Department", color: "#FAC858" },
        ],
      },
      Inactive: {
        storageStatusData: [
          { value: 100, name: "Used", color: "#91CC75" },
          { value: 110, name: "Available", color: "#FAC858" },
        ],
        storageDistributionData: [
          { value: 130, name: "User", color: "#91CC75" },
          { value: 150, name: "Department", color: "#FAC858" },
        ],
      },
      Available: {
        storageStatusData: [
          { value: 100, name: "Used", color: "#91CC75" },
          { value: 110, name: "Available", color: "#FAC858" },
        ],
        storageDistributionData: [
          { value: 130, name: "User", color: "#91CC75" },
          { value: 150, name: "Department", color: "#FAC858" },
        ],
      },
      // ... add other chart options here
    };

    const config = chartConfig[name];
    if (config) {
      setStorageStatusData(config.storageStatusData);
      setStorageDistributionData(config.storageDistributionData);
      setSelectedChart(name);
      setBackButton(true);

      // 👇 Add this line to filter users
      const users = getSortedStorageUsers.filter(
        (user) => userStatusMap[user.name] === name
      );
      setFilteredUsers(users);
    }
  };

  // const handleBack = () => {
  //   setStorageStatusData(defaultStatusData);
  //   setStorageDistributionData(defaultDistributionData);
  //   setSelectedChart(null);
  //   setBackButton(false);
  // };

  const handleBack = () => {
    setStorageStatusData(defaultStatusData);
    setStorageDistributionData(defaultDistributionData);
    setSelectedChart(null);
    setFilteredUsers(null); // 👈 reset the list
    setBackButton(false);
  };

  const handleUserRowsPerPageChange = (event) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  const handleUserPageChange = (event, newPage) => {
    setUserPage(newPage);
  };

  const handleDeptPageChange = (event, newPage) => {
    setDeptPage(newPage);
  };

  const handleDeptRowsPerPageChange = (event) => {
    setDeptRowsPerPage(parseInt(event.target.value, 10));
    setDeptPage(0);
  };

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
            transition: "transform 0.6s ease-in-out",
            width: `${licenses.length * 100}%`,
          }}
        >
          {licenses.map((license, i) => {
            const { daysLeft } = getLicenseStatus(license.expiryDate);
            const label =
              daysLeft <= 30
                ? `Renewal By: ${license.expiryDate}`
                : `License Validity: ${license.expiryDate}`;

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
                    boxShadow: `0 2px 10px ${alpha(chartColors.error, 0.2)}`,
                    backgroundColor: alpha(chartColors.error, 0.08),
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
                      color: chartColors.error,
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
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: chartColors.error, fontWeight: 500 }}
                  >
                    {label}
                  </Typography>

                  <Typography
                    variant="h3"
                    sx={{
                      color: chartColors.error,
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
                      color: chartColors.error,
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


  return (
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
            <Grid item xs={4}>
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
                      <Typography variant="h6">User Stats</Typography>
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
                    {selectedChart && filteredUsers && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                          {selectedChart} Users
                        </Typography>

                        <Paper
                          elevation={0}
                          sx={{
                            maxHeight: 250,
                            overflowY: "auto",
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            "&::-webkit-scrollbar": {
                              width: "6px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              backgroundColor: "#bbb",
                              borderRadius: "4px",
                            },
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead
                              style={{
                                backgroundColor: "#1976d2",
                                color: "#ffff",
                              }}
                            >
                              <tr
                                style={{
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                }}
                              >
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
                                      padding: "6px",
                                      fontSize: "0.8rem",
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
                                      borderBottom: "1px solid #f0f0f0",
                                    }}
                                  >
                                    <td style={rowCellStyle}>{user.name}</td>
                                    <td style={rowCellStyle}>
                                      {user.storageUsed} GB
                                    </td>
                                    <td style={rowCellStyle}>
                                      {user.storageAllocated} GB
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </Paper>
                      </Box>
                    )}
                  </div>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 1,
                  }}
                >
                  <Tooltip title="Add User" arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => console.log("Add User clicked")}
                      sx={{
                        backgroundColor: (theme) => theme.palette.primary.light,
                        color: (theme) => theme.palette.primary.contrastText,
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
                  </Tooltip>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={4}>
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
                    sx={{ width: "100%", height: 300, position: "relative" }}
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
                        prev === "status" ? "distribution" : "status"
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
                    {storageTab === "status" ? <ArrowForward /> : <ArrowBack />}
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

                  {selectedChart && (
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
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
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
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Dashboard color="primary" />
                        <Typography variant="h6">License Stats</Typography>
                      </Box>

                      <Tooltip title="Add License" arrow>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => setAddLicenseDialogOpen(true)}
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
                      </Tooltip>
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
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      maxHeight: 200,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "4px", // ⬅️ reduce scrollbar width here
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc", // customize thumb color
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f5f5f5",
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
                            background: "#f5f5f5",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                          }}
                        >
                          <th
                            style={{
                              padding: "8px",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              textAlign: "left",
                            }}
                          >
                            Name
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              textAlign: "left",
                            }}
                          >
                            Expiry Date
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              textAlign: "left",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              textAlign: "left",
                            }}
                          >
                            Days Left
                          </th>

                          <th
                            style={{
                              padding: "4px",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              Alert
                              <FormControl size="small" sx={{ width: "50px" }}>
                                <Select
                                  value={licenseFilter}
                                  onChange={(e) =>
                                    setLicenseFilter(e.target.value)
                                  }
                                  displayEmpty
                                  renderValue={() => ""}
                                  sx={{
                                    fontSize: "0.75rem",
                                    minHeight: "20px",
                                  }}
                                >
                                  <MenuItem value="all">All</MenuItem>
                                  <MenuItem value="active">Active</MenuItem>
                                  <MenuItem value="expired">Expired</MenuItem>
                                  <MenuItem value="expiring soon">
                                    Expiring Soon
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLicenses.map((license, index) => {
                          const { status, daysLeft } = getLicenseStatus(
                            license.expiryDate
                          );
                          const colorMap = {
                            Active: "#4caf50",
                            "Expiring Soon": "#ff9800",
                            Expired: "#f44336",
                          };

                          return (
                            <tr
                              key={index}
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              <td
                                style={{ padding: "8px", fontSize: "0.875rem" }}
                              >
                                {license.name}
                              </td>
                              <td
                                style={{ padding: "8px", fontSize: "0.875rem" }}
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
                                style={{ padding: "8px", fontSize: "0.875rem" }}
                              >
                                {daysLeft}
                              </td>
                              <td
                                style={{ padding: "8px", textAlign: "center" }}
                              >
                                {status === "Expired" ? (
                                  <Tooltip
                                    title={`Your license \"${license.name}\" has expired. Please upgrade your plan.`}
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
                                    color="text.secondary"
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
                        {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> */}
                        High Usage
                        <ArrowUpward />
                        {/* </div> */}
                      </MenuItem>
                      <MenuItem value="low">
                        {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> */}
                        Low Usage
                        <ArrowDownward />
                        {/* </div> */}
                      </MenuItem>
                      <MenuItem value="az">
                        {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> */}
                        A-Z
                        {/* </div> */}
                      </MenuItem>
                      <MenuItem value="za">
                        {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> */}
                        Z-A
                        {/* </div> */}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  {getSortedStorageUsers
                    .slice(
                      userPage * userRowsPerPage,
                      userPage * userRowsPerPage + userRowsPerPage
                    )
                    .map((user, index) => (
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
                              (user.storageUsed / user.storageAllocated) * 100
                            }
                            sx={{
                              height: 10,
                              borderRadius: 2,
                              [`&.MuiLinearProgress-root`]: {
                                backgroundColor: alpha(
                                  chartColors.primary,
                                  0.12
                                ),
                              },
                              [`& .MuiLinearProgress-bar`]: {
                                borderRadius: 3,
                                backgroundColor: getProgressBarColor(
                                  (user.storageUsed / user.storageAllocated) *
                                  100
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
                            (user.storageUsed / user.storageAllocated) * 100
                          )}%`}
                        </Typography>
                        <Tooltip title="Increase Storage" arrow>
                          <IconButton
                            size="small"
                            onClick={() =>
                              console.log(`Increase storage for ${user.name}`)
                            }
                            sx={{
                              ml: 1,
                              width: 28,
                              height: 28,
                              padding: 0.5,
                              backgroundColor: (theme) =>
                                theme.palette.primary.light,
                              color: (theme) =>
                                theme.palette.primary.contrastText,
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  theme.palette.primary.main,
                                boxShadow: 2,
                              },
                              borderRadius: 2,
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Add fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  <TablePagination
                    component="div"
                    count={getSortedStorageUsers.length}
                    page={userPage}
                    onPageChange={handleUserPageChange}
                    rowsPerPage={userRowsPerPage}
                    onRowsPerPageChange={handleUserRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 15]}
                    sx={{
                      mt: 1,
                      ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                      {
                        margin: 0,
                      },
                    }}
                  />
                </Box>
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
                    Storage Used (By Departments)
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
                <Box>
                  {getSortedDepartments
                    .slice(
                      deptPage * deptRowsPerPage,
                      deptPage * deptRowsPerPage + deptRowsPerPage
                    )
                    .map((dept, index) => (
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
                            {`${dept.storage}/${dept.storageAllocated}GB`}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(dept.storage / dept.storageAllocated) * 100}
                            sx={{
                              height: 10,
                              borderRadius: 2,
                              [`&.MuiLinearProgress-root`]: {
                                backgroundColor: alpha(
                                  chartColors.primary,
                                  0.12
                                ),
                              },
                              [`& .MuiLinearProgress-bar`]: {
                                borderRadius: 3,
                                backgroundColor: getProgressBarColor(
                                  (dept.storage / dept.storageAllocated) * 100
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
                            (dept.storage / dept.storageAllocated) * 100
                          )}%`}
                        </Typography>
                        <Tooltip title="Increase Storage" arrow>
                          <IconButton
                            size="small"
                            onClick={() =>
                              console.log(`Increase storage for ${dept.name}`)
                            }
                            sx={{
                              ml: 1,
                              width: 28,
                              height: 28,
                              padding: 0.5,
                              backgroundColor: (theme) =>
                                theme.palette.primary.light,
                              color: (theme) =>
                                theme.palette.primary.contrastText,
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  theme.palette.primary.main,
                                boxShadow: 2,
                              },
                              borderRadius: 2,
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Add fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  <TablePagination
                    component="div"
                    count={getSortedDepartments.length}
                    page={deptPage}
                    onPageChange={handleDeptPageChange}
                    rowsPerPage={deptRowsPerPage}
                    onRowsPerPageChange={handleDeptRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 15]}
                    sx={{
                      mt: 1,
                      ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                      {
                        margin: 0,
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </div>
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
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "#ffff" }}>
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
          <Button onClick={() => setAddLicenseDialogOpen(false)}>Cancel</Button>
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
    </Box>
  );
};

export default AngelBot;
