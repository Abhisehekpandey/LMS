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
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  MenuItem,
  Grid,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { saveFileType, saveUserFileType } from "../api/type";
import { getDepartments } from "../api/departmentService";
import { fetchUsers } from "../api/userService";
import Loading from "../components/Loading";

const CustomAlert = React.forwardRef(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const attributeTemplate = {
  name: "",
  type: "STRING",
  defaultValue: "",
  mandatory: false,
  description: "",
};

const attributeTypes = ["STRING", "NUMBER", "DATE", "BOOLEAN"];

const DepartmentTypeSetting = () => {
  const [tabValue, setTabValue] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTarget, setDialogTarget] = useState("department");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [attributes, setAttributes] = useState([attributeTemplate]);
  const [globalDocumentType, setGlobalDocumentType] = useState("");
  const [globalAttributes, setGlobalAttributes] = useState([attributeTemplate]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDepartments();
  }, [page, pageSize]);
  useEffect(() => {
    fetchUsersData();
  }, [userPage, userPageSize]);

  const fetchDepartments = async () => {
    setLoading(true);
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

  const fetchUsersData = async () => {
    setLoading(true);
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

  const handleOpenDialog = (entity, target) => {
    setSelectedEntity(entity);
    setDialogTarget(target);
    setDocumentType("");
    setAttributes([attributeTemplate]);
    setOpenDialog(true);
  };

  const handleSaveClick = async () => {
    const token = sessionStorage.getItem("authToken");
    const username = sessionStorage.getItem("adminEmail");
    if (!username || !token) return;
    try {
      if (dialogTarget === "user") {
        await saveUserFileType({
          documentType,
          username,
          attributes,
          token,
          userId: selectedEntity?.id,
        });
      } else {
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
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to create file type",
        severity: "error",
      });
    }
  };

  const handleSaveGlobalTypes = async () => {
    const token = sessionStorage.getItem("authToken");
    const username = sessionStorage.getItem("adminEmail");
    if (!username || !token || !globalDocumentType.trim()) return;
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
      setGlobalDocumentType("");
      setGlobalAttributes([attributeTemplate]);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to save global types",
        severity: "error",
      });
    }
  };

  const renderAttributeFields = (data, handlerChange, handlerRemove) =>
    data.map((attr, index) => (
      <Box
        key={index}
        display="flex"
        flexDirection="column"
        gap={1}
        mb={2}
        p={2}
        borderRadius={2}
        border="1px solid #ccc"
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Attribute Name"
              fullWidth
              size="small"
              value={attr.name}
              onChange={(e) => handlerChange(index, "name", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Type"
              select
              fullWidth
              size="small"
              value={attr.type}
              onChange={(e) => handlerChange(index, "type", e.target.value)}
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
              label="Default Value"
              fullWidth
              size="small"
              value={attr.defaultValue}
              onChange={(e) =>
                handlerChange(index, "defaultValue", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={attr.mandatory}
                  onChange={(e) =>
                    handlerChange(index, "mandatory", e.target.checked)
                  }
                />
              }
              label="Mandatory"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              size="small"
              value={attr.description}
              onChange={(e) =>
                handlerChange(index, "description", e.target.value)
              }
            />
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="flex-end">
          <IconButton
            color="error"
            onClick={() => handlerRemove(index)}
            disabled={data.length === 1}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
    ));

  return (
    <Box p={3} maxWidth="1200px" mx="auto">
      <Paper elevation={3} sx={{ mb: 1,  }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" />
          <Tab
            icon={<CategoryIcon />}
            iconPosition="start"
            label="Departments"
          />
          <Tab
            icon={<AddBusinessIcon />}
            iconPosition="start"
            label="Global Types"
          />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Paper elevation={3}>
          <Box
            p={2}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ backgroundColor: "background.paper" }}
            borderTopRadius={10}
          >
            <PeopleIcon color="primary" />
            <Typography variant="h6">Users</Typography>
          </Box>
          <Box sx={{ borderTop: "1px solid #e0e0e0" }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "background.default" }}>
                  <TableCell align="center">
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Created On</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell align="center">{user.name || "N/A"}</TableCell>
                      <TableCell align="center">
                        {user.email || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(user.createdOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenDialog(user, "user")}
                        >
                          Add Type
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            // component="div"
            count={totalUsers}
            page={userPage}
            onPageChange={(e, newPage) => setUserPage(newPage)}
            rowsPerPage={userPageSize}
            onRowsPerPageChange={(e) =>
              setUserPageSize(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper elevation={3}>
          <Box
            p={2}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ backgroundColor: "background.paper" }}
            borderTopRadius={2}
          >
            <CategoryIcon color="primary" />
            <Typography variant="h6">Departments</Typography>
          </Box>
          <Box sx={{ borderTop: "1px solid #e0e0e0" }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "background.default" }}>
                  <TableCell align="center">
                    <strong>Department Name</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Display Name</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Created On</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No departments found
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id} hover>
                      <TableCell align="center">{dept.deptName}</TableCell>
                      <TableCell align="center">
                        {dept.deptDisplayName}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(dept.createdOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenDialog(dept, "department")}
                        >
                          Add Type
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            // component="div"
            count={totalDepartments}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) =>
              setPageSize(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper elevation={3}>
          <Box
            p={2}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ backgroundColor: "background.paper" }}
            borderTopRadius={2}
          >
            <AddBusinessIcon color="primary" />
            <Typography variant="h6">Global Types</Typography>
          </Box>
          <Box sx={{ borderTop: "1px solid #e0e0e0" }} />
          <Box p={3}>
            <TextField
              label="Global Document Type"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={globalDocumentType}
              onChange={(e) => setGlobalDocumentType(e.target.value)}
            />
            {renderAttributeFields(
              globalAttributes,
              (i, k, v) => {
                const updated = [...globalAttributes];
                updated[i][k] = v;
                setGlobalAttributes(updated);
              },
              (i) => {
                const updated = [...globalAttributes];
                updated.splice(i, 1);
                setGlobalAttributes(updated);
              }
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  setGlobalAttributes([...globalAttributes, attributeTemplate])
                }
              >
                Add Attribute
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveGlobalTypes}
                disabled={!globalDocumentType.trim()}
              >
                Save Global Type
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Departments and Global tab layouts should follow same table structure for consistency */}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          {dialogTarget === "user" ? "Type for User" : "Type for Department"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Document Type"
            fullWidth
            size="small"
            sx={{ my: 2 }}
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />
          {renderAttributeFields(
            attributes,
            (i, k, v) => {
              const updated = [...attributes];
              updated[i][k] = v;
              setAttributes(updated);
            },
            (i) => {
              const updated = [...attributes];
              updated.splice(i, 1);
              setAttributes(updated);
            }
          )}
          <Button
            startIcon={<AddIcon />}
            onClick={() => setAttributes([...attributes, attributeTemplate])}
          >
            Add Attribute
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={!documentType.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
