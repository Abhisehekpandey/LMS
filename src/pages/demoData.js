// ** React Import
import { useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Grid,
  Paper,
  SpeedDial,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import {
  Block,
  Delete,
  DeleteForever,
  FileDownload,
  PersonAdd,
  PowerSettingsNew,
  SaveOutlined,
  WifiProtectedSetup,
} from "@mui/icons-material";

const rows = [
  {
    id: 1,
    userName: "jdoe.jsbs",
    name: "John Doe",
    department: "Engineering",
    role: "Developer",
    userEmail: "john.doe@example.com",
    storageUsed: "50GB",
    tools: "aaa",
  },
  {
    id: 2,
    userName: "j.smith",
    name: "Jane Smith",
    department: "Marketing",
    role: "Manager",
    userEmail: "jane.smith@example.com",
    storageUsed: "30GB",
    tools: "bbbb",
  },
  {
    id: 3,
    userName: "ajohn.son",
    name: "Alice Johnson",
    department: "Sales",
    role: "Sales Rep",
    userEmail: "alice.johnson@example.com",
    storageUsed: "20GB",
    tools: "ccc",
  },
  {
    id: 4,
    userName: "bbrown.ssn",
    name: "Bob Brown",
    department: "HR",
    role: "HR Manager",
    userEmail: "bob.brown@example.com",
    storageUsed: "10GB",
    tools: "ddd",
  },
  {
    id: 5,
    userName: "bbrown.bns",
    name: "Bob Brown123",
    department: "HR",
    role: "HR Manager",
    userEmail: "bob111.brown@example.com",
    storageUsed: "10GB",
    tools: "eeee",
  },
  {
    id: 6,
    userName: "cblack.snsns",
    name: "Charlie Black",
    department: "Finance",
    role: "Analyst",
    userEmail: "charlie.black@example.com",
    storageUsed: "15GB",
    tools: "fff",
  },
  {
    id: 7,
    userName: "dprince.sss",
    name: "Diana Prince",
    department: "IT",
    role: "Support",
    userEmail: "diana.prince@example.com",
    storageUsed: "25GB",
    tools: "gggg",
  },
  {
    id: 8,
    userName: "ehunt.ns",
    name: "Ethan Hunt",
    department: "Operations",
    role: "Manager",
    userEmail: "ethan.hunt@example.com",
    storageUsed: "40GB",
    tools: "hhhh",
  },
  {
    id: 9,
    userName: "fglen.snsn",
    name: "Fiona Glenanne",
    department: "Marketing",
    role: "Executive",
    userEmail: "fiona.glenanne@example.com",
    storageUsed: "35GB",
    tools: "iii",
  },
  {
    id: 10,
    userName: "gclooney.sss",
    name: "George Clooney",
    department: "Sales",
    role: "Director",
    userEmail: "george.clooney@example.com",
    storageUsed: "45GB",
    tools: "jjjj",
  },
  {
    id: 11,
    userName: "hmontana.sbsj",
    name: "Hannah Montana",
    department: "HR",
    role: "Recruiter",
    userEmail: "hannah.montana@example.com",
    storageUsed: "5GB",
    tools: "kkkk",
  },
];

const UserTable = ({
  changesMade,

  handleSaveChanges,
  handleMigrationClick,
  deactivateAll,
  activateAll,
  handleDeleteAll,
  OpenUserDialog,
  handleBulkDownload,
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [singleRowDetails, setSingleRowDetails] = useState({});
  const [hoverdRowId, setHoveredId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 7,
  });
  const [selectedDeleteRow, setSelectedDeleteRow] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false); // State for confirmation dialog

  const confirmDelete = () => {};

  const cancelDelete = () => {
    setDeleteDialog(false); // Close the dialog
  };

  const columns = [
    {
      flex: 0.1,
      field: "userName",
      headerName: "USER NAME",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const { row } = params;
        const isRowHovered = hoverdRowId === row.id;

        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                noWrap
                variant="body2"
                sx={{
                  color: "#302f2fcf",
                  fontWeight: 600,
                }}
              >
                {row.userName}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      flex: 0.1,
      field: "name",
      headerName: "NAME",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const { row } = params;
        const isRowHovered = hoverdRowId === row.id;

        return (
          <Typography
            variant="body2"
            sx={{
              color: "#302f2fcf",
              fontWeight: 600,
            }}
          >
            {row.name}
          </Typography>
        );
      },
    },
    {
      flex: 0.12,
      headerName: "DEPARTMENT",
      field: "department",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const { row } = params;
        const isRowHovered = hoverdRowId === row.id;

        return (
          <Box sx={{ alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#302f2fcf",
                fontWeight: 600,
              }}
            >
              {params.row.department}
            </Typography>
          </Box>
        );
      },
    },
    {
      flex: 0.12,
      field: "role",
      headerName: "ROLE",
      textAlign: "right",
      align: "center",
      headerAlign: "center",

      renderCell: (params) => {
        const { row } = params;
        const isRowHovered = hoverdRowId === row.id;

        return (
          <Box sx={{ flexDirection: "column" }}>
            <Typography
              noWrap
              variant="body2"
              sx={{
                color: "#302f2fcf",
                fontWeight: 600,
              }}
            >
              {params.row.role}
            </Typography>
          </Box>
        );
      },
    },
    {
      flex: 0.12,
      field: "userEmail",
      headerName: "USER EMAIL",
      textAlign: "right",
      align: "center",
      headerAlign: "center",

      renderCell: (params) => {
        const { row } = params;
        const isRowHovered = hoverdRowId === row.id;

        return (
          <Box sx={{ flexDirection: "column" }}>
            <Typography
              noWrap
              variant="body2"
              sx={{
                color: "#302f2fcf",
                fontWeight: 600,
              }}
            >
              {params.row.userEmail}
            </Typography>
          </Box>
        );
      },
    },
    {
      flex: 0.1,
      sortable: false,
      field: "storageUsed",
      headerName: "STORAGE USED",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => (
        <Box sx={{ flexDirection: "column" }}>
          <Typography
            noWrap
            variant="body2"
            sx={{
              color: "#302f2fcf",
              fontWeight: 600,
            }}
          >
            {row.storageUsed}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.1,
      sortable: false,
      field: "manageStorage",
      headerName: "Manage STORAGE",
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const storageOptions = ["10GB", "20GB", "50GB", "100GB"]; // Example storage options

        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Autocomplete
              value={selectedStorage[row.id] || row.manageStorage}
              onChange={(event, newValue) => {
                setSelectedStorage((prev) => ({ ...prev, [row.id]: newValue }));
              }}
              size="small"
              defaultValue="1 GB"
              sx={{
                ".MuiInputBase-root": {
                  paddingTop: "0px !important",
                  paddingBottom: "0px !important",
                  paddingLeft: " 0px !important",
                  //   width: "fit-content",
                },
              }}
              options={storageOptions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  sx={{ width: 150 }}
                  size="small"
                />
              )}
              isOptionEqualToValue={(option, value) => option === value} // Custom equality check
              disableClearable
            />
          </Box>
        );
      },
    },
    {
      flex: 0.1,
      sortable: false,
      field: "tools",
      headerName: "TOOLS",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => (
        <Box sx={{ flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              onClick={(e) => handleDelete(e, row)}
              sx={{ padding: "4px" }}
            >
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Box>
        </Box>
      ),
    },
  ];

  const handleDelete = (e, row) => {
    setSelectedDeleteRow(row);
    setDeleteDialog(true);
  };
  const handleRowClick = (params) => {
    const clickedRowId = params.row.id;

    // If the clicked row is already selected, deselect it, else select it
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(clickedRowId)) {
        return prevSelectedIds.filter((id) => id !== clickedRowId);
      } else {
        return [...prevSelectedIds, clickedRowId];
      }
    });

    setSingleRowDetails(params); // Optionally store details of the clicked row
  };

  return (
    <>
      <Paper elevation={24}>
        <Grid>
          <Grid item xs={12}>
            <DataGrid
              sx={{
                height: "91vh",
                ".MuiDataGrid-footerContainer": {
                  justifyContent: "flex-start",
                },
              }}
              rows={filteredData.length ? filteredData : rows}
              columns={columns}
              columnHeaderHeight={40}
              checkboxSelection // Condition to enable checkbox selection based on the selected row count
              onRowClick={handleRowClick}
              getRowId={(row) => row.id}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedIds(newSelection);
              }}
              pagination
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[7, 10, 25, 50]}
              slotProps={{
                baseButton: {
                  size: "medium",
                  variant: "outlined",
                },
                row: {
                  onMouseEnter: (event) => {
                    const id = event.currentTarget.dataset.id;
                    const hoveredRow = (
                      filteredData.length ? filteredData : rows
                    ).find((row) => row.id == id);
                    setHoveredId(id);
                  },
                  onMouseLeave: () => {
                    setHoveredId(null);
                  },
                },
              }}
            />
          </Grid>
          <div style={{ display: "flex" }}>
            {selectedIds.length > 1 && (
              <>
                <Tooltip title="Download Selected Users" placement="top">
                  <SpeedDial
                    ariaLabel="Download selected"
                    icon={<FileDownload />}
                    direction="left"
                    FabProps={{
                      size: "small",
                      sx: {
                        boxShadow:
                          "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow

                        position: "absolute",
                        right: 65,
                        bottom: 15,
                        bgcolor: "#2e7d32",
                        "&:hover": {
                          bgcolor: "#1b5e20",
                        },
                      },
                    }}
                    onClick={() => {
                      handleBulkDownload();
                      //   setSelected([]);
                    }}
                  />
                </Tooltip>

                <Tooltip title="Delete Selected Users" placement="top">
                <IconButton
                    sx={{
                        boxShadow:
                          "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow

                        position: "absolute",
                        right: 245,
                        bottom: 15,
                        bgcolor: "#d32f2f",
                        "&:hover": {
                          bgcolor: "#c62828",
                        },
                    }}
                    onClick={handleDeleteAll}
                  >
                    <DeleteForever sx={{ color: "white" }} />
                  </IconButton>
                
                </Tooltip>

                <Tooltip title="Activate Selected Users" placement="top">
                  <IconButton
                    sx={{
                        bgcolor: "#388e3c",
                        "&:hover": {
                          bgcolor: "#2e7d32",
                        },
                      boxShadow:
                        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                      position: "absolute",
                      right: 200,
                      bottom: 15,
                    }}
                    onClick={activateAll}
                  >
                    <PowerSettingsNew sx={{ color: "white" }} />
                  </IconButton>
                 
                </Tooltip>

                <Tooltip title="Deactivate Selected Users" placement="top">
                  <IconButton
                    sx={{
                      bgcolor: "#f44336",
                      "&:hover": {
                        bgcolor: "#d32f2f",
                      },
                      boxShadow:
                        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow

                      position: "absolute",
                      right: 155,
                      bottom: 15,
                    }}
                    onClick={deactivateAll}
                  >
                    <Block sx={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* // Add this after your existing SpeedDial components, inside the same Box component */}
            {selectedIds.length >= 1 && (
              <Tooltip title="Migrate Selected Users" placement="top">
                <IconButton
                  sx={{
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow

                    position: "absolute",
                    right: 110,
                    bottom: 15,
                    bgcolor: "#9c27b0",
                    "&:hover": {
                      bgcolor: "#7b1fa2",
                    },
                  }}
                  onClick={handleMigrationClick}
                >
                  <WifiProtectedSetup sx={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            )}

            <Box
              sx={{
                position: "fixed",
                bottom: 100,
                right: 16,
                zIndex: 500,
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  position: "fixed",
                  bottom: 100,
                  right: 16,
                  zIndex: 500,
                }}
              >
                {changesMade && (
                  <Tooltip title="Save All Changes" placement="left">
                    <SpeedDial
                      ariaLabel="Save changes"
                      icon={<SaveOutlined />}
                      direction="left"
                      onClick={handleSaveChanges}
                      FabProps={{
                        size: "small",
                        sx: {
                          bgcolor: "#ffc107",
                          "&:hover": {
                            bgcolor: "#ffb300",
                          },
                          width: 30,
                          height: 30,
                          "& .MuiSpeedDialIcon-root": {
                            fontSize: "1.5rem",
                            color: "rgba(0, 0, 0, 0.87)",
                          },
                        },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>

            {selectedIds.length === 1 && (
              <Tooltip title="Download Selected User" placement="top">
                <SpeedDial
                  ariaLabel="Download selected"
                  icon={<FileDownload />}
                  direction="left"
                  FabProps={{
                    size: "small",
                    sx: {
                      boxShadow:
                        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow

                      position: "absolute",
                      right: 65,
                      bottom: 15,
                      bgcolor: "#2e7d32",
                      "&:hover": {
                        bgcolor: "#1b5e20",
                        animation: "download 1.5s ease-in-out infinite",
                      },
                      "@keyframes download": {
                        "0%": {
                          boxShadow:
                            "0 0 5px #2e7d32, 0 0 10px #2e7d32, 0 0 15px #2e7d32", // Initial glow with #2e7d32
                        },
                        "50%": {
                          boxShadow:
                            "0 0 20px #2e7d32, 0 0 30px #2e7d32, 0 0 40px #2e7d32", // Stronger glow in the middle
                        },
                        "100%": {
                          boxShadow:
                            "0 0 5px #2e7d32, 0 0 10px #2e7d32, 0 0 15px #2e7d32", // Return to initial glow
                        },
                      },
                    },
                  }}
                  onClick={() => {
                    handleBulkDownload();
                    // setSelected([]);
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title="Add New User" placement="top">
              <IconButton sx={{ position: "absolute", right: 7, bottom: 10 }}>
                <span>
                  <Fab
                    sx={{
                      width: "2.7rem",
                      height: "2.4rem", // Adjust height to match width
                      backgroundColor: "rgb(251, 68, 36)", // Solid orange background color
                      boxShadow:
                        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.6)", // Default shadow
                      position: "relative", // To ensure animation works properly
                      "&:hover": {
                        backgroundColor: "rgb(251, 68, 36)", // Keep the background color on hover
                        animation: "glowBorder 1.5s ease-in-out infinite", // Apply glowing animation on hover
                      },
                      "@keyframes glowBorder": {
                        "0%": {
                          boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)", // Start with soft glow
                          borderColor: "transparent", // Initial transparent border
                        },
                        "50%": {
                          boxShadow: "0 0 20px 5px rgba(251, 68, 36, 0.8)", // Stronger glow
                          borderColor: "rgb(251, 68, 36)", // Glowing orange border
                        },
                        "100%": {
                          boxShadow: "0 0 0px 2px rgba(251, 68, 36, 0.5)", // Glow fades out
                          borderColor: "transparent", // Reset to transparent
                        },
                      },
                    }}
                    onClick={OpenUserDialog}
                  >
                    <PersonAdd style={{ fontSize: "1.9rem", color: "#fff" }} />
                  </Fab>
                </span>
              </IconButton>
            </Tooltip>
          </div>
        </Grid>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* Are you sure you want to delete the user "{userToDelete}"? */}
            {selectedIds.length > 0
              ? `Are you sure you want to delete the selected users:${selectedDeleteRow.userName} ?`
              : `Are you sure you want to delete the user "${selectedDeleteRow.userName}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserTable;



<Table>
<TableHead>
  {/* <TableRow sx={{ height: "10px", padding: "2px" }}> */}
  <TableRow>
    {/* Set header row height */}
    <TableCell padding="checkbox" sx={{ width: "40px" }}>
      <Checkbox
        color="primary"
        indeterminate={
          selected.length > 0 &&
          selected.length < filteredRows.length
        }
        checked={
          filteredRows.length > 0 &&
          selected.length === filteredRows.length
        }
        onChange={handleSelectAll}
        inputProps={{
          "aria-label": "select all users",
        }}
        size="small"
      />
    </TableCell>
    {/* <TableCell sx={{ width: "150px", padding: "2px" }}> */}
    <TableCell
      sx={{
        width: "150px",
        fontSize: "0.875rem",
        fontWeight: "bold",
        color: "#444",
      }}
    >
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        <TableSortLabel
          active={orderBy === "username"}
          direction={orderBy === "username" ? order : "asc"}
          onClick={() => handleRequestSort("username")}
        >
          User Name
        </TableSortLabel>
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "150px", padding: "2px" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        <TableSortLabel
          active={orderBy === "name"}
          direction={orderBy === "name" ? order : "asc"}
          onClick={() => handleRequestSort("name")}
        >
          Name
        </TableSortLabel>
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "150px", padding: "2px" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        <TableSortLabel
          active={orderBy === "department"}
          direction={orderBy === "department" ? order : "asc"}
          onClick={() => handleRequestSort("department")}
        >
          Department
        </TableSortLabel>
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "150px", padding: "2px" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        <TableSortLabel
          active={orderBy === "role"}
          direction={orderBy === "role" ? order : "asc"}
          onClick={() => handleRequestSort("role")}
        >
          Role
        </TableSortLabel>
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "200px", padding: "2px" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        <TableSortLabel
          active={orderBy === "email"}
          direction={orderBy === "email" ? order : "asc"}
          onClick={() => handleRequestSort("email")}
        >
          User Email
        </TableSortLabel>
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "150px", padding: "2px" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        <TableSortLabel
          active={orderBy === "storageUsed"}
          direction={orderBy === "storageUsed" ? order : "asc"}
          onClick={() => handleRequestSort("storageUsed")}
        >
          Storage Used
        </TableSortLabel>
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "150px", padding: "2px" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        fontFamily={"sans-serif"}
      >
        Manage Storage
      </Typography>
    </TableCell>
    <TableCell sx={{ width: "140px", padding: "2px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // justifyContent: 'flex-start',
          // gap: 0.5,
          justifyContent: "space-between", // Change from flex-start to space-between
          width: "100%", // Ensure the box takes full width
        }}
      >
        <Typography variant="body1" fontWeight="bold">
          Tools
        </Typography>
        <Box sx={{ ml: 2 }}>
          {" "}
          {/* Add margin to create separation */}
          <IconButton
            onClick={handleFilterClick}
            size="small"
            sx={{
              padding: "2px",
              marginLeft: "4px",
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterChange("All")}>
              All
            </MenuItem>
            <MenuItem
              onClick={() => handleFilterChange("Active")}
            >
              Active
            </MenuItem>
            <MenuItem
              onClick={() => handleFilterChange("Inactive")}
            >
              Inactive
            </MenuItem>
            <MenuItem
              onClick={() => handleFilterChange("Pending")}
            >
              Pending
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {filteredRows.length > 0 ? (
    filteredRows
      .slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
      .map((row) => {
        const isItemSelected = isSelected(row.name);
        return (
          <StyledTableRow
            key={row.name}
            hover
            onMouseEnter={() => handleMouseEnter(row.name)}
            onMouseLeave={handleMouseLeave}
            selected={isItemSelected}
            sx={{
              backgroundColor:
                hoveredRow === row.name
                  ? "rgba(0, 0, 0, 0.04)" // Lighter hover color
                  : "inherit",
              height: "20px",
              transition: "background-color 0.1s ease",
            }}
          >
            <TableCell
              padding="checkbox"
              sx={{ padding: "3px" }}
            >
              <Checkbox
                color="primary"
                checked={isItemSelected}
                onChange={() => handleSelectOne(row.name)}
              />
            </TableCell>
            <TableCell
              sx={{
                padding: "2px 8px",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              {row.username}
            </TableCell>
            {/* 
          <TableCell sx={{ padding: "3px" }}>
            {row.name}
          </TableCell> */}
            <TableCell
              sx={{
                padding: "2px 8px",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              {row.name}
            </TableCell>
            {/* <TableCell sx={{ padding: "3px" }}>
            {row.department}
          </TableCell> */}
            <TableCell
              sx={{
                padding: "2px 8px",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              {row.department}
            </TableCell>
            {/* <TableCell sx={{ padding: "3px" }}>
            {row.role}
          </TableCell> */}
            <TableCell
              sx={{
                padding: "2px 8px",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              {row.role}
            </TableCell>
            {/* <TableCell sx={{ padding: "3px" }}>
            {row.email}
          </TableCell> */}
            <TableCell
              sx={{
                padding: "2px 8px",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              {row.email}
            </TableCell>
            {/* <TableCell sx={{ padding: "3px" }}>
            {row.storageUsed}
          </TableCell> */}
            <TableCell
              sx={{
                padding: "2px 8px",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              {row.storageUsed}
            </TableCell>

            <TableCell
              sx={{
                width: "150px",
                padding: "2px",
                height: "20px",
              }}
            >
              <FormControl
                fullWidth
                size="small"
                disabled={row.storageUsed === "0GB"} // Disable if storage is 0GB
                sx={{
                  minWidth: 80,
                  "& .MuiOutlinedInput-root": {
                    height: "24px",
                    fontSize: "0.875rem",
                    backgroundColor:
                      row.storageUsed === "0GB"
                        ? "#f5f5f5"
                        : "white",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#bdbdbd",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976d2",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                    },
                  },
                  "& .MuiSelect-select": {
                    padding: "2px 8px",
                    paddingRight: "24px !important",
                  },
                }}
              >
                <Select
                  value={row.manageStorage || row.storageUsed}
                  onChange={(e) =>
                    handleStorageChange(
                      row.name,
                      e.target.value
                    )
                  }
                  disabled={row.storageUsed === "0GB"} // Disable if storage is 0GB
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 200,
                        "& .MuiMenuItem-root": {
                          height: "24px",
                          fontSize: "0.875rem",
                          padding: "2px 8px",
                          minHeight: "auto",
                        },
                      },
                    },
                  }}
                >
                  {![1, 2, 3, 5, 10, 15, 20, 25, 50]
                    .map((size) => `${size}GB`)
                    .includes(row.manageStorage) && (
                    <MenuItem
                      value={row.manageStorage}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "#e3f2fd",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "#bbdefb",
                        },
                      }}
                    >
                      {row.manageStorage}
                    </MenuItem>
                  )}

                  {[1, 2, 3, 5, 10, 15, 20, 25, 50].map(
                    (size) => (
                      <MenuItem
                        key={size}
                        value={`${size}GB`}
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: "#e3f2fd",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: "#bbdefb",
                          },
                        }}
                      >
                        {size} GB
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </TableCell>

            <TableCell
              sx={{
                width: "150px",
                padding: "2px",
                height: "20px",
              }}
            >
              {hoveredRow === row.name &&
                !isSelected(row.name) && ( // Only show if row is hovered AND not selected
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      position: "relative",
                      zIndex: 1000,
                    }}
                  >
                    <Tooltip
                      title={
                        (row.status || "pending")
                          .charAt(0)
                          .toUpperCase() +
                        (row.status || "pending").slice(1)
                      }
                      placement="top"
                    >
                      <Box>
                        <Switch
                          checked={row.status === "active"}
                          onChange={(e) => {
                            let newStatus;
                            newStatus = e.target.checked
                              ? "active"
                              : "inactive";
                            handleStatusChange(
                              row.name,
                              newStatus
                            );
                          }}
                          sx={{
                            "& .MuiSwitch-switchBase": {
                              "&.Mui-checked": {
                                color: statusColors.active,
                                "& + .MuiSwitch-track": {
                                  backgroundColor: alpha(
                                    statusColors.active,
                                    0.5
                                  ),
                                },
                              },
                            },
                            "& .MuiSwitch-thumb": {
                              backgroundColor:
                                (row.status || "pending") ===
                                "active"
                                  ? statusColors.active
                                  : (row.status ||
                                      "pending") === "pending"
                                  ? statusColors.pending
                                  : statusColors.inactive,
                            },
                            "& .MuiSwitch-track": {
                              backgroundColor:
                                (row.status || "pending") ===
                                "active"
                                  ? alpha(
                                      statusColors.active,
                                      0.5
                                    )
                                  : (row.status ||
                                      "pending") === "pending"
                                  ? alpha(
                                      statusColors.pending,
                                      0.5
                                    )
                                  : alpha(
                                      statusColors.inactive,
                                      0.5
                                    ),
                            },
                          }}
                          size="small"
                        />
                      </Box>
                    </Tooltip>
                    <IconButton
                      onClick={() => handleEdit(row.name)}
                      disabled={selected.length > 1}
                      sx={{ padding: "4px" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(row.name)}
                      sx={{ padding: "4px" }}
                    >
                      <DeleteIcon
                        fontSize="small"
                        color="error"
                      />
                    </IconButton>
                  </Box>
                )}
              {hoveredRow === row.name &&
                isSelected(row.name) && ( // Only show delete icon when selected
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      onClick={() => handleDelete(row.name)}
                      sx={{ padding: "4px" }}
                    >
                      <DeleteIcon
                        fontSize="small"
                        color="error"
                      />
                    </IconButton>
                  </Box>
                )}
            </TableCell>
          </StyledTableRow>
        );
      })
  ) : (
    <TableRow>
      <TableCell colSpan={9} align="center">
        <Typography variant="h6" color="textSecondary">
          No Users Exist
        </Typography>
      </TableCell>
    </TableRow>
  )}
</TableBody>
</Table>
</TableContainer>
<Box
sx={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
height: "3.5rem",
}}
>
{/* <Box sx={{ position: "fixed", bottom: 16, right: 16 }}> */}
<TablePagination
rowsPerPageOptions={[25, 50]}
component="div"
count={filteredRows.length}
rowsPerPage={rowsPerPage}
page={page}
onPageChange={handleChangePage}
onRowsPerPageChange={handleChangeRowsPerPage}
sx={{
  overflow: "hidden",
  position: "sticky",
  bottom: 0,
  // bgcolor: "white",
  // borderTop: "1px solid #ddd",
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
<Box
sx={{
  position: "absolute",
  bottom: 15,
  right: 16,
  zIndex: 1000,
  display: "flex",
  flexDirection: "column", // Stack items vertically
  alignItems: "flex-end", // Align items to the right
}}
>
<input
  type="file"
  ref={fileInputRef}
  onChange={handleBulkUpload}
  accept=".xlsx,.xls"
  style={{ display: "none" }}
/>
{selected.length === 0 && (
  <Tooltip title="Add New User" placement="left">
    <SpeedDial
      ariaLabel="Add new user"
      icon={<PersonAddIcon />}
      direction="left"
      onClick={() => setOpenAddUserDialog(true)}
      FabProps={{
        size: "small",
        sx: {
          bgcolor: "#1976d2",
          "&:hover": {
            bgcolor: "#1565c0",
          },
        },
      }}
    />
  </Tooltip>
)}

{selected.length === 1 && (
  <Tooltip title="Download Selected User" placement="left">
    <SpeedDial
      ariaLabel="Download selected"
      icon={<FileDownloadIcon />}
      direction="left"
      FabProps={{
        size: "small",
        sx: {
          bgcolor: "#2e7d32",
          "&:hover": {
            bgcolor: "#1b5e20",
          },
          width: 30,
          height: 30,
        },
      }}
      onClick={() => {
        handleBulkDownload();
        setSelected([]);
      }}
    />
  </Tooltip>
)}

{selected.length > 1 && (
  <>
    <Tooltip title="Download Selected Users" placement="left">
      <SpeedDial
        ariaLabel="Download selected"
        icon={<FileDownloadIcon />}
        direction="left"
        FabProps={{
          size: "small",
          sx: {
            bgcolor: "#2e7d32",
            "&:hover": {
              bgcolor: "#1b5e20",
            },
            width: 30,
            height: 30,
          },
        }}
        onClick={() => {
          handleBulkDownload();
          setSelected([]);
        }}
      />
    </Tooltip>

    <Tooltip title="Delete Selected Users" placement="left">
      <SpeedDial
        ariaLabel="Delete selected"
        icon={<DeleteForeverIcon />}
        direction="left"
        FabProps={{
          size: "small",
          sx: {
            bgcolor: "#d32f2f",
            "&:hover": {
              bgcolor: "#c62828",
            },
            width: 30,
            height: 30,
          },
        }}
        onClick={handleDeleteAll}
      />
    </Tooltip>

    <Tooltip title="Activate Selected Users" placement="left">
      <SpeedDial
        ariaLabel="Activate selected"
        icon={<PowerSettingsNewIcon />}
        direction="left"
        FabProps={{
          size: "small",
          sx: {
            bgcolor: "#388e3c",
            "&:hover": {
              bgcolor: "#2e7d32",
            },
            width: 30,
            height: 30,
          },
        }}
        onClick={activateAll}
      />
    </Tooltip>

    <Tooltip title="Deactivate Selected Users" placement="left">
      <SpeedDial
        ariaLabel="Deactivate selected"
        icon={<BlockIcon />}
        direction="left"
        FabProps={{
          size: "small",
          sx: {
            bgcolor: "#f44336",
            "&:hover": {
              bgcolor: "#d32f2f",
            },
            width: 30,
            height: 30,
          },
        }}
        onClick={deactivateAll}
      />
    </Tooltip>
  </>
)}

{/* // Add this after your existing SpeedDial components, inside the same Box component */}
{selected.length >= 1 && (
  <Tooltip title="Migrate Selected Users" placement="left">
    <SpeedDial
      ariaLabel="Migrate selected"
      icon={<WifiProtectedSetupIcon />}
      direction="left"
      FabProps={{
        size: "small",
        sx: {
          bgcolor: "#9c27b0",
          "&:hover": {
            bgcolor: "#7b1fa2",
          },
          width: 30,
          height: 30,
        },
      }}
      onClick={handleMigrationClick}
    />
  </Tooltip>
)}
</Box>

<Box
sx={{
  position: "fixed",
  bottom: 100,
  right: 16,
  zIndex: 500,
  pointerEvents: "none",
}}
>
<Box
  sx={{
    position: "fixed",
    bottom: 100,
    right: 16,
    zIndex: 500,
  }}
>
  {changesMade && (
    <Tooltip title="Save All Changes" placement="left">
      <SpeedDial
        ariaLabel="Save changes"
        icon={<SaveOutlinedIcon />}
        direction="left"
        onClick={handleSaveChanges}
        FabProps={{
          size: "small",
          sx: {
            bgcolor: "#ffc107",
            "&:hover": {
              bgcolor: "#ffb300",
            },
            width: 30,
            height: 30,
            "& .MuiSpeedDialIcon-root": {
              fontSize: "1.5rem",
              color: "rgba(0, 0, 0, 0.87)",
            },
          },
        }}
      />
    </Tooltip>
  )}
</Box>
</Box>
</Box>