import React, { useState, useRef, useEffect, useMemo } from "react";
import Close from "@mui/icons-material/Close";
import { saveAs } from "file-saver";
import axios from "axios";
import { Portal } from "@mui/material";

import PropTypes from "prop-types";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

import {
  Box,
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  TableSortLabel,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import { FormHelperText } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Fab } from "@mui/material";

import { Autocomplete } from "@mui/material";
import { Card, CardContent } from "@mui/material";
import { CircularProgress, keyframes } from "@mui/material";
// COMMENTED OUT: searchDepartments no longer used — getDepartments handles search params
// import { getDepartments, searchDepartments } from "../api/departmentService";
import { getDepartments } from "../api/departmentService";
import { createDepartment } from "../api/departmentService";
import { createRole } from "../api/departmentService";

import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FolderIcon from "@mui/icons-material/Folder";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import * as XLSX from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Switch from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BusinessIcon from "@mui/icons-material/Business";
// or
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  People as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  Work as DepartmentRolesIcon,
  Timeline as TimelineIcon,
  ManageAccounts as LDAPIcon,
  Dashboard as DashboardIcon,
  Add,
} from "@mui/icons-material";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Drawer from "@mui/material/Drawer";
import { OutlinedInput } from "@mui/material";

import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { ManageAccounts as ManageAccountsIcon } from "@mui/icons-material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { deleteRole } from "../api/departmentService";

// Add this import with other imports
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Checkbox } from "@mui/material";
import styles from "./department.module.css";
import { fetchUsers } from "../api/userService";
import { fetchUsersByDepartment } from "../api/userService";
import { updateDepartment } from "../api/departmentService";
import { deleteDepartment } from "../api/departmentService";
import { updateDepartmentStorage } from "../api/departmentService";
import { toggleUserStatusByUsername } from "../api/userService";
import { updateDepartmentStoragePermission } from "../api/departmentService";
import { Chip, Grid } from "@mui/material";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

// Fade-in animation
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled overlay
const LoaderWrapper = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1300,
  animation: `${fadeIn} 0.5s ease-in-out`,
}));

// Styled CircularProgress
const CustomSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: "60px !important",
  height: "80px !important",
  thickness: 2,
}));

const allColumns = [
  { id: "name", label: "Unit" },
  { id: "displayName", label: "Display Name" },
  { id: "owner", label: "Owner" },
  { id: "storage", label: "Storage" },
  // { id: "storage", label: "Manage Storage" },
  { id: "manageStorage", label: "Manage Storage" }, // ✅ unique id
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles" },
  { id: "actions", label: "Actions" },
];

