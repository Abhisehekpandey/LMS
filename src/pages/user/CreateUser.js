// updated CreateUser component with collapsed cards for non-active users
import { Add, Close, Download, UploadFile } from "@mui/icons-material";
import axios from "axios";
import {
  Autocomplete,
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
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import * as yup from "yup";
import { createUserAction } from "../../redux/userSlice";
import { useDispatch } from "react-redux";
import {
  createDepartment,
  getDepartments,
  createRole,
} from "../../api/departmentService";
import { createUsers } from "../../api/userService";

const CreateUser = ({ handleClose }) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [addDepartment, setAddDepartment] = useState(false);
  const [addRole, setAddRole] = useState(false);
  const [selectedDepartmentForRole, setSelectedDepartmentForRole] =
    useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [newDepartment, setNewDepartment] = useState({
    deptName: "",
    deptModerator: "",
    deptDisplayName: "",
    storage: "",
    role: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'error' | 'info' | 'warning'

  const lastFieldRef = useRef(null);
  const dispatch = useDispatch();

  const adminEmail = sessionStorage.getItem("adminEmail"); // You must save this during login!
  const adminDomain = adminEmail?.split("@")[1]; // Extract domain

  const handleUserEmailChange = (e, index, formik) => {
    const { value } = e.target;

    // Update the formik value
    formik.setFieldValue(`users[${index}].email`, value);

    // Immediate domain check
    const adminEmail = sessionStorage.getItem("adminEmail");
    const adminDomain = adminEmail?.split("@")[1];
    const emailDomain = value.split("@")[1];

    if (emailDomain && emailDomain !== adminDomain) {
      formik.setFieldError(
        `users[${index}].email`,
        "Email domain must match admin domain"
      );
    } else {
      formik.setFieldError(`users[${index}].email`, undefined); // Clear error
    }
  };

  useEffect(() => {
    if (lastFieldRef.current) {
      lastFieldRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      lastFieldRef.current.querySelector("input")?.focus();
    }
  }, [expandedIndex]);

  const storageOptions = [
    "0GB",
    "1GB",
    "10GB",
    "20GB",
    "25GB",
    "40GB",
    "50GB",
    "60GB",
    "100GB",
    "200GB",
    "500GB",
  ];
  const storageAllocation = [
    "0GB",
    "1GB",
    "2GB",
    "3GB",
    "5GB",
    "25GB",
    "50GB",
    "100GB",
    "200GB",
    "500GB",
  ];

  const [departments, setDepartments] = useState([]);

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

        email: yup
          .string()
          .email("Enter a valid email")
          .required("Email is required")
          .test(
            "domain-match",
            "Email domain must match admin domain",
            function (value) {
              const emailDomain = value?.split("@")[1];
              return emailDomain === adminDomain;
            }
          ),
        phone: yup
          .string()
          .matches(/^\d{10}$/, "Phone Number must be 10 digits")
          .required("Phone Number is required"),
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

  const addRoleToDepartment = async (deptName, roleName) => {
    console.log(">>>deptName", deptName.deptName);
    console.log(">>>role", roleName);

    const payload = { department: deptName.deptName, role: roleName };
    console.log("payyload", payload);

    try {
      const response = await createRole(payload); // your API function to add role
      console.log("response2", response);
      return response;
    } catch (error) {
      console.error("Error adding role:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartments();
        console.log(">>>out", res);
        setDepartments(res);
      } catch (err) {
        console.error("Error loading departments:", err);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    console.log("Updated departments:", departments);
  }, [departments]);

  return (
    <>
      {/* <DialogTitle>ADD NEW USERS</DialogTitle> */}
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
            alignItems: "center",
            display: "flex",
            fontFamily: '"Be Vietnam", sans-serif',
            color: "#ffff",
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
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginLeft: "230px",
            marginBottom: "15px",
          }}
        >
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
          onSubmit={async (values, actions) => {
            try {
              const transformedUsers = values.users.map((user) => ({
                name: user.name,
                email: user.email,
                deptName:
                  typeof user.department === "object"
                    ? user.department.deptName
                    : user.department,
                roleName:
                  typeof user.role === "object"
                    ? user.role.roleName
                    : user.role,
                phoneNumber: user.phone,
                storage: user.storage,
                reportingManager: user.reportingManager,
              }));

              await createUsers(transformedUsers);

              setSnackbarMessage("Users created successfully!");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              handleClose();
            } catch (error) {
              setSnackbarMessage("Failed to create users. Please try again.");
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
              console.error("Failed to create users", error);
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {(formik) => (
            <Form>
              <FieldArray name="users">
                {({ push, remove }) => (
                  <>
                    {formik.values.users.map((user, index) => {
                      console.log(">>user.department", user.department);

                      const selectedDeptName =
                        typeof user.department === "string"
                          ? user.department
                          : user.department?.deptName;

                      console.log(">selectedDepartment", selectedDeptName);

                      const selectedDept = departments.find(
                        (dept) => dept.deptName === selectedDeptName
                      );

                      console.log(">>ss", selectedDept);

                      const roleOptions = selectedDept?.roles || [];

                      const isExpanded = index === expandedIndex;

                      return (
                        <Paper
                          key={index}
                          ref={isExpanded ? lastFieldRef : null}
                          elevation={3}
                          sx={{
                            padding: isExpanded ? 2 : 1,
                            mb: 2,
                            bgcolor: isExpanded
                              ? "background.paper"
                              : "grey.100",
                            borderRadius: "20px",
                          }}
                          onClick={() => setExpandedIndex(index)}
                        >
                          {isExpanded ? (
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <TextField
                                  autoComplete="off"
                                  label="Full Name"
                                  name={`users[${index}].name`}
                                  value={user.name}
                                  onChange={formik.handleChange}
                                  error={Boolean(
                                    formik.touched.users?.[index]?.name &&
                                    formik.errors.users?.[index]?.name
                                  )}
                                  helperText={
                                    formik.touched.users?.[index]?.name &&
                                    formik.errors.users?.[index]?.name
                                  }
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Email"
                                  autoComplete="off"
                                  name={`users[${index}].email`}
                                  value={user.email}
                                  onChange={(e) =>
                                    handleUserEmailChange(e, index, formik)
                                  } // 👈 use custom handler
                                  onBlur={formik.handleBlur}
                                  error={Boolean(
                                    formik.touched.users?.[index]?.email &&
                                    formik.errors.users?.[index]?.email
                                  )}
                                  helperText={
                                    formik.errors.users?.[index]?.email
                                  }
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Phone Number"
                                  autoComplete="off"
                                  name={`users[${index}].phone`}
                                  value={user.phone}
                                  onChange={formik.handleChange}
                                  error={Boolean(
                                    formik.touched.users?.[index]?.phone &&
                                    formik.errors.users?.[index]?.phone
                                  )}
                                  helperText={
                                    formik.touched.users?.[index]?.phone &&
                                    formik.errors.users?.[index]?.phone
                                  }
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <Autocomplete
                                  options={storageOptions}
                                  value={user.storage || ""}
                                  onChange={(e, value) =>
                                    formik.setFieldValue(
                                      `users[${index}].storage`,
                                      value
                                    )
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      autoComplete="off"
                                      label="Storage"
                                      size="small"
                                      fullWidth
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={3}>
                                <Autocomplete
                                  options={[
                                    { isAddOption: true },
                                    ...departments,
                                  ]}
                                  getOptionLabel={(option) =>
                                    option.isAddOption
                                      ? "Add New Department"
                                      : option.deptName || ""
                                  }
                                  renderOption={(props, option) => (
                                    <li
                                      {...props}
                                      style={{
                                        fontStyle: option.isAddOption
                                          ? "normal"
                                          : "normal",
                                        color: option.isAddOption
                                          ? "#1976d2"
                                          : "inherit",
                                        fontWeight: option.isAddOption
                                          ? 600
                                          : "normal",
                                        borderTop: option.isAddOption
                                          ? "1px solid #eee"
                                          : "none",
                                        padding: "10px 16px",
                                        backgroundColor: option.isAddOption
                                          ? "#f9f9f9"
                                          : "inherit",
                                      }}
                                    >
                                      {option.isAddOption
                                        ? "➕ Add New "
                                        : option.deptName}
                                    </li>
                                  )}
                                  value={user.department || ""}
                                  onChange={(e, value) => {
                                    if (value?.isAddOption) {
                                      setAddDepartment(true);
                                      return;
                                    }
                                    formik.setFieldValue(
                                      `users[${index}].department`,
                                      value
                                    );
                                    formik.setFieldValue(
                                      `users[${index}].role`,
                                      value?.role || ""
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Department"
                                      fullWidth
                                      size="small"
                                      autoComplete="off"
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <Tooltip
                                  title={
                                    !user.department
                                      ? "Please select a department first"
                                      : ""
                                  }
                                  placement="top-start"
                                  arrow
                                >
                                  <div>
                                    <Autocomplete
                                      disabled={!user.department}
                                      options={[
                                        { isAddOption: true },
                                        ...roleOptions,
                                      ]}
                                      getOptionLabel={(option) =>
                                        option.isAddOption
                                          ? "Add New Role"
                                          : option
                                      }
                                      renderOption={(props, option) => (
                                        <li
                                          {...props}
                                          style={{
                                            fontStyle: option.isAddOption
                                              ? "normal"
                                              : "normal",
                                            color: option.isAddOption
                                              ? "#1976d2"
                                              : "inherit",
                                            fontWeight: option.isAddOption
                                              ? 600
                                              : "normal",
                                            borderTop: option.isAddOption
                                              ? "1px solid #eee"
                                              : "none",
                                            padding: "10px 16px",
                                            backgroundColor: option.isAddOption
                                              ? "#f9f9f9"
                                              : "inherit",
                                          }}
                                        >
                                          {option.isAddOption
                                            ? "➕ Add New Role"
                                            : option}
                                        </li>
                                      )}
                                      value={user.role || ""}
                                      onChange={(e, value) => {
                                        if (value?.isAddOption) {
                                          setSelectedDepartmentForRole(
                                            user.department
                                          );
                                          setAddRole(true);
                                          return;
                                        }
                                        formik.setFieldValue(
                                          `users[${index}].role`,
                                          value
                                        );
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Role"
                                          fullWidth
                                          size="small"
                                          autoComplete="off"
                                        />
                                      )}
                                    />
                                  </div>
                                </Tooltip>
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Reporting Manager"
                                  autoComplete="off"
                                  name={`users[${index}].reportingManager`}
                                  value={user.reportingManager}
                                  onChange={formik.handleChange}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>

                              {formik.values.users.length > 1 && (
                                <Grid item xs={12}>
                                  <IconButton
                                    onClick={() => remove(index)}
                                    color="error"
                                  >
                                    <Close />
                                  </IconButton>
                                </Grid>
                              )}
                            </Grid>
                          ) : (
                            <Typography variant="body2">
                              {user.name || "Unnamed User"} -{" "}
                              {user.email || "No Email"}
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}

                    <div style={{ display: "flex", gap: "550px" }}>
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
                        sx={{
                          backgroundColor: "rgb(251, 68, 36)",
                          color: "white",
                        }}
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

      <Dialog
        open={addDepartment}
        onClose={() => setAddDepartment(false)}
        fullWidth
        sx={{
          animation: "slideInFromLeft 0.2s ease-in-out forwards",
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
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: "1px solid #eee",
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
              fontFamily: '"Be Vietnam", sans-serif',
              color: "#ffff",
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
              <TextField
                fullWidth
                size="small"
                label="Department Name"
                value={newDepartment.deptName}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    deptName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Department Moderator"
                value={newDepartment.deptModerator}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    deptModerator: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label="Short Name"
                value={newDepartment.deptDisplayName}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    deptDisplayName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                options={storageAllocation}
                value={newDepartment.storage}
                onChange={(e, value) =>
                  setNewDepartment({ ...newDepartment, storage: value })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Storage" size="small" />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              {/* <TextField fullWidth size="small" label="Initial Role" /> */}
              <TextField
                fullWidth
                size="small"
                label="Initial Role"
                value={newDepartment.role}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    role: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                const payload = {
                  ...newDepartment,
                  role:
                    newDepartment.role.trim() === ""
                      ? null
                      : newDepartment.role,
                };
                const createdDept = await createDepartment(payload);

                console.log("Department created:", createdDept);
                setDepartments((prev) => [...prev, payload]);

                setNewDepartment({
                  deptName: "",
                  deptModerator: "",
                  deptDisplayName: "",
                  storage: "",
                  role: "",
                });
                setAddDepartment(false);
              } catch (error) {
                console.error("Failed to create department:", error);
              }
            }}
            variant="contained"
            color="primary"
            sx={{ backgroundColor: "rgb(251, 68, 36)" }}
          >
            ADD DEPARTMENT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog
        open={addRole}
        onClose={() => setAddRole(false)}
        fullWidth
        sx={{
          animation: "slideInFromLeft 0.2s ease-in-out forwards",
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
          },
        }}
      >
        {/* <DialogTitle>ADD NEW ROLE</DialogTitle> */}
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: "1px solid #eee",
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
              fontFamily: '"Be Vietnam", sans-serif',
              color: "#ffff",
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
          {/* <TextField size="small" label="Role Name" /> */}
          <TextField
            size="small"
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              if (!newRoleName.trim()) return; // no empty roles

              try {
                const addedRole = await addRoleToDepartment(
                  selectedDepartmentForRole,
                  newRoleName.trim()
                );
                console.log(">>>selected", selectedDepartmentForRole.deptName);
                console.log(">>>addedRole", addedRole[0]);
                console.log(">>>departments1", departments);
                setDepartments((prevDepartments) =>
                  prevDepartments.map((dept) =>
                    dept.deptName === selectedDepartmentForRole.deptName
                      ? {
                          ...dept,
                          roles: [...(dept.roles || []), addedRole[0]],
                        }
                      : dept
                  )
                );
                console.log(">>>departments222", departments);
                setNewRoleName("");
                setAddRole(false);
              } catch (error) {}
            }}
            variant="contained"
            color="primary"
            sx={{ backgroundColor: "rgb(251, 68, 36)" }}
          >
            ADD ROLE
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default CreateUser;
