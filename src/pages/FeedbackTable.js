import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";

import FeedbackIcon from "@mui/icons-material/Feedback";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";

const feedbackRows = [
  {
    id: 1,
    department: "Human Resource",
    user: "John Mauris",
    document: "Offer Letter.docx",
    role: "Editor",
    source: "DocuTalk",
    feedback: "like",
    latestFBC: "What is leave Policy?",
    latestFBA: "The leave policy for employees is strict.",
    date: "25-08-2025",
    time: "12:26 p.m.",
    status: "APPROVED",
  },
  {
    id: 2,
    department: "Finance",
    user: "Akhil Gupta",
    document: "Purchase.pptx",
    role: "Viewer",
    source: "DBTalk",
    feedback: "dislike",
    latestFBC: "Receivables for this year?",
    latestFBA: "The total receivables for FY 2025 are $1.25",
    date: "25-08-2025",
    time: "12:26 p.m.",
    status: "REJECTED",
  },
  {
    id: 3,
    department: "IT",
    user: "Sanya Roy",
    document: "IT Policy.pdf",
    role: "Contributor",
    source: "DocuTalk",
    feedback: "like",
    latestFBC: "IT support hours?",
    latestFBA: "IT support is available from 9am-6pm",
    date: "25-08-2025",
    time: "1:15 p.m.",
    status: "VIEW",
  },
  {
    id: 4,
    department: "Marketing",
    user: "Rohit Sharma",
    document: "Campaign Plan.docx",
    role: "Editor",
    source: "DocuTalk",
    feedback: "like",
    latestFBC: "Q3 campaign budget?",
    latestFBA: "The Q3 marketing budget is $50,000",
    date: "26-08-2025",
    time: "10:00 a.m.",
    status: "APPROVED",
  },
  {
    id: 5,
    department: "Sales",
    user: "Priya Singh",
    document: "Leads.xlsx",
    role: "Viewer",
    source: "DBTalk",
    feedback: "dislike",
    latestFBC: "Top leads this month?",
    latestFBA: "Top leads are listed in the spreadsheet",
    date: "26-08-2025",
    time: "11:45 a.m.",
    status: "VIEW",
  },
  {
    id: 6,
    department: "Finance",
    user: "Amit Verma",
    document: "Invoice.pdf",
    role: "Contributor",
    source: "DocuTalk",
    feedback: "like",
    latestFBC: "Pending invoices?",
    latestFBA: "There are 5 pending invoices this month",
    date: "26-08-2025",
    time: "2:30 p.m.",
    status: "REJECTED",
  },
  {
    id: 7,
    department: "Human Resource",
    user: "Neha Kapoor",
    document: "Training Schedule.xlsx",
    role: "Editor",
    source: "DBTalk",
    feedback: "like",
    latestFBC: "Next training date?",
    latestFBA: "Next training is on 30th August",
    date: "27-08-2025",
    time: "9:15 a.m.",
    status: "APPROVED",
  },
  {
    id: 8,
    department: "IT",
    user: "Vikram Joshi",
    document: "Server Report.pdf",
    role: "Viewer",
    source: "DocuTalk",
    feedback: "dislike",
    latestFBC: "Server downtime logs?",
    latestFBA: "Downtime logged on 22nd August for 2 hours",
    date: "27-08-2025",
    time: "3:45 p.m.",
    status: "VIEW",
  },
  {
    id: 9,
    department: "Marketing",
    user: "Anjali Mehra",
    document: "Social Media Plan.docx",
    role: "Contributor",
    source: "DBTalk",
    feedback: "like",
    latestFBC: "Instagram engagement stats?",
    latestFBA: "Engagement increased by 15% last week",
    date: "28-08-2025",
    time: "11:00 a.m.",
    status: "REJECTED",
  },
  {
    id: 10,
    department: "Sales",
    user: "Rahul Desai",
    document: "Client Contracts.pdf",
    role: "Editor",
    source: "DocuTalk",
    feedback: "like",
    latestFBC: "Top client contracts?",
    latestFBA: "Top 3 clients this month are listed in the document",
    date: "28-08-2025",
    time: "4:20 p.m.",
    status: "APPROVED",
  },
];

