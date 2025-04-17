import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
// Add these imports for table functionality
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button,
  Checkbox
} from '@mui/material';
import TableSortLabel from '@mui/material/TableSortLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RenewIcon from '@mui/icons-material/Autorenew';
import ExtendIcon from '@mui/icons-material/CalendarMonth';
import ChangeIcon from '@mui/icons-material/SwapHoriz';
import AddLicenseIcon from '@mui/icons-material/AddCircle';
import StorageIcon from '@mui/icons-material/Storage';
import { useState, useEffect } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const CompanyDashboard = ({ onThemeToggle }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('daysLeft');
  const [sortedData, setSortedData] = useState(null);
  const companyData = {
    dataUsage: [
      {
        shortName: "C1",
        company: "TechCorp (Enterprise)",
        sold: 3000, // 2TB in GB
        actual: 1000, // 1.5TB in GB
        consumed: 717, // 0.7TB in GB
      },
      {
        shortName: "C2",
        company: "InfoSys (Premium)",

        sold: 9216, // 9TB in GB
        actual: 6144, // 6TB in GB
        consumed: 2048, // 2TB in GB
      },
      {
        shortName: "C3",
        company: "DataTech (Standard)",
        sold: 7168, // 7TB in GB
        actual: 4096, // 4TB in GB
        consumed: 1024, // 1TB in GB
      },
      {
        shortName: "C4",
        company: "CloudNet (Basic)",
        sold: 4096, // 4TB in GB
        actual: 3072, // 3TB in GB
        consumed: 2048, // 2TB in GB
      },
    ],
    licenseAllocation: [
      {
        company: "TechCorp (Enterprise)",
        allocated: 350, // Total licenses allocated
        consumed: 70, // Licenses consumed
      },
      {
        company: "InfoSys (Premium)",
        allocated: 175,
        consumed: 50,
      },
      {
        company: "DataTech (Standard)",
        allocated: 150,
        consumed: 130,
      },
      {
        company: "CloudNet (Basic)",
        allocated: 95,
        consumed: 45,
      },
    ],
    licenseExpiration: [
      {
        company: "TechCorp (Enterprise)",
        shortName: "C1",
        daysLeft: 25,
      },
      {
        company: "InfoSys (Premium)",
        shortName: "C2",
        daysLeft: 30,
      },
      {
        company: "DataTech (Standard)",
        shortName: "C3",
        daysLeft: -180,
      },
      {
        company: "CloudNet (Basic)",
        shortName: "C4",
        daysLeft: 180,
      },
    ],
    costServer: {
      server1: {
        capacity: 10240, // 10TB in GB
        companies: ["C1", "C2"],
        allocated: 7144, // Sum of C1 & C2 actual allocation (1000 + 6144 = 7144)
        consumed: 2765, // Sum of C1 & C2 consumed (717 + 2048)
      },
      server2: {
        capacity: 20480, // 20TB in GB
        companies: ["C3", "C4"],
        allocated: 7168, // Sum of C3 & C4 actual allocation (4096 + 3072 = 7168)
        consumed: 3072, // Sum of C3 & C4 consumed (1024 + 2048)
      },
    },
  };
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    
    setOrder(newOrder);
    setOrderBy(property);
    
    const companies = [...companyData.dataUsage].sort((a, b) => {
      // For string properties like company name
      if (property === 'company') {
        return newOrder === 'asc'
          ? a.company.localeCompare(b.company)
          : b.company.localeCompare(a.company);
      }
      
      // For numeric properties
      if (property === 'sold') {
        return newOrder === 'asc'
          ? a.sold - b.sold
          : b.sold - a.sold;
      }
      
      if (property === 'actual') {
        return newOrder === 'asc'
          ? a.actual - b.actual
          : b.actual - a.actual;
      }
      
      if (property === 'consumed') {
        return newOrder === 'asc'
          ? a.consumed - b.consumed
          : b.consumed - a.consumed;
      }
      
      if (property === 'consumed_percent') {
        const percentA = (a.consumed / a.actual) * 100;
        const percentB = (b.consumed / b.actual) * 100;
        return newOrder === 'asc'
          ? percentA - percentB
          : percentB - percentA;
      }
      
      if (property === 'daysLeft') {
        const expiryA = companyData.licenseExpiration.find(item => item.shortName === a.shortName);
        const expiryB = companyData.licenseExpiration.find(item => item.shortName === b.shortName);
        if (expiryA && expiryB) {
          return newOrder === 'asc'
            ? expiryA.daysLeft - expiryB.daysLeft
            : expiryB.daysLeft - expiryA.daysLeft;
        }
        return 0;
      }
      
      return 0;
    });
    
    setSortedData({
      companies: companies,
      indices: companies.map(c =>
        companyData.dataUsage.findIndex(orig => orig.shortName === c.shortName)
      )
    });
  };
  
  // Default sorting on initial load
  useEffect(() => {
    handleRequestSort(null, 'daysLeft');
  }, []);
  
  // Handle selecting all companies
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCompanies(companyData.dataUsage.map(c => c.shortName));
    } else {
      setSelectedCompanies([]);
    }
  };
  
  // Handle selecting individual company
  const handleSelectCompany = (event, shortName) => {
    if (event.target.checked) {
      setSelectedCompanies(prev => [...prev, shortName]);
    } else {
      setSelectedCompanies(prev => prev.filter(c => c !== shortName));
    }
  };
  
  const isAllSelected = companyData.dataUsage.length > 0 &&
    selectedCompanies.length === companyData.dataUsage.length;
 


  const chartConfigs = {
    dataUsage: {
      labels: companyData.dataUsage.map((item) => item.shortName),
      datasets: [
        {
          label: "Consumed Storage",
          data: companyData.dataUsage.map(
            (item) => Math.round(item.consumed / 1024) // Remove decimals
          ),
          backgroundColor: companyData.dataUsage.map((item, index) =>
            // Even numbered companies (index 1, 3) get gold color, odd get blue
            index % 2 === 1 ? "rgb(84,112,198)" : "rgb(250,200,88)"
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
        {
          label: "Actually Allocated",
          data: companyData.dataUsage.map(
            (item) => Math.round((item.actual - item.consumed) / 1024) // Remove decimals
          ),
          backgroundColor: companyData.dataUsage.map((item, index) =>
            // Even numbered companies get lighter gold, odd get lighter blue
            index % 2 === 1 ? "rgba(84,112,198,0.22)" : "rgba(250,200,88,0.43)"
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
        {
          label: "Sold Storage",
          data: companyData.dataUsage.map(
            (item) => Math.round((item.sold - item.actual) / 1024) // Remove decimals
          ),
          backgroundColor: "#F1EFEC", // Keeping gray for all companies
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
      ],
    },
    // Update the licenseAllocation configuration
    licenseAllocation: {
      labels: companyData.licenseAllocation.map(
        (item, index) => `C${index + 1}`
      ),
      datasets: [
        {
          label: "Consumed (%)",
          data: companyData.licenseAllocation.map((item) =>
            ((item.consumed / item.allocated) * 100).toFixed(1)
          ),
          backgroundColor: companyData.licenseAllocation.map((item, index) =>
            // Even numbered companies (index 1, 3) get gold color, odd get blue
            index % 2 === 1 ? "#8fc7c1" : "#eb34e5"
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
        {
          label: "Allocated (Total)",
          data: companyData.licenseAllocation.map((item) => 100), // Always 100%,
          backgroundColor: companyData.licenseAllocation.map((item, index) =>
            // Even numbered companies get lighter gold, odd get lighter blue
            index % 2 === 1 ? "#c0ede8" : "#e897e5"
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
      ],
    },
    // Update the licenseExpiration config in chartConfigs
    // This is already in your code but ensure it's correctly set up
    licenseExpiration: {
      labels: companyData.licenseExpiration.map((item) => item.shortName),
      datasets: [
        {
          label: "Days Until Expiry",
          data: companyData.licenseExpiration.map((item) => item.daysLeft),
          backgroundColor: companyData.licenseExpiration.map((item) => {
            if (item.daysLeft < 0) {
              return "#FF0000"; // Red for expired
            } else if (item.daysLeft < 30) {
              return "#FF6B00"; // Orange for immediate action
            } else if (item.daysLeft < 45) {
              return "#FFD700"; // Yellow for critical
            } else {
              return "#4CAF50"; // Green for good
            }
          }),
          borderWidth: 0,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
        },
      ],
    },
    costServer: {
      labels: ["Server 1 (10TB)", "Server 2 (20TB)"],
      datasets: [
        {
          label: "Consumed Storage",
          data: [
            Math.round(companyData.costServer.server1.consumed / 1024),
            Math.round(companyData.costServer.server2.consumed / 1024),
          ],
          backgroundColor: ["#39ab2c", "#c2410a"],
          barPercentage: 0.7,
          categoryPercentage: 0.9,
        },
        {
          label: "Allocated",
          data: [
            Math.round(
              (companyData.costServer.server1.allocated -
                companyData.costServer.server1.consumed) /
                1024
            ),
            Math.round(
              (companyData.costServer.server2.allocated -
                companyData.costServer.server2.consumed) /
                1024
            ),
          ],
          backgroundColor: ["#7abf73", "#e67849"],
          barPercentage: 0.7,
          categoryPercentage: 0.9,
        },
        {
          label: "Available Capacity",
          data: [
            Math.round(
              (companyData.costServer.server1.capacity -
                companyData.costServer.server1.allocated) /
                1024
            ),
            Math.round(
              (companyData.costServer.server2.capacity -
                companyData.costServer.server2.allocated) /
                1024
            ),
          ],
          backgroundColor: "#F1EFEC",
          barPercentage: 0.7,
          categoryPercentage: 0.9,
        },
      ],
    },
  };

  const stackedHorizontalOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          font: { size: 12 },
        },
      },
      // Disable datalabels for this chart specifically
      datalabels: {
        display: false, // This prevents labels from showing inside bars
      },
      tooltip: {
        mode: "nearest",
        intersect: true,
        callbacks: {
          title: function (context) {
            const dataIndex = context[0].dataIndex;
            return companyData.dataUsage[dataIndex].company;
          },
          label: function (context) {
            const datasetLabel = context.dataset.label;
            const dataIndex = context.dataIndex;
            const dataPoint = companyData.dataUsage[dataIndex];

            if (datasetLabel === "Sold Storage") {
              const tbValue = Math.round(dataPoint.sold / 1024);
              return `Sold: ${tbValue} TB`;
            }

            if (datasetLabel === "Actually Allocated") {
              const allocatedTB = Math.round(dataPoint.actual / 1024);
      
              return `Allocated: ${allocatedTB} TB `;
            }

            if (datasetLabel === "Consumed Storage") {
              const consumedTB = Math.round(dataPoint.consumed / 1024);
              const percentage = Math.round(
                (dataPoint.consumed / dataPoint.actual) * 100
              );
              return `Consumed: ${consumedTB} TB (${percentage}% )`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Storage Usage (TB)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          callback: function (value) {
            const fixedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            return fixedValues.includes(value) ? `${value}` : "";
          },
          stepSize: 1,
          font: {
            size: 12,
            weight: "bold",
          },
        },
        min: 0,
        max: 10,
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };

  const licenseChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        mode: "nearest",
        intersect: true,
        callbacks: {
          title: function (context) {
            const dataIndex = context[0].dataIndex;
            return companyData.licenseAllocation[dataIndex].company;
          },
          label: function (context) {
            const datasetLabel = context.dataset.label;
            const dataIndex = context.dataIndex;
            const dataPoint = companyData.licenseAllocation[dataIndex];

            if (datasetLabel === "Allocated (Total)") {
          
              const consumedPercentage = (
                (dataPoint.consumed / dataPoint.allocated) *
                100
              ).toFixed(1);
              const remainingPercentage = (100 - consumedPercentage).toFixed(1);
              return `Allocated: ${dataPoint.allocated} / ${remainingPercentage}%`;
            }

            if (datasetLabel === "Consumed (%)") {
              const percentage = (
                (dataPoint.consumed / dataPoint.allocated) *
                100
              ).toFixed(1);
              return `Consumed: ${dataPoint.consumed}  (${percentage}%)`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "License Usage (%)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          callback: (value) => `${value}%`, // Add percentage symbol to x-axis ticks
          font: {
            size: 12,
            weight: "bold",
          },
        },
        min: 0,
        max: 100, // Maximum percentage
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };
  // Add after existing options configurations

  // Update the licenseExpiryOptions to handle negative days
  const licenseExpiryOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        mode: "nearest",
        intersect: true,
        callbacks: {
          title: function (context) {
            const dataIndex = context[0].dataIndex;
            return companyData.licenseExpiration[dataIndex].company;
          },
          label: function (context) {
            const dataIndex = context.dataIndex;
            const dataPoint = companyData.licenseExpiration[dataIndex];

            let status;
            if (dataPoint.daysLeft < 0) {
              status = "EXPIRED";
            } else if (dataPoint.daysLeft < 30) {
              status = "IMMEDIATE ACTION REQUIRED";
            } else if (dataPoint.daysLeft < 45) {
              status = "CRITICAL";
            } else {
              status = "GOOD";
            }

            let daysText;
            if (dataPoint.daysLeft < 0) {
              daysText = `Expired ${Math.abs(dataPoint.daysLeft)} days ago`;
            } else {
              daysText = `${dataPoint.daysLeft} days remaining`;
            }

            return [`Status: ${status}`, daysText];
          },
        },
      },
      datalabels: {
        align: function (context) {
          const value = context.dataset.data[context.dataIndex];
          // For negative values, position label in center or with more space
          return value < 0 ? "center" : "start";
        },
        anchor: function (context) {
          const value = context.dataset.data[context.dataIndex];
          // For negative values, use 'center' anchor to ensure visibility
          return value < 0 ? "center" : "center";
        },
        clamp: true,
        color: "white",
        font: {
          weight: "bold",
          size: 11, // Slightly smaller font for better fit
        },
        formatter: function (value, context) {
          const shortName =
            companyData.licenseExpiration[context.dataIndex].shortName;

          // For negative values like C3, show just the code to save space
          if (value < 0) {
            return `${shortName}`; // Just show C3 without the days
          }
          return `${shortName}`;
        },
        padding: {
          top: 4,
          bottom: 4,
          left: 8,
          right: 8,
        },
        display: true, // Always display the labels
      },
    },
    scales: {
      x: {
        position: "top", // Show days on top
        display: true, // Show x-axis
        grid: {
          display: true, // Show vertical grid lines
          color: function (context) {
            // Make the zero line more prominent
            return context.tick.value === 0
              ? "rgba(0,0,0,0.3)"
              : "rgba(0,0,0,0.1)";
          },
          lineWidth: function (context) {
            // Make the zero line thicker
            return context.tick.value === 0 ? 2 : 1;
          },
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false,
          tickLength: 0,
          z: 1, // Ensure grid is behind bars
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "bold",
          },
          callback: function (value) {
            // Show ticks at specific intervals with more granularity
            const showValues = [-30, -15, 0, 15, 30, 45, 60, 90, 180];
            if (showValues.includes(value)) {
              return value;
            }
            return "";
          },
          color: "#666",
          padding: 10,
        },
        min: -30,
        max: 180,
        offset: false,
      },
      y: {
        display: false, // Hide y-axis
        grid: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 50, // Increased right padding to ensure labels fit
        top: 30,
        bottom: 10,
      },
    },
    // Set a fixed height for each bar
    barThickness: 30,
  };
  // Update the costServerOptions tooltip configuration
  // Update the costServerOptions to show company labels inside bars and individual data on hover
  const costServerOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          font: { size: 12 },
          // Custom legend labels
          generateLabels: function (chart) {
            const datasets = chart.data.datasets;
            return [
              {
                text: `C1/C3 Storage`,
                fillStyle: datasets[0].backgroundColor[0],
                strokeStyle: datasets[0].backgroundColor[0],
                lineWidth: 0,
                hidden: false,
                index: 0,
                datasetIndex: 0,
              },
              {
                text: `C2/C4 Storage`,
                fillStyle: datasets[1].backgroundColor[0],
                strokeStyle: datasets[1].backgroundColor[0],
                lineWidth: 0,
                hidden: false,
                index: 1,
                datasetIndex: 1,
              },
              {
                text: "Available Capacity",
                fillStyle: datasets[2].backgroundColor,
                strokeStyle: datasets[2].backgroundColor,
                lineWidth: 0,
                hidden: false,
                index: 2,
                datasetIndex: 2,
              },
            ];
          },
        },
      },
      datalabels: {
        display: true, // Show all labels including Available
        color: function (context) {
          // Use dark text for the lighter "Available" bar
          return context.datasetIndex === 2 ? "#666666" : "white";
        },
        font: {
          weight: "bold",
          size: 11,
        },
        formatter: function (value, context) {
          // Get server details
          const serverKey = context.dataIndex === 0 ? "server1" : "server2";
          const serverData = companyData.costServer[serverKey];

          // Get companies for this server
          const companies = serverData.companies;

          // For Consumed Storage segment, show first company code
          if (context.datasetIndex === 0) {
            return companies[0]; // C1 for server1, C3 for server2
          }

          // For Allocated But Unused segment, show second company code
          if (context.datasetIndex === 1) {
            return companies[1]; // C2 for server1, C4 for server2
          }

          // For Available Capacity segment, show "Available" text
          if (context.datasetIndex === 2) {
            return "Available";
          }

          return "";
        },
        anchor: "center",
        align: "center",
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            return ""; // Empty title, focus on label information
          },
          label: function (context) {
            const datasetLabel = context.dataset.label;
            const value = context.raw;

            // Get server details
            const serverKey = context.dataIndex === 0 ? "server1" : "server2";
            const serverData = companyData.costServer[serverKey];

            // Get companies for this server
            const companies = serverData.companies;

            if (datasetLabel === "Consumed Storage") {
              // Show first company (C1 or C3) with allocation and consumption percentage
              const company = companies[0];
              const companyInfo = companyData.dataUsage.find(
                (c) => c.shortName === company
              );

              if (companyInfo) {
                // Calculate allocated TB and percentage
                const allocatedTB = Math.round(companyInfo.actual / 1024);
                const consumedPercentage = Math.round(
                  (companyInfo.consumed / companyInfo.actual) * 100
                );
                return `${company}: ${allocatedTB}TB / ${consumedPercentage}%`;
              }
              return `${company}: Data not available`;
            }

            if (datasetLabel === "Allocated") {
              // Show second company (C2 or C4) with allocation and consumption percentage
              const company = companies[1];
              const companyInfo = companyData.dataUsage.find(
                (c) => c.shortName === company
              );

              if (companyInfo) {
                // Calculate allocated TB and percentage
                const allocatedTB = Math.round(companyInfo.actual / 1024);
                const consumedPercentage = Math.round(
                  (companyInfo.consumed / companyInfo.actual) * 100
                );
                return `${company}: ${allocatedTB}TB / ${consumedPercentage}%`;
              }
              return `${company}: Data not available`;
            }

            if (datasetLabel === "Available Capacity") {
              const availableTB = Math.round(
                (serverData.capacity - serverData.allocated) / 1024
              );
              // Show both companies and the available capacity
          
     

              // Create multiline tooltip with all information
              return [`Available: ${availableTB}TB`];
            }

            return `${value}TB`;
          },
        },
      },
    },
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Storage (TB)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          callback: function (value) {
            return value + " TB";
          },
          stepSize: 5,
          font: {
            size: 12,
            weight: "bold",
          },
        },
        max: 20,
      },
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    // Add layout padding for better appearance
    layout: {
      padding: {
        top: 20,
        bottom: 10,
      },
    },
  };
  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: "48px",
          transition: "margin-left 0.3s",
          overflow: "hidden",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#121212" : "#f5f7fa",
        }}
      >
        <Navbar onThemeToggle={onThemeToggle} />
        <Box
          sx={{
            p: 0,
            marginLeft: "0px",
            overflow: "auto",
            height: "calc(100vh - 48px)",
            px: { xs: 2, md: 3 },
            py: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "inherit",
                display: "inline-block",
              }}
            >
              Company Dashboard
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Additional dashboard controls could go here */}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* First Graph: Data Usage */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "#2c3e50",
                    borderBottom: "2px solid #e0e0e0",
                    paddingBottom: 1,
                  }}
                >
                  Storage Usage Analysis
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <Bar
                    options={stackedHorizontalOptions}
                    data={chartConfigs.dataUsage}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Second Graph: License Allocation */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "#2c3e50",
                    borderBottom: "2px solid #e0e0e0",
                    paddingBottom: 1,
                  }}
                >
                  License Allocation and Usage
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <Bar
                    options={licenseChartOptions}
                    data={chartConfigs.licenseAllocation}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Third Graph: License Expiration */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1, // Reduced to make room for legend
                    fontWeight: "bold",
                    color: "#2c3e50",
                    borderBottom: "2px solid #e0e0e0",
                    paddingBottom: 1,
                  }}
                >
                  License Expiration Status
                </Typography>

                {/* Color Legend */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#FF0000",
                        mr: 0.5,
                        borderRadius: "2px",
                      }}
                    ></Box>
                    <Typography variant="caption" sx={{ fontWeight: "medium" }}>
                      Expired
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#FF6B00",
                        mr: 0.5,
                        borderRadius: "2px",
                      }}
                    ></Box>
                    <Typography variant="caption" sx={{ fontWeight: "medium" }}>
                      &lt;30 days
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#FFD700",
                        mr: 0.5,
                        borderRadius: "2px",
                      }}
                    ></Box>
                    <Typography variant="caption" sx={{ fontWeight: "medium" }}>
                      30-45 days
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#4CAF50",
                        mr: 0.5,
                        borderRadius: "2px",
                      }}
                    ></Box>
                    <Typography variant="caption" sx={{ fontWeight: "medium" }}>
                      &gt;45 days
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ height: 280, position: "relative" }}>
                  <Bar
                    options={licenseExpiryOptions}
                    data={chartConfigs.licenseExpiration}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Fourth Graph: Cost Server Analysis */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "#2c3e50",
                    borderBottom: "2px solid #e0e0e0",
                    paddingBottom: 1,
                  }}
                >
                  Costa Server
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <Bar
                    options={costServerOptions}
                    data={chartConfigs.costServer}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
          // Add this after the Grid container with the charts
