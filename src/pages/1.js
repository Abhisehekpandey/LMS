// import React from 'react';
// import { Box, Paper, Typography, Grid } from '@mui/material';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import * as Pattern from 'patternomaly';  // Changed import statement
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";


// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,

// );

// const CompanyDashboard = ({ onThemeToggle }) => {
//   const TOTAL_CAPACITY = 1000;
//   const TOTAL_LICENSES = 150;
//   const LICENSE_USAGE_WARNING_THRESHOLD = 90;
//   const EXPIRY_WARNING_DAYS = 45;
//   const CRITICAL_EXPIRY_DAYS = 30;
//   const getGradient = (ctx, chartArea, colors) => {
//     const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
//     gradient.addColorStop(0, colors[0]);
//     gradient.addColorStop(1, colors[1]);
//     return gradient;
//   };
  
//   const CHART_COLORS = {
//     SET_ONE: {
//       PRIMARY: '#123458',    // Dark blue (previously TERTIARY)
//       SECONDARY: '#D4C9BE',  // Medium beige
//       TERTIARY: '#F1EFEC',   // Light beige (previously PRIMARY)
//       QUATERNARY: '#B5A8D5'  // Keeping the existing quaternary color
//     },
//     SET_TWO: {
//       PRIMARY: '#2D336B',    // Dark blue (previously QUATERNARY)
//       SECONDARY: '#A9B5DF',  // Light blue-grey
//       TERTIARY: '#FFF2F2',   // Light pink (previously PRIMARY)
//       QUATERNARY: '#7886C7'  // Medium blue-grey
//     }
//   };
  
  
//   const LICENSE_DISTRIBUTION = {
//     ENTERPRISE: 0.40,
//     PREMIUM: 0.30,
//     STANDARD: 0.20,
//     BASIC: 0.10
//   };