const columns = [
  { key: "document", label: "Document" },
  { key: "department", label: "Department" },
  { key: "user", label: "User" },
  { key: "role", label: "Role" },
  { key: "source", label: "Source" },
  { key: "feedback", label: "Feedback" },
  { key: "latestChat", label: "Latest Chat" }, // merged column
  { key: "dateTime", label: "Date & Time" },
  { key: "status", label: "Status" },
];

const ChatHistoryDialog = ({ open, onClose, row }) => {
  const [selectedChats, setSelectedChats] = React.useState([]);

  const sortedHistory = React.useMemo(() => {
    if (!row) return [];

    const history = [
      {
        question: row.latestFBC || "",
        answer: row.latestFBA || "",
        date: row.date || "",
        time: row.time || "",
      },
      {
        question: "Previous question?",
        answer: "Previous answer...",
        date: "24-08-2025",
        time: "10:30 a.m.",
      },
    ];

    return [...history].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
  }, [row]);

  React.useEffect(() => {
    if (sortedHistory.length > 0) {
      setSelectedChats([sortedHistory.length - 1]);
    }
  }, [sortedHistory]);

  const toggleChatSelection = (index) => {
    setSelectedChats((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleApprove = () => console.log("Approve clicked", row);
  const handleReject = () => console.log("Reject clicked", row);
  const handleDelete = () => console.log("Delete clicked", row);

  const handleDownloadHistory = (historyData, rowData) => {
    if (!historyData || historyData.length === 0) return;

    const headers = ["Question", "Answer", "Date", "Time"];
    const csvRows = [
      headers.join(","),
      ...historyData.map(
        (chat) =>
          `"${chat.question}","${chat.answer}","${chat.date}","${chat.time}"`
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${rowData?.user || "chat_history"}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          backgroundColor: "primary.main",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            fontFamily: '"Be Vietnam", sans-serif',
            color: "#fff",
          }}
        >
          Chat History
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#fff",
            width: 32,
            height: 32,
            border: "1px solid",
            borderColor: "#fff",
            bgcolor: "error.lighter",
            borderRadius: "50%",
            position: "relative",
            "&:hover": { transform: "rotate(180deg)" },
            transition: "transform 0.3s ease",
          }}
        >
          <CloseIcon
            sx={{ fontSize: "1rem", transition: "transform 0.2s ease" }}
          />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {sortedHistory.map((chat, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            gap={0.5}
            mb={2}
          >
            <Box display="flex" alignItems="flex-start" gap={1}>
              <Checkbox
                checked={selectedChats.includes(index)}
                onChange={() => toggleChatSelection(index)}
                size="small"
              />
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    backgroundColor: "#e0e0e0",
                    borderRadius: 2,
                    p: 1,
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                    {chat.question}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {chat.date} {chat.time}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Box
                sx={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  borderRadius: 2,
                  p: 1,
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2">{chat.answer}</Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 1 }}
              >
                {chat.date} {chat.time}
              </Typography>
            </Box>
          </Box>
        ))}

        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Tooltip title="Download History" arrow>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleDownloadHistory(sortedHistory, row)}
            >
              <SimCardDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box display="flex" gap={1}>
            {row.status === "VIEW" ? (
              <>
                <Tooltip title="Approve" arrow>
                  <IconButton
                    color="success"
                    size="small"
                    onClick={handleApprove}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject" arrow>
                  <IconButton color="error" size="small" onClick={handleReject}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton color="error" size="small" onClick={handleDelete}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Delete" arrow>
                <IconButton color="error" size="small" onClick={handleDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default function FeedbackTable() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenFilter = (event, column) => {
    setAnchorEl(event.currentTarget);
    setFilterColumn(column);
  };
  const handleCloseFilter = () => {
    setAnchorEl(null);
    setFilterColumn(null);
  };
  const handleToggleFilterValue = (value) => {
    setFilters((prev) => {
      const current = prev[filterColumn] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const newFilters = { ...prev };
      if (updated.length > 0) {
        newFilters[filterColumn] = updated;
      } else {
        delete newFilters[filterColumn];
      }
      return newFilters;
    });
  };

  const filteredRows = feedbackRows.filter((row) => {
    const passesFilters = Object.entries(filters).every(([key, values]) => {
      if (values.length === 0) return true;

      if (key === "latestChat") {
        const combined = `${row.latestFBC} ${row.latestFBA}`;
        return values.some((v) => combined.includes(v));
      }

      if (key === "dateTime") {
        const combined = `${row.date} ${row.time}`;
        return values.some((v) => combined.includes(v));
      }

      return values.includes(row[key]);
    });

    const passesSearch =
      searchTerm.trim() === "" ||
      Object.values(row).some(
        (val) =>
          typeof val === "string" &&
          val.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return passesFilters && passesSearch;
  });

  const getColumnValues = (colKey) => {
    if (colKey === "latestChat") {
      return [
        ...new Set(
          feedbackRows.map((row) => `${row.latestFBC} ${row.latestFBA}`)
        ),
      ];
    }
    if (colKey === "dateTime") {
      return [...new Set(feedbackRows.map((row) => `${row.date} ${row.time}`))];
    }
    return [...new Set(feedbackRows.map((row) => row[colKey]))];
  };

  const isSelected = (id) => selected.includes(id);
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(filteredRows.map((r) => r.id));
    } else {
      setSelected([]);
    }
  };
  const handleClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDownload = () => {
    const rows = feedbackRows.filter((r) => selected.includes(r.id));
    if (rows.length === 0) return;

    const headers = columns.map((c) => c.label);
    const csvRows = [
      headers.join(","), // header row
      ...rows.map((row) =>
        columns.map((c) => `"${row[c.key] ?? ""}"`).join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "feedback_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 2, ml: "75px" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          <FeedbackIcon sx={{ mr: 1, color: "orange" }} />
          Feedback Table
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            placeholder="Search"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              borderRadius: 3,
              backgroundColor: "#fff",
              "& fieldset": { border: "none" },
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Tooltip title="Download" arrow>
            <span>
              <IconButton
                color="primary"
                disabled={selected.length === 0}
                onClick={handleDownload}
              >
                <SimCardDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 450 }}>
          <Table stickyHeader size="small">
            <TableHead sx={{ backgroundColor: "#fffdfdff" }}>
              <TableRow sx={{ height: 30 }}>
                {" "}
                <TableCell
                  padding="checkbox"
                  sx={{ fontWeight: "bold", py: 0.5 }}
                >
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < filteredRows.length
                    }
                    checked={
                      filteredRows.length > 0 &&
                      selected.length === filteredRows.length
                    }
                    onChange={handleSelectAllClick}
                    size="small"
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{ fontWeight: "bold", py: 0.5, fontSize: "0.8rem" }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {col.label}
                      {filters[col.key] ? (
                        <IconButton
                          size="small"
                          sx={{ p: 0.3 }}
                          onClick={() => {
                            setFilters((prev) => {
                              const updated = { ...prev };
                              delete updated[col.key];
                              return updated;
                            });
                          }}
                        >
                          <ClearIcon fontSize="small" color="error" />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          sx={{ p: 0.3 }}
                          onClick={(e) => handleOpenFilter(e, col.key)}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      height: 28,

                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ py: 0.5 }}>
                      <Checkbox
                        checked={isSelected(row.id)}
                        onChange={() => handleClick(row.id)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 0.5,
                        fontSize: "0.8rem",
                        color: "blue",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 200, // adjust width as needed
                      }}
                    >
                      {row.document}
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 0.5,
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 180, // adjust width as needed
                      }}
                    >
                      {row.department}
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 0.5,
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 160, // adjust width as needed
                      }}
                    >
                      {row.user}
                    </TableCell>

                    <TableCell sx={{ py: 0.5, fontSize: "0.8rem" }}>
                      {row.role}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: "0.8rem" }}>
                      {row.source}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, width: 50, maxWidth: 50 }}>
                      {row.feedback === "like" ? (
                        <ThumbUpIcon color="success" fontSize="small" />
                      ) : (
                        <ThumbDownIcon color="error" fontSize="small" />
                      )}
                    </TableCell>

                    <TableCell
                      sx={{ py: 0.5, fontSize: "0.8rem", maxWidth: 240 }}
                    >
                      <Tooltip
                        arrow
                        title={
                          <Box sx={{ maxWidth: 400, whiteSpace: "normal" }}>
                            <Typography
                              fontWeight="bold"
                              sx={{ fontSize: "0.85rem", whiteSpace: "normal" }}
                            >
                              {row.latestFBC}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.8rem", whiteSpace: "normal" }}
                            >
                              {row.latestFBA}
                            </Typography>
                          </Box>
                        }
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap", // keep truncation only in table cell
                            maxWidth: 180,
                          }}
                        >
                          <Typography
                            noWrap
                            fontWeight="bold"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {row.latestFBC}
                          </Typography>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {row.latestFBA}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell sx={{ py: 0.5, fontSize: "0.8rem" }}>
                      <Typography variant="body2" fontWeight="bold">
                        {row.time}
                      </Typography>
                      <Typography variant="body2">{row.date}</Typography>
                    </TableCell>

                    <TableCell sx={{ py: 0.5 }}>
                      <Chip
                        label={row.status}
                        size="small"
                        onClick={() => {
                          setSelectedRow(row);
                          setHistoryOpen(true);
                        }}
                        sx={{
                          color: "black",
                          fontSize: "0.8rem",
                          height: 20,
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          backgroundImage:
                            row.status === "APPROVED"
                              ? "repeating-linear-gradient(45deg, #4caf5070, #4caf5070 2px, #4caf5040 2px, #4caf5040 4px)"
                              : row.status === "REJECTED"
                              ? "repeating-linear-gradient(45deg, #f4433670, #f4433670 2px, #f4433640 2px, #f4433640 4px)"
                              : "repeating-linear-gradient(45deg, #2196f370, #2196f370 2px, #2196f340 2px, #2196f340 4px)",
                          borderRadius: 1,
                          minWidth: 90,
                          textAlign: "center",
                          justifyContent: "center",
                          border:
                            row.status === "APPROVED"
                              ? "1px solid #4caf50" // green
                              : row.status === "REJECTED"
                              ? "1px solid #f44336" // red
                              : "1px solid #2196f3", // blue (VIEW)
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 0.5 }}>
                      <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="center"
                        gap={0.5}
                      >
                        {row.status === "VIEW" ? (
                          <>
                            <Tooltip title="Approve" arrow>
                              <IconButton
                                color="success"
                                size="small"
                                sx={{ p: 0.3 }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Reject" arrow>
                              <IconButton
                                color="error"
                                size="small"
                                sx={{ p: 0.3 }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete" arrow>
                              <IconButton
                                color="error"
                                size="small"
                                sx={{ p: 0.3 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              color="error"
                              size="small"
                              sx={{ p: 0.3 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <ChatHistoryDialog
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            row={selectedRow}
          />
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Per page"
          labelDisplayedRows={({ from, to, count }) =>
            `Showing ${from}-${to} of ${count}`
          }
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseFilter}
        PaperProps={{
          style: { maxHeight: 300, width: 220 }, // control dropdown size
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            size="small"
            placeholder="Search..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
          {filterColumn &&
            getColumnValues(filterColumn)
              .filter((option) =>
                option.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((option) => {
                const selectedVal =
                  filters[filterColumn]?.includes(option) || false;
                return (
                  <MenuItem
                    key={option}
                    onClick={() => handleToggleFilterValue(option)}
                  >
                    <Checkbox checked={selectedVal} size="small" />
                    <Typography variant="body2">{option}</Typography>
                  </MenuItem>
                );
              })}
        </Box>
      </Menu>
    </Box>
  );
}
