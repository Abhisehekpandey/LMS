import React, { useState, useCallback, useEffect } from "react";
// import '@fontsource/be-vietnam';
import { useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
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
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white", // Match sidebar color
  color: "#424242",
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  height: "50px",
  backdropFilter: "blur(8px)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  position: "relative", // Ensure backdrop-filter works properly
  zIndex: 1100,
  fontFamily: '"Be Vietnam", sans-serif',
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: "48px !important",
  padding: "0 16px !important",
  fontFamily: '"Be Vietnam", sans-serif',
});

const SearchWrapper = styled("div")({
  position: "relative",
  borderRadius: "20px",
  backgroundColor: "rgba(246,249,254)", // Darker background for search
  "&:hover": {
    backgroundColor: "rgba(246,249,254)",

    minHeight: 40,
    position: 'relative',
    '& .searchRoot': {
      position: { xs: 'absolute', sm: 'relative' },
      right: { xs: 0, sm: 'auto' },
      top: { xs: 0, sm: 'auto' },

    },
  },
  marginRight: "20px",
  marginLeft: "20px",
  width: "100%",
  minWidth: "400px",
  maxWidth: "400px",
  display: "flex",
  alignItems: "center",
  fontFamily: '"Be Vietnam", sans-serif',
});

const StyledInputBase = styled(InputBase)({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "8px 12px 6px 40px",
    fontSize: "0.875rem",
    width: "100%", // Ensure the input takes full width
    height: "1.5rem",
    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.5)",
      opacity: 1,
      fontFamily: '"Be Vietnam", sans-serif',
    },
  },
});

