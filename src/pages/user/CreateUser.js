import {
  Add,
  Close,
  Download,
  Info,
  UploadFile,
  CheckBox,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import Papa from "papaparse";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox, // Added Checkbox
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  // FormControl,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
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
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const emptyUser = {
  name: "",
  email: "",
  storage: "0GB",
  role: "",
  department: "",
  reportingManager: "",
  // sections: [], // COMMENTED OUT
};

const CreateUser = ({
  open,
  handleClose,
  onUserCreated,
  showSnackbar,
  allUsers = [],
}) => {
  const fileInputRef = useRef(null);
  const [formInitialValues, setFormInitialValues] = useState({
    users: [emptyUser],
  });
  const formikRef = useRef(null); // NEW: Ref to access formik outside render props
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState("");
  const [bulkWarningMessage, setBulkWarningMessage] = useState("");
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [regions, setRegions] = useState([]);
  // const [sections, setSections] = useState([]); // COMMENTED OUT - Added sections state
  const [defaultRegion, setDefaultRegion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const [bulkFile, setBulkFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [addDepartment, setAddDepartment] = useState(false);
  const [addRole, setAddRole] = useState(false);
  const [selectedDepartmentForRole, setSelectedDepartmentForRole] =
    useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newAppRole, setNewAppRole] = useState(""); // NEW: App Role for role creation
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [activeUserIndexForRole, setActiveUserIndexForRole] = useState(null); // NEW: Track which user added a role
  const [locallyCreatedRoles, setLocallyCreatedRoles] = useState({}); // NEW: Track roles created locally per department
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

  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [debouncedUnitSearch, setDebouncedUnitSearch] = useState("");
  const [isSearchingUnits, setIsSearchingUnits] = useState(false);

  // Role field states (shared across all user rows as only one dropdown opens at a time)
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolePage, setRolePage] = useState(1);
  const [roleHasMore, setRoleHasMore] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [debouncedRoleSearch, setDebouncedRoleSearch] = useState("");
  const [activeDeptForRoles, setActiveDeptForRoles] = useState("");

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
      "STORAGE",
      "ROLE",
      "UNIT",
      "REPORTINGMANAGER",
      "COMMAND",
    ];

    const exampleRow = [
      "abc",
      "abc@costacloud.com",
      "10GB",
      "software engineer",
      "frontend",
      "dhruv sethi",
      "Delhi",
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

    //  Show success snackbar
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
    "0 GB",
    "25 GB",
    "50 GB",
    "75 GB",
    "100 GB",
    "150 GB",
    "200 GB",
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
        storage: "0GB",
        role: "",
        department: "",
        reportingManager: "",
        region: defaultRegion || "",
        // sections: [], // COMMENTED OUT
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

        department: yup.mixed().required("Unit is required"),

        role: yup.mixed().required("Role is required"),

        region: yup.string().required("Command is required"),

        // COMMENTED OUT: sections validation
        // sections: yup
        //   .array()
        //   .min(1, "Select at least one section")
        //   .required("Section is required"),
      }),
    ),
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setBulkFile(file);
    setFileName(file.name);

    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileExt === "csv") {
      //  CSV parsing
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toUpperCase(),
        complete: (results) => processParsedData(results.data),
        error: (err) => {
          console.error("CSV Parsing Error:", err);
          showSnackbar(
            "Failed to parse CSV. Please check the format.",
            "error",
          );
        },
      });
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      //  Excel parsing
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
        processParsedData(jsonData);
      };
      reader.onerror = (err) => {
        console.error("Excel Reading Error:", err);
        showSnackbar("Failed to read Excel file.", "error");
      };
      reader.readAsArrayBuffer(file);
    } else {
      showSnackbar(
        "Invalid file type. Please upload CSV or Excel (.xlsx)",
        "error",
      );
    }
  };

  //  Shared data processing
  const processParsedData = (data) => {
    const headers = Object.keys(data[0] || {}).map((h) =>
      h.trim().toUpperCase(),
    );

    const requiredHeaders = [
      "NAME",
      "EMAIL",
      "STORAGE",
      "ROLE",
      "UNIT",
      "REPORTINGMANAGER",
      "COMMAND",
    ];

    const hasAllHeaders = requiredHeaders.every((h) => headers.includes(h));
    if (!hasAllHeaders) {
      showSnackbar("Headers are invalid. Please use the template.", "error");
      return;
    }

    const cleanedUsers = [];
    const invalidUsers = [];

    data
      .filter((row) => row["EMAIL"])
      .forEach((row) => {
        const name = (row["NAME"] || "Unknown User").trim();

        cleanedUsers.push({
          name,
          email: (row["EMAIL"] || "").trim().toLowerCase(),
          storage: row["STORAGE"]?.trim() || null,
          roleName: row["ROLE"]?.trim() || "",
          deptName: row["UNIT"]?.trim() || "",
          reportingManager: row["REPORTINGMANAGER"]?.trim() || "",
          region: row["COMMAND"]?.trim() || defaultRegion,
        });
      });

    setCsvUsers(cleanedUsers);
  };

  // COMMENTED OUT: did not include appRole in payload
  // const addRoleToDepartment = async (dept, { role, isAdmin }) => {
  //   const payload = {
  //     department: dept.deptName,
  //     role,
  //     isAdmin,
  //   };
  const addRoleToDepartment = async (dept, { role, isAdmin, appRole }) => {
    const payload = {
      department: dept.deptName,
      role,
      isAdmin,
      appRole, // NEW: pass appRole to API
    };

    try {
      const response = await createRole(payload);
      return response;
    } catch (error) {
      console.error("Error adding role:", error);
      throw error;
    }
  };

  const loadMoreDepartments = async (page, query = "", isInitial = false) => {
    if (loadingDepartments.current || (!hasMoreDepartments && !isInitial)) return;
    loadingDepartments.current = true;

    try {
      const res1 = await getDepartments(
        page,
        10,
        query ? "deptName" : "",
        query,
      );
      const res = res1?.content || [];
      const newDepartments = res.map((dept) => ({
        ...dept,
        roles: dept.roles?.roles || [],
      }));

      if (isInitial) {
        setDepartments(newDepartments);
        setDepartmentPage(page);
        setHasMoreDepartments(!res1.last);
      } else {
        setHasMoreDepartments(!res1.last);
        setDepartments((prev) => [...prev, ...newDepartments]);
        setDepartmentPage(page);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      loadingDepartments.current = false;
      setIsSearchingUnits(false);
    }
  };

  const loadMoreRoles = async (page, query = "", deptName = "", isInitial = false) => {
    if (!deptName || roleLoading || (!roleHasMore && !isInitial)) return;
    setRoleLoading(true);
    try {
      const res = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/${deptName}/roles`,
        {
          params: {
            page,
            size: 10,
            search: query || undefined,
          },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );
      const fetchedRoles = res.data?.roles || [];
      const localRoles = locallyCreatedRoles[deptName] || [];

      // Helper to normalize roles
      const normalize = (r) => (typeof r === "string" ? { roleName: r } : r);

      if (isInitial) {
        // Prepend local roles to the initial fetch results
        const combined = [
          ...localRoles,
          ...fetchedRoles.filter((f) => !localRoles.some((l) => l.roleName === f.roleName)),
        ];
        setRoleOptions(combined);
        setRolePage(page);
      } else {
        setRoleOptions((prev) => {
          const newList = [...prev, ...fetchedRoles];
          // Deduplicate based on roleName
          const uniqueNames = new Set();
          return newList
            .map((r) => normalize(r))
            .filter((r) => {
              if (uniqueNames.has(r.roleName)) return false;
              uniqueNames.add(r.roleName);
              return true;
            });
        });
        setRolePage(page);
      }
      setRoleHasMore(!res.data?.last);
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUnitSearch(unitSearchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [unitSearchQuery]);

  useEffect(() => {
    if (debouncedUnitSearch !== undefined && open) {
      setIsSearchingUnits(true);
      loadMoreDepartments(0, debouncedUnitSearch, true); // Search/Initial always page 0
    }
  }, [debouncedUnitSearch, open]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRoleSearch(roleSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [roleSearchQuery]);

  useEffect(() => {
    if (debouncedRoleSearch !== undefined && open && activeDeptForRoles) {
      loadMoreRoles(1, debouncedRoleSearch, activeDeptForRoles, true); // Search/Initial always page 1
    }
  }, [debouncedRoleSearch, open, activeDeptForRoles]);

  // Reset department list when dialog opens
  useEffect(() => {
    if (open) {
      setDepartments([]);
      setDepartmentPage(0);
      setHasMoreDepartments(true);
      loadMoreDepartments(0, "", true);
    }
  }, [open]);

  // No longer needed here as the search effect handles initial load
  // useEffect(() => {
  //   loadMoreDepartments();
  // }, []);

  useEffect(() => {
    loadMoreUsers(); // Load first 10 users initially
  }, []);

  useEffect(() => { }, [departments]);

  useEffect(() => {
    if (open) {
      setFormKey(Date.now()); // =H Force reinit Formik
      setExpandedIndex(0); // =H Expand first user
      setCsvUsers([]); // =H Clear uploaded CSV
      setFileName("");
      setBulkFile(null);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const fetchRegions = async () => {
        try {
          const response = await axios.get(
            `${window.__ENV__.REACT_APP_ROUTE}/tenants/getRegion`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                "Content-Type": "application/json",
                username: sessionStorage.getItem("adminEmail"), // same as your other APIs
              },
            },
          );
          setRegions(response.data.regions || []);
          setDefaultRegion(response.data.defaultRegion || "");
          setSelectedRegion(response.data.defaultRegion || "");
        } catch (err) {
          console.error("Failed to fetch regions:", err);
        }
      };

      // COMMENTED OUT: fetchSections
      // const fetchSections = async () => {
      //   try {
      //     const response = await axios.get(
      //       `${window.__ENV__.REACT_APP_ROUTE}/tenants/section/getAll`,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      //           "Content-Type": "application/json",
      //           username: sessionStorage.getItem("adminEmail"),
      //         },
      //       }
      //     );
      //     // API returns { sections: [...] }
      //     setSections(response.data.sections || []);
      //   } catch (err) {
      //     console.error("Failed to fetch sections:", err);
      //   }
      // };

      fetchRegions();
      // fetchSections(); // COMMENTED OUT
    }
  }, [open]);

  return (
    <>
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
                    (u) => !alreadyRegistered.includes(u.email?.toLowerCase()),
                  );
                  const ignoredUsers = csvUsers.filter((u) =>
                    alreadyRegistered.includes(u.email?.toLowerCase()),
                  );

                  let closeAfter = 0;

                  if (createdUsers.length > 0) {
                    const createdNames = createdUsers
                      .map((u) => u.name)
                      .join(", ");
                    setBulkSuccessMessage(
                      `Users created successfully: ${createdNames}`,
                    );
                    if (onUserCreated) onUserCreated();
                    closeAfter = Math.max(closeAfter, 4000); // match autoHideDuration
                  }

                  if (ignoredUsers.length > 0) {
                    const ignoredNames = ignoredUsers
                      .map((u) => u.name)
                      .join(", ");
                    setBulkWarningMessage(
                      `The following user(s) were ignored as their email already exists: ${ignoredNames}`,
                    );
                    closeAfter = Math.max(closeAfter, 6000); // match autoHideDuration
                  }

                  setCsvUsers([]);
                  setFileName("");
                  setBulkFile(null);

                  // � Delay closing until snackbars are shown
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
            accept=".csv"
            ref={fileInputRef} //  attach ref
            onChange={handleFileChange}
          />

          {fileName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <Typography variant="body2">Selected File: {fileName}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setFileName("");
                  setBulkFile(null);
                  setCsvUsers([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; //  reset file input
                  }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          )}
        </div>
        <Formik
          innerRef={formikRef} //  attach ref
          key={formKey} // =H This line forces Formik to re-initialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
            try {
              //  Validate form with all fields
              await validationSchema.validate(values, { abortEarly: false });

              //  Transform data for backend
              const transformedUsers = values.users.map((user) => ({
                name: user.name,
                email: user.email.toLowerCase(),
                deptName:
                  typeof user.department === "object"
                    ? user.department.deptName
                    : user.department,
                roleName:
                  typeof user.role === "object"
                    ? user.role.roleName
                    : user.role,
                deptId: user.department?.deptId || user.department?.id || null,
                roleId: user.role?.roleId || user.role?.id || null,
                storage: user.storage?.trim() ? user.storage : null,
                reportingManager: user.reportingManager,
                region: user.region, //  include region from validated values
                // sections: user.sections || [], // COMMENTED OUT
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
                values.users.forEach((user, index) => {
                  if (alreadyRegistered.includes(user.email)) {
                    actions.setFieldError(
                      `users[${index}].email`,
                      "Email already exists",
                    );
                    setExpandedIndex(index); // =H Expand duplicate email user
                  }
                });

                const emails = alreadyRegistered.join(", ");
                setSnackbarMessage(`Email(s) already exist: ${emails}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
              }
            } catch (error) {
              if (error.name === "ValidationError" && error.inner) {
                const firstError = error.inner.find((e) =>
                  e.path?.startsWith("users["),
                );

                if (firstError) {
                  const match = firstError.path.match(/^users\[(\d+)\]/);
                  if (match) {
                    setExpandedIndex(Number(match[1])); //  Expand first invalid form
                  }
                }

                //  Show individual field errors
                error.inner.forEach((err) => {
                  actions.setFieldError(err.path, err.message);
                });

                setSnackbarMessage("Please fix the highlighted errors.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
              } else {
                // � Fallback for non-validation errors
                setSnackbarMessage("Failed to create users. Please try again.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                console.error("Failed to create users", error);
              }
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
                      const userErrors = formik.errors.users?.[index] || {};
                      const userTouched = formik.touched.users?.[index] || {};
                      const hasErrors = Object.keys(userErrors).some(
                        (field) => userTouched[field] && userErrors[field],
                      );

                      const selectedDeptName =
                        typeof user.department === "string"
                          ? user.department
                          : user.department?.deptName;

                      const selectedDept = departments.find(
                        (dept) => dept.deptName === selectedDeptName,
                      );

                      const roleOptions = selectedDept?.roles || [];

                      const isExpanded = index === expandedIndex;

                      return (
                        <Paper
                          key={index}
                          // ref={isExpanded ? lastFieldRef : null}
                          ref={index === expandedIndex ? lastFieldRef : null}
                          elevation={3}
                          sx={{
                            padding: isExpanded ? 2 : 1,
                            mb: 2,
                            bgcolor: isExpanded
                              ? "background.paper"
                              : hasErrors
                                ? "#fdecea" // light red background if error
                                : "grey.100",
                            border: hasErrors ? "1px solid #f44336" : "none",
                            borderRadius: "20px",
                            cursor: "pointer",
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
                                    formik.errors.users?.[index]?.name,
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
                                      fullEmail,
                                    );

                                    const emailDomain = fullEmail.split("@")[1];
                                    if (emailDomain !== adminDomain) {
                                      formik.setFieldError(
                                        `users[${index}].email`,
                                        "Email domain must match admin domain",
                                      );
                                    } else {
                                      if (
                                        formik.errors.users?.[index]?.email ===
                                        "Email domain must match admin domain"
                                      ) {
                                        formik.setFieldError(
                                          `users[${index}].email`,
                                          undefined,
                                        );
                                      }
                                    }
                                  }}
                                  error={Boolean(
                                    formik.touched.users?.[index]?.email &&
                                    formik.errors.users?.[index]?.email,
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

                              <Grid item xs={3}>
                                <Autocomplete
                                  options={storageOptions}
                                  value={user.storage || ""}
                                  onChange={(e, value) =>
                                    formik.setFieldValue(
                                      `users[${index}].storage`,
                                      value,
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
                                <TextField
                                  select
                                  label={
                                    <>
                                      Command{" "}
                                      <span style={{ color: "red" }}> *</span>
                                    </>
                                  }
                                  name={`users[${index}].region`}
                                  value={user.region || defaultRegion}
                                  onChange={formik.handleChange}
                                  fullWidth
                                  size="small"
                                  FormHelperTextProps={{ sx: { ml: 0 } }}
                                  error={Boolean(
                                    formik.touched.users?.[index]?.region &&
                                    formik.errors.users?.[index]?.region,
                                  )}
                                  helperText={
                                    formik.touched.users?.[index]?.region &&
                                    formik.errors.users?.[index]?.region
                                  }
                                >
                                  {regions.map((region) => (
                                    <MenuItem key={region} value={region}>
                                      {region}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid item xs={3}>
                                <Autocomplete
                                  options={departments}
                                  getOptionLabel={(option) =>
                                    option.deptName || ""
                                  }
                                  filterOptions={(x) => x}
                                  onInputChange={(event, newInputValue) => {
                                    setUnitSearchQuery(newInputValue);
                                  }}
                                  loading={isSearchingUnits}
                                  ListboxProps={{
                                    style: { maxHeight: 300, overflow: "auto" },
                                    onScroll: (event) => {
                                      const listboxNode = event.currentTarget;
                                      const threshold = 50;
                                      if (
                                        Math.round(listboxNode.scrollTop +
                                          listboxNode.clientHeight) >=
                                        listboxNode.scrollHeight - threshold &&
                                        hasMoreDepartments &&
                                        !loadingDepartments.current
                                      ) {
                                        loadMoreDepartments(
                                          departmentPage + 1,
                                          unitSearchQuery,
                                          false
                                        );
                                      }
                                    },
                                  }}
                                  renderOption={(props, option) => (
                                    <li
                                      {...props}
                                      style={{ padding: "10px 16px" }}
                                    >
                                      {option.deptName}
                                    </li>
                                  )}
                                  value={user.department || ""}
                                  onChange={(e, value) => {
                                    formik.setFieldValue(
                                      `users[${index}].department`,
                                      value,
                                    );
                                    formik.setFieldValue(
                                      `users[${index}].role`,
                                      "",
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={
                                        <>
                                          Unit
                                          <span style={{ color: "red" }}>
                                            {" "}
                                            *
                                          </span>
                                        </>
                                      }
                                      fullWidth
                                      size="small"
                                      autoComplete="off"
                                      InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                          <React.Fragment>
                                            {isSearchingUnits ? (
                                              <CircularProgress
                                                color="inherit"
                                                size={20}
                                              />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                          </React.Fragment>
                                        ),
                                      }}
                                      error={Boolean(
                                        formik.touched.users?.[index]
                                          ?.department &&
                                        formik.errors.users?.[index]
                                          ?.department,
                                      )}
                                      helperText={
                                        formik.touched.users?.[index]
                                          ?.department &&
                                        formik.errors.users?.[index]
                                          ?.department
                                      }
                                    />
                                  )}
                                />
                              </Grid>

                              {/* COMMENTED OUT: Sections dropdown field
                              <Grid item xs={3}>
                                <Autocomplete
                                  multiple
                                  options={sections}
                                  disableCloseOnSelect
                                  getOptionLabel={(option) => option}
                                  value={user.sections || []}
                                  onChange={(e, value) =>
                                    formik.setFieldValue(
                                      `users[${index}].sections`,
                                      value
                                    )
                                  }
                                  renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                      <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                      />
                                      {option}
                                    </li>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={
                                        <>
                                          Sections
                                          <span style={{ color: "red" }}> *</span>
                                        </>
                                      }
                                      placeholder="Select Sections"
                                      fullWidth
                                      size="small"
                                      error={Boolean(
                                        formik.touched.users?.[index]
                                          ?.sections &&
                                        formik.errors.users?.[index]?.sections
                                      )}
                                      helperText={
                                        formik.touched.users?.[index]
                                          ?.sections &&
                                        formik.errors.users?.[index]?.sections
                                      }
                                    />
                                  )}
                                />
                              </Grid>
                              */}

                              <Grid item xs={3}>
                                <Tooltip
                                  title={
                                    !user.department
                                      ? "Please select a unit first"
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
                                      loading={roleLoading}
                                      filterOptions={(x) => x}
                                      onOpen={() => {
                                        const deptName = typeof user.department === "string" ? user.department : user.department?.deptName;
                                        if (deptName) {
                                          setActiveDeptForRoles(deptName);
                                          setRoleOptions([]);
                                          setRolePage(1);
                                          setRoleHasMore(true);
                                          setRoleSearchQuery("");
                                          loadMoreRoles(1, "", deptName, true);
                                        }
                                      }}
                                      onInputChange={(event, newInputValue) => {
                                        setRoleSearchQuery(newInputValue);
                                      }}
                                      getOptionLabel={(option) => {
                                        if (typeof option === "string") return option;
                                        if (option.isAddOption) return "Add New Role";
                                        return option.roleName || "";
                                      }}
                                      ListboxProps={{
                                        style: { maxHeight: 300, overflow: "auto" },
                                        onScroll: (event) => {
                                          const listboxNode = event.currentTarget;
                                          const threshold = 50;
                                          const deptName = typeof user.department === "string" ? user.department : user.department?.deptName;
                                          if (
                                            Math.round(listboxNode.scrollTop +
                                              listboxNode.clientHeight) >=
                                            listboxNode.scrollHeight - threshold &&
                                            roleHasMore &&
                                            !roleLoading &&
                                            deptName
                                          ) {
                                            loadMoreRoles(
                                              rolePage + 1,
                                              roleSearchQuery,
                                              deptName,
                                              false
                                            );
                                          }
                                        },
                                      }}
                                      renderOption={(props, option) => (
                                        <li
                                          {...props}
                                          style={{
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
                                            ? "� Add New Role"
                                            : option.roleName || (typeof option === "string" ? option : "")}
                                        </li>
                                      )}
                                      value={user.role || ""}
                                      onChange={(e, value) => {
                                        if (value?.isAddOption) {
                                          setSelectedDepartmentForRole(user.department);
                                          setActiveUserIndexForRole(index);
                                          setAddRole(true);
                                          return;
                                        }
                                        formik.setFieldValue(`users[${index}].role`, value);
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label={
                                            <>
                                              Role
                                              <span style={{ color: "red" }}>
                                                {" "}
                                                *
                                              </span>
                                            </>
                                          }
                                          fullWidth
                                          size="small"
                                          autoComplete="off"
                                          error={Boolean(
                                            formik.touched.users?.[index]
                                              ?.role &&
                                            formik.errors.users?.[index]?.role,
                                          )}
                                          helperText={
                                            formik.touched.users?.[index]
                                              ?.role &&
                                            formik.errors.users?.[index]?.role
                                          }
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
                              <strong>{user.name || "Unnamed User"}</strong> {" "}
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
                            storage: "0GB",
                            role: "",
                            department: "",
                            reportingManager: "",
                            region: defaultRegion,
                            // sections: [], // COMMENTED OUT
                          });
                        }}
                      >
                        Add More
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
            ADD NEW UNIT
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

        <DialogContent dividers padding="0 !important">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label={
                  <>
                    Unit Name<span style={{ color: "red" }}> *</span>
                  </>
                }
                FormHelperTextProps={{ sx: { ml: 0 } }}
                value={newDepartment.deptName}
                onChange={(e) => {
                  setNewDepartment({
                    ...newDepartment,
                    deptName: e.target.value,
                  });
                  setDuplicateDeptError(false); // =H Clear error on change
                }}
                error={
                  (departmentSubmitted && !newDepartment.deptName) ||
                  /\s/.test(newDepartment.deptName) || // L check for whitespace
                  duplicateDeptError
                }
                helperText={
                  departmentSubmitted && !newDepartment.deptName
                    ? "Unit Name is required"
                    : /\s/.test(newDepartment.deptName)
                      ? "Spaces are not allowed in Unit Name"
                      : duplicateDeptError
                        ? "Unit with this name already exists"
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
                    (user) => user.email === newDepartment.deptModerator,
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
                  <TextField
                    {...params}
                    label={
                      <>
                        Unit Moderator
                        <span style={{ color: "red" }}> *</span>
                      </>
                    }
                    FormHelperTextProps={{ sx: { ml: 0 } }}
                    error={departmentSubmitted && !newDepartment.deptModerator}
                    helperText={
                      departmentSubmitted && !newDepartment.deptModerator
                        ? "Unit Moderator is required"
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
                      newDepartment.selectedUsers.includes(user.name),
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

              if (
                !deptName ||
                !deptModerator ||
                !deptDisplayName ||
                !storage ||
                !Array.isArray(newDepartment.selectedUsers) ||
                newDepartment.selectedUsers.length === 0
              ) {
                setSnackbarMessage(
                  "Please fill all mandatory fields before creating department.",
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
                    "Please fill all mandatory fields before creating department.",
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
                  selectedUsers: newDepartment.selectedUsers || [], //  optional
                };

                const createdDept = await createDepartment(payload);

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
                  "Failed to create department(Department with this name already Exist). Please try another.",
                );
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setDuplicateDeptError(true); // =H Trigger field-level error
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
        onClose={() => {
          setAddRole(false);
          setNewRoleName("");
          setNewAppRole("");
          setRoleSubmitted(false);
        }}
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
        {/* COMMENTED OUT: old layout had Role Name (xs=8) + empty FormControl (xs=4) with no App Role field
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
              <FormControl></FormControl>
            </Grid>
          </Grid>
        </DialogContent> */}

        {/* NEW: Role Name + App Role Select (matching Department page style) */}
        <DialogContent dividers padding="0 !important">
          <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="app-role-label">App Role</InputLabel>
                <Select
                  labelId="app-role-label"
                  value={newAppRole}
                  label="App Role"
                  onChange={(e) => setNewAppRole(e.target.value)}
                >
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="VIEWER">VIEWER</MenuItem>
                  <MenuItem value="EDITOR">EDITOR</MenuItem>
                  <MenuItem value="COMMENTOR">COMMENTOR</MenuItem>
                  <MenuItem value="CONTRIBUTOR">CONTRIBUTOR</MenuItem>
                  <MenuItem value="NO_ROLE">NO_ROLE</MenuItem>
                </Select>
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
                    isAdmin: isAdminRole,
                    appRole: newAppRole, // NEW: pass selected App Role
                  },
                );

                setDepartments((prevDepartments) =>
                  prevDepartments.map((dept) =>
                    dept.deptName === selectedDepartmentForRole.deptName
                      ? {
                        ...dept,
                        roles: [...(dept.roles || []), addedRole[0]],
                      }
                      : dept,
                  ),
                );

                const normalizedRole = typeof addedRole[0] === "string" ? { roleName: addedRole[0] } : addedRole[0];

                // NEW: Prepend to roleOptions and auto-select for the triggering user
                setRoleOptions((prev) => [normalizedRole, ...(prev || [])]);
                if (activeUserIndexForRole !== null && formikRef.current) {
                  formikRef.current.setFieldValue(
                    `users[${activeUserIndexForRole}].role`,
                    normalizedRole,
                  );
                }

                // NEW: Persist to locallyCreatedRoles to survive dropdown refreshes
                setLocallyCreatedRoles((prev) => ({
                  ...prev,
                  [selectedDepartmentForRole.deptName]: [
                    normalizedRole,
                    ...(prev[selectedDepartmentForRole.deptName] || []),
                  ],
                }));

                setSnackbarMessage("Role added successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);

                setNewRoleName("");
                setNewAppRole(""); // NEW: reset App Role
                setAddRole(false);
                setRoleSubmitted(false);
                setIsAdminRole(false);
                setActiveUserIndexForRole(null); // NEW: reset triggering index
              } catch (error) {
                console.error("Add role error:", error);
                setSnackbarMessage(
                  "Failed to add role. Role might already exist or there was a server error.",
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
