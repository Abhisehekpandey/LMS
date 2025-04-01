import React, { useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LanguageIcon from "@mui/icons-material/Language";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#1a237e", // Match sidebar color
  color: "#ffffff",
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
  color: "#ffffff",
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

const Navbar = ({ onThemeToggle }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

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
            color: "#ffffff",
          }}
        >
          My Application Logo
        </Typography>

        <SearchWrapper>
          <SearchIconWrapper>
            <SearchIcon sx={{ fontSize: "1.2rem", color: "text.secondary" }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
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
