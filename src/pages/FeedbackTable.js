import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
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
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  ButtonBase,
  Grid,
  Card,
  Button,
} from "@mui/material";

import FeedbackIcon from "@mui/icons-material/Feedback";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CloseIcon from "@mui/icons-material/Close";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";


const columns = [
  { key: "document", label: "Document" },
  { key: "department", label: "Department" },
  { key: "user", label: "User" },
  { key: "role", label: "Role" },
  { key: "source", label: "Source" },
  { key: "feedback", label: "Feedback" },
  { key: "latestChat", label: "Latest Chat" },
  { key: "dateTime", label: "Date & Time" },
  { key: "status", label: "Status" },
];

const cardShadow = "0 8px 24px rgba(44, 60, 80, 0.06)";

const ChatHistoryDialog = ({
  open,
  onClose,
  row,
  handleUpdateAction,
  setSnackbar,
  setSnackbarOpen,
}) => {
  const [selectedChats, setSelectedChats] = useState([]);

  const hasSelected = selectedChats.length > 0;

  const sortedHistory = useMemo(() => {
    if (!row || !row.feedResponses) return [];
    return [...row.feedResponses].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [row]);

  useEffect(() => {
    setSelectedChats([]); // start with no selection
  }, [sortedHistory]);

  const toggleChatSelection = (index) => {
    setSelectedChats((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleBulkAction = async (actionType) => {
    try {
      for (const idx of selectedChats) {
        const chat = sortedHistory[idx];
        if (chat.responseId || chat.responseId == null) {
          await handleUpdateAction(
            row.conversationId,
            chat.responseId,
            actionType
          );
        }
      }
      setSnackbar({
        message: `${actionType} successful for selected chats!`,
        severity: "success",
      });
      setSnackbarOpen(true);
      onClose(); // close dialog after action
    } catch (err) {
      setSnackbar({
        message: `Failed to ${actionType} chats`,
        severity: "error",
      });
      setSnackbarOpen(true);
    }
  };

  const handleDownloadHistory = (historyData, rowData, downloadAll = false) => {
    if (!historyData || historyData.length === 0) return;

    const dataToDownload = downloadAll
      ? historyData
      : historyData.filter((_, idx) => selectedChats.includes(idx));

    if (dataToDownload.length === 0) return; // nothing to download

    const headers = ["Question", "Answer", "Date", "Time"];
    const csvRows = [
      headers.join(","),
      ...dataToDownload.map(
        (chat) =>
          `"${chat.questionText}","${chat.answerText}","${chat.date}","${chat.time || ""
          }"`
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
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
          color: "#fff",
        }}
      >
        <Typography variant="h6">Chat History</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {sortedHistory.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ height: 200 }}
          >
            <Typography variant="body2" color="text.secondary">
              No history found
            </Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" alignItems="center" mb={2}>
              <Checkbox
                checked={selectedChats.length === sortedHistory.length}
                indeterminate={
                  selectedChats.length > 0 &&
                  selectedChats.length < sortedHistory.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedChats(sortedHistory.map((_, i) => i)); // select all
                  } else {
                    setSelectedChats([]); // clear all
                  }
                }}
              />
              <Typography variant="body2">Select All</Typography>
            </Box>
            {sortedHistory.map((chat, index) => (
              <Box
                key={index}
                display="flex"
                flexDirection="column"
                gap={0.5}
                mb={2}
              >
                <Box display="flex" alignItems="flex-start" gap={1}>
                  {chat.status === 1 || chat.status === -1 ? (
                    chat.actionType === "Approved" ? (
                      <Tooltip title="Approved">
                        <CheckIcon sx={{ color: "green" }} />
                      </Tooltip>
                    ) : chat.actionType === "rejected" ? (
                      <Tooltip title="Rejected">
                        <ClearIcon sx={{ color: "red" }} />
                      </Tooltip>
                    ) : (
                      <Checkbox
                        checked={selectedChats.includes(index)}
                        onChange={() => toggleChatSelection(index)}
                        size="small"
                      />
                    )
                  ) : null}

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
                      <Typography variant="body2" noWrap>
                        {chat.questionText}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {new Date(chat.date).toLocaleDateString()}{" "}
                      {new Date(chat.date).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      maxWidth: "70%",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        borderRadius: 2,
                        p: 1,
                        wordBreak: "break-word",
                        alignSelf: "flex-end",
                      }}
                    >
                      <Typography
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: chat.answerText }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                        mt: 0.3,
                      }}
                    >
                      {chat.status === 1 && (
                        <ThumbUpIcon
                          fontSize="small"
                          sx={{ color: "limegreen" }}
                        />
                      )}
                      {chat.status === -1 && (
                        <ThumbDownIcon fontSize="small" sx={{ color: "red" }} />
                      )}
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {new Date(chat.date).toLocaleDateString()}{" "}
                    {new Date(chat.date).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
              <Tooltip title="Download Selected">
                <span>
                  <IconButton
                    color="primary"
                    size="small"
                    disabled={selectedChats.length === 0}
                    onClick={() =>
                      handleDownloadHistory(sortedHistory, row, false)
                    }
                  >
                    <SimCardDownloadIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Download All">
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={() =>
                    handleDownloadHistory(sortedHistory, row, true)
                  }
                >
                  <SimCardDownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Approve Selected">
                <span>
                  <IconButton
                    color="success"
                    size="small"
                    disabled={!hasSelected}
                    onClick={() => handleBulkAction("Approved")}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Reject Selected">
                <span>
                  <IconButton
                    color="error"
                    size="small"
                    disabled={!hasSelected}
                    onClick={() => handleBulkAction("Rejected")}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function FeedbackTable() {

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
  });
  const [feedbackRows, setFeedbackRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState(0); // 0 = ALL, 1 = APPROVED, 2 = REJECTED

  const stats = useMemo(() => {
    const totalFeedbackCount = feedbackRows.length;
    const likesCount = feedbackRows.filter((r) => r.feedback === "like").length;
    const dislikesCount = feedbackRows.filter((r) => r.feedback === "dislike").length;

    return [
      {
        key: "feedback",
        label: "Total Feedback",
        value: totalFeedbackCount,
        icon: "/icons/feedback.png",
        accentBg: "rgba(37, 211, 102, 0.12)",
      },
      {
        key: "likes",
        label: "Total Likes",
        value: likesCount,
        icon: "/icons/likes.png",
        accentBg: "rgba(105, 92, 255, 0.08)",
      },
      {
        key: "dislikes",
        label: "Total Dislikes",
        value: dislikesCount,
        icon: "/icons/dislikes.png",
        accentBg: "rgba(255, 99, 132, 0.08)",
      },
    ];
  }, [feedbackRows]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${window.__ENV__.REACT_APP_ROUTE}/mainGpt/feedbackData`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: `${sessionStorage.getItem("adminEmail")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch feedback");
        const data = await res.json();

        const rows = [];
        data.feedback.forEach((item) => {
          item.feedResponses.forEach((fr) => {
            const status = fr.actionType || "VIEW";

            rows.push({
              id: `${item.id}-${fr.query_id}-${fr.date}`,
              department: item.department || "N/A",
              conversationId: item.conversationId,
              user: item.username || "N/A",
              role: item.role || "N/A",
              source: item.source || "N/A",
              document: "N/A",
              latestChat: `${fr.questionText} / ${fr.answerText}`,
              latestFBC: fr.questionText || "",
              latestFBA: fr.answerText || "",
              feedback:
                fr.status === 1 ? "like" : fr.status === -1 ? "dislike" : "N/A",
              date: fr.date ? new Date(fr.date).toLocaleDateString() : "N/A",
              time: fr.date ? new Date(fr.date).toLocaleTimeString() : "N/A",
              status: status,
              responseId: fr.responseId, //  add this
              feedResponses: item.feedResponses || [], // <- keep all responses for the document
            });
          });
        });

        setFeedbackRows(rows);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const fetchChatHistory = async (conversationId) => {
    try {
      const res = await fetch(
        `${window.__ENV__.REACT_APP_ROUTE}/mainGpt/history/?conversationId=${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch chat history");
      const data = await res.json();
      return data.history || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleDelete = async (conversationId) => {
    if (!conversationId) return;

    try {
      const res = await fetch(
        `${window.__ENV__.REACT_APP_ROUTE}/mainGpt/deleteFeedback?conversationId=${conversationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete feedback");

      setFeedbackRows((prev) =>
        prev.filter((row) => row.conversationId !== conversationId)
      );

      setSnackbar({
        message: "Feedback deleted successfully",
        severity: "success",
      });
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error deleting feedback:", err);

      setSnackbar({ message: "Failed to delete feedback", severity: "error" });
      setSnackbarOpen(true);
    }
  };

  const updateAction = async (conversationId, responseId, actionType) => {
    try {
      const res = await fetch(
        `${window.__ENV__.REACT_APP_ROUTE}/mainGpt/updateAction?conversationId=${conversationId}&responseId=${responseId}&actionType=${actionType}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Failed to ${actionType}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleUpdateAction = async (conversationId, responseId, actionType) => {
    try {
      await updateAction(conversationId, responseId, actionType);

      setFeedbackRows((prevRows) =>
        prevRows.map((row) => {
          if (
            row.conversationId === conversationId &&
            row.responseId === responseId
          ) {
            return { ...row, status: actionType }; // update status
          }
          return row;
        })
      );

      setSnackbar({
        message: `${actionType} successful!`,
        severity: "success",
      });
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbar({
        message: `Failed to ${actionType}`,
        severity: "error",
      });
      setSnackbarOpen(true);
    }
  };

  const truncateText = (text, wordLimit = 5) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + " ...";
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
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
      if (updated.length > 0) newFilters[filterColumn] = updated;
      else delete newFilters[filterColumn];
      return newFilters;
    });
  };

  const filteredRows = useMemo(() => {
    return feedbackRows.filter((row) => {
      if (activeTab === 1 && row.status !== "Approved") return false;
      if (activeTab === 2 && row.status !== "rejected") return false;
      if (activeTab === 3 && row.status !== "VIEW") return false;

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
  }, [filters, searchTerm, feedbackRows, activeTab]);

  const getColumnValues = (colKey) => {
    if (colKey === "latestChat")
      return [
        ...new Set(
          feedbackRows.map((row) => `${row.latestFBC} ${row.latestFBA}`)
        ),
      ];
    if (colKey === "dateTime")
      return [...new Set(feedbackRows.map((row) => `${row.date} ${row.time}`))];
    return [...new Set(feedbackRows.map((row) => row[colKey]))];
  };

  const isSelected = (id) => selected.includes(id);
  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(filteredRows.map((r) => r.id));
    else setSelected([]);
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
      headers.join(","),
      ...rows.map((row) =>
        columns.map((c) => `"${row[c.key] ?? ""}"`).join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "feedback_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2, ml: "75px" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" fontWeight={700}>
            <FeedbackIcon sx={{ mr: 1, color: "orange" }} />
            Feedback Table
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                minWidth: "auto",
                fontSize: "0.9rem",
                textTransform: "none",
                fontWeight: 600,
              },
              "& .Mui-selected": {
                fontWeight: "bold",
                color: "black",
              },
            }}
          >
            <Tab label="ALL" />
            <Tab label="APPROVED" />
            <Tab label="REJECTED" />
            <Tab label="VIEW" />
          </Tabs>
        </Box>

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

      <Grid container spacing={3} sx={{ mb: 2 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={4} md={4} key={s.key}>
            <Card
              elevation={0}
              sx={{
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: cardShadow,
                px: 2,
                py: 1.8,
                minHeight: 100,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: s.accentBg,
                  boxShadow: "0 6px 18px rgba(19, 39, 63, 0.04)",
                }}
              >
                <img
                  src={s.icon}
                  alt={`${s.key}-icon`}
                  style={{ width: 34, height: 34, objectFit: "contain" }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800} color="#1f2937">
                  {s.value.toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", mt: 0.6, fontWeight: 600 }}
                >
                  {s.label}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 450 }}>
          <Table stickyHeader size="small">
            <TableHead sx={{ backgroundColor: "#fffdfdff" }}>
              <TableRow sx={{ height: 30 }}>
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      No Records Found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows
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
                          maxWidth: 200,
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
                          maxWidth: 180,
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
                          maxWidth: 160,
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

                      <TableCell sx={{ py: 0.5, maxWidth: 240 }}>
                        <Tooltip
                          arrow
                          title={
                            <Box sx={{ maxWidth: 400, whiteSpace: "normal" }}>
                              <Typography
                                fontWeight="bold"
                                sx={{ fontSize: "0.85rem" }}
                              >
                                {row.latestFBC}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "0.8rem" }}
                                dangerouslySetInnerHTML={{ __html: row.latestFBA }}
                              />
                            </Box>
                          }
                        >
                          <Box>
                            <Typography
                              fontWeight="bold"
                              sx={{ fontSize: "0.85rem", lineHeight: 1.2 }}
                            >
                              {row.latestFBC}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.80rem",
                                lineHeight: 1.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "normal"
                              }}
                              dangerouslySetInnerHTML={{ __html: row.latestFBA }}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>

                      <TableCell sx={{ py: 0.5 }}>
                        <Box display="flex" flexDirection="column">
                          <Typography
                            fontWeight="bold"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            {row.date}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.time}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 0.5, textAlign: "left" }}>
                        <Tooltip title={row.status} arrow>
                          <ButtonBase
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const fullHistory = await fetchChatHistory(
                                row.conversationId
                              );
                              setSelectedRow({
                                ...row,
                                feedResponses: fullHistory,
                              });
                              setHistoryOpen(true);
                            }}
                            sx={{
                              "& img": {
                                width: 120,
                                height: 42,
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.2)" },
                              },
                            }}
                          >
                            <Box
                              component="img"
                              src={
                                row.status === "Approved"
                                  ? "/images/approved_logo.png"
                                  : row.status === "rejected"
                                    ? "/images/rejected_logo.png"
                                    : "/images/view_logo.png"
                              }
                              alt={row.status}
                            />
                          </ButtonBase>
                        </Tooltip>
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
                                  onClick={() =>
                                    handleUpdateAction(
                                      row.conversationId,
                                      row.responseId,
                                      "Approved"
                                    )
                                  }
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reject" arrow>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    handleUpdateAction(
                                      row.conversationId,
                                      row.responseId,
                                      "rejected"
                                    )
                                  }
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete" arrow>
                                <IconButton
                                  color="error"
                                  size="small"
                                  sx={{ p: 0.3 }}
                                  onClick={() => handleDelete(row.conversationId)}
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
                                onClick={() => handleDelete(row.conversationId)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <ChatHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        row={selectedRow}
        handleUpdateAction={handleUpdateAction}
        setSnackbar={setSnackbar}
        setSnackbarOpen={setSnackbarOpen}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseFilter}
        PaperProps={{
          sx: { maxHeight: 250, width: 200, p: 1 }, // maxHeight for scroll
        }}
      >
        {filterColumn && (
          <>
            <TextField
              size="small"
              placeholder="Search..."
              variant="outlined"
              fullWidth
              sx={{ mb: 1 }}
              value={filters[`${filterColumn}_search`] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  [`${filterColumn}_search`]: value,
                }));
              }}
            />
            <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
              {getColumnValues(filterColumn)
                .filter((val) =>
                  val
                    .toLowerCase()
                    .includes(
                      (filters[`${filterColumn}_search`] || "").toLowerCase()
                    )
                )
                .map((val, i) => (
                  <MenuItem
                    key={i}
                    onClick={() => handleToggleFilterValue(val)}
                  >
                    <Checkbox
                      checked={filters[filterColumn]?.includes(val) || false}
                      size="small"
                    />
                    {val}
                  </MenuItem>
                ))}
            </Box>
          </>
        )}
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
