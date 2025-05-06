import { Add, Close, Download, Info, UploadFile } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React from "react";
import { useState } from "react";
import * as yup from "yup";
import { createUserAction } from "../../redux/userSlice";
import { useDispatch } from "react-redux";

const CreateUser = ({ handleClose }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [addDepartment, setAddDepartment] = useState(false);
  const [addRole, setAddRole] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const dispatch = useDispatch();
  // File ko handle karne ka function

  const storageOptions = ["10", "20", "40", "60"];

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Sirf pehla file
    if (file) {
      setBulkFile(file); // File ko state mein daal diya
      setFileName(file.name); // File ka naam state mein daal diya
    }
  };
  const handleBulkUpload = () => {
    if (bulkFile) {
      console.log("File upload ho rahi hai:", bulkFile);
      // API call ya file upload logic yahan implement kar sakte ho
    } else {
      alert("Pehle file select karo!");
    }
  };

  const validationSchema = yup.object().shape({
    userName: yup.string().required("user Name  is required"),
    name: yup.string().required("Full Name is required"),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    phone: yup
      .string()
      .matches(/^\d{10}$/, "Phone Number must be 10 digits")
      .required("Phone Number is required"),
  });

  const initialValues = {
    userName: "",
    name: "",
    email: "",
    phone: "",
    storage: "",
    role: "",
    department: "",
    reportingManager: "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: function (values) {
      console.log(values);
      dispatch(createUserAction());
      handleClose();
    },
  });

  const storageAllocation = ["25GB", "50GB", "100GB", "200GB", "500GB"];

  const departments = ["HR", "IT", "Finance", "Sales"];

  const rolesByDepartment = {
    HR: ["HR Manager", "Recruiter", "HR Assistant"],
    IT: ["Software Engineer", "System Admin", "IT Support"],
    Finance: ["Accountant", "Financial Analyst"],
    Sales: ["Sales Manager", "Sales Executive", "Business Development"],
  };

  const reportingManagersByRole = {
    "HR Manager": ["Alice", "Bob"],
    "Software Engineer": ["Charlie", "David"],
    Accountant: ["Eve", "Frank"],
    "Sales Manager": ["George", "Helen"],
  };

  const roleOptions = selectedDepartment
    ? rolesByDepartment[selectedDepartment] || []
    : [];
  const managerOptions = selectedRole
    ? reportingManagersByRole[selectedRole] || []
    : [];

  return (
    <div>
      <DialogTitle
        sx={{
          //   borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            alignItems: "center",
            display: "flex",
            fontFamily: '"Be Vietnam", sans-serif',
          }}
        >
          ADD NEW USER
        </Typography>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "error.main",
            width: 32,
            height: 32,
            border: "1px solid",
            borderColor: "error.light",
            bgcolor: "error.lighter",
            borderRadius: "50%",
            position: "relative",
            "&:hover": {
              color: "error.dark",
              borderColor: "error.main",
              bgcolor: "error.lighter",
              transform: "rotate(180deg)",
            },
            transition: "transform 0.3s ease",
          }}
        >
          <Close
            sx={{
              fontSize: "1rem",
              transition: "transform 0.2s ease",
            }}
          />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers padding="8px 10px !important">
        <form onSubmit={formik.handleSubmit}>
          <Paper elevation={4} sx={{ padding: 2 }}>
            <Grid container spacing={2} padding={0}>
              <Grid xs={12} item>
                <Typography
                  variant="subtitle2"
                  sx={{
                    // mb: 2,
                    color: "black",
                    fontFamily: '"Be Vietnam", sans-serif',
                    fontWeight: "bold",
                  }}
                >
                  Basic Information
                </Typography>
              </Grid>
              <Grid xs={6} item>
                <TextField
                  required
                  autoComplete="off"
                  size="small"
                  fullWidth
                  label="User name"
                  name="userName"
                  value={formik.values.userName} // Bind to formik values
                  onChange={formik.handleChange} // Bind to formik handleChange
                  error={
                    formik.touched.userName && Boolean(formik.errors.userName)
                  }
                  helperText={formik.touched.userName && formik.errors.userName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  size="small"
                  Autocomplete="off"
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formik.values.name} // Bind to formik values
                  onChange={formik.handleChange} // Bind to formik handleChange
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid xs={4} item>
                <TextField
                  Autocomplete="off"
                  required
                  size="small"
                  fullWidth
                  label="Email"
                  name="email"
                  value={formik.values.email} // Bind to formik values
                  onChange={formik.handleChange} // Bind to formik handleChange
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  Autocomplete="off"
                  // required
                  size="small"
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formik.values.phone} // Bind to formik values
                  onChange={formik.handleChange} // Bind to formik handleChange
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  options={storageOptions}
                  getOptionLabel={(option) => option.toString()} // if options are numbers or strings
                  value={formik.values.storage || ""} // Bind to formik
                  onChange={(event, value) =>
                    formik.setFieldValue("storage", value)
                  }
                  onBlur={() => formik.setFieldTouched("storage", true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      size="small"
                      fullWidth
                      label="Storage"
                      name="storage"
                      error={
                        formik.touched.storage && Boolean(formik.errors.storage)
                      }
                      helperText={
                        formik.touched.storage && formik.errors.storage
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            <InputAdornment position="end">GB</InputAdornment>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={4} sx={{ mt: 1, padding: 2 }}>
            <Grid container spacing={2} padding={0}>
              <Grid xs={12} item>
                <Typography
                  variant="subtitle2"
                  sx={{
                    // mb: 2,
                    color: "black",
                    fontFamily: '"Be Vietnam", sans-serif',
                    fontWeight: "bold",
                  }}
                >
                  Department & Role
                </Typography>
              </Grid>
              <Grid xs={4} item>
                <Autocomplete
                  autoComplete="off"
                  size="small"
                  id="department-autocomplete"
                  options={departments}
                  value={formik.values.department || null}
                  onChange={(event, newValue) => {
                    formik.setFieldValue("department", newValue);
                    setSelectedDepartment(newValue); // optional, for local use
                  }}
                  ListboxComponent={({ children, ...props }) => (
                    <ul {...props}>
                      <li
                        style={{
                          padding: "2px",
                          borderTop: "1px solid #eee",
                        }}
                      >
                        <Button
                          onClick={() => setAddDepartment(true)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<Add />}
                          sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                        >
                          Add New Department
                        </Button>
                      </li>
                      {children}
                    </ul>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Department"
                      name="department"
                      error={Boolean(
                        formik.touched.department && formik.errors.department
                      )}
                      helperText={
                        formik.touched.department && formik.errors.department
                          ? formik.errors.department
                          : ""
                      }
                    />
                  )}
                />
              </Grid>
              <Grid xs={4} item>
                <Autocomplete
                  size="small"
                  id="role-autocomplete"
                  options={roleOptions}
                  name="role"
                  autoComplete="off"
                  value={formik.values.role || null}
                  disabled={!formik.values.department}
                  onChange={(event, newValue) => {
                    formik.setFieldValue("role", newValue);
                    setSelectedRole(newValue); // optional local state
                  }}
                  ListboxComponent={({ children, ...props }) => (
                    <ul {...props}>
                      <li
                        style={{
                          padding: "2px",
                          borderTop: "1px solid #eee",
                        }}
                      >
                        <Button
                          onClick={() => setAddRole(true)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<Add />}
                          sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
                        >
                          Add New Role
                        </Button>
                      </li>
                      {children}
                    </ul>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role"
                      name="role"
                      error={Boolean(formik.touched.role && formik.errors.role)}
                      helperText={
                        formik.touched.role && formik.errors.role
                          ? formik.errors.role
                          : ""
                      }
                      InputProps={{
                        ...params.InputProps,
                        sx: { fontFamily: '"Be Vietnam", sans-serif' },
                      }}
                      InputLabelProps={{
                        sx: { fontFamily: '"Be Vietnam", sans-serif' },
                      }}
                      FormHelperTextProps={{
                        sx: { fontFamily: '"Be Vietnam", sans-serif' },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Reporting Manager"
                  size="small"
                  fullWidth
                  id="manager-autocomplete"
                  options={managerOptions}
                  autoComplete="off"
                  name="reportingManager"
                  value={formik.values.manager || null}
                  disabled={!formik.values.role}
                  onChange={(event, newValue) => {
                    formik.setFieldValue("reportingManager", newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Manager"
                      name="manager"
                      error={Boolean(
                        formik.touched.manager && formik.errors.manager
                      )}
                      helperText={
                        formik.touched.manager && formik.errors.manager
                          ? formik.errors.manager
                          : ""
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </form>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          //   padding: 2,
        }}
      >
        <div style={{ display: "flex", gap: "5px" }}>
          <Button
            component="a"
            href="/templates/user_template.csv"
            download
            sx={{
              backgroundColor: "primary.lighter",
              border: "1px solid",
              borderColor: "primary.light",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "primary.100",
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
              },
              transition: "all 0.2s ease",
              borderRadius: "8px",
            }}
            endIcon={<Download sx={{ fontSize: 20 }} />}
          >
            Download Template
          </Button>
          <Button
            sx={{
              // backgroundColor: "success.lighter",
              border: "1px solid",
              borderColor: "success.light",
              color: "success.main",
              "&:hover": {
                //   backgroundColor: "success.100",
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
              },
              transition: "all 0.2s ease",
              color: "white",
              borderRadius: "8px",
            }}
            color="primary"
            endIcon={<UploadFile />}
            variant="contained"
            onClick={() => document.getElementById("bulk-upload-input").click()}
          >
            Bulk Upload
          </Button>
          <input
            id="bulk-upload-input"
            type="file"
            style={{ display: "none" }}
            accept=".csv" // File type jo allowed hai
            onChange={handleFileChange} // File select hone par handleFileChange chalega
          />

          {/* File name dikhana */}
          {fileName && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected File: {fileName}
            </Typography>
          )}
        </div>
        <div>
          <Button
            variant="contained"
            sx={{
              background: "rgb(251, 68, 36)",
              color: "white",
              "&:hover": {
                background: "rgb(251, 68, 36)",
                color: "white",
              },
            }}
            // onClick={handleClose}
            type="submit"
            onClick={formik.handleSubmit}
          >
            ADD USER
          </Button>
        </div>
      </DialogActions>
      {/* add new dept */}
      <Dialog
        open={addDepartment}
        fullWidth
        onClose={() => setAddDepartment(false)}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Be Vietnam", sans-serif',
            }}
          >
            ADD NEW DEPARTMENT
          </Typography>
          <IconButton
            onClick={() => setAddDepartment(false)}
            size="small"
            sx={{
              color: "error.main",
              width: 32,
              height: 32,
              border: "1px solid",
              borderColor: "error.light",
              bgcolor: "error.lighter",
              borderRadius: "50%",
              position: "relative",
              "&:hover": {
                color: "error.dark",
                borderColor: "error.main",
                bgcolor: "error.lighter",
                transform: "rotate(180deg)",
              },
              transition: "transform 0.3s ease",
            }}
          >
            <Close
              sx={{
                fontSize: "1.1rem",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers padding="0 !important">
          <Grid container spacing={2} padding={0}>
            <Grid xs={6} item>
              <TextField
                required
                size="small"
                Autocomplete="off"
                fullWidth
                label="Department Name"
                name="name"
              />
            </Grid>
            <Grid xs={6} item>
              <TextField
                required
                size="small"
                Autocomplete="off"
                fullWidth
                label="Department Moderator"
                name="name"
              />
            </Grid>
            <Grid xs={4} item>
              <TextField
                required
                size="small"
                Autocomplete="off"
                fullWidth
                label="Short Name"
                name="name"
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                size="small"
                Autocomplete="off"
                options={storageAllocation}
                renderInput={(params) => (
                  <TextField {...params} label="Storage" />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                Autocomplete="off"
                fullWidth
                label="Initail Role"
                name="name"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddDepartment(false)}
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgb(251, 68, 36)",
                color: "white",
              },
            }}
            variant="contained"
          >
            ADD DEPARTMENT
          </Button>
        </DialogActions>
      </Dialog>

      {/* add new role */}
      <Dialog open={addRole} onClose={() => setAddRole(false)}>
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Be Vietnam", sans-serif',
            }}
          >
            ADD NEW ROLE
          </Typography>
          <IconButton
            onClick={() => setAddRole(false)}
            size="small"
            sx={{
              color: "error.main",
              border: "1px solid",
              borderColor: "error.light",
              bgcolor: "error.lighter",
              borderRadius: "50%",
              position: "relative",
              "&:hover": {
                color: "error.dark",
                borderColor: "error.main",
                bgcolor: "error.lighter",
                transform: "rotate(180deg)",
              },
              transition: "transform 0.3s ease",
            }}
          >
            <Close
              sx={{
                fontSize: "1.1rem",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} padding={0}>
            <Grid xs={12} item>
              <TextField
                required
                size="small"
                Autocomplete="off"
                fullWidth
                label="Role Name"
                name="name"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddRole(false)}
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgb(251, 68, 36)",
                color: "white",
              },
            }}
            variant="contained"
          >
            ADD ROLE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateUser;
