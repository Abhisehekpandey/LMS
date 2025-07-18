import React, { useEffect, useState } from "react";
import { Tabs, Tab, Switch, FormControlLabel, MenuItem } from "@mui/material";
import { saveFileType, saveUserFileType } from "../api/type";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People"; // for header icon
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
import { fetchUsers } from "../api/userService";
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
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [typeInputs, setTypeInputs] = useState([""]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [dialogTarget, setDialogTarget] = useState("department"); // or 'user'

  // Fetch users
  const fetchUserData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchUsers(userPage);
      setUsers(res.content || []);
      setTotalUsers(res.totalElements || 0);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

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

    if (!username || !token) {
      setSnackbar({
        open: true,
        message: "Missing token or username. Please login again.",
        severity: "error",
      });
      return;
    }

    try {
      if (dialogTarget === "user") {
        // 👤 For user-specific type saving
        await saveUserFileType({
          documentType,
          username,
          attributes,
          token,
          userId: selectedEntity?.id, // assuming 'id' is user ID
        });
      } else {
        // 🏢 For department-specific type saving
        await saveFileType({
          documentType,
          username,
          attributes,
          token,
          departmentId: selectedEntity?.id,
        });
      }

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

  // Call on mount & page change
  useEffect(() => {
    fetchUserData();
  }, [userPage]);

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

  const handleOpenDialog = (item, type = "department") => {
    setSelectedEntity(item);
    setDialogTarget(type); // NEW
    setTypeInputs([""]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEntity(null);
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
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Users" />
          <Tab label="Departments" />
          <Tab label="Global" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Paper elevation={3} sx={{ mb: 3 }}>
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
            <PeopleIcon />
            <Typography variant="h6" fontWeight={600}>
              Users
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
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created On</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.name || "N/A"}</TableCell>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(user.createdOn).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenDialog(user, "user")}
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
                  count={totalUsers}
                  page={userPage}
                  onPageChange={(e, newPage) => setUserPage(newPage)}
                  rowsPerPage={userPageSize}
                  onRowsPerPageChange={(e) => {
                    setUserPageSize(parseInt(e.target.value, 10));
                    setUserPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                  sx={{ px: 2 }}
                />
              </TableContainer>
            </>
          )}
        </Paper>
      )}

      {tabValue === 1 && (
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
              Departments
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
                      <TableCell sx={{ fontWeight: 600 }}>
                        Display Name
                      </TableCell>
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
      )}

      {tabValue === 2 && (
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
                    handleGlobalAttrChange(
                      index,
                      "defaultValue",
                      e.target.value
                    )
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

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
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
      )}

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
          {dialogTarget === "user" ? "TYPE FOR USER" : "TYPE FOR DEPARTMENT"}
        </DialogTitle>

        <DialogContent dividers>
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










// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   Alert,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Snackbar,
//   IconButton,
//   Divider,
//   Tabs,
//   Tab,
//   FormControlLabel,
//   Switch,
//   MenuItem,
//   Grid,
//   Tooltip
// } from "@mui/material";
// import MuiAlert from "@mui/material/Alert";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import PeopleIcon from "@mui/icons-material/People";
// import CategoryIcon from "@mui/icons-material/Category";
// import AddBusinessIcon from "@mui/icons-material/AddBusiness";
// import { saveFileType, saveUserFileType } from "../api/type";
// import { getDepartments } from "../api/departmentService";
// import { fetchUsers } from "../api/userService";
// import Loading from "../components/Loading";

// const CustomAlert = React.forwardRef(function CustomAlert(props, ref) {
//   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
// });

// const attributeTemplate = {
//   name: "",
//   type: "STRING",
//   defaultValue: "",
//   mandatory: false,
//   description: ""
// };

// const attributeTypes = ["STRING", "NUMBER", "DATE", "BOOLEAN"];

// const DepartmentTypeSetting = () => {
//   const [tabValue, setTabValue] = useState(0);
//   const [departments, setDepartments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [page, setPage] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalDepartments, setTotalDepartments] = useState(0);
//   const [userPage, setUserPage] = useState(0);
//   const [userPageSize, setUserPageSize] = useState(10);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [dialogTarget, setDialogTarget] = useState("department");
//   const [selectedEntity, setSelectedEntity] = useState(null);
//   const [documentType, setDocumentType] = useState("");
//   const [attributes, setAttributes] = useState([attributeTemplate]);
//   const [globalDocumentType, setGlobalDocumentType] = useState("");
//   const [globalAttributes, setGlobalAttributes] = useState([attributeTemplate]);
//   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

//   useEffect(() => { fetchDepartments(); }, [page, pageSize]);
//   useEffect(() => { fetchUsersData(); }, [userPage, userPageSize]);

//   const fetchDepartments = async () => {
//     setLoading(true);
//     try {
//       const res = await getDepartments(page, pageSize);
//       setDepartments(res.content || []);
//       setTotalDepartments(res.totalElements || 0);
//     } catch (err) {
//       setError("Failed to fetch departments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsersData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchUsers(userPage);
//       setUsers(res.content || []);
//       setTotalUsers(res.totalElements || 0);
//     } catch (err) {
//       setError("Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenDialog = (entity, target) => {
//     setSelectedEntity(entity);
//     setDialogTarget(target);
//     setDocumentType("");
//     setAttributes([attributeTemplate]);
//     setOpenDialog(true);
//   };

