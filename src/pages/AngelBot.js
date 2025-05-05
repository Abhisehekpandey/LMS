import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { motion } from "framer-motion";
// import { Paper } from "@mui/material";
import {
  Box,
  Paper,
  Typography,
  Grid,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { LinearProgress, TablePagination } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StorageIcon from "@mui/icons-material/Storage";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { fontGrid } from "@mui/material/styles/cssUtils";
import { BarChart } from "@mui/x-charts/BarChart";
import AddIcon from "@mui/icons-material/Add";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import WarningIcon from "@mui/icons-material/Warning";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import AssessmentIcon from "@mui/icons-material/Assessment";

const chartColors = {
  primary: "#1976d2", // Main blue color
  success: "#42a5f5", // Lighter blue
  warning: "#90caf9", // Even lighter blue
  error: "#d32f2f", // Keep red for error/warning states
  grey: "#bbdefb", // Lightest blue
  pending: "#64b5f6", // Medium blue
};

const chartColorSchemes = {
  userDistribution: {
    active: "#4CAF50", // Green for active
    inactive: "#FF0000", // Red for inactive
    pending: "#FFA500", // Orange for pending
    available: "#13529d", // Yellow for available
  },

  storageDistribution: {
    used: "#8338ec", // Indigo for used storage
    available: "#ff8a00cc", // Light indigo for available storage
  },

  licenseData: {
    user: "#1976d25c", // Teal for user storage
    department: "#1900ff", // Light Teal for department storage
  },
};

const commonPaperStyles = {
  // p: 3,
  // mb: 2,
  borderRadius: 2,
  boxShadow: "0 2px 12px 0 rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  },
};

const arrowLabelSx = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  fontSize: "0.75rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
  "&::before": {
    content: '""',
    width: "40px",
    height: "2px",
    marginRight: "4px",
  },
};

// Update the chart configuration for all three chart components
const commonChartOptions = {
  legend: {
    orient: "horizontal",
    bottom: 10, // Move legend down
    left: "center",
    itemWidth: 12,
    itemHeight: 12,
    textStyle: {
      fontSize: 12,
    },
  },
  series: [
    {
      center: ["50%", "35%"], // Move chart up to make more room for labels
      radius: "60%", // Reduce chart size
      label: {
        position: "outside",
        alignTo: "edge",
        margin: 20, // Add margin to prevent overlap
        distanceToLabelLine: 5,
        formatter: "{b}\n{c}",
        fontSize: 12,
        overflow: "break", // Break text if too long
      },
      labelLine: {
        length: 15,
        length2: 20,
        maxSurfaceAngle: 80,
      },
      labelLayout: {
        hideOverlap: true, // Hide labels that would overlap
      },
    },
  ],
};

const ArrowLabel = ({ text, value, color, top, left, right }) => (
  <Box
    sx={{
      ...arrowLabelSx,
      color,
      top,
      left,
      right,
      "&::before": {
        ...arrowLabelSx["&::before"],
        backgroundColor: color,
      },
    }}
  >
    {`${text} (${value})`}
  </Box>
);

const pulseAnimation = {
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
      opacity: 1,
    },
    "50%": {
      transform: "scale(1.05)",
      opacity: 0.8,
    },
    "100%": {
      transform: "scale(1)",
      opacity: 1,
    },
  },
};

