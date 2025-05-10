// updated CreateUser component with collapsed cards for non-active users
import { Add, Close, Download, Info, UploadFile } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Collapse,
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
import { Formik, FieldArray, Form } from "formik";
import React, { useState, useRef, useEffect } from "react";
import * as yup from "yup";
import { createUserAction } from "../../redux/userSlice";
import { useDispatch } from "react-redux";

const CreateUser = ({ handleClose }) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [addDepartment, setAddDepartment] = useState(false);
  const [addRole, setAddRole] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const lastFieldRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (lastFieldRef.current) {
      lastFieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      lastFieldRef.current.querySelector("input")?.focus();
    }
  }, [expandedIndex]);

  const storageOptions = ["10GB", "20GB", "25GB","40GB","50GB", "60GB","100GB","200GB","500GB"];
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

  const initialValues = {
    users: [
      {
        name: "",
        email: "",
        phone: "",
        storage: "",
        role: "",
        department: "",
        reportingManager: "",
      },
    ],
  };

  const validationSchema = yup.object().shape({
    users: yup.array().of(
      yup.object().shape({
        name: yup.string().required("Full Name is required"),
        email: yup.string().email("Enter a valid email").required("Email is required"),
        phone: yup.string().matches(/^\d{10}$/, "Phone Number must be 10 digits").required("Phone Number is required"),
      })
    ),
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBulkFile(file);
      setFileName(file.name);
    }
  };

  return (
    <>
      {/* <DialogTitle>ADD NEW USERS</DialogTitle> */}
      <DialogTitle
              sx={{
                
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                
                backgroundColor:"primary.main"
                
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  alignItems: "center",
                  display: "flex",
                  fontFamily: '"Be Vietnam", sans-serif',
                  color:"#ffff"
                }}
              >
                ADD NEW USER
              </Typography>
      
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{
                  color: "#ffff",
                  width: 32,
                  height: 32,
                  border: "1px solid",
                  borderColor: "#ffff",
                  bgcolor: "error.lighter",
                  borderRadius: "50%",
                  position: "relative",
                  "&:hover": {
                   
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
            
      <DialogContent dividers>
         <div style={{ display: "flex", gap: "10px", marginLeft:"230px" ,marginBottom:"15px" }}>
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
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log("Submitting multiple users:", values.users);
            dispatch(createUserAction(values.users));
            handleClose();
          }}
        >
          {(formik) => (
            <Form>
              <FieldArray name="users">
                {({ push, remove }) => (
                  <>
                    {formik.values.users.map((user, index) => {
                      const roleOptions = user.department ? rolesByDepartment[user.department] || [] : [];
                      const managerOptions = user.role ? reportingManagersByRole[user.role] || [] : [];
                      const isExpanded = index === expandedIndex;

                      return (
                        <Paper
                          key={index}
                          ref={isExpanded ? lastFieldRef : null}
                          elevation={3}
                          sx={{ padding: isExpanded ? 2 : 1, mb: 2, bgcolor: isExpanded ? 'background.paper' : 'grey.100',borderRadius:"20px" }}
                          onClick={() => setExpandedIndex(index)}
                        >
                          {isExpanded ? (
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <TextField
                                  label="Full Name"
                                  name={`users[${index}].name`}
                                  value={user.name}
                                  onChange={formik.handleChange}
                                  error={Boolean(formik.touched.users?.[index]?.name && formik.errors.users?.[index]?.name)}
                                  helperText={formik.touched.users?.[index]?.name && formik.errors.users?.[index]?.name}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Email"
                                  name={`users[${index}].email`}
                                  value={user.email}
                                  onChange={formik.handleChange}
                                  error={Boolean(formik.touched.users?.[index]?.email && formik.errors.users?.[index]?.email)}
                                  helperText={formik.touched.users?.[index]?.email && formik.errors.users?.[index]?.email}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                
                                <TextField
                                  label="Phone Number"
                                  name={`users[${index}].phone`}
                                  value={user.phone}
                                  onChange={formik.handleChange}
                                  error={Boolean(formik.touched.users?.[index]?.phone && formik.errors.users?.[index]?.phone)}
                                  helperText={formik.touched.users?.[index]?.phone && formik.errors.users?.[index]?.phone}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <Autocomplete
                                  options={storageOptions}
                                  value={user.storage || ""}
                                  onChange={(e, value) => formik.setFieldValue(`users[${index}].storage`, value)}
                                  renderInput={(params) => (
                                    <TextField {...params} label="Storage" size="small" fullWidth />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <Autocomplete
                                  options={departments}
                                  value={user.department || ""}
                                  onChange={(e, value) => formik.setFieldValue(`users[${index}].department`, value)}
                                  renderInput={(params) => (
                                    <TextField {...params} label="Department" size="small" fullWidth />
                                  )}
                                  ListboxComponent={({ children, ...props }) => (
                                    <ul {...props}>
                                      <li style={{ padding: "2px", borderTop: "1px solid #eee" }}>
                                        <Button
                                          onClick={() => setAddDepartment(true)}
                                          color="primary"
                                          variant="outlined"
                                          size="small"
                                          fullWidth
                                          startIcon={<Add />}
                                        >
                                          Add New Department
                                        </Button>
                                      </li>
                                      {children}
                                    </ul>
                                  )}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <Autocomplete
                                  options={roleOptions}
                                  value={user.role || ""}
                                  onChange={(e, value) => formik.setFieldValue(`users[${index}].role`, value)}
                                  renderInput={(params) => (
                                    <TextField {...params} label="Role" size="small" fullWidth />
                                  )}
                                  ListboxComponent={({ children, ...props }) => (
                                    <ul {...props}>
                                      <li style={{ padding: "2px", borderTop: "1px solid #eee" }}>
                                        <Button
                                          onClick={() => setAddRole(true)}
                                          color="primary"
                                          variant="outlined"
                                          size="small"
                                          fullWidth
                                          startIcon={<Add />}
                                        >
                                          Add New Role
                                        </Button>
                                      </li>
                                      {children}
                                    </ul>
                                  )}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Autocomplete
                                  options={managerOptions}
                                  value={user.reportingManager || ""}
                                  onChange={(e, value) => formik.setFieldValue(`users[${index}].reportingManager`, value)}
                                  renderInput={(params) => (
                                    <TextField {...params} label="Reporting Manager" size="small" fullWidth />
                                  )}
                                />
                              </Grid>
                              {/* <Grid item xs={12} >
                                <IconButton
                                  onClick={() => remove(index)}
                                  disabled={formik.values.users.length === 1}
                                  color="error"
                                >
                                  <Close />
                                </IconButton>
                              </Grid> */}
                              {formik.values.users.length > 1 && (
  <Grid item xs={12}>
    <IconButton onClick={() => remove(index)} color="error">
      <Close />
    </IconButton>
  </Grid>
)}
                            </Grid>
                          ) : (
                            <Typography variant="body2">
                              {user.name || "Unnamed User"} - {user.email || "No Email"}
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}

                    <div style={{  display: "flex", gap: "550px", }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        const newIndex = formik.values.users.length;
                        setExpandedIndex(newIndex);
                        push({
                          name: "",
                          email: "",
                          phone: "",
                          storage: "",
                          role: "",
                          department: "",
                          reportingManager: "",
                        });
                      }}
                    >
                      Add Another User
                    </Button>

                    <Button
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: "rgb(251, 68, 36)", color: "white" }}
                >
                  ADD USERS
                </Button>
                </div>
                  
                  </>
                )}
              </FieldArray>
             
            </Form>
          )}
        </Formik>
      </DialogContent>
      
       <Dialog open={addDepartment} onClose={() => setAddDepartment(false)} fullWidth sx={{ animation: "slideInFromLeft 0.2s ease-in-out forwards",
          opacity: 0, // Start with opacity 0
          transform: "translateX(-50px)", // Start from left
          "@keyframes slideInFromLeft": {
            "0%": {
              opacity: 0,
              transform: "translateX(-50px)",
            },
            "100%": {
              opacity: 1,
              transform: "translateX(0)",
            },
          },}}>
       
         <DialogTitle
                  sx={{
                    pb: 1,
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    backgroundColor:"primary.main"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Be Vietnam", sans-serif',
                      color:"#ffff"
                    }}
                  >
                    ADD NEW DEPARTMENT
                  </Typography>
                  <IconButton
                    onClick={() => setAddDepartment(false)}
                    size="small"
                    sx={{
                      color: "#ffff",
                      width: 32,
                      height: 32,
                      border: "1px solid",
                      borderColor: "#ffff",
                      bgcolor: "error.lighter",
                      borderRadius: "50%",
                      position: "relative",
                      "&:hover": {
                        // color: "error.dark",
                        // borderColor: "error.main",
                        // bgcolor: "error.lighter",
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
        {/* <DialogContent> */}
           <DialogContent dividers padding="0 !important">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Department Name" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Department Moderator" />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth size="small" label="Short Name" />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete options={storageAllocation} renderInput={(params) => <TextField {...params} label="Storage" size="small" />} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth size="small" label="Initial Role" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDepartment(false)} variant="contained" color="primary" sx={{backgroundColor: "rgb(251, 68, 36)",}}>
            ADD DEPARTMENT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog open={addRole} onClose={() => setAddRole(false)} fullWidth sx={{ animation: "slideInFromLeft 0.2s ease-in-out forwards",
            opacity: 0, // Start with opacity 0
            transform: "translateX(-50px)", // Start from left
            "@keyframes slideInFromLeft": {
              "0%": {
                opacity: 0,
                transform: "translateX(-50px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateX(0)",
              },
            },}}>
        {/* <DialogTitle>ADD NEW ROLE</DialogTitle> */}
         <DialogTitle
                  sx={{
                    pb: 1,
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                    backgroundColor:"primary.main"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Be Vietnam", sans-serif',
                      color:"#ffff"
                    }}
                  >
                    ADD NEW ROLE
                  </Typography>
                  <IconButton
                    onClick={() => setAddRole(false)}
                    size="small"
                    sx={{
                      color: "#ffff",
                      border: "1px solid",
                      borderColor: "#ffff",
                      bgcolor: "error.lighter",
                      borderRadius: "50%",
                      position: "relative",
                      "&:hover": {
                        // color: "error.dark",
                        // borderColor: "error.main",
                        // bgcolor: "error.lighter",
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
        {/* <DialogContent> */}
           <DialogContent dividers padding="0 !important">
          <TextField  size="small" label="Role Name" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRole(false)} variant="contained" color="primary" sx={{backgroundColor: "rgb(251, 68, 36)",}}>
            ADD ROLE
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateUser;