//   const handleSaveClick = async () => {
//     const token = sessionStorage.getItem("authToken");
//     const username = sessionStorage.getItem("adminEmail");
//     if (!username || !token) return;
//     try {
//       if (dialogTarget === "user") {
//         await saveUserFileType({ documentType, username, attributes, token, userId: selectedEntity?.id });
//       } else {
//         await saveFileType({ documentType, username, attributes, token, departmentId: selectedEntity?.id });
//       }
//       setSnackbar({ open: true, message: "File type created successfully!", severity: "success" });
//       setOpenDialog(false);
//     } catch (error) {
//       console.error(error);
//       setSnackbar({ open: true, message: "Failed to create file type", severity: "error" });
//     }
//   };

//   const handleSaveGlobalTypes = async () => {
//     const token = sessionStorage.getItem("authToken");
//     const username = sessionStorage.getItem("adminEmail");
//     if (!username || !token || !globalDocumentType.trim()) return;
//     try {
//       await saveFileType({ documentType: globalDocumentType, username, attributes: globalAttributes, token });
//       setSnackbar({ open: true, message: "Global types saved successfully!", severity: "success" });
//       setGlobalDocumentType("");
//       setGlobalAttributes([attributeTemplate]);
//     } catch (error) {
//       console.error(error);
//       setSnackbar({ open: true, message: "Failed to save global types", severity: "error" });
//     }
//   };

//   const renderAttributeFields = (data, handlerChange, handlerRemove) =>
//     data.map((attr, index) => (
//       <Box key={index} display="flex" flexDirection="column" gap={1} mb={2} p={2} borderRadius={2} border="1px solid #ccc">
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} sm={4}>
//             <TextField
//               label="Attribute Name"
//               fullWidth
//               size="small"
//               value={attr.name}
//               onChange={(e) => handlerChange(index, "name", e.target.value)}
//             />
//           </Grid>
//           <Grid item xs={12} sm={3}>
//             <TextField
//               label="Type"
//               select
//               fullWidth
//               size="small"
//               value={attr.type}
//               onChange={(e) => handlerChange(index, "type", e.target.value)}
//             >
//               {attributeTypes.map((type) => (
//                 <MenuItem key={type} value={type}>{type}</MenuItem>
//               ))}
//             </TextField>
//           </Grid>
//           <Grid item xs={12} sm={3}>
//             <TextField
//               label="Default Value"
//               fullWidth
//               size="small"
//               value={attr.defaultValue}
//               onChange={(e) => handlerChange(index, "defaultValue", e.target.value)}
//             />
//           </Grid>
//           <Grid item xs={12} sm={2}>
//             <FormControlLabel
//               control={<Switch checked={attr.mandatory} onChange={(e) => handlerChange(index, "mandatory", e.target.checked)} />}
//               label="Mandatory"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               label="Description"
//               fullWidth
//               size="small"
//               value={attr.description}
//               onChange={(e) => handlerChange(index, "description", e.target.value)}
//             />
//           </Grid>
//         </Grid>
//         <Box display="flex" justifyContent="flex-end">
//           <IconButton color="error" onClick={() => handlerRemove(index)} disabled={data.length === 1}>
//             <DeleteIcon />
//           </IconButton>
//         </Box>
//       </Box>
//     ));

//   return (
//     <Box p={3} maxWidth="1200px" mx="auto">
//       <Paper elevation={3} sx={{ mb: 3 }}>
//         <Tabs
//           value={tabValue}
//           onChange={(e, newValue) => setTabValue(newValue)}
//           variant="fullWidth"
//         >
//           {/* <Tab label="Users" />
//           <Tab label="Departments" />
//           <Tab label="Global Types" /> */}
//             <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" />
//     <Tab icon={<CategoryIcon />} iconPosition="start" label="Departments" />
//     <Tab icon={<AddBusinessIcon />} iconPosition="start" label="Global Types" />
//         </Tabs>
//       </Paper>

//       {tabValue === 0 && (
//         <Paper elevation={3}>
//           <Box
//             p={2}
//             display="flex"
//             alignItems="center"
//             gap={1}
//             bgcolor="primary.main"
//             color="white"
//             borderTopRadius={2}
//           >
//             <PeopleIcon />
//             <Typography variant="h6">Users</Typography>
//           </Box>
//           {loading ? (
//             <Loading />
//           ) : error ? (
//             <Alert severity="error" sx={{ m: 2 }}>
//               {error}
//             </Alert>
//           ) : (
//             <TableContainer>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//                     <TableCell>
//                       <strong>Name</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Email</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Created On</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Action</strong>
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {users.map((user) => (
//                     <TableRow key={user.id} hover>
//                       <TableCell>{user.name || "N/A"}</TableCell>
//                       <TableCell>{user.email || "N/A"}</TableCell>
//                       <TableCell>
//                         {new Date(user.createdOn).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>
//                         <Button
//                           variant="contained"
//                           size="small"
//                           onClick={() => handleOpenDialog(user, "user")}
//                         >
//                           Add Type
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//               <TablePagination
//                 component="div"
//                 count={totalUsers}
//                 page={userPage}
//                 onPageChange={(e, newPage) => setUserPage(newPage)}
//                 rowsPerPage={userPageSize}
//                 onRowsPerPageChange={(e) =>
//                   setUserPageSize(parseInt(e.target.value, 10))
//                 }
//                 rowsPerPageOptions={[5, 10, 25]}
//               />
//             </TableContainer>
//           )}
//         </Paper>
//       )}

//       {tabValue === 1 && (
//         <Paper elevation={3}>
//           <Box
//             p={2}
//             display="flex"
//             alignItems="center"
//             gap={1}
//             bgcolor="primary.main"
//             color="white"
//             borderTopRadius={2}
//           >
//             <CategoryIcon />
//             <Typography variant="h6">Departments</Typography>
//           </Box>
//           {loading ? (
//             <Loading />
//           ) : error ? (
//             <Alert severity="error" sx={{ m: 2 }}>
//               {error}
//             </Alert>
//           ) : (
//             <TableContainer>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
//                     <TableCell>
//                       <strong>Department Name</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Display Name</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Created On</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Action</strong>
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {departments.map((dept) => (
//                     <TableRow key={dept.id} hover>
//                       <TableCell>{dept.deptName}</TableCell>
//                       <TableCell>{dept.deptDisplayName}</TableCell>
//                       <TableCell>
//                         {new Date(dept.createdOn).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>
//                         <Button
//                           variant="contained"
//                           size="small"
//                           onClick={() => handleOpenDialog(dept, "department")}
//                         >
//                           Add Type
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//               <TablePagination
//                 component="div"
//                 count={totalDepartments}
//                 page={page}
//                 onPageChange={(e, newPage) => setPage(newPage)}
//                 rowsPerPage={pageSize}
//                 onRowsPerPageChange={(e) =>
//                   setPageSize(parseInt(e.target.value, 10))
//                 }
//                 rowsPerPageOptions={[5, 10, 25]}
//               />
//             </TableContainer>
//           )}
//         </Paper>
//       )}

//       {tabValue === 2 && (
//         <Paper elevation={3}>
//           <Box
//             p={2}
//             display="flex"
//             alignItems="center"
//             gap={1}
//             bgcolor="primary.main"
//             color="white"
//             borderTopRadius={2}
//           >
//             <AddBusinessIcon />
//             <Typography variant="h6">Global Types</Typography>
//           </Box>
//           <Box p={3}>
//             <TextField
//               label="Global Document Type"
//               fullWidth
//               size="small"
//               sx={{ mb: 2 }}
//               value={globalDocumentType}
//               onChange={(e) => setGlobalDocumentType(e.target.value)}
//             />
//             {renderAttributeFields(
//               globalAttributes,
//               (i, k, v) => {
//                 const updated = [...globalAttributes];
//                 updated[i][k] = v;
//                 setGlobalAttributes(updated);
//               },
//               (i) => {
//                 const updated = [...globalAttributes];
//                 updated.splice(i, 1);
//                 setGlobalAttributes(updated);
//               }
//             )}
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               alignItems="center"
//               mt={2}
//             >
//               <Button
//                 startIcon={<AddIcon />}
//                 onClick={() =>
//                   setGlobalAttributes([...globalAttributes, attributeTemplate])
//                 }
//               >
//                 Add Attribute
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleSaveGlobalTypes}
//                 disabled={!globalDocumentType.trim()}
//               >
//                 Save Global Type
//               </Button>
//             </Box>
//           </Box>
//         </Paper>
//       )}

//       {/* Similar UI rendering for Departments and Global tabs should follow the same pattern */}

//       {/* Dialog */}
//       <Dialog
//         open={openDialog}
//         onClose={() => setOpenDialog(false)}
//         fullWidth
//         maxWidth="md"
//       >
//         <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
//           {dialogTarget === "user" ? "Type for User" : "Type for Department"}
//         </DialogTitle>
//         <DialogContent dividers>
//           <TextField
//             label="Document Type"
//             fullWidth
//             size="small"
//             sx={{ my: 2 }}
//             value={documentType}
//             onChange={(e) => setDocumentType(e.target.value)}
//           />
//           {renderAttributeFields(
//             attributes,
//             (i, k, v) => {
//               const updated = [...attributes];
//               updated[i][k] = v;
//               setAttributes(updated);
//             },
//             (i) => {
//               const updated = [...attributes];
//               updated.splice(i, 1);
//               setAttributes(updated);
//             }
//           )}
//           <Button
//             startIcon={<AddIcon />}
//             onClick={() => setAttributes([...attributes, attributeTemplate])}
//           >
//             Add Attribute
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleSaveClick}
//             disabled={!documentType.trim()}
//           >
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <CustomAlert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </CustomAlert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default DepartmentTypeSetting;

