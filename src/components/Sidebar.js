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
import { styled as muiStyled } from '@mui/system';
const LogoText = muiStyled(Typography)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif", // Modern font family
  fontWeight: 700,
  fontSize: '1.3rem',
  letterSpacing: '0.5px',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  display: 'inline-block',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '30%',
    height: '2px',
    bottom: 0,
    left: '0',
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    borderRadius: '2px',
  }
}));
// Styled Drawer
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  position: "absolute",
  zIndex: 1200,
  width: open ? 250 : 65,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: open ? 250 : 65,
    boxSizing: "border-box",
    transition: theme.transitions.create(["width", "margin", "padding"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    backgroundColor: "rgba(255, 255, 255, 0.05)", // <-- light transparent white
    backdropFilter: "blur(10px)", // <-- gives frosted glass effect
    WebkitBackdropFilter: "blur(10px)", // <-- for Safari
    backdropFilter: "blur(8px)",
    color: "#424242",
    borderRight: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    display: "flex", // Add flex display
    flexDirection: "column", // Stack children vertically
    height: "100%", // Ensure full heigh
  },
}));

// Styled List Item
const StyledListItem = styled(ListItem)(({ active }) => ({
  minHeight: 44,
  padding: "0 !important",
  margin: "0 1px !important",
  //  padding: "0 0px !important",
  display: "flex",
  borderRadius: "8px",
  backgroundColor: active ? "rgba(25, 118, 210, 0.08)" : "transparent",
  color: active ? "#1976d2" : "rgba(0, 0, 0, 0.7)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: "translateZ(0)",
  willChange: "transform, box-shadow, background-color",
  "&:hover": {
    backgroundColor: active
      ? "rgba(25, 118, 210, 0.12)"
      : "rgba(0, 0, 0, 0.04)",
    transform: "translateY(-1px) translateZ(0)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
}));

// Styled Icon
const StyledListItemIcon = styled(ListItemIcon)(({ active }) => ({
  minWidth: 32,
  color: active ? "#1976d2" : "rgba(0, 0, 0, 0.6)",
  justifyContent: "center",
  transition: "color 0.2s ease",
  marginLeft: "2px", // Add consistent left margin
  marginRight: "2px",

}));

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [hoverLock, setHoverLock] = useState(false);
  const timeoutRef = useRef(null);
  const location = useLocation();

  const menuItems = React.useMemo(() => [
    { path: "/user", icon: <UserIcon />, text: "User" },
    { path: "/department", icon: <DepartmentRolesIcon />, text: "Department" },
    { path: "/angelbot", icon: <TimelineIcon />, text: "AngelBot" },
    { path: "/ldap-config", icon: <LDAPIcon />, text: "LDAP Settings" },
    { path: "/company-dashboard", icon: <DashboardIcon />, text: "Dashboard" },
  ], []); // Empty dependency array means this only runs once

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    if (!hoverLock) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (!hoverLock) {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 90); // Delay to prevent flickering
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
          // pl: "3px",
          display: "flex",
          alignItems: "center",
          // cursor: 'pointer',
          height: 52, // Add fixed height to prevent layout shift
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          mb: 1, // Add margin bottom
        }}
        className="user-info-view"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 52,
            px: 1.2,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            mb: 1,
            transition: "padding 0.3s ease",
          }}
        >
          <Avatar
            sx={{
              height: 40,
              width: 40,
              fontSize: 24,
              background: "linear-gradient(135deg, #42a5f5, #1976d2)",
            }}
          >
            A
          </Avatar>
          <Box
            sx={{
              width: { xs: 'calc(100% - 62px)', xl: 'calc(100% - 72px)' },
              ml: 4,
              color: color,
            }}
            className='user-info'
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  mb: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 16,
                  fontWeight: 'bold', // Use a constant value for boldness
                  color: 'inherit',
                }}
                component='span'
              >
                Sumit
              </Box>
            </Box>
            <Box
              sx={{
                mt: -0.5,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'inherit',
              }}
            >
              Administrator
            </Box>
          </Box>
          <Box
            sx={{
              width: open ? "auto" : 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              ml: open ? 0.8 : 0,
              opacity: open ? 1 : 0,
              transition: "all 0.3s ease",
            }}
          >
            <LogoText component="span">Access Arc</LogoText>
          </Box>
        </Box>

      </Box>

      <List sx={{
        pt: 0.5, padding:"8px", display: "flex",
        flexDirection: "column",
        gap: "8px",
        justifyContent: "center",
        // alignItems: "center",
      }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <StyledListItem button active={isActive} sx={{
                height: 44, // Fixed height instead of minHeight
                padding:"5px !important",
                overflow: "hidden" // Prevent content overflow
              }}>
                <StyledListItemIcon active={isActive}>
                  {item.icon}
                </StyledListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      transition: "opacity 0.18s ease",
                      marginRight: "4px",
                      "& .MuiListItemText-primary": {
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#1976d2" : "inherit",
                        transition: "font-weight 0.2s ease, color 0.2s ease",
                        whiteSpace: "nowrap",
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