<Box sx={{ mt: 4 }}>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Typography
      variant="h5"
      sx={{
        fontWeight: "bold",
        color: "#2c3e50",
        borderBottom: "2px solid #e0e0e0",
        paddingBottom: 1,
      }}
    >
      Company Storage & License Summary
    </Typography>
  </Box>
  
  <TableContainer component={Paper} elevation={3} sx={{
    overflow: "auto",
    borderRadius: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    }
  }}>
    <Table sx={{ minWidth: 650 }} size="medium">
      <TableHead>
        {/* First row - main headers and Storage group header */}
        <TableRow sx={{ backgroundColor: "#f5f7fa", height: 40 }}>
          {/* Organization Column with checkbox */}
          <TableCell
            rowSpan={2}
            sx={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "16px"
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={isAllSelected}
                onChange={handleSelectAll}
                indeterminate={selectedCompanies.length > 0 && selectedCompanies.length < companyData.dataUsage.length}
                sx={{ p: 0, mr: 1 }}
              />
              <TableSortLabel
                active={orderBy === 'company'}
                direction={order}
                onClick={() => handleRequestSort(null, 'company')}
                sx={{
                  fontWeight: "bold",
                  width: "100%",
                  '& .MuiTableSortLabel-icon': {
                    opacity: 1,
                    color: 'rgba(0, 0, 0, 0.54)'
                  }
                }}
              >
                Organization
              </TableSortLabel>
            </Box>
          </TableCell>

          {/* Storage group header */}
          <TableCell
            colSpan={4}
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#2c3e50",
              borderBottom: "1px solid #e0e0e0",
              padding: "6px",
            }}
          >
            Storage (TB)
          </TableCell>

          {/* Renew By Column */}
          <TableCell
            rowSpan={2}
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "16px"
            }}
          >
            <TableSortLabel
              active={orderBy === 'daysLeft'}
              direction={order}
              onClick={() => handleRequestSort(null, 'daysLeft')}
              sx={{
                fontWeight: "bold",
                '& .MuiTableSortLabel-icon': {
                  opacity: 1,
                  color: 'rgba(0, 0, 0, 0.54)'
                }
              }}
            >
              Renew By
            </TableSortLabel>
          </TableCell>

          {/* % License Used Column */}
          <TableCell
            rowSpan={2}
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "16px"
            }}
          >
            % License Used
          </TableCell>

          {/* Actions Column */}
          <TableCell
            rowSpan={2}
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "16px"
            }}
          >
            Actions
          </TableCell>
        </TableRow>

        <TableRow sx={{ backgroundColor: "#f5f7fa", height: 40 }}>
          {/* Sold column */}
          <TableCell
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "8px 16px"
            }}
          >
            <TableSortLabel
              active={orderBy === 'sold'}
              direction={order}
              onClick={() => handleRequestSort(null, 'sold')}
              sx={{
                fontWeight: "bold",
                '& .MuiTableSortLabel-icon': {
                  opacity: 1,
                  color: 'rgba(0, 0, 0, 0.54)'
                }
              }}
            >
              Sold
            </TableSortLabel>
          </TableCell>

          {/* Allocated column */}
          <TableCell
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "8px 16px"
            }}
          >
            <TableSortLabel
              active={orderBy === 'actual'}
              direction={order}
              onClick={() => handleRequestSort(null, 'actual')}
              sx={{
                fontWeight: "bold",
                '& .MuiTableSortLabel-icon': {
                  opacity: 1,
                  color: 'rgba(0, 0, 0, 0.54)'
                }
              }}
            >
              Allocated
            </TableSortLabel>
          </TableCell>

          {/* Consumed column */}
          <TableCell
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "8px 16px"
            }}
          >
            <TableSortLabel
              active={orderBy === 'consumed'}
              direction={order}
              onClick={() => handleRequestSort(null, 'consumed')}
              sx={{
                fontWeight: "bold",
                '& .MuiTableSortLabel-icon': {
                  opacity: 1,
                  color: 'rgba(0, 0, 0, 0.54)'
                }
              }}
            >
              Consumed
            </TableSortLabel>
          </TableCell>

          {/* % Consumed column */}
          <TableCell
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              color: "#2c3e50",
              borderBottom: "2px solid #e0e0e0",
              padding: "8px 16px"
            }}
          >
            <TableSortLabel
              active={orderBy === 'consumed_percent'}
              direction={order}
              onClick={() => handleRequestSort(null, 'consumed_percent')}
              sx={{
                fontWeight: "bold",
                '& .MuiTableSortLabel-icon': {
                  opacity: 1,
                  color: 'rgba(0, 0, 0, 0.54)'
                }
              }}
            >
              % Consumed
            </TableSortLabel>
          </TableCell>
        </TableRow>
      </TableHead>
      
      <TableBody>
        {(() => {
          // Get the data to display (either sorted or original)
          const displayData = sortedData?.companies || companyData.dataUsage;
          
          // Split into expired and non-expired groups
          const expiredCompanies = [];
          const activeCompanies = [];
          
          // Separate companies based on expiration status
          displayData.forEach((company, index) => {
            const dataIndex = sortedData ? sortedData.indices[index] : index;
            const expiryData = companyData.licenseExpiration[dataIndex];
            
            if (expiryData.daysLeft < 0) {
              expiredCompanies.push({ company, index });
            } else {
              activeCompanies.push({ company, index });
            }
          });
          
          // Combine arrays with expired first
          const sortedCompanies = [...expiredCompanies, ...activeCompanies];
          
          // Render each row
          return sortedCompanies.map(({ company, index }) => {
            const dataIndex = sortedData ? sortedData.indices[index] : index;
            const licenseData = companyData.licenseAllocation[dataIndex];
            const expiryData = companyData.licenseExpiration[dataIndex];
            
            // Calculate percentages
            const storageUsedPercent = Math.round((company.consumed / company.actual) * 100);
            const licenseUsedPercent = Math.round((licenseData.consumed / licenseData.allocated) * 100);
            
            // Format days text for Renew By
            let daysText = `${expiryData.daysLeft} days`;
            let daysColor = "#4CAF50"; // Green by default
            if (expiryData.daysLeft < 0) {
              daysText = `Expired`;
              daysColor = "#FF0000"; // Red
            } else if (expiryData.daysLeft < 30) {
              daysColor = "#FF6B00"; // Orange
            } else if (expiryData.daysLeft < 45) {
              daysColor = "#FFD700"; // Yellow
            }
            
            // Track if this company's options are expanded
            const isExpanded = selectedCompany?.shortName === company.shortName;
            
            return (
              <React.Fragment key={company.shortName}>
                <TableRow
                  sx={{
                    height: 52,
                    backgroundColor: expiryData.daysLeft < 0 ? 'rgba(255, 0, 0, 0.05)' : // Light red for expired
                      (index % 2 === 0) ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    transition: 'background-color 0.3s'
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      fontSize: "0.875rem",
                      borderBottom: "1px solid #e0e0e0",
                      padding: "8px 16px"
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={selectedCompanies.includes(company.shortName)}
                        onChange={(e) => handleSelectCompany(e, company.shortName)}
                        sx={{ p: 0, mr: 1 }}
                      />
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: dataIndex % 2 === 1 ? "rgb(84,112,198)" : "rgb(250,200,88)",
                          color: '#fff',
                          fontWeight: 'bold',
                          marginRight: 1.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        {company.shortName}
                      </Box>
                      {company.company}
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center" sx={{ fontSize: "0.875rem", borderBottom: "1px solid #e0e0e0", padding: "8px 16px" }}>
                    {Math.round(company.sold / 1024)}
                  </TableCell>
                  
                  <TableCell align="center" sx={{ fontSize: "0.875rem", borderBottom: "1px solid #e0e0e0", padding: "8px 16px" }}>
                    {Math.round(company.actual / 1024)}
                  </TableCell>
                  
                  <TableCell align="center" sx={{ fontSize: "0.875rem", borderBottom: "1px solid #e0e0e0", padding: "8px 16px" }}>
                    {Math.round(company.consumed / 1024)}
                  </TableCell>
                  
                  <TableCell align="center" sx={{
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e0e0e0",
                    padding: "8px 16px",
                    color: storageUsedPercent > 90 ? '#FF0000' :
                      storageUsedPercent > 75 ? '#FF6B00' : '#2c3e50'
                  }}>
                    {storageUsedPercent}%
                  </TableCell>
                  
                  <TableCell align="center" sx={{
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e0e0e0",
                    padding: "8px 16px",
                    color: daysColor,
                    fontWeight: expiryData.daysLeft < 30 ? 'bold' : 'normal'
                  }}>
                    {daysText}
                  </TableCell>
                  
                  <TableCell align="center" sx={{
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e0e0e0",
                    padding: "8px 16px",
                    color: licenseUsedPercent > 90 ? '#FF0000' :
                      licenseUsedPercent > 75 ? '#FF6B00' : '#2c3e50'
                  }}>
                    {licenseUsedPercent}%
                  </TableCell>
                  
                  <TableCell align="center" sx={{ borderBottom: "1px solid #e0e0e0", padding: "8px 16px" }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        if (isExpanded) {
                          setSelectedCompany(null);
                        } else {
                          setSelectedCompany(company);
                        }
                      }}
                      sx={{
                        color: '#3498db',
                        fontWeight: 'medium',
                        '&:hover': {
                          backgroundColor: 'rgba(52, 152, 219, 0.1)'
                        }
                      }}
                    >
                      Options {isExpanded && <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5 }} />}
                    </Button>
                  </TableCell>
                </TableRow>
                
                {/* Options row */}
                {isExpanded && (
                  <TableRow sx={{ backgroundColor: 'rgba(236, 240, 241, 0.5)' }}>
                    <TableCell colSpan={8} sx={{ py: 2.5, px: 4, borderBottom: "1px solid #e0e0e0" }}>
                      <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                          <Button
                            variant="outlined"
                            startIcon={<RenewIcon />}
                            sx={{
                              borderRadius: 1,
                              minWidth: '160px',
                              color: '#27ae60',
                              borderColor: '#27ae60',
                              '&:hover': {
                                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                                borderColor: '#27ae60'
                              }
                            }}
                          >
                            Renew Reminder
                          </Button>
                        </Grid>
                        
                        <Grid item>
                          <Button
                            variant="outlined"
                            startIcon={<ExtendIcon />}
                            sx={{
                              borderRadius: 1,
                              minWidth: '140px',
                              color: '#2980b9',
                              borderColor: '#2980b9',
                              '&:hover': {
                                backgroundColor: 'rgba(41, 128, 185, 0.1)',
                                borderColor: '#2980b9'
                              }
                            }}
                          >
                            Extend Plan
                          </Button>
                        </Grid>
                        
                        <Grid item>
                          <Button
                            variant="outlined"
                            startIcon={<ChangeIcon />}
                            sx={{
                              borderRadius: 1,
                              minWidth: '140px',
                              color: '#f39c12',
                              borderColor: '#f39c12',
                              '&:hover': {
                                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                                borderColor: '#f39c12'
                              }
                            }}
                          >
                            Change Plan
                          </Button>
                        </Grid>
                        
                        <Grid item>
                          <Button
                            variant="outlined"
                            startIcon={<AddLicenseIcon />}
                            sx={{
                              borderRadius: 1,
                              minWidth: '140px',
                              color: '#9b59b6',
                              borderColor: '#9b59b6',
                              '&:hover': {
                                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                                borderColor: '#9b59b6'
                              }
                            }}
                          >
                            Add License
                          </Button>
                        </Grid>
                        
                        <Grid item>
                          <Button
                            variant="outlined"
                            startIcon={<StorageIcon />}
                            sx={{
                              borderRadius: 1,
                              minWidth: '160px',
                              color: '#16a085',
                              borderColor: '#16a085',
                              '&:hover': {
                                backgroundColor: 'rgba(22, 160, 133, 0.1)',
                                borderColor: '#16a085'
                              }
                            }}
                          >
                            Increase Storage
                          </Button>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          });
        })()}
      </TableBody>
    </Table>
  </TableContainer>
</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyDashboard;