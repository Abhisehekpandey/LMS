import React, { useState, useEffect } from "react";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import StorageIcon from "@mui/icons-material/Storage";

const sectionDefaults = {
  "LDAP CONFIGURATION": {
    host: "",
    port: "",
    userDn: "",
    password: "",
    baseDn: "",
  },
  "EMAIL CONFIGURATION": { smtp: "", port: "", username: "", password: "" },
  "SMS CONFIGURATION": { gatewayUrl: "", apiKey: "" },
  "WHATSAPP CONFIGURATION": { apiEndpoint: "", authToken: "" },
};

const LDAPConfig = () => {
  const sections = [
    "LDAP CONFIGURATION",
    "EMAIL CONFIGURATION",
    "SMS CONFIGURATION",
    "WHATSAPP CONFIGURATION",
  ];

  const initialServerState = {};
  sections.forEach((section) => {
    initialServerState[section] = {
      selectedServer: "1",
      servers: ["1"],
      configs: { 1: { ...sectionDefaults[section] } },
    };
  });

  const [tabIndex, setTabIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("LDAP CONFIGURATION");
  const [serverState, setServerState] = useState(initialServerState);
  const [status, setStatus] = useState({ type: "info", message: "" });

  const current = serverState[activeSection];
  const selectedServer = current.selectedServer;
  const servers = current.servers;
  const config = current.configs[selectedServer];

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(
        () => setStatus({ type: "info", message: "" }),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...config, [name]: value };
    setServerState((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        configs: {
          ...prev[activeSection].configs,
          [selectedServer]: updated,
        },
      },
    }));
  };

  const handleDummyAction = (label) => {
    setStatus({ type: "success", message: `${label} clicked (dummy)` });
  };

  const handleAddServer = () => {
    const next = `${servers.length + 1}`;
    const newConfig = { ...sectionDefaults[activeSection] };

    setServerState((prev) => {
      const section = prev[activeSection];
      return {
        ...prev,
        [activeSection]: {
          selectedServer: next,
          servers: [...section.servers, next],
          configs: {
            ...section.configs,
            [next]: newConfig,
          },
        },
      };
    });

    setStatus({ type: "success", message: `Added Server ${next}` });
  };

  const handleDeleteServer = () => {
    if (servers.length === 1) {
      setStatus({ type: "warning", message: "Cannot delete the last server." });
      return;
    }
    const filtered = servers.filter((s) => s !== selectedServer);
    const updatedConfigs = { ...current.configs };
    delete updatedConfigs[selectedServer];
    const nextSelected = filtered[0];
    setServerState((prev) => ({
      ...prev,
      [activeSection]: {
        selectedServer: nextSelected,
        servers: filtered,
        configs: updatedConfigs,
      },
    }));
    setStatus({ type: "info", message: `Deleted Server ${selectedServer}` });
  };

  const handleServerChange = (e) => {
    const id = e.target.value;
    setServerState((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        selectedServer: id,
      },
    }));
  };

  const getTabsForSection = () => {
    switch (activeSection) {
      case "EMAIL CONFIGURATION":
        return ["SMTP Server", "Send Test Email"];
      case "SMS CONFIGURATION":
        return ["Gateway Settings", "Send Test SMS"];
      case "WHATSAPP CONFIGURATION":
        return ["API Settings", "Send Test Message"];
      case "LDAP CONFIGURATION":
      default:
        return ["Server", "Users", "Groups"];
    }
  };

  const renderTabContent = () => {
    if (activeSection === "LDAP CONFIGURATION") {
      if (tabIndex === 0) {
        return (
          <Slide direction="left" in timeout={300}>
            <Box component="form" noValidate autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Host"
                    name="host"
                    value={config.host}
                    onChange={handleChange}
                    placeholder="192.168.1.99"
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Port"
                    name="port"
                    value={config.port}
                    onChange={handleChange}
                    placeholder="386"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={() => handleDummyAction("Detect Port")}
                          >
                            Detect Port
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="User DN"
                    name="userDn"
                    value={config.userDn}
                    onChange={handleChange}
                    sx={{ backgroundColor: "#fff9c4" }}
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={config.password}
                    onChange={handleChange}
                    sx={{ backgroundColor: "#fff9c4" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={5}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleDummyAction("Save Credentials")}
                  >
                    Save
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="One Base DN per line"
                    name="baseDn"
                    value={config.baseDn}
                    onChange={handleChange}
                    placeholder="DC=example,DC=com"
                    InputProps={{
                      endAdornment: (
                        <>
                          <Button
                            size="small"
                            onClick={() => handleDummyAction("Detect Base DN")}
                          >
                            Detect Base DN
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDummyAction("Test Base DN")}
                          >
                            Test Base DN
                          </Button>
                        </>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Slide>
        );
      } else if (tabIndex === 1) {
        return (
          <Slide direction="left" in timeout={300}>
            <Box>
              <Typography mb={2}>
                Listing and searching for users is constrained by these
                criteria:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Only these object classes:"
                    placeholder="inetOrgPerson"
                    helperText="The most common object classes for users are organizationalPerson, person, user, and inetOrgPerson."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Only from these groups:"
                    placeholder="Select groups"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Button size="small">➤</Button>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        width: 200,
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption">(Group List)</Typography>
                    </Box>
                    <Button size="small">➤</Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    size="small"
                    onClick={() => handleDummyAction("Edit LDAP Query")}
                  >
                    ↓ Edit LDAP Query
                  </Button>
                  <Typography mt={1} variant="body2">
                    LDAP Filter: <code>((objectclass=inetOrgPerson))</code>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="outlined"
                    onClick={() => handleDummyAction("Verify and Count")}
                  >
                    Verify settings and count users
                  </Button>
                  <Typography mt={1} variant="body2">
                    &gt; 1000 users found
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Slide>
        );
      } else if (tabIndex === 2) {
        return (
          <Slide direction="left" in timeout={300}>
            <Box>
              <Typography mb={2}>
                Groups meeting these criteria are available in Nextcloud:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Only these object classes:"
                    placeholder="groupOfNames"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Only from these groups:"
                    placeholder="Search groups"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Button size="small">&gt;</Button>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        width: 200,
                        height: 100,
                        overflow: "auto",
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        Accounting
                        <br />
                        Design
                        <br />
                        Engineering
                        <br />
                        HR
                        <br />
                        Management
                        <br />
                        QA
                        <br />
                        Robots 0
                      </Typography>
                    </Box>
                    <Button size="small">&lt;</Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    size="small"
                    onClick={() => handleDummyAction("Edit LDAP Query")}
                  >
                    ↓ Edit LDAP Query
                  </Button>
                  <Typography mt={1} variant="body2">
                    LDAP Filter: <code>((objectclass=groupOfNames))</code>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="outlined"
                    onClick={() => handleDummyAction("Verify Groups")}
                  >
                    Verify settings and count the groups
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Slide>
        );
      }
    }

    const sectionFields = {
      "EMAIL CONFIGURATION": ["SMTP Server", "Send Test Email"],
      "SMS CONFIGURATION": ["Gateway Settings", "Send Test SMS"],
      "WHATSAPP CONFIGURATION": ["API Settings", "Send Test Message"],
    };

    const sectionContent = {
      "EMAIL CONFIGURATION": [
        <Box>
          <TextField
            fullWidth
            label="SMTP Server"
            name="smtp"
            value={config.smtp}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Port"
            name="port"
            value={config.port}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={config.username}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={config.password}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
        </Box>,
        <Box>
          <TextField fullWidth label="Recipient Email" />
          <TextField fullWidth label="Subject" sx={{ mt: 2 }} />
          <TextField fullWidth label="Body" multiline rows={4} sx={{ mt: 2 }} />
          <Button variant="contained" sx={{ mt: 2 }}>
            Send Test Email
          </Button>
        </Box>,
      ],
      "SMS CONFIGURATION": [
        <Box>
          <TextField
            fullWidth
            label="Gateway URL"
            name="gatewayUrl"
            value={config.gatewayUrl}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="API Key"
            name="apiKey"
            value={config.apiKey}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
        </Box>,
        <Box>
          <TextField fullWidth label="Phone Number" />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }}>
            Send Test SMS
          </Button>
        </Box>,
      ],
      "WHATSAPP CONFIGURATION": [
        <Box>
          <TextField
            fullWidth
            label="API Endpoint"
            name="apiEndpoint"
            value={config.apiEndpoint}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Auth Token"
            name="authToken"
            value={config.authToken}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
        </Box>,
        <Box>
          <TextField fullWidth label="WhatsApp Number" />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }}>
            Send Test Message
          </Button>
        </Box>,
      ],
    };

    const content = sectionContent[activeSection]?.[tabIndex];
    return (
    
      <Slide direction="left" in timeout={300}>
        <Box>{content}</Box>
      </Slide>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        gap: 1,
        px: 2,
        py: 3,
        width: "80%",
        margin: "auto",
      }}
    >
      <Box sx={{ width: 180 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Settings
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {sections.map((section) => (
                <ListItemButton
                  key={section}
                  selected={activeSection === section}
                  onClick={() => setActiveSection(section)}
                >
                  <ListItemText primary={section} />
                </ListItemButton>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {activeSection}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <FormControl size="small">
              <Select
                value={selectedServer}
                onChange={handleServerChange}
                startAdornment={<StorageIcon sx={{ mr: 1 }} />}
              >
                {servers.map((s) => (
                  <MenuItem key={s} value={s}>
                    Server {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Add Server">
              <IconButton onClick={handleAddServer}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Server">
              <IconButton onClick={handleDeleteServer}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {getTabsForSection().map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          {status.message && (
            <Alert severity={status.type} sx={{ mb: 2 }}>
              {status.message}
            </Alert>
          )}
          
          <Slide
            key={tabIndex}
            direction="left"
            in
            timeout={300}
            mountOnEnter
            unmountOnExit
          >
            <Box>{renderTabContent()}</Box>
          </Slide>
        </Paper>
      </Box>
    </Box>
  );
};

export default LDAPConfig;