//   const companyData = {
//     dataUsage: [
//       {
//         company: 'TechCorp (Enterprise)',
//         sold: 500,
//         actual: 300,
//         consumed: 280,
//         percentage: {
//           sold: (500/TOTAL_CAPACITY * 100).toFixed(1),
//           actual: (300/TOTAL_CAPACITY * 100).toFixed(1),
//           consumed: (280/TOTAL_CAPACITY * 100).toFixed(1),
//         }
//       },
//       {
//         company: 'DataSys (Standard)',
//         sold: 200,
//         actual: 130,
//         consumed: 116,
//         percentage: {
//           sold: (200/TOTAL_CAPACITY * 100).toFixed(1),
//           actual: (130/TOTAL_CAPACITY * 100).toFixed(1),
//           consumed: (116/TOTAL_CAPACITY * 100).toFixed(1),
//         }
//       },
//       {
//         company: 'InfoTech (Premium)',
//         sold: 350,
//         actual: 245,
//         consumed: 227,
//         percentage: {
//           sold: (350/TOTAL_CAPACITY * 100).toFixed(1),
//           actual: (245/TOTAL_CAPACITY * 100).toFixed(1),
//           consumed: (227/TOTAL_CAPACITY * 100).toFixed(1),
//         }
//       },
//       {
//         company: 'CloudNet (Basic)',
//         sold: 100,
//         actual: 75,
//         consumed: 62,
//         percentage: {
//           sold: (100/TOTAL_CAPACITY * 100).toFixed(1),
//           actual: (75/TOTAL_CAPACITY * 100).toFixed(1),
//           consumed: (62/TOTAL_CAPACITY * 100).toFixed(1),
//         }
//       },
//     ],
//     licenseAllocation: [
//       {
//         company: 'TechCorp (Enterprise)',
//         provided: Math.floor(TOTAL_LICENSES * LICENSE_DISTRIBUTION.ENTERPRISE),
//         used: 54,
//         percentage: {
//           provided: (60/TOTAL_LICENSES * 100).toFixed(1),
//           used: (54/60 * 100).toFixed(1)
//         }
//       },
//       {
//         company: 'InfoTech (Premium)',
//         provided: Math.floor(TOTAL_LICENSES * LICENSE_DISTRIBUTION.PREMIUM),
//         used: 36,
//         percentage: {
//           provided: (45/TOTAL_LICENSES * 100).toFixed(1),
//           used: (36/45 * 100).toFixed(1)
//         }
//       },
//       {
//         company: 'DataSys (Standard)',
//         provided: Math.floor(TOTAL_LICENSES * LICENSE_DISTRIBUTION.STANDARD),
//         used: 21,
//         percentage: {
//           provided: (30/TOTAL_LICENSES * 100).toFixed(1),
//           used: (21/30 * 100).toFixed(1)
//         }
//       },
//       {
//         company: 'CloudNet (Basic)',
//         provided: Math.floor(TOTAL_LICENSES * LICENSE_DISTRIBUTION.BASIC),
//         used: 12,
//         percentage: {
//           provided: (15/TOTAL_LICENSES * 100).toFixed(1),
//           used: (12/15 * 100).toFixed(1)
//         }
//       }
//     ],
//     licenseExpiry: [
//       {
//         company: 'TechCorp (Enterprise)',
//         daysLeft: 30,
//         totalDays: 365,
//         expiryDate: '2025-05-03',
//         status: 'warning'
//       },
//       {
//         company: 'InfoTech (Premium)',
//         daysLeft: 60,
//         totalDays: 365,
//         expiryDate: '2025-06-02',
//         status: 'normal'
//       },
//       {
//         company: 'DataSys (Standard)',
//         daysLeft: 15,
//         totalDays: 365,
//         expiryDate: '2025-04-18',
//         status: 'critical'
//       },
//       {
//         company: 'CloudNet (Basic)',
//         daysLeft: 90,
//         totalDays: 365,
//         expiryDate: '2025-07-02',
//         status: 'normal'
//       }
//     ],
//     costAnalysis: [
//       { month: 'Jan', allocated: 15000, actual: 12000, consumed: 11000 },
//       { month: 'Feb', allocated: 18000, actual: 14000, consumed: 13500 },
//       { month: 'Mar', allocated: 20000, actual: 15000, consumed: 14800 },
//       { month: 'Apr', allocated: 22000, actual: 16000, consumed: 15500 },
//     ],
//   };

//   const chartConfigs = {
//     dataUsage: {
//       labels: companyData.dataUsage.map((_, index) => `C${index + 1}`),
//       datasets: [
//         {
//           label: 'Consumed Storage',
//           data: companyData.dataUsage.map(item => 
//             (item.consumed / 1024).toFixed(2) // Convert GB to TB
//           ),
//           backgroundColor: companyData.dataUsage.map((_, index) => {
//             return index % 2 === 0 ? '#0A2647' : '#144272';
//           }),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         },
//         {
//           label: 'Actually Allocated',
//           data: companyData.dataUsage.map(item => 
//             ((item.actual - item.consumed) / 1024).toFixed(2) // Convert GB to TB
//           ),
//           backgroundColor: companyData.dataUsage.map((_, index) => {
//             return index % 2 === 0 ? '#205295' : '#2C74B3';
//           }),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         },
//         {
//           label: 'Sold Storage',
//           data: companyData.dataUsage.map(item => 
//             (item.sold / 1024).toFixed(2) // Convert GB to TB
//           ),
//           backgroundColor: companyData.dataUsage.map(() => '#F1EFEC'),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         }
//       ]
//     },
  
//     licenseAllocation: {
//       labels: companyData.licenseAllocation.map((_, index) => `C${index + 1}`),
//       datasets: [
//         {
//           label: 'Consumed',
//           data: companyData.licenseAllocation.map(item => 
//             ((item.used / item.provided) * 100).toFixed(1)
//           ),
//           backgroundColor: companyData.licenseAllocation.map((_, index) => {
//             return index % 2 === 0 ? '#205295' : '#2C74B3';
//           }),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         },
//         {
//           label: 'Allocated',
//           data: companyData.licenseAllocation.map(item => 
//             ((item.provided / TOTAL_LICENSES) * 100).toFixed(1)
//           ),
//           backgroundColor: companyData.licenseAllocation.map(() => '#F1EFEC'),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         }
//       ]
//     },
  
