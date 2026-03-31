import React, { useState, useEffect, useRef } from "react";
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
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { Snackbar, Alert } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { getDepartments } from "../api/departmentService";

const columns = [
  { key: "word", label: "Word", width: "12%" },
  { key: "description", label: "Description", width: "18%" },
  { key: "department", label: "Department", width: "30%" },
  { key: "date", label: "Date", width: "30%" },
  { key: "actions", label: "Action", width: "10%" },
];

export default function DataDictionary() {
  const [dictionaryData, setDictionaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const isFetching = useRef(false);

  const [departments, setDepartments] = useState([]);
  const [deptPage, setDeptPage] = useState(0);
  const [hasMoreDepts, setHasMoreDepts] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [debouncedDeptSearch, setDebouncedDeptSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [department, setDepartment] = useState(null);
  const [newWord, setNewWord] = useState("");
  const [definition, setDefinition] = useState("");

  const [recentAdditions, setRecentAdditions] = useState([]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenAddDialog = () => {
    setEditMode(false);
    setEditingRow(null);
    setDepartment(null);
    setNewWord("");
    setDefinition("");
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (row) => {
    setEditMode(true);
    setEditingRow(row);
    setDepartment({ deptName: row.department });
    setNewWord(row.word);
    setDefinition(row.description);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const updateDictionaryWord = async (payload) => {
    try {
      // since payload is an array, take the first element
      const { id, word, description, deptName } = payload[0];

      const response = await axios.put(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/editdataDictionary/${id}`,
        {
          word,
          description,
          deptName: deptName, // backend expects "deptNames"
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Failed to update dictionary word:", error);
      throw error;
    }
  };

  const handleDeleteWords = async (ids) => {
    if (!ids || ids.length === 0) return;
    try {
      await axios.delete(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/deletedataDictionary`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
          data: ids, // 👈 send array in body
        },
      );

      setDictionaryData((prev) => prev.filter((row) => !ids.includes(row.id)));
      setSelected([]); // clear selection

      setSnackbar({
        open: true,
        message: "Word(s) deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Error deleting word(s):", err);
      setSnackbar({
        open: true,
        message: "Failed to delete word(s).",
        severity: "error",
      });
    }
  };

  const fetchDictionaryData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/getdataDictionary`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        },
      );

      const data = response.data.map((item, index) => ({
        id: item.id,
        word: item.word,
        description: item.description,
        department: item.deptName,
        date: item.createdOn
          ? new Date(item.createdOn).toLocaleDateString()
          : "",
      }));

      setDictionaryData(data);

      const recentWords = data
        .filter((d) => d.word)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-5)
        .map((d) => d.word);

      setRecentAdditions(recentWords);
    } catch (err) {
      if (err.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Failed to fetch dictionary data:", err);
      setSnackbar({
        open: true,
        message: "Failed to load dictionary data.",
        severity: "error",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  const saveDictionaryWord = async (payload) => {
    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/dataDictionary`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        },
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Failed to save dictionary word:", error);
      throw error;
    }
  };

  const handleSaveWord = async () => {
    if (!newWord || !definition || !department) return;

    const payload = [
      {
        id: editingRow?.id, // include id in case of edit
        word: newWord,
        description: definition,
        deptName: department.deptName,
      },
    ];

    try {
      if (editMode) {
        await updateDictionaryWord(payload);
        setSnackbar({
          open: true,
          message: "Word updated successfully!",
          severity: "success",
        });
      } else {
        await saveDictionaryWord(payload);
        setSnackbar({
          open: true,
          message: "Word saved successfully!",
          severity: "success",
        });
      }

      setRecentAdditions((prev) => [...prev, newWord].slice(-5));
      setNewWord("");
      setDefinition("");
      setDepartment(null);
      setEditingRow(null);
      setEditMode(false);
      setOpenDialog(false);

      fetchDictionaryData();
    } catch (err) {
      console.error("Error saving/updating word:", err);
      setSnackbar({
        open: true,
        message: "Failed to save word. Please try again.",
        severity: "error",
      });
    }
  };

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
      if (updated.length > 0) newFilters[filterColumn] = updated;
      else delete newFilters[filterColumn];
      return newFilters;
    });
  };

  const filteredRows = dictionaryData.filter((row) => {
    const passesFilters = Object.entries(filters).every(([key, values]) =>
      values.length ? values.includes(row[key]) : true,
    );
    const passesSearch =
      searchTerm.trim() === "" ||
      Object.values(row).some(
        (val) =>
          typeof val === "string" &&
          val.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return passesFilters && passesSearch;
  });

  const getColumnValues = (colKey) => [
    ...new Set(dictionaryData.map((row) => row[colKey])),
  ];

  const isSelected = (id) => selected.includes(id);
  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(filteredRows.map((r) => r.id));
    else setSelected([]);
  };
  const handleClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleDownload = () => {
    const rows = dictionaryData.filter((r) => selected.includes(r.id));
    if (rows.length === 0) return;
    const headers = columns.map((c) => c.label);
    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        columns.map((c) => `"${row[c.key] ?? ""}"`).join(","),
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data_dictionary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDeptSearch(deptSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [deptSearchQuery]);

  useEffect(() => {
    if (openDialog) {
      fetchDepartments(0, debouncedDeptSearch, true);
    }
  }, [openDialog, debouncedDeptSearch]);

  const fetchDepartments = async (page, query = "", isInitial = false) => {
    if (loadingDepts || (!hasMoreDepts && !isInitial)) return;
    setLoadingDepts(true);
    try {
      const res = await getDepartments(
        page,
        10,
        query ? "deptName" : "",
        query,
      );
      if (res?.content?.length) {
        if (isInitial) {
          setDepartments(res.content);
          setDeptPage(0);
        } else {
          setDepartments((prev) => [...prev, ...res.content]);
          setDeptPage(page);
        }
        setHasMoreDepts(!res.last);
      } else {
        if (isInitial) {
          setDepartments([]);
          setDeptPage(0);
        }
        setHasMoreDepts(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Error fetching departments:", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    fetchDictionaryData();
  }, []);

  return (
    <Box sx={{ p: 2, ml: "75px" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          <MenuBookIcon sx={{ mr: 1, color: "green" }} />
          Data Dictionary
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

          <Tooltip title="Add to Dictionary" arrow>
            <IconButton
              sx={{
                bgcolor: "orange", // Solid orange background
                color: "white", // White icon
                width: 36,
                height: 36,
                "&:hover": {
                  backgroundColor: "orange", // Keep background on hover
                  animation: "glowBorder 1.5s ease-in-out infinite", // Glowing border animation
                },
                "@keyframes glowBorder": {
                  "0%": {
                    boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)",
                    borderColor: "transparent",
                  },
                  "50%": {
                    boxShadow: "0 0 12px 3px rgba(251, 68, 36, 0.8)",
                    borderColor: "rgb(251, 68, 36)",
                  },
                  "100%": {
                    boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)",
                    borderColor: "transparent",
                  },
                },
              }}
              onClick={handleOpenAddDialog}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Selected" arrow>
            <span>
              <IconButton
                color="error"
                disabled={selected.length === 0}
                onClick={() => handleDeleteWords(selected)}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>

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
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell padding="checkbox" sx={{ fontWeight: "bold" }}>
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

                {columns.map((col) => {
                  const isFiltered = Boolean(filters[col.key]);
                  return (
                    <TableCell
                      key={col.key}
                      sx={{ fontWeight: "bold", width: col.width }}
                    >
                      <Box display="flex" alignItems="center">
                        {col.label}
                        {col.key !== "actions" &&
                          (isFiltered ? (
                            <IconButton
                              size="small"
                              onClick={() =>
                                setFilters((prev) => {
                                  const updated = { ...prev };
                                  delete updated[col.key];
                                  return updated;
                                })
                              }
                            >
                              <ClearIcon fontSize="small" color="error" />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenFilter(e, col.key)}
                            >
                              <FilterListIcon fontSize="small" />
                            </IconButton>
                          ))}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
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
                        height: 40,
                        backgroundColor:
                          index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ py: 0.5 }}>
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleClick(row.id)}
                          size="small"
                        />
                      </TableCell>

                      {columns.map((col) =>
                        col.key === "actions" ? (
                          <TableCell
                            key={col.key}
                            sx={{ py: 0.5, width: col.width }}
                          >
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditDialog(row)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() => handleDeleteWords([row.id])}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        ) : (
                          <TableCell
                            key={col.key}
                            sx={{
                              py: 0.5,
                              width: col.width,
                              maxWidth:
                                col.key === "description" ? 200 : "auto", // limit width
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {col.key === "description" ? (
                              <Tooltip
                                title={row.description || ""}
                                arrow
                                placement="bottom-start"
                                slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: "0.95rem",
                                      padding: "10px 14px",
                                      maxWidth: 400,
                                      backgroundColor: "#ffffff",
                                      color: "#000000",
                                      boxShadow:
                                        "0 8px 24px rgba(149, 157, 165, 0.2)",
                                      borderRadius: "8px",
                                      border: "1px solid #e2e8f0",
                                    },
                                  },
                                  arrow: {
                                    sx: {
                                      color: "#ffffff",
                                      "&::before": {
                                        border: "1px solid #e2e8f0",
                                      },
                                    },
                                  },
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: "inline-block",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {row.description}
                                </Box>
                              </Tooltip>
                            ) : (
                              row[col.key]
                            )}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
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
          sx: {
            width: 250,
            overflow: "hidden",
            p: 0,
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid #edf2f7",
          },
        }}
        MenuListProps={{
          sx: { p: 0 },
        }}
        disableScrollLock={true}
      >
        {filterColumn && (
          <Box sx={{ p: 1.5 }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                ml: 0.5,
                mb: 1,
                display: "block",
              }}
            >
              Filter by {columns.find((c) => c.key === filterColumn)?.label}
            </Typography>
            <TextField
              size="small"
              placeholder="Search values..."
              variant="outlined"
              fullWidth
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f8fafc",
                },
              }}
              value={filters[`${filterColumn}_search`] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  [`${filterColumn}_search`]: value,
                }));
              }}
            />
            <Box
              sx={{
                maxHeight: 220,
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": {
                  width: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cbd5e0",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#a0aec0",
                },
              }}
            >
              {getColumnValues(filterColumn)
                .filter((val) =>
                  String(val || "")
                    .toLowerCase()
                    .includes(
                      (filters[`${filterColumn}_search`] || "").toLowerCase(),
                    ),
                )
                .map((val, i) => (
                  <MenuItem
                    key={i}
                    onClick={() => handleToggleFilterValue(val)}
                    sx={{
                      borderRadius: "6px",
                      mb: 0.5,
                      py: 0.5,
                      px: 1,
                      fontSize: "0.85rem",
                      "&:hover": {
                        bgcolor: "primary.lighter",
                      },
                    }}
                  >
                    <Checkbox
                      checked={filters[filterColumn]?.includes(val) || false}
                      size="small"
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                      }}
                    >
                      {val || "(Empty)"}
                    </Typography>
                  </MenuItem>
                ))}
            </Box>
            <Box
              sx={{
                mt: 1.5,
                pt: 1,
                borderTop: "1px solid #edf2f7",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  setFilters((prev) => {
                    const updated = { ...prev };
                    delete updated[filterColumn];
                    return updated;
                  });
                }}
                sx={{ fontSize: "0.75rem", textTransform: "none" }}
              >
                Clear
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleCloseFilter}
                sx={{
                  fontSize: "0.75rem",
                  textTransform: "none",
                  borderRadius: "6px",
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        )}
      </Menu>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
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
            {editMode ? "Edit Dictionary Word" : "Add to Dictionary"}
          </Typography>

          <IconButton
            onClick={handleCloseDialog}
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
              "&:hover": {
                transform: "rotate(180deg)",
              },
              transition: "transform 0.3s ease",
            }}
          >
            <CloseIcon
              sx={{
                fontSize: "1rem",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" gap={2} mb={2} width="100%">
            <Autocomplete
              options={departments}
              getOptionLabel={(option) => option.deptName || ""}
              filterOptions={(x) => x}
              onInputChange={(e, value) => setDeptSearchQuery(value)}
              value={department}
              onChange={(e, newValue) => setDepartment(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Choose Department" />
              )}
              ListboxProps={{
                style: { maxHeight: 200, overflow: "auto" },
                onScroll: (event) => {
                  const listboxNode = event.currentTarget;
                  const threshold = 50;
                  if (
                    Math.round(
                      listboxNode.scrollTop + listboxNode.clientHeight,
                    ) >=
                    listboxNode.scrollHeight - threshold
                  ) {
                    if (!loadingDepts && hasMoreDepts) {
                      fetchDepartments(
                        deptPage + 1,
                        debouncedDeptSearch,
                        false,
                      );
                    }
                  }
                },
              }}
              sx={{ flex: 0.6 }}
              loading={loadingDepts}
            />

            <TextField
              label="Add New Word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ maxLength: 20 }}
              helperText={`${newWord.length}/20`}
            />
          </Box>

          <TextField
            label="Definition"
            multiline
            minRows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 1000 }}
            helperText={`${definition.length}/1000`}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Recent Additions
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {recentAdditions.map((word, idx) => (
              <Chip key={idx} label={word} color="primary" variant="outlined" />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleSaveWord}
            disabled={!newWord || !definition || !department}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
