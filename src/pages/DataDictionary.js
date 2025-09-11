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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";

const dictionaryRows = [
  {
    id: 1,
    word: "Onboarding",
    description: "Process of integrating a new employee",
    department: "Human Resource",
    date: "25-08-2025",
  },
  {
    id: 2,
    word: "Ledger",
    description: "Financial record of transactions",
    department: "Finance",
    date: "26-08-2025",
  },
  {
    id: 3,
    word: "Firewall",
    description: "Network security system",
    department: "IT",
    date: "26-08-2025",
  },
  {
    id: 4,
    word: "Campaign",
    description: "Planned set of marketing activities",
    department: "Marketing",
    date: "27-08-2025",
  },
  {
    id: 5,
    word: "Lead",
    description: "Potential sales contact",
    department: "Sales",
    date: "28-08-2025",
  },
  {
    id: 6,
    word: "Compliance",
    description: "Adherence to legal and regulatory requirements",
    department: "Legal",
    date: "29-08-2025",
  },
  {
    id: 7,
    word: "Encryption",
    description: "Process of securing data by encoding",
    department: "IT",
    date: "30-08-2025",
  },
  {
    id: 8,
    word: "Budgeting",
    description: "Process of planning future income and expenses",
    department: "Finance",
    date: "31-08-2025",
  },
  {
    id: 9,
    word: "Retention",
    description: "Strategies to retain employees in an organization",
    department: "Human Resource",
    date: "01-09-2025",
  },
  {
    id: 10,
    word: "Segmentation",
    description: "Dividing market into distinct customer groups",
    department: "Marketing",
    date: "02-09-2025",
  },
  {
    id: 11,
    word: "Prospect",
    description: "Potential customer identified for sales",
    department: "Sales",
    date: "03-09-2025",
  },
  {
    id: 12,
    word: "Patent",
    description: "Legal protection for an invention",
    department: "Legal",
    date: "04-09-2025",
  },
  {
    id: 13,
    word: "Bandwidth",
    description: "Maximum data transfer rate of a network",
    department: "IT",
    date: "05-09-2025",
  },
  {
    id: 14,
    word: "Payroll",
    description: "System for paying employee salaries",
    department: "Human Resource",
    date: "06-09-2025",
  },
  {
    id: 15,
    word: "Forecasting",
    description: "Predicting future business trends",
    department: "Finance",
    date: "07-09-2025",
  },
];

const columns = [
  { key: "word", label: "Word" },
  { key: "description", label: "Description" },
  { key: "department", label: "Department" },
  { key: "date", label: "Date" },
];

export default function DataDictionary() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [department, setDepartment] = useState(null);
  const [newWord, setNewWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [recentAdditions, setRecentAdditions] = useState([
    "Repository",
    "Curriculum",
    "Ambiguity",
    "Optimization",
  ]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveWord = () => {
    if (!newWord || !definition || !department) return;
    setRecentAdditions([newWord, ...recentAdditions]);
    setNewWord("");
    setDefinition("");
    setDepartment(null);
    setOpenDialog(false);
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

  const filteredRows = dictionaryRows.filter((row) => {
    const passesFilters = Object.entries(filters).every(([key, values]) =>
      values.length ? values.includes(row[key]) : true
    );
    const passesSearch =
      searchTerm.trim() === "" ||
      Object.values(row).some(
        (val) =>
          typeof val === "string" &&
          val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return passesFilters && passesSearch;
  });

  const getColumnValues = (colKey) => [
    ...new Set(dictionaryRows.map((row) => row[colKey])),
  ];

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
    const rows = dictionaryRows.filter((r) => selected.includes(r.id));
    if (rows.length === 0) return;
    const headers = columns.map((c) => c.label);
    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        columns.map((c) => `"${row[c.key] ?? ""}"`).join(",")
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
            <IconButton color="success" onClick={handleOpenDialog}>
              <LibraryAddIcon />
            </IconButton>
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
                    <TableCell key={col.key} sx={{ fontWeight: "bold" }}>
                      <Box display="flex" alignItems="center">
                        {col.label}
                        {isFiltered ? (
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
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
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
                      height: 40,
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff", // alternate colors
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ py: 0.5 }}>
                      <Checkbox
                        checked={isSelected(row.id)}
                        onChange={() => handleClick(row.id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.word}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.description}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.department}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{row.date}</TableCell>
                  </TableRow>
                ))}
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
          style: { maxHeight: 300, width: 220 }, // limit height
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
            Add to Dictionary
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
              options={[
                "IT",
                "HR",
                "Finance",
                "Admin",
                "Operations",
                "Support",
                "Legal",
                "Engineering",
                "Design",
                "Product",
                "Security",
                "QA",
              ]}
              value={department}
              onChange={(e, newValue) => setDepartment(newValue)}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} label="Choose Department" />
              )}
              ListboxProps={{
                style: {
                  maxHeight: 200,
                  overflow: "auto",
                },
              }}
              sx={{ flex: 0.6 }}
            />

            <TextField
              label="Add New Word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label="Definition"
            multiline
            minRows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            fullWidth
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
    </Box>
  );
}