//     licenseExpiry: {
//       labels: companyData.licenseExpiry
//         .sort((a, b) => a.daysLeft - b.daysLeft)
//         .map(item => item.company.split(' ')[0]),
//         datasets: [{
//           label: 'Days Until License Expiry',
//           data: companyData.licenseExpiry
//             .sort((a, b) => a.daysLeft - b.daysLeft)
//             .map(item => item.daysLeft),
//           backgroundColor: companyData.licenseExpiry
//             .sort((a, b) => a.daysLeft - b.daysLeft)
//             .map(item => {
//               if (item.daysLeft <= CRITICAL_EXPIRY_DAYS) return '#1B1A55'; // Dark blue-purple
//               if (item.daysLeft <= EXPIRY_WARNING_DAYS) return '#535C91'; // Medium blue-purple
//               return '#F1EFEC'; // Keep light beige for normal status
//             }),
//           borderColor: companyData.licenseExpiry
//             .sort((a, b) => a.daysLeft - b.daysLeft)
//             .map(item => {
//               if (item.daysLeft <= CRITICAL_EXPIRY_DAYS) return '#1B1A55'; // Dark blue-purple
//               if (item.daysLeft <= EXPIRY_WARNING_DAYS) return '#535C91'; // Medium blue-purple
//               return '#F1EFEC'; // Keep light beige for normal status
//             }),
//           borderWidth: 2,
//           barPercentage: 0.9,
//           categoryPercentage: 0.9
//         }]
//     },
  
//     cost : {
//       labels: companyData.dataUsage.map((_, index) => `C${index + 1}`),
//       datasets: [
//         {
//           label: 'Allocated Budget',
//           data: companyData.dataUsage.map(item => 
//             ((item.sold / 1024)).toFixed(2) // Convert GB to TB
//           ),
//           backgroundColor: companyData.dataUsage.map((_, index) => {
//             return index % 2 === 0 ? '#1B1A55' : '#535C91';
//           }),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         },
//         {
//           label: 'Actual Usage',
//           data: companyData.dataUsage.map(item => 
//             ((item.actual / 1024)).toFixed(2) // Convert GB to TB
//           ),
//           backgroundColor: companyData.dataUsage.map(() => '#F1EFEC'),
//           barPercentage: 0.9,
//           categoryPercentage: 0.9,
//           stack: 'single'
//         }
//       ]
//     }
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//         labels: {
//           padding: 20,
//           font: { size: 12 }
//         }
//       },
//       tooltip: {
//         mode: 'index',
//         intersect: false,
//         callbacks: {
//           title: function(context) {
//             const dataIndex = context[0].dataIndex;
//             const datasetLabel = context[0].dataset.label;
            
//             if (datasetLabel.includes('License')) {
//               return companyData.licenseAllocation[dataIndex].company;
//             }
//             if (datasetLabel.includes('Days Until')) {
//               return companyData.licenseExpiry[dataIndex].company;
//             }
//             return companyData.dataUsage[dataIndex].company;
//           },
//           label: function(context) {
//             const datasetLabel = context.dataset.label;
//             const dataIndex = context.dataIndex;
  
//             // License Allocation tooltips
//             if (datasetLabel === 'Allocated') {
//               const licenseData = companyData.licenseAllocation[dataIndex];
//               return `Total Allocated: ${licenseData.provided} licenses`;
//             }
//             if (datasetLabel === 'Consumed') {
//               const licenseData = companyData.licenseAllocation[dataIndex];
//               const percentage = ((licenseData.used / licenseData.provided) * 100).toFixed(1);
//               return `Used: ${licenseData.used}/${licenseData.provided} licenses (${percentage}%)`;
//             }
  