const SearchIconWrapper = styled("div")({
  padding: "0 12px",
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  left: 0, // Ensure it's properly positioned
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
    fontFamily: '"Be Vietnam", sans-serif',
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const Navbar = ({ onThemeToggle, onSearch, currentPage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [userData, setUserData] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const data = localStorage.getItem("dashboardRows");
      if (data) {
        setUserData(JSON.parse(data));
      }
    };

    loadUserData();
    // Add event listener for localStorage changes
    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  const getFormattedPath = () => {
    const path = location.pathname;

    // Handle root path
    if (path === "/") return "";

    // Remove leading slash and split by slashes
    const segments = path.substring(1).split("/");

    // Map path segments to more readable format
    const pathMap = {
      user: "Users",
      department: "Departments",
      angelbot: "AngelBot",
      "ldap-config": "LDAP Settings",
      "company-dashboard": "Company Dashboard",
    };

    // Format each segment and join them
    return segments
      .map(
        (segment) =>
          pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      )
      .join(" / ");
  };
  const formattedPath = getFormattedPath();

  const searchData = (query) => {
    if (!query) {
      setSearchResults([]);
      onSearch?.([]);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    let results = [];

    if (currentPage === "departments") {
      // Search in departments data
      const departmentsData = JSON.parse(
        localStorage.getItem("departments") || "[]"
      );
      results = departmentsData.filter(
        (item) =>
          item.name?.toLowerCase().includes(lowercaseQuery) ||
          item.displayName?.toLowerCase().includes(lowercaseQuery) ||
          item.storage?.toLowerCase().includes(lowercaseQuery) ||
          item.roles?.some((role) =>
            role.toLowerCase().includes(lowercaseQuery)
          )
      );
    } else {
      // Default user search
      const userData = JSON.parse(
        localStorage.getItem("dashboardRows") || "[]"
      );
      results = userData.filter(
        (item) =>
          item.username?.toLowerCase().includes(lowercaseQuery) ||
          item.name?.toLowerCase().includes(lowercaseQuery) ||
          item.email?.toLowerCase().includes(lowercaseQuery) ||
          item.department?.toLowerCase().includes(lowercaseQuery) ||
          item.role?.toLowerCase().includes(lowercaseQuery)
      );
    }

    setSearchResults(results.slice(0, 5)); // Limit dropdown to 5 results
    onSearch?.(results); // Pass all results to parent
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => searchData(query), 300),
    [userData]
  );

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    setSearchAnchorEl(event.currentTarget);
    debouncedSearch(value);
  };

  const handleSearchResultClick = (result) => {
    console.log("Selected result:", result);
    setSearchTerm("");
    setSearchResults([]);
    setSearchAnchorEl(null);
    // Add navigation logic if needed
  };

  const handleClickAway = () => {
    setSearchResults([]);
    setSearchAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language) => {
    console.log(`Language changed to: ${language}`);
    handleLanguageClose();
  };

  const renderSearchResult = (result) => {
    if (currentPage === "departments") {
      return (
        <ListItemText
          primary={`${result.name} / ${result.displayName}`}
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                color="text.primary"
                sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
              >
                Storage: {result.storage}
              </Typography>
              <br />
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
              >
                Roles: {result.roles.join(", ")}
              </Typography>
            </React.Fragment>
          }
        />
      );
    }

    // Default user search result display
    return (
      <ListItemText
        primary={result.name}
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
            >
              {result.department} - {result.role}
            </Typography>
            <br />
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: '"Be Vietnam", sans-serif' }}
            >
              {result.email}
            </Typography>
          </React.Fragment>
        }
      />
    );
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1, // This will push other elements to the right
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "inherit",
              fontFamily: '"Be Vietnam", sans-serif',
            }}
          >
            {/* Access Arc */}
          </Typography>

          {formattedPath && (
            <>
              <Box
                sx={{
                  height: { xs: 56, sm: 60 },
                  padding: 2.5,
                  display: 'flex',
                  flexDirection: 'row',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: "60px",
                  '& svg': {
                    height: { xs: 40, sm: 45 },
                    width: '13rem',
                  },
                }}
                className='app-logo'
              >

                <div>
                  <Typography
                    variant='h5'
                    sx={{ fontSize: '1.6rem', color: '#00318e', fontWeight: 'bold' }}
                  >
                    Angel<span style={{ color: '#ff0000' }}>Bot</span>
                  </Typography>
                  <Divider>
                    <Typography
                      variant='h6'
                      sx={{
                        fontSize: '1rem',
                        color: '#707070',
                        fontFamily: 'fangsong',
                      }}
                    >
                      Access Arc
                    </Typography>
                  </Divider>
                </div>
                <Box
                  sx={{
                    mt: 1,
                    display: { xs: 'none', md: 'block' },
                    '& svg': {
                      height: { xs: 25, sm: 30 },
                    },
                  }}
                >
        
                </Box>
              </Box>

            </>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-end",
            maxWidth: "1000px",
          }}
        >
          {["/user", "/department"].includes(location.pathname) && (
            <SearchWrapper>
              <SearchIconWrapper>
                <SearchIcon sx={{ fontSize: "1.2rem", color: "inherit" }} />
              </SearchIconWrapper>

              <StyledInputBase
                placeholder={
                  currentPage === "departments"
                    ? "Search departments, roles..."
                    : "Search users, departments, roles..."
                }
                value={searchTerm}
                onChange={handleSearchChange}
                inputProps={{ "aria-label": "search" }}
              />

              <ClickAwayListener onClickAway={handleClickAway}>
                <div>
                  {searchResults.length > 0 && searchAnchorEl && (
                    <Popper
                      open={true}
                      anchorEl={searchAnchorEl}
                      placement="bottom-start"
                      style={{
                        zIndex: 1301,
                        width: searchAnchorEl ? searchAnchorEl.offsetWidth : 800,
                        marginTop: 4,
                      }}
                    >
                      <SearchResultWrapper elevation={3}>
                        <List dense>
                          {searchResults.map((result, index) => (
                            <ListItem
                              key={index}
                              onClick={() => handleSearchResultClick(result)}
                              button
                            >
                              {renderSearchResult(result)}
                            </ListItem>
                          ))}
                        </List>
                      </SearchResultWrapper>
                    </Popper>
                  )}
                </div>
              </ClickAwayListener>
            </SearchWrapper>
          )}


          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", gap: 3 }}>
            <Tooltip title="Toggle Theme" arrow>
              <IconButton
                onClick={onThemeToggle}
                size="medium"
                // sx={{ color: 'text.secondary' }}
                sx={{
                  borderRadius: '50%',
                  width: 40,
                  height: 35,
                  marginTop: '3px',
                  color: "rgba(0, 0, 0, 0.6)",
                  backgroundColor: "rgba(246, 249, 254)",
                  border: 1,
                  borderColor: 'transparent',
                  '&:hover, &:focus': {
                    color: (theme) => theme.palette.text.primary,
                    backgroundColor: "rgba(246,249,254)",
                    borderColor: (theme) =>
                      alpha(theme.palette.text.secondary, 0.25),
                  },
                }}
              // sx={{ color: "rgba(0, 0, 0, 0.6)", backgroundColor: "rgba(246,249,254)" }}
              >
                <Brightness4Icon sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout" arrow>
              <IconButton
                onClick={handleLogout}
                size="medium"
                sx={{
                  borderRadius: '50%',
                  width: 40,
                  height: 35,
                  marginTop: '3px',
                  color: "rgba(0, 0, 0, 0.6)",
                  backgroundColor: "rgba(246, 249, 254)",
                  border: 1,
                  borderColor: 'transparent',
                  '&:hover, &:focus': {
                    color: (theme) => theme.palette.text.primary,
                    backgroundColor: "rgba(246,249,254)",
                    borderColor: (theme) =>
                      alpha(theme.palette.text.secondary, 0.25),
                  },
                }}
              >
                <LogoutIcon sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;
