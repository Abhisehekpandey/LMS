// FeedContext.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Divider,
} from "@mui/material";
 
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
 
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
 
function FeedContext() {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("user");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${window.__ENV__.REACT_APP_ROUTE}/mainGpt/getAllUsersChat`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: `${sessionStorage.getItem("adminEmail")}`,
            },
          }
        );
 
        const rawChats = response.data;
        console.log("rawChats", rawChats)
 
        // Group chats by username
        const grouped = {};
        rawChats.forEach(chat => {
          const user = chat.username;
          if (!grouped[user]) grouped[user] = [];
          grouped[user].push(chat);
        });
 
        console.log('chatGroup', grouped)
 
        // Process each user's chats
        const processedData = Object.entries(grouped).map(([username, chats]) => {
          // Sort chats by newest first
          chats.sort((a, b) => new Date(b.timestamps) - new Date(a.timestamps));
 
          const immediate = chats[0]; // Most recent chat
          const historical = chats; // Older chats
          console.log("Immediate", immediate)
 
          // Flatten sender messages for historical chats
          const historicalContext = historical
            .flatMap(c =>
              c.senderMessageList
                .filter(msg => msg.sender === "User")
                .map(msg => `• ${msg.message}`)
            )
            .join("\n");
 
          const historicalAnswer = historical
            .flatMap(c =>
              c.senderMessageList
                .filter(msg => msg.sender === "MainGPT")
                .map(msg => `• ${msg.message}`)
            )
            .join("\n");
 
          // Handle immediate messages separately
          const immediateContext = immediate.senderMessageList
            .filter(msg => msg.sender === "User")
            .map(msg => `• ${msg.message}`)
            .join("\n");
 
          const immediateAnswer = immediate.senderMessageList
            .filter(msg => msg.sender === "MainGPT")
            .map(msg => `• ${msg.message}`)
            .join("\n");
 
          const timestamps = immediate.timestamps.toLocaleString();
 
          return {
            user: username,
            feedType: immediate.feedType || "-",
            immediateContext: immediateContext || "-",
            immediateAnswer: immediateAnswer || "-",
            historicalContext: historicalContext || "-",
            historicalAnswer: historicalAnswer || "-",
            timestamps,
          };
        });
 
 
 
        console.log('chatprocesseddata', processedData)
 
        setRows(processedData);
      } catch (error) {
        console.error("Error fetching FeedContext data:", error);
      }
    };
    fetchData();
  }, []);
 
 
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
 
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  const sortedRows = rows.sort(getComparator(order, orderBy));
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
 
  return (
    <Box sx={{ p: 2, ml: { xs: 0, sm: "70px", md: "75px" } }}>
      <Paper
        elevation={24}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "20px",
          animation: "slideInFromLeft 0.3s ease-in-out forwards",
          opacity: 0,
          transform: "translateX(-50px)",
          "@keyframes slideInFromLeft": {
            "0%": { opacity: 0, transform: "translateX(-50px)" },
            "100%": { opacity: 1, transform: "translateX(0)" },
          },
        }}
      >
        <TableContainer sx={{ maxHeight: "83vh", height: "80vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["user", "feedType", "immediateContext", "immediateAnswer", "historicalContext", "historicalAnswer", "timestamps"].map(
                  (head) => (
                    <TableCell
                      key={head}
                      align="center"
                      sortDirection={orderBy === head ? order : false}
                      sx={{ fontWeight: "bold" }}
                    >
                      <TableSortLabel
                        active={orderBy === head}
                        direction={orderBy === head ? order : "asc"}
                        onClick={() => handleRequestSort(head)}
                      >
                        {{
                          user: "User",
                          feedType: "Feed Type",
                          immediateContext: "Immediate Feed Context",
                          immediateAnswer: "Immediate Feed Answer",
                          historicalContext: "Historical Feed Context",
                          historicalAnswer: "Historical Feed Answer",
                          timestamps: "Data Time Stamp",
                        }[head]}
                      </TableSortLabel>
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell align="center">{row.user}</TableCell>
                    <TableCell align="center">{row.feedType}</TableCell>
                    <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>{row.immediateContext}</TableCell>
                    <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>{row.immediateAnswer}</TableCell>
                    <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>{row.historicalContext}</TableCell>
                    <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>{row.historicalAnswer}</TableCell>
                    <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>{row.timestamps}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="subtitle1" color="textSecondary">
                      No Feed Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          rowsPerPageOptions={[10, 30, 60, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
 
export default FeedContext;
 