//             // License Expiry tooltip
//             if (datasetLabel.includes('Days Until')) {
//               const expiryData = companyData.licenseExpiry[dataIndex];
//               return `${expiryData.daysLeft} days until expiry (${expiryData.status.toUpperCase()})`;
//             }
  
//             // Cost Analysis tooltip
//             if (datasetLabel.includes('Budget') || datasetLabel.includes('Cost')) {
//               return `${datasetLabel}: $${context.parsed.y.toLocaleString()}`;
//             }
  
//             return `${datasetLabel}: ${context.parsed.y}`;
//           }
//         }
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           display: false
//         },
//         ticks: {
//           font: {
//             size: 12,
//             weight: 'bold'
//           }
//         },
//         title: {
//           display: true,
//           text: (context) => {
//             const label = context.chart.data.datasets[0].label;
//             if (label === 'Allocated' || label === 'Consumed') {
//               return 'Number of Licenses';
//             }
//             if (label.includes('Days Until')) {
//               return 'Days Remaining';
//             }
//             return 'Value';
//           },
//           font: {
//             size: 14,
//             weight: 'bold'
//           }
//         }
//       },
//       x: {
//         grid: {
//           display: false
//         },
//         title: {
//           display: true,
//           text: 'Companies',
//           font: {
//             size: 14,
//             weight: 'bold'
//           }
//         }
//       }
//     }
//   };
//   // Create separate options for horizontal bar chart
// const horizontalBarOptions = {
//   ...chartOptions,
//   indexAxis: 'y',
//   responsive: true,
//   plugins: {
//     legend: {
//       position: 'top',
//     },
//     tooltip: {
//       callbacks: {
//         label: function(context) {
//           const datasetLabel = context.dataset.label;
//           const value = context.parsed.x; // Using x since it's horizontal
          
//           if (datasetLabel.includes('Capacity')) {
//             return `${datasetLabel}: ${value.toFixed(2)} TB`;
//           }
//           return `${datasetLabel}: ${value}`;
//         }
//       }
//     }
//   },
//   scales: {
//     x: {
//       beginAtZero: true,
//       position: 'top',
//       title: {
//         display: true,
//         text: 'Storage Usage (TB)',
//       },
//       ticks: {
//         callback: function(value) {
//           return value.toFixed(1) + ' TB';
//         }
//       }
//     },
//     y: {
//       title: {
//         display: true,
//         text: 'Companies'
//       }
//     }
//   }
// };
// const stackedHorizontalOptions = {
//   indexAxis: 'y',
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       position: 'top',
//       labels: {
//         padding: 20,
//         font: { size: 12 }
//       }
//     },
//     tooltip: {
//       mode: 'nearest',
//       intersect: true,
//       callbacks: {
//         title: function(context) {
//           const dataIndex = context[0].dataIndex;
//           return companyData.dataUsage[dataIndex].company;
//         },
//         label: function(context) {
//           const datasetLabel = context.dataset.label;
//           const dataIndex = context.dataIndex;
//           const dataPoint = companyData.dataUsage[dataIndex];

//           if (datasetLabel === 'Sold Storage') {
//             return `Total Storage: ${dataPoint.sold} GB`;
//           }
          
//           if (datasetLabel === 'Actually Allocated') {
//             const percentage = ((dataPoint.actual / dataPoint.sold) * 100).toFixed(1);
//             return `Allocated: ${dataPoint.actual}/${dataPoint.sold} GB (${percentage}%)`;
//           }
          
//           if (datasetLabel === 'Consumed Storage') {
//             const percentage = ((dataPoint.consumed / dataPoint.actual) * 100).toFixed(1);
//             return `Consumed: ${dataPoint.consumed}/${dataPoint.actual} GB (${percentage}%)`;
//           }
//         }
//       }
//     }
//   },
//   scales: {
//     x: {
//       stacked: true,
//       grid: {
//         display: false
//       },
//       title: {
//         display: true,
//         text: 'Storage Usage (TB)',
//         font: {
//           size: 14,
//           weight: 'bold'
//         }
//       },
//       ticks: {
//         callback: function(value) {
//           // Define the specific values we want to show
//           const fixedValues = [0.5, 1, 2, 3, 5];
//           const tbValue = (value * TOTAL_CAPACITY / 100 / 1024).toFixed(1);
//           const numValue = parseFloat(tbValue);
          