const AngelBot = ({ onThemeToggle }) => {
  const [userPage, setUserPage] = useState(0);
  const [deptPage, setDeptPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(7);
  const [deptRowsPerPage, setDeptRowsPerPage] = useState(7);

  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    availableUsers: 0, // Add this
    inactiveUsers: 0,
    pendingUsers: 0, // Add this line
  });
  const [storageStats, setStorageStats] = useState({
    totalAllocated: 0,
    totalUsed: 0,
    totalUnused: 0,
  });

  const expiryData = {
    days: [0, 15, 30, 45, 60, 90],
    licenses: [5, 8, 12, 3, 7, 2],
  };

  // First, add this to your existing state declarations at the top
  const [licenseExpiryDate] = useState(new Date("2025-12-31")); // Replace with your actual expiry date
  // Add these state variables inside AngelBot component
  const [showBlockWarning, setShowBlockWarning] = useState(false);
  const [negativeCount, setNegativeCount] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    const calculateRemainingDays = () => {
      const today = new Date();
      const diffTime = licenseExpiryDate - today;
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
    };

    calculateRemainingDays();
  }, [licenseExpiryDate]); // Only recalculate when licenseExpiryDate changes

  // Update the getRemainingDays function to just return the state value
  const getRemainingDays = () => remainingDays;

  const handleUserPageChange = (event, newPage) => {
    setUserPage(newPage);
  };

  // Add the warning dialog component
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
        <WarningIcon color="error" />
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

  const handleUserRowsPerPageChange = (event) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  const handleDeptPageChange = (event, newPage) => {
    setDeptPage(newPage);
  };

  const handleDeptRowsPerPageChange = (event) => {
    setDeptRowsPerPage(parseInt(event.target.value, 10));
    setDeptPage(0);
  };

  useEffect(() => {
    const dashboardRows =
      JSON.parse(localStorage.getItem("dashboardRows")) || [];
    const active = dashboardRows.filter(
      (user) => user.status === "active"
    ).length;
    const pending = dashboardRows.filter(
      (user) => user.status === "pending"
    ).length;
    const total = dashboardRows.length;
    const inactive = total - active - pending;
    const available = Math.floor(active / 2); // Set available as half of active users

    const totalAllocated = dashboardRows.reduce((sum, user) => {
      const allocated = parseInt(
        user.storageUsed?.replace(/[^0-9]/g, "") || "0"
      );
      return sum + allocated;
    }, 0);

    const totalUsed = dashboardRows.reduce((sum, user) => {
      const used = parseInt(user.manageStorage?.replace(/[^0-9]/g, "") || "0");
      return sum + used;
    }, 0);

    setUserStats({
      totalUsers: total,
      activeUsers: active,
      availableUsers: available,
      pendingUsers: pending,
      // inactiveUsers: total - active,
      inactiveUsers: inactive,
    });

    setStorageStats({
      totalAllocated: totalAllocated,
      totalUsed: totalUsed,
      totalUnused: totalAllocated - totalUsed,
    });
  }, []);

  const gaugeData = [
    {
      value: userStats.activeUsers,
      label: "Active",
      color: chartColors.success,
    },
    {
      value: userStats.inactiveUsers,
      label: "Inactive",
      color: chartColors.warning,
    },
    {
      value: userStats.pendingUsers,
      label: "Pending",
      color: chartColors.grey, // or any other color you prefer
    },
  ];

  const getSortedStorageUsers = () => {
    const dashboardRows =
      JSON.parse(localStorage.getItem("dashboardRows")) || [];
    return dashboardRows
      .map((user) => ({
        name: user.name,
        status: user.status, // Add this to track status
        storageUsed: parseInt(
          user.manageStorage?.replace(/[^0-9]/g, "") || "0"
        ),
        storageAllocated: parseInt(
          user.storageUsed?.replace(/[^0-9]/g, "") || "0"
        ),
      }))
      .sort((a, b) => b.storageUsed - a.storageUsed);
  };

  const getSortedDepartments = () => {
    const departments = JSON.parse(localStorage.getItem("departments")) || [];
    return departments
      .map((dept) => ({
        name: dept.name,
        displayName: dept.displayName,
        storage: parseInt(dept.storage?.replace(/[^0-9]/g, "") || "0"),
      }))
      .sort((a, b) => b.storage - a.storage);
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 1,
        backgroundColor: bgColor,
        borderRadius: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid",
        borderColor: alpha(color, 0.1),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Icon sx={{ color: color, fontSize: "1.2rem" }} />
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: color }}>
        {value}
      </Typography>
    </Paper>
  );

  const licenseData = [
    {
      value: storageStats.totalAllocated,
      label: "User",
      color: chartColors.primary,
    },
    {
      value: getSortedDepartments().reduce(
        (sum, dept) => sum + dept.storage,
        0
      ),
      label: "Department",
      color: chartColors.warning,
    },
  ];

  const UserDistributionChart = ({ data }) => {
    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          return `<div style="font-weight: 700; font-size: 14px; color: #000;">
                    ${params.name}: ${params.value}${params.name.includes("Storage") ? "GB" : ""
            } 
                  </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        padding: [8, 12],
        textStyle: {
          fontSize: 14,
          fontWeight: 700,
          color: "#000",
        },
      },

      legend: {
        orient: "horizontal",
        top: "0%", // Position just below title
        left: "center", // Center horizontally
        itemGap: 20, // Space between legend items
        itemWidth: 15,
        itemHeight: 15,
        textStyle: {
          fontSize: 12,
          padding: [3, 0, 3, 0], // Add vertical padding
        },
      },

      series: [
        {
          name: "User Distribution",
          type: "pie",
          radius: "80%",
          center: ["50%", "60%"], // Move chart down to make room for legend
          data: [
            {
              value: data.activeUsers,
              name: "Active",
              itemStyle: { color: chartColorSchemes.userDistribution.active },
            },
            {
              value: data.pendingUsers,
              name: "Pending",
              itemStyle: { color: chartColorSchemes.userDistribution.pending },
            },
            {
              value: data.inactiveUsers,
              name: "Inactive",
              itemStyle: { color: chartColorSchemes.userDistribution.inactive },
            },
            {
              value: data.availableUsers,
              name: "Available",
              itemStyle: {
                color: chartColorSchemes.userDistribution.available,
              },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },

          label: {
            show: true,
            position: "inside",
            formatter: "({d}%)",
            fontSize: 12,
            fontWeight: "bold",
            color: "#ffff",
            fontFamily: "Be Vietnam",
          },
        },
      ],
    };

    return (
      <ReactECharts
        option={option}
        style={{ height: "300px" }} // Increased height
        opts={{ renderer: "svg" }}
      />
    );
  };

  const StorageDistributionChart = ({ data }) => {
    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          return `<div style="font-weight: 700; font-size: 14px; color: #000;">
              ${params.name}: ${params.value}${params.name.includes("Storage") ? "GB" : ""
            } 
            </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        padding: [8, 12],
        textStyle: {
          fontSize: 14,
          fontWeight: 700,
          color: "#000",
        },
      },

      legend: {
        orient: "horizontal",
        top: "0%", // Position just below title
        left: "center", // Center horizontally
        itemGap: 20, // Space between legend items
        itemWidth: 15,
        itemHeight: 15,
        textStyle: {
          fontSize: 12,
          padding: [3, 0, 3, 0], // Add vertical padding
        },
      },
      series: [
        {
          name: "Storage Distribution",
          type: "pie",
          radius: "80%",
          center: ["50%", "60%"],
          data: [
            {
              value: data.totalUsed,
              name: "Used",
              // itemStyle: { color: chartColors.primary },
              itemStyle: { color: chartColorSchemes.storageDistribution.used },
            },
            {
              value: data.totalUnused,
              name: "Available",
              // itemStyle: { color: chartColors.grey },
              itemStyle: {
                color: chartColorSchemes.storageDistribution.available,
              },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },

          label: {
            show: true,
            position: "inside",
            formatter: "({d}%)",
            fontSize: 12,
            fontWeight: "bold",
            color: "#ffff",
            fontFamily: "Be Vietnam",
          },
        },
      ],
    };

    return (
      <ReactECharts
        option={option}
        style={{ height: "300px" }}
        opts={{ renderer: "svg" }}
      />
    );
  };

  // For License Data chart:
  const LicenseDataChart = ({ data }) => {
    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          return `<div style="font-weight: 700; font-size: 14px; color: #000;">
                    ${params.name}: ${params.value}${params.name.includes("Storage") ? "GB" : ""
            } 
                  </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        padding: [8, 12],
        textStyle: {
          fontSize: 14,
          fontWeight: 700,
          color: "#000",
        },
      },

      legend: {
        orient: "horizontal",
        top: "0%", // Position just below title
        left: "center", // Center horizontally
        itemGap: 20, // Space between legend items
        itemWidth: 15,
        itemHeight: 15,
        textStyle: {
          fontSize: 12,
          padding: [3, 0, 3, 0], // Add vertical padding
        },
      },
      series: [
        {
          name: "License Data",
          type: "pie",
          radius: "80%",
          center: ["50%", "60%"],
          data: [
            {
              value: data.userStorage,
              name: "User",
              // itemStyle: { color: chartColors.primary },
              itemStyle: { color: chartColorSchemes.licenseData.user },
            },
            {
              value: data.departmentStorage,
              name: "Department",
              // itemStyle: { color: chartColors.warning },
              itemStyle: { color: chartColorSchemes.licenseData.department },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },

          label: {
            show: true,
            position: "inside",
            formatter: "({d}%)",
            fontSize: 12,
            fontWeight: "bold",
            color: "#ffff",
            fontFamily: "Be Vietnam",
          },
        },
      ],
    };

    return (
      <ReactECharts
        option={option}
        style={{ height: "300px" }}
        opts={{ renderer: "svg" }}
      />
    );
  };

  return (


    <Box className="child-container">
      <div className="child">
        <Box
          sx={
            {
              // display: "grid",
              // position: "relative",
              // // height: "100vh",
              // backgroundColor: "#f5f7fa",
            }
          }
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
                      <GroupIcon color="primary" />
                      <Typography variant="h6">License Status</Typography>
                    </div>
                  }
                />
                <CardContent
                  sx={{
                    mb: "auto",
                    pb: "0 !important",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <UserDistributionChart data={userStats} />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "row-reverse" }}
                  >
                    <Fab
                      size="small"
                      sx={{
                        right: 0,
                        backgroundColor: chartColors.success,
                        "&:hover": {
                          backgroundColor: alpha(chartColors.success, 0.85),
                        },
                      }}
                    >
                      <AddIcon sx={{ color: "#fff" }} />
                    </Fab>
                  </div>
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
                      <GroupIcon color="primary" />
                      <Typography variant="h6"> Storage Status</Typography>
                    </div>
                  }
                />
                <CardContent
                  sx={{
                    mb: "auto",
                    pb: "0 !important",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <StorageDistributionChart data={storageStats} />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "row-reverse" }}
                  >
                    <Fab
                      size="small"
                      sx={{
                        right: 0,
                        backgroundColor: chartColors.success,
                        "&:hover": {
                          backgroundColor: alpha(chartColors.success, 0.85),
                        },
                      }}
                    >
                      <AddIcon sx={{ color: "#fff" }} />
                    </Fab>
                  </div>
                </CardContent>
              </Card>
            </Grid>{" "}
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
                      <GroupIcon color="primary" />
                      <Typography variant="h6">
                        {" "}
                        Storage Distribution
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
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <LicenseDataChart
                      data={{
                        userStorage: storageStats.totalAllocated,
                        departmentStorage: getSortedDepartments().reduce(
                          (sum, dept) => sum + dept.storage,
                          0
                        ),
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "end" }}>
                      <Box
                        sx={{
                          gap: 0.5,
                          // backgroundColor: alpha(chartColors.error, 0.1),
                          padding: "8px 16px",
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          // border: `1px solid ${alpha(chartColors.error, 0.2)}`,
                          boxShadow: `0 0 8px ${alpha(chartColors.error, 0.2)}`,
                          "&:hover": {
                            backgroundColor: alpha(chartColors.error, 0.15),
                            transform: "translateY(-1px)",
                            boxShadow: `0 0 12px ${alpha(
                              chartColors.error,
                              0.3
                            )}`,
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: chartColors.error,
                            fontWeight: 500,
                          }}
                        >
                          {getRemainingDays() <= 30 ? "Renewal By" : "Validity"}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            color: chartColors.error,
                            fontWeight: 700,
                            lineHeight: 1,
                            fontSize: "2rem",
                          }}
                        >
                          {getRemainingDays()}
                        </Typography>
                        <Typography sx={{
                          color: chartColors.error,
                          fontWeight: 700,
                          lineHeight: 1,
                          fontSize: "1rem",
                        }}>Days</Typography>
                      </Box>
                      {getRemainingDays() === 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            backgroundColor: alpha(chartColors.error, 0.15),
                            padding: "8px 12px",
                            borderRadius: 2,
                            border: `1px solid ${alpha(
                              chartColors.error,
                              0.3
                            )}`,
                          }}
                        >
                          <WarningIcon sx={{ color: chartColors.error }} />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: chartColors.error, fontWeight: 600 }}
                            >
                              Account Block Warning
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: chartColors.error }}
                            >
                              {`Grace Period: -${negativeCount} Days (Max: -10 Days)`}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <BlockWarningDialog />
                    </div>
                  </div>
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
                  <DashboardIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Top User Storage Usage
                  </Typography>
                </Box>
                <Box>
                  {getSortedStorageUsers()
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
                              height: 4,
                              borderRadius: 2,
                              [`&.MuiLinearProgress-root`]: {
                                backgroundColor: alpha(
                                  chartColors.primary,
                                  0.12
                                ),
                              },
                              [`& .MuiLinearProgress-bar`]: {
                                borderRadius: 3,
                                backgroundColor: chartColors.primary,
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
                      </Box>
                    ))}
                  <TablePagination
                    component="div"
                    count={getSortedStorageUsers().length}
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
                  <DashboardIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Top Department Storage Usage
                  </Typography>
                </Box>
                <Box>
                  {getSortedDepartments()
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
                              ? alpha(chartColors.warning, 0.02)
                              : alpha(chartColors.warning, 0.06),
                          "&:hover": {
                            backgroundColor: alpha(chartColors.warning, 0.1),
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
                              color: chartColors.warning,
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
                            {`${dept.storage}GB`}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(dept.storage / 200) * 100}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              [`&.MuiLinearProgress-root`]: {
                                backgroundColor: alpha(
                                  chartColors.warning,
                                  0.12
                                ),
                              },
                              [`& .MuiLinearProgress-bar`]: {
                                borderRadius: 3,
                                backgroundColor: chartColors.warning,
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
                            color: chartColors.warning,
                            fontSize: "0.875rem",
                          }}
                        >
                          {`${Math.round((dept.storage / 200) * 100)}%`}
                        </Typography>
                      </Box>
                    ))}
                  <TablePagination
                    component="div"
                    count={getSortedDepartments().length}
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
    </Box>

  );
};

export default AngelBot;
