import { Add, Dashboard, Group, Warning } from "@mui/icons-material";
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
  MenuItem
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

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
    return "#FF7F50"
  } else if (percentage > 30) {
    return "#4caf50";
  } else {
    return "rgb(255, 193, 7)";
  }
};

const AngelBot = () => {
  const [negativeCount, setNegativeCount] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showBlockWarning, setShowBlockWarning] = useState(false);
  const [licenseExpiryDate] = useState(new Date("2025-12-31")); // Replace with your actual expiry date
  const defaultStatusData = [
    { value: 500, name: "Used", color: "#91CC75" },
    { value: 484, name: "Available", color: "#5470C6" },
  ];

  const defaultDistributionData = [
    { value: 500, name: "User", color: "#FAC858" },
    { value: 484, name: "Department", color: "#5470C6" },
  ];

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
  ]);

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
  }, [licenseExpiryDate]);

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
        return `${name} ${(item.value)}`;
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
          formatter: "{d}%", // Shows percent inside each slice
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
          formatter: "{d}%", // Shows percent inside each slice
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

    if (selectedChart === name) {
      // Already selected -> reset to default
      setStorageStatusData(defaultStatusData);
      setStorageDistributionData(defaultDistributionData);
      setSelectedChart(null);
      setBackButton(false);
      return;
    }

    // Chart config
    const chartConfig = {
      Pending: {
        storageStatusData: [
          { value: 10000, name: "Used", color: "#91CC75" },
          { value: 15000, name: "Available", color: "#FAC858" },
        ],
        storageDistributionData: [
          { value: 12400, name: "User", color: "#91CC75" },
          { value: 20000, name: "Department", color: "#FAC858" },
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
    }
  };

  const handleBack = () => {
    setStorageStatusData(defaultStatusData);
    setStorageDistributionData(defaultDistributionData);
    setSelectedChart(null);
    setBackButton(false);
  };

  // const getSortedStorageUsers = [
  //   { id: 1, name: "User1", storageUsed: 200, storageAllocated: 200 },
  //   { id: 1, name: "User2", storageUsed: 250, storageAllocated: 300 },
  //   { id: 1, name: "User3", storageUsed: 150, storageAllocated: 200 },
  //   { id: 1, name: "User4", storageUsed: 30, storageAllocated: 100 },
  //   { id: 1, name: "User5", storageUsed: 40, storageAllocated: 200 },
  //   { id: 1, name: "User6", storageUsed: 150, storageAllocated: 250 },
  //   { id: 1, name: "User7", storageUsed: 150, storageAllocated: 200 },
  //   { id: 1, name: "User8", storageUsed: 300, storageAllocated: 500 },
  // ];

  const getSortedDepartments = [
    { id: 1, name: "IT", storage: 100, storageAllocated: 200 },
    { id: 2, name: "Engineering", storage: 200, storageAllocated: 300 },
    { id: 3, name: "Operations", storage: 150, storageAllocated: 200 },
    { id: 14, name: "Marketing", storage: 50, storageAllocated: 100 },
    { id: 145, name: "Sales", storage: 120, storageAllocated: 200 },
    { id: 17, name: "Finance", storage: 150, storageAllocated: 250 },
    { id: 18, name: "HR", storage: 150, storageAllocated: 200 },
  ];

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
                }
              }
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
                      <Group color="primary" />
                      <Typography variant="h6">License Status</Typography>
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      // flexDirection: "row-reverse",
                    }}
                  >
                    <div>
                      {backButton && (
                        <Button
                          sx={{
                            right: 0,
                            backgroundColor: "#3f51b5",
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: "#3f51b5",
                              color: "#fff",
                            },
                          }}
                          onClick={() => handleBack(false)}
                        >
                          Back
                        </Button>
                      )}
                    </div>
                    <IconButton
                      sx={{
                        // right: 0,
                        backgroundColor: "#3f51b5",
                        "&hover": {
                          backgroundColor: "#3f51b5",
                          color: "#fff",
                        },
                      }}
                      size="medium"
                    >
                      <Add sx={{ color: "#fff" }} />
                    </IconButton>
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
                      <Group color="primary" />
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
                    <ReactECharts
                      option={storageStatus}
                      style={{ height: 300, width: "100%" }}
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "row-reverse" }}
                  >
                    <Fab
                      size="small"
                      sx={{
                        right: 0,
                        backgroundColor: "#3f51b5",
                        "&hover": {
                          backgroundColor: "#3f51b5",
                          color: "#fff",
                        },
                      }}
                    >
                      <Add sx={{ color: "#fff" }} />
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
                      <Group color="primary" />
                      <Typography variant="h6">Storage Distribution</Typography>
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
                    <ReactECharts
                      option={storageDistribution}
                      style={{ height: 300, width: "100%" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: "-60px",
                      flexDirection: "row-reverse",
                    }}
                  >
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
                      <Typography
                        sx={{
                          color: chartColors.error,
                          fontWeight: 700,
                          lineHeight: 1,
                          fontSize: "1rem",
                        }}
                      >
                        Days
                      </Typography>
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
                          border: `1px solid ${alpha(chartColors.error, 0.3)}`,
                        }}
                      >
                        <Warning sx={{ color: chartColors.error }} />
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
                    Top User Storage Usage
                  </Typography>
                </Box>
                <FormControl size="small">
                  <Select
                    value={userSortOption}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserSortOption(value);
                      sortUsers(value); // Call sort logic
                    }}
                  >
                    <MenuItem value="high">High Usage</MenuItem>
                    <MenuItem value="low">Low Usage</MenuItem>
                    <MenuItem value="az">A-Z</MenuItem>
                    <MenuItem value="za">Z-A</MenuItem>
                  </Select>
                </FormControl>
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
                                backgroundColor: getProgressBarColor((user.storageUsed / user.storageAllocated) * 100),
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
                    Top Department Storage Usage
                  </Typography>
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
                              height: 10,
                              borderRadius: 2,
                              [`&.MuiLinearProgress-root`]: {
                                backgroundColor: alpha(
                                  chartColors.warning,
                                  0.12
                                ),
                              },
                              [`& .MuiLinearProgress-bar`]: {

                                borderRadius: 3,
                                backgroundColor: getProgressBarColor((dept.storage / 200) * 100),
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
    </Box>

  );
};

export default AngelBot;
