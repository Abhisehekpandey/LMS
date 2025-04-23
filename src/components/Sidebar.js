import React, { useState } from "react";
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
} from "@mui/material";
import {
  People as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  Work as DepartmentRolesIcon,
  Timeline as TimelineIcon,
  ManageAccounts as LDAPIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  position: "absolute",
  zIndex: 1200,
  width: open ? 200 : 48,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: open ? 200 : 48,
    boxSizing: "border-box",
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // White transparent background
    backdropFilter: 'blur(8px)', // Blur effect for frosted glass look
    color: '#424242', // Darker text for better contrast
    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  minHeight: 44,
  marginBottom: 4,
  marginLeft: 4,
  marginRight: 4,
  padding: '8px 12px',
  borderRadius: '8px',
  backgroundColor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
  color: active ? '#1976d2' : 'rgba(0, 0, 0, 0.7)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: active ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-1px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme, active }) => ({
  minWidth: 32,
  color: active ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center',
  transition: 'color 0.2s ease',
}));

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/user', icon: <UserIcon />, text: 'User' },
    { path: '/department', icon: <DepartmentRolesIcon />, text: 'Department' },
    { path: '/angelbot', icon: <TimelineIcon />, text: 'AngelBot' },
    { path: '/ldap-config', icon: <LDAPIcon />, text: 'LDAP Settings' },
    { path: '/company-dashboard', icon: <DashboardIcon />, text: 'Dashboard' },
  ];

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
      open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        mb: 0.5
      }}>
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32,
            background: 'linear-gradient(135deg, #42a5f5, #1976d2)', // Gradient blue background
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          A
        </Avatar>
        {open && (
          <IconButton 
            onClick={() => setOpen(false)}
            sx={{ 
              color: 'rgba(0, 0, 0, 0.5)',
              transition: 'color 0.2s ease, background-color 0.2s ease',
              padding: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: '#1976d2'
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ pt: 0.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <StyledListItem 
                button
                active={isActive}
              >
                <StyledListItemIcon active={isActive}>
                  {item.icon}
                </StyledListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#1976d2' : 'inherit',
                        transition: 'font-weight 0.2s ease, color 0.2s ease',
                      }
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