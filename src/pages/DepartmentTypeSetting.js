import React, { useState, useEffect, useRef } from "react";
import { Collapse } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Autocomplete } from "@mui/material";
import { Chip, styled } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import ForCell from "./ForCell";

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

const GradientChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  color: "white",
  cursor: "default",
  transition: "transform 0.2s, box-shadow 0.2s",
  marginLeft: theme.spacing(1),
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  ...(type === "mandatory" && {
    background: "linear-gradient(135deg, #6a0dad, #9b59b6)", // violet to purple gradient
  }),
  ...(type === "ai" && {
    background: "linear-gradient(45deg, #36d1dc, #5b86e5)", // keep previous orange gradient
  }),
}));

const attributeTypes = ["STRING", "NUMBER", "DATE", "BOOLEAN"];

const DepartmentTypeSetting = () => {
  const [expandedIndex, setExpandedIndex] = useState(0); // initially first attribute expanded
  const [selectedIds, setSelectedIds] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);

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
  const [selectedEntityId, setSelectedEntityId] = useState([]);

  const [typeNames, setTypeNames] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("typeName");
  const [searchText, setSearchText] = useState("");

  const handleEditType = (row) => {
    console.log("Editing row:", row);

    setDocumentType(row.type || "");
    setAttributes(
      row.attributes?.map((attr) => ({
        name: attr.attributeName || "",
        type: attr.attributeType?.toUpperCase() || "STRING",
        defaultValue: attr.value || "",
        description: attr.fileTypeDescription || "",
        mandatory: attr.isMandatory || false,
        aiRequired: attr.isAiRequired || false,
      })) || [createAttributeTemplate()]
    );

    let scope = "global";
    let entityIds = [];

    if (row.global === true) {
      scope = "global";
    } else if (Array.isArray(row.createdFor) && row.createdFor.length > 0) {
      const matchedUsers = users.filter((u) => row.createdFor.includes(u.name));
      const matchedDepartments = departments.filter((d) =>
        row.createdFor.includes(d.deptName)
      );

      if (matchedUsers.length > 0) {
        scope = "user";
        entityIds = matchedUsers.map((u) => u.id);
      } else if (matchedDepartments.length > 0) {
        scope = "department";
        entityIds = matchedDepartments.map((d) => d.id);
      }
    }

    // ✅ Deduplicate and update
    const uniqueIds = Array.from(new Set(entityIds));

    setTypeScope(scope);
    setSelectedEntityId(uniqueIds);
    setIsEditMode(true);
    setEditingTypeId(row.id);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (typeScope === "user" && selectedEntityId.length && users.length) {
      // make sure all selected IDs exist in users
      const validIds = selectedEntityId.filter((id) =>
        users.some((u) => u.id === id)
      );
      setSelectedEntityId(validIds);
    }

    if (
      typeScope === "department" &&
      selectedEntityId.length &&
      departments.length
    ) {
      // make sure all selected IDs exist in departments
      const validIds = selectedEntityId.filter((id) =>
        departments.some((d) => d.id === id)
      );
      setSelectedEntityId(validIds);
    }
  }, [users, departments, typeScope]);

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
      aValue = a.type || "";
      bValue = b.type || "";
    } else if (orderBy === "createdBy") {
      aValue = a.createdBy || "";
      bValue = b.createdBy || "";
    } else if (orderBy === "for") {
      aValue = a.createdFor || "";
      bValue = b.createdFor || "";
    } else if (orderBy === "dateCreated") {
      aValue = a.dateCreated || "";
      bValue = b.dateCreated || "";
    }

    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
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

  const handleCheckboxToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = fileTypes.map((row) => row.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const getSelectedIds = () => {
    if (!selected || selected.length === 0) return [];

    // if selected array already stores string ids
    if (typeof selected[0] === "string") return selected;

    // try treat selected as indices into sortedRows (best for global selection state)
    const idsFromSorted = selected
      .map((i) => sortedRows[i]?.id)
      .filter(Boolean);
    if (idsFromSorted.length === selected.length) return idsFromSorted;

    // fallback: treat selected as indices into fileTypes (original)
    const idsFromFileTypes = selected
      .map((i) => fileTypes[i]?.id)
      .filter(Boolean);
    return idsFromFileTypes;
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
    // Validation for User/Department selection
    if (
      (typeScope === "user" &&
        (!selectedEntityId || selectedEntityId.length === 0)) ||
      (typeScope === "department" &&
        (!selectedEntityId || selectedEntityId.length === 0))
    ) {
      setSnackbar({
        open: true,
        message:
          typeScope === "user"
            ? "Please select at least one user."
            : "Please select at least one department.",
        severity: "error",
      });
      return; // stop submission
    }

    const payload = {
      type: documentType,
      attributeList: attributes.map((attr) => ({
        attributeName: attr.name,
        attributeType: attr.type.toLowerCase(),
        value: attr.defaultValue,
        fileTypeDescription: attr.description,
        isMandatory: attr.mandatory,
        aiRequired: attr.aiRequired,
      })),
      users: typeScope === "user" ? selectedEntityId : [],
      departments: typeScope === "department" ? selectedEntityId : [],
      global: typeScope === "global",
    };

    try {
      if (isEditMode && editingTypeId) {
        await axios.put(
          `${window.__ENV__.REACT_APP_ROUTE}/tenants/editType/${editingTypeId}`,
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
          message: "Type updated successfully",
          severity: "success",
        });
      } else {
        await axios.post(
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
      }

      // Reset form state
      setOpenDialog(false);
      setDocumentType("");
      setAttributes([createAttributeTemplate()]);
      setTypeScope("global");
      setSelectedEntityId([]);
      setIsEditMode(false);
      setEditingTypeId(null);

      // Refetch data if needed
      fetchFileTypes();
    } catch (error) {
      console.error("Error saving type:", error);
      setSnackbar({
        open: true,
        message: "Failed to save type",
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

  const handleDeleteType = async (ids, typeName) => {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      setSnackbar({
        open: true,
        message: "No items selected",
        severity: "info",
      });
      return;
    }

    // Ensure ids is always an array
    const idsArray = Array.isArray(ids) ? ids : [ids];

    try {
      await axios.delete(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/deleteType`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
            "Content-Type": "application/json",
          },
          data: idsArray,
        }
      );

      setSnackbar({
        open: true,
        message:
          idsArray.length === 1
            ? `"${typeName}" deleted successfully`
            : `${idsArray.length} type(s) deleted successfully`,
        severity: "success",
      });

      setSelectedIds([]); // clear selection if bulk delete
      fetchFileTypes(); // refresh list
    } catch (error) {
      console.error("Delete failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete type(s)",
        severity: "error",
      });
    }
  };

  const getOptionValue = (id) => {
    if (typeScope === "user") return users.find((u) => u.id === id) || null;
    if (typeScope === "department")
      return departments.find((d) => d.id === id) || null;
    return null;
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
                      selectedIds.length > 0 &&
                      selectedIds.length < fileTypes.length
                    }
                    checked={
                      fileTypes.length > 0 &&
                      selectedIds.length === fileTypes.length
                    }
                    onChange={handleSelectAll}
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleCheckboxToggle(row.id)}
                    />
                  </TableCell>

                  <TableCell sx={{ textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{row.type}</TableCell>

                  <ForCell items={row.createdFor} />

                  <TableCell sx={{ textAlign: "center" }}>
                    {row.createdBy || "—"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {row.CreatedOn || "—"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteType(row.id, row.type)} // row.id as single item, row.type for message
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
              "0%": { boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)" },
              "50%": { boxShadow: "0 0 20px 5px rgba(251, 68, 36, 0.8)" },
              "100%": { boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)" },
            },
          }}
        >
          <Add fontSize="medium" />
        </IconButton>
      </Tooltip>

      {selectedIds.length > 0 && (
        <Tooltip title={`Delete ${selectedIds.length} selected`}>
          <IconButton
            onClick={() => handleDeleteType(selectedIds)} // pass array of IDs for bulk delete
            sx={{
              position: "fixed",
              bottom: 20,
              right: 110, // positioned left to the Add button
              backgroundColor: "error.main",
              color: "white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "error.dark",
              },
              transition: "transform 150ms ease, opacity 150ms ease",
            }}
          >
            <Delete fontSize="medium" />
          </IconButton>
        </Tooltip>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          {isEditMode ? "Edit Type" : "Add New Type"}
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

                <Tooltip
                  title={
                    sessionStorage.getItem("deptAdmin") === "true" &&
                    sessionStorage.getItem("superAdmin") !== "true"
                      ? "Only applicable for Super Admin"
                      : ""
                  }
                  placement="top"
                  arrow
                >
                  <span>
                    <FormControlLabel
                      value="global"
                      control={<Radio />}
                      label="Global"
                      disabled={
                        sessionStorage.getItem("deptAdmin") === "true" &&
                        sessionStorage.getItem("superAdmin") !== "true"
                      }
                    />
                  </span>
                </Tooltip>
              </RadioGroup>
            </FormControl>

            {(typeScope === "user" || typeScope === "department") && (
              <>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={typeScope === "user" ? users : departments}
                  getOptionLabel={(option) =>
                    typeScope === "user" ? option.name : option.deptName
                  }
                  value={selectedEntityId.map(getOptionValue).filter(Boolean)} // map IDs to objects
                  onChange={(event, newValue) => {
                    const uniqueIds = Array.from(
                      new Set(newValue.map((item) => item.id))
                    );
                    setSelectedEntityId(uniqueIds);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox style={{ marginRight: 8 }} checked={selected} />
                      {typeScope === "user" ? option.name : option.deptName}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Select ${
                        typeScope === "user" ? "Users" : "Departments"
                      }`}
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {(typeScope === "user" && loadingUsers) ||
                            (typeScope === "department" &&
                              loadingDepartments) ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  ListboxProps={{
                    onScroll:
                      typeScope === "user"
                        ? handleUserDropdownScroll
                        : typeScope === "department"
                        ? handleDepartmentDropdownScroll
                        : undefined,
                    style: { maxHeight: 300 },
                  }}
                  sx={{ mb: 0.5 }}
                />

                {/* Inline error message */}
                {selectedEntityId.length === 0 && (
                  <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                    {typeScope === "user"
                      ? "At least one user must be selected."
                      : "At least one department must be selected."}
                  </Typography>
                )}
              </>
            )}

            <TextField
              fullWidth
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              sx={{ mb: 2 }}
            />

            {attributes.map((attr, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex === index}
                onChange={() =>
                  setExpandedIndex(expandedIndex === index ? -1 : index)
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ flexGrow: 1 }}>
                    {attr.name ? attr.name : ""}
                    {attr.type ? ` — ${attr.type}` : ""}
                  </Typography>

                  {attr.mandatory && (
                    <GradientChip
                      type="mandatory"
                      label="Mandatory"
                      icon={<VerifiedIcon />}
                      size="small"
                    />
                  )}
                  {attr.aiRequired && (
                    <GradientChip
                      type="ai"
                      label="AI Required"
                      icon={<AutoAwesomeIcon />}
                      size="small"
                    />
                  )}
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        fullWidth
                        label="Attribute Name"
                        value={attr.name}
                        onChange={(e) =>
                          handleAttributeChange(index, "name", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
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
                    <Grid item xs={12} sm={2.5}>
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
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" gap={2}>
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
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={attr.aiRequired}
                              onChange={(e) =>
                                handleAttributeChange(
                                  index,
                                  "aiRequired",
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label="AI Required"
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleAttributeRemove(index)}
                          disabled={attributes.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
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
                  </Grid>
                </AccordionDetails>
              </Accordion>
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
            onClick={handleDialogSubmit} // validation happens inside
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
