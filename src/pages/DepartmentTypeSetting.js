import React, { useState, useEffect, useRef } from "react";
import {
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  styled,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  IconButton,
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
  Tooltip,
  Checkbox,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VerifiedIcon from "@mui/icons-material/Verified";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Add, Delete, Edit, Close } from "@mui/icons-material";
import axios from "axios";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";

const GradientChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 700,
  color: "white",
  height: "22px",
  fontSize: "0.65rem",
  cursor: "default",
  marginLeft: theme.spacing(1),
  borderRadius: "12px",
  "& .MuiChip-label": { padding: "0 8px" },
  "& .MuiChip-icon": { color: "white", fontSize: "0.9rem", marginLeft: "4px" },
  ...(type === "mandatory" && {
    background: "linear-gradient(135deg, #ff4b2b, #ff416c)", // Vibrant Red
  }),
  ...(type === "ai" && {
    background: "linear-gradient(45deg, #2196f3, #00bcd4)", // Vibrant Blue
  }),
}));

const attributeTypes = ["STRING", "INTEGER", "DATE"];

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
  const createAttributeTemplate = () => ({
    name: "",
    type: "STRING",
    defaultValue: "",
    mandatory: false,
    aiRequired: false,
    aiPrompt: "",
    description: "",
  });

  const [attributes, setAttributes] = useState([createAttributeTemplate()]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [searchColumn, setSearchColumn] = useState("typeName");
  const [searchText, setSearchText] = useState("");

  const isFetching = useRef(false);

  const handleEditType = (row) => {
    setDocumentType(row.type || "");
    setAttributes(
      row.attributes?.map((attr) => ({
        name: attr.attributeName || "",
        type:
          attr.attributeType?.toUpperCase() === "NUMBER"
            ? "INTEGER"
            : attr.attributeType?.toUpperCase() || "STRING",
        defaultValue: attr.value || "",
        description: attr.fileTypeDescription || "",
        mandatory: attr.isMandatory || false,
        aiRequired: attr.isAiRequired || false,
        aiPrompt: attr.aiPrompt || "",
      })) || [createAttributeTemplate()],
    );

    setIsEditMode(true);
    setEditingTypeId(row.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditMode(false);
    setEditingTypeId(null);
    setDocumentType("");
    setAttributes([createAttributeTemplate()]);
    setExpandedIndex(0);
  };

  const handleOpenCreateDialog = () => {
    handleCloseDialog();
    setOpenDialog(true);
  };

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
    let aValue = "";
    let bValue = "";

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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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

  const fetchFileTypes = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/dms_service_LM/api/getAllFileType`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
          },
        },
      );

      // ✅ take fullObject array instead of data
      setFileTypes(response.data?.fullObject || []);
    } catch (error) {
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Failed to fetch file types", error);
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchFileTypes();
  }, []);

  const filteredRows = fileTypes.filter((row) => {
    let value = "";

    if (searchColumn === "typeName") {
      value = row.type || "";
    } else if (searchColumn === "createdBy") {
      value = row.createdBy || "";
    } else if (searchColumn === "for") {
      value = row.createdFor || "";
    }

    return value.toString().toLowerCase().includes(searchText.toLowerCase());
  });

  const sortedRows = stableSort(filteredRows, getComparator(order, orderBy));

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleDialogSubmit = async () => {
    if (!documentType.trim()) {
      setSnackbar({
        open: true,
        message: "Document Type is mandatory.",
        severity: "error",
      });
      return;
    }

    const invalidAttribute = attributes.find(
      (attr) => !attr.name.trim() || !attr.description.trim(),
    );

    if (invalidAttribute) {
      setSnackbar({
        open: true,
        message:
          "Attribute Name and Description are mandatory for all attributes.",
        severity: "error",
      });
      return;
    }

    const payload = {
      type: documentType,
      attributes: attributes.map((attr) => ({
        attributeName: attr.name,
        attributeType:
          attr.type.charAt(0).toUpperCase() + attr.type.slice(1).toLowerCase(),
        value: attr.defaultValue,
        fileTypeDescription: attr.description,
        isMandatory: attr.mandatory,
        aiRequired: attr.aiRequired,
        aiPrompt: attr.aiPrompt,
      })),
      users: [],
      departments: [],
      global: true,
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
          },
        );
        setSnackbar({
          open: true,
          message: "Type updated successfully",
          severity: "success",
        });
      } else {
        const createPayload = attributes.map((attr) => ({
          attributeName: attr.name,
          attributeType:
            attr.type.charAt(0).toUpperCase() +
            attr.type.slice(1).toLowerCase(),
          value: attr.defaultValue,
          isMandatory: attr.mandatory,
          isAiRequired: attr.aiRequired,
          aiPrompt: attr.aiPrompt,
          fileTypeDescription: attr.description,
        }));

        await axios.post(
          `${window.__ENV__.REACT_APP_ROUTE}/dms_service_LM/api/newFileType`,
          createPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: sessionStorage.getItem("adminEmail"),
              fileType: documentType,
              checklistFolderTypeValue: "false",
              isTypeAutoClassified: "false",
            },
          },
        );
        setSnackbar({
          open: true,
          message: "New type created successfully",
          severity: "success",
        });
      }

      setOpenDialog(false);
      setDocumentType("");
      setAttributes([createAttributeTemplate()]);
      setIsEditMode(false);
      setEditingTypeId(null);

      fetchFileTypes();
    } catch (error) {
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Error saving type:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to save type";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;

    // Clear default value if type changes to avoid invalid data persistence
    if (field === "type") {
      updated[index].defaultValue = "";
    }

    setAttributes(updated);
  };

  const handleAttributeRemove = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, createAttributeTemplate()]);
    setExpandedIndex(attributes.length); // expand only the newly added row
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
        },
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
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: "Session expired. Please login again." },
          }),
        );
        return;
      }
      console.error("Delete failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete type(s)",
        severity: "error",
      });
    }
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 2 }}>
          <TextField
            select
            size="small"
            label="By"
            value={searchColumn}
            onChange={(e) => {
              setSearchColumn(e.target.value);
              setPage(0);
            }}
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
          </TextField>

          <TextField
            size="small"
            label="Search"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
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
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchText("");
                  setSearchColumn("typeName");
                  setPage(0);
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
                <TableCell sx={{ textAlign: "center" }}>Created On</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, index) => (
                <TableRow
                  key={row.id}
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

                  <TableCell sx={{ textAlign: "center" }}>
                    {row.CreatedOn || "—"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditType(row)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

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
                  <TableCell colSpan={5} sx={{ textAlign: "center" }}>
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
          onClick={handleOpenCreateDialog}
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
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { borderRadius: "12px" },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            TYPE
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pb: 1,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: "#555", fontSize: "0.85rem" }}
              >
                CREATE TYPE
              </Typography>
              <IconButton
                size="small"
                onClick={handleCloseDialog}
                sx={{
                  bgcolor: "#ff5722",
                  color: "white",
                  borderRadius: "4px",
                  "&:hover": { bgcolor: "#e64a19" },
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Box>

            <TextField
              required
              fullWidth
              label="DOCUMENT TYPE"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              sx={{ mb: 1 }}
              InputLabelProps={{ shrink: true }}
              placeholder="DOCUMENT TYPE"
              size="small"
            />

            <Box sx={{ position: "relative", mt: 1, mb: 2 }}>
              <Divider textAlign="left">
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#888",
                    fontSize: "0.75rem",
                    px: 1,
                  }}
                >
                  TYPE'S ATTRIBUTES
                </Typography>
              </Divider>
            </Box>

            {attributes.map((attr, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex === index}
                onChange={() =>
                  setExpandedIndex(expandedIndex === index ? -1 : index)
                }
                sx={{
                  mb: 1,
                  border: "1px solid #e0e0e0",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                  borderRadius: "8px !important",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ fontSize: "1.2rem" }} />}
                  sx={{
                    flexDirection: "row",
                    "& .MuiAccordionSummary-content": {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 500, fontSize: "0.9rem", color: "#666" }}
                  >
                    Attribute {index + 1}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {attr.mandatory && (
                      <GradientChip
                        type="mandatory"
                        label="MANDATORY"
                        icon={<VerifiedIcon />}
                      />
                    )}
                    {attr.aiRequired && (
                      <GradientChip
                        type="ai"
                        label="AI REQUIRED"
                        icon={<AutoAwesomeIcon />}
                      />
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttributeRemove(index);
                      }}
                      disabled={attributes.length === 1}
                      sx={{ color: "#777" }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddAttribute();
                      }}
                      sx={{ color: "#2196f3" }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        required
                        fullWidth
                        label="ATTRIBUTE NAME"
                        value={attr.name}
                        onChange={(e) =>
                          handleAttributeChange(index, "name", e.target.value)
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        select
                        fullWidth
                        label="ATTRIBUTE TYPE"
                        value={attr.type}
                        onChange={(e) =>
                          handleAttributeChange(index, "type", e.target.value)
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      >
                        {attributeTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        type={
                          attr.type === "INTEGER"
                            ? "number"
                            : attr.type === "DATE"
                              ? "date"
                              : "text"
                        }
                        fullWidth
                        label="DEFAULT VALUE"
                        value={attr.defaultValue}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "defaultValue",
                            e.target.value,
                          )
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        display="flex"
                        gap={1}
                        justifyContent="space-around"
                        height="100%"
                        alignItems="center"
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: "#777",
                              display: "block",
                              fontSize: "0.65rem",
                            }}
                          >
                            MANDATORY
                          </Typography>
                          <Switch
                            size="small"
                            checked={attr.mandatory}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "mandatory",
                                e.target.checked,
                              )
                            }
                          />
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: "#777",
                              display: "block",
                              fontSize: "0.65rem",
                            }}
                          >
                            AI REQUIRED
                          </Typography>
                          <Switch
                            size="small"
                            checked={attr.aiRequired}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "aiRequired",
                                e.target.checked,
                              )
                            }
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="ATTRIBUTE DESCRIPTION"
                        value={attr.description}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    {attr.aiRequired && (
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="AI PROMPT"
                          value={attr.aiPrompt}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "aiPrompt",
                              e.target.value,
                            )
                          }
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          placeholder="AI PROMPT"
                        />
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            sx={{
              px: 4,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            onClick={handleDialogSubmit}
          >
            SAVE
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
