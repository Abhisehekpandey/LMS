import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import { getDepartments } from "../api/departmentService"; // ✅ Update if path differs
import Loading from "../components/Loading"; // ✅ Update if path differs

// Snackbar Alert wrapper
const CustomAlert = React.forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DepartmentTypeSetting = () => {
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [typeInputs, setTypeInputs] = useState([""]);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

    // TODO: Replace with real API call here
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

  const handleSaveGlobalTypes = () => {
    const validTypes = typeInputs.map((t) => t.trim()).filter(Boolean);
    if (validTypes.length === 0) return;

    // TODO: Replace with real API call
    console.log("Saving global types:", validTypes);

    setSnackbar({
      open: true,
      message: "Global types saved successfully!",
      severity: "success",
    });

    setTypeInputs([""]);
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "1300px",
        mx: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Department Type Setting
      </Typography>

      <Paper elevation={3} sx={{ mt: 2 }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            px: 2,
            py: 1.5,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
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

            {/* Global Types Section */}
            <Box sx={{ p: 2, borderTop: "1px solid #ddd", mt: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Add Global Types for All Departments
              </Typography>

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

              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  onClick={handleAddField}
                  variant="outlined"
                  size="small"
                >
                  + Add More
                </Button>
                <Button
                  onClick={handleSaveGlobalTypes}
                  variant="contained"
                  size="small"
                  disabled={typeInputs.every((t) => !t.trim())}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Dialog for Per-Department Type */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          Add Types for {selectedDepartment?.deptName}
        </DialogTitle>
        <DialogContent dividers>
          {typeInputs.map((type, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}
            >
              <TextField
                fullWidth
                label={`Type ${index + 1}`}
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
          <Button onClick={handleAddField} variant="outlined" size="small">
            + Add More
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveType}
            variant="contained"
            disabled={typeInputs.every((t) => !t.trim())}
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
