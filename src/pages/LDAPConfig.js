import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const LDAPConfig = ({ onThemeToggle }) => {
  const [config, setConfig] = useState({
    connectionUrl: '',
    bindDN: '',
    bindCredentials: '',
    usersDN: '',
    userObjectClasses: 'person, organizationalPerson, user',
    editMode: 'read',
    displayName: '',
    usernameAttribute: '',
  });

  const [status, setStatus] = useState({
    type: 'info',
    message: '',
  });

  const [submittedConfigs, setSubmittedConfigs] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus({
      type: 'success',
      message: 'LDAP configuration saved successfully!',
    });
    setSubmittedConfigs((prev) => [...prev, config]);
    setConfig({
      connectionUrl: '',
      bindDN: '',
      bindCredentials: '',
      usersDN: '',
      userObjectClasses: 'person, organizationalPerson, user',
      editMode: 'read',
      displayName: '',
      usernameAttribute: '',
    });
  };

  return (
    <Box sx={{ display: "flex", position: "relative", height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: "48px",
          transition: "margin-left 0.3s",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 0, marginLeft: "0px", overflow: "auto", height: "calc(100vh - 48px)" }}>
          <Paper sx={{ m: 2, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 1 }}>
                LDAP Configuration
              </Typography>
              <Tooltip title="Configure your LDAP connection settings below." arrow>
                <IconButton color="primary">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {status.message && (
              <Alert severity={status.type} sx={{ mb: 3 }}>
                {status.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Connection URL"
                        name="connectionUrl"
                        value={config.connectionUrl}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="ldap://hostname:port"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="LDAP Display Name"
                        name="displayName"
                        value={config.displayName}
                        onChange={handleChange}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Bind Distinguished Name"
                        name="bindDN"
                        value={config.bindDN}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="cn=admin,dc=example,dc=com"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Bind Credentials"
                        name="bindCredentials"
                        type="password"
                        value={config.bindCredentials}
                        onChange={handleChange}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Users Distinguished Name"
                        name="usersDN"
                        value={config.usersDN}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="ou=users,dc=example,dc=com"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="User Object Classes"
                        name="userObjectClasses"
                        value={config.userObjectClasses}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="inetOrgPerson, organizationalPerson"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Username LDAP Attribute"
                        name="usernameAttribute"
                        value={config.usernameAttribute}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="uid"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Edit Mode</InputLabel>
                        <Select
                          name="editMode"
                          value={config.editMode}
                          label="Edit Mode"
                          onChange={handleChange}
                        >
                          <MenuItem value="read">Read Only</MenuItem>
                          <MenuItem value="write">Write</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ minWidth: 200 }}
                    >
                      Save Configuration
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>

            {submittedConfigs.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  LDAP Directory
                </Typography>
                {submittedConfigs.map((config, index) => (
                  <Accordion key={index} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {config.displayName}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography><strong>Connection URL:</strong> {config.connectionUrl}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Bind DN:</strong> {config.bindDN}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Users DN:</strong> {config.usersDN}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Object Classes:</strong> {config.userObjectClasses}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Username Attribute:</strong> {config.usernameAttribute}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Edit Mode:</strong> {config.editMode}</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default LDAPConfig;