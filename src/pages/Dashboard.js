// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";

import UserTable from "./user/UserTable";

const Dashboard = ({ onThemeToggle, departments, setDepartments, }) => {
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: "50px",
        }}
      >
        <Box
          sx={{
            overflow: "hidden",
            height: "calc(100vh - 48px)",
          }}
        >
          <Paper elevation={24}>
            <UserTable />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
