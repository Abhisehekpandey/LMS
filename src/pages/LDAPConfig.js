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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

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
  "SMS CONFIGURATION": {
    gatewayUrl: "",
    apiKey: "",
    username: "",
    password: "",
  },
  "WHATSAPP CONFIGURATION": {
    apiEndpoint: "",
    authToken: "",
    username: "",
    password: "",
  },
};

const LDAPConfig = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newConfigName, setNewConfigName] = useState("");
  const [kvPairs, setKvPairs] = useState([{ key: "", value: "" }]);
  const [customSections, setCustomSections] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

  const defaultSections = [
    "LDAP CONFIGURATION",
    "EMAIL CONFIGURATION",
    "SMS CONFIGURATION",
    "WHATSAPP CONFIGURATION",
  ];
  const sections = [...defaultSections, ...customSections.map((s) => s.name)];
  const [renameDialog, setRenameDialog] = useState({
    open: false,
    oldName: "",
    newName: "",
  });

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
    if (!defaultSections.includes(activeSection)) {
      return (
        <Fade in timeout={300}>
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {Object.entries(config).map(([key, value], index) => (
                <Grid item xs={12} key={index}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      fullWidth
                      label={key}
                      name={key}
                      value={value}
                      onChange={(e) => {
                        const updated = { ...config, [key]: e.target.value };
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
                      }}
                    />
                    <Tooltip title="Delete Field">
                      <IconButton
                        onClick={() => {
                          if (Object.keys(config).length === 1) {
                            setStatus({
                              type: "warning",
                              message: "At least one field is required.",
                            });
                            return;
                          }
                          const updatedConfig = { ...config };
                          delete updatedConfig[key];
                          setServerState((prev) => ({
                            ...prev,
                            [activeSection]: {
                              ...prev[activeSection],
                              configs: {
                                ...prev[activeSection].configs,
                                [selectedServer]: updatedConfig,
                              },
                            },
                          }));
                          setStatus({
                            type: "info",
                            message: `Field "${key}" removed from "${activeSection}".`,
                          });
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              ))}

              <Grid item xs={5}>
                <TextField
                  label="New Key"
                  fullWidth
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="New Value"
                  fullWidth
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!newKey.trim() || !newValue.trim()}
                  onClick={() => {
                    if (config[newKey]) {
                      setStatus({
                        type: "warning",
                        message: `Key "${newKey}" already exists.`,
                      });
                      return;
                    }
                    const updated = { ...config, [newKey]: newValue };
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
                    setNewKey("");
                    setNewValue("");
                    setStatus({
                      type: "success",
                      message: `Added new field "${newKey}" to "${activeSection}".`,
                    });
                  }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      );
    }

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
          <TextField
            fullWidth
            label="username"
            name="username"
            value={config.username}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="password"
            name="password"
            value={config.password}
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
          <TextField
            fullWidth
            label="username"
            name="username"
            value={config.username}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="password"
            name="password"
            value={config.password}
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
      <Box sx={{ width: 230 }}>
        <Accordion expanded>
          <AccordionSummary>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              sx={{
                backgroundColor: "#1976d2", // Blue background
                color: "white", // White text and icon
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              <Typography sx={{ color: "white", fontWeight: "bold" }}>
                Settings
              </Typography>
              <Tooltip title="Add Configuration">
                <IconButton size="small" onClick={() => setDialogOpen(true)}>
                  <AddIcon sx={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <List>
              {sections.map((section) => {
                const isCustom = !defaultSections.includes(section);
                return (
                  <Box
                    key={section}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ pr: 1 }}
                  >
                    <ListItemButton
                      selected={activeSection === section}
                      onClick={() => setActiveSection(section)}
                      sx={{ flexGrow: 1 }}
                    >
                      <ListItemText primary={section} />
                    </ListItemButton>
                    {isCustom && (
                      <Tooltip title="Delete Configuration">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCustomSections((prev) =>
                              prev.filter((s) => s.name !== section)
                            );
                            setServerState((prev) => {
                              const updated = { ...prev };
                              delete updated[section];
                              return updated;
                            });

                            if (activeSection === section) {
                              setActiveSection("LDAP CONFIGURATION");
                            }

                            setStatus({
                              type: "info",
                              message: `Deleted "${section}" configuration.`,
                            });
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
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

          {defaultSections.includes(activeSection) && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
              <FormControl size="small">
                <Select
                  value={selectedServer}
                  onChange={handleServerChange}
                  onOpen={() => setIsServerDropdownOpen(true)}
                  onClose={() => setIsServerDropdownOpen(false)}
                  startAdornment={<StorageIcon sx={{ mr: 1 }} />}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 250,
                      },
                    },
                  }}
                >
                  {servers.map((s) => (
                    <MenuItem
                      key={s}
                      value={s}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>Server {s}</Typography>

                      {isServerDropdownOpen && (
                        <Tooltip title="Rename Server">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent dropdown from closing
                              setRenameDialog({
                                open: true,
                                oldName: s,
                                newName: s,
                              });
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
          )}

          {defaultSections.includes(activeSection) && (
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
          )}

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
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            px: 2,
            py: 1.5,
          }}
        >
          Add New Configuration
        </DialogTitle>
        <DialogContent>
          {status.message && (
            <Alert
              severity={status.type}
              sx={{ mb: 2 }}
              onClose={() => setStatus({ type: "info", message: "" })}
            >
              {status.message}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Configuration Name"
            value={newConfigName}
            onChange={(e) => setNewConfigName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />

          {kvPairs.map((pair, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={2}>
              <TextField
                label="Key"
                fullWidth
                value={pair.key}
                onChange={(e) => {
                  const newPairs = [...kvPairs];
                  newPairs[index].key = e.target.value;
                  setKvPairs(newPairs);
                }}
              />
              <TextField
                label="Value"
                fullWidth
                value={pair.value}
                onChange={(e) => {
                  const newPairs = [...kvPairs];
                  newPairs[index].value = e.target.value;
                  setKvPairs(newPairs);
                }}
              />
              <IconButton
                aria-label="delete"
                onClick={() => {
                  if (kvPairs.length === 1) {
                    setStatus({
                      type: "warning",
                      message: "At least one field is required.",
                    });
                    return;
                  }
                  const updatedPairs = kvPairs.filter((_, i) => i !== index);
                  setKvPairs(updatedPairs);
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}

          <Button
            onClick={() => setKvPairs([...kvPairs, { key: "", value: "" }])}
            size="small"
          >
            + Add More
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>

          <Button
            variant="contained"
            onClick={() => {
              const cleaned = kvPairs.filter((kv) => kv.key && kv.value);
              const newSection = {
                name: newConfigName,
                data: cleaned,
              };

              if (!newConfigName || cleaned.length === 0) {
                setStatus({
                  type: "warning",
                  message:
                    "Please enter a configuration name and at least one key-value pair.",
                });
                return;
              }

              setCustomSections((prev) => [...prev, newSection]);
              setServerState((prev) => ({
                ...prev,
                [newConfigName]: {
                  selectedServer: "1",
                  servers: ["1"],
                  configs: {
                    1: Object.fromEntries(
                      cleaned.map(({ key, value }) => [key, value])
                    ),
                  },
                },
              }));
              setActiveSection(newConfigName);
              setDialogOpen(false);
              setNewConfigName("");
              setKvPairs([{ key: "", value: "" }]);

              setStatus({
                type: "success",
                message: `New configuration "${newConfigName}" created successfully.`,
              });
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ ...renameDialog, open: false })}
      >
        <DialogTitle>Rename Server</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Server Name"
            value={renameDialog.newName}
            onChange={(e) =>
              setRenameDialog({ ...renameDialog, newName: e.target.value })
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRenameDialog({ ...renameDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const { oldName, newName } = renameDialog;

              if (!newName.trim()) {
                setStatus({
                  type: "warning",
                  message: "Server name cannot be empty.",
                });
                return;
              }

              if (oldName === newName) {
                setRenameDialog({ ...renameDialog, open: false });
                return;
              }

              setServerState((prev) => {
                const currentSection = prev[activeSection];
                const updatedServers = currentSection.servers.map((s) =>
                  s === oldName ? newName : s
                );

                const updatedConfigs = {};
                Object.entries(currentSection.configs).forEach(([key, val]) => {
                  updatedConfigs[key === oldName ? newName : key] = val;
                });

                return {
                  ...prev,
                  [activeSection]: {
                    ...currentSection,
                    servers: updatedServers,
                    selectedServer:
                      currentSection.selectedServer === oldName
                        ? newName
                        : currentSection.selectedServer,
                    configs: updatedConfigs,
                  },
                };
              });

              setRenameDialog({ open: false, oldName: "", newName: "" });
              setStatus({
                type: "success",
                message: `Server renamed to "${renameDialog.newName}"`,
              });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LDAPConfig;