function Department({ departments, setDepartments, onThemeToggle }) {
  const deptAdmin = sessionStorage.getItem("deptAdmin") === "true";
  const superAdmin = sessionStorage.getItem("superAdmin") === "true";

  const [openPopper, setOpenPopper] = useState(false);
  const [selectedDeptUsers, setSelectedDeptUsers] = useState([]);
  const anchorRef = useRef(null);
  const isFirstRender = useRef(true);
  const isFetchingDepts = useRef(false);
  const isFetchingMoreUsers = useRef(false);
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => {
      acc[col.id] = true; // all visible by default
      return acc;
    }, {}),
  );
  const [anchorEl, setAnchorEl] = useState(null);
  // const [selectedDeptUsers, setSelectedDeptUsers] = useState([]);
  const [duplicateShortNameError, setDuplicateShortNameError] = useState(false);

  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [addUserAssignments, setAddUserAssignments] = useState([
    { user: null, role: "" },
  ]);

  const [searchModerator, setSearchModerator] = useState("");
  const [debouncedSearchModerator, setDebouncedSearchModerator] = useState("");

  const [searchUser, setSearchUser] = useState("");

  const [searchColumn, setSearchColumn] = useState("deptname"); // API column name (deptname/owner/shortname)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);

  const [allDepartments, setAllDepartments] = useState([]);
  const [migrationPage, setMigrationPage] = useState(0);
  const [hasMoreDepartments, setHasMoreDepartments] = useState(true);

  const [targetDepartment, setTargetDepartment] = useState("");

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredPage, setFilteredPage] = useState(0);
  const [hasMoreFilteredUsers, setHasMoreFilteredUsers] = useState(true);
  const [isSearchingFilteredUsers, setIsSearchingFilteredUsers] =
    useState(false);

  const [userOptions, setUserOptions] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [debouncedUserSearchQuery, setDebouncedUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  // const anchorRef = useRef(null);

  const [isAdminRole, setIsAdminRole] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 25 rows

  const [openRows, setOpenRows] = useState({});

  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [totalDepartments, setTotalDepartments] = useState(0);

  // Add after other state declarations
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add these states after other state declarations
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    displayName: "",
    initialRole: "UNIT_ADMIN",
    storage: "1 GB", //  default
    departmentModerator: "",
    userAssignments: [{ user: null, role: "UNIT_ADMIN" }], // 👈 start with one empty row
    submitted: false,
  });

  const [newDepartments, setNewDepartments] = useState([
    {
      name: "",
      displayName: "",
      storage: "1 GB",
      departmentModerator: "",
      role: "UNIT_ADMIN", // ✅ fixed default
      permission: "ADMIN", // ✅ standardized
      submitted: false,
    },
  ]);

  const [expandedIndices, setExpandedIndices] = useState([0]);

  // Add after other state declarations
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Add after other state declarations
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [editedDepartment, setEditedDepartment] = useState(null);

  const [expandedRows, setExpandedRows] = useState({});
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [departmentToMigrate, setDepartmentToMigrate] = useState(null);

  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState({
    departmentIndex: null,
    roleIndex: null,
    value: "",
  });

  const [allUsers, setAllUsers] = useState([]);
  const [duplicateDepartmentError, setDuplicateDepartmentError] =
    useState(false);

  const getStorageOptions = (deptAllowedValue) => {
    const baseOptions = [
      "1 GB",
      "2 GB",
      "25 GB",
      "50 GB",
      "75 GB",
      "100 GB",
      "150 GB",
      "200 GB",
    ];

    if (deptAllowedValue && !baseOptions.includes(deptAllowedValue)) {
      return [...baseOptions, deptAllowedValue];
    }

    return baseOptions;
  };

  const loadingDepartments = useRef(false);

  const handleToggle = (users) => {
    setSelectedDeptUsers(users);
    setOpenPopper((prev) => !prev);
  };

  const handleClose1 = () => {
    setOpenPopper(false);
  };

  const handleClick1 = (event, users) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeptUsers(users);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadMoreDepartments = async () => {
    if (loadingDepartments.current || !hasMoreDepartments) return;
    loadingDepartments.current = true;

    try {
      const res = await getDepartments(migrationPage, 10); // 10 per page
      const newDepts = res.content || [];

      setAllDepartments((prev) => [...prev, ...newDepts]);
      setMigrationPage((prev) => prev + 1);
      if (newDepts.length < 10) setHasMoreDepartments(false);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      loadingDepartments.current = false;
    }
  };

  const handleOpenMigration = (dept) => {
    setDepartmentToMigrate(dept);
    setMigrationDialogOpen(true);
    setDeleteDialogOpen(false);

    setAllDepartments([]);
    setMigrationPage(0);
    setHasMoreDepartments(true);
    loadMoreDepartments();
  };

  const fetchDepartments = async () => {
    if (isFetchingDepts.current) return;
    try {
      isFetchingDepts.current = true;
      setLoading(true);

      // COMMENTED OUT: used separate searchDepartments API for search queries
      // if (debouncedSearchQuery.trim()) {
      //   departmentData = await searchDepartments(
      //     page + 1,
      //     rowsPerPage,
      //     searchColumn,
      //     debouncedSearchQuery.trim(),
      //   );
      // } else {
      //   departmentData = await getDepartments(page, rowsPerPage);
      // }
      // NEW: always use getDepartments — pass searchColumn/searchQuery when search is active
      const departmentData = await getDepartments(
        page,
        rowsPerPage,
        searchColumn, // API column name: deptname/owner/shortname
        debouncedSearchQuery.trim(), // empty string when no search
      );
      const apiDepartments = departmentData.content || [];

      setTotalDepartments(departmentData.totalElements || 0);

      const mapped = apiDepartments.map((dept) => ({
        // COMMENTED OUT: dept.id doesn't exist in API — API returns deptId
        // id: dept.id,
        id: dept.deptId,

        name: dept.deptName,
        displayName: dept.deptDisplayName,

        // COMMENTED OUT: old fields didn't match API response shape
        // departmentModerator: dept.deptModerator || dept.permissions?.deptUsername || "",
        departmentModerator:
          dept.owner ||
          dept.deptModerator ||
          dept.permissions?.deptUsername ||
          "",

        // COMMENTED OUT: API no longer returns permissions object for storage fields
        // storage: dept.permissions?.displayStorage || "0 GB",
        // allowedStorage:
        //   dept.permissions?.allowedStorageInBytesDisplay === "0 bytes"
        //     ? "0 GB"
        //     : dept.permissions?.allowedStorageInBytesDisplay || "0 GB",
        storage: dept.storageUsed || "0 GB",
        allowedStorage: dept.storageGiven || "0 GB",

        roles: dept.roles?.roles || [],
        rolesCount: dept.roles?.totalElements ?? dept.noOfRoles ?? 0, // NEW: total count from paginated API with fallback
        users: dept.users?.users || [], // NEW: needed for DeptUsersDropdown users prop
        userCount: dept.users?.totalElements ?? dept.numberOfUsers ?? 0,

        // COMMENTED OUT: permissions object no longer present in API response
        // isActive: dept.permissions?.active || false,
        isActive: dept.active ?? false,
        createdAt: dept.createdOn,

        // NEW: preserve metadata needed for storage update payload
        permissionId: dept.permissionId || "",
        tenantId: dept.tenantId || "",
        currentStorageInBytes: dept.currentStorageInBytes || 0,
      }));

      setDepartments(mapped);
    } catch (error) {
      console.error("Error fetching departments:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      setSnackbar({
        open: true,
        message: "Failed to fetch departments",
        severity: "error",
      });
    } finally {
      setLoading(false);
      isFetchingDepts.current = false;
    }
  };

  const DeptUsersDropdown = ({
    users,
    totalUserCount,
    departmentId,
    departmentName,
    departmentRoles = [],
    onEditUser,
    onDeleteUser,
    addUsersToDepartment,
    owner, // NEW: owner email to prevent deletion
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [loading, setLoading] = useState(false);
    const anchorRef = useRef(null);

    // States for paginated roles autocomplete
    const [roleOptions, setRoleOptions] = useState([]);
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [debouncedRoleSearchQuery, setDebouncedRoleSearchQuery] =
      useState("");
    const [rolePage, setRolePage] = useState(1);
    const [roleHasMore, setRoleHasMore] = useState(true);
    const [roleLoading, setRoleLoading] = useState(false);

    // States for the Unit Users panel (paginated from new endpoint)
    const [panelUsers, setPanelUsers] = useState([]);
    const [panelPage, setPanelPage] = useState(1);
    const [panelTotalPages, setPanelTotalPages] = useState(1);
    const [panelHasMore, setPanelHasMore] = useState(true);
    const [panelLoading, setPanelLoading] = useState(false);

    // States for Add User dialog (server-side search + infinite scroll)
    const [dialogSearch, setDialogSearch] = useState("");
    const [dialogPage, setDialogPage] = useState(0);
    const [dialogHasMore, setDialogHasMore] = useState(true);
    const [dialogLoadingMore, setDialogLoadingMore] = useState(false);
    const dialogScrollRef = useRef(null);

    // Fetch paginated users from /tenants/users/within for the panel
    const loadPanelUsers = async (page = 1, query = "") => {
      setPanelLoading(true);
      try {
        const params = { deptId: departmentId, page, size: 10 };
        if (query.trim()) {
          params.name = query;
        }

        // COMMENTED OUT: search used separate /within/search endpoint — now always use /within
        // const endpoint = query.trim()
        //   ? `${window.__ENV__.REACT_APP_ROUTE}/tenants/users/within/search`
        //   : `${window.__ENV__.REACT_APP_ROUTE}/tenants/users/within`;
        const endpoint = `${window.__ENV__.REACT_APP_ROUTE}/tenants/users/within`;

        const res = await axios.get(endpoint, {
          params,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        });
        const data = res.data;
        const fetchedUsers = (data.users || []).map((u) => ({
          id: u.objectId,
          name: u.fullName,
          // Try all possible identifier keys provided by the API
          email:
            u.email ||
            u.userName ||
            u.username ||
            u.deptUsername ||
            u.userId ||
            "",
          roleName: u.role,
          roleId: u.roleId, // NEW: Include roleId for unassignment
        }));

        setPanelUsers(fetchedUsers);
        setPanelTotalPages(data.totalPages || 1);
        setPanelHasMore(!data.last);
        setPanelPage(page);
      } catch (err) {
        console.error("Failed to load unit users:", err);
        if (err.response && err.response.status === 401) {
          window.dispatchEvent(
            new CustomEvent("session-expired", {
              detail: {
                message:
                  "Your session has expired. Please login again to continue.",
              },
            }),
          );
          return;
        }
      } finally {
        setPanelLoading(false);
      }
    };

    const handleToggle = () => {
      setOpen((prev) => !prev);
    };

    // Debounce search input for server-side filtering; immediate load on open if search is empty
    useEffect(() => {
      if (!open) return;
      const delay = search.trim() === "" ? 0 : 500;
      const t = setTimeout(() => {
        loadPanelUsers(1, search);
      }, delay);
      return () => clearTimeout(t);
    }, [search, open]); // eslint-disable-line react-hooks/exhaustive-deps
    const handleClose = () => {
      setOpen(false);
      setSearch(""); // Reset search on close
    };

    // Remove client-side filtering; use server-side results directly
    const displayUsers = panelUsers;

    // COMMENTED OUT: old version loaded 100 users at once with no search
    // const handleOpenAddDialog = async () => {
    //   setAddDialogOpen(true);
    //   setLoading(true);
    //   try {
    //     const res = await fetchUsers(0, 100); // fetch first 100 users
    //     setAllUsers(res.content || []);
    //   } catch (err) {
    //     console.error(err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // NEW: load a page of users (server-side search + infinite scroll)
    const loadDialogUsers = async (page = 0, query = "", replace = false) => {
      if (loading || (replace && loading)) return;
      if (!replace && (!dialogHasMore || dialogLoadingMore)) return;

      if (replace) setLoading(true);
      else setDialogLoadingMore(true);

      try {
        let res;
        // API wants page starting from 0 (or 1 depending on service, fetchUsers handles 0->1)
        if (query.trim()) {
          res = await fetchUsers(page, 20, "name", query);
        } else {
          res = await fetchUsers(page, 20);
        }
        const newUsers = res.content || [];

        if (replace) {
          setAllUsers(newUsers);
          setDialogPage(1);
        } else {
          setAllUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const uniqueNewUsers = newUsers.filter(
              (u) => !existingIds.has(u.id),
            );
            return [...prev, ...uniqueNewUsers];
          });
          setDialogPage(page + 1);
        }
        setDialogHasMore(!res.last);
      } catch (err) {
        console.error("Failed to load dialog users:", err);
        if (err.response && err.response.status === 401) {
          window.dispatchEvent(
            new CustomEvent("session-expired", {
              detail: {
                message:
                  "Your session has expired. Please login again to continue.",
              },
            }),
          );
          return;
        }
      } finally {
        setLoading(false);
        setDialogLoadingMore(false);
      }
    };

    // NEW: open dialog with fresh first page
    const handleOpenAddDialog = () => {
      setAddDialogOpen(true);
      setAllUsers([]);
      setDialogSearch("");
      setDialogPage(0);
      setDialogHasMore(true);
      loadDialogUsers(0, "", true);
    };

    const handleCloseAddDialog = () => {
      setAddDialogOpen(false);
      setSelectedUsers([]);
      setSelectedRoles({});
      // NEW: reset dialog search/pagination state
      setDialogSearch("");
      setAllUsers([]);
      setDialogPage(0);
      setDialogHasMore(true);

      setRoleSearchQuery("");
      setRoleOptions([]);
      setRolePage(1);
      setRoleHasMore(true);
    };

    const loadMoreRoles = async (page = 1, query = "", isInitial = false) => {
      if (!departmentName || roleLoading || (!roleHasMore && !isInitial))
        return;
      setRoleLoading(true);
      try {
        const encodedDeptName = encodeURIComponent(departmentName);
        const res = await axios.get(
          `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/${encodedDeptName}/roles`,
          {
            params: { page, size: 10, search: query || undefined },
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: sessionStorage.getItem("adminEmail"),
            },
          },
        );
        const fetchedRoles = (res.data?.roles || []).map((r) => ({
          id: r.roleId,
          name: r.roleName,
        }));
        if (isInitial) {
          setRoleOptions(fetchedRoles);
          setRolePage(page);
        } else {
          setRoleOptions((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const uniqueNewRoles = fetchedRoles.filter(
              (r) => !existingIds.has(r.id),
            );
            return [...prev, ...uniqueNewRoles];
          });
          setRolePage(page);
        }
        setRoleHasMore(!res.data?.last);
      } catch (err) {
        console.error("Failed to load roles:", err);
        if (err.response && err.response.status === 401) {
          window.dispatchEvent(
            new CustomEvent("session-expired", {
              detail: {
                message:
                  "Your session has expired. Please login again to continue.",
              },
            }),
          );
          return;
        }
      } finally {
        setRoleLoading(false);
      }
    };

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedRoleSearchQuery(roleSearchQuery);
      }, 500);
      return () => clearTimeout(handler);
    }, [roleSearchQuery]);

    useEffect(() => {
      if (addDialogOpen && debouncedRoleSearchQuery !== undefined) {
        loadMoreRoles(1, debouncedRoleSearchQuery, true);
      }
    }, [debouncedRoleSearchQuery, addDialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleSelectUser = (user) => {
      setSelectedUsers((prev) =>
        prev.some((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id)
          : [...prev, user],
      );

      if (selectedUsers.some((u) => u.id === user.id)) {
        setSelectedRoles((prev) => {
          const copy = { ...prev };
          delete copy[user.id];
          return copy;
        });
      }
    };

    const handleRoleChange = (userId, role) => {
      setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
    };

    const handleAddSelectedUsers = () => {
      const usersWithRoles = selectedUsers.map((u) => ({
        id: u.id,
        role: selectedRoles[u.id] || null, // default null if not selected
      }));

      if (addUsersToDepartment) {
        addUsersToDepartment(departmentId, usersWithRoles);
      }
      handleCloseAddDialog();
    };

    // COMMENTED OUT: replaced by server-side search + infinite scroll
    // const filteredAllUsers = useMemo(() => {
    //   return allUsers.filter((user) =>
    //     user.name.toLowerCase().includes(search.toLowerCase())
    //   );
    // }, [allUsers, search]);

    // NEW: debounce dialogSearch → reload from page 0
    useEffect(() => {
      if (!addDialogOpen) return;
      const t = setTimeout(() => {
        loadDialogUsers(0, dialogSearch, true);
      }, 500);
      return () => clearTimeout(t);
    }, [dialogSearch, addDialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll handler for Add User dialog (uses infinite scroll)
    const handleDialogScroll = (event) => {
      const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
      const threshold = 50;
      if (
        Math.round(scrollTop + clientHeight) >= scrollHeight - threshold &&
        dialogHasMore &&
        !dialogLoadingMore &&
        !loading
      ) {
        loadDialogUsers(dialogPage, dialogSearch, false);
      }
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Count + dropdown */}
        <IconButton ref={anchorRef} size="small" onClick={handleToggle}>
          {totalUserCount} <ArrowDropDownIcon />
        </IconButton>

        {/* Add Users button */}
        <Tooltip title="Add Users">
          <IconButton
            onClick={handleOpenAddDialog}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: "50%",
              color: "primary.main",
              width: 28,
              height: 28,
              p: 0,
              ml: 1,
              "&:hover": { backgroundColor: "primary.light" },
            }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: "hidden",
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(to right, #1976d2, #4facfe)",
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Unit Users
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              p: 0,
              display: "flex",
              flexDirection: "column",
              maxHeight: "70vh",
            }}
          >
            {/* Search Bar */}
            <Box sx={{ p: 2 }}>
              <TextField
                size="small"
                placeholder="Search users..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&.Mui-focused fieldset": {
                      borderWidth: "1px",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Table */}
            <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                      }}
                    >
                      Role
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panelLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : displayUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          fontStyle="italic"
                        >
                          No Users Found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayUsers.map((user) => (
                      <TableRow
                        key={user.id + user.roleName}
                        sx={{
                          "&:hover": { backgroundColor: "#f1f5f9" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell
                          sx={{
                            padding: "10px 16px",
                            color: "#334155",
                            fontWeight: 500,
                          }}
                        >
                          {user.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "10px 16px",
                            color: "#64748b",
                          }}
                        >
                          <Chip
                            label={user.roleName || "N/A"}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              borderRadius: 1,
                              borderColor: "#cbd5e1",
                              color: "#475569",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ padding: "4px 16px" }} align="center">
                          {(() => {
                            const name = (user.name || "").toLowerCase().trim();
                            const ownerEmail = (owner || "")
                              .toLowerCase()
                              .trim();
                            const ownerPrefix = ownerEmail.split("@")[0];
                            const isOwner =
                              name === ownerEmail ||
                              name === ownerPrefix ||
                              (user.email &&
                                user.email.toLowerCase() === ownerEmail);

                            return (
                              <Tooltip
                                title={
                                  isOwner
                                    ? "Owner can't be deleted, for Deleting change the owner"
                                    : "Unassign User"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={isOwner}
                                    onClick={async () => {
                                      try {
                                        const response = await axios.delete(
                                          `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/deleteExistingUser/${departmentId}/${user.id}/${user.roleId}`,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${sessionStorage.getItem(
                                                "authToken",
                                              )}`,
                                              username:
                                                sessionStorage.getItem(
                                                  "adminEmail",
                                                ),
                                            },
                                          },
                                        );

                                        if (response.status === 200) {
                                          setSnackbar({
                                            open: true,
                                            message: `User "${user.name}" unassigned from department successfully`,
                                            severity: "success",
                                          });

                                          if (fetchDepartments)
                                            await fetchDepartments();
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Failed to unassign user:",
                                          error,
                                        );
                                        if (
                                          error.response &&
                                          error.response.status === 401
                                        ) {
                                          window.dispatchEvent(
                                            new CustomEvent("session-expired", {
                                              detail: {
                                                message:
                                                  "Your session has expired. Please login again to continue.",
                                              },
                                            }),
                                          );
                                          return;
                                        }
                                        setSnackbar({
                                          open: true,
                                          message: `Failed to unassign user "${user.name}"`,
                                          severity: "error",
                                        });
                                      }
                                    }}
                                    sx={{
                                      color: "#ef4444",
                                      "&:hover": { backgroundColor: "#fee2e2" },
                                    }}
                                  >
                                    <PersonRemoveIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Footer for Panel */}
            <Box
              sx={{
                p: 1.5,
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <Button
                size="small"
                onClick={() => loadPanelUsers(panelPage - 1, search)}
                disabled={panelPage <= 1 || panelLoading}
                startIcon={<KeyboardArrowLeft />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Prev
              </Button>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#475569" }}
              >
                Page {panelPage} of {panelTotalPages}
              </Typography>
              <Button
                size="small"
                onClick={() => loadPanelUsers(panelPage + 1, search)}
                disabled={panelPage >= panelTotalPages || panelLoading}
                endIcon={<KeyboardArrowRight />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Next
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={addDialogOpen}
          onClose={handleCloseAddDialog}
          fullWidth
          maxWidth="sm"
        >
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
              onClick={handleCloseAddDialog}
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
                "&:hover": { transform: "rotate(180deg)" },
                transition: "transform 0.3s ease",
              }}
            >
              <Close
                sx={{ fontSize: "1rem", transition: "transform 0.2s ease" }}
              />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ mt: 1 }}>
            {/* NEW: search input always visible above the list */}
            <TextField
              size="small"
              placeholder="Search users"
              fullWidth
              value={dialogSearch}
              onChange={(e) => setDialogSearch(e.target.value)}
              sx={{ mb: 1 }}
            />
            {/* OLD: search was client-side filtering using shared `search` state
            <TextField
              size="small"
              placeholder="Search users"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 1 }}
            /> */}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              // NEW: scrollable container for infinite scroll (ref used as IO root)
              <Box
                ref={dialogScrollRef}
                sx={{ maxHeight: 360, overflowY: "auto" }}
                onScroll={handleDialogScroll}
              >
                {/* OLD: <Table size="small"> */}
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* OLD: {filteredAllUsers.map((user) => ( */}
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Autocomplete
                            options={roleOptions}
                            getOptionLabel={(option) => option.name || ""}
                            filterOptions={(x) => x}
                            loading={roleLoading}
                            onInputChange={(event, newInputValue, reason) => {
                              if (reason === "input" || reason === "clear") {
                                setRoleSearchQuery(newInputValue);
                              }
                            }}
                            ListboxProps={{
                              style: { maxHeight: 200, overflow: "auto" },
                              onScroll: (event) => {
                                const listboxNode = event.currentTarget;
                                const threshold = 50;
                                if (
                                  Math.round(
                                    listboxNode.scrollTop +
                                      listboxNode.clientHeight,
                                  ) >=
                                    listboxNode.scrollHeight - threshold &&
                                  roleHasMore &&
                                  !roleLoading
                                ) {
                                  loadMoreRoles(
                                    rolePage + 1,
                                    roleSearchQuery,
                                    false,
                                  );
                                }
                              },
                            }}
                            renderOption={(props, option) => (
                              <li {...props} style={{ padding: "10px 16px" }}>
                                {option.name}
                              </li>
                            )}
                            value={selectedRoles[user.id] || null}
                            onChange={(e, value) => {
                              handleRoleChange(user.id, value);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                fullWidth
                                placeholder="Select Role"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <React.Fragment>
                                      {params.InputProps.endAdornment}
                                    </React.Fragment>
                                  ),
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.some(
                              (u) => u.id === user.id,
                            )}
                            onChange={() => handleToggleSelectUser(user)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* OLD: {filteredAllUsers.length === 0 && ( */}
                    {allUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No Users Found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {/* NEW: sentinel div triggers IntersectionObserver for next page */}
                {dialogLoadingMore && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 1 }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              onClick={handleAddSelectedUsers}
              disabled={selectedUsers.length === 0}
            >
              Add Selected
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  // OLD: const DeptRolesDropdown = ({ roles, selectedDepartment, handleAddRole }) => {
  const DeptRolesDropdown = ({
    roles,
    totalRoleCount,
    selectedDepartment,
    handleAddRole,
    handleUpdateRole,
  }) => {
    const [open, setOpen] = useState(false);
    const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
    const [newRole, setNewRole] = useState("");
    const [appRole, setAppRole] = useState("");
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState(null); // NEW: store role.id for PUT call
    const anchorRef = useRef(null);

    // States for the Unit Roles panel (paginated from new endpoint)
    const [panelRoles, setPanelRoles] = useState([]);
    const [panelPage, setPanelPage] = useState(1);
    const [panelTotalPages, setPanelTotalPages] = useState(1);
    const [panelHasMore, setPanelHasMore] = useState(true);
    const [panelLoading, setPanelLoading] = useState(false);
    const [search, setSearch] = useState("");

    // NEW: sessionStorage key helper — scoped to dept so roles from different depts don't clash
    const ssKey = (roleName) =>
      `appRole__${selectedDepartment?.name}__${roleName}`;

    // Fetch paginated roles from /tenants/departments/{deptName}/roles for the panel
    const loadPanelRoles = async (page = 1, query = "") => {
      if (!selectedDepartment?.name) return;
      setPanelLoading(true);
      try {
        const params = { page, size: 10 };
        if (query.trim()) {
          params.search = query.trim();
        }

        const endpoint = `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/${selectedDepartment.name}/roles`;

        const res = await axios.get(endpoint, {
          params,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: sessionStorage.getItem("adminEmail"),
          },
        });
        const data = res.data;
        const fetchedRoles = data.roles || [];

        setPanelRoles(fetchedRoles);
        setPanelTotalPages(data.totalPages || 1);
        setPanelHasMore(!data.last);
        setPanelPage(page);
      } catch (err) {
        console.error("Failed to load unit roles:", err);
        if (err.response && err.response.status === 401) {
          window.dispatchEvent(
            new CustomEvent("session-expired", {
              detail: {
                message:
                  "Your session has expired. Please login again to continue.",
              },
            }),
          );
        }
      } finally {
        setPanelLoading(false);
      }
    };

    const handleToggle = () => {
      setOpen((prev) => !prev);
    };

    // Debounce search input for server-side filtering; immediate load on open if search is empty
    useEffect(() => {
      if (!open) return;
      const delay = search.trim() === "" ? 0 : 500;
      const t = setTimeout(() => {
        loadPanelRoles(1, search);
      }, delay);
      return () => clearTimeout(t);
    }, [search, open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = () => {
      setOpen(false);
      setSearch(""); // Reset search on close
    };

    const handleEditClick = (role) => {
      setNewRole(role.roleName);
      setEditingRoleId(role.roleId || null); // NEW: store role id for PUT /tenants/roles
      // NEW: use API field if ever returned, else fall back to sessionStorage (survives page refresh)
      const cached = sessionStorage.getItem(ssKey(role.roleName)) || "";
      setAppRole(role.appRole || cached);
      setIsEditMode(true);
      setShowAddRoleDialog(true);
      setOpen(false); // Close the dropdown when opening dialog
    };

    const handleAddClick = () => {
      setNewRole("");
      setAppRole("");
      setHasAttemptedSubmit(false);
      setIsEditMode(false);
      setShowAddRoleDialog(true);
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <IconButton ref={anchorRef} size="small" onClick={handleToggle}>
          {totalRoleCount} <ArrowDropDownIcon />
        </IconButton>

        <Tooltip title="Add Role">
          <IconButton
            onClick={handleAddClick}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: "50%",
              color: "primary.main",
              width: 28,
              height: 28,
              p: 0,
              ml: 1,
              "&:hover": { backgroundColor: "primary.light" },
            }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>

        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: "hidden",
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(to right, #1976d2, #4facfe)",
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Unit Roles
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              p: 0,
              display: "flex",
              flexDirection: "column",
              maxHeight: "70vh",
            }}
          >
            {/* Search Bar */}
            <Box sx={{ p: 2 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
            </Box>

            {/* Table */}
            <TableContainer
              sx={{ flexGrow: 1, minHeight: 150, overflowY: "auto" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                      }}
                    >
                      Role Name
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panelLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : panelRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          fontStyle="italic"
                        >
                          No Roles Found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    panelRoles.map((role) => (
                      <TableRow
                        key={role.roleId}
                        sx={{
                          "&:hover": { backgroundColor: "#f1f5f9" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell
                          sx={{
                            padding: "10px 16px",
                            color: "#334155",
                            fontWeight: 500,
                          }}
                        >
                          <Chip
                            label={role.roleName}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: "0.75rem",
                              borderRadius: 1,
                              borderColor: "#cbd5e1",
                              color: "#475569",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ padding: "4px 16px" }} align="center">
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(role)}
                              sx={{
                                color: "#1976d2",
                                "&:hover": {
                                  backgroundColor: "#e3f2fd",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer Pagination */}
            <Box
              sx={{
                p: 1.5,
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <Button
                size="small"
                onClick={() => loadPanelRoles(panelPage - 1, search)}
                disabled={panelPage <= 1 || panelLoading}
                startIcon={<KeyboardArrowLeft />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Prev
              </Button>
              <Typography
                variant="caption"
                sx={{ color: "#64748b", fontWeight: 500 }}
              >
                Page {panelTotalPages === 0 ? 0 : panelPage} of{" "}
                {panelTotalPages}
              </Typography>
              <Button
                size="small"
                onClick={() => loadPanelRoles(panelPage + 1, search)}
                disabled={panelPage >= panelTotalPages || panelLoading}
                endIcon={<KeyboardArrowRight />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Next
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Drawer
          anchor="left"
          open={showAddRoleDialog}
          onClose={() => {
            setShowAddRoleDialog(false);
            setNewRole("");
            setAppRole("");
            setIsEditMode(false);
          }}
          PaperProps={{
            sx: {
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              position: "absolute",
              top: "30%",
              left: "40%",
              m: 0,
              height: "auto",
              maxHeight: "95vh",
              overflow: "hidden",
              width: "350px",
              animation: "slideInFromLeft 0.2s ease-in-out forwards",
              opacity: 0,
              transform: "translateX(-50px)",
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
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "primary.main",
            }}
          >
            <Typography variant="h6" sx={{ color: "#ffff" }}>
              {isEditMode ? "Edit Role" : "Add Role"} to{" "}
              {selectedDepartment?.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setShowAddRoleDialog(false);
                setNewRole("");
                setAppRole("");
                setIsEditMode(false);
              }}
              sx={{
                color: "#ffff",
                border: "1px solid",
                borderColor: "#ffff",
                bgcolor: "error.lighter",
                "&:hover": { transform: "rotate(180deg)" },
                transition: "all 0.3s ease",
                borderRadius: "50%",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, flexGrow: 1 }}>
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <CardContent>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  label={
                    <>
                      Role Name <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  error={hasAttemptedSubmit && !newRole.trim()}
                  helperText={
                    hasAttemptedSubmit && !newRole.trim() ? "Required" : ""
                  }
                  sx={{ mb: 2 }}
                />
                <FormControl
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={hasAttemptedSubmit && !appRole}
                >
                  <InputLabel id="role-select-label">
                    App Role <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={appRole}
                    label="App Role *"
                    onChange={(e) => setAppRole(e.target.value)}
                  >
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="VIEWER">VIEWER</MenuItem>
                    <MenuItem value="EDITOR">EDITOR</MenuItem>
                    <MenuItem value="COMMENTOR">COMMENTOR</MenuItem>
                    <MenuItem value="CONTRIBUTOR">CONTRIBUTOR</MenuItem>
                    <MenuItem value="NO_ROLE">NO_ROLE</MenuItem>
                  </Select>
                  {hasAttemptedSubmit && !appRole && (
                    <FormHelperText>Required</FormHelperText>
                  )}
                </FormControl>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              borderTop: "1px solid #eee",
            }}
          >
            <Button
              onClick={() => {
                setShowAddRoleDialog(false);
                setNewRole("");
                setAppRole("");
                setHasAttemptedSubmit(false);
                setIsEditMode(false);
              }}
            >
              Cancel
            </Button>
            {/* COMMENTED OUT: old click didn't update local appRole cache
            <Button
              onClick={() =>
                handleAddRole(newRole, appRole, selectedDepartment)
              }
              variant="contained"
              color="primary"
              sx={{ background: "rgb(251, 68, 36)" }}
            >
              {isEditMode ? "Update" : "Add"}
            </Button> */}
            {/* NEW: also save appRole to session cache so edit dialog can pre-fill it */}
            {/* OLD: single handler for both add and edit — now split by isEditMode
            <Button
              onClick={async () => {
                await handleAddRole(newRole, appRole, selectedDepartment);
                if (newRole) {
                  sessionStorage.setItem(ssKey(newRole), appRole);
                }
              }}
              variant="contained"
              color="primary"
              sx={{ background: "rgb(251, 68, 36)" }}
            >
              {isEditMode ? "Update" : "Add"}
            </Button> */}
            {/* NEW: call handleUpdateRole (PUT) on edit, handleAddRole (POST) on add */}
            <Button
              onClick={async () => {
                setHasAttemptedSubmit(true);
                if (!newRole.trim() || !appRole) {
                  return;
                }
                if (isEditMode) {
                  // Direct update without warning
                  await handleUpdateRole(
                    editingRoleId,
                    newRole,
                    appRole,
                    selectedDepartment,
                  );
                  if (newRole) {
                    sessionStorage.setItem(ssKey(newRole), appRole);
                  }
                } else {
                  await handleAddRole(newRole, appRole, selectedDepartment);
                  // Save appRole to sessionStorage so edit dialog can pre-fill it
                  if (newRole) {
                    sessionStorage.setItem(ssKey(newRole), appRole);
                  }
                }
              }}
              variant="contained"
              color="primary"
              sx={{ background: "rgb(251, 68, 36)" }}
            >
              {isEditMode ? "Update" : "Add"}
            </Button>
          </Box>
        </Drawer>
      </div>
    );
  };

  const handleUpdateDepartment = async () => {
    if (
      !editedDepartment?.name ||
      !editedDepartment?.displayName ||
      !editedDepartment?.departmentModerator
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    if (
      searchModerator &&
      searchModerator !== editedDepartment.departmentModerator
    ) {
      const isValidOwner = filteredUsers.some(
        (u) => u.name === searchModerator,
      );

      if (!isValidOwner) {
        setSnackbar({
          open: true,
          message: "Please select a valid Unit Owner from the list",
          severity: "error",
        });
        return;
      }
    }

    const payload = {
      deptName: editedDepartment.name.trim(),
      deptDisplayName: editedDepartment.displayName.trim(),
      deptModerator: editedDepartment.departmentModerator.trim(),
    };

    try {
      await updateDepartment(payload);
      fetchDepartments();

      setSnackbar({
        open: true,
        message: "Unit updated successfully",
        severity: "success",
      });

      setEditDialogOpen(false);
      setEditedDepartment(null);
    } catch (error) {
      console.error("Failed to update department:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      const backendMsg =
        error?.response?.data?.error ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : error.error) ||
        "Failed to update Unit. Please try again.";

      setSnackbar({
        open: true,
        message: backendMsg,
        severity: "error",
      });
    }
  };

  const loadFilteredUsers = async (isSearch = false) => {
    if (isSearchingFilteredUsers || (!hasMoreFilteredUsers && !isSearch))
      return;
    setIsSearchingFilteredUsers(true);
    if (isSearch) setFilteredUsers([]); // Clear previous results to trigger centered loader

    try {
      const currentPage = isSearch ? 0 : filteredPage;
      const [res] = await Promise.all([
        fetchUsers(
          currentPage,
          10,
          debouncedSearchModerator ? "email" : "",
          debouncedSearchModerator,
        ),
        new Promise((resolve) => setTimeout(resolve, 800)), // Minimum delay to see the loader
      ]);
      const users = res?.content || [];

      const simplifiedUsers = users.map((u) => ({
        name: u.email,
        id: u.id,
      }));

      if (isSearch) {
        setFilteredUsers(simplifiedUsers);
        setFilteredPage(1); // Page 1 fetched, next page is 1 (MUI 0-indexed)
        setHasMoreFilteredUsers(!res.last);
      } else {
        setFilteredUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u.id));
          const uniqueNewUsers = simplifiedUsers.filter(
            (u) => !existingIds.has(u.id),
          );
          return [...prev, ...uniqueNewUsers];
        });
        setFilteredPage((prev) => prev + 1);
        setHasMoreFilteredUsers(!res.last);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
    } finally {
      setIsSearchingFilteredUsers(false);
    }
  };

  const loadMoreUsers = async (isSearch = false) => {
    if (isFetchingMoreUsers.current || (!hasMoreUsers && !isSearch)) return;
    isFetchingMoreUsers.current = true;
    setIsSearchingUsers(true);
    if (isSearch) setUserOptions([]); // Clear previous options to trigger centered loader

    try {
      const currentPage = isSearch ? 0 : userPage;
      const [res] = await Promise.all([
        fetchUsers(
          currentPage,
          10,
          debouncedUserSearchQuery ? "email" : "",
          debouncedUserSearchQuery,
        ),
        new Promise((resolve) => setTimeout(resolve, 800)), // Minimum delay to see the loader
      ]);
      const users = res?.content || [];

      if (isSearch) {
        setUserOptions(users);
        setUserPage(1); // Page 1 fetched, next page is 1 (MUI 0-indexed)
        setHasMoreUsers(!res.last);
      } else {
        setUserOptions((prev) => {
          const existingIds = new Set(prev.map((u) => u.objectId || u.id));
          const uniqueNewUsers = users.filter(
            (u) => !existingIds.has(u.objectId || u.id),
          );
          return [...prev, ...uniqueNewUsers];
        });
        setUserPage((prev) => prev + 1);
        setHasMoreUsers(!res.last);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
    } finally {
      setIsSearchingUsers(false);
      isFetchingMoreUsers.current = false;
    }
  };

  const toBytes = (value) => {
    const num = parseFloat(value);
    const unit = value.replace(/[0-9.\s]/g, "").toLowerCase();

    switch (unit) {
      case "kb":
        return num * 1024;
      case "mb":
        return num * 1024 ** 2;
      case "gb":
        return num * 1024 ** 3;
      case "tb":
        return num * 1024 ** 4;
      default:
        return num; // assume already in bytes
    }
  };

  const handleStorageChange = async (deptName, newStorageDisplay) => {
    try {
      // FIX: Instead of re-fetching departments (which fails if a filter is active),
      // we use the data already available in the 'departments' state.
      const targetDept = departments.find((d) => d.name === deptName);
      if (!targetDept) throw new Error("Target Unit not found");

      const payload = [
        {
          permissions: {
            id: targetDept.permissionId || "",
            userId: targetDept.name,
            deptName: targetDept.name,
            accessLevel: "EDITOR",
            accessCode: 111000,
            allowedStorageInBytes: toBytes(newStorageDisplay), // ✅ convert string to bytes
            allowedStorageInBytesDisplay: newStorageDisplay,
            currentStorageInBytes: targetDept.currentStorageInBytes || 0,
            isDMS_CreateType: false,
            licenseTier: "PREMIUM",
            tenantId: targetDept.tenantId,
          },
        },
      ];

      await updateDepartmentStoragePermission(payload, page);

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.name === deptName
            ? { ...dept, allowedStorage: newStorageDisplay }
            : dept,
        ),
      );

      setSnackbar({
        open: true,
        message: `Storage updated to ${newStorageDisplay} for ${deptName}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Storage update failed:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      const backendMsg =
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : error.message);

      setSnackbar({
        open: true,
        message: backendMsg,
        severity: "error",
      });
    }
  };

  const [selected, setSelected] = useState([]);
  const [selectAllData, setSelectAllData] = useState(false);
  const [rowData, setRowData] = useState([]);

  const [filteredDepartments, setFilteredDepartments] = useState([]);
  // Add this handler function
  const handleSearch = (results) => {
    if (!results || results.length === 0) {
      setFilteredDepartments([]);
      setSearchQuery("");
      return;
    }

    const filtered = departments.filter((dept) =>
      results.some(
        (result) =>
          result.name === dept.name ||
          result.displayName === dept.displayName ||
          result.roles.some((role) => dept.roles.includes(role)),
      ),
    );

    setFilteredDepartments(filtered);
    setSearchQuery(results.query || "");
  };

  // Add these handler functions
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = sortedDepartments.map((dept) => dept.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Add this handler function
  const handleToggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Add this handler function
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  const handleEditRole = (deptName, roleIndex, currentRole) => {
    setEditingRole({
      departmentName: deptName,
      roleIndex: roleIndex,
      value: currentRole,
    });
    setEditRoleDialog(true);
  };

  const handleDeleteRole = async (deptName, roleIndex) => {
    const department = departments.find((d) => d.name === deptName);
    if (!department) return;

    const roleToDelete = department.roles[roleIndex];

    if (!roleToDelete || !roleToDelete.id) return;

    if (department.roles.length <= 1) {
      setSnackbar({
        open: true,
        message:
          "Cannot delete the last role. Unit must have at least one role.",
        severity: "error",
      });
      return;
    }

    try {
      await deleteRole(roleToDelete.id); // ✅ pass role ID

      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.name === deptName
            ? {
                ...dept,
                roles: dept.roles.filter((_, i) => i !== roleIndex),
              }
            : dept,
        ),
      );

      setSnackbar({
        open: true,
        message: `Role "${roleToDelete.roleName}" deleted successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete role:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      setSnackbar({
        open: true,
        message: `Failed to delete role "${roleToDelete.roleName}"`,
        severity: "error",
      });
    }
  };

  const handleSaveRole = () => {
    if (!editingRole.value.trim()) {
      setSnackbar({
        open: true,
        message: "Role name cannot be empty",
        severity: "error",
      });
      return;
    }

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === editingRole.departmentName
          ? {
              ...dept,
              roles: dept.roles.map((role, i) =>
                i === editingRole.roleIndex ? editingRole.value : role.roleName,
              ),
            }
          : dept,
      ),
    );

    setEditRoleDialog(false);
    setSnackbar({
      open: true,
      message: "Role updated successfully",
      severity: "success",
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBulkDownload = () => {
    try {
      const exportData = departments.map((dept) => ({
        "Unit Name": dept.name,
        "Unit Short Name": dept.displayName,
        "Unit Owner": dept.departmentModerator,
        "Storage Allocated":
          dept?.permissions?.allowedStorageInBytesDisplay || "50GB",
        "Storage Consumed": dept?.permissions?.displayStorage || "0KB",
        Roles: `${dept.roles.length} (${dept.roles.join(", ")})`,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 25 }, // Unit Name
        { wch: 20 }, // Unit Short Name
        { wch: 25 }, // Unit Owner
        { wch: 20 }, // Storage Allocated
        { wch: 50 }, // Combined Roles column
        { wch: 15 }, // Status column
        { wch: 10 }, // Edit column
      ];
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Departments");
      XLSX.writeFile(wb, "departments.xlsx");

      setSnackbar({
        open: true,
        message: "Units exported successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error exporting Units",
        severity: "error",
      });
    }
  };

  const fileInputRef = useRef(null);

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // ✅ Required columns
          const requiredColumns = {
            "Unit Name": false,
            "Unit Short Name": false,
            "Unit Owner": false,
            "Storage Allocated": false,
            Role: false,
            Permission: false,
          };

          if (jsonData.length > 0) {
            const firstRow = jsonData[0];
            Object.keys(firstRow).forEach((column) => {
              if (requiredColumns.hasOwnProperty(column)) {
                requiredColumns[column] = true;
              }
            });
          }

          const missingColumns = Object.entries(requiredColumns)
            .filter(([_, present]) => !present)
            .map(([column]) => column);

          if (missingColumns.length > 0) {
            setSnackbar({
              open: true,
              message: `Invalid file format. Missing required columns: ${missingColumns.join(
                ", ",
              )}`,
              severity: "error",
            });
            return;
          }

          const existingDeptNames = new Set(
            departments.map((d) => d.name.toLowerCase()),
          );
          const existingDisplayNames = new Set(
            departments.map((d) => d.displayName.toLowerCase()),
          );

          const invalidRows = [];
          const seenDeptNames = new Set();
          const seenDisplayNames = new Set();

          jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // Excel rows start at 2 (row 1 = header)
            const errors = [];

            if (!row["Unit Name"]) {
              errors.push("Unit Name");
            } else {
              if (row["Unit Name"].length > 35) {
                errors.push("Unit Name exceeds 35 characters");
              }
              if (/[^A-Za-z0-9._-]/.test(row["Unit Name"])) {
                errors.push(
                  "Unit Name contains invalid characters (Only A-Za-z0-9._- allowed)",
                );
              }
            }

            if (!row["Unit Short Name"]) {
              errors.push("Unit Short Name");
            } else {
              if (row["Unit Short Name"].length > 8) {
                errors.push("Unit Short Name exceeds 8 characters");
              }
              if (/[^A-Z0-9]/.test(row["Unit Short Name"].toUpperCase())) {
                errors.push(
                  "Unit Short Name contains invalid characters (Only A-Z, 0-9 allowed)",
                );
              }
            }

            if (!row["Unit Owner"]) errors.push("Unit Owner");
            if (!row["Storage Allocated"]) errors.push("Storage Allocated");
            if (!row.Role) errors.push("Role");
            if (!row.Permission) errors.push("Permission");

            // ✅ Duplicate check within the file
            if (row["Unit Name"]) {
              if (seenDeptNames.has(row["Unit Name"].toLowerCase())) {
                errors.push("Duplicate Unit Name in file");
              } else {
                seenDeptNames.add(row["Unit Name"].toLowerCase());
              }
            }

            if (row["Unit Short Name"]) {
              if (seenDisplayNames.has(row["Unit Short Name"].toLowerCase())) {
                errors.push("Duplicate Unit Short Name in file");
              } else {
                seenDisplayNames.add(row["Unit Short Name"].toLowerCase());
              }
            }

            if (
              row["Unit Name"] &&
              existingDeptNames.has(row["Unit Name"].toLowerCase())
            ) {
              errors.push("Unit Name already exists");
            }
            if (
              row["Unit Short Name"] &&
              existingDisplayNames.has(row["Unit Short Name"].toLowerCase())
            ) {
              errors.push("Unit Short Name already exists");
            }

            if (errors.length > 0) {
              invalidRows.push(
                `Row ${rowNumber} issue(s): ${errors.join(", ")}`,
              );
            }
          });

          if (invalidRows.length > 0) {
            setSnackbar({
              open: true,
              message: `Validation failed:\n${invalidRows.join("\n")}`,
              severity: "error",
            });
            return;
          }

          // ✅ Build API payload
          const apiPayload = jsonData.map((row) => ({
            deptName: row["Unit Name"]
              ? row["Unit Name"].toLowerCase()
              : row["Unit Name"],
            deptDisplayName: row["Unit Short Name"],
            deptModerator: row["Unit Owner"],
            storage: row["Storage Allocated"],
            role: row["Role"],
            permission: row["Permission"] || "ADMIN",
          }));

          // ✅ Send API request
          try {
            const response = await axios.post(
              `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/bulk`,
              apiPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${sessionStorage.getItem(
                    "authToken",
                  )}`,
                  username: `${sessionStorage.getItem("adminEmail")}`,
                },
              },
            );

            // Parse response array
            const results = response.data;
            const successCount = results.filter(
              (r) => r.status === "Success" || r.status === "Created",
            ).length;
            const failures = results.filter(
              (r) => r.status === "Failed" || !!r.error,
            );

            let message = "";
            let severity = "success";

            if (failures.length === 0) {
              message = `Successfully uploaded ${successCount} Unit(s).`;
            } else if (successCount === 0) {
              severity = "error";
              message = `All uploads failed:\n${failures.map((f) => `- ${f.deptName}: ${f.error?.error || f.error}`).join("\n")}`;
            } else {
              severity = "warning";
              message = `Successfully uploaded ${successCount} Unit(s), but ${failures.length} failed:\n${failures.map((f) => `- ${f.deptName}: ${f.error?.error || f.error}`).join("\n")}`;
            }

            setSnackbar({
              open: true,
              message: message,
              severity: severity,
            });
            setShowAddDepartment(false);

            fetchDepartments(); // refresh data
            setBulkUploadDialogOpen(false);
          } catch (apiError) {
            console.error("API error:", apiError);
            if (apiError.response && apiError.response.status === 401) {
              window.dispatchEvent(
                new CustomEvent("session-expired", {
                  detail: {
                    message:
                      "Your session has expired. Please login again to continue.",
                  },
                }),
              );
              return;
            }
            setSnackbar({
              open: true,
              message: "Bulk upload failed. Please try again.",
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error processing file:", error);
          setSnackbar({
            open: true,
            message:
              "Error processing file. Please ensure it matches the template format.",
            severity: "error",
          });
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File read error:", error);
      setSnackbar({
        open: true,
        message: "Error uploading file.",
        severity: "error",
      });
    }

    event.target.value = ""; // Clear the file input
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowToggle = (index) => {
    setOpenRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedDepartments = React.useMemo(() => {
    const deptToSort =
      filteredDepartments.length > 0 ? filteredDepartments : departments;

    if (!deptToSort) return [];

    return [...deptToSort].sort((a, b) => {
      if (orderBy === "noOfRoles" || orderBy === "roles") {
        return order === "asc"
          ? (a.rolesCount || 0) - (b.rolesCount || 0)
          : (b.rolesCount || 0) - (a.rolesCount || 0);
      }

      const aVal = a[orderBy] || "";
      const bVal = b[orderBy] || "";

      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [departments, filteredDepartments, order, orderBy]);

  // COMMENTED OUT: client-side filter replaced by server-side searchDepartments API
  // const filteredDepartments1 = sortedDepartments?.filter((row) => {
  //   const value = row[searchColumn]?.toString().toLowerCase();
  //   return value?.includes(searchQuery.toLowerCase());
  // });
  const filteredDepartments1 = sortedDepartments; // now API handles filtering

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "#ffffff",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#fffff",
    },
    "&:hover": {
      backgroundColor: "#f1f5f9 !important",
    },
    "&.Mui-selected": {
      backgroundColor: "rgba(25, 118, 210, 0.08) !important",
    },
    "&.Mui-selected:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.12) !important",
    },
    "& .MuiTableCell-root": {
      padding: "12px 16px",
      fontSize: "0.8125rem",
      color: "#334155",
      borderBottom: "1px solid #e2e8f0",
      whiteSpace: "nowrap",
      // ...commonTextStyle,
    },
    transition: "background-color 0.2s ease",
  }));

  const checkDuplicateDepartment = (value) => {
    const duplicate = departments.some(
      (dept) => dept.name.toLowerCase() === value.toLowerCase(),
    );
    setDuplicateDepartmentError(duplicate);
  };

  const checkDuplicateShortName = (value) => {
    const duplicate = departments.some(
      (dept) => dept.displayName.toLowerCase() === value.toLowerCase(),
    );
    setDuplicateShortNameError(duplicate);
  };

  const updateDepartmentField = (index, field, value) => {
    setNewDepartments((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addMoreDepartment = () => {
    setNewDepartments((prev) => [
      ...prev,
      {
        name: "",
        displayName: "",
        storage: "1 GB",
        departmentModerator: "",
        role: "UNIT_ADMIN", // ✅ fixed default
        permission: "ADMIN", // ✅ standardized
        submitted: false,
      },
    ]);
    setExpandedIndices([newDepartments.length]); // expand only the new one
  };

  const removeDepartment = (index) => {
    setNewDepartments((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndices((prev) => prev.filter((i) => i !== index));
  };

  const toggleExpand = (index) => {
    setExpandedIndices((prev) => (prev.includes(index) ? [] : [index]));
  };

  const handleAddDepartment = async () => {
    let hasError = false;
    const updated = newDepartments.map((dept) => {
      // Check for duplicates within existing departments
      const isDuplicate =
        Array.isArray(departments) &&
        departments.some(
          (existing) =>
            (existing.name || "").toLowerCase() ===
            (dept.name || "").trim().toLowerCase(),
        );

      const invalid =
        !(dept.name || "").trim() ||
        !(dept.displayName || "").trim() ||
        !(dept.storage || "").trim() ||
        !(dept.departmentModerator || "").trim() ||
        !(dept.role || "").trim() ||
        (dept.name || "").length > 35 ||
        (dept.displayName || "").length > 8 ||
        /\s/.test(dept.name || "") ||
        isDuplicate;

      if (invalid) {
        hasError = true;
        return { ...dept, submitted: true, isDuplicate };
      }
      return { ...dept, isDuplicate: false, submitted: false };
    });
    setNewDepartments(updated);

    if (hasError) {
      setSnackbar({
        open: true,
        message: "Please fix the errors before submitting",
        severity: "error",
      });
      return;
    }

    try {
      for (let dept of updated) {
        await createDepartment({
          deptName: (dept.name || "").trim().toLowerCase(),
          deptDisplayName: (dept.displayName || "").trim(),
          deptModerator: (dept.departmentModerator || "").trim(),
          storage: (dept.storage || "").trim(),
          role: (dept.role || "").trim(),
          permission: dept.permission || "ADMIN",
        });
      }
      fetchDepartments();
      setSnackbar({
        open: true,
        message: "Unit created successfully",
        severity: "success",
      });
      setShowAddDepartment(false);
      setNewDepartments([
        {
          name: "",
          displayName: "",
          storage: "1 GB",
          departmentModerator: "",
          role: "UNIT_ADMIN", // ✅ fixed default
          permission: "ADMIN", // ✅ standardized
          submitted: false,
        },
      ]);
      setExpandedIndices([0]);
      setDuplicateDepartmentError(false);
      setDuplicateShortNameError(false);
    } catch (error) {
      console.error("handleAddDepartment error:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      const backendMsg =
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        error.message ||
        "Failed to create Unit";
      setSnackbar({
        open: true,
        message: backendMsg,
        severity: "error",
      });
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setSnackbar({
        open: true,
        message: "Role name cannot be empty",
        severity: "error",
      });
      return;
    }

    try {
      const payload = {
        department: selectedDepartment.name.trim(),
        role: newRole.trim(),
        isAdmin: isAdminRole,
      };

      await createRole(payload); // ✅ API call

      // ✅ Update departments list
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.name === selectedDepartment.name
            ? {
                ...dept,
                roles: [
                  ...dept.roles,
                  { roleName: newRole.trim(), isAdmin: isAdminRole },
                ],
              }
            : dept,
        ),
      );

      setSelectedDepartment((prev) => ({
        ...prev,
        roles: [
          ...prev.roles,
          { roleName: newRole.trim(), isAdmin: isAdminRole },
        ],
      }));

      setSnackbar({
        open: true,
        message: `Role "${newRole}" added successfully.`,
        severity: "success",
      });

      // ✅ Reset form
      setNewRole("");
      setShowAddRoleDialog(false);
      setIsAdminRole(false);
    } catch (error) {
      console.error("Failed to create role:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      const backendMessage =
        error?.response?.data || "Failed to create role. Please try again.";
      setSnackbar({
        open: true,
        message:
          typeof backendMessage === "string"
            ? backendMessage
            : "Failed to create role. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDepartmentToggle = (dept) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.name === dept.name ? { ...d, isActive: !d.isActive } : d,
      ),
    );
    setSnackbar({
      open: true,
      message: `Unit "${dept.name}" ${
        !dept.isActive ? "activated" : "deactivated"
      }`,
      severity: "success",
    });
  };

  const handleEditDepartment = (dept) => {
    setEditedDepartment({
      ...dept,
      originalName: dept.name,
      departmentModerator: dept.departmentModerator || "", // ✅ add this
    });
    setFilteredUsers([]); // ✅ reset previous list
    setFilteredPage(0); // ✅ reset pagination
    setHasMoreFilteredUsers(true); // ✅ allow loading again

    setSearchModerator(""); // ✅ Clear the moderator field
    setEditDialogOpen(true);
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete?.name) return;

    try {
      await deleteDepartment(departmentToDelete.name);

      setDepartments((prev) =>
        prev.filter((d) => d.name !== departmentToDelete.name),
      );

      setSnackbar({
        open: true,
        message: `Unit "${departmentToDelete.name}" deleted successfully`,
        severity: "success",
      });
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      if (error.response && error.response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: {
              message:
                "Your session has expired. Please login again to continue.",
            },
          }),
        );
        return;
      }
      setSnackbar({
        open: true,
        message: `Failed to delete Unit "${departmentToDelete.name}"`,
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };
  const handleTemplateDownload = () => {
    const headers = [
      "Unit Name", // deptName
      "Unit Short Name", // deptDisplayName
      "Unit Owner", // deptModerator
      "Storage Allocated", // storage
      "Role", // role
      "Permission", // permission
    ];

    const dummyData = [
      [
        "IT", // Unit Name
        "Information Technology", // Unit Short Name
        "john.doe@example.com", // Unit Owner
        "50 GB", // Storage Allocated
        "Admin", // Role
        "ADMIN", // Permission
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Department_Template.xlsx");
  };

  const handleBulkDownloadSelected = (selectedItems) => {
    try {
      const sourceData = rowData.length > 0 ? rowData : departments;
      const selectedDepartments = sourceData.filter((dept) =>
        selectedItems.includes(dept.name),
      );

      const exportData = selectedDepartments.flatMap((dept) => {
        // ✅ Collect all users across roles
        const users = dept.roles?.flatMap((role) => role.user || []) || [];
        const userNames = users.map((u) => u.name).join(", ");
        const userCount = users.length;

        if (!dept.roles || dept.roles.length === 0) {
          return [
            {
              "Unit Name": dept.name,
              "Unit Short Name": dept.displayName,
              "Unit Owner": dept.departmentModerator,
              "Storage Allocated": dept.allowedStorage || "N/A",
              "Storage Consumed": dept.storage || "N/A",
              Role: "",
              Users: userCount > 0 ? `${userCount} (${userNames})` : "0",
            },
          ];
        }

        return dept.roles.map((role) => ({
          "Unit Name": dept.name,
          "Unit Short Name": dept.displayName,
          "Unit Owner": dept.departmentModerator,
          "Storage Allocated": dept.allowedStorage || "N/A",
          "Storage Consumed": dept.storage || "N/A",
          Role: role.roleName,
          Users: userCount > 0 ? `${userCount} (${userNames})` : "0",
        }));
      });

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 25 }, // Unit Name
        { wch: 20 }, // Unit Short Name
        { wch: 25 }, // Unit Owner
        { wch: 20 }, // Storage Allocated
        { wch: 20 }, // Storage Consumed
        { wch: 30 }, // Role
        { wch: 40 }, // No of Users
      ];
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Selected Departments");
      XLSX.writeFile(wb, "selected_departments.xlsx");

      setSnackbar({
        open: true,
        message: `Successfully exported ${selectedItems.length} departments`,
        severity: "success",
      });
      setSelected([]);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Error exporting selected departments",
        severity: "error",
      });
    }
  };

  const cleanDisplay = (val) => {
    if (!val) return "";
    const [num, unit] = val.trim().split(/\s+/); // splits "25.00 GB" → ["25.00", "GB"]
    const rounded = parseFloat(num);
    return `${
      Number.isInteger(rounded) ? rounded : Math.floor(rounded)
    }${unit}`;
  };

  // Debounce searchQuery → debouncedSearchQuery (300ms delay)
  // NEW: also reset page to 0 (MUI 0-based → API page=1) when search changes
  useEffect(() => {
    if (isFirstRender.current) {
      // Skip the first update to avoid double-firing on mount
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(0); // reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isFirstRender.current) return;
    fetchDepartments();
  }, [page, rowsPerPage, debouncedSearchQuery, searchColumn]);

  useEffect(() => {
    if (isFirstRender.current) return;
    const timer = setTimeout(() => {
      setDebouncedUserSearchQuery(userSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  useEffect(() => {
    if (!showAddDepartment) return; // Only fetch if drawer is open
    loadMoreUsers(true);
  }, [debouncedUserSearchQuery, showAddDepartment]);

  useEffect(() => {
    // Initial data fetch - ONLY departments on mount
    fetchDepartments();

    // Set first render to false AFTER initiating fetches
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    if (isFirstRender.current) return;
    const timer = setTimeout(() => {
      setDebouncedSearchModerator(searchModerator);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchModerator]);

  useEffect(() => {
    if (editDialogOpen) {
      loadFilteredUsers(true);
    }
  }, [debouncedSearchModerator, editDialogOpen]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100% ",
        marginLeft: "80px",
        marginTop: "12px",
        marginRight: "18px",
        overflow: "hidden",

        bgcolor: "#f5f5f5", // Whitesmoke background for the main container
        borderRadius: "20px",
        boxShadow: "2px 1px 11px 5px rgba(0, 0, 0, 0.2)!important",
        animation: "slideInFromLeft 0.3s ease-in-out forwards",
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
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 120px)",
          height: "calc(100vh - 120px)",
          backgroundColor: "#ffffff",
          "& .MuiTableHead-root": {
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#ffff",
            boxShadow: "0 1px 2px 0 rgba(59, 52, 52, 0.05)",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            backgroundColor: "#ffff",

            borderBottom: "2px solid #94a3b8",
            fontSize: "0.875rem",
            fontWeight: "700 !important",
            color: "#475569",
            height: "30px",
            padding: "2px 16px",
          },
          "& .MuiTableCell-root": {
            padding: "8px 16px",
            fontSize: "0.8125rem",
            color: "#334155",
            borderBottom: "1px solid #e2e8f0",
          },
          "& .MuiTable-root": {
            borderSpacing: 0,
            border: "1px solid #e2e8f0",
          },
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          sx={{
            mb: 2,
            px: 2,
            mt: 1,
            backgroundColor: "#fff", // match table's background
            borderRadius: 2,
            py: 1.5,
          }}
        >
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
                height: 30,
                "& .MuiInputBase-root": {
                  height: 30,
                  fontSize: "0.8rem",
                },
              }}
            >
              <InputLabel>Filter By</InputLabel>
              <Select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                label="Filter By"
              >
                {/* OLD values (row object keys) - COMMENTED OUT */}
                {/* <MenuItem value="name">Unit</MenuItem> */}
                {/* <MenuItem value="departmentModerator">Owner</MenuItem> */}
                {/* <MenuItem value="displayName">Short Name</MenuItem> */}
                {/* NEW values match API searchColumn params */}
                <MenuItem value="deptname">Unit</MenuItem>
                <MenuItem value="shortname">Display Name</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 250,
                height: 30,
                "& .MuiInputBase-root": {
                  height: 30,
                  fontSize: "0.8rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Tooltip title="Show/Hide Columns">
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Columns
              </Button>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                style: {
                  maxHeight: 320,
                  width: "200px",
                },
              }}
            >
              {allColumns.map((col) => (
                <MenuItem key={col.id}>
                  <Checkbox
                    checked={visibleColumns[col.id]}
                    onChange={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col.id]: !prev[col.id],
                      }))
                    }
                  />
                  {col.label}
                </MenuItem>
              ))}
            </Menu>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setSearchQuery("")}
              disabled={!searchQuery.trim()}
              sx={{
                whiteSpace: "nowrap",
                height: 30,
                fontSize: "0.75rem",
                padding: "0 12px",
              }}
            >
              ✖ CLEAR
            </Button>
          </Box>
        </Box>

        <Table
          sx={{
            border: "0px solid #e2e8f0 !important",
            "& .MuiTableCell-root": {
              padding: "8px 12px", // ✅ consistent default padding
              height: "40px",
              fontSize: "14px",
            },
            "& .MuiTableCell-head": {
              fontWeight: "bold",
              color: "#444",
              backgroundColor: "#f8fafc",
              whiteSpace: "nowrap", // ✅ prevent header text wrapping
            },
          }}
        >
          <TableHead className={styles.tableHeader}>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{ width: "48px", textAlign: "center" }}
              >
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < sortedDepartments.length
                  }
                  checked={
                    sortedDepartments.length > 0 &&
                    selected.length === sortedDepartments.length
                  }
                  onChange={() => setSelectAllData(true)}
                  inputProps={{ "aria-label": "select all departments" }}
                  size="small"
                />
              </TableCell>

              {visibleColumns.name && (
                <TableCell sx={{ width: "120px" }}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Unit
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.displayName && (
                <TableCell sx={{ width: "150px" }}>
                  <TableSortLabel
                    active={orderBy === "displayName"}
                    direction={orderBy === "displayName" ? order : "asc"}
                    onClick={() => handleRequestSort("displayName")}
                  >
                    Display Name
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.owner && (
                <TableCell sx={{ width: "200px" }}>
                  <TableSortLabel
                    active={orderBy === "departmentModerator"}
                    direction={
                      orderBy === "departmentModerator" ? order : "asc"
                    }
                    onClick={() => handleRequestSort("departmentModerator")}
                  >
                    Owner
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.storage && (
                <TableCell sx={{ width: "150px" }}>Storage</TableCell>
              )}

              {visibleColumns.manageStorage && (
                <TableCell sx={{ width: "150px" }}>Manage Storage</TableCell>
              )}

              {visibleColumns.users && (
                <TableCell sx={{ width: "150px" }}>
                  <TableSortLabel
                    active={orderBy === "noOfUsers"}
                    direction={orderBy === "noOfUsers" ? order : "asc"}
                    onClick={() => handleRequestSort("noOfUsers")}
                  >
                    Users
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.users && (
                <TableCell sx={{ width: "150px" }}>
                  <TableSortLabel
                    active={orderBy === "noOfRoles"}
                    direction={orderBy === "noOfRoles" ? order : "asc"}
                    onClick={() => handleRequestSort("noOfRoles")}
                  >
                    Roles
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.actions && (
                <TableCell sx={{ width: "150px", textAlign: "center" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length + 1}
                  align="center"
                  sx={{ py: 6, border: 0 }}
                >
                  <CircularProgress size={36} />
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments1?.map((dept, index) => {
                const isItemSelected = isSelected(dept.name);
                return (
                  <React.Fragment key={index}>
                    <StyledTableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                      sx={{ cursor: "default" }}
                    >
                      <TableCell
                        padding="checkbox"
                        sx={{ textAlign: "center" }}
                      >
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          size="small"
                          onChange={(event) => handleClick(event, dept.name)}
                        />
                      </TableCell>

                      {visibleColumns.name && (
                        <TableCell>{dept.name}</TableCell>
                      )}

                      {visibleColumns.displayName && (
                        <TableCell>{dept.displayName}</TableCell>
                      )}

                      {visibleColumns.owner && (
                        <TableCell>{dept.departmentModerator}</TableCell>
                      )}

                      {visibleColumns.storage && (
                        <TableCell>{dept.storage}</TableCell>
                      )}

                      {visibleColumns.manageStorage && (
                        <TableCell>
                          <Select
                            value={dept.allowedStorage}
                            onChange={(e) =>
                              handleStorageChange(dept.name, e.target.value)
                            }
                            sx={{
                              width: "100px",
                              height: "30px",
                              borderRadius: "28px",
                            }}
                          >
                            {getStorageOptions(dept.allowedStorage).map(
                              (option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ),
                            )}
                          </Select>
                        </TableCell>
                      )}

                      {visibleColumns.users && (
                        <TableCell align="center">
                          <DeptUsersDropdown
                            users={(dept.users || []).map((u) => ({
                              id: u.objectId,
                              name: u.fullName,
                              roleName: u.role,
                            }))}
                            totalUserCount={dept.userCount}
                            departmentId={dept.id}
                            departmentName={dept.name}
                            owner={dept.departmentModerator}
                            departmentRoles={dept.roles.map((role) => ({
                              // COMMENTED OUT: role.id doesn't exist in API — API uses roleId
                              // id: role.id,
                              id: role.roleId,
                              name: role.roleName,
                            }))}
                            // onEditUser={(user) =>}
                            // onDeleteUser={(user) =>

                            // }
                            addUsersToDepartment={async (
                              deptId,
                              selectedUsers,
                            ) => {
                              try {
                                const payload = selectedUsers.map((u) => [
                                  u.id,
                                  u.role.id,
                                ]); // ✅ backend expects [userId, roleId]

                                const response = await axios.post(
                                  `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/addInExisting/${deptId}`,
                                  payload,
                                  {
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${sessionStorage.getItem(
                                        "authToken",
                                      )}`,
                                      username:
                                        sessionStorage.getItem("adminEmail"),
                                    },
                                  },
                                );

                                if (response.status === 200) {
                                  setSnackbar({
                                    open: true,
                                    message: "Users added successfully!",
                                    severity: "success",
                                  });

                                  if (fetchDepartments)
                                    await fetchDepartments();
                                } else {
                                  setSnackbar({
                                    open: true,
                                    message: `Failed to add users: ${response.statusText}`,
                                    severity: "error",
                                  });
                                }
                              } catch (error) {
                                console.error("Failed to add users:", error);
                                if (
                                  error.response &&
                                  error.response.status === 401
                                ) {
                                  window.dispatchEvent(
                                    new CustomEvent("session-expired", {
                                      detail: {
                                        message:
                                          "Your session has expired. Please login again to continue.",
                                      },
                                    }),
                                  );
                                  return;
                                }
                                const backendMsg =
                                  error?.response?.data &&
                                  typeof error.response.data === "string"
                                    ? error.response.data
                                    : error.message;
                                setSnackbar({
                                  open: true,
                                  message: backendMsg,
                                  severity: "error",
                                });
                              }
                            }}
                          />
                        </TableCell>
                      )}

                      {visibleColumns.roles && (
                        <TableCell align="center">
                          <DeptRolesDropdown
                            roles={dept.roles || []}
                            totalRoleCount={dept.rolesCount ?? 0}
                            selectedDepartment={dept}
                            handleAddRole={async (
                              newRole,
                              appRole,
                              department,
                            ) => {
                              try {
                                const response = await axios.post(
                                  `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/${department.name}/roles`,
                                  [{ roleName: newRole, appRole: appRole }],
                                  {
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${sessionStorage.getItem(
                                        "authToken",
                                      )}`,
                                      username:
                                        sessionStorage.getItem("adminEmail"),
                                    },
                                  },
                                );

                                if (response.status === 200) {
                                  setSnackbar({
                                    open: true,
                                    message: `Role "${newRole}" added successfully!`,
                                    severity: "success",
                                  });

                                  if (fetchDepartments)
                                    await fetchDepartments();
                                } else {
                                  setSnackbar({
                                    open: true,
                                    message: `Failed to add role: ${response.statusText}`,
                                    severity: "error",
                                  });
                                }
                              } catch (error) {
                                console.error("Failed to add role:", error);
                                if (
                                  error.response &&
                                  error.response.status === 401
                                ) {
                                  window.dispatchEvent(
                                    new CustomEvent("session-expired", {
                                      detail: {
                                        message:
                                          "Your session has expired. Please login again to continue.",
                                      },
                                    }),
                                  );
                                  return;
                                }
                                const backendMsg =
                                  error?.response?.data &&
                                  typeof error.response.data === "string"
                                    ? error.response.data
                                    : error.message;
                                setSnackbar({
                                  open: true,
                                  message: backendMsg,
                                  severity: "error",
                                });
                              }
                            }}
                            // NEW: PUT /tenants/roles — update existing role
                            handleUpdateRole={async (
                              roleId,
                              newRoleName,
                              appRole,
                              department,
                            ) => {
                              try {
                                const response = await axios.put(
                                  `${window.__ENV__.REACT_APP_ROUTE}/tenants/roles`,
                                  {
                                    roleId: roleId,
                                    roleName: newRoleName,
                                    departmentId: department.id || "",
                                    appRole: appRole,
                                  },
                                  {
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${sessionStorage.getItem(
                                        "authToken",
                                      )}`,
                                      username:
                                        sessionStorage.getItem("adminEmail"),
                                    },
                                  },
                                );

                                if (response.status === 200) {
                                  setSnackbar({
                                    open: true,
                                    message: `Role "${newRoleName}" updated successfully!`,
                                    severity: "success",
                                  });
                                  if (fetchDepartments)
                                    await fetchDepartments();
                                } else {
                                  setSnackbar({
                                    open: true,
                                    message: `Failed to update role: ${response.statusText}`,
                                    severity: "error",
                                  });
                                }
                              } catch (error) {
                                console.error("Failed to update role:", error);
                                if (
                                  error.response &&
                                  error.response.status === 401
                                ) {
                                  window.dispatchEvent(
                                    new CustomEvent("session-expired", {
                                      detail: {
                                        message:
                                          "Your session has expired. Please login again to continue.",
                                      },
                                    }),
                                  );
                                  return;
                                }
                                setSnackbar({
                                  open: true,
                                  message: `Error: ${error.message}`,
                                  severity: "error",
                                });
                              }
                            }}
                          />
                        </TableCell>
                      )}

                      {visibleColumns.actions && (
                        <TableCell sx={{ textAlign: "center" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            {deptAdmin && !superAdmin ? (
                              <>
                                <Tooltip title="Only Super Admin can perform action">
                                  <span>
                                    <IconButton size="small" disabled>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Only Super Admin can perform action">
                                  <span>
                                    <IconButton size="small" disabled>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditDepartment(dept)}
                                  sx={{
                                    color: "#1976d2",
                                    "&:hover": {
                                      backgroundColor: "#e3f2fd",
                                      color: "#1565c0",
                                    },
                                  }}
                                  title="Edit Unit"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDepartmentToDelete(dept);
                                    setDeleteDialogOpen(true);
                                  }}
                                  sx={{
                                    color: "#d32f2f",
                                    "&:hover": {
                                      backgroundColor: "#ffebee",
                                      color: "#c62828",
                                    },
                                  }}
                                  title="Delete Department"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </StyledTableRow>

                    <StyledTableRow>
                      <TableCell
                        style={{
                          paddingBottom: 0,
                          paddingTop: 0,
                          borderBottom: "none",
                          height: "auto",
                        }}
                        colSpan={7}
                      >
                        <ClickAwayListener
                          onClickAway={() =>
                            setOpenRows((prev) => ({ ...prev, [index]: false }))
                          }
                        >
                          <Collapse
                            in={openRows[index]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                left: "75%",
                                transform: "translateX(-50%)",
                                width: "250px",
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                zIndex: 3,
                                marginTop: "4px",
                                maxHeight: "240px",
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { width: "6px" },
                                "&::-webkit-scrollbar-thumb": {
                                  backgroundColor: "#cbd5e1",
                                  borderRadius: "4px",
                                },
                              }}
                            >
                              <Table size="small" aria-label="roles">
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      sx={{
                                        backgroundColor: "#f1f5f9",
                                        fontWeight: 600,
                                        color: "#475569",
                                        fontSize: "0.75rem",
                                        borderBottom: "1px solid #e2e8f0",
                                      }}
                                    >
                                      Role Name
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{
                                        backgroundColor: "#f1f5f9",
                                        fontWeight: 600,
                                        color: "#475569",
                                        fontSize: "0.75rem",
                                        borderBottom: "1px solid #e2e8f0",
                                        width: "60px",
                                      }}
                                    >
                                      Actions
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {dept.roles.map((role, roleIndex) => (
                                    <TableRow
                                      key={roleIndex}
                                      sx={{
                                        "&:hover": {
                                          backgroundColor: "rgba(0,0,0,0.02)",
                                        },
                                        "& td": {
                                          borderBottom:
                                            roleIndex === dept.roles.length - 1
                                              ? "none"
                                              : "1px solid #e2e8f0",
                                        },
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          padding: "6px 12px",
                                          fontSize: "0.75rem",
                                          color: "#334155",
                                        }}
                                      >
                                        {role.roleName}
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{ padding: "4px 8px" }}
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleDeleteRole(
                                              dept.name,
                                              roleIndex,
                                            )
                                          }
                                          sx={{
                                            padding: "2px",
                                            color: "error.main",
                                            "&:hover": {
                                              backgroundColor: "error.lighter",
                                            },
                                          }}
                                          title="Delete Role"
                                        >
                                          <DeleteIcon
                                            sx={{ fontSize: "0.875rem" }}
                                          />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </ClickAwayListener>
                      </TableCell>
                    </StyledTableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "#ffffff",

          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <TablePagination
          rowsPerPageOptions={[10, 20, 30, 50, 100]}
          component="div"
          count={totalDepartments}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "row-reverse",
            pr: 2,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBulkUpload}
            accept=".xlsx,.xls"
            style={{ display: "none" }}
          />

          {deptAdmin && !superAdmin ? (
            <Tooltip
              title="Only Super Admin can add Department"
              placement="left"
            >
              <span>
                <SpeedDial
                  ariaLabel="Department actions"
                  icon={<Add />}
                  onClick={() => setShowAddDepartment(true)}
                  direction="left"
                  FabProps={{
                    disabled: true,
                    sx: {
                      bgcolor: "#9e9e9e", // greyed out
                      width: 37,
                      height: 30,
                      "& .MuiSpeedDialIcon-root": {
                        fontSize: "1.2rem",
                        color: "white",
                      },
                      "&:hover": { backgroundColor: "#9e9e9e" }, // keep grey on hover
                    },
                  }}
                />
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Add Unit" placement="left">
              <SpeedDial
                ariaLabel="Department actions"
                icon={<Add />}
                onClick={() => setShowAddDepartment(true)}
                direction="left"
                FabProps={{
                  sx: {
                    bgcolor: "orange",
                    "&:hover": {
                      backgroundColor: "orange", // Keep the background color on hover
                      animation: "glowBorder 1.5s ease-in-out infinite", // Apply glowing animation on hover
                    },
                    width: 37,
                    height: 30,
                    "& .MuiSpeedDialIcon-root": {
                      fontSize: "1.2rem",
                      color: "white",
                    },
                  },
                }}
              />
            </Tooltip>
          )}

          {selected.length > 0 && (
            <Tooltip title="Bulk Download" placement="left">
              <SpeedDial
                ariaLabel="Bulk Download"
                icon={<FileDownloadIcon />}
                direction="left"
                color="primary"
                FabProps={{
                  sx: {
                    width: 37,
                    height: 30,
                    "& .MuiSpeedDialIcon-root": {
                      fontSize: "1.2rem",
                      color: "white",
                    },
                  },
                }}
                onClick={() => handleBulkDownloadSelected(selected)}
              />
            </Tooltip>
          )}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "1000px",
            height: "65vh",
            maxHeight: "65vh",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
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
                display: "flex",
                alignItems: "center",
                fontFamily: '"Be Vietnam", sans-serif',
                color: "#fff",
              }}
            >
              Create New Unit
            </Typography>

            <IconButton
              onClick={() => setShowAddDepartment(false)}
              size="small"
              sx={{
                color: "#fff",
                width: 32,
                height: 32,
                border: "1px solid",
                borderColor: "#fff",
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
          </Box>

          <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            {newDepartments.map((dept, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: "#f5f5f5",
                      px: 2,
                      py: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpand(index)}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {dept.name ? dept.name : "Untitled Unit"}
                      {dept.storage ? ` / ${dept.storage}` : ""}
                    </Typography>

                    <Box>
                      {newDepartments.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDepartment(index);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                      {expandedIndices.includes(index) ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </Box>
                  </Box>

                  <Collapse
                    in={expandedIndices.includes(index)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label={
                              <>
                                Unit Name{" "}
                                <span style={{ color: "red" }}>*</span>
                              </>
                            }
                            value={dept.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              const hasInvalidChar = /[^A-Za-z0-9.-]/.test(
                                value,
                              );

                              if (value.length <= 32) {
                                updateDepartmentField(index, "name", value);
                                setDuplicateDepartmentError(false);
                                checkDuplicateDepartment(value);
                              }

                              updateDepartmentField(
                                index,
                                "hasInvalidChar",
                                hasInvalidChar,
                              );
                            }}
                            inputProps={{ maxLength: 32 }}
                            error={
                              (!dept.name && dept.submitted) ||
                              dept.isDuplicate ||
                              duplicateDepartmentError ||
                              dept.name.length > 32 ||
                              dept.hasInvalidChar
                            }
                            helperText={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span>
                                  {!dept.name && dept.submitted
                                    ? "Required"
                                    : dept.hasInvalidChar
                                      ? "Only letters, numbers, dots (.), and - are allowed"
                                      : dept.isDuplicate ||
                                          duplicateDepartmentError
                                        ? "Already exists"
                                        : dept.name.length > 32
                                          ? "Max 32 characters"
                                          : ""}
                                </span>
                                <span>{dept.name?.length || 0}/32</span>
                              </Box>
                            }
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label={
                              <>
                                Unit Short Name{" "}
                                <span style={{ color: "red" }}>*</span>
                              </>
                            }
                            value={dept.displayName}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              const hasSpecialChar = /[^A-Z0-9]/.test(value);
                              const validValue = value.replace(
                                /[^A-Z0-9]/g,
                                "",
                              );

                              if (validValue.length <= 8) {
                                updateDepartmentField(
                                  index,
                                  "displayName",
                                  validValue,
                                );
                                checkDuplicateShortName(validValue);
                              }

                              updateDepartmentField(
                                index,
                                "hasSpecialChar",
                                hasSpecialChar,
                              );
                            }}
                            error={
                              (!dept.displayName && dept.submitted) ||
                              duplicateShortNameError ||
                              dept.displayName.length > 8 ||
                              dept.hasSpecialChar
                            }
                            helperText={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span>
                                  {!dept.displayName && dept.submitted
                                    ? "Required"
                                    : duplicateShortNameError
                                      ? "Already exists"
                                      : dept.displayName.length > 8
                                        ? "Max 8 characters"
                                        : dept.hasSpecialChar
                                          ? "Special characters not allowed"
                                          : ""}
                                </span>
                                <span>{dept.displayName?.length || 0}/8</span>
                              </Box>
                            }
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <FormControl
                            fullWidth
                            size="small"
                            error={!dept.storage && dept.submitted}
                          >
                            <InputLabel>
                              Storage Allocation{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <Select
                              value={dept.storage}
                              onChange={(e) =>
                                updateDepartmentField(
                                  index,
                                  "storage",
                                  e.target.value,
                                )
                              }
                              input={
                                <OutlinedInput label="Storage Allocation" />
                              }
                            >
                              {[1, 2, 25, 50, 75, 100, 150, 200].map((size) => (
                                <MenuItem key={size} value={`${size} GB`}>
                                  {size} GB
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              {!dept.storage && dept.submitted
                                ? "Required"
                                : ""}
                            </FormHelperText>
                          </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                          <Autocomplete
                            size="small"
                            fullWidth
                            filterOptions={(x) => x}
                            options={userOptions}
                            getOptionLabel={(option) => option.email || ""}
                            loading={isSearchingUsers}
                            onInputChange={(event, newInputValue, reason) => {
                              if (reason === "input" || reason === "clear") {
                                setUserSearchQuery(newInputValue);
                              }
                            }}
                            value={
                              userOptions.find(
                                (u) => u.email === dept.departmentModerator,
                              ) || null
                            }
                            // COMMENTED OUT: only set departmentModerator, didn't auto-set permission
                            // onChange={(event, newValue) =>
                            //   updateDepartmentField(
                            //     index,
                            //     "departmentModerator",
                            //     newValue?.email || ""
                            //   )
                            // }
                            // NEW: owner is always ADMIN — auto-set permission when owner is selected/cleared
                            onChange={(event, newValue) => {
                              updateDepartmentField(
                                index,
                                "departmentModerator",
                                newValue?.email || "",
                              );
                              updateDepartmentField(
                                index,
                                "permission",
                                newValue ? "ADMIN" : "",
                              );
                            }}
                            ListboxProps={{
                              onScroll: (event) => {
                                const listboxNode = event.currentTarget;
                                if (
                                  listboxNode.scrollTop +
                                    listboxNode.clientHeight >=
                                  listboxNode.scrollHeight - 50
                                ) {
                                  loadMoreUsers();
                                }
                              },
                              style: { maxHeight: 250 },
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={
                                  <>
                                    Unit Owner{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </>
                                }
                                error={
                                  !dept.departmentModerator && dept.submitted
                                }
                                helperText={
                                  !dept.departmentModerator && dept.submitted
                                    ? "Required"
                                    : ""
                                }
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <React.Fragment>
                                      {isSearchingUsers ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </React.Fragment>
                                  ),
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            label={
                              <>
                                Role <span style={{ color: "red" }}>*</span>
                              </>
                            }
                            value={dept.role || "UNIT_ADMIN"}
                            disabled
                            fullWidth
                            size="small"
                            error={!dept.role?.trim() && dept.submitted}
                            helperText={
                              !dept.role?.trim() && dept.submitted
                                ? "Required"
                                : ""
                            }
                          />
                        </Grid>

                        <Grid item xs={6}>
                          {/* COMMENTED OUT: permission was user-editable — owner must always be ADMIN */}
                          {/* <FormControl fullWidth size="small">
                            <InputLabel>Permission</InputLabel>
                            <Select
                              value={dept.permission || ""}
                              onChange={(e) =>
                                updateDepartmentField(
                                  index,
                                  "permission",
                                  e.target.value
                                )
                              }
                              label="Permission"
                            >
                              <MenuItem value="ADMIN">ADMIN</MenuItem>
                              <MenuItem value="VIEWER">VIEWER</MenuItem>
                              <MenuItem value="EDITOR">EDITOR</MenuItem>
                              <MenuItem value="COMMENTOR">COMMENTOR</MenuItem>
                              <MenuItem value="CONTRIBUTOR">CONTRIBUTOR</MenuItem>
                              <MenuItem value="NO_ROLE">NO_ROLE</MenuItem>
                            </Select>
                          </FormControl> */}
                          {/* NEW: disabled — always ADMIN, auto-set when owner is selected */}
                          <FormControl fullWidth size="small">
                            <InputLabel>Permission</InputLabel>
                            <Select
                              value={dept.permission || ""}
                              label="Permission"
                              disabled
                            >
                              <MenuItem value="ADMIN">ADMIN</MenuItem>
                              <MenuItem value="VIEWER">VIEWER</MenuItem>
                              <MenuItem value="EDITOR">EDITOR</MenuItem>
                              <MenuItem value="COMMENTOR">COMMENTOR</MenuItem>
                              <MenuItem value="CONTRIBUTOR">
                                CONTRIBUTOR
                              </MenuItem>
                              <MenuItem value="NO_ROLE">NO_ROLE</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              onClick={addMoreDepartment}
              sx={{ mt: 1 }}
            >
              + Add More Unit
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 2,
              borderTop: "1px solid #eee",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Download Template">
                <IconButton onClick={handleTemplateDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bulk Upload">
                <IconButton onClick={() => fileInputRef.current?.click()}>
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              variant="contained"
              onClick={handleAddDepartment}
              sx={{ background: "rgb(251, 68, 36)" }}
            >
              Add All
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Drawer
        anchor="left"
        open={showAddRoleDialog}
        onClose={() => {
          setShowAddRoleDialog(false);
          setNewRole("");
        }}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "absolute",
            top: "30%",
            left: "40%",

            m: 0,
            height: "auto", // dynamic height
            maxHeight: "95vh", // prevent it from overflowin
            overflow: "hidden", // avoid extra scrollbars
            width: "350px",
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
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "primary.main",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffff" }}>
            Add Role to {selectedDepartment?.name}
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              setShowAddRoleDialog(false);
              setNewRole("");
            }}
            sx={{
              color: "#ffff",
              border: "1px solid",
              borderColor: "#ffff",
              bgcolor: "error.lighter",
              "&:hover": {
                transform: "rotate(180deg)",
              },
              transition: "all 0.3s ease",
              borderRadius: "50%",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, flexGrow: 1 }}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="New Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            onClick={() => {
              setShowAddRoleDialog(false);
              setNewRole("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddRole}
            variant="contained"
            color="primary"
            sx={{ background: "rgb(251, 68, 36)" }}
          >
            Add
          </Button>
        </Box>
      </Drawer>

      <Drawer
        anchor="left"
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSearchModerator(""); // reset search input
          setFilteredUsers([]); // clear old results
          setShowUserDropdown(false); // close dropdown
          setFilteredPage(0); // reset pagination
          setHasMoreFilteredUsers(true); // reset scroll
        }}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "1000px",
            height: "65vh",
            maxHeight: "65vh",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
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
                display: "flex",
                alignItems: "center",
                fontFamily: '"Be Vietnam", sans-serif',
                color: "#fff",
              }}
            >
              Edit Unit
            </Typography>

            <IconButton
              onClick={() => {
                setEditDialogOpen(false);
                setSearchModerator("");
                setFilteredUsers([]);
                setShowUserDropdown(false);
                setFilteredPage(0);
                setHasMoreFilteredUsers(true);
              }}
              size="small"
              sx={{
                color: "#fff",
                width: 32,
                height: 32,
                border: "1px solid",
                borderColor: "#fff",
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
          </Box>

          <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Tooltip title="Unit Name cannot be edited" arrow>
                    <TextField
                      fullWidth
                      size="small"
                      label="Unit Name"
                      value={editedDepartment?.name || ""}
                      disabled
                      helperText="This field is locked"
                    />
                  </Tooltip>

                  <TextField
                    size="small"
                    label="Display Name"
                    fullWidth
                    required
                    value={editedDepartment?.displayName || ""}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      const validValue = value.replace(/[^A-Z0-9]/g, "");
                      if (validValue.length <= 8) {
                        setEditedDepartment((prev) => ({
                          ...prev,
                          displayName: validValue,
                        }));
                      }
                    }}
                    inputProps={{ maxLength: 8 }}
                    helperText={
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <span>
                          {editedDepartment?.displayName?.length || 0}/8
                        </span>
                      </Box>
                    }
                  />

                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Unit Owner"
                      value={editedDepartment?.departmentModerator || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="Search New Owner"
                      value={searchModerator}
                      onFocus={() => {
                        setShowUserDropdown(true);
                        if (filteredUsers.length === 0) {
                          loadFilteredUsers(true);
                        }
                      }}
                      onChange={(e) => {
                        setSearchModerator(e.target.value);
                      }}
                      inputRef={anchorRef}
                      autoComplete="off"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {isSearchingFilteredUsers ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Popper
                      open={showUserDropdown}
                      anchorEl={anchorRef.current}
                      placement="bottom-start"
                      transition
                      disablePortal
                      modifiers={[
                        {
                          name: "zIndex",
                          enabled: true,
                          phase: "write",
                          fn({ state }) {
                            state.styles.popper.zIndex = 1600;
                          },
                        },
                      ]}
                    >
                      {({ TransitionProps }) => (
                        <Grow {...TransitionProps}>
                          <Paper
                            sx={{
                              width: 300,
                              maxHeight: 200, // limit dropdown height ~5 items
                              overflowY: "auto",
                              borderRadius: 1,
                              mt: 1,
                            }}
                          >
                            <ClickAwayListener
                              onClickAway={(event) => {
                                if (
                                  anchorRef.current &&
                                  anchorRef.current.contains(event.target)
                                ) {
                                  return;
                                }
                                setShowUserDropdown(false);
                              }}
                            >
                              <Box
                                sx={{
                                  maxHeight: 200,
                                  overflowY: "auto",
                                }}
                                onScroll={(event) => {
                                  const {
                                    scrollTop,
                                    clientHeight,
                                    scrollHeight,
                                  } = event.currentTarget;
                                  if (
                                    scrollTop + clientHeight >=
                                    scrollHeight - 50
                                  ) {
                                    loadFilteredUsers();
                                  }
                                }}
                              >
                                {/* {isSearchingFilteredUsers && filteredUsers.length === 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                                  <CircularProgress size={24} />
                                </Box>
                              )} */}

                                {filteredUsers.map((user, index) => (
                                  <MenuItem
                                    key={index}
                                    onClick={() => {
                                      setEditedDepartment((prev) => ({
                                        ...prev,
                                        departmentModerator: user.name,
                                      }));
                                      setSearchModerator(user.name);
                                      setShowUserDropdown(false);
                                    }}
                                  >
                                    {user.name}
                                  </MenuItem>
                                ))}

                                {isSearchingFilteredUsers &&
                                  filteredUsers.length > 0 && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        p: 1,
                                      }}
                                    >
                                      <CircularProgress size={20} />
                                    </Box>
                                  )}

                                {filteredUsers.length === 0 &&
                                  !isSearchingFilteredUsers && (
                                    <MenuItem disabled>No users found</MenuItem>
                                  )}
                              </Box>
                            </ClickAwayListener>
                          </Paper>
                        </Grow>
                      )}
                    </Popper>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0",
              bgcolor: "#fff",
            }}
          >
            <Button
              variant="contained"
              onClick={handleUpdateDepartment}
              sx={{
                background: "rgb(251, 68, 36)",
                "&:hover": {
                  background: "rgb(220, 50, 20)",
                },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
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
              display: "flex",
              alignItems: "center",
              fontFamily: '"Be Vietnam", sans-serif',
              color: "#fff",
            }}
          >
            Confirm Delete
          </Typography>

          <IconButton
            onClick={() => setDeleteDialogOpen(false)}
            size="small"
            sx={{
              color: "#fff",
              width: 32,
              height: 32,
              border: "1px solid",
              borderColor: "#fff",
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

        <DialogContent sx={{ py: 3, px: 2, mt: 2 }}>
          <Typography variant="body1" sx={{ color: "#334155" }}>
            Are you sure you want to delete{" "}
            <Typography
              component="span"
              sx={{ fontWeight: "bold", color: "#dc2626" }}
            >
              {departmentToDelete?.name}
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Button
            onClick={handleDeleteDepartment}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              fontSize: "0.9rem",
              fontWeight: "bold",
              background: "rgb(251, 68, 36)", // ✅ custom background
              "&:hover": {
                background: "rgb(220, 50, 20)", // darker shade on hover
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Migrate Users
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Migrate users from <b>{departmentToMigrate?.name}</b> to:
          </Typography>

          <Box
            sx={{
              maxHeight: 250,
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 1,
              mt: 1,
              p: 1,
              bgcolor: "#f9f9f9",
            }}
            onScroll={(e) => {
              const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
              if (scrollTop + clientHeight >= scrollHeight - 50) {
                loadMoreDepartments(); // fetch more
              }
            }}
          >
            {allDepartments
              .filter((d) => d.deptName !== departmentToMigrate?.name)
              .map((dept) => (
                <MenuItem
                  key={dept.deptName}
                  selected={targetDepartment === dept.deptName}
                  onClick={() => setTargetDepartment(dept.deptName)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor:
                      targetDepartment === dept.deptName
                        ? "#e3f2fd"
                        : "transparent",
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {dept.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dept.deptName}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMigrationDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!targetDepartment) {
                setSnackbar({
                  open: true,
                  message: "Please select a target department.",
                  severity: "error",
                });
                return;
              }

              setSnackbar({
                open: true,
                message: `Users migrated to ${targetDepartment}`,
                severity: "success",
              });
              setMigrationDialogOpen(false);
            }}
          >
            Migrate
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editRoleDialog}
        onClose={() => setEditRoleDialog(false)}
        maxWidth="xs"
      >
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            variant="outlined"
            value={editingRole.value}
            onChange={(e) =>
              setEditingRole((prev) => ({ ...prev, value: e.target.value }))
            }
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={selectAllData}
        onClose={() => setSelectAllData(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2", // Material UI blue[700]
            color: "white",
            fontWeight: "bold",
          }}
        >
          Select Departments
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Do you want to select all departments or just those on the current
            page?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectAllData(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const currentIds = sortedDepartments.map((d) => d.name);
              setSelected(currentIds);
              setRowData(sortedDepartments);
              setSelectAllData(false);
            }}
          >
            Select Current Page ({sortedDepartments.length})
          </Button>
          <Button
            color="error"
            onClick={async () => {
              try {
                setLoading(true);
                const first = await getDepartments(0, rowsPerPage);
                let allDepartments = [...first.content];
                const totalPages = first.totalPages;

                const promises = [];
                for (let i = 1; i < totalPages; i++) {
                  promises.push(getDepartments(i, rowsPerPage));
                }

                const results = await Promise.all(promises);
                results.forEach((res) => {
                  allDepartments.push(...res.content);
                });

                const mapped = allDepartments.map((dept) => ({
                  id: dept.id, // 👈 add this
                  name: dept.deptName,
                  displayName: dept.deptDisplayName,
                  departmentModerator:
                    dept.deptModerator || dept.permissions?.deptUsername || "",
                  storage: dept.permissions?.displayStorage || "0 GB",
                  allowedStorage:
                    dept.permissions?.allowedStorageInBytesDisplay || "0 GB",
                  roles: dept.roles?.map((r) => r.roleName) || [],
                  userCount: dept.numberOfUsers || 0,
                  isActive: dept.permissions?.active || false,
                  createdAt: dept.createdOn,
                }));

                setSelected(mapped.map((d) => d.name));
                setRowData(mapped);
                setSelectAllData(false);
              } catch (error) {
                console.error("Error selecting all departments:", error);
                setSnackbar({
                  open: true,
                  message: "Failed to fetch all departments",
                  severity: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            Select All Departments
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showAddUserDialog}
        onClose={() => setShowAddUserDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.main",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Add User(s) to {selectedDepartment?.deptName}
        </DialogTitle>
        <DialogContent>
          {addUserAssignments.map((assignment, index) => (
            <Box key={index} sx={{ mb: 1, mt: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    options={userOptions}
                    getOptionLabel={(option) =>
                      option.email || option.name || ""
                    }
                    loading={isSearchingUsers}
                    onInputChange={(event, newInputValue) => {
                      setUserSearchQuery(newInputValue);
                    }}
                    value={assignment.user}
                    onChange={(event, newValue) => {
                      const updated = [...addUserAssignments];
                      updated[index].user = newValue;
                      setAddUserAssignments(updated);
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select User"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {isSearchingUsers ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
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
                  />
                </Grid>

                <Grid
                  item
                  xs={5}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "nowrap", // keep in single line
                  }}
                >
                  <FormControl size="small" sx={{ width: 140, flexShrink: 0 }}>
                    <InputLabel id={`role-label-${index}`}>Role</InputLabel>
                    <Select
                      labelId={`role-label-${index}`}
                      value={assignment.role}
                      onChange={(e) => {
                        const updated = [...addUserAssignments];
                        updated[index].role = e.target.value;
                        setAddUserAssignments(updated);
                      }}
                      input={<OutlinedInput label="Role" />}
                    >
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Editor">Editor</MenuItem>
                      <MenuItem value="Viewer">Viewer</MenuItem>
                      <MenuItem value="Collaborator">Collaborator</MenuItem>
                      <MenuItem value="noRole">No Role</MenuItem>
                    </Select>
                  </FormControl>

                  {assignment.role && assignment.role !== "noRole" && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.8rem",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {`[${(assignment.role === "Admin"
                        ? [
                            "Read",
                            "Write",
                            "Delete",
                            "Share",
                            "UserAdmin",
                            "Comment",
                            "Upload",
                          ]
                        : assignment.role === "Editor"
                          ? [
                              "Read",
                              "Write",
                              "Delete",
                              "Share",
                              "Comment",
                              "Upload",
                            ]
                          : assignment.role === "Viewer"
                            ? ["Read", "Comment"]
                            : assignment.role === "Collaborator"
                              ? ["Read", "Share", "Comment", "Upload"]
                              : []
                      ).join(", ")}]`}
                    </Typography>
                  )}

                  {addUserAssignments.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => {
                        setAddUserAssignments(
                          addUserAssignments.filter((_, i) => i !== index),
                        );
                      }}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Tooltip title="Add More Users">
              <Fab
                color="primary"
                size="small"
                onClick={() =>
                  setAddUserAssignments((prev) => [
                    ...prev,
                    { user: null, role: "" },
                  ])
                }
              >
                <Add />
              </Fab>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddUserDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowAddUserDialog(false);
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={1000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ zIndex: 5000 }} // ✅ Makes Snackbar appear on top of all dialogs/drawers
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%", whiteSpace: "pre-wrap" }}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
}

export default Department;
