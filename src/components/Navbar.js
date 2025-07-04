import React, { useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import debounce from "lodash/debounce";
import { fetchUsers } from "../api/userService";
import { getDepartments } from "../api/departmentService"; // adjust import path if needed

const StyledAppBar = styled(AppBar)({
  backgroundColor: "white",
  color: "#424242",
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  height: "50px",
  backdropFilter: "blur(8px)",
  zIndex: 1100,
  fontFamily: '"Be Vietnam", sans-serif',
});

const StyledToolbar = styled(Toolbar)({
  minHeight: "48px !important",
  padding: "0 16px !important",
});

const SearchWrapper = styled("div")({
  position: "relative",
  borderRadius: "20px",
  backgroundColor: "rgba(246,249,254)",
  marginRight: "20px",
  marginLeft: "80px",
  width: "100%",
  minWidth: "400px",
  maxWidth: "400px",
  display: "flex",
  alignItems: "center",
});

const StyledInputBase = styled(InputBase)({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "8px 12px 6px 40px",
    fontSize: "0.875rem",
    height: "1.5rem",
    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.5)",
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
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);

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

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const getFormattedPath = () => {
    const path = location.pathname;
    const segments = path.substring(1).split("/");
    const pathMap = {
      user: "Users",
      department: "Departments",
      angelbot: "AngelBot",
      "ldap-config": "LDAP Settings",
      "company-dashboard": "Company Dashboard",
    };
    return segments
      .map(
        (segment) =>
          pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      )
      .join(" / ");
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {getFormattedPath() && (
              <Box sx={{ display: "flex", flexDirection: "column", ml: 10 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: "1.6rem",
                    color: "#00318e",
                    fontWeight: "bold",
                  }}
                >
                  Angel<span style={{ color: "#ff0000" }}>Bot</span>
                </Typography>
                <Divider>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1rem",
                      color: "#707070",
                      fontFamily: "fangsong",
                    }}
                  >
                    Access Arc
                  </Typography>
                </Divider>
              </Box>
            )}
          </Typography>
        </Box>

        {(location.pathname === "/user" ||
          location.pathname === "/department") && (
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
                                    : result.deptName
                                }
                                secondary={
                                  location.pathname === "/user" ? (
                                    <>
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        {result.roles?.[0]?.department
                                          ?.deptName || "N/A"}{" "}
                                        - {result.roles?.[0]?.roleName || "N/A"}
                                      </Typography>
                                      <br />
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {result.email}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {result.deptDisplayName}
                                    </Typography>
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

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 3 }}>
          <Tooltip title="Toggle Theme" arrow>
            <IconButton
              onClick={onThemeToggle}
              size="medium"
              sx={{ width: 40, height: 35, mt: 0.5 }}
            >
              <Brightness4Icon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout" arrow>
            <IconButton
              onClick={handleLogout}
              size="medium"
              sx={{ width: 40, height: 35, mt: 0.5 }}
            >
              <LogoutIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;



