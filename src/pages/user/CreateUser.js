import { Add, Close, Download, Info, UploadFile } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useState } from "react";

const CreateUser = ({ handleClose }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [addDepartment, setAddDepartment] = useState(false);
  const [addRole, setAddRole] = useState(false);

  const handleIconClick = (event, department) => {
    event.stopPropagation(); // Prevent selecting the option
    setSelectedDepartment(department);
    setOpenDialog(true);
  };

  const handleCloseDeptDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment("");
  };

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

  const handleDepartmentChange = (event, newValue) => {
    setSelectedDepartment(newValue);
    setSelectedRole(null); // Reset role and manager when department changes
    setSelectedManager(null);
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

      <DialogContent dividers padding={0}>
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
              label="Username"
              name="username"
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
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
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
          </Grid>
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
              Autocomplete="off"
              size="small"
              id="department-autocomplete"
              options={departments}
              value={selectedDepartment}
              onChange={handleDepartmentChange}
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
                      sx={{
                        fontFamily: '"Be Vietnam", sans-serif',
                      }}
                    >
                      Add New Department
                    </Button>
                  </li>
                  {children}
                </ul>
              )}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  label="Department"
                  InputProps={{
                    ...params.InputProps,
                    sx: { fontFamily: '"Be Vietnam", sans-serif' },
                  }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Be Vietnam", sans-serif' },
                  }}
                />
              )}
            />
          </Grid>
          <Grid xs={4} item>
            <Autocomplete
              size="small"
              Autocomplete="off"
              id="role-autocomplete"
              options={roleOptions}
              value={selectedRole}
              disabled={!selectedDepartment} // 👈 Disable if no department selected
              onChange={(event, newValue) => setSelectedRole(newValue)}
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
                      sx={{
                        fontFamily: '"Be Vietnam", sans-serif',
                      }}
                    >
                      Add New Role
                    </Button>
                  </li>
                  {children}
                </ul>
              )}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  label="Role"
                  InputProps={{
                    ...params.InputProps,
                    sx: { fontFamily: '"Be Vietnam", sans-serif' },
                  }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Be Vietnam", sans-serif' },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              Autocomplete="off"
              size="small"
              id="manager-autocomplete"
              options={managerOptions}
              value={selectedManager}
              onChange={(event, newValue) => setSelectedManager(newValue)}
              disabled={!selectedRole}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  label="Reporting Manager"
                  InputProps={{
                    ...params.InputProps,
                    sx: { fontFamily: '"Be Vietnam", sans-serif' },
                  }}
                  InputLabelProps={{
                    sx: { fontFamily: '"Be Vietnam", sans-serif' },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              sx={{
                // mb: 2,
                color: "black",
                fontFamily: '"Be Vietnam", sans-serif',
                fontWeight: "bold",
              }}
            >
              Contact Information
            </Typography>
          </Grid>
          <Grid xs={4} item>
            <TextField
              Autocomplete="off"
              required
              size="small"
              fullWidth
              label="Email"
              name="email"
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              Autocomplete="off"
              required
              size="small"
              fullWidth
              label="Storage"
              name="storage"
              InputProps={{
                // Adding "GB" as a suffix
                endAdornment: (
                  <InputAdornment position="end">GB</InputAdornment>
                ),
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              Autocomplete="off"
              required
              size="small"
              fullWidth
              label="Phone Number"
              name="phone"
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
            />
          </Grid>
        </Grid>
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
          >
            Bulk Upload
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            sx={{ background: "rgb(251, 68, 36)", color: "white" }}
            onClick={handleClose}
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
                InputProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
              />
            </Grid>
            <Grid xs={6} item>
              <TextField
                required
                size="small"
                Autocomplete="off"
                fullWidth
                label="Reporting Manager"
                name="name"
                InputProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
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
                InputProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                size="small"
                Autocomplete="off"
                options={storageAllocation}
                renderInput={(params) => (
                  <TextField {...params} label="Storage Allocation" />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                required
                size="small"
                Autocomplete="off"
                fullWidth
                label="Initail Role"
                name="name"
                InputProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    fontFamily: '"Be Vietnam", sans-serif',
                  },
                }}
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
      <Dialog open={addRole} onClose={() => setAddRole(false)} >
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
              InputProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
              FormHelperTextProps={{
                sx: {
                  fontFamily: '"Be Vietnam", sans-serif',
                },
              }}
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
