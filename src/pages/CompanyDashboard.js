import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { Bar } from "react-chartjs-2";
import LicenseExpiryLegend from "../components/LicenseExpiryLegend";
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
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';

// Add this with your other imports

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
// Add these imports at the top with your other imports
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Papa from 'papaparse'; // You'll need to install this: npm install papaparse
import { useRef } from "react";

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
  // const [open, setOpen] = useState(false);
  // const handleSpeedDialOpen = () => setOpen(true);
  // const handleSpeedDialClose = () => setSpeedDialOpen(false);
  const [speedDialHover, setSpeedDialHover] = useState(false);
  // Inside CompanyDashboard component, add these states
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const fileInputRef = useRef(null);
  const actions = [
    {
      icon: <CloudUploadIcon />,
      name: 'Upload CSV',
      onClick: () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
    },
    {
      icon: <DownloadIcon />,
      name: 'Download Template',
      onClick: () => {
        downloadSampleTemplate();
      }
    },
  ];

  const [companyData, setCompanyData] = useState({
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
  });
  // Add these state variables with your other states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedData, setUploadedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  // Add these state variables near your other states
  const [actionNotification, setActionNotification] = useState({
    open: false,
    message: '',
    type: 'info'
  });
  const handleRenewReminder = (company) => {
    // In a real application, this would send a reminder email or notification
    setActionNotification({
      open: true,
      message: `Renewal reminder sent for ${company.company}`,
      type: 'success'
    });

    // Close the expanded row after action
    setSelectedCompany(null);
  };
  const handleExtendPlan = (company) => {
    // This would open a form or modal to extend the company's plan
    // For now, we'll simulate extending by 90 days
    const updatedLicenseExpiration = companyData.licenseExpiration.map(item => {
      if (item.shortName === company.shortName) {
        return { ...item, daysLeft: item.daysLeft + 90 };
      }
      return item;
    });

    setCompanyData({
      ...companyData,
      licenseExpiration: updatedLicenseExpiration
    });

    setActionNotification({
      open: true,
      message: `${company.company}'s plan extended by 90 days`,
      type: 'success'
    });

    // Close the expanded row after action
    setSelectedCompany(null);
  };
  const handleChangePlan = (company) => {
    // This would open a dialog to select a new plan
    // For now, we'll simulate upgrading storage allocation by 20%
    const updatedDataUsage = companyData.dataUsage.map(item => {
      if (item.shortName === company.shortName) {
        const newSold = Math.round(item.sold * 1.2);
        return { ...item, sold: newSold };
      }
      return item;
    });

    setCompanyData({
      ...companyData,
      dataUsage: updatedDataUsage
    });

    setActionNotification({
      open: true,
      message: `${company.company}'s plan upgraded with 20% more storage`,
      type: 'success'
    });

    // Close the expanded row after action
    setSelectedCompany(null);
  };

  const handleAddLicense = (company) => {
    // This would open a form to add specific number of licenses
    // For now, we'll simulate adding 10 licenses
    const updatedLicenseAllocation = companyData.licenseAllocation.map(item => {
      if (item.company === company.company) {
        return { ...item, allocated: item.allocated + 10 };
      }
      return item;
    });

    setCompanyData({
      ...companyData,
      licenseAllocation: updatedLicenseAllocation
    });

    setActionNotification({
      open: true,
      message: `10 additional licenses added to ${company.company}`,
      type: 'success'
    });

    // Close the expanded row after action
    setSelectedCompany(null);
  };
  const handleIncreaseStorage = (company) => {
    // This would open a form to specify storage increase
    // For now, we'll simulate adding 1TB (1024GB) to allocation
    const updatedDataUsage = companyData.dataUsage.map(item => {
      if (item.shortName === company.shortName) {
        return { ...item, actual: item.actual + 1024 };
      }
      return item;
    });

    // Also update server allocation
    const serverKey = companyData.costServer.server1.companies.includes(company.shortName)
      ? 'server1'
      : 'server2';

    const updatedCostServer = {
      ...companyData.costServer,
      [serverKey]: {
        ...companyData.costServer[serverKey],
        allocated: companyData.costServer[serverKey].allocated + 1024
      }
    };

    setCompanyData({
      ...companyData,
      dataUsage: updatedDataUsage,
      costServer: updatedCostServer
    });

    setActionNotification({
      open: true,
      message: `1TB additional storage allocated to ${company.company}`,
      type: 'success'
    });

    // Close the expanded row after action
    setSelectedCompany(null);
  };

  // Add this function to close the notification
  const handleCloseNotification = () => {
    setActionNotification({
      ...actionNotification,
      open: false
    });
  };
  // Add this function to your component
  // Replace your existing handleFileUpload function with this improved version
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    // Create a sample CSV template to show in error messages
    const sampleTemplate = `Company,ShortName,Storage Sold (TB),Storage Allocated (TB),Storage Consumed (TB),License Days Remaining,Licenses Allocated,Licenses Consumed
TechCorp (Enterprise),C1,3,1,0.7,25,350,70
InfoSys (Premium),C2,9,6,2,30,175,50`;

    // Read file as text first to handle potential parsing issues
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvText = e.target.result;

      // Check if file is empty
      if (!csvText || csvText.trim() === '') {
        setUploadError(true);
        setErrorMessage('The uploaded CSV file is empty. Please check the file content.');
        setIsUploading(false);
        return;
      }

      // Check for basic CSV format (has commas and at least one line break)
      if (!csvText.includes(',') || !csvText.includes('\n')) {
        setUploadError(true);
        setErrorMessage(`The file doesn't appear to be in CSV format. Please ensure it has comma-separated values.\n\nExpected format:\n${sampleTemplate}`);
        setIsUploading(false);
        return;
      }

      // Use Papa Parse with more options for error handling
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true, // Skip empty lines
        transformHeader: (header) => header.trim(), // Trim whitespace from headers
        complete: (results) => {
          try {
            if (results.errors && results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);

              // Create a more helpful error message
              const errorDetails = results.errors.map(err =>
                `Line ${err.row + 2}: ${err.message}`
              ).join('\n');

              setUploadError(true);
              setErrorMessage(`Error parsing CSV file:\n${errorDetails}\n\nPlease ensure your CSV follows this format:\n${sampleTemplate}`);
              setIsUploading(false);
              return;
            }

            if (!results.data || results.data.length === 0) {
              setUploadError(true);
              setErrorMessage('No data found in the CSV file. Please check the file content.');
              setIsUploading(false);
              return;
            }

            // Check required headers
            const requiredHeaders = ['Company', 'Storage Sold (TB)', 'Storage Allocated (TB)', 'Storage Consumed (TB)'];
            const headers = Object.keys(results.data[0]);

            const missingHeaders = requiredHeaders.filter(required =>
              !headers.some(header => header.trim() === required)
            );

            if (missingHeaders.length > 0) {
              setUploadError(true);
              setErrorMessage(`Missing required columns: ${missingHeaders.join(', ')}\n\nPlease ensure your CSV follows this format:\n${sampleTemplate}`);
              setIsUploading(false);
              return;
            }

            // Preview the first few rows (up to 5)
            setPreviewData(results.data.slice(0, 5));
            setShowPreview(true);

            // Store the full parsed data for later use
            setUploadedData(results.data);
          } catch (error) {
            console.error("Error processing CSV data:", error);
            setUploadError(true);
            setErrorMessage(`Error processing CSV data: ${error.message}\n\nPlease ensure your CSV follows this format:\n${sampleTemplate}`);
          } finally {
            setIsUploading(false);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setUploadError(true);
          setErrorMessage(`Error reading CSV file: ${error.message}\n\nPlease ensure your CSV follows this format:\n${sampleTemplate}`);
          setIsUploading(false);
        }
      });
    };

    reader.onerror = () => {
      setUploadError(true);
      setErrorMessage('Error reading the file. The file might be corrupted or too large.');
      setIsUploading(false);
    };

    // Read the file as text
    reader.readAsText(file);

    // Reset the file input
    event.target.value = null;
  };


  // Add this function to your component
  const applyUploadedData = () => {
    if (!uploadedData || uploadedData.length === 0) return;

    try {
      // Create a new data structure based on the uploaded CSV
      const newDataUsage = [];
      const newLicenseAllocation = [];
      const newLicenseExpiration = [];

      // First, create a mapping of company names to short names from existing data
      const shortNameMap = {};
      companyData.dataUsage.forEach(item => {
        shortNameMap[item.company] = item.shortName;
      });

      // Create a set to track unique shortNames and ensure consistency
      const processedShortNames = new Set();

      uploadedData.forEach((row, index) => {
        // Skip rows with missing required fields
        if (!row.Company || !row['Storage Sold (TB)']) return;

        // Determine shortName with consistent handling
        let shortName = row.ShortName || shortNameMap[row.Company];

        // If no shortName exists yet, create a new one
        if (!shortName) {
          // Find the next available Cx shortName
          let counter = 1;
          while (processedShortNames.has(`C${counter}`)) {
            counter++;
          }
          shortName = `C${counter}`;
        }

        // Track this shortName as used
        processedShortNames.add(shortName);

        // Convert TB values to GB for internal storage
        const soldTB = parseFloat(row['Storage Sold (TB)']) || 0;
        const allocatedTB = parseFloat(row['Storage Allocated (TB)']) || 0;
        const consumedTB = parseFloat(row['Storage Consumed (TB)']) || 0;

        // Create data usage entry
        newDataUsage.push({
          shortName: shortName,
          company: row.Company,
          sold: soldTB * 1024, // Convert TB to GB
          actual: allocatedTB * 1024,
          consumed: consumedTB * 1024
        });

        // Create license allocation entry
        newLicenseAllocation.push({
          company: row.Company,
          allocated: parseInt(row['Licenses Allocated']) || 0,
          consumed: parseInt(row['Licenses Consumed']) || 0
        });

        // Create license expiration entry
        newLicenseExpiration.push({
          company: row.Company,
          shortName: shortName,
          daysLeft: parseInt(row['License Days Remaining']) || 0
        });
      });

      // Only update if we have valid data
      if (newDataUsage.length > 0) {
        // Create a new server data structure based on updated company data
        const updatedCostServer = {
          server1: {
            capacity: companyData.costServer.server1.capacity,
            companies: [],
            allocated: 0,
            consumed: 0
          },
          server2: {
            capacity: companyData.costServer.server2.capacity,
            companies: [],
            allocated: 0,
            consumed: 0
          }
        };

        // Distribute companies between servers (first half to server1, second half to server2)
        const midpoint = Math.ceil(newDataUsage.length / 2);

        newDataUsage.forEach((company, index) => {
          const serverKey = index < midpoint ? 'server1' : 'server2';
          updatedCostServer[serverKey].companies.push(company.shortName);
          updatedCostServer[serverKey].allocated += company.actual;
          updatedCostServer[serverKey].consumed += company.consumed;
        });

        // Ensure each server has at least two companies (or as many as available)
        if (updatedCostServer.server1.companies.length < 2 && updatedCostServer.server2.companies.length > 0) {
          const moveCompany = updatedCostServer.server2.companies.shift();
          const companyData = newDataUsage.find(c => c.shortName === moveCompany);

          if (companyData) {
            updatedCostServer.server1.companies.push(moveCompany);
            updatedCostServer.server1.allocated += companyData.actual;
            updatedCostServer.server1.consumed += companyData.consumed;

            updatedCostServer.server2.allocated -= companyData.actual;
            updatedCostServer.server2.consumed -= companyData.consumed;
          }
        }

        // Create the updated company data object
        const newCompanyData = {
          dataUsage: newDataUsage,
          licenseAllocation: newLicenseAllocation,
          licenseExpiration: newLicenseExpiration,
          costServer: updatedCostServer
        };

        // Update the state with the new data
        setCompanyData(newCompanyData);

        // Reset selection states
        setSelectedCompanies([]);
        setSelectedCompany(null);

        // Reset sorting
        setSortedData(null);

        // Show success message
        setUploadSuccess(true);

        // Close preview dialog
        setShowPreview(false);
      } else {
        throw new Error("No valid data rows found in CSV");
      }
    } catch (error) {
      console.error("Error applying uploaded data:", error);
      setUploadError(true);
      setErrorMessage('Error applying data. Please check CSV format.');
    }
  };
  // Add this after your other state variables
  const [isDownloading, setIsDownloading] = useState(false);


  const downloadSampleTemplate = () => {
    const csvContent = `Company,ShortName,Storage Sold (TB),Storage Allocated (TB),Storage Consumed (TB),License Days Remaining,Licenses Allocated,Licenses Consumed
TechCorp (Enterprise),C1,3,1,0.7,25,350,70
InfoSys (Premium),C2,9,6,2,30,175,50
DataTech (Standard),C3,7,4,1,-180,150,130
CloudNet (Basic),C4,4,3,2,180,95,45`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', 'company_data_template.csv');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    if (selectedCompanies.length === 0) return;

    setIsDownloading(true);

    try {
      // Create CSV header row
      const headers = [
        'Company',
        'Storage Sold (TB)',
        'Storage Allocated (TB)',
        'Storage Consumed (TB)',
        'Storage Utilization (%)',
        'License Days Remaining',
        'License Status',
        'Licenses Allocated',
        'Licenses Consumed',
        'License Utilization (%)'
      ];

      // Map selected companies to CSV rows
      const rows = selectedCompanies.map(shortName => {
        const company = companyData.dataUsage.find(c => c.shortName === shortName);
        const licenseData = companyData.licenseAllocation.find(l =>
          l.company === company.company
        );
        const expiryData = companyData.licenseExpiration.find(e =>
          e.shortName === shortName
        );

        // Calculate percentages
        const storageUsedPercent = Math.round((company.consumed / company.actual) * 100);
        const licenseUsedPercent = Math.round((licenseData.consumed / licenseData.allocated) * 100);

        // Determine license status
        let licenseStatus = 'Good';
        if (expiryData.daysLeft < 0) {
          licenseStatus = 'Expired';
        } else if (expiryData.daysLeft < 30) {
          licenseStatus = 'Critical - Immediate Action Required';
        } else if (expiryData.daysLeft < 45) {
          licenseStatus = 'Warning - Action Needed Soon';
        }

        return [
          company.company,
          Math.round(company.sold / 1024),
          Math.round(company.actual / 1024),
          Math.round(company.consumed / 1024),
          `${storageUsedPercent}%`,
          expiryData.daysLeft,
          licenseStatus,
          licenseData.allocated,
          licenseData.consumed,
          `${licenseUsedPercent}%`
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Set filename with current date
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `company_storage_summary_${date}.csv`);

      // Programmatically click the link to trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error generating CSV:", error);
      // Could add an error notification here
    } finally {
      setIsDownloading(false);
    }
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
        return (a, b) => {
          const expiryA = companyData.licenseExpiration.find(item =>
            item && item.shortName === a.shortName
          );
          const expiryB = companyData.licenseExpiration.find(item =>
            item && item.shortName === b.shortName
          );

          const daysLeftA = expiryA && expiryA.daysLeft !== undefined ? expiryA.daysLeft : 0;
          const daysLeftB = expiryB && expiryB.daysLeft !== undefined ? expiryB.daysLeft : 0;

          return newOrder === 'asc'
            ? daysLeftA - daysLeftB
            : daysLeftB - daysLeftA;
        };
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



  const chartConfigs = React.useMemo(() => ({
    dataUsage: {
      labels: companyData.dataUsage.map((item) => item.shortName),
      datasets: [
        {
          label: "Consumed Storage",
          data: companyData.dataUsage.map(
            (item) => Math.round(item.consumed / 1024) // Remove decimals
          ),
          backgroundColor: companyData.dataUsage.map(() => "#09309c")
          ,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
        {
          label: "Actually Allocated",
          data: companyData.dataUsage.map(
            (item) => Math.round((item.actual - item.consumed) / 1024) // Remove decimals
          ),
          backgroundColor: companyData.dataUsage.map(() => "#09309c63"),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
        {
          label: "Sold Storage",
          data: companyData.dataUsage.map(
            (item) => Math.round((item.sold - item.actual) / 1024) // Remove decimals
          ),
          backgroundColor: "#09309c29", // Keeping gray for all companies
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
          backgroundColor: companyData.licenseAllocation.map(() => "#F97316"),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          stack: "single",
        },
        {
          label: "Allocated (Total)",
          data: companyData.licenseAllocation.map((item) => 100), // Always 100%,
          backgroundColor: companyData.licenseAllocation.map(() => "#FED7AA"),
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
  }), [companyData]); // Add companyData as a dependency

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
          padding: 15, // Add padding between axis and labels

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
          padding: 15,
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
          padding: 20,
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
    <Box sx={{
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
      },
      display: 'flex', backgroundColor: 'whitesmoke', marginLeft: "22px", animation: "slideInFromLeft 0.3s ease-in-out forwards",

    }}>

      <Box sx={{
        marginLeft: '50px', marginTop: "10px", marginRight: "10px", flexGrow: 1,
      }}>


        {/* <UserTable /> */}


        <Box
          sx={{
            position: 'fixed',
            bottom: 10,
            right: 0,
            zIndex: 1000,
          }}
          onMouseEnter={() => setSpeedDialOpen(true)}
          onMouseLeave={() => setSpeedDialOpen(false)}
        >
          <SpeedDial
            ariaLabel="CSV import/export options"
            icon={<SpeedDialIcon sx={{ fontSize: 18 }} />}
            open={speedDialOpen}
            direction="up"
            FabProps={{
              sx: {
                width: 35, // Chhota width
                height: 35,


                borderRadius: '50%',
                bgcolor: '#3498db',
                '&:hover': {
                  bgcolor: '#2980b9',
                },
              },
            }}
          >
            <SpeedDialAction
              icon={<CloudUploadIcon color="primary" />}
              // tooltipTitle="Upload CSV"
              // tooltipOpen
              onClick={() => fileInputRef.current.click()}
            />

            <SpeedDialAction
              icon={<DownloadIcon color="primary" />}
              // tooltipTitle="Download Template"
              // tooltipOpen
              onClick={downloadSampleTemplate}
            />
          </SpeedDial>

          {/* Hidden input for upload */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Box>



        <Grid container spacing={2} padding={1}>

          <Grid item xs={6} md={6} lg={6}>
            <Paper evaluation={24} sx={{ borderRadius: "20px" }} >
              <Typography
                variant="h6"
                sx={{
                  fontSize: '15px',
                  fontWeight: "bold",
                  color: "#2c3e50b3",
                  borderBottom: "2px solid #e0e0e0",
                  // paddingBottom: 1,
                  textAlign: "center"
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
          </Grid> <Grid item xs={6} md={6} lg={6}>
            <Paper evaluation={24} sx={{ borderRadius: "20px" }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '15px',
                  fontWeight: "bold",
                  color: "#2c3e50b3",
                  borderBottom: "2px solid #e0e0e0",
                  // paddingBottom: 1,
                  textAlign: "center",
                  // borderRadius: "6px"
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
          <Grid item xs={6} md={6} lg={6}>
            <Paper evaluation={24} sx={{ borderRadius: "20px" }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '15px',
                  fontWeight: "bold",
                  color: "#2c3e50b3",
                  borderBottom: "2px solid #e0e0e0",
                  // paddingBottom: 1,
                  textAlign: "center",
                  borderRadius: "6px"

                }}
              >
                License Expiration Status
              </Typography>


              <Box sx={{ height: 300, position: "relative" }}>
                <Bar
                  options={licenseExpiryOptions}
                  data={chartConfigs.licenseExpiration}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={6} lg={6}>
            <Paper evaluation={24} sx={{ borderRadius: "20px" }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '15px',
                  fontWeight: "bold",
                  color: "#2c3e50b3",
                  borderBottom: "2px solid #e0e0e0",
                  // paddingBottom: 1,
                  textAlign: "center",
                  borderRadius: "6px"
                }}
              >
                Cost Server Storage Analysis
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
        <Box>
          <Paper
            elevation={24}
            sx={{
              p: '8px',
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              borderRadius: 3,
              marginBottom: '10px',
              marginTop: "10px"
              // transition: "all 0.3s ease",
              // "&:hover": {
              //   transform: "translateY(-4px)",
              //   boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              // },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '15px',
                  fontWeight: "bold",
                  color: "#2c3e50",


                  // paddingBottom: 1,
                }}
              >
                Company Storage & License Summary
              </Typography>
              {selectedCompanies.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadCSV}
                  disabled={isDownloading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {isDownloading ? 'Preparing Download...' : `Download CSV (${selectedCompanies.length})`}
                </Button>
              )}
            </Box>

            <TableContainer component={Paper} elevation={1} sx={{
              overflow: "auto",
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }
            }}>
              <Table sx={{ minWidth: 650 }} size="medium">
                <TableHead>
                  {/* First row - main headers and Storage group header */}
                  <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
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
                      if (!company) return; // Skip if company data is undefined

                      const expiryData = companyData.licenseExpiration.find(e =>
                        e && e.shortName === company.shortName
                      );

                      // Only categorize if we have valid expiry data
                      if (expiryData && expiryData.daysLeft !== undefined) {
                        if (expiryData.daysLeft < 0) {
                          expiredCompanies.push({ company, index });
                        } else {
                          activeCompanies.push({ company, index });
                        }
                      } else {
                        // If no expiry data, treat as active
                        activeCompanies.push({ company, index });
                      }
                    });

                    // Combine arrays with expired first
                    const sortedCompanies = [...expiredCompanies, ...activeCompanies];
                    // Return empty array if no companies to show
                    if (sortedCompanies.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No company data available
                          </TableCell>
                        </TableRow>
                      );
                    }

                    // Render each row
                    return sortedCompanies.map(({ company, index }) => {
                      const dataIndex = sortedData ? sortedData.indices[index] : index;
                      // const licenseData = companyData.licenseAllocation[dataIndex];

                      // Safely find related data with fallbacks
                      const licenseData = companyData.licenseAllocation.find(l =>
                        l && l.company === company.company
                      ) || { allocated: 0, consumed: 0 };

                      // const expiryData = companyData.licenseExpiration[dataIndex];

                      const expiryData = companyData.licenseExpiration.find(e =>
                        e && e.shortName === company.shortName
                      ) || { daysLeft: 0, shortName: company.shortName, company: company.company };
                      // Calculate percentages with safety checks
                      const actual = company.actual || 1; // Prevent division by zero
                      const consumed = company.consumed || 0;
                      const storageUsedPercent = Math.round((consumed / actual) * 100);

                      // Calculate percentages
                      // const storageUsedPercent = Math.round((company.consumed / company.actual) * 100);
                      // const licenseUsedPercent = Math.round((licenseData.consumed / licenseData.allocated) * 100);
                      const licenseAllocated = licenseData.allocated || 1; // Prevent division by zero
                      const licenseConsumed = licenseData.consumed || 0;
                      const licenseUsedPercent = Math.round((licenseConsumed / licenseAllocated) * 100);

                      // Format days text for Renew By
                      const daysLeft = expiryData.daysLeft || 0;
                      let daysText = `${daysLeft} days`;
                      let daysColor = "#4CAF50"; // Green by default

                      if (daysLeft < 0) {
                        daysText = `Expired`;
                        daysColor = "#FF0000"; // Red
                      } else if (daysLeft < 30) {
                        daysColor = "#FF6B00"; // Orange
                      } else if (daysLeft < 45) {
                        daysColor = "#FFD700"; // Yellow
                      }

                      // Track if this company's options are expanded
                      const isExpanded = selectedCompany?.shortName === company.shortName;

                      return (
                        <React.Fragment key={company.shortName || index}>
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
                                      onClick={() => handleRenewReminder(company)}
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
                                      onClick={() => handleExtendPlan(company)}
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
                                      onClick={() => handleChangePlan(company)}
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
                                      onClick={() => handleAddLicense(company)}
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
                                      onClick={() => handleIncreaseStorage(company)}
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
          </Paper>

        </Box>
        <Box>
          <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              Preview CSV Data
            </DialogTitle>
            <DialogContent>
              {previewData.length > 0 && (
                <TableContainer sx={{ maxHeight: 300, mt: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {Object.keys(previewData[0]).map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 'bold' }}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.keys(row).map((key) => (
                            <TableCell key={`${rowIndex}-${key}`}>
                              {row[key]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This is a preview of the first 5 rows. The data will update the dashboard when you apply it.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPreview(false)} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={applyUploadedData}
                variant="contained"
                color="primary"
                sx={{ borderRadius: 1 }}
              >
                Apply Data
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notification Snackbars */}
          <Snackbar
            open={uploadSuccess}
            autoHideDuration={4000}
            onClose={() => setUploadSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setUploadSuccess(false)}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              CSV data successfully applied to dashboard
            </Alert>
          </Snackbar>

          <Snackbar
            open={uploadError}
            autoHideDuration={6000} // Longer duration for more complex messages
            onClose={() => setUploadError(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setUploadError(false)}
              severity="error"
              variant="filled"
              sx={{
                width: '100%',
                maxWidth: '500px',
                whiteSpace: 'pre-line' // This allows newlines in the message
              }}
            >
              {errorMessage || 'Error uploading CSV file'}
            </Alert>
          </Snackbar>

          {/* Add this at the end of your component, near other snackbars */}
          <Snackbar
            open={actionNotification.open}
            autoHideDuration={4000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={actionNotification.type}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {actionNotification.message}
            </Alert>
          </Snackbar>
        </Box>



      </Box>
    </Box>
  );
};

export default CompanyDashboard;