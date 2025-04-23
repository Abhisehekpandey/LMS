import React, { useState, useCallback, useEffect } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import debounce from 'lodash/debounce';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "blue", // Match sidebar color
  color: "inherit",
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  height: "48px",
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: "48px !important",
  padding: "0 16px !important",
});

const SearchWrapper = styled("div")({
  position: "relative",
  borderRadius: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.15)", // Lighter background for search
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  marginRight: "20px",
  marginLeft: "20px",
  width: "100%",
  maxWidth: "400px",
});

const StyledInputBase = styled(InputBase)({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "6px 12px 6px 40px",
    fontSize: "0.875rem",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.7)",
      opacity: 1,
    },
  },
});

const SearchIconWrapper = styled("div")({
  padding: "0 12px",
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const SearchResultWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  maxHeight: '300px',
  overflowY: 'auto',
  width: '400px',
  '& .MuiListItem-root': {
    borderRadius: 1,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  }
}));

const Navbar = ({ onThemeToggle, onSearch, currentPage }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [userData, setUserData] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const data = localStorage.getItem('dashboardRows');
      if (data) {
        setUserData(JSON.parse(data));
      }
    };

    loadUserData();
    // Add event listener for localStorage changes
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, []);


  

  const searchData = (query) => {
    if (!query) {
      setSearchResults([]);
      onSearch?.([]); 
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    let results = [];

    if (currentPage === 'departments') {
      // Search in departments data
      const departmentsData = JSON.parse(localStorage.getItem('departments') || '[]');
      results = departmentsData.filter(item => 
        item.name?.toLowerCase().includes(lowercaseQuery) ||
        item.displayName?.toLowerCase().includes(lowercaseQuery) ||
        item.storage?.toLowerCase().includes(lowercaseQuery) ||
        item.roles?.some(role => role.toLowerCase().includes(lowercaseQuery))
      );
    } else {
      // Default user search
      const userData = JSON.parse(localStorage.getItem('dashboardRows') || '[]');
      results = userData.filter(item => 
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
      console.log('Selected result:', result);
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
    if (currentPage === 'departments') {
      return (
        <ListItemText
          primary={`${result.name} / ${result.displayName}`}
          secondary={
            <React.Fragment>
              <Typography component="span" variant="body2" color="text.primary">
                Storage: {result.storage}
              </Typography>
              <br />
              <Typography component="span" variant="caption" color="text.secondary">
                Roles: {result.roles.join(', ')}
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
            <Typography component="span" variant="body2" color="text.primary">
              {result.department} - {result.role}
            </Typography>
            <br />
            <Typography component="span" variant="caption" color="text.secondary">
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
        <Typography
          variant="h6"
          sx={{
            flexGrow: 0,
            fontSize: "1.1rem",
            fontWeight: 600,
            marginLeft: "50px",
            color: "inherit",
          }}
        >
          Access Arc
        </Typography>

        <SearchWrapper>
          <SearchIconWrapper>
            <SearchIcon sx={{ fontSize: "1.2rem", color: "inherit" }} />
          </SearchIconWrapper>
         
           <StyledInputBase
            placeholder={currentPage === 'departments' 
              ? "Search departments, roles..." 
              : "Search users, departments, roles..."}
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
                  style={{ zIndex: 1301, width: searchAnchorEl.offsetWidth }}
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

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Toggle Theme" arrow>
            <IconButton
              onClick={onThemeToggle}
              size="small"
              // sx={{ color: 'text.secondary' }}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <Brightness4Icon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Change Language" arrow>
            <IconButton
              onClick={handleLanguageClick}
              size="small"
              // sx={{ color: 'text.secondary' }}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <LanguageIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout" arrow>
            <IconButton
              onClick={handleLogout}
              size="small"
              // sx={{ color: 'text.secondary' }}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              <LogoutIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleLanguageClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              "& .MuiMenuItem-root": {
                fontSize: "0.875rem",
                minHeight: "32px",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem dense onClick={() => handleLanguageChange("English")}>
            English
          </MenuItem>
          <MenuItem dense onClick={() => handleLanguageChange("Spanish")}>
            Spanish
          </MenuItem>
          <MenuItem dense onClick={() => handleLanguageChange("French")}>
            French
          </MenuItem>
        </Menu>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;