//           // Only show labels for our defined values
//           if (fixedValues.includes(numValue)) {
//             return numValue.toFixed(1);
//           }
//           return '';
//         },
//         stepSize: 0.5
//       },
//       min: 0,
//       max: 5 // Set maximum to 5 TB
//     },
//     y: {
//       stacked: true,
//       grid: {
//         display: false
//       },
//       ticks: {
//         font: {
//           size: 12,
//           weight: 'bold'
//         }
//       }
//     }
//   }
// };
// const licenseChartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       position: 'top',
//       labels: {
//         padding: 20,
//         font: { size: 12 }
//       }
//     },
//     tooltip: {
//       mode: 'nearest',
//       intersect: true,
//       callbacks: {
//         title: function(context) {
//           const dataIndex = context[0].dataIndex;
//           return companyData.licenseAllocation[dataIndex].company;
//         },
//         label: function(context) {
//           const datasetLabel = context.dataset.label;
//           const dataIndex = context.dataIndex;
//           const licenseData = companyData.licenseAllocation[dataIndex];

//           if (datasetLabel === 'Allocated') {
//             return `Total: ${licenseData.provided} licenses (${context.raw}%)`;
//           }
          
//           if (datasetLabel === 'Consumed') {
//             return `Usage: ${context.raw}%`;
//           }
//         }
//       }
//     }
//   },
//   scales: {
//     y: {
//       stacked: true,
//       beginAtZero: true,
//       max: 100, // Set maximum to 100%
//       grid: {
//         display: false
//       },
//       ticks: {
//         callback: value => value + '%', // Add % symbol to ticks
//         font: {
//           size: 12,
//           weight: 'bold'
//         }
//       },
//       title: {
//         display: true,
//         text: 'License Usage (%)',
//         font: {
//           size: 14,
//           weight: 'bold'
//         }
//       }
//     },
//     x: {
//       stacked: true,
//       grid: {
//         display: false
//       },
//       title: {
//         display: true,
//         text: 'Companies',
//         font: {
//           size: 14,
//           weight: 'bold'
//         }
//       }
//     }
//   },
//   barPercentage: 0.4,    // Reduced from default
//   categoryPercentage: 0.5 // Reduced from default
// };
// const licenseExpiryOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false
//     },
//     tooltip: {
//       mode: 'nearest',
//       intersect: true,
//       callbacks: {
//         title: function(context) {
//           if (!context.length) return '';
//           const dataIndex = context[0].dataIndex;
//           const sortedData = companyData.licenseExpiry.sort((a, b) => a.daysLeft - b.daysLeft);
//           return sortedData[dataIndex].company;
//         },
//         label: function(context) {
//           if (!context || !context.raw) return null;
//           const dataIndex = context.dataIndex;
//           const sortedData = companyData.licenseExpiry.sort((a, b) => a.daysLeft - b.daysLeft);
//           const item = sortedData[dataIndex];
          
//           if (!item) return null;

