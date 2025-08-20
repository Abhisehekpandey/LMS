// ✅ Enhanced UI Version
import React, { useState, useEffect } from "react";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import GroupsIcon from "@mui/icons-material/Groups";
import Snackbar from "@mui/material/Snackbar";
import SettingsIcon from "@mui/icons-material/Settings"; // Make sure this is imported
import SmsIcon from "@mui/icons-material/Sms";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import DnsIcon from "@mui/icons-material/Dns";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

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
  InputLabel,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Chip from "@mui/material/Chip";

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
import {
  detectPort,
  saveLdapCredentials,
  detectBaseDn,
  testBaseDn,
  saveLdapConfig,
  fetchGroupsByObjectClass,
  verifyAndCountUsers,
} from "../api/ldapApi";

const sectionDefaults = {
  "LDAP CONFIGURATION": {
    host: "",
    port: "",
    username: "",
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
  // Add these inside your component's state
  const [isServerDone, setIsServerDone] = useState(false);
  const [isUsersDone, setIsUsersDone] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newConfigName, setNewConfigName] = useState("");
  const [kvPairs, setKvPairs] = useState([{ key: "", value: "" }]);
  const [customSections, setCustomSections] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [sslCertificate, setSslCertificate] = useState(null);
  const [emailSslCertificate, setEmailSslCertificate] = useState(null);
  const [smsSslCertificate, setSmsSslCertificate] = useState(null);
  const [whatsappSslCertificate, setWhatsappSslCertificate] = useState(null);
  // const [selectedObjectClass, setSelectedObjectClass] = useState("");
  const [selectedObjectClass, setSelectedObjectClass] = useState("group");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(""); // or [] for multi-select
  const [groupListBox, setGroupListBox] = useState([]); // holds displayed items
  const [selectedGroupObjectClass, setSelectedGroupObjectClass] = useState("");

  const [availableGroupGroups, setAvailableGroupGroups] = useState([]);
  const [selectedGroupGroup, setSelectedGroupGroup] = useState("");
  const [groupListBoxGroup, setGroupListBoxGroup] = useState([]);
  const [groupCount, setGroupCount] = useState(null);
  const [userCount, setUserCount] = useState(null);

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
  const [useSsl, setUseSsl] = useState(false);
  const [useEmailSsl, setUseEmailSsl] = useState(false);
  const [useSmsSsl, setUseSmsSsl] = useState(false);
  const [useWhatsappSsl, setUseWhatsappSsl] = useState(false);

  const current = serverState[activeSection];
  const selectedServer = current.selectedServer;
  const servers = current.servers;
  const config = current.configs[selectedServer];

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
            <Grid container spacing={2} sx={{ mt: 3 }}>
              {Object.entries(config).map(([key, value], index) => (
                <React.Fragment key={index}>
                  <Grid item xs={5}>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        minHeight: "56px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        variant="standard"
                        fullWidth
                        value={key}
                        InputProps={{ disableUnderline: true, readOnly: true }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={5}>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        minHeight: "56px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        variant="standard"
                        fullWidth
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
                        InputProps={{ disableUnderline: true }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={2} display="flex" alignItems="center">
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
                  </Grid>
                </React.Fragment>
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
          // <Slide direction="left" in timeout={300}>
          <Fade in timeout={300}>
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

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={useSsl}
                          onChange={(e) => setUseSsl(e.target.checked)}
                        />
                      }
                      label="Use SSL Certificate"
                    />
                  </Grid>

                  {useSsl && (
                    <Grid item xs={12}>
                      <Button variant="outlined" component="label" fullWidth>
                        Upload SSL Certificate
                        <input
                          type="file"
                          hidden
                          accept=".crt,.pem,.cer,.der"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSslCertificate(file);
                              setStatus({
                                type: "success",
                                message: `SSL Certificate "${file.name}" selected.`,
                              });
                            }
                          }}
                        />
                      </Button>
                      {sslCertificate && (
                        <Typography
                          variant="caption"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Selected: {sslCertificate.name}
                        </Typography>
                      )}
                    </Grid>
                  )}
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
                            onClick={async () => {
                              if (!config.host || !config.port) {
                                setStatus({
                                  type: "warning",
                                  message:
                                    "Host and Port are required to detect port.",
                                });
                                return;
                              }
                              try {
                                setStatus({
                                  type: "info",
                                  message: "Detecting port...",
                                });
                                const detectedPort = await detectPort({
                                  host: config.host,
                                  port: config.port,
                                });

                                const updated = {
                                  ...config,
                                  port: detectedPort.ActivePort,
                                };
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
                                setStatus({
                                  type: "success",
                                  message: `Detected Port: ${detectedPort.ActivePort}`,
                                });
                              } catch (error) {
                                setStatus({
                                  type: "error",
                                  message:
                                    error?.response?.data?.message ||
                                    "Failed to detect port.",
                                });
                              }
                            }}
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
                    name="username"
                    value={config.username}
                    onChange={handleChange}
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
                  />
                </Grid>
                <Grid
                  item
                  xs={5}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  {/* <Button
                    fullWidth
                    variant="contained"
                    onClick={async () => {
                      const { host, port, username, password } = config;

                      if (!host || !port || !username || !password) {
                        setStatus({
                          type: "warning",
                          message:
                            "All fields (Host, Port, User DN, Password) are required.",
                        });
                        return;
                      }

                      try {
                        setStatus({
                          type: "info",
                          message: "Saving credentials...",
                        });
                        const result = await saveLdapCredentials({
                          host,
                          port,
                          username,
                          password,
                        });
                        console.log("result", result);
                        setStatus({
                          type: "success",
                          message: result || "Credentials saved successfully.",
                        });
                      } catch (error) {
                        setStatus({
                          type: "error",
                          message:
                            error?.response?.data?.message ||
                            "Failed to save credentials.",
                        });
                      }
                    }}
                  >
                    Save
                  </Button> */}
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
                            onClick={async () => {
                              const { host, port, username, password } = config;

                              if (!host || !port || !username || !password) {
                                setStatus({
                                  type: "warning",
                                  message:
                                    "Host, Port, User DN, and Password are required.",
                                });
                                return;
                              }

                              try {
                                setStatus({
                                  type: "info",
                                  message: "Detecting Base DN...",
                                });

                                const result = await detectBaseDn({
                                  host,
                                  port,
                                  username,
                                  password,
                                });

                                if (
                                  Array.isArray(result) &&
                                  result.length > 0
                                ) {
                                  const updated = {
                                    ...config,
                                    baseDn: result[0],
                                  };

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

                                  setStatus({
                                    type: "success",
                                    message: `Base DN detected: ${result[0]}`,
                                  });
                                } else {
                                  setStatus({
                                    type: "warning",
                                    message: "No Base DN returned from server.",
                                  });
                                }
                              } catch (error) {
                                setStatus({
                                  type: "error",
                                  message:
                                    error?.response?.data?.message ||
                                    "Failed to detect Base DN.",
                                });
                              }
                            }}
                          >
                            Detect Base DN
                          </Button>

                          <Button
                            size="small"
                            onClick={async () => {
                              const { host, port, username, password, baseDn } =
                                config;

                              if (
                                !host ||
                                !port ||
                                !username ||
                                !password ||
                                !baseDn
                              ) {
                                setStatus({
                                  type: "warning",
                                  message:
                                    "All fields including Base DN are required to test it.",
                                });
                                return;
                              }

                              try {
                                setStatus({
                                  type: "info",
                                  message: "Testing Base DN...",
                                });

                                const result = await testBaseDn({
                                  host,
                                  port,
                                  username,
                                  password,
                                  baseDn,
                                });

                                setStatus({
                                  type: "success",
                                  message:
                                    result || "Base DN tested successfully.",
                                });
                              } catch (error) {
                                setStatus({
                                  type: "error",
                                  message:
                                    error?.response?.data?.message ||
                                    "Failed to validate Base DN with provided credentials.",
                                });
                              }
                            }}
                          >
                            Test Base DN
                          </Button>
                        </>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
              >
                <Button
                  variant="contained"
                  onClick={async () => {
                    const { host, port, username, password, baseDn } = config;

                    if (!host || !port || !username || !password || !baseDn) {
                      setStatus({
                        type: "warning",
                        message:
                          "Please fill all fields before saving the configuration.",
                      });
                      return;
                    }

                    try {
                      setStatus({
                        type: "info",
                        message: "Saving configuration...",
                      });

                      const result = await saveLdapConfig({
                        host,
                        port,
                        username,
                        password,
                        baseDn,
                      });
                      console.log("rrrr", result);

                      if (result?.id) {
                        setServerState((prev) => ({
                          ...prev,
                          [activeSection]: {
                            ...prev[activeSection],
                            configId: result.id, // ✅ save config ID for later
                          },
                        }));
                        sessionStorage.setItem("ldapConfigId", result.id);
                      }

                      setStatus({
                        type: "success",
                        message:
                          result?.message ||
                          "LDAP configuration saved successfully.",
                      });
                      setIsServerDone(true);

                      setTabIndex(1);
                    } catch (error) {
                      setStatus({
                        type: "error",
                        message:
                          error?.response?.data?.message ||
                          "Failed to save LDAP configuration.",
                      });
                    }
                  }}
                >
                  Save Configuration
                </Button>
              </Grid>
            </Box>
          </Fade>
          // </Slide>
        );
      } else if (tabIndex === 1) {
        return (
          // <Slide direction="left" in timeout={300}>
          <Fade in timeout={300}>
            <Box>
              <Typography mb={2}>
                Listing and searching for users is constrained by these
                criteria:
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Only these object classes"
                      value={selectedObjectClass}
                      onChange={(e) => setSelectedObjectClass(e.target.value)}
                      placeholder="Enter object class"
                    />
                    <Button
                      variant="contained"
                      onClick={async () => {
                        const value = selectedObjectClass.trim();
                        if (!value) {
                          setStatus({
                            type: "warning",
                            message: "Please enter an object class.",
                          });
                          return;
                        }

                        const configId = sessionStorage.getItem("ldapConfigId");
                        if (!configId) {
                          setStatus({
                            type: "warning",
                            message:
                              "Configuration ID not found. Please save configuration first.",
                          });
                          return;
                        }

                        try {
                          setStatus({
                            type: "info",
                            message: "Fetching groups...",
                          });

                          // const groupsResponse = await fetchGroupsByObjectClass(
                          //   configId
                          // );
                          const groupsResponse = await fetchGroupsByObjectClass(
                            configId,
                            selectedObjectClass
                          );


                          const groupsArray = Array.isArray(
                            groupsResponse.groupsExtracted
                          )
                            ? groupsResponse.groupsExtracted
                            : [];

                          const normalizedGroups = groupsArray.map((g) => ({
                            name: g.name,
                            groupDn: g.groupDn,
                          }));

                          setAvailableGroups(normalizedGroups);

                          if (normalizedGroups.length > 0)
                            setSelectedGroup(normalizedGroups[0].name);

                          setStatus({
                            type: "success",
                            message: "Groups fetched successfully.",
                          });
                          console.log("Fetched groups:", normalizedGroups);
                        } catch (error) {
                          setStatus({
                            type: "error",
                            message:
                              error?.response?.data?.message ||
                              "Failed to fetch groups.",
                          });
                        }
                      }}
                    >
                      Go
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Only from these Groups
                  </Typography>

                  <Box
                    sx={{
                     
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      px: 2,
                      py: 1,
                      minHeight: "56px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      maxHeight: 200, // 👈 about 5 items depending on font size
                      overflowY: "auto", // 👈 adds scrollbar if more than 5
                    }}
                  >
                    {Array.isArray(availableGroups) &&
                    availableGroups.length > 0 ? (
                      availableGroups.map((group, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={groupListBox.includes(group.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setGroupListBox((prev) => [
                                    ...prev,
                                    group.name,
                                  ]);
                                } else {
                                  setGroupListBox((prev) =>
                                    prev.filter((name) => name !== group.name)
                                  );
                                }
                              }}
                            />
                          }
                          label={group.name}
                        />
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No groups available
                      </Typography>
                    )}
                  </Box>

                  <Box mt={2}>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        if (groupListBox.length === 0) {
                          setStatus({
                            type: "warning",
                            message: "Please select at least one group to add.",
                          });
                          return;
                        }

                        const selectedGroupsObjects = groupListBox
                          .map((name) => {
                            const groupObj = availableGroups.find(
                              (g) => g.name === name
                            );
                            return groupObj
                              ? {
                                  name: groupObj.name,
                                  groupDn: groupObj.groupDn,
                                }
                              : null;
                          })
                          .filter(Boolean);

                        console.log(
                          "Selected Groups Array:",
                          selectedGroupsObjects
                        );

                        try {
                          setStatus({
                            type: "info",
                            message: "Adding selected groups...",
                          });

                          const ldapId = sessionStorage.getItem("ldapConfigId");

                          if (!ldapId) {
                            setStatus({
                              type: "warning",
                              message:
                                "Configuration ID not found. Please save configuration first.",
                            });
                            return;
                          }

                          const response = await axios.post(
                            `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/addUsersToMongoDB/GroupDn/${ldapId}`,
                            selectedGroupsObjects,
                            {
                              headers: {
                                "Content-Type": "application/json",
                                username: sessionStorage.getItem("adminEmail"),
                                Authorization: `Bearer ${sessionStorage.getItem(
                                  "authToken"
                                )}`,
                              },
                            }
                          );

                          setStatus({
                            type: "success",
                            message: "Groups added successfully!",
                          });

                          console.log("API Response:", response.data);

                          setGroupListBox([]);
                          setIsUsersDone(true);
                        } catch (error) {
                          setStatus({
                            type: "error",
                            message:
                              error?.response?.data?.message ||
                              "Failed to add selected groups.",
                          });
                        }
                      }}
                    >
                      Add User
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography mt={1} variant="body2">
                    LDAP Filter: ((objectclass=
                    {selectedObjectClass || "Not Selected"}))
                  </Typography>
                </Grid>

                {/* Verify Users Button */}
                {/* <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        const ldapId = sessionStorage.getItem("ldapConfigId");

                        if (!ldapId) {
                          setStatus({
                            type: "warning",
                            message:
                              "Configuration ID not found. Please save configuration first.",
                          });
                          return;
                        }

                        if (groupListBox.length === 0) {
                          setStatus({
                            type: "warning",
                            message:
                              "Please select at least one group to verify.",
                          });
                          return;
                        }

                        try {
                          setStatus({
                            type: "info",
                            message: "Verifying users...",
                          });

                          const result = await verifyAndCountUsers({
                            ldapId,
                            groupDn: groupListBox,
                          });

                          const savedUsers = result?.savedUsers || [];
                          setUserCount(savedUsers.length);

                          setStatus({
                            type: "success",
                            message: `${savedUsers.length} users found.`,
                          });
                        } catch (error) {
                          setStatus({
                            type: "error",
                            message:
                              error?.response?.data?.message ||
                              "Failed to verify users.",
                          });
                        }
                      }}
                    >
                      Verify settings and count users
                    </Button>

                    {userCount !== null && (
                      <Typography variant="body2">
                        <strong>{userCount}</strong> user(s) found
                      </Typography>
                    )}
                  </Box>
                </Grid> */}
              </Grid>
            </Box>
          </Fade>
        );
      } else if (tabIndex === 2) {
        return (
          <Fade in timeout={300}>
            <Box>
              <Typography mb={2}>
                Groups meeting these criteria are available in Nextcloud:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                    <InputLabel id="group-object-class-label">
                      Only these object classes
                    </InputLabel>
                    <Select
                      labelId="group-object-class-label"
                      value={selectedGroupObjectClass}
                      label="Only these object classes"
                      onChange={async (e) => {
                        const value = e.target.value;
                        setSelectedGroupObjectClass(value);

                        if (value === "group") {
                          const configId =
                            sessionStorage.getItem("ldapConfigId");

                          if (!configId) {
                            setStatus({
                              type: "warning",
                              message:
                                "Configuration ID not found. Please save configuration first.",
                            });
                            return;
                          }

                          try {
                            setStatus({
                              type: "info",
                              message: "Fetching groups...",
                            });
                            const groups = await fetchGroupsByObjectClass(
                              configId
                            );
                            setAvailableGroupGroups(groups);
                            setStatus({
                              type: "success",
                              message: "Groups fetched successfully.",
                            });
                          } catch (error) {
                            setStatus({
                              type: "error",
                              message:
                                error?.response?.data?.message ||
                                "Failed to fetch groups.",
                            });
                          }
                        }
                      }}
                    >
                      <MenuItem value="group">group</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                    <InputLabel id="group-only-from-label">
                      Only from these Groups
                    </InputLabel>
                    <Select
                      labelId="group-only-from-label"
                      value={selectedGroupGroup}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setSelectedGroupGroup(selected);

                        if (!groupListBoxGroup.includes(selected)) {
                          setGroupListBoxGroup((prev) => [...prev, selected]);
                        }
                      }}
                      label="Only from these Groups"
                    >
                      {availableGroupGroups.map((group, index) => (
                        <MenuItem key={index} value={group.name}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Box
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        minHeight: "56px",
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {groupListBoxGroup.length === 0 ? (
                        <Typography color="text.secondary">
                          No groups added
                        </Typography>
                      ) : (
                        groupListBoxGroup.map((name, index) => (
                          <Chip key={index} label={name} />
                        ))
                      )}
                    </Box>

                    <Tooltip title="Add next group from dropdown">
                      <IconButton
                        onClick={() => {
                          const currentIndex = availableGroupGroups.findIndex(
                            (g) => g.name === selectedGroupGroup
                          );
                          const next = availableGroupGroups[currentIndex + 1];
                          if (next && !groupListBoxGroup.includes(next.name)) {
                            setSelectedGroupGroup(next.name);
                            setGroupListBoxGroup((prev) => [
                              ...prev,
                              next.name,
                            ]);
                          }
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Remove last group">
                      <IconButton
                        onClick={() => {
                          setGroupListBoxGroup((prev) => prev.slice(0, -1));
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography mt={1} variant="body2">
                    <Typography sx={{ mt: 2 }}>
                      LDAP Filter:{" "}
                      <code>
                        ((objectclass=
                        {selectedGroupObjectClass || "Not Selected"}))
                      </code>
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Tooltip
                      title={
                        availableGroupGroups.length === 0
                          ? "No groups available to count"
                          : "Click to verify and count groups"
                      }
                    >
                      <span>
                        <Button
                          variant="outlined"
                          disabled={availableGroupGroups.length === 0} // ✅ disables button if list is empty
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => {
                            const count = availableGroupGroups.length;
                            setGroupCount(count);
                            setStatus({
                              type: "info",
                              message: `Verified: ${count} group(s) available.`,
                            });
                          }}
                        >
                          Verify settings and count the groups
                        </Button>
                      </span>
                    </Tooltip>
                    {groupCount !== null && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <GroupsIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Group Count: <strong>{groupCount}</strong>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
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

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useEmailSsl}
                  onChange={(e) => setUseEmailSsl(e.target.checked)}
                />
              }
              label="Use SSL Certificate"
            />
          </Box>

          {useEmailSsl && (
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label" fullWidth>
                Upload SSL Certificate
                <input
                  type="file"
                  hidden
                  accept=".crt,.pem,.cer,.der"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEmailSslCertificate(file);
                      setStatus({
                        type: "success",
                        message: `SSL Certificate "${file.name}" selected for SMTP.`,
                      });
                    }
                  }}
                />
              </Button>
              {emailSslCertificate && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  Selected: {emailSslCertificate.name}
                </Typography>
              )}
            </Box>
          )}

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

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSmsSsl}
                  onChange={(e) => setUseSmsSsl(e.target.checked)}
                />
              }
              label="Use SSL Certificate"
            />
          </Box>

          {useSmsSsl && (
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label" fullWidth>
                Upload SSL Certificate
                <input
                  type="file"
                  hidden
                  accept=".crt,.pem,.cer,.der"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSmsSslCertificate(file);
                      setStatus({
                        type: "success",
                        message: `SSL Certificate "${file.name}" selected for Gateway.`,
                      });
                    }
                  }}
                />
              </Button>
              {smsSslCertificate && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  Selected: {smsSslCertificate.name}
                </Typography>
              )}
            </Box>
          )}

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

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useWhatsappSsl}
                  onChange={(e) => setUseWhatsappSsl(e.target.checked)}
                />
              }
              label="Use SSL Certificate"
            />
          </Box>

          {useWhatsappSsl && (
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label" fullWidth>
                Upload SSL Certificate
                <input
                  type="file"
                  hidden
                  accept=".crt,.pem,.cer,.der"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setWhatsappSslCertificate(file);
                      setStatus({
                        type: "success",
                        message: `SSL Certificate "${file.name}" selected for WhatsApp.`,
                      });
                    }
                  }}
                />
              </Button>
              {whatsappSslCertificate && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  Selected: {whatsappSslCertificate.name}
                </Typography>
              )}
            </Box>
          )}

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
        backgroundColor: isDark ? theme.palette.background.paper : "#ffffff",

        boxShadow: isDark
          ? "0 0 10px rgba(255,255,255,0.05)"
          : "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ width: 230 }}>
        <Accordion expanded>
          <AccordionSummary>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Box
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SettingsIcon sx={{ fontSize: 20 }} />
                <Typography variant="h6">SETTINGS</Typography>
              </Box>

              <Tooltip title="Add Configuration">
                <IconButton
                  color="primary"
                  onClick={() => setDialogOpen(true)}
                  sx={{
                    border: "1px solid #ccc",
                    ml: 2,
                    backgroundColor: "#fff",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <AddIcon />
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
                <IconButton
                  color="primary"
                  onClick={handleAddServer}
                  sx={{
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    ml: 1,
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Server">
                <IconButton
                  color="error"
                  onClick={handleDeleteServer}
                  sx={{
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    ml: 1,
                  }}
                >
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
              {/* {getTabsForSection().map((label) => (
                <Tab key={label} label={label} />
              ))} */}
              {getTabsForSection().map((label) => {
                let disabled = false;
                if (label === "Users" && !isServerDone) disabled = true;
                if (label === "Groups" && !isUsersDone) disabled = true;
                return <Tab key={label} label={label} disabled={disabled} />;
              })}
            </Tabs>
          )}

          <Fade in timeout={300}>
            <Box key={tabIndex}>{renderTabContent()}</Box>
          </Fade>
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
      <Snackbar
        open={!!status.message}
        autoHideDuration={4000}
        onClose={() => setStatus({ type: "info", message: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setStatus({ type: "info", message: "" })}
          severity={status.type}
          sx={{ width: "100%" }}
        >
          {status.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LDAPConfig;
