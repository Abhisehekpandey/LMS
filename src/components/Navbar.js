import React, { useState, useCallback, useRef, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Slide from "@mui/material/Slide";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Tooltip,
  Box,
  styled,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Add, Close, Delete, Edit, Check } from "@mui/icons-material";
import debounce from "lodash/debounce";
import { fetchUsers } from "../api/userService";
import { getDepartments } from "../api/departmentService";
import { saveApmSettings } from "../api/apm"; // ✅ your API call here
import { LogoContext } from "../context/LogoContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} timeout={200} />;
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : "linear-gradient(90deg, #1976d2 0%, #1565c0 100%)",
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  height: "56px",
  zIndex: 1100,
  fontFamily: '"Poppins", sans-serif',
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: "56px !important",
  padding: "0 16px !important",
});

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "20px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : "#f6f9fe",
  marginLeft: "40px",
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  alignItems: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "8px 12px 6px 40px",
    fontSize: "0.875rem",
    height: "1.5rem",
    "&::placeholder": {
      color:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.5)"
          : "rgba(0, 0, 0, 0.5)",
      opacity: 1,
    },
  },
}));

const SearchIconWrapper = styled("div")({
  padding: "0 12px",
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  left: 0,
  justifyContent: "center",
  pointerEvents: "none",
});

const SearchResultWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  maxHeight: "300px",
  overflowY: "auto",
  width: "100%",
  "& .MuiListItem-root": {
    borderRadius: 1,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const Navbar = ({ onThemeToggle, onSearch }) => {
  const { logoData } = useContext(LogoContext);
  console.log("ontehe", onThemeToggle);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [apmDialogOpen, setApmDialogOpen] = useState(false);

  // APM Dialog States
  const [apmScope, setApmScope] = useState("both");
  const [apmEnabled, setApmEnabled] = useState(true);
  const [logLevel, setLogLevel] = useState("info");
  const [cacheBackend, setCacheBackend] = useState(true);
  const [cacheFrontend, setCacheFrontend] = useState(false);

  // Create Command States
  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [regions, setRegions] = useState([]);
  const [defaultRegion, setDefaultRegion] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [regionError, setRegionError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Create Section States
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState("");
  const [editingSection, setEditingSection] = useState(null); // Track which section is being edited
  const [editValue, setEditValue] = useState("");
  const [sectionError, setSectionError] = useState("");

  // Create Command API Functions
  const getRegions = async () => {
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/getRegion`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  };

  const saveRegions = async (regions, defaultRegion) => {
    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/addRegion`,
        {
          regions,
          defaultRegion,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error saving regions:", error);
      throw error;
    }
  };

  const deleteRegion = async (regionName) => {
    try {
      const response = await axios.delete(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/deleteIn?value=${encodeURIComponent(
          regionName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting region:", error);
      throw error;
    }
  };

  // Create Section API Functions
  const getSections = async () => {
    try {
      const response = await axios.get(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/section/getAll`,
        {
          headers: {
            username: sessionStorage.getItem("adminEmail"), // User provided curl only has username, but keeping consistency with others for auth
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Keeping auth token as standard practice
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sections:", error);
      throw error;
    }
  };

  const addSection = async (sectionsList) => {
    try {
      const response = await axios.post(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/section/add`,
        sectionsList, // API expects an array of all sections
        {
          headers: {
            "Content-Type": "application/json",
            username: sessionStorage.getItem("adminEmail"),
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding section:", error);
      throw error;
    }
  };

  const deleteSection = async (sectionName) => {
    try {
      const response = await axios.delete(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/section/remove?toDelete=${encodeURIComponent(
          sectionName
        )}`,
        {
          headers: {
            username: sessionStorage.getItem("adminEmail"),
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
  };

  const updateSection = async (oldName, newName) => {
    try {
      const response = await axios.patch(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/section/update?previousValue=${encodeURIComponent(
          oldName
        )}&newValue=${encodeURIComponent(newName)}`,
        {},
        {
          headers: {
            username: sessionStorage.getItem("adminEmail"),
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query) {
        setSearchResults([]);
        onSearch?.([]);
        return;
      }

      const lowercaseQuery = query.toLowerCase();
      try {
        let results = [];

        if (location.pathname === "/user") {
          const firstPage = await fetchUsers(0);
          let allUsers = [...firstPage.content];
          const totalPages = firstPage.totalPages || 1;

          const morePages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) => fetchUsers(i + 1))
          );
          morePages.forEach((res) => allUsers.push(...res.content));

          results = allUsers.filter(
            (user) =>
              user.name?.toLowerCase().includes(lowercaseQuery) ||
              user.email?.toLowerCase().includes(lowercaseQuery) ||
              user.roles?.[0]?.roleName
                ?.toLowerCase()
                .includes(lowercaseQuery) ||
              user.roles?.[0]?.department?.deptName
                ?.toLowerCase()
                .includes(lowercaseQuery)
          );
        } else if (location.pathname === "/department") {
          const res = await getDepartments(0, 100, query);
          results = (res.content || []).filter(
            (dept) =>
              dept.deptName?.toLowerCase().includes(lowercaseQuery) ||
              dept.deptDisplayName?.toLowerCase().includes(lowercaseQuery)
          );
        } else if (location.pathname === "/data-dictionary") {
          const response = await fetch(
            `${window.__ENV__.REACT_APP_ROUTE}/tenants/getAllDictionary`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                username: `${sessionStorage.getItem("adminEmail")}`,
              },
            }
          );

          const dictData = await response.json();
          const items = dictData.data || [];

          results = items.filter((item) =>
            [item.key, item.value, item.applicatbleTo].some((val) =>
              val?.toLowerCase().includes(lowercaseQuery)
            )
          );
        }

        setSearchResults(results.slice(0, 5));
        onSearch?.(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 300)
  ).current;

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    setSearchAnchorEl(e.currentTarget);
    debouncedSearch(value);
  };

  const handleSearchResultClick = () => {
    setSearchResults([]);
    setSearchAnchorEl(null);
    setSearchTerm("");
  };

  const handleClickAway = () => {
    setSearchResults([]);
    setSearchAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const formData = new FormData();
      formData.append("refreshToken", sessionStorage.getItem("refreshToken"));

      const response = await fetch(
        `${window.__ENV__.REACT_APP_ROUTE}/tenants/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            username: `${sessionStorage.getItem("adminEmail")}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        console.warn("⚠️ Logout API call failed:", await response.text());
      }

      sessionStorage.clear();
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      sessionStorage.clear();
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Box
            sx={{
              ml: { xs: 8, sm: 6, md: 7, lg: 8 },
              transition: "margin 0.3s",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={logoData.mainApplogo}
              alt="AngelBot Logo"
              style={{
                height: "50px", // slightly less than 56px to avoid clipping issues
                width: "auto",
                objectFit: "contain",
                transform: "scale(2.8)", // Zoom it even more
                transformOrigin: "left center",
                imageRendering: "auto", // Browsers handle scaling better with auto for logos
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
              }}
            />
          </Box>
        </Box>

        {/* Search Center */}
        {[].includes(location.pathname) && (
          <SearchWrapper>
            <SearchIconWrapper>
              <SearchIcon sx={{ fontSize: "1.2rem", color: "inherit" }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={`Search ${location.pathname === "/user" ? "users" : "departments"
                }...`}
              value={searchTerm}
              onChange={handleSearchChange}
              inputProps={{ "aria-label": "search" }}
            />
            <ClickAwayListener onClickAway={handleClickAway}>
              <div>
                {searchAnchorEl && (
                  <Popper
                    open
                    anchorEl={searchAnchorEl}
                    placement="bottom-start"
                    style={{
                      zIndex: 1301,
                      width: searchAnchorEl.offsetWidth,
                      marginTop: 4,
                    }}
                  >
                    <SearchResultWrapper elevation={3}>
                      {searchResults.length > 0 ? (
                        <List dense>
                          {searchResults.map((result, index) => (
                            <ListItem
                              key={index}
                              onClick={handleSearchResultClick}
                              button
                            >
                              <ListItemText
                                primary={
                                  location.pathname === "/user"
                                    ? result.name
                                    : location.pathname === "/department"
                                      ? result.deptName
                                      : result.key
                                }
                                secondary={
                                  location.pathname === "/user" ? (
                                    <>
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        {result.roles?.[0]?.department
                                          ?.deptName || "N/A"}{" "}
                                        - {result.roles?.[0]?.roleName || "N/A"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {result.email}
                                      </Typography>
                                    </>
                                  ) : location.pathname === "/department" ? (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {result.deptDisplayName}
                                    </Typography>
                                  ) : (
                                    <>
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        {result.value}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Applicable To: {result.applicatbleTo}
                                      </Typography>
                                    </>
                                  )
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ px: 2, py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            No items found
                          </Typography>
                        </Box>
                      )}
                    </SearchResultWrapper>
                  </Popper>
                )}
              </div>
            </ClickAwayListener>
          </SearchWrapper>
        )}

        {/* Actions Right */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", ml: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={async () => {
              try {
                const data = await getSections();
                // API returns { sections: [...] }
                setSections(data.sections || []);
                setOpenSectionDialog(true);
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: "Failed to load sections.",
                  severity: "error",
                });
              }
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              height: 32,
              px: 2,
              fontSize: "0.85rem",
              color: "#ffffff",
              borderColor: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "#ffffff",
              },
            }}
          >
            Create Section
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={async () => {
              try {
                const data = await getRegions();
                setRegions(data.regions || []);
                setDefaultRegion(data.defaultRegion || "");
                setOpenRegionDialog(true);
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: "Failed to load commands.",
                  severity: "error",
                });
              }
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              height: 32,
              px: 2,
              fontSize: "0.85rem",
              color: "#ffffff",
              borderColor: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "#ffffff",
              },
            }}
          >
            Create Command
          </Button>

          {/* <Button
            variant="outlined"
            size="small"
            onClick={() =>
              window.open(
                "http://kibana-test.apps.lab.ocp.lan/app/dashboards#/view/10abbbf8-79f0-4a0e-9bbe-42dc66f2f51c?embed",
                "_blank" // change to "_self" if you want same tab navigation
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              height: 32,
              px: 2,
              fontSize: "0.85rem",
              color: "#ffffff",
              borderColor: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "#ffffff",
              },
            }}
          >
            Kibana Monitoring
          </Button> */}

          <Tooltip title="Logout" arrow>
            <IconButton onClick={handleLogout} size="medium">
              <ExitToAppIcon sx={{ fontSize: "1.3rem", color: "#ffffff" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledToolbar>

      {/* APM Dialog */}
      <Dialog
        open={apmDialogOpen}
        onClose={() => setApmDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        keepMounted
        transitionDuration={200}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 6 } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          APM Settings
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            APM Configuration
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 2, pl: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              APM Scope
            </Typography>
            <RadioGroup
              row
              value={apmScope}
              onChange={(e) => setApmScope(e.target.value)}
            >
              <FormControlLabel
                value="frontend"
                control={<Radio />}
                label="Frontend"
              />
              <FormControlLabel
                value="backend"
                control={<Radio />}
                label="Backend"
              />
              <FormControlLabel value="both" control={<Radio />} label="Both" />
            </RadioGroup>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={apmEnabled}
                onChange={(e) => setApmEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enable APM Monitoring"
            sx={{ ml: 1, mb: 2 }}
          />

          <TextField
            fullWidth
            select
            size="small"
            label="Log Level"
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="trace">Trace</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="notice">Notice</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
            <option value="alert">Alert</option>
            <option value="emergency">Emergency</option>
          </TextField>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Caching Options
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={cacheBackend}
                onChange={(e) => setCacheBackend(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Backend Caching"
            sx={{ ml: 1, mb: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={cacheFrontend}
                onChange={(e) => setCacheFrontend(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Frontend Caching"
            sx={{ ml: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApmDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const payload = {
                apmScope,
                apmEnabled,
                logLevel,
                cacheBackend,
                cacheFrontend,
              };
              try {
                await saveApmSettings(payload);
                setApmDialogOpen(false);
              } catch {
                alert("Failed to save APM settings.");
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Section Dialog */}
      <Dialog
        open={openSectionDialog}
        onClose={() => {
          setOpenSectionDialog(false);
          setEditingSection(null);
          setEditValue("");
          setNewSection("");
        }}
        maxWidth="md"
        PaperProps={{
          sx: {
            minHeight: "400px",
            minWidth: "600px",
            borderRadius: 2,
          },
        }}
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
            Create Section
          </Typography>

          <IconButton
            onClick={() => {
              setOpenSectionDialog(false);
              setEditingSection(null);
              setEditValue("");
              setNewSection("");
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
            <Close sx={{ fontSize: "1rem" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
            <TextField
              label="Section Name"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              error={!!sectionError}
              helperText={sectionError}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={async () => {
                const regex = /^[A-Za-z0-9\-_ ]{1,50}$/;
                if (!regex.test(newSection)) {
                  setSectionError(
                    "Section name must be 1-50 chars, alphanumeric with spaces, - or _"
                  );
                  return;
                }
                if (sections.includes(newSection)) {
                  setSectionError("Section already exists.");
                  return;
                }

                try {
                  const updatedList = [...sections, newSection];
                  await addSection(updatedList);
                  setSections(updatedList);
                  setNewSection("");
                  setSectionError("");
                  setSnackbar({
                    open: true,
                    message: "Section added successfully!",
                    severity: "success",
                  });
                } catch (error) {
                  setSnackbar({
                    open: true,
                    message: "Failed to add section.",
                    severity: "error",
                  });
                }
              }}
            >
              Add
            </Button>
          </Box>

          {/* Sections List */}
          <Box
            sx={{
              mt: 2,
              maxHeight: 250,
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#aaa",
                borderRadius: "4px",
              },
            }}
          >
            {sections.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No sections added yet.
              </Typography>
            ) : (
              sections.map((section, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {editingSection === section ? (
                    <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                      <IconButton
                        color="primary"
                        onClick={async () => {
                          if (!editValue || editValue === section) {
                            setEditingSection(null);
                            return;
                          }
                          try {
                            await updateSection(section, editValue);
                            const updatedSections = [...sections];
                            updatedSections[idx] = editValue;
                            setSections(updatedSections);
                            setEditingSection(null);
                            setSnackbar({
                              open: true,
                              message: "Section updated successfully!",
                              severity: "success",
                            });
                          } catch (error) {
                            setSnackbar({
                              open: true,
                              message: "Failed to update section.",
                              severity: "error",
                            });
                          }
                        }}
                      >
                        <Check />
                      </IconButton>
                      <IconButton onClick={() => setEditingSection(null)}>
                        <Close />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Typography>{section}</Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setEditingSection(section);
                            setEditValue(section);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={async () => {
                            try {
                              await deleteSection(section);
                              setSections(sections.filter((s) => s !== section));
                              setSnackbar({
                                open: true,
                                message: `Section "${section}" deleted successfully.`,
                                severity: "success",
                              });
                            } catch (error) {
                              setSnackbar({
                                open: true,
                                message: "Failed to delete section.",
                                severity: "error",
                              });
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setOpenSectionDialog(false)}
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Command Dialog */}
      <Dialog
        open={openRegionDialog}
        onClose={() => setOpenRegionDialog(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            minHeight: "400px",
            minWidth: "600px",
            borderRadius: 2,
          },
        }}
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
            Create Command
          </Typography>

          <IconButton
            onClick={() => setOpenRegionDialog(false)}
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
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
            <TextField
              label="Command Name"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              error={!!regionError}
              helperText={regionError}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => {
                const regex = /^[A-Za-z0-9\-_]{1,12}$/;
                if (!regex.test(newRegion)) {
                  setRegionError(
                    "Command must be 1-12 chars, no spaces, only letters, numbers, - or _"
                  );
                  return;
                }
                if (regions.includes(newRegion)) {
                  setRegionError("Command already exists.");
                  return;
                }
                if (regions.length >= 25) {
                  setRegionError("Maximum 25 commands allowed.");
                  return;
                }

                setRegions([...regions, newRegion]);
                setNewRegion("");
                setRegionError("");
              }}
            >
              Add
            </Button>
          </Box>

          {/* Regions List */}
          <Box
            sx={{
              mt: 2,
              maxHeight: 250,
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#aaa",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#888",
              },
            }}
          >
            {regions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No commands added yet.
              </Typography>
            ) : (
              regions.map((region, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <Typography>{region}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      size="small"
                      variant={
                        defaultRegion === region ? "contained" : "outlined"
                      }
                      color="primary"
                      onClick={() => setDefaultRegion(region)}
                      sx={{ minWidth: 90 }}
                    >
                      {defaultRegion === region ? "Default" : "Set Default"}
                    </Button>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={async () => {
                        try {
                          await deleteRegion(region);
                          setRegions(regions.filter((r) => r !== region));
                          if (defaultRegion === region) setDefaultRegion("");
                          setSnackbar({
                            open: true,
                            message: `Command "${region}" deleted successfully.`,
                            severity: "success",
                          });
                        } catch (error) {
                          setSnackbar({
                            open: true,
                            message: "Failed to delete command.",
                            severity: "error",
                          });
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgb(251, 68, 36)",
              color: "white",
              borderRadius: "8px",
            }}
            onClick={async () => {
              if (regions.length === 0) {
                setRegionError("At least one command is required.");
                return;
              }
              if (!defaultRegion) {
                setRegionError("Please select a default command.");
                return;
              }

              try {
                const result = await saveRegions(regions, defaultRegion);
                setSnackbar({
                  open: true,
                  message: "Commands saved successfully!",
                  severity: "success",
                });
                console.log("API Result:", result);
                setOpenRegionDialog(false);
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: "Failed to save commands.",
                  severity: "error",
                });
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledAppBar>
  );
};

export default Navbar;
