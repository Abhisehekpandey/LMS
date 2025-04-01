import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const LDAPConfig = ({ onThemeToggle }) => {
  const [config, setConfig] = useState({
    // Server Configuration
    serverUrl: "",
    port: "389",
    useSSL: true,
    baseDN: "",
    bindDN: "",
    bindPassword: "",

    // Authentication Settings
    authEnabled: true,
    authMethod: "simple",
    userSearchBase: "",
    userSearchFilter: "(uid={0})",

    // Group Settings
    groupSearchBase: "",
    groupSearchFilter: "(member={0})",
    groupRoleAttribute: "cn",

    // Advanced Settings
    connectionTimeout: "30000",
    referrals: true,
    pageSize: "1000",
  });

  const [errors, setErrors] = useState({});

  // Add validation function inside the component
  const validateConfig = (config) => {
    const errors = {};
    if (!config.serverUrl) errors.serverUrl = "Server URL is required";
    if (!config.bindDN) errors.bindDN = "Bind DN is required";
    if (!config.bindPassword) errors.bindPassword = "Bind Password is required";
    if (!config.baseDN) errors.baseDN = "Base DN is required";
    if (!config.port) errors.port = "Port is required";
    if (!config.userSearchBase)
      errors.userSearchBase = "User Search Base is required";
    return errors;
  };

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setConfig((prev) => ({
      ...prev,
      [name]: event.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleTestConnection = () => {
    // Implement LDAP connection test
    console.log("Testing LDAP connection...");
  };

  // Update your handleSave function
  const handleSave = () => {
    const validationErrors = validateConfig(config);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Proceed with saving
      console.log("Saving LDAP configuration:", config);
    }
  };

  return (
    <Box sx={{ display: "flex", position: "relative", height: "100vh" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: "60px", // Add margin to prevent sidebar overlap
          transition: "margin-left 0.3s",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
          <Navbar onThemeToggle={onThemeToggle} />
        </Box>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            LDAP Configuration
          </Typography>

          {/* Server Configuration Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Server Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LDAP Server URL"
                name="serverUrl"
                value={config.serverUrl}
                onChange={handleChange}
                placeholder="ldap://your-server.com"
                error={!!errors.serverUrl}
                helperText={errors.serverUrl}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Port"
                name="port"
                value={config.port}
                onChange={handleChange}
                error={!!errors.port}
                helperText={errors.port}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.useSSL}
                    onChange={handleChange}
                    name="useSSL"
                  />
                }
                label="Use SSL/TLS"
              />
            </Grid>
          </Grid>

          {/* Authentication Settings */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Authentication Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bind DN"
                name="bindDN"
                value={config.bindDN}
                onChange={handleChange}
                placeholder="cn=admin,dc=example,dc=com"
                error={!!errors.bindDN}
                helperText={errors.bindDN}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="password"
                label="Bind Password"
                name="bindPassword"
                value={config.bindPassword}
                onChange={handleChange}
                error={!!errors.bindPassword}
                helperText={errors.bindPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Base DN"
                name="baseDN"
                value={config.baseDN}
                onChange={handleChange}
                placeholder="dc=example,dc=com"
                error={!!errors.baseDN}
                helperText={errors.baseDN}
              />
            </Grid>
          </Grid>

          {/* User Search Settings */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            User Search Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="User Search Base"
                name="userSearchBase"
                value={config.userSearchBase}
                onChange={handleChange}
                placeholder="ou=users,dc=example,dc=com"
                error={!!errors.userSearchBase}
                helperText={errors.userSearchBase}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="User Search Filter"
                name="userSearchFilter"
                value={config.userSearchFilter}
                onChange={handleChange}
                error={!!errors.userSearchFilter}
                helperText={errors.userSearchFilter}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleTestConnection}
            >
              Test Connection
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Configuration
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LDAPConfig;
