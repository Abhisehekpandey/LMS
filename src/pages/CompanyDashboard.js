import React from "react";
import { Box, Paper, Typography, Grid, Divider, TextField } from "@mui/material";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as echarts from "echarts";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { CircularProgress, keyframes, styled } from '@mui/material';
import ReactEChart from "echarts-for-react"
// Add this with your other imports

// Add these imports for table functionality
import {

  Button

} from '@mui/material';
import { useState, useEffect, useMemo } from "react";
import { useRef } from "react";
import { ArrowBackIos } from "@mui/icons-material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EChartsReact from "echarts-for-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled overlay
const LoaderWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1300,
  animation: `${fadeIn} 0.6s ease-in-out`,
}));

// Styled CircularProgress
const CustomSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: '70px !important',
  height: '70px !important',
  animation: `${pulse} 1.5s infinite`,
}));
const pulse = keyframes`
  0% {
    transform: scale(1); // Start at normal size
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); // Start with a faint blue glow
  }
  70% {
    transform: scale(1.05); // Slightly enlarge the element
    box-shadow: 0 0 0 15px rgba(25, 118, 210, 0); // Blue glow expands but fades out
  }
  100% {
    transform: scale(1); // Back to original size
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); // Glow disappears
  }
`;
const CompanyDashboard = ({ onThemeToggle }) => {

  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState("storage");
  const fileInputRef = useRef(null);
  const ITEMS_PER_PAGE = 1;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
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
    licenseConsumption: [
      {
        company: "TechCorp (Enterprise)",
        months: {
          January: 15,
          February: 20,
          March: 10,
          // Aur months ko add kar le
        }
      },
      // Baaki companies ka data bhi yeh format mein
    ]
    ,
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

    resourceUsage: [
      {
        shortName: "C1",
        company: "TechCorp (Enterprise)",
        storage: { allocated: 1024, consumed: 717 },
        cpu: { allocated: 200, consumed: 150 },
        ram: { allocated: 32, consumed: 24 }
      },
      {
        shortName: "C2",
        company: "InfoSys (Premium)",
        storage: { allocated: 6144, consumed: 2048 },
        cpu: { allocated: 180, consumed: 90 },
        ram: { allocated: 48, consumed: 30 }
      },
      {
        shortName: "C3",
        company: "DataTech (Standard)",
        storage: { allocated: 4096, consumed: 1024 },
        cpu: { allocated: 100, consumed: 50 },
        ram: { allocated: 16, consumed: 12 }
      },
      {
        shortName: "C4",
        company: "CloudNet (Basic)",
        storage: { allocated: 3072, consumed: 2048 },
        cpu: { allocated: 120, consumed: 96 },
        ram: { allocated: 24, consumed: 20 }
      }
    ]

  });
  const [selectedYear, setSelectedYear] = useState(2025);
  const fullData = useRef(
    Array.from({ length: 5000 }, (_, i) => {
      const sold = Math.floor(Math.random() * 10000) + 1000;         // 1TB to 11TB
      const allocated = Math.floor(sold * 0.8); // 80% of sold
      const consumed = Math.floor(allocated * Math.random()); // up to 100% of allocated

      return {
        name: `C${i + 1}`,
        shortName: `C${i + 1}`,
        sold,
        actual: allocated,
        consumed,
      };
    })
  );

  // Filtered data based on search
  const filteredData = fullData.current.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const getPaginatedData = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  };
  const paginatedOption = useMemo(() => {
    const pageData = getPaginatedData();

    const labels = pageData.map((item) => item.name);
    const sold = pageData.map(item => item.sold);
    const allocated = pageData.map(item => item.actual);
    const consumed = pageData.map(item => item.consumed);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" }
      },
      legend: {
        top: 10,
        data: ["Sold", "Allocated", "Consumed"]
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          interval: 0,
          rotate: 20,
          formatter: (value) =>
            value.length > 10 ? value.match(/.{1,10}/g).join("\n") : value
        }
      },
      yAxis: {
        type: "value",
        name: "Storage (GB)"
      },
      series: [
        {
          name: "Sold",
          type: "bar",
          stack: "total", // Stack the bars
          data: sold,
          itemStyle: { color: "#1976d2" }, // Blue
        },
        {
          name: "Allocated",
          type: "bar",
          stack: "total", // Stack the bars
          data: allocated,
          itemStyle: { color: "#4caf50" }, // Green
        },
        {
          name: "Consumed",
          type: "bar",
          stack: "total", // Stack the bars
          data: consumed,
          itemStyle: { color: "#ff9800" }, // Orange
        }
      ]
    };
  }, [currentPage, searchTerm]);
  // licenseExpirationStatus
  const licenseExpirationStatus = {
    legend: {
      show: true,
      left: "center"
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      axisLabel: {
        interval: 0,   // har label dikhana
        rotate: 0      // ghumana mana hai bhai
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130, 90, 70, 80, 47, 77], // Bar chart data
        type: 'bar',
        name: 'sold license',
        color: '#1976d2', // blue color for the bars
        label: {
          show: true, // Enable showing the label
          position: 'top', // Position the label above the point
          color: 'black', // Color of the label (same as the line)
          fontSize: 10, // Font size for the label
          offset: [0, -10]
        }
      },
      {
        data: [90, 150, 100, 60, 40, 80, 110, 60, 40, 50, 30, 60], // Consumed licenses (line chart data)
        type: 'line',
        name: 'Consumed Licenses',
        color: '#4CAF50', // Orange color for the line
        smooth: true, // Smooth the line curve
        lineStyle: {
          width: 3 // Line thickness
        },
        label: {
          show: true, // Enable showing the label
          position: 'top', // Position the label above the point
          color: 'black', // Color of the label (same as the line)
          fontSize: 10, // Font size for the label
          position: 'insideTop',
          offset: [0, -10]
        }
      }
    ]
  };
  const progressData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let value = 500 + Math.random() * 500; // base value changes slightly per year
    const data = [];

    for (let i = 0; i < 12; i++) {
      value += Math.random() * 100 - 50; // monthly fluctuation
      data.push({
        name: monthNames[i],
        value: [monthNames[i], Math.round(value)]
      });
    }

    return data;
  }, [selectedYear]); // 👈 depends on selectedYear
  const progressOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const param = params[0];
        return `${param.name} : ${param.value[1]} GB`;
      },
      axisPointer: {
        animation: false
      }
    },
    xAxis: {
      type: 'category', // 👈 key change here!
      data: progressData.map(d => d.name),
      axisLine: { show: true },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Storage (GB)',
      boundaryGap: [0, '100%'],
      splitLine: { show: false }
    },
    series: [
      {
        name: 'Storage Growth',
        type: 'line',
        showSymbol: true,
        smooth: true,
        data: progressData.map(d => d.value),
        lineStyle: { color: '#4CAF50', width: 3 },
        areaStyle: { color: 'rgba(76, 175, 80, 0.2)' }
      }
    ]
  }), [progressData]);

  const getResourceBarChart = () => {
    const resource = selectedResource;
    const data = companyData.resourceUsage;
    const labels = data.map(item => item.shortName);
    const allocated = data.map(item => item[resource].allocated);
    const consumed = data.map(item => item[resource].consumed);

    const consumedPercent = consumed.map((val, i) =>
      ((val / (allocated[i] || 1)) * 100).toFixed(1)
    );

    return {

      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          const i = params[0].dataIndex;
          return `${labels[i]}: ${consumed[i]} / ${allocated[i]} (${consumedPercent[i]}%)`;
        }
      },
      xAxis: {
        type: "category",
        data: labels
      },
      yAxis: {
        type: "value",
        name: "%",
        min: 0,
        max: 100
      },
      series: [
        {
          type: "bar",
          data: consumedPercent,
          label: {
            show: true,
            position: "top",
            formatter: val => `${val.value}%`
          },
          itemStyle: {
            color: "#4CAF50"
          }
        }
      ]
    };
  };
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <LoaderWrapper>
        <CustomSpinner />
      </LoaderWrapper>
    );
  }
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
        <Grid container spacing={2} padding={1}>

          <Grid item xs={6} md={6} lg={6}>
            <Paper elevation={10} sx={{ borderRadius: "20px" }} >
              <div style={{ display: "flex", padding: "6px", justifyContent: "space-between", alignItems: "center" }}>

                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '15px',
                    fontWeight: "bold",
                    color: "#2c3e50b3",
                    // borderBottom: "2px solid #e0e0e0",
                    // paddingBottom: 1,
                    textAlign: "center",
                    // borderRadius: "6px"
                  }}
                >
                  Storage Usage Analysis
                </Typography>
                <TextField
                  type="text"
                  size="small"
                  placeholder="Search company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    // borderRadius: "20px !important",
                    width: "250px",
                    fontSize: "1rem",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderRadius: "20px !important"
                    }
                  }}
                />
              </div>
              <Divider />
              <div>

                <EChartsReact
                  option={paginatedOption}
                  style={{ width: "100%", height: "400px" }}
                />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>

                  {filteredData.length === 0 ? (
                    <p style={{ textAlign: "center" }}>No matching companies found.</p>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                      >
                        <ArrowBackIos />   Prev
                      </Button>
                      <span>
                        Page {currentPage + 1} of {totalPages}
                      </span>
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages - 1)
                          )
                        }
                        disabled={currentPage >= totalPages - 1}
                      >
                        Next <ArrowForwardIosIcon />
                      </Button>
                    </div>
                  )}
                </Box>
              </div>
            </Paper>
          </Grid> <Grid item xs={6} md={6} lg={6}>
            <Paper elevation={10} sx={{ borderRadius: "20px" }}>
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>

                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '15px',
                    fontWeight: "bold",
                    color: "#2c3e50b3",
                    // borderBottom: "2px solid #e0e0e0",
                    padding: 1.8,
                    // textAlign: "center",
                    borderRadius: "6px"
                  }}
                >
                  Progress graph
                </Typography>
                <FormControl sx={{ m: 1 }} size="small">
                  <InputLabel id="year-select-label">Year</InputLabel>
                  <Select
                    labelId="year-select-label"
                    id="year-select"
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </div>
              <Divider />
              <Box sx={{ height: 435, position: "relative" }}>
                <EChartsReact option={progressOption} sx={{ height: "100%", width: "100%" }}
                  opts={{ height: 400 }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={6} lg={6}>

            <Paper elevation={10} sx={{ borderRadius: "20px" }}>
              <div style={{ padding: "6px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '15px',
                    fontWeight: "bold",
                    color: "#2c3e50b3",
                    // borderBottom: "2px solid #e0e0e0",
                    // paddingBottom: 1,
                    textAlign: "center",
                    borderRadius: "6px",
                    padding: '6px'

                  }}
                >
                  License Analysis
                </Typography>
              </div>
              <Divider />
              <Box sx={{ height: 306 }}>
                <ReactEChart option={licenseExpirationStatus} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={6} lg={6}>
            <Paper elevation={10} sx={{ borderRadius: "20px" }}>

              <div style={{ alignItems: 'center', display: 'flex', padding: '6px', justifyContent: 'space-between' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '15px',
                    fontWeight: "bold",
                    color: "#2c3e50b3",
                    // borderBottom: "2px solid #e0e0e0",
                    // paddingBottom: 1,
                    textAlign: "center",
                    borderRadius: "6px"
                  }}
                >
                  {`Top ${selectedResource.toUpperCase()} Consumers`}
                </Typography>
                <div>
                  <FormControl size="small" >
                    {/* <InputLabel id="resource-select-label">Select Resource</InputLabel> */}
                    <Select
                      labelId="resource-select-label"
                      value={selectedResource}
                      onChange={(e) => setSelectedResource(e.target.value)}
                    >
                      <MenuItem value="storage">Storage</MenuItem>
                      <MenuItem value="cpu">CPU</MenuItem>
                      <MenuItem value="ram">RAM</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Resource Filter */}

              <Divider />
              <Box sx={{ height: 300, position: "relative" }}>
                <EChartsReact option={getResourceBarChart()} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box >
  );
};

export default CompanyDashboard;