import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Grid, alpha } from "@mui/material";
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

const chartColors = {
  primary: "#1976d2",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  grey: "#9e9e9e",
  pending: "#757575", // Add this or use any other color you prefer
};

const commonPaperStyles = {
  p: 3,
  mb: 2,
  borderRadius: 2,
  boxShadow: "0 2px 12px 0 rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  },
};

const AngelBot = ({ onThemeToggle }) => {
  const [userPage, setUserPage] = useState(0);
  const [deptPage, setDeptPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(5);
  const [deptRowsPerPage, setDeptRowsPerPage] = useState(5);

  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
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

  const handleUserPageChange = (event, newPage) => {
    setUserPage(newPage);
  };

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
      label: "Active Users",
      color: chartColors.success,
    },
    {
      value: userStats.inactiveUsers,
      label: "Inactive Users",
      color: chartColors.warning,
    },
    {
      value: userStats.pendingUsers,
      label: "Pending Users",
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

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        height: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: 0,
          transition: "margin-left 0.3s",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
          <Navbar onThemeToggle={onThemeToggle} />
        </Box>
        <Box
          sx={{
            p: 3,
            marginLeft: "50px",
            paddingBottom: "2rem",
            overflowY: "auto",
            height: "calc(100vh - 64px)",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  ...commonPaperStyles,
                  height: "100%", // Add this to make all boxes the same height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}
                >
                  <GroupIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    User Distribution
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 150,
                    width: "100%",
                    position: "relative",
                    mb: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: gaugeData,
                        innerRadius: 50,
                        outerRadius: 75,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        startAngle: -90,
                        endAngle: 90,
                        cx: 120,
                        cy: 100,
                      },
                    ]}
                    width={200}
                    height={150}
                    legend={{ hidden: true }}
                    sx={{
                      "& .MuiChartsLegend-root": {
                        transform: "scale(0.9)",
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    mb: 1,
                    // alignItems: 'center'
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: chartColors.success,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="body2">Active Users</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: chartColors.warning,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="body2">Inactive Users</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: chartColors.grey,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="body2">Pending Users</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <StatCard
                    icon={PersonIcon}
                    title="Active Users"
                    value={userStats.activeUsers}
                    color={chartColors.success}
                    bgColor={alpha(chartColors.success, 0.04)}
                  />
                  <StatCard
                    icon={PersonIcon}
                    title="Pending Users"
                    value={userStats.pendingUsers}
                    color={chartColors.grey}
                    bgColor={alpha(chartColors.grey, 0.04)}
                  />
                  <StatCard
                    icon={PersonIcon}
                    title="Inactive Users"
                    value={userStats.inactiveUsers}
                    color={chartColors.warning}
                    bgColor={alpha(chartColors.warning, 0.04)}
                  />
                  <StatCard
                    icon={GroupIcon}
                    title="Total Users"
                    value={userStats.totalUsers}
                    color={chartColors.primary}
                    bgColor={alpha(chartColors.primary, 0.04)}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Storage Distribution Section */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  ...commonPaperStyles,
                  height: "100%", // Add this to make all boxes the same height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}
                >
                  <StorageIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Storage Distribution
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 150,
                    width: "100%",
                    position: "relative",
                    mb: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: [
                          {
                            value: storageStats.totalUsed,
                            label: "Used Storage",
                            color: chartColors.primary,
                          },
                          {
                            value: storageStats.totalUnused,
                            label: "Unused Storage",
                            color: chartColors.grey,
                          },
                        ],
                        innerRadius: 50,
                        outerRadius: 75,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        startAngle: -90,
                        endAngle: 90,
                        cx: 120,
                        cy: 100,
                      },
                    ]}
                    width={200}
                    height={150}
                    legend={{ hidden: true }}
                    sx={{
                      "& .MuiChartsLegend-root": {
                        transform: "scale(0.9)",
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    mb: 1,
                    // alignItems: 'center'
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: chartColors.primary,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="body2">Used Storage</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: chartColors.grey,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="body2">Unused Storage</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <StatCard
                    icon={StorageIcon}
                    title="Used Storage"
                    value={`${storageStats.totalUsed}GB`}
                    color={chartColors.success}
                    bgColor={alpha(chartColors.success, 0.04)}
                  />
                  <StatCard
                    icon={StorageIcon}
                    title="Unused Storage"
                    value={`${storageStats.totalUnused}GB`}
                    color={chartColors.grey}
                    bgColor={alpha(chartColors.grey, 0.04)}
                  />
                  <StatCard
                    icon={StorageIcon}
                    title="Total Storage Allocated"
                    value={`${storageStats.totalAllocated}GB`}
                    color={chartColors.primary}
                    bgColor={alpha(chartColors.primary, 0.04)}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* License Expiry Section */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  ...commonPaperStyles,
                  height: "100%", // Add this to make all boxes the same height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}
                >
                  <AccessTimeIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    License Expiry Timeline
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 180,
                    width: "100%",
                    position: "relative",
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    overflow: "visible",
                  }}
                >
                  <LineChart
                    xAxis={[
                      {
                        data: expiryData.days,
                        label: "Days to Expiry",
                        tickMinStep: 15,
                        scaleType: "linear",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Number of Licenses",
                        min: 0,
                        position: "left",
                      },
                    ]}
                    series={[
                      {
                        data: expiryData.licenses,
                        label: "Expiring Licenses",
                        color: chartColors.warning,
                        curve: "linear",
                      },
                    ]}
                    width={300}
                    height={180}
                    margin={{
                      left: 60,
                      right: 20,
                      top: 20,
                      bottom: 40,
                    }}
                    sx={{
                      ".MuiLineElement-root": {
                        strokeWidth: 2,
                      },
                      ".MuiChartsAxis-label": {
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <StatCard
                    icon={AccessTimeIcon}
                    title="Expiring in 30 days"
                    value="12"
                    color={chartColors.warning}
                    bgColor={alpha(chartColors.warning, 0.04)}
                  />
                  <StatCard
                    icon={AccessTimeIcon}
                    title="Expired Licenses"
                    value="5"
                    color={chartColors.error}
                    bgColor={alpha(chartColors.error, 0.04)}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid container spacing={6}>
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
                      Top User Storage Usage
                    </Typography>
                  </Box>

                  <Box>
                    {getSortedStorageUsers()
                      .slice(
                        // page * rowsPerPage,
                        // page * rowsPerPage + rowsPerPage
                        userPage * userRowsPerPage,
                        userPage * userRowsPerPage + userRowsPerPage
                      )
                      .map((user, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor:
                              index % 2 === 0
                                ? "transparent"
                                : alpha("#000", 0.02),
                            "&:hover": {
                              backgroundColor: alpha("#000", 0.04),
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 150, fontWeight: 500 }}
                          >
                            {user.name}
                          </Typography>
                          <Box sx={{ flex: 1, mx: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (user.storageUsed / user.storageAllocated) * 100
                              }
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(
                                  chartColors.primary,
                                  0.12
                                ),
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: chartColors.primary,
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 100,
                              textAlign: "right",
                              color: "text.secondary",
                            }}
                          >
                            {`${user.storageUsed}/${user.storageAllocated}GB`}
                          </Typography>
                        </Box>
                      ))}
                    <TablePagination
                      component="div"
                      count={getSortedStorageUsers().length}
                      // page={page}
                      page={userPage}
                      // onPageChange={handleChangePage}
                      onPageChange={handleUserPageChange}
                      // rowsPerPage={rowsPerPage}
                      rowsPerPage={userRowsPerPage}
                      // onRowsPerPageChange={handleChangeRowsPerPage}
                      onRowsPerPageChange={handleUserRowsPerPageChange}
                      rowsPerPageOptions={[5, 10, 15]}
                      sx={{
                        mt: 2,
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
                            p: 2,
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor:
                              index % 2 === 0
                                ? "transparent"
                                : alpha("#000", 0.02),
                            "&:hover": {
                              backgroundColor: alpha("#000", 0.04),
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ minWidth: 150, fontWeight: 500 }}
                          >
                            {dept.name}
                          </Typography>
                          <Box sx={{ flex: 1, mx: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(dept.storage / 200) * 100} // Assuming 200GB is max storage
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(
                                  chartColors.primary,
                                  0.12
                                ),
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: chartColors.primary,
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 100,
                              textAlign: "right",
                              color: "text.secondary",
                            }}
                          >
                            {`${dept.storage}GB`}
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
                        mt: 2,
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
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AngelBot;
