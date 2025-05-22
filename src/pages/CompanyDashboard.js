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
import EChartsReact from "echarts-for-react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


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

  const [selectedResource, setSelectedResource] = useState("storage");
  const fileInputRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(""); // For search
  const [topCount, setTopCount] = useState(5); // default Top 5
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [selectedCompanyForLicense, setSelectedCompanyForLicense] = useState("");


  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

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
          April: 9,
          May: 13,
          June: 16,
          July: 5,
          August: 8,
          September: 11,
          October: 12,
          November: 14,
          December: 6
        }
      },
      {
        company: "InfoSys (Premium)",
        months: {
          January: 10,
          February: 12,
          March: 8,
          April: 11,
          May: 9,
          June: 14,
          July: 7,
          August: 5,
          September: 6,
          October: 10,
          November: 12,
          December: 4
        }
      },
      {
        company: "CloudNet (Basic)",
        months: {
          January: 5,
          February: 7,
          March: 6,
          April: 3,
          May: 4,
          June: 6,
          July: 5,
          August: 2,
          September: 3,
          October: 4,
          November: 3,
          December: 2
        }
      }
    ]
    ,



    resourceUsage: Array.from({ length: 50 }, (_, i) => ({
      shortName: `C${i + 1}`,
      company: `Company ${i + 1}`,
      storage: {
        allocated: Math.floor(Math.random() * 1000) + 500,
        consumed: Math.floor(Math.random() * 500),
      },
      cpu: {
        allocated: Math.floor(Math.random() * 200) + 50,
        consumed: Math.floor(Math.random() * 100),
      },
      ram: {
        allocated: Math.floor(Math.random() * 64) + 8,
        consumed: Math.floor(Math.random() * 64),
      }
    }))


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
  const licenseExpirationStatus = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const fullMonthMap = {
      Jan: "January",
      Feb: "February",
      Mar: "March",
      Apr: "April",
      May: "May",
      Jun: "June",
      Jul: "July",
      Aug: "August",
      Sept: "September",
      Oct: "October",
      Nov: "November",
      Dec: "December",
    };

    let soldData = [120, 200, 150, 80, 70, 110, 130, 90, 70, 80, 47, 77];
    let consumedData = [90, 150, 100, 60, 40, 80, 110, 60, 40, 50, 30, 60];

    if (selectedCompanyForLicense.trim()) {
      const search = selectedCompanyForLicense.trim().toLowerCase();
      const company = companyData.licenseConsumption.find(c =>
        c.company.toLowerCase().includes(search)
      );

      if (company) {
        soldData = months.map(short => {
          const full = fullMonthMap[short];
          return company.months[full] ?? 0;
        });
        consumedData = soldData.map(val => Math.round(val * 0.7));
      } else {
        soldData = new Array(12).fill(0);
        consumedData = new Array(12).fill(0);
      }
    }


    return {
      legend: {
        show: true,
        left: "center"
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: soldData,
          type: 'bar',
          name: 'Sold License',
          color: '#1976d2',
          label: {
            show: true,
            position: 'top',
            color: 'black',
            fontSize: 10,
            offset: [0, -10]
          }
        },
        {
          data: consumedData,
          type: 'line',
          name: 'Consumed Licenses',
          color: '#4CAF50',
          smooth: true,
          lineStyle: { width: 3 },
          label: {
            show: true,
            position: 'insideTop',
            color: 'black',
            fontSize: 10,
            offset: [0, -10]
          }
        }
      ]
    };
  }, [selectedCompanyForLicense, companyData.licenseConsumption]);


  const generateDummyProgressData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let sold = 5000, allocated = 4000, consumed = 3000;
    return monthNames.map(month => {
      sold += Math.random() * 500 - 250;      // random walk up/down
      allocated += Math.random() * 400 - 200;
      consumed += Math.random() * 300 - 150;

      return {
        name: month,
        sold: Math.round(sold),
        allocated: Math.round(allocated),
        consumed: Math.round(consumed),
      };
    });
  };

  const progressData = useMemo(() => {
    if (!selectedCompany) {
      // No search = aggregate graph
      // Just like your original setup

      return generateDummyProgressData();


    } else {
      // Filter data for selected company
      console.log('Searching for company:', selectedCompany);
      const company = companyData.dataUsage.find(c =>
        c.company.toLowerCase().includes(selectedCompany.toLowerCase())
      );

      console.log('Found company:', company);
      console.log(companyData.dataUsage.map(c => c.company));

      if (!company) {
        console.log('No company found for:', selectedCompany);
        return monthNames.map(month => ({
          name: month,
          sold: 0,
          allocated: 0,
          consumed: 0
        }));
      }


      // Mock progress generation per company
      let sold = company.sold;
      let allocated = company.actual;
      let consumed = company.consumed;

      return monthNames.map((month) => {
        sold += Math.random() * 100 - 50;
        allocated += Math.random() * 80 - 40;
        consumed += Math.random() * 60 - 30;

        return {
          name: month,
          sold: Math.max(0, Math.round(sold)),
          allocated: Math.max(0, Math.round(allocated)),
          consumed: Math.max(0, Math.round(consumed)),
        };
      });
    }
  }, [selectedYear, selectedCompany]);


  const progressOption = useMemo(() => {


    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const index = params[0].dataIndex;
          const curr = progressData[index];
          const prev = progressData[index - 1] || {};

          function formatLine(label, currVal, prevVal, color) {
            const diff = currVal - (prevVal || 0);
            const percent = prevVal ? ((diff / prevVal) * 100).toFixed(1) : '0.0';
            const arrow = diff > 0 ? '🔼' : diff < 0 ? '🔽' : '➡️';
            const sign = diff > 0 ? '+' : '';
            return `<div>
              <span style="color:${color}; font-weight:bold;">${label}:</span> 
              ${currVal} GB (${arrow} ${sign}${percent}%)
            </div>`;
          }

          return `
            <strong>${curr.name}</strong><br/>
            ${formatLine('Sold', curr.sold, prev.sold, '#1976d2')}
            ${formatLine('Allocated', curr.allocated, prev.allocated, '#4caf50')}
            ${formatLine('Consumed', curr.consumed, prev.consumed, '#ff9800')}
          `;
        }
      },
      legend: {
        data: ['Sold', 'Allocated', 'Consumed'],
        top: 10
      },
      xAxis: {
        type: 'category',
        data: progressData.map(d => d.name)
      },
      yAxis: {
        type: 'value',
        name: 'Storage (GB)'
      },
      series: [
        {
          name: 'Sold',
          type: 'line',
          smooth: true,
          data: progressData.map(d => d.sold),
          lineStyle: { width: 3, color: '#1976d2' },
          areaStyle: { color: 'rgba(25, 118, 210, 0.1)' },
        },
        {
          name: 'Allocated',
          type: 'line',
          smooth: true,
          data: progressData.map(d => d.allocated),
          lineStyle: { width: 3, color: '#4caf50' },
          areaStyle: { color: 'rgba(76, 175, 80, 0.1)' },
        },
        {
          name: 'Consumed',
          type: 'line',
          smooth: true,
          data: progressData.map(d => d.consumed),
          lineStyle: { width: 3, color: '#ff9800' },
          areaStyle: { color: 'rgba(255, 152, 0, 0.1)' },
        }
      ]
    };
  }, [progressData]);



  const getResourceBarChart = () => {
    const resource = selectedResource;

    const sortedData = [...companyData.resourceUsage]
      .map((item) => {
        const allocated = item[resource].allocated || 1; // avoid divide by zero
        const consumed = item[resource].consumed;
        const percentage = (consumed / allocated) * 100;
        return {
          ...item,
          percentage: percentage.toFixed(1), // for display
        };
      })
      .sort((a, b) => b.percentage - a.percentage) // ✅ sort by percentage
      .slice(0, topCount); // top N

    const labels = sortedData.map(item => item.shortName);
    const allocated = sortedData.map(item => item[resource].allocated);
    const consumed = sortedData.map(item => item[resource].consumed);
    const consumedPercent = sortedData.map(item => item.percentage);

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


                <FormControl sx={{ m: 1, marginLeft: " 11pc" }} size="small" >
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
                <TextField
                  type="text"
                  size="small"
                  placeholder="Search company for progress..."
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  sx={{
                    width: "250px",
                    marginRight: "1pc",
                    fontSize: "1rem",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderRadius: "20px !important"
                    }
                  }}
                />

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

                <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                  <TextField
                    type="text"
                    size="small"
                    placeholder="Search company for license..."
                    value={selectedCompanyForLicense}
                    onChange={(e) => setSelectedCompanyForLicense(e.target.value)}
                    sx={{
                      width: "250px",
                      marginRight: "1pc",
                      fontSize: "1rem",
                      ".MuiOutlinedInput-notchedOutline": {
                        borderRadius: "20px !important"
                      }
                    }}
                  />
                </div>


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
                  {` ${selectedResource.toUpperCase()} Consumers`}
                </Typography>
                <div>
                  <FormControl size="small" sx={{ ml: 1, marginRight: "1pc" }}>
                    <Select
                      value={topCount}
                      onChange={(e) => setTopCount(Number(e.target.value))}
                    >
                      <MenuItem value={5}>Top 5</MenuItem>
                      <MenuItem value={10}>Top 10</MenuItem>
                      <MenuItem value={20}>Top 20</MenuItem>
                      <MenuItem value={companyData.resourceUsage.length}>All</MenuItem>
                    </Select>
                  </FormControl>
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