import React, { useState, useCallback, useRef } from "react";
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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import debounce from "lodash/debounce";
import { fetchUsers } from "../api/userService";
import { getDepartments } from "../api/departmentService";
import { saveApmSettings } from "../api/apm"; // ✅ your API call here

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} timeout={200} />;
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.background.paper : "white",
  color: theme.palette.text.primary,
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
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

      // Always clear session (even if API fails)
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
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: "1.6rem",
                color: "#00318e",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              Angel<span style={{ color: "#ff0000" }}>Bot</span>
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: "0.85rem",
                color: "#707070",
                fontFamily: "fangsong",
              }}
            >
              Access Arc
            </Typography>
          </Box>
        </Box>

        {/* Search Center */}
        {[
          "/user",
          // "/department",
          // "/data-dictionary",
          // "/feed-context",
          // "/department-type-setting",
        ].includes(location.pathname) && (
          <SearchWrapper>
            <SearchIconWrapper>
              <SearchIcon sx={{ fontSize: "1.2rem", color: "inherit" }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={`Search ${
                location.pathname === "/user" ? "users" : "departments"
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
          {/* <Button
            variant="outlined"
            size="small"
            onClick={() => setApmDialogOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
              height: 32,
              fontSize: "0.8rem",
              color: "#1976d2",
              borderColor: "#1976d2",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.08)",
                borderColor: "#115293",
              },
            }}
          >
            APM Settings
          </Button> */}

          {/* <Tooltip title="Toggle Theme" arrow>
            <IconButton onClick={onThemeToggle} size="medium">
              <DarkModeIcon sx={{ fontSize: "1.3rem", color: "#555" }} />
            </IconButton>
          </Tooltip> */}

          <Tooltip title="Logout" arrow>
            <IconButton onClick={handleLogout} size="medium">
              <ExitToAppIcon sx={{ fontSize: "1.3rem", color: "#d32f2f" }} />
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
    </StyledAppBar>
  );
};

export default Navbar;
