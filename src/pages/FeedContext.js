import React, { useState } from "react";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import Avatar from "@mui/material/Avatar";
import {
  Menu,
  Checkbox,
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
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  Grid,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { parseISO, isAfter, isBefore } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { InputAdornment, Tooltip, IconButton } from "@mui/material";

const dummyData = [
  {
    user: "john.doe@example.com",
    feedType: "Like",
    fileName: "dashboard_update.pdf",
    immediateContext: "• What is the latest update?",
    immediateAnswer: "• The latest update includes UI enhancements.",
    timestamps: "2025-08-01 10:30 AM",
  },
  {
    user: "john.doe@example.com",
    feedType: "Like",
    fileName: "dashboard_update.pdf",
    immediateContext: "• What is the latest update?",
    immediateAnswer: "• The latest update includes UI enhancements.",
    timestamps: "2025-08-01 10:30 AM",
  },
  {
    user: "john.doe@example.com",
    feedType: "Like",
    fileName: "dashboard_update.pdf",
    immediateContext: "• What is the latest update?",
    immediateAnswer: "• The latest update includes UI enhancements.",
    timestamps: "2025-08-01 10:30 AM",
  },
  {
    user: "john.doe@example.com",
    feedType: "Like",
    fileName: "dashboard_update.pdf",
    immediateContext: "• What is the latest update?",
    immediateAnswer: "• The latest update includes UI enhancements.",
    timestamps: "2025-08-01 10:30 AM",
  },
  {
    user: "jane.smith@example.com",
    feedType: "Dislike",
    fileName: "theme_feedback.docx",
    immediateContext: "• The system is slow sometimes.",
    immediateAnswer: "• We are optimizing performance.",
    timestamps: "2025-08-01 09:15 AM",
  },
];

const dummyChatHistory = [
  {
    type: "question",
    avatar: "user",
    text: "• What updates were made last week?",
    timestamp: "2025-07-25 10:00 AM",
  },
  {
    type: "answer",
    avatar: "system",
    text: "• Last week we improved the search performance.",
    timestamp: "2025-07-25 10:01 AM",
  },
  {
    type: "question",
    avatar: "user",
    text: "• Was the download issue fixed?",
    timestamp: "2025-07-25 10:05 AM",
  },
  {
    type: "answer",
    avatar: "system",
    text: "• Yes, it was resolved in v2.1.3.",
    timestamp: "2025-07-25 10:06 AM",
  },
  {
    type: "question",
    avatar: "user",
    text: "• Who requested the new theme?",
    timestamp: "2025-07-25 10:10 AM",
  },
  {
    type: "answer",
    avatar: "system",
    text: "• The UX team suggested the change.",
    timestamp: "2025-07-25 10:11 AM",
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

const searchableColumns = [
  { value: "user", label: "User" },
  { value: "feedType", label: "Feedback Type" },
  { value: "fileName", label: "File Name" },
  { value: "immediateContext", label: "Immediate Context" },
  { value: "immediateAnswer", label: "Immediate Answer" },
  { value: "timestamps", label: "Timestamp" },
];

const allColumns = [
  { id: "user", label: "User" },
  { id: "feedType", label: "Feedback Type" },
  { id: "fileName", label: "File Name" },
  { id: "immediateContext", label: "Immediate Feed Context" },
  { id: "immediateAnswer", label: "Immediate Feed Answer" },
  { id: "timestamps", label: "Data Time Stamp" },
  { id: "action", label: "Action" },
];

function FeedContext() {
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyType, setHistoryType] = useState("all");

  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);

  const [rows] = useState(dummyData);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("user");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchColumn, setSearchColumn] = useState("user");
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const [columnFilters, setColumnFilters] = useState(
    allColumns.reduce((acc, col) => ({ ...acc, [col.id]: "" }), {})
  );

  const dropdownColumns = ["feedType", "fileName"];

  const getUniqueValues = (key) => {
    const values = rows.map((r) => r[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const filteredHistory = selectedHistory.filter((chat) => {
    const chatDate = parseISO(
      new Date(chat.timestamp).toISOString().split("T")[0]
    );

    const isAfterStart = historyStartDate
      ? isAfter(chatDate, parseISO(historyStartDate)) ||
        chatDate.getTime() === parseISO(historyStartDate).getTime()
      : true;

    const isBeforeEnd = historyEndDate
      ? isBefore(chatDate, parseISO(historyEndDate)) ||
        chatDate.getTime() === parseISO(historyEndDate).getTime()
      : true;

    const matchesType = historyType === "all" || chat.type === historyType;

    return isAfterStart && isBeforeEnd && matchesType;
  });

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

  const filteredRows = rows.filter((row) => {
    // global text match
    const matchesGlobal = row[searchColumn]
      ?.toLowerCase()
      .includes(searchText.toLowerCase());

    // date filtering
    const rowDate = parseISO(
      new Date(row.timestamps).toISOString().split("T")[0]
    );
    const afterStart = startDate
      ? isAfter(rowDate, parseISO(startDate)) ||
        rowDate.getTime() === parseISO(startDate).getTime()
      : true;
    const beforeEnd = endDate
      ? isBefore(rowDate, parseISO(endDate)) ||
        rowDate.getTime() === parseISO(endDate).getTime()
      : true;

    // per-column filters
    const columnMatch = Object.entries(columnFilters).every(
      ([colKey, filterVal]) => {
        if (!filterVal || !visibleColumns[colKey]) return true;
        return row[colKey]?.toLowerCase().includes(filterVal.toLowerCase());
      }
    );

    return matchesGlobal && afterStart && beforeEnd && columnMatch;
  });

  const sortedRows = filteredRows.sort(getComparator(order, orderBy));
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const isAnyFilterActive =
    !!searchText ||
    !!startDate ||
    !!endDate ||
    Object.values(columnFilters).some((val) => val !== "");

  const downloadUserChatHistory = (user, chatHistory) => {
    const content = chatHistory
      .map(
        (chat) =>
          `[${chat.timestamp}] ${chat.avatar === "user" ? "User" : "System"}: ${
            chat.text
          }`
      )
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user}_chat_history.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2, ml: { xs: 0, sm: "70px", md: "75px" } }}>
      <Paper
        elevation={2}
        sx={{
          px: 2,
          py: 2,
          borderRadius: "20px",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#fff",
          animation: "slideInFromLeft 0.3s ease-in-out forwards",
          opacity: 0,
          transform: "translateX(-50px)",
          "@keyframes slideInFromLeft": {
            "0%": { opacity: 0, transform: "translateX(-50px)" },
            "100%": { opacity: 1, transform: "translateX(0)" },
          },
        }}
      >
        {/* Search Bar Row */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            justifyContent: "flex-start",
            mb: 2,
          }}
        >
          <TextField
            select
            size="small"
            label="By"
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 130 }}
          >
            {searchableColumns.map((col) => (
              <MenuItem key={col.value} value={col.value}>
                {col.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label="Search"
            variant="outlined"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="From">
            <TextField
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Tooltip>

          <Tooltip title="To">
            <TextField
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Tooltip>

          <Tooltip title="Clear All Filters">
            <span>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchText("");
                  setStartDate("");
                  setEndDate("");
                  setColumnFilters(
                    allColumns.reduce(
                      (acc, col) => ({ ...acc, [col.id]: "" }),
                      {}
                    )
                  );
                }}
                disabled={!isAnyFilterActive}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Clear
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Show/Hide Columns">
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenMenu}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Columns
            </Button>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              style: {
                maxHeight: 320,
                width: "200px",
              },
            }}
          >
            {allColumns.map((col) => (
              <MenuItem key={col.id}>
                <Checkbox
                  checked={visibleColumns[col.id]}
                  onChange={() =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [col.id]: !prev[col.id],
                    }))
                  }
                />
                {col.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="contained"
            size="small"
            color="primary"
            sx={{ ml: "auto", textTransform: "none", fontWeight: 500 }}
            onClick={() => console.log("Top Download clicked")}
          >
            Download
          </Button>
        </Box>

        <TableContainer sx={{ maxHeight: "70vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {allColumns
                  .filter((col) => visibleColumns[col.id])
                  .map((col) => (
                    <TableCell
                      key={col.id}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        px: 0.5,
                        py: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.id !== "action" ? (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.0,
                          }}
                        >
                          <TableSortLabel
                            active={orderBy === col.id}
                            direction={orderBy === col.id ? order : "asc"}
                            onClick={() => handleRequestSort(col.id)}
                          >
                            <span style={{ fontSize: "0.82rem" }}>
                              {col.label}
                            </span>
                          </TableSortLabel>

                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Select
                              value={columnFilters[col.id]}
                              onChange={(e) =>
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [col.id]: e.target.value,
                                }))
                              }
                              displayEmpty
                              variant="standard"
                              disableUnderline
                              sx={{
                                minWidth: 14,
                                fontSize: "0.7rem",
                                backgroundColor: "transparent",
                                ml: 0.1,
                                "& .MuiSelect-select": {
                                  padding: "0 18px 0 2px", // leave space for ✖
                                },
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: { maxHeight: 200 },
                                },
                              }}
                            >
                              <MenuItem value="">
                                <em> </em>
                              </MenuItem>
                              {getUniqueValues(col.id).map((val) => (
                                <MenuItem key={val} value={val}>
                                  {val}
                                </MenuItem>
                              ))}
                            </Select>

                            {/* ✖ Clear Filter Button */}
                            {columnFilters[col.id] && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setColumnFilters((prev) => ({
                                    ...prev,
                                    [col.id]: "",
                                  }))
                                }
                                sx={{
                                  position: "absolute",
                                  right: 0,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  padding: "2px",
                                }}
                              >
                                <ClearIcon sx={{ fontSize: "0.8rem" }} />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, idx) => (
                  <TableRow key={idx} hover>
                    {visibleColumns["user"] && (
                      <TableCell align="center">{row.user}</TableCell>
                    )}
                    {visibleColumns["feedType"] && (
                      <TableCell align="center">{row.feedType}</TableCell>
                    )}
                    {visibleColumns["fileName"] && (
                      <TableCell align="center">{row.fileName}</TableCell>
                    )}
                    {visibleColumns["immediateContext"] && (
                      <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>
                        {row.immediateContext}
                      </TableCell>
                    )}
                    {visibleColumns["immediateAnswer"] && (
                      <TableCell align="left" sx={{ whiteSpace: "pre-line" }}>
                        {row.immediateAnswer}
                      </TableCell>
                    )}
                    {visibleColumns["timestamps"] && (
                      <TableCell align="center">{row.timestamps}</TableCell>
                    )}
                    {visibleColumns["action"] && (
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="View History">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedHistory(dummyChatHistory); // use dummy for now
                                setOpenHistoryDialog(true);
                              }}
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Feed">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                downloadUserChatHistory(
                                  row.user,
                                  dummyChatHistory
                                );
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
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
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog
          open={openHistoryDialog}
          onClose={() => setOpenHistoryDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: (theme) => theme.palette.primary.main,
              color: "#fff",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Chat History
            <IconButton
              onClick={() => setOpenHistoryDialog(false)}
              sx={{ color: "#fff" }}
            >
              <ClearIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555",
              },
            }}
          >
            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={historyStartDate}
                onChange={(e) => setHistoryStartDate(e.target.value)}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={historyEndDate}
                onChange={(e) => setHistoryEndDate(e.target.value)}
              />
              <TextField
                select
                label="Type"
                size="small"
                value={historyType}
                onChange={(e) => setHistoryType(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="question">Question</MenuItem>
                <MenuItem value="answer">Answer</MenuItem>
              </TextField>
            </Stack>

            {filteredHistory.length > 0 ? (
              filteredHistory.map((chat, idx) => {
                const isUser = chat.avatar === "user";

                return (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: isUser ? "flex-start" : "flex-end",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={(theme) => {
                        const isDark = theme.palette.mode === "dark";
                        const isUser = chat.avatar === "user";
                        return {
                          maxWidth: "75%",
                          bgcolor: isDark
                            ? theme.palette.primary.main
                            : isUser
                            ? "grey.200"
                            : theme.palette.primary.main,
                          color: isDark || !isUser ? "#fff" : "text.primary",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          borderTopLeftRadius: isUser ? 0 : 2,
                          borderTopRightRadius: isUser ? 2 : 0,
                          boxShadow: 1,
                        };
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.75rem", opacity: 0.7, mb: 0.5 }}
                      >
                        {chat.timestamp}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-line" }}
                      >
                        {chat.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Typography>No history found with selected filters.</Typography>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default FeedContext;
