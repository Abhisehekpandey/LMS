// FeedContext.js
import React, { useState } from "react";
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

const sampleRows = [
  {
    id: 1,
    user: "John Doe",
    feedType: "Info",
    immediateContext: "What's your name?",
    immediateAnswer: "I am ChatGPT.",
    historicalContext: "Earlier conversation...",
    historicalAnswer: "I said I'm a language model.",
    timestamp: "2025-07-23 10:45:00",
  },
  {
    id: 2,
    user: "Jane Smith",
    feedType: "Action",
    immediateContext: "Turn on the light",
    immediateAnswer: "Light is turned on.",
    historicalContext: "Last command was to shut it off.",
    historicalAnswer: "Light turned off.",
    timestamp: "2025-07-22 18:30:00",
  },
];

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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("user");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const sortedRows = sampleRows.sort(getComparator(order, orderBy));
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
                {["user", "feedType", "immediateContext", "immediateAnswer", "historicalContext", "historicalAnswer", "timestamp"].map(
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
                          timestamp: "Data Time Stamp",
                        }[head]}
                      </TableSortLabel>
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center">{row.user}</TableCell>
                  <TableCell align="center">{row.feedType}</TableCell>
                  <TableCell align="center">{row.immediateContext}</TableCell>
                  <TableCell align="center">{row.immediateAnswer}</TableCell>
                  <TableCell align="center">{row.historicalContext}</TableCell>
                  <TableCell align="center">{row.historicalAnswer}</TableCell>
                  <TableCell align="center">{row.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          rowsPerPageOptions={[10, 30, 60, 100]}
        //   component="div"
          count={sampleRows.length}
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