//           return [
//             `Days Left: ${item.daysLeft}`,
//             `Status: ${item.status.toUpperCase()}`,
//             `Expires: ${item.expiryDate}`
//           ];
//         }
//       }
//     }
//   },
//   scales: {
//     y: {
//       beginAtZero: true,
//       grid: {
//         display: false
//       },
//       ticks: {
//         font: {
//           size: 12,
//           weight: 'bold'
//         }
//       },
//       title: {
//         display: true,
//         text: 'Days Remaining',
//         font: {
//           size: 14,
//           weight: 'bold'
//         }
//       }
//     },
//     x: {
//       grid: {
//         display: false
//       },
//       ticks: {
//         font: {
//           size: 12,
//           weight: 'bold'
//         }
//       }
//     }
//   }
//   ,
//   barPercentage: 0.7,    // Changed from 0.4 to 0.7
//   categoryPercentage: 0.8 // Changed from 0.5 to 0.8
//   // categoryPercentage: 0.5 // Reduced from default
// };
// const costChartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       position: 'top',
//       labels: {
//         padding: 20,
//         font: { size: 12 }
//       }
//     },
//     tooltip: {
//       mode: 'nearest',
//       intersect: true,
//       callbacks: {
//         title: function(context) {
//           const dataIndex = context[0].dataIndex;
//           return companyData.dataUsage[dataIndex].company;
//         },
//         label: function(context) {
//           const datasetLabel = context.dataset.label;
//           const dataIndex = context.dataIndex;
//           const dataPoint = companyData.dataUsage[dataIndex];

//           if (datasetLabel === 'Allocated Budget') {
//             return `Total Budget: ${dataPoint.sold} GB`;
//           }
          
//           if (datasetLabel === 'Actual Usage') {
//             const percentage = ((dataPoint.actual / dataPoint.sold) * 100).toFixed(1);
//             return `Used: ${dataPoint.actual} GB (${percentage}%)`;
//           }
//         }
//       }
//     }
//   },
//   scales: {
//     y: {
//       beginAtZero: true,
//       grid: {
//         display: false
//       },
//       ticks: {
//         font: {
//           size: 12,
//           weight: 'bold'
//         }
//       },
//       title: {
//         display: true,
//         text: 'Storage (GB)',
//         font: {
//           size: 14,
//           weight: 'bold'
//         }
//       }
//     },
//     x: {
//       grid: {
//         display: false
//       },
//       title: {
//         display: true,
//         text: 'Companies',
//         font: {
//           size: 14,
//           weight: 'bold'
//         }
//       }
//     }
//   }
// };
// const sharedChartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   animation: {
//     duration: 1000,
//     easing: 'easeInOutQuart'
//   },
//   plugins: {
//     legend: {
//       position: 'top',
//       labels: {
//         padding: 20,
//         usePointStyle: true,
//         font: {
//           size: 12,
//           weight: 'bold'
//         }
//       }
//     },
//     tooltip: {
//       backgroundColor: 'rgba(255, 255, 255, 0.95)',
//       titleColor: '#333',
//       titleFont: {
//         size: 14,
//         weight: 'bold'
//       },
//       bodyColor: '#666',
//       bodyFont: {
//         size: 13
//       },
//       borderColor: '#ddd',
//       borderWidth: 1,
//       padding: 12,
//       cornerRadius: 8,
//       displayColors: true,
//       boxPadding: 3
//     }
//   },
//   scales: {
//     y: {
//       grid: {
//         display: false
//       },
//       ticks: {
//         font: {
//           size: 12,
//           weight: 'bold'
//         },
//         padding: 8
//       },
//       border: {
//         dash: [2, 4]
//       }
//     },
//     x: {
//       grid: {
//         display: false
//       },
//       ticks: {
//         font: {
//           size: 12,
//           weight: 'bold'
//         },
//         padding: 8
//       },
//       border: {
//         dash: [2, 4]
//       }
//     }
//   }
// };

// return (
//   <Box sx={{ display: "flex", position: "relative", height: "100vh", overflow: "hidden" }}>
//     <Sidebar />
//     <Box sx={{ flexGrow: 2, marginLeft: "48px", transition: "margin-left 0.3s", overflow: "hidden" }}>
//       <Navbar onThemeToggle={onThemeToggle} />
//       <Box sx={{ p: 0, marginLeft: "0px", overflow: "auto", height: "calc(100vh - 48px)" }}>
//         <Box sx={{ p: 3 }}>
//           <Typography 
//             variant="h4" 
//             sx={{ 
//               mb: 4, 
//               fontWeight: 'bold',
//               color: '#1a237e',
//               borderBottom: '3px solid #3f51b5',
//               paddingBottom: 2,
//               display: 'inline-block'
//             }}
//           >
//             Company Dashboard
//           </Typography>

