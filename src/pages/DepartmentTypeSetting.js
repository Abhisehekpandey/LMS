import React, { useEffect, useState } from "react";
import { Tabs, Tab, Switch, FormControlLabel, MenuItem } from "@mui/material";
import { saveFileType } from "../api/type";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";

import { getDepartments } from "../api/departmentService";
import Loading from "../components/Loading";

const CustomAlert = React.forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DepartmentTypeSetting = () => {
  const [tabValue, setTabValue] = useState(0);
  const [documentType, setDocumentType] = useState("");
  const [autoClassify, setAutoClassify] = useState(false);
  const [attributes, setAttributes] = useState([
    {
      name: "",
      type: "STRING",
      defaultValue: "",
      mandatory: false,
      description: "",
    },
  ]);
  const attributeTypes = ["STRING", "NUMBER", "DATE", "BOOLEAN"];
  const [globalDocumentType, setGlobalDocumentType] = useState("");
  const [globalAttributes, setGlobalAttributes] = useState([
    {
      name: "",
      type: "STRING",
      defaultValue: "",
      mandatory: false,
      description: "",
    },
  ]);

  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [typeInputs, setTypeInputs] = useState([""]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleGlobalAttrChange = (index, key, value) => {
    const updated = [...globalAttributes];
    updated[index][key] = value;
    setGlobalAttributes(updated);
  };

  const handleAddGlobalAttr = () => {
    setGlobalAttributes([
      ...globalAttributes,
      {
        name: "",
        type: "STRING",
        defaultValue: "",
        mandatory: false,
        description: "",
      },
    ]);
  };

  const handleRemoveGlobalAttr = (index) => {
    const updated = [...globalAttributes];
    updated.splice(index, 1);
    setGlobalAttributes(updated);
  };

  const handleSaveClick = async () => {
    const token = sessionStorage.getItem("authToken");
    const username = sessionStorage.getItem("adminEmail");

    console.log("user1", username);

    if (!username || !token) {
      setSnackbar({
        open: true,
        message: "Missing token or username. Please login again.",
        severity: "error",
      });
      return;
    }

    try {
      await saveFileType({
        documentType,
        username,
        attributes,
        token,
      });

      setSnackbar({
        open: true,
        message: "File type created successfully!",
        severity: "success",
      });

      handleCloseDialog();
    } catch (error) {
      console.error("API Error:", error);
      setSnackbar({
        open: true,
        message: "Failed to create file type",
        severity: "error",
      });
    }
  };

  const handleAddAttribute = () => {
    setAttributes([
      ...attributes,
      {
        name: "",
        type: "STRING",
        defaultValue: "",
        mandatory: false,
        description: "",
      },
    ]);
  };

  const handleRemoveAttribute = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  const handleAttributeChange = (index, key, value) => {
    const updated = [...attributes];
    updated[index][key] = value;
    setAttributes(updated);
  };

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDepartments(page, pageSize);
      setDepartments(res.content || []);
      setTotalDepartments(res.totalElements || 0);
    } catch (err) {
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize]);

  const handleTypeChange = (index, value) => {
    const newInputs = [...typeInputs];
    newInputs[index] = value;
    setTypeInputs(newInputs);
  };

  const handleAddField = () => {
    setTypeInputs([...typeInputs, ""]);
  };

  const handleRemoveField = (index) => {
    const newInputs = typeInputs.filter((_, i) => i !== index);
    setTypeInputs(newInputs);
  };

  const handleOpenDialog = (dept) => {
    setSelectedDepartment(dept);
    setTypeInputs([""]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
    setTypeInputs([""]);
  };

  const handleSaveType = () => {
    const validTypes = typeInputs.map((t) => t.trim()).filter(Boolean);
    if (validTypes.length === 0) return;

    const success = true;

    if (success) {
      setSnackbar({
        open: true,
        message: "Types saved successfully!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Failed to save types.",
        severity: "error",
      });
    }

    handleCloseDialog();
  };

  const handleSaveGlobalTypes = async () => {
    const token = sessionStorage.getItem("authToken");
    const username = sessionStorage.getItem("adminEmail");

    if (!username || !token) {
      setSnackbar({
        open: true,
        message: "Missing token or username. Please login again.",
        severity: "error",
      });
      return;
    }

    if (!globalDocumentType.trim()) {
      setSnackbar({
        open: true,
        message: "Document Type is required.",
        severity: "warning",
      });
      return;
    }

    try {
      await saveFileType({
        documentType: globalDocumentType,
        username,
        attributes: globalAttributes,
        token,
      });

      setSnackbar({
        open: true,
        message: "Global types saved successfully!",
        severity: "success",
      });

      // reset
      setGlobalDocumentType("");
      setGlobalAttributes([
        {
          name: "",
          type: "STRING",
          defaultValue: "",
          mandatory: false,
          description: "",
        },
      ]);
    } catch (error) {
      console.error("Global Type Save Error:", error);
      setSnackbar({
        open: true,
        message: "Failed to save global types.",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1200px",
        mx: "auto",
        width: "100%",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      {/* Department Table Section */}
      <Paper elevation={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "primary.main",
            color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <CategoryIcon />
          <Typography variant="h6" fontWeight={600}>
            Types
          </Typography>
        </Box>

        {loading ? (
          <Loading />
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Department Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Display Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created On</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow
                      key={dept.id}
                      hover
                      sx={{
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                          cursor: "pointer",
                        },
                      }}
                    >
                      <TableCell>{dept.deptName}</TableCell>
                      <TableCell>{dept.deptDisplayName}</TableCell>
                      <TableCell>
                        {new Date(dept.createdOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDialog(dept)}
                        >
                          Add Type
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ my: 1 }} />
              <TablePagination
                component="div"
                count={totalDepartments}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ px: 2 }}
              />
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Global Types Section */}
      {/* <Paper elevation={3} sx={{ mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "primary.main",
            color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <AddBusinessIcon />
          <Typography variant="h6" fontWeight={600}>
            Add Global Types for All Departments
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {typeInputs.map((type, index) => (
            <Box
              key={`global-${index}`}
              sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}
            >
              <TextField
                fullWidth
                label={`Global Type ${index + 1}`}
                size="small"
                value={type}
                onChange={(e) => handleTypeChange(index, e.target.value)}
              />
              {typeInputs.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveField(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <Box
            sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}
          >
            <Button onClick={handleAddField} variant="outlined" size="small">
              + Add More
            </Button>
            <Button
              onClick={handleSaveGlobalTypes}
              variant="contained"
              size="small"
              disabled={typeInputs.every((t) => !t.trim())}
            >
              Save Global Types
            </Button>
          </Box>
        </Box>
      </Paper> */}
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "primary.main",
            color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <AddBusinessIcon />
          <Typography variant="h6" fontWeight={600}>
            Add Global Types for All Departments
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="DOCUMENT TYPE *"
            size="small"
            value={globalDocumentType}
            onChange={(e) => setGlobalDocumentType(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography fontWeight={600} gutterBottom>
            TYPE'S ATTRIBUTES
          </Typography>

          {globalAttributes.map((attr, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
                mb: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
              }}
            >
              <TextField
                label="ATTRIBUTE NAME *"
                size="small"
                value={attr.name}
                onChange={(e) =>
                  handleGlobalAttrChange(index, "name", e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label="ATTRIBUTE TYPE"
                select
                size="small"
                value={attr.type}
                onChange={(e) =>
                  handleGlobalAttrChange(index, "type", e.target.value)
                }
                sx={{ width: 150 }}
              >
                {attributeTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="DEFAULT VALUE"
                size="small"
                value={attr.defaultValue}
                onChange={(e) =>
                  handleGlobalAttrChange(index, "defaultValue", e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={attr.mandatory}
                    onChange={(e) =>
                      handleGlobalAttrChange(
                        index,
                        "mandatory",
                        e.target.checked
                      )
                    }
                  />
                }
                label="MANDATORY"
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveGlobalAttr(index)}
                disabled={globalAttributes.length === 1}
              >
                <DeleteIcon />
              </IconButton>

              <TextField
                fullWidth
                label="ATTRIBUTE DESCRIPTION *"
                size="small"
                value={attr.description}
                onChange={(e) =>
                  handleGlobalAttrChange(index, "description", e.target.value)
                }
                sx={{ mt: 1 }}
              />
            </Box>
          ))}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={handleAddGlobalAttr}
            >
              Add Attribute
            </Button>
            <Button
              onClick={handleSaveGlobalTypes}
              variant="contained"
              size="small"
              disabled={!globalDocumentType.trim()}
            >
              Save Global Types
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          TYPE
        </DialogTitle>

        <DialogContent dividers>
          {/* Optional single tab just for consistent UI */}
          <Tabs value={0}>
            <Tab label="CREATE" />
          </Tabs>

          {/* Document Type */}
          <TextField
            fullWidth
            label="DOCUMENT TYPE *"
            size="small"
            sx={{ mt: 2 }}
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />

          {/* Attribute Section */}
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={600} gutterBottom>
              TYPE'S ATTRIBUTES
            </Typography>

            {attributes.map((attr, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  mb: 2,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <TextField
                  label="ATTRIBUTE NAME *"
                  size="small"
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeChange(index, "name", e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="ATTRIBUTE TYPE"
                  select
                  size="small"
                  value={attr.type}
                  onChange={(e) =>
                    handleAttributeChange(index, "type", e.target.value)
                  }
                  sx={{ width: 150 }}
                >
                  {attributeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="DEFAULT VALUE"
                  size="small"
                  value={attr.defaultValue}
                  onChange={(e) =>
                    handleAttributeChange(index, "defaultValue", e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
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
                  label="MANDATORY"
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveAttribute(index)}
                  disabled={attributes.length === 1}
                >
                  <DeleteIcon />
                </IconButton>

                <TextField
                  fullWidth
                  label="ATTRIBUTE DESCRIPTION *"
                  size="small"
                  value={attr.description}
                  onChange={(e) =>
                    handleAttributeChange(index, "description", e.target.value)
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={handleAddAttribute}
            >
              Add Attribute
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!documentType.trim()}
            onClick={handleSaveClick} // ✅ Call the API handler
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiAlert-root": {
            borderRadius: 2,
          },
        }}
      >
        <CustomAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </CustomAlert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentTypeSetting;
