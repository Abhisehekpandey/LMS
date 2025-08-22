import React, { useState, useEffect, useRef } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Checkbox,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Select,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel as MuiFormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";

const attributeTemplate = {
  name: "",
  type: "STRING",
  defaultValue: "",
  mandatory: false,
  description: "",
  mandatory: false, // ✅ ensure this is present
};

const attributeTypes = ["STRING", "NUMBER", "DATE", "BOOLEAN"];

const DepartmentTypeSetting = () => {
  const [fileTypes, setFileTypes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [orderBy, setOrderBy] = useState("typeName");
  const [order, setOrder] = useState("asc");
  const [openDialog, setOpenDialog] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [attributes, setAttributes] = useState([attributeTemplate]);
  const [typeScope, setTypeScope] = useState("global");
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentPage, setDepartmentPage] = useState(0);
  const [hasMoreDepartments, setHasMoreDepartments] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [typeNames, setTypeNames] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("typeName");
  const [searchText, setSearchText] = useState("");

  const fetchUsers = async (page = 0) => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/users`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
            pageNumber: page.toString(),
          },
        }
      );
      if (res.data?.content?.length) {
        setUsers((prev) => [...prev, ...res.data.content]);
        setUserPage(page);
        setHasMoreUsers(true);
      } else {
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };
  const fetchDepartments = async (page = 0) => {
    try {
      setLoadingDepartments(true);
      const res = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
          params: {
            pageNumber: page,
            pageSize: 10,
            search: "",
          },
        }
      );
      if (res.data?.content?.length) {
        setDepartments((prev) => [...prev, ...res.data.content]);
        setDepartmentPage(page);
        setHasMoreDepartments(true);
      } else {
        setHasMoreDepartments(false);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "typeName") {
      if (b.toLowerCase() < a.toLowerCase()) return -1;
      if (b.toLowerCase() > a.toLowerCase()) return 1;
    }
    return 0;
  };

  const stableSort = (array, comparator) => {
    if (orderBy === "sno") {
      return [...array]
        .map((el, idx) => ({ idx, el }))
        .sort((a, b) => (order === "asc" ? a.idx - b.idx : b.idx - a.idx))
        .map((obj) => obj.el);
    }
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const isSelected = (index) => selected.indexOf(index) !== -1;

  const handleClick = (index) => {
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = [...selected, index];
    } else {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = fileTypes.map((_, index) => index);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const fetchFileTypes = async () => {
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/dms_service_LM/api/getAllFileType`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        }
      );
      setFileTypes(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch file types", error);
    }
  };

  useEffect(() => {
    fetchFileTypes();
  }, []);

  // const sortedRows = stableSort(fileTypes, getComparator(order, orderBy));
  const filteredRows = fileTypes.filter((row) => {
    const value =
      searchColumn === "typeName"
        ? row
        : searchColumn === "createdBy"
        ? row.createdBy || ""
        : searchColumn === "for"
        ? row.scope || ""
        : "";

    return value.toLowerCase().includes(searchText.toLowerCase());
  });

  const sortedRows = stableSort(filteredRows, getComparator(order, orderBy));

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleUserDropdownScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      hasMoreUsers &&
      !loadingUsers
    ) {
      fetchUsers(userPage + 1);
    }
  };

  const handleDepartmentDropdownScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      hasMoreDepartments &&
      !loadingDepartments
    ) {
      fetchDepartments(departmentPage + 1);
    }
  };

  const handleDialogSubmit = async () => {
    const payload = {
      type: documentType,
      attributeList: attributes.map((attr) => ({
        attributeName: attr.name,
        attributeType: attr.type.toLowerCase(),
        value: attr.defaultValue,
        fileTypeDescription: attr.description,
        isMandatory: attr.mandatory, // ✅ Add this line
      })),
      users: typeScope === "user" ? [selectedEntityId] : [],
      departments: typeScope === "department" ? [selectedEntityId] : [],
      global: typeScope === "global",
    };

    try {
      const res = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/createType`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );

      setSnackbar({
        open: true,
        message: "New type created successfully",
        severity: "success",
      });

      // Reset form state
      setOpenDialog(false);
      setDocumentType("");
      setAttributes([{ ...attributeTemplate }]);
      setTypeScope("global");
      setSelectedEntityId("");

      // Refetch data if needed
      fetchFileTypes();
    } catch (error) {
      console.error("Error creating new type:", error);
      setSnackbar({
        open: true,
        message: "Failed to create type",
        severity: "error",
      });
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleAttributeRemove = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { ...attributeTemplate }]);
  };
  const handleDeleteType = (typeNameToDelete) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${typeNameToDelete}"?`
    );
    if (!confirm) return;

    const updatedTypes = typeNames.filter((name) => name !== typeNameToDelete);
    setTypeNames(updatedTypes);

    setSnackbar({
      open: true,
      message: `"${typeNameToDelete}" deleted successfully`,
      severity: "success",
    });
  };

  return (
    <Box sx={{ pt: 1.5, px: 3, ml: "72px" }}>
      <Paper
        elevation={20}
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
        {/* <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 2 }}>
          <TextField
            select
            size="small"
            label="By"
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="typeName">Type Name</MenuItem>
            <MenuItem value="createdBy">Created By</MenuItem>
            <MenuItem value="for">For</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          <Tooltip title="Clear All Filters">
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearchText("");
                setSearchColumn("typeName");
              }}
            >
              Clear
            </Button>
          </Tooltip>
        </Box> */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 2 }}>
          <TextField
            select
            size="small"
            label="By"
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            sx={{
              minWidth: 130,
              height: 30,
              "& .MuiInputBase-root": {
                height: 30,
                fontSize: "0.8rem",
              },
              "& .MuiInputLabel-root": {
                top: "-6px",
              },
            }}
          >
            <MenuItem value="typeName">Type Name</MenuItem>
            <MenuItem value="createdBy">Created By</MenuItem>
            <MenuItem value="for">For</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 200,
              height: 30,
              "& .MuiInputBase-root": {
                height: 30,
                fontSize: "0.8rem",
              },
              "& .MuiInputLabel-root": {
                top: "-6px",
              },
            }}
          />

          <Tooltip title="Clear All Filters">
            <span>
              {" "}
              {/* Wrap in span to avoid Tooltip warning on disabled button */}
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchText("");
                  setSearchColumn("typeName");
                }}
                disabled={!searchText.trim()}
                sx={{
                  height: 30,
                  fontSize: "0.75rem",
                  padding: "0 12px",
                }}
              >
                Clear
              </Button>
            </span>
          </Tooltip>
        </Box>

        <TableContainer sx={{ maxHeight: "80vh", height: "80vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  height: 36,
                  backgroundColor: "#1976d2",
                  "& td, & th": {
                    padding: "6px 8px",
                    textAlign: "center",
                    color: "black",
                    fontWeight: "bold",
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paginatedRows.length
                    }
                    checked={
                      paginatedRows.length > 0 &&
                      selected.length === paginatedRows.length
                    }
                    onChange={handleSelectAllClick}
                    sx={{ color: "black" }}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "sno"}
                    direction={orderBy === "sno" ? order : "asc"}
                    onClick={() => handleRequestSort("sno")}
                  >
                    S.No
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "typeName"}
                    direction={orderBy === "typeName" ? order : "asc"}
                    onClick={() => handleRequestSort("typeName")}
                  >
                    Type Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>For</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Created By</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Created On</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((typeName, index) => (
                <TableRow
                  key={index}
                  hover
                  selected={isSelected(index)}
                  sx={{ height: 36, "& td": { padding: "6px 8px" } }}
                >
                  <TableCell padding="checkbox" sx={{ textAlign: "center" }}>
                    <Checkbox
                      checked={isSelected(index)}
                      onChange={() => handleClick(index)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{typeName}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>—</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>—</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>—</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteType(typeName)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                    No entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 15]}
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            "& .MuiTablePagination-toolbar": {
              px: 2,
              py: 1,
              justifyContent: "flex-start",
            },
          }}
        />
      </Paper>

      <Tooltip title="Add New Type">
        <IconButton
          onClick={() => setOpenDialog(true)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 38,
            backgroundColor: "orange",
            color: "white",
            boxShadow:
              "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)",
            "&:hover": {
              backgroundColor: "orange",
              animation: "glowBorder 1.5s ease-in-out infinite",
            },
            "@keyframes glowBorder": {
              "0%": {
                boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)",
                borderColor: "transparent",
              },
              "50%": {
                boxShadow: "0 0 20px 5px rgba(251, 68, 36, 0.8)",
                borderColor: "rgb(251, 68, 36)",
              },
              "100%": {
                boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)",
                borderColor: "transparent",
              },
            },
          }}
        >
          <Add fontSize="medium" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          Add New Type
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <RadioGroup
                row
                value={typeScope}
                onChange={(e) => setTypeScope(e.target.value)}
              >
                <FormControlLabel
                  value="user"
                  control={<Radio />}
                  label="User"
                />
                <FormControlLabel
                  value="department"
                  control={<Radio />}
                  label="Department"
                />
                <FormControlLabel
                  value="global"
                  control={<Radio />}
                  label="Global"
                />
              </RadioGroup>
            </FormControl>

            {(typeScope === "user" || typeScope === "department") && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>
                  Select {typeScope === "user" ? "User" : "Department"}
                </InputLabel>
                <Select
                  value={selectedEntityId}
                  label={`Select ${
                    typeScope === "user" ? "User" : "Department"
                  }`}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300 },
                      onScroll:
                        typeScope === "user"
                          ? handleUserDropdownScroll
                          : typeScope === "department"
                          ? handleDepartmentDropdownScroll
                          : undefined,
                    },
                  }}
                >
                  {(typeScope === "user" ? users : departments).map(
                    (entity) => (
                      <MenuItem key={entity.id} value={entity.id}>
                        {entity.name || entity.deptName}
                      </MenuItem>
                    )
                  )}
                  {(typeScope === "user" && loadingUsers) ||
                  (typeScope === "department" && loadingDepartments) ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : null}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              sx={{ mb: 2 }}
            />

            {attributes.map((attr, index) => (
              <Grid container spacing={2} key={index} mb={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Attribute Name"
                    value={attr.name}
                    onChange={(e) =>
                      handleAttributeChange(index, "name", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={attr.type}
                    onChange={(e) =>
                      handleAttributeChange(index, "type", e.target.value)
                    }
                  >
                    {attributeTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Default Value"
                    value={attr.defaultValue}
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        "defaultValue",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={attr.mandatory}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "mandatory",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Mandatory"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={attr.description}
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <IconButton
                    color="error"
                    onClick={() => handleAttributeRemove(index)}
                    disabled={attributes.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              onClick={handleAddAttribute}
              startIcon={<Add />}
              sx={{ mt: 2 }}
            >
              Add Attribute
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDialogSubmit}
            disabled={!documentType.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Operation successful!
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentTypeSetting;
