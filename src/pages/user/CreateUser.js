import { Add, Close, Download, Info, UploadFile } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import Papa from "papaparse";

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
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import * as yup from "yup";

import { useDispatch } from "react-redux";
import {
  createDepartment,
  getDepartments,
  createRole,
} from "../../api/departmentService";
import { createUsers } from "../../api/userService";
import { fetchUsers } from "../../api/userService";

const emptyUser = {
  name: "",
  email: "",
  phone: "",
  storage: "",
  role: "",
  department: "",
  reportingManager: "",
};

const CreateUser = ({
  handleClose,
  onUserCreated,
  showSnackbar,
  allUsers = [],
}) => {
  const [formInitialValues, setFormInitialValues] = useState({
    users: [emptyUser],
  });
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState("");
  const [bulkWarningMessage, setBulkWarningMessage] = useState("");
  const [isAdminRole, setIsAdminRole] = useState(false);

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
    selectedUsers: [], // <-- new field
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  console.log(">>>>>ssssss1", snackbarMessage);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'error' | 'info' | 'warning'
  const [csvUsers, setCsvUsers] = useState([]);
  const [departmentSubmitted, setDepartmentSubmitted] = useState(false);
  const [roleSubmitted, setRoleSubmitted] = useState(false);
  const [duplicateDeptError, setDuplicateDeptError] = useState(false);

  const [userOptions, setUserOptions] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [formKey, setFormKey] = useState(Date.now());
  const loadingUsers = useRef(false);

  const lastFieldRef = useRef(null);
  const dispatch = useDispatch();

  const adminEmail = sessionStorage.getItem("adminEmail"); // You must save this during login!
  const adminDomain = adminEmail?.split("@")[1]; // Extract domain

  useEffect(() => {
    // Reset Formik when the dialog is opened
    setFormKey(Date.now());
  }, [handleClose]); // You can track another prop if you have a better signal when dialog is opened

  const downloadExcelTemplate = () => {
    const headers = [
      "NAME",
      "EMAIL",
      "PHONE",
      "STORAGE",
      "ROLE",
      "DEPARTMENT",
      "REPORTINGMANAGER",
    ];

    const exampleRow = [
      "abc",
      "abc@costacloud.com",
      "1234567890",
      "10GB",
      "software engineer",
      "frontend",
      "dhruv sethi",
    ];

    const worksheetData = [headers, exampleRow];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Style: Bold the first row (headers)
    const headerStyle = {
      font: { bold: true },
    };

    headers.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = headerStyle;
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserTemplate");

    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "USER_TEMPLATE.csv");

    // ✅ Show success snackbar
    showSnackbar("Template downloaded successfully!", "success");
  };

  const loadMoreUsers = async () => {
    if (loadingUsers.current || !hasMoreUsers) return;
    loadingUsers.current = true;

    try {
      const res = await fetchUsers(userPage);
      const users = res?.content || []; // adjust based on your actual response structure

      if (users.length < 10) setHasMoreUsers(false);
      setUserOptions((prev) => [...prev, ...users]);
      setUserPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      loadingUsers.current = false;
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
    "2GB",
    "3GB",
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
  const [departmentPage, setDepartmentPage] = useState(0);
  const [hasMoreDepartments, setHasMoreDepartments] = useState(true);
  const loadingDepartments = useRef(false);

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
          .required("Email is required"),
        phone: yup
          .string()
          .required("Phone number is required")
          .matches(
            /^[1-9]\d{9}$/,
            "Phone number must be 10 digits and not start with 0"
          ),
      })
    ),
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBulkFile(file);
      setFileName(file.name);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toUpperCase(), // force match
        complete: (results) => {
          const headers = Object.keys(results.data[0] || {});
          console.log("📢 Parsed Headers:", headers);

          const requiredHeaders = [
            "NAME",
            "EMAIL",
            "PHONE",
            "STORAGE",
            "ROLE",
            "DEPARTMENT",
            "REPORTINGMANAGER",
          ];

          const hasAllHeaders = requiredHeaders.every((h) =>
            headers.includes(h)
          );

          if (!hasAllHeaders) {
            showSnackbar(
              "CSV headers are invalid. Please use the downloaded template.",
              "error"
            );
            return;
          }

          // continue parsing safely
          const cleanedUsers = results.data
            .filter((row) => row["EMAIL"])
            .map((row) => ({
              name: row["NAME"]?.trim() || "",
              // email: row["EMAIL"]?.trim() || "",
              email: row["EMAIL"]?.trim().toLowerCase() || "",
              phoneNumber: row["PHONE"]?.trim() || "",
              storage: row["STORAGE"]?.trim() || null,
              roleName: row["ROLE"]?.trim() || "",
              deptName: row["DEPARTMENT"]?.trim() || "",
              reportingManager: row["REPORTINGMANAGER"]?.trim() || "",
            }));
          console.log("CLEANED USERS:", cleanedUsers);

          setCsvUsers(cleanedUsers);
        },
        error: (err) => {
          console.error("CSV Parsing Error:", err);
          showSnackbar(
            "Failed to parse CSV. Please check the format.",
            "error"
          );
        },
      });
    }
  };

  const addRoleToDepartment = async (dept, { role, isAdmin }) => {
    const payload = {
      department: dept.deptName,
      role,
      isAdmin, // ✅ pass this to API
    };

    try {
      const response = await createRole(payload);
      return response;
    } catch (error) {
      console.error("Error adding role:", error);
      throw error;
    }
  };

  const loadMoreDepartments = async () => {
    if (loadingDepartments.current || !hasMoreDepartments) return;
    loadingDepartments.current = true;

    try {
      const res1 = await getDepartments(departmentPage, 10);
      const res = res1?.content || [];
      const newDepartments = res.map((dept) => ({
        ...dept,
        roles: (dept.roles || []).map((role) => role.roleName),
      }));

      if (newDepartments.length < 10) setHasMoreDepartments(false);
      setDepartments((prev) => [...prev, ...newDepartments]);
      setDepartmentPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      loadingDepartments.current = false;
    }
  };

  useEffect(() => {
    loadMoreDepartments();
  }, []);

  useEffect(() => {
    loadMoreUsers(); // Load first 10 users initially
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
            onClick={downloadExcelTemplate}
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
          {csvUsers.length > 0 && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "rgb(251, 68, 36)",
                color: "white",
                borderRadius: "8px",
              }}
              onClick={async () => {
                try {
                  const response = await createUsers(csvUsers);
                  const alreadyRegistered =
                    response?.["Users already registered"] || [];

                  const createdUsers = csvUsers.filter(
                    (u) => !alreadyRegistered.includes(u.email?.toLowerCase())
                  );
                  const ignoredUsers = csvUsers.filter((u) =>
                    alreadyRegistered.includes(u.email?.toLowerCase())
                  );

                  let closeAfter = 0;

                  if (createdUsers.length > 0) {
                    const createdNames = createdUsers
                      .map((u) => u.name)
                      .join(", ");
                    setBulkSuccessMessage(
                      `Users created successfully: ${createdNames}`
                    );
                    if (onUserCreated) onUserCreated();
                    closeAfter = Math.max(closeAfter, 4000); // match autoHideDuration
                  }

                  if (ignoredUsers.length > 0) {
                    const ignoredNames = ignoredUsers
                      .map((u) => u.name)
                      .join(", ");
                    setBulkWarningMessage(
                      `The following user(s) were ignored as their email already exists: ${ignoredNames}`
                    );
                    closeAfter = Math.max(closeAfter, 6000); // match autoHideDuration
                  }

                  setCsvUsers([]);
                  setFileName("");
                  setBulkFile(null);

                  // ⏳ Delay closing until snackbars are shown
                  if (closeAfter > 0) {
                    setTimeout(() => {
                      handleClose();
                    }, closeAfter);
                  } else {
                    handleClose(); // fallback
                  }
                } catch (err) {
                  console.error("Bulk user creation failed:", err);
                  showSnackbar("Failed to create bulk users", "error");
                }
              }}
            >
              Submit Bulk Users
            </Button>
          )}

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
          key={formKey} // 👈 This line forces Formik to re-initialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
            try {
              const transformedUsers = values.users.map((user) => ({
                name: user.name,
                email: user.email.toLowerCase(), // 👈 convert to lowercase
                deptName:
                  typeof user.department === "object"
                    ? user.department.deptName
                    : user.department,
                roleName:
                  typeof user.role === "object"
                    ? user.role.roleName
                    : user.role,
                phoneNumber: user.phone,
                storage: user.storage?.trim() ? user.storage : null,
                reportingManager: user.reportingManager,
              }));

              const response = await createUsers(transformedUsers);

              const alreadyRegistered =
                response?.["Users already registered"] || [];

              if (alreadyRegistered.length === 0) {
                if (onUserCreated) onUserCreated();
                if (showSnackbar)
                  showSnackbar("Users created successfully!", "success");
                handleClose();
              } else {
                // Field-level email error mapping
                values.users.forEach((user, index) => {
                  if (alreadyRegistered.includes(user.email)) {
                    actions.setFieldError(
                      `users[${index}].email`,
                      "Email already exists"
                    );
                  }
                });

                const emails = alreadyRegistered.join(", ");
                setSnackbarMessage(`Email(s) already exist: ${emails}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
              }
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
                                  label={
                                    <>
                                      Full Name
                                      <span style={{ color: "red" }}> *</span>
                                    </>
                                  }
                                  FormHelperTextProps={{ sx: { ml: 0 } }}
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
                                  label={
                                    <>
                                      Email
                                      <span style={{ color: "red" }}> *</span>
                                    </>
                                  }
                                  autoComplete="off"
                                  name={`users[${index}].email`}
                                  value={user.email?.split("@")[0] || ""}
                                  FormHelperTextProps={{ sx: { ml: 0 } }}
                                  onChange={(e) => {
                                    const emailPrefix = e.target.value
                                      .trim()
                                      .toLowerCase();
                                    const fullEmail = `${emailPrefix}@${adminDomain}`;

                                    formik.setFieldValue(
                                      `users[${index}].email`,
                                      fullEmail
                                    );

                                    const emailDomain = fullEmail.split("@")[1];
                                    if (emailDomain !== adminDomain) {
                                      formik.setFieldError(
                                        `users[${index}].email`,
                                        "Email domain must match admin domain"
                                      );
                                    } else {
                                      if (
                                        formik.errors.users?.[index]?.email ===
                                        "Email domain must match admin domain"
                                      ) {
                                        formik.setFieldError(
                                          `users[${index}].email`,
                                          undefined
                                        );
                                      }
                                    }
                                  }}
                                  error={Boolean(
                                    formik.touched.users?.[index]?.email &&
                                      formik.errors.users?.[index]?.email
                                  )}
                                  helperText={
                                    formik.touched.users?.[index]?.email &&
                                    formik.errors.users?.[index]?.email
                                  }
                                  fullWidth
                                  size="small"
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        @{adminDomain}
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label={
                                    <>
                                      Phone Number
                                      <span style={{ color: "red" }}> *</span>
                                    </>
                                  }
                                  name={`users[${index}].phone`}
                                  FormHelperTextProps={{ sx: { ml: 0 } }}
                                  value={user.phone || ""}
                                  onChange={(e) => {
                                    const value = e.target.value.trim();

                                    // Allow only digits
                                    if (/^\d*$/.test(value)) {
                                      formik.setFieldValue(
                                        `users[${index}].phone`,
                                        value
                                      );

                                      if (
                                        value.length > 0 &&
                                        value[0] === "0"
                                      ) {
                                        formik.setFieldError(
                                          `users[${index}].phone`,
                                          "Phone number should not start with 0"
                                        );
                                      } else if (
                                        value.length > 0 &&
                                        value.length !== 10
                                      ) {
                                        formik.setFieldError(
                                          `users[${index}].phone`,
                                          "Phone number must be exactly 10 digits"
                                        );
                                      } else {
                                        formik.setFieldError(
                                          `users[${index}].phone`,
                                          undefined
                                        );
                                      }
                                    }
                                  }}
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
                                  inputProps={{ maxLength: 10 }} // Optional: Prevents more than 10 digits
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
                                  ListboxProps={{
                                    style: { maxHeight: 300, overflow: "auto" },
                                    onScroll: (event) => {
                                      const listboxNode = event.currentTarget;
                                      const threshold = 50;
                                      if (
                                        listboxNode.scrollTop +
                                          listboxNode.clientHeight >=
                                        listboxNode.scrollHeight - threshold
                                      ) {
                                        loadMoreDepartments();
                                      }
                                    },
                                  }}
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
                              <Grid item xs={3}>
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
                              <Grid item xs={3}>
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
                              <strong>{user.name || "Unnamed User"}</strong> —{" "}
                              {user.email || "No Email"} |{" "}
                              <strong>{user.storage || "No Storage"}</strong> |{" "}
                              {typeof user.department === "object"
                                ? user.department?.deptName
                                : user.department || "No Department"}
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
              {/* <TextField
                fullWidth
                size="small"
                label="Department Name"
                FormHelperTextProps={{ sx: { ml: 0 } }}
                value={newDepartment.deptName}
                onChange={(e) => {
                  setNewDepartment({
                    ...newDepartment,
                    deptName: e.target.value,
                  });
                  setDuplicateDeptError(false); // 👈 Clear error on change
                }}
                error={
                  (departmentSubmitted && !newDepartment.deptName) ||
                  duplicateDeptError
                }
                helperText={
                  departmentSubmitted && !newDepartment.deptName
                    ? "Department Name is required"
                    : duplicateDeptError
                    ? "Department with this name already exists"
                    : ""
                }
              /> */}
              <TextField
                fullWidth
                size="small"
                label={
                  <>
                    Department Name<span style={{ color: "red" }}> *</span>
                  </>
                }
                FormHelperTextProps={{ sx: { ml: 0 } }}
                value={newDepartment.deptName}
                onChange={(e) => {
                  setNewDepartment({
                    ...newDepartment,
                    deptName: e.target.value,
                  });
                  setDuplicateDeptError(false); // 👈 Clear error on change
                }}
                error={
                  (departmentSubmitted && !newDepartment.deptName) ||
                  duplicateDeptError
                }
                helperText={
                  departmentSubmitted && !newDepartment.deptName
                    ? "Department Name is required"
                    : duplicateDeptError
                    ? "Department with this name already exists"
                    : ""
                }
              />
            </Grid>

            <Grid item xs={6}>
              <Autocomplete
                fullWidth
                size="small"
                FormHelperTextProps={{ sx: { ml: 0 } }}
                options={userOptions}
                getOptionLabel={(option) => option.email || ""}
                value={
                  userOptions.find(
                    (user) => user.name === newDepartment.deptModerator
                  ) || null
                }
                onChange={(event, value) =>
                  setNewDepartment({
                    ...newDepartment,
                    deptModerator: value ? value.email : "",
                  })
                }
                ListboxProps={{
                  style: { maxHeight: 300, overflow: "auto" },
                  onScroll: (event) => {
                    const listboxNode = event.currentTarget;
                    const threshold = 50;
                    if (
                      listboxNode.scrollTop + listboxNode.clientHeight >=
                      listboxNode.scrollHeight - threshold
                    ) {
                      loadMoreUsers();
                    }
                  },
                }}
                renderInput={(params) => (
                  // <TextField
                  //   {...params}
                  //   label="Department Moderator"
                  //   FormHelperTextProps={{ sx: { ml: 0 } }}
                  //   error={departmentSubmitted && !newDepartment.deptModerator}
                  //   helperText={
                  //     departmentSubmitted && !newDepartment.deptModerator
                  //       ? "Department Moderator is required"
                  //       : ""
                  //   }
                  // />
                  <TextField
                    {...params}
                    label={
                      <>
                        Department Moderator
                        <span style={{ color: "red" }}> *</span>
                      </>
                    }
                    FormHelperTextProps={{ sx: { ml: 0 } }}
                    error={departmentSubmitted && !newDepartment.deptModerator}
                    helperText={
                      departmentSubmitted && !newDepartment.deptModerator
                        ? "Department Moderator is required"
                        : ""
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Autocomplete
                multiple
                fullWidth
                size="small"
                options={userOptions}
                getOptionLabel={(option) => option.name || ""}
                value={
                  Array.isArray(newDepartment.selectedUsers)
                    ? userOptions.filter((user) =>
                        newDepartment.selectedUsers.includes(user.name)
                      )
                    : []
                }
                onChange={(event, selectedValues) =>
                  setNewDepartment({
                    ...newDepartment,
                    selectedUsers: selectedValues.map((user) => user.name),
                  })
                }
                ListboxProps={{
                  style: { maxHeight: 300, overflow: "auto" },
                  onScroll: (event) => {
                    const listboxNode = event.currentTarget;
                    const threshold = 50;
                    if (
                      listboxNode.scrollTop + listboxNode.clientHeight >=
                      listboxNode.scrollHeight - threshold
                    ) {
                      loadMoreUsers();
                    }
                  },
                }}
                renderInput={(params) => (
                  // <TextField
                  //   {...params}
                  //   label="Select Users"
                  //   placeholder="Choose multiple users"
                  //   error={
                  //     departmentSubmitted &&
                  //     (!newDepartment.selectedUsers ||
                  //       newDepartment.selectedUsers.length === 0)
                  //   }
                  //   helperText={
                  //     departmentSubmitted &&
                  //     (!newDepartment.selectedUsers ||
                  //       newDepartment.selectedUsers.length === 0)
                  //       ? "At least one user must be selected"
                  //       : ""
                  //   }
                  // />
                  <TextField
                    {...params}
                    label={
                      <>
                        Select Users<span style={{ color: "red" }}> *</span>
                      </>
                    }
                    placeholder="Choose multiple users"
                    error={
                      departmentSubmitted &&
                      (!newDepartment.selectedUsers ||
                        newDepartment.selectedUsers.length === 0)
                    }
                    helperText={
                      departmentSubmitted &&
                      (!newDepartment.selectedUsers ||
                        newDepartment.selectedUsers.length === 0)
                        ? "At least one user must be selected"
                        : ""
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              {/* <TextField
                fullWidth
                size="small"
                label="Short Name"
                FormHelperTextProps={{ sx: { ml: 0 } }}
                value={newDepartment.deptDisplayName}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    deptDisplayName: e.target.value,
                  })
                }
                error={departmentSubmitted && !newDepartment.deptDisplayName}
                helperText={
                  departmentSubmitted && !newDepartment.deptDisplayName
                    ? "Short Name is required"
                    : ""
                }
              /> */}
              <TextField
                fullWidth
                size="small"
                label={
                  <>
                    Short Name<span style={{ color: "red" }}> *</span>
                  </>
                }
                FormHelperTextProps={{ sx: { ml: 0 } }}
                value={newDepartment.deptDisplayName}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    deptDisplayName: e.target.value,
                  })
                }
                error={departmentSubmitted && !newDepartment.deptDisplayName}
                helperText={
                  departmentSubmitted && !newDepartment.deptDisplayName
                    ? "Short Name is required"
                    : ""
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
                  // <TextField
                  //   {...params}
                  //   label="Storage"
                  //   FormHelperTextProps={{ sx: { ml: 0 } }}
                  //   size="small"
                  //   error={departmentSubmitted && !newDepartment.storage}
                  //   helperText={
                  //     departmentSubmitted && !newDepartment.storage
                  //       ? "Storage is required"
                  //       : ""
                  //   }
                  // />
                  <TextField
                    {...params}
                    label={
                      <>
                        Storage<span style={{ color: "red" }}> *</span>
                      </>
                    }
                    FormHelperTextProps={{ sx: { ml: 0 } }}
                    size="small"
                    error={departmentSubmitted && !newDepartment.storage}
                    helperText={
                      departmentSubmitted && !newDepartment.storage
                        ? "Storage is required"
                        : ""
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
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
              setDepartmentSubmitted(true);

              const { deptName, deptModerator, deptDisplayName, storage } =
                newDepartment;

              // if (!deptName || !deptModerator || !deptDisplayName || !storage)
              //   return;
              if (
                !deptName ||
                !deptModerator ||
                !deptDisplayName ||
                !storage ||
                !Array.isArray(newDepartment.selectedUsers) ||
                newDepartment.selectedUsers.length === 0
              ) {
                setSnackbarMessage(
                  "Please fill all mandatory fields before creating department."
                );
                setSnackbarSeverity("warning");
                setSnackbarOpen(true);
                return;
              }

              try {
                if (
                  !newDepartment.deptName.trim() ||
                  !newDepartment.deptModerator.trim() ||
                  !newDepartment.deptDisplayName.trim() ||
                  !newDepartment.storage
                ) {
                  setSnackbarMessage(
                    "Please fill all mandatory fields before creating department."
                  );
                  setSnackbarSeverity("warning");
                  setSnackbarOpen(true);
                  return;
                }

                const payload = {
                  ...newDepartment,
                  role:
                    newDepartment.role.trim() === ""
                      ? null
                      : newDepartment.role,
                  selectedUsers: newDepartment.selectedUsers || [], // ✅ optional
                };
                console.log("pppppp", payload);
                const createdDept = await createDepartment(payload);

                console.log("Department created:", createdDept);
                setDepartments((prev) => [...prev, payload]);

                setSnackbarMessage("Department created successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                setNewDepartment({
                  deptName: "",
                  deptModerator: "",
                  deptDisplayName: "",
                  storage: "",
                  role: "",
                });
                setAddDepartment(false);
              } catch (error) {
                setSnackbarMessage(
                  "Failed to create department(Department with this name already Exist). Please try another."
                );
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setDuplicateDeptError(true); // 👈 Trigger field-level error
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                label="Role Name"
                FormHelperTextProps={{ sx: { ml: 0 } }}
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                error={roleSubmitted && !newRoleName.trim()}
                helperText={
                  roleSubmitted && !newRoleName.trim()
                    ? "Role Name is required"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl>
                {/* <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={isAdminRole}
                    onChange={(e) => setIsAdminRole(e.target.checked)}
                  />
                  Admin Role
                </label> */}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={async () => {
              setRoleSubmitted(true);

              if (!newRoleName.trim()) return;

              try {
                const addedRole = await addRoleToDepartment(
                  selectedDepartmentForRole,
                  {
                    role: newRoleName.trim(),
                    isAdmin: isAdminRole, // ✅ boolean flag from checkbox
                  }
                );

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

                setSnackbarMessage("Role added successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                setNewRoleName("");
                setAddRole(false);
                setRoleSubmitted(false);
                setIsAdminRole(false); // ✅ reset checkbox
              } catch (error) {
                console.error("Add role error:", error);
                setSnackbarMessage(
                  "Failed to add role. Role might already exist or there was a server error."
                );
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
              }
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
        open={Boolean(bulkSuccessMessage)}
        autoHideDuration={4000}
        onClose={() => setBulkSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 8 }} // Push it up
      >
        <MuiAlert
          onClose={() => setBulkSuccessMessage("")}
          severity="success"
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {bulkSuccessMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={Boolean(bulkWarningMessage)}
        autoHideDuration={6000}
        onClose={() => setBulkWarningMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setBulkWarningMessage("")}
          severity="warning"
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {bulkWarningMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default CreateUser;