//           <Grid container spacing={3}>
//             {/* Data Usage Analysis */}
//             <Grid item xs={12} md={6}>
//               <Paper 
//                 elevation={3}
//                 sx={{ 
//                   p: 3, 
//                   background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
//                   borderRadius: 2,
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     transform: 'translateY(-4px)',
//                     boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
//                   }
//                 }}
//               >
//                 <Typography 
//                   variant="h6" 
//                   sx={{ 
//                     mb: 2,
//                     fontWeight: 'bold',
//                     color: '#2c3e50',
//                     borderBottom: '2px solid #e0e0e0',
//                     paddingBottom: 1
//                   }}
//                 >
//                   Data Usage Analysis
//                 </Typography>
//                 <Box sx={{ height: 300, position: 'relative' }}>
//                   <Bar 
//                     options={{
//                       ...sharedChartOptions,
//                       ...stackedHorizontalOptions
//                     }} 
//                     data={chartConfigs.dataUsage}
//                   />
//                 </Box>
//               </Paper>
//             </Grid>

//             {/* License Allocation */}
//             <Grid item xs={12} md={6}>
//     <Paper 
//       elevation={3}
//       sx={{ 
//         p: 3,
//         background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
//         borderRadius: 2,
//         transition: 'all 0.3s ease',
//         '&:hover': {
//           transform: 'translateY(-4px)',
//           boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
//         }
//       }}
//     >
//       <Typography 
//         variant="h6" 
//         sx={{ 
//           mb: 2,
//           fontWeight: 'bold',
//           color: '#2c3e50',
//           borderBottom: '2px solid #e0e0e0',
//           paddingBottom: 1
//         }}
//       >
//         License Allocation
//       </Typography>
//       <Box sx={{ height: 300, position: 'relative' }}>
//         <Bar 
//           options={licenseChartOptions} 
//           data={chartConfigs.licenseAllocation}
//         />
//       </Box>
//     </Paper>
//   </Grid>

//             {/* License Expiry Status */}
//             <Grid item xs={12} md={6}>
//               <Paper 
//                 elevation={3}
//                 sx={{ 
//                   p: 3,
//                   background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
//                   borderRadius: 2,
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     transform: 'translateY(-4px)',
//                     boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
//                   }
//                 }}
//               >
//                 <Typography 
//                   variant="h6" 
//                   sx={{ 
//                     mb: 2,
//                     fontWeight: 'bold',
//                     color: '#2c3e50',
//                     borderBottom: '2px solid #e0e0e0',
//                     paddingBottom: 1
//                   }}
//                 >
//                   License Expiry Status
//                 </Typography>
//                 <Box sx={{ height: 300, position: 'relative' }}>
//                   <Bar 
//                     options={licenseExpiryOptions} 
//                     data={chartConfigs.licenseExpiry}
//                   />
//                 </Box>
//               </Paper>
//             </Grid>

//             {/* Cost Analysis */}
//             <Grid item xs={12} md={6}>
//               <Paper 
//                 elevation={3}
//                 sx={{ 
//                   p: 3,
//                   background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
//                   borderRadius: 2,
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     transform: 'translateY(-4px)',
//                     boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
//                   }
//                 }}
//               >
//                 <Typography 
//                   variant="h6" 
//                   sx={{ 
//                     mb: 2,
//                     fontWeight: 'bold',
//                     color: '#2c3e50',
//                     borderBottom: '2px solid #e0e0e0',
//                     paddingBottom: 1
//                   }}
//                 >
//                   Cost Analysis
//                 </Typography>
//                 <Box sx={{ height: 300, position: 'relative' }}>
//                   <Bar 
//                     options={costChartOptions} 
//                     data={chartConfigs.cost}
//                   />
//                 </Box>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>
//       </Box>
//     </Box>
//   </Box>
// );
// };

// export default CompanyDashboard;