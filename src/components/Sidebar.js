import React, { useState, useRef } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Box,
  styled,
  Typography,
} from "@mui/material";
import {
  People as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  Work as DepartmentRolesIcon,
  Timeline as TimelineIcon,
  ManageAccounts as LDAPIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

// Styled Drawer
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  position: "absolute",
  zIndex: 1200,
  width: open ? 220 : 48,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: open ? 200 : 48,
    boxSizing: "border-box",
    transition: theme.transitions.create(["width"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(8px)",
    color: "#424242",
    borderRight: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },
}));

// Styled List Item
const StyledListItem = styled(ListItem)(({ active }) => ({
  minHeight: 44,
  padding: "0 !important",
  margin: "0 !important",
  paddingLeft: "2px !important",
  display: "flex",
  borderRadius: "8px",
  backgroundColor: active ? "rgba(25, 118, 210, 0.08)" : "transparent",
  color: active ? "#1976d2" : "rgba(0, 0, 0, 0.7)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: active
      ? "rgba(25, 118, 210, 0.12)"
      : "rgba(0, 0, 0, 0.04)",
    transform: "translateY(-1px)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
}));

// Styled Icon
const StyledListItemIcon = styled(ListItemIcon)(({ active }) => ({
  minWidth: 32,
  color: active ? "#1976d2" : "rgba(0, 0, 0, 0.6)",
  justifyContent: "center",
  transition: "color 0.2s ease",
}));

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [hoverLock, setHoverLock] = useState(false);
  const timeoutRef = useRef(null);
  const location = useLocation();

  const menuItems = [
    { path: "/user", icon: <UserIcon />, text: "User" },
    { path: "/department", icon: <DepartmentRolesIcon />, text: "Department" },
    { path: "/angelbot", icon: <TimelineIcon />, text: "AngelBot" },
    { path: "/ldap-config", icon: <LDAPIcon />, text: "LDAP Settings" },
    { path: "/company-dashboard", icon: <DashboardIcon />, text: "Dashboard" },
  ];

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    if (!hoverLock) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (!hoverLock) {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 200); // Delay to prevent flickering
    }
  };

  const handleManualToggle = () => {
    const newLock = !hoverLock;
    setHoverLock(newLock);
    setOpen(newLock);
  };

  // const username = sessionStorage.getItem('AdminName');

  // const getUserAvatar = () => {
  //   if (username) {
  //     return username
  //       .split(' ') // Split the name into an array of words
  //       .map((word) => word.charAt(0).toUpperCase()) // Get the first letter of each word and convert to uppercase
  //       .join('');
  //   }
  //   if (user?.displayName) {
  //     return user.displayName.charAt(0).toUpperCase();
  //   }
  //   if (user?.email) {
  //     return user.email.charAt(0).toUpperCase();
  //   }
  //   return 'U'; // Default letter if no username, displayName, or email is found
  // };

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
      open={open}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        // onClick={handleClick}
        sx={{
          pl: "3px",
          display: "flex",
          alignItems: "center",
          // cursor: 'pointer',
        }}
        className="user-info-view"
      >
        <Box sx={{ py: 0.5 }}>
          <Avatar
            sx={{
              height: 40,
              width: 40,
              background: "linear-gradient(135deg, #42a5f5, #1976d2)",
              fontSize: 24,
            }}
          >
            {/* {getUserAvatar()} */}A
          </Avatar>
        </Box>
        <Box
          sx={{
            width: { xs: "calc(100% - 62px)", xl: "calc(100% - 72px)" },
            ml: 4,
          }}
          className="user-info"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                mb: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 16,
                fontWeight: "bold", // Use a constant value for boldness
                color: "inherit",
              }}
              component="span"
            >
              Access Arc
            </Box>
          </Box>
        </Box>
      </Box>

      <List sx={{ pt: 0.5, paddingRight: "4px", paddingLeft: "4px" }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <StyledListItem button active={isActive}>
                <StyledListItemIcon active={isActive}>
                  {item.icon}
                </StyledListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#1976d2" : "inherit",
                        transition: "font-weight 0.2s ease, color 0.2s ease",
                      },
                    }}
                  />
                )}
              </StyledListItem>
            </Link>
          );
        })}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
