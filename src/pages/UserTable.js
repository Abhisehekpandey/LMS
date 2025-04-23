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
