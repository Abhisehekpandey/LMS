import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
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
} from "@mui/material";
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
import * as XLSX from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Switch from "@mui/material/Switch";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { ManageAccounts as ManageAccountsIcon } from "@mui/icons-material";

// Add this import with other imports
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function Department({ departments, setDepartments, onThemeToggle }) {
  // Add pagination state
  const [page, setPage] = useState(0);
  // const [rowsPerPage] = useState(9);
  const [rowsPerPage, setRowsPerPage] = useState(25); // Default to 25 rows

  const [openRows, setOpenRows] = useState({});

  // Add sorting state
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");

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
    initialRole: "",
    storage: "50GB", // Default storage value
    submitted: false,
  });

  // Add after other state declarations
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Add after other state declarations
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [editedDepartment, setEditedDepartment] = useState(null);

  // Add these new state variables after other state declarations
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState({
    departmentIndex: null,
    roleIndex: null,
    value: "",
  });

  // Add this handler function
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };
  // Add these new handler functions
  const handleEditRole = (deptIndex, roleIndex, currentRole) => {
    setEditingRole({
      departmentIndex: deptIndex,
      roleIndex: roleIndex,
      value: currentRole,
    });
    setEditRoleDialog(true);
  };

  const handleDeleteRole = (deptIndex, roleIndex) => {
    const department = sortedDepartments[deptIndex];
    if (department.roles.length <= 1) {
      setSnackbar({
        open: true,
        message:
          "Cannot delete the last role. Department must have at least one role.",
        severity: "error",
      });
      return;
    }

    setDepartments((prev) =>
      prev.map((dept, idx) =>
        idx === deptIndex
          ? { ...dept, roles: dept.roles.filter((_, i) => i !== roleIndex) }
          : dept
      )
    );

    setSnackbar({
      open: true,
      message: "Role deleted successfully",
      severity: "success",
    });
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
      prev.map((dept, idx) =>
        idx === editingRole.departmentIndex
          ? {
              ...dept,
              roles: dept.roles.map((role, i) =>
                i === editingRole.roleIndex ? editingRole.value : role
              ),
            }
          : dept
      )
    );

    setEditRoleDialog(false);
    setSnackbar({
      open: true,
      message: "Role updated successfully",
      severity: "success",
    });
  };

  // Add handleSnackbarClose function
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBulkDownload = () => {
    try {
      const exportData = departments.map((dept) => ({
        Department: dept.name,
        "Display Name": dept.displayName,
        "Storage Allocated": dept.storage || "50GB", // Add storage field
        "Number of Roles": dept.roles.length,
        Roles: dept.roles.join(", "),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add column widths
      const wscols = [
        { wch: 25 }, // Department
        { wch: 15 }, // Display Name
        { wch: 20 }, // Storage Allocated
        { wch: 15 }, // Number of Roles
        { wch: 40 }, // Roles
      ];
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Departments");
      XLSX.writeFile(wb, "departments.xlsx");

      setSnackbar({
        open: true,
        message: "Departments exported successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error exporting departments",
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
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Update validation to include Storage Allocated
          const isValidData = jsonData.every(
            (row) =>
              row.Department &&
              row["Display Name"] &&
              row["Storage Allocated"] &&
              row.Roles
          );

          if (!isValidData) {
            setSnackbar({
              open: true,
              message: "Invalid file format. Please use the correct template.",
              severity: "error",
            });
            return;
          }

          // Update department mapping to include storage
          const updatedDepartments = jsonData.map((row) => ({
            name: row.Department,
            displayName: row["Display Name"],
            storage: row["Storage Allocated"] || "50GB", // Include storage with default
            roles: row.Roles.split(",").map((role) => role.trim()),
          }));

          // Merge with existing departments
          const mergedDepartments = [...(departments || [])];
          updatedDepartments.forEach((newDept) => {
            const existingDeptIndex = mergedDepartments.findIndex(
              (d) => d.name === newDept.name
            );
            if (existingDeptIndex === -1) {
              mergedDepartments.push(newDept);
            } else {
              // Update existing department with new data
              const existingRoles = new Set(
                mergedDepartments[existingDeptIndex].roles
              );
              newDept.roles.forEach((role) => existingRoles.add(role));
              mergedDepartments[existingDeptIndex] = {
                ...mergedDepartments[existingDeptIndex],
                storage: newDept.storage, // Update storage
                roles: Array.from(existingRoles),
              };
            }
          });

          setDepartments(mergedDepartments);
          setSnackbar({
            open: true,
            message: `Successfully uploaded ${updatedDepartments.length} departments`,
            severity: "success",
          });
        } catch (error) {
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
      setSnackbar({
        open: true,
        message: "Error uploading file",
        severity: "error",
      });
    }

    // Clear the file input
    event.target.value = "";
  };

  // Add pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowToggle = (index) => {
    setOpenRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Add sorting handler
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Add sorting function
  const sortedDepartments = React.useMemo(() => {
    if (!departments) return [];

    return [...departments].sort((a, b) => {
      if (orderBy === "roles") {
        return order === "asc"
          ? a.roles.length - b.roles.length
          : b.roles.length - a.roles.length;
      }

      return order === "asc"
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    });
  }, [departments, order, orderBy]);


  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "transparent",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "rgba(0, 0, 0, 0.02)",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04) !important",
    },
    "& .MuiTableCell-root": {
      padding: "2px 8px",
      height: "32px",
      fontSize: "0.875rem",
      color: "#333",
      borderBottom: "1px solid #e0e0e0",
      whiteSpace: "nowrap",
    },
    // Remove any margin or padding between rows
    margin: 0,
    borderSpacing: 0,
    transition: "background-color 0.1s ease",
  }));

  // Add this function after other handlers
  const handleAddDepartment = () => {
    setNewDepartment((prev) => ({ ...prev, submitted: true }));

    if (
      !newDepartment.name ||
      !newDepartment.displayName ||
      !newDepartment.initialRole ||
      !newDepartment.storage
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    if (departments.some((dept) => dept.name === newDepartment.name)) {
      setSnackbar({
        open: true,
        message: "Department already exists",
        severity: "error",
      });
      return;
    }

    const newDeptWithRole = {
      name: newDepartment.name,
      displayName: newDepartment.displayName,
      roles: [newDepartment.initialRole],
      storage: newDepartment.storage,
    };

    const updatedDepartments = [...departments, newDeptWithRole];
    setDepartments(updatedDepartments);

    // Store in localStorage
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));

    // setDepartments((prev) => [...prev, newDeptWithRole]);
    setShowAddDepartment(false);
    setNewDepartment({
      name: "",
      displayName: "",
      initialRole: "",
      storage: "50GB",
      submitted: false,
    });
    setSnackbar({
      open: true,
      message: `Department "${newDepartment.name}" added successfully with role "${newDepartment.initialRole}"!`,
      severity: "success",
    });
  };

  // Add new handler function
  const handleAddRole = () => {
    if (!newRole.trim()) {
      setSnackbar({
        open: true,
        message: "Role name cannot be empty",
        severity: "error",
      });
      return;
    }

    if (selectedDepartment.roles.includes(newRole.trim())) {
      setSnackbar({
        open: true,
        message: "Role already exists in this department",
        severity: "error",
      });
      return;
    }

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.name === selectedDepartment.name
          ? { ...dept, roles: [...dept.roles, newRole.trim()] }
          : dept
      )
    );

    setSnackbar({
      open: true,
      message: `Role "${newRole}" added to department "${selectedDepartment.name}"`,
      severity: "success",
    });
    setNewRole("");
    setShowAddRoleDialog(false);
  };

  // Add after other handler functions
  const handleDepartmentToggle = (dept) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.name === dept.name ? { ...d, isActive: !d.isActive } : d
      )
    );
    setSnackbar({
      open: true,
      message: `Department "${dept.name}" ${
        !dept.isActive ? "activated" : "deactivated"
      }`,
      severity: "success",
    });
  };

  const handleEditDepartment = (dept) => {
    setEditedDepartment({
      ...dept,
      originalName: dept.name,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteDepartment = () => {
    setDepartments((prev) =>
      prev.filter((d) => d.name !== departmentToDelete.name)
    );
    setDeleteDialogOpen(false);
    setSnackbar({
      open: true,
      message: `Department "${departmentToDelete.name}" deleted successfully`,
      severity: "success",
    });
    setDepartmentToDelete(null);
  };

 

  const handleTemplateDownload = () => {
    const template = [
      {
        Department: "Example Department",
        "Display Name": "EXD",
        "Storage Allocated": "50GB", // Add storage field
        Roles: "Role1, Role2, Role3",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);

    // Add column widths
    const wscols = [
      { wch: 25 }, // Department
      { wch: 15 }, // Display Name
      { wch: 20 }, // Storage Allocated
      { wch: 40 }, // Roles
    ];
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "department_upload_template.xlsx");
  };
  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: 0,
          transition: "margin-left 0.3s",
          overflow: "hidden",
        }}
      >
        <Navbar onThemeToggle={onThemeToggle} />
        {/* <Box sx={{ p: 3, marginLeft: "50px", overflow: "hidden" }}> */}
        <Box
         
          sx={{
            p: 0,
            marginLeft: "64px", // Keep the sidebar margin
            marginTop: "24px", // Add top margin for Navbar separation
            marginRight: "24px", // Add right margin
            overflow: "hidden",
            height: "calc(100vh - 64px)", // Adjust height to account for top margin
          }}
        >
          
          <TableContainer
            component={Paper}
            
            sx={{
              height: "calc(100vh - 96px)", // Adjust for the new top margin
              "& .MuiTableHead-root": {
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiTableHead-root .MuiTableCell-root": {
                padding: "1px 8px",
                height: "20px",
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
                borderBottom: "2px solid #ddd",
              },
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px", // Add slight border radius
              overflow: "auto",
              position: "relative",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell sx={{ width: "200px", padding: "1px 8px" }}> */}
                  <TableCell sx={{ 
  width: "200px", 
  padding: "2px 8px",
  height: "32px",
  fontWeight: "bold",
  color: "#444",
}}>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleRequestSort("name")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Department
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell sx={{ 
  width: "200px", 
  padding: "2px 8px",
  height: "32px",
  fontWeight: "bold",
  color: "#444",
}}>
                    <TableSortLabel
                      active={orderBy === "displayName"}
                      direction={orderBy === "displayName" ? order : "asc"}
                      onClick={() => handleRequestSort("displayName")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Short Name
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell sx={{ 
  width: "200px", 
  padding: "2px 8px",
  height: "32px",
  fontWeight: "bold",
  color: "#444",
}}>
                    <Typography variant="body1" fontWeight="bold">
                      Storage Allocated
                    </Typography>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell sx={{ 
  width: "200px", 
  padding: "2px 8px",
  height: "32px",
  fontWeight: "bold",
  color: "#444",
}}>
                    <TableSortLabel
                      active={orderBy === "roles"}
                      direction={orderBy === "roles" ? order : "asc"}
                      onClick={() => handleRequestSort("roles")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Number of Roles
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell sx={{ width: "150px", padding: "1px 8px" }}> */}
                  <TableCell sx={{ 
  width: "200px", 
  padding: "2px 8px",
  height: "32px",
  fontWeight: "bold",
  color: "#444",
}}>
                    <Typography variant="body1" fontWeight="bold">
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDepartments
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((dept, index) => (
                    <React.Fragment key={index}>
                      <StyledTableRow key={index}>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell>{dept.displayName}</TableCell>
                        <TableCell>{dept.storage}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {dept.roles.length}
                            <IconButton
                              size="small"
                              onClick={() => handleRowToggle(index)}
                            >
                              {openRows[index] ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setShowAddRoleDialog(true);
                              }}
                              sx={{
                                "&:hover": {
                                  color: "primary.main",
                                },
                              }}
                              title="Add New Role"
                            >
                              <ManageAccountsIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Switch
                              size="small"
                              checked={dept.isActive}
                              onChange={() => handleDepartmentToggle(dept)}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#1976d2", // Brighter blue
                                },
                                "& .MuiSwitch-track": {
                                  backgroundColor: "#90caf9", // Light blue track
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleEditDepartment(dept)}
                              sx={{
                                color: "#1976d2", // Brighter blue
                                "&:hover": {
                                  backgroundColor: "#e3f2fd", // Light blue background on hover
                                  color: "#1565c0", // Darker blue on hover
                                },
                                padding: "8px",
                              }}
                              title="Edit Department"
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
                                color: "#d32f2f", // Brighter red
                                "&:hover": {
                                  backgroundColor: "#ffebee", // Light red background on hover
                                  color: "#c62828", // Darker red on hover
                                },
                                padding: "8px",
                              }}
                              title="Delete Department"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                      <StyledTableRow key={index}>
                        {/* <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={1}
                        > */}
                        <TableCell 
  style={{ 
    paddingBottom: 0, 
    paddingTop: 0, 
    borderBottom: "none" ,
    height: "auto",
  }} 
  colSpan={5}
>
                          <Collapse
                            in={openRows[index]}
                            timeout="auto"
                            unmountOnExit
                          >
                            {/* <Box sx={{ margin: 1 }}> */}
                            <Box sx={{ 
      margin: 0,
      backgroundColor: "rgba(0, 0, 0, 0.01)",
      borderRadius: 0,
      padding: 0
    }}>
                              {/* <List dense> */}
                              {/* <List dense sx={{ padding: 0 }}> */}
                              <List dense sx={{ 
        padding: 0,
        margin: 0,
        "& .MuiListItem-root": {
          padding: "2px 8px",
          minHeight: "32px",
          borderBottom: "1px solid #f0f0f0"
        }
      }}>
                                {dept.roles.map((role, roleIndex) => (
                                  <ListItem
                                    key={roleIndex}
                                    sx={{
                                      height: "32px",
                                      "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                      },
                                    }}
                                    secondaryAction={
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                          // edge="end"
                                          size="small"
                                          onClick={() =>
                                            handleEditRole(
                                              index,
                                              roleIndex,
                                              role
                                            )
                                          }
                                          // sx={{
                                          //   "&:hover": {
                                          //     color: "primary.main",
                                          //   },
                                          // }}
                                          sx={{
                                            padding: "4px",
                                            "& .MuiSvgIcon-root": {
                                              fontSize: "1.1rem",
                                            },
                                          }}
                                          title="Edit Role"
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          // edge="end"
                                          size="small"
                                          onClick={() =>
                                            handleDeleteRole(index, roleIndex)
                                          }
                                          // sx={{
                                          //   "&:hover": {
                                          //     color: "error.main",
                                          //   },
                                          // }}
                                          sx={{
                                            padding: "4px",
                                            "& .MuiSvgIcon-root": {
                                              fontSize: "1.1rem",
                                            },
                                          }}
                                          title="Delete Role"
                                        >
                                          <DeleteIcon
                                            fontSize="small"
                                            color="error"
                                          />
                                        </IconButton>
                                      </Box>
                                    }
                                  >
                                    <ListItemText
                                      primary={role}
                                      sx={{ marginLeft: 2 }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </StyledTableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={departments?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage} // Add this line
            rowsPerPageOptions={[25, 50]}
            sx={{
              position: "sticky",
              bottom: 0,
              bgcolor: "white",
              borderTop: "1px solid #ddd",
              "& .MuiToolbar-root": {
                height: "36px",
                minHeight: "36px",
                paddingLeft: "16px",
                paddingRight: "16px",
              },
              "& .MuiTablePagination-select": {
                paddingTop: 0,
                paddingBottom: 0,
              },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ position: "fixed", bottom: 48, right: 16, zIndex: 1000 }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleBulkUpload}
          accept=".xlsx,.xls"
          style={{ display: "none" }}
        />
        <SpeedDial
          ariaLabel="Department actions"
          icon={<FolderIcon />}
          direction="left"
          FabProps={{
            sx: {
              bgcolor: "blue",
              "&:hover": {
                bgcolor: "blue",
              },
              width: 25,
              height: 25,
              "& .MuiSpeedDialIcon-root": {
                fontSize: "1.2rem",
                color: "white",
              },
            },
          }}
        >
          <SpeedDialAction
            icon={<UploadFileIcon sx={{ fontSize: "1.2rem" }} />}
            tooltipTitle="Bulk Upload"
            onClick={() => fileInputRef.current?.click()}
            FabProps={{
              sx: {
                bgcolor: "yellow",
                "&:hover": {
                  bgcolor: "yellow",
                },
                width: 20,
                height: 20,
                "& .MuiIcon-root": {
                  fontSize: "1.2rem",
                },
              },
            }}
          />
          <SpeedDialAction
            icon={<DownloadIcon />}
            tooltipTitle="Bulk Download"
            onClick={handleBulkDownload}
            FabProps={{
              sx: {
                bgcolor: "yellow",
                "&:hover": {
                  bgcolor: "yellow",
                },
                width: 20,
                height: 20,
                "& .MuiIcon-root": {
                  fontSize: "1.2rem",
                },
              },
            }}
          />
          <SpeedDialAction
            icon={<AddBusinessIcon sx={{ fontSize: "1.2rem" }} />}
            tooltipTitle="Add Department"
            onClick={() => setShowAddDepartment(true)}
            FabProps={{
              sx: {
                bgcolor: "yellow",
                "&:hover": {
                  bgcolor: "yellow",
                },
                width: 20,
                height: 20,
                "& .MuiIcon-root": {
                  fontSize: "1.2rem",
                },
              },
            }}
          />

          <SpeedDialAction
            icon={<DownloadIcon />}
            tooltipTitle="Download Template"
            onClick={handleTemplateDownload}
            FabProps={{
              sx: {
                bgcolor: "yellow",
                "&:hover": {
                  bgcolor: "yellow",
                },
                width: 20,
                height: 20,
                "& .MuiIcon-root": {
                  fontSize: "1.2rem",
                },
              },
            }}
          />
        </SpeedDial>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add Department Dialog */}
      <Dialog
        open={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        maxWidth="sm"
      >
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              size="small"
              label="Department Name"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              fullWidth
              required
              error={!newDepartment.name && newDepartment.submitted}
              helperText={
                !newDepartment.name && newDepartment.submitted
                  ? "Department name is required"
                  : ""
              }
            />
            <FormControl fullWidth size="small">
              <InputLabel id="storage-label">Storage Allocation</InputLabel>
              <Select
                labelId="storage-label"
                value={newDepartment.storage || "50GB"}
                label="Storage Allocation"
                onChange={(e) =>
                  setNewDepartment((prev) => ({
                    ...prev,
                    storage: e.target.value,
                  }))
                }
                required
                error={!newDepartment.storage && newDepartment.submitted}
              >
                {[25, 50, 75, 100, 150, 200].map((size) => (
                  <MenuItem key={size} value={`${size}GB`}>
                    {size} GB
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Display Name"
              value={newDepartment.displayName}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  displayName: e.target.value.toUpperCase(),
                }))
              }
              required
              error={!newDepartment.displayName && newDepartment.submitted}
              helperText={
                !newDepartment.displayName && newDepartment.submitted
                  ? "Display name is required"
                  : "Short form"
              }
            />
            <TextField
              size="small"
              label="Initial Role"
              value={newDepartment.initialRole}
              onChange={(e) =>
                setNewDepartment((prev) => ({
                  ...prev,
                  initialRole: e.target.value,
                }))
              }
              required
              error={!newDepartment.initialRole && newDepartment.submitted}
              helperText={
                !newDepartment.initialRole && newDepartment.submitted
                  ? "At least one role is required"
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddDepartment(false);
              setNewDepartment({
                name: "",
                displayName: "",
                initialRole: "",
                storage: "50GB",
                submitted: false,
              });
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddDepartment} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showAddRoleDialog}
        onClose={() => {
          setShowAddRoleDialog(false);
          setNewRole("");
        }}
        maxWidth="xs"
      >
        <DialogTitle>Add Role to {selectedDepartment?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Role"
            fullWidth
            variant="outlined"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddRoleDialog(false);
              setNewRole("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddRole} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              size="small"
              label="Department Name"
              value={editedDepartment?.name || ""}
              onChange={(e) =>
                setEditedDepartment((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              fullWidth
              required
            />
            <TextField
              size="small"
              label="Display Name"
              value={editedDepartment?.displayName || ""}
              onChange={(e) =>
                setEditedDepartment((prev) => ({
                  ...prev,
                  displayName: e.target.value.toUpperCase(),
                }))
              }
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setDepartments((prev) =>
                prev.map((d) =>
                  d.name === editedDepartment.originalName
                    ? { ...editedDepartment, name: editedDepartment.name }
                    : d
                )
              );
              setEditDialogOpen(false);
              setSnackbar({
                open: true,
                message: "Department updated successfully",
                severity: "success",
              });
            }}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete department "{departmentToDelete?.name}
          "? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDepartment} color="error">
            Delete
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
    </Box>
  );
}

export default Department;
