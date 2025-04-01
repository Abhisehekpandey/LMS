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
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  position: "absolute",
  zIndex: 1200,
  width: open ? 200 : 48, // Reduced from 240/60 to 200/48
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: open ? 200 : 48,
    boxSizing: "border-box",
    transition: "width 0.3s ease",
    backgroundColor: '#1a237e', // Dark blue background
    color: '#fff',
    borderRight: 'none',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  minHeight: 44,
  marginBottom: 4,
  padding: '8px',
  borderRadius: '0 8px 8px 0',
  marginRight: 8,
  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)({
  minWidth: 32,
  color: 'inherit',
  justifyContent: 'center',
});

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/user', icon: <UserIcon />, text: 'User' },
    { path: '/department', icon: <DepartmentRolesIcon />, text: 'Department' },
    { path: '/angelbot', icon: <TimelineIcon />, text: 'AngelBot' },
    { path: '/ldap-config', icon: <LDAPIcon />, text: 'LDAP Settings' },
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
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32,
            bgcolor: 'rgba(255,255,255,0.9)',
            color: '#1a237e',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          A
        </Avatar>
        {open && (
          <IconButton 
            onClick={() => setOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <StyledListItem 
              button
              active={location.pathname === item.path}
            >
              <StyledListItemIcon>
                {item.icon}
              </StyledListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }
                  }}
                />
              )}
            </StyledListItem>
          </Link>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
