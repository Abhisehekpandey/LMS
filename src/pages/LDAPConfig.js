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

  // EmailJS Configuration (Hardcoded as requested)
  const emailJsConfig = {
    // serviceId: "service_3k3a7ep",
    serviceId: "service_ndez4md",
    templateId: "template_f6fghf6",
    publicKey: "oL2IlUt62rbTK2_vD",
  };

  // SMS Gateway Configuration (Twilio)
  // Get these from: https://www.twilio.com/console
  const smsBridgeConfig = {
    accountSid: window.__ENV__.REACT_APP_TWILIO_ACCOUNT_SID || "AC_PLACEHOLDER",
    authToken: window.__ENV__.REACT_APP_TWILIO_AUTH_TOKEN || "PLACEHOLDER_TOKEN",
    fromPhone: window.__ENV__.REACT_APP_TWILIO_FROM_PHONE || "+1234567890",
  };

  // WhatsApp Gateway Configuration (Ultramsg)
  const ultramsgConfig = {
    instanceId: window.__ENV__.REACT_APP_ULTRAMSG_INSTANCE_ID || "instance_placeholder",
    token: window.__ENV__.REACT_APP_ULTRAMSG_TOKEN || "token_placeholder",
  };

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
        return ["Send Test Email"];
      case "SMS CONFIGURATION":
        return ["Send Test SMS"];
      case "WHATSAPP CONFIGURATION":
        return ["Send Test WhatsApp"];
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
                ></Grid>
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

                        // if (value === "group") {
                        //   const configId =
                        //     sessionStorage.getItem("ldapConfigId");

                        //   if (!configId) {
                        //     setStatus({
                        //       type: "warning",
                        //       message:
                        //         "Configuration ID not found. Please save configuration first.",
                        //     });
                        //     return;
                        //   }

                        //   try {
                        //     setStatus({
                        //       type: "info",
                        //       message: "Fetching groups...",
                        //     });
                        //     const groups = await fetchGroupsByObjectClass(
                        //       configId
                        //     );
                        //     console.log("groupssss",groups)
                        //     setAvailableGroupGroups(groups);
                        //     setStatus({
                        //       type: "success",
                        //       message: "Groups fetched successfully.",
                        //     });
                        //   } catch (error) {
                        //     setStatus({
                        //       type: "error",
                        //       message:
                        //         error?.response?.data?.message ||
                        //         "Failed to fetch groups.",
                        //     });
                        //   }
                        // }
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

                            const response = await fetchGroupsByObjectClass(
                              configId
                            );

                            // ✅ Always extract array safely
                            const groupsArray = Array.isArray(
                              response.groupsExtracted
                            )
                              ? response.groupsExtracted
                              : [];

                            setAvailableGroupGroups(groupsArray);

                            setStatus({
                              type: "success",
                              message: `Fetched ${groupsArray.length} group(s) successfully.`,
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
          <Typography variant="h6" gutterBottom color="primary">
            Send Test Email
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            Test your gateway by sending a test message. This uses a firewall-safe API bridge.
          </Typography>

          <TextField
            fullWidth
            label="Recipient Email"
            value={config.recipientEmail || ""}
            onChange={(e) =>
              handleChange({
                target: { name: "recipientEmail", value: e.target.value },
              })
            }
          />
          <TextField
            fullWidth
            label="Subject"
            sx={{ mt: 2 }}
            value={config.subject || ""}
            onChange={(e) =>
              handleChange({
                target: { name: "subject", value: e.target.value },
              })
            }
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            sx={{ mt: 2 }}
            value={config.message || ""}
            onChange={(e) =>
              handleChange({
                target: { name: "message", value: e.target.value },
              })
            }
          />

          <Button
            variant="contained"
            sx={{ mt: 3, px: 4, py: 1.5 }}
            onClick={async () => {
              try {
                setStatus({ type: "info", message: "Sending test email..." });

                const data = {
                  service_id: emailJsConfig.serviceId,
                  template_id: emailJsConfig.templateId,
                  user_id: emailJsConfig.publicKey,
                  template_params: {
                    subject: config.subject,
                    message: config.message,
                    to_email: config.recipientEmail,
                  },
                };

                const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                });

                if (response.ok) {
                  // ✅ Clear fields after success
                  setServerState((prev) => ({
                    ...prev,
                    [activeSection]: {
                      ...prev[activeSection],
                      configs: {
                        ...prev[activeSection].configs,
                        [selectedServer]: {
                          ...prev[activeSection].configs[selectedServer],
                          recipientEmail: "",
                          subject: "",
                          message: "",
                        },
                      },
                    },
                  }));

                  setStatus({
                    type: "success",
                    message: "Test email sent successfully!",
                  });
                } else {
                  const errorText = await response.text();
                  setStatus({
                    type: "error",
                    message: `Failed to send: ${errorText}`,
                  });
                }
              } catch (error) {
                setStatus({
                  type: "error",
                  message: error?.message || "Failed to send test email.",
                });
              }
            }}
          >
            Send Test Email
          </Button>
        </Box>,
      ],

      "SMS CONFIGURATION": [
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Send Test SMS
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            Test your SMS gateway integration by sending a test message.
          </Typography>

          <TextField
            fullWidth
            label="Phone Number"
            name="recipientPhone"
            value={config.recipientPhone || ""}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={2}
            name="smsMessage"
            value={config.smsMessage || ""}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 3, px: 4, py: 1.5 }}
            onClick={async () => {
              try {
                setStatus({ type: "info", message: "Sending test SMS..." });

                // Twilio SMS API Call
                const keys = smsBridgeConfig;
                // Standard Twilio API Endpoint
                const url = `https://api.twilio.com/2010-04-01/Accounts/${keys.accountSid}/Messages.json`;

                // Twilio uses "Basic Auth" (AccountSID : AuthToken)
                const authHeader = "Basic " + btoa(`${keys.accountSid}:${keys.authToken}`);

                // Payload must be URL-Encoded Form Data for Twilio
                const formData = new URLSearchParams();
                formData.append("To", config.recipientPhone);
                formData.append("From", keys.fromPhone);
                formData.append("Body", config.smsMessage);

                const response = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: authHeader,
                  },
                  body: formData,
                });

                if (response.ok) {
                  // ✅ Clear fields after success
                  setServerState((prev) => ({
                    ...prev,
                    [activeSection]: {
                      ...prev[activeSection],
                      configs: {
                        ...prev[activeSection].configs,
                        [selectedServer]: {
                          ...prev[activeSection].configs[selectedServer],
                          recipientPhone: "",
                          smsMessage: "",
                        },
                      },
                    },
                  }));

                  setStatus({
                    type: "success",
                    message: "Test SMS sent successfully!",
                  });
                } else {
                  // For demo purposes, if the URL is dummy, this will likely fail
                  // You can uncomment the below line to FORCE SUCCESS for UI testing if needed:
                  // setStatus({ type: "success", message: "Test SMS sent! (Simulated)" }); return;

                  const errorText = await response.text();
                  setStatus({
                    type: "error",
                    message: `Gateway Error: ${errorText || response.statusText}`,
                  });
                }
              } catch (error) {
                setStatus({
                  type: "error",
                  message: `Network Error: ${error.message}`,
                });
              }
            }}
          >
            Send Test SMS
          </Button>
        </Box>,
      ],
      "WHATSAPP CONFIGURATION": [
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Send Test WhatsApp
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            Test your Ultramsg WhatsApp integration.
          </Typography>

          <TextField
            fullWidth
            label="WhatsApp Number"
            name="recipientWhatsapp"
            value={config.recipientWhatsapp || ""}
            onChange={handleChange}
            placeholder="e.g. 14155552671"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={2}
            name="whatsappMessage"
            value={config.whatsappMessage || ""}
            onChange={handleChange}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 3, px: 4, py: 1.5 }}
            onClick={async () => {
              try {
                setStatus({
                  type: "info",
                  message: "Sending test WhatsApp...",
                });

                // Ultramsg API Call
                const instanceId = ultramsgConfig.instanceId;
                const token = ultramsgConfig.token;
                const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

                const payload = {
                  token: token,
                  to: config.recipientWhatsapp,
                  body: config.whatsappMessage,
                };

                const response = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                });

                if (response.ok) {
                  // ✅ Clear fields after success
                  setServerState((prev) => ({
                    ...prev,
                    [activeSection]: {
                      ...prev[activeSection],
                      configs: {
                        ...prev[activeSection].configs,
                        [selectedServer]: {
                          ...prev[activeSection].configs[selectedServer],
                          recipientWhatsapp: "",
                          whatsappMessage: "",
                        },
                      },
                    },
                  }));

                  setStatus({
                    type: "success",
                    message: "Test WhatsApp sent successfully!",
                  });
                } else {
                  const errorText = await response.text();
                  setStatus({
                    type: "error",
                    message: `Gateway Error: ${errorText || response.statusText}`,
                  });
                }
              } catch (error) {
                setStatus({
                  type: "error",
                  message: `Network Error: ${error.message}`,
                });
              }
            }}
          >
            Send Test WhatsApp
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
        minHeight: "100vh",
        gap: 3,
        px: 3,
        py: 4,
        width: "85%",
        margin: "auto",
        background: isDark
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
      }}
    >
      <Box sx={{ width: 260 }}>
        <Accordion
          expanded
          sx={{
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px !important",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 8px 32px rgba(0, 0, 0, 0.1)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            sx={{
              "& .MuiAccordionSummary-content": { margin: 0 },
              padding: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", p: 2 }}>
              <Box
                sx={{
                  background: isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#ffffff",
                  color: isDark ? "#fff" : "#1976d2",
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2,
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(25, 118, 210, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: isDark
                      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                      : "0 4px 12px rgba(25, 118, 210, 0.15)",
                  },
                }}
              >
                <SettingsIcon sx={{ fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>SETTINGS</Typography>
              </Box>

              <Tooltip title="Add Configuration">
                <IconButton
                  onClick={() => setDialogOpen(true)}
                  sx={{
                    ml: 1.5,
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(25, 118, 210, 0.1)",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(25, 118, 210, 0.2)",
                    color: isDark ? "#fff" : "#1976d2",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: isDark
                        ? "rgba(255, 255, 255, 0.15)"
                        : "rgba(25, 118, 210, 0.2)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 1.5 }}>
            <List sx={{ py: 0 }}>
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
                      onClick={() => {
                        setActiveSection(section);
                        setTabIndex(0);
                      }}
                      sx={{
                        flexGrow: 1,
                        borderRadius: 2,
                        mb: 0.5,
                        transition: "all 0.3s ease",
                        "&.Mui-selected": {
                          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                          },
                        },
                        "&:hover": {
                          background: isDark
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(25, 118, 210, 0.08)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={section}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          fontWeight: activeSection === section ? 600 : 500,
                        }}
                      />
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
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 8px 32px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box
            sx={{
              background: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "#ffffff",
              color: isDark ? "#fff" : "#1976d2",
              px: 3,
              py: 2,
              borderRadius: 2.5,
              mb: 3,
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(25, 118, 210, 0.2)",
              boxShadow: isDark
                ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                : "0 2px 8px rgba(25, 118, 210, 0.1)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              {activeSection === "LDAP CONFIGURATION" && <DnsIcon />}
              {activeSection === "EMAIL CONFIGURATION" && <EmailIcon />}
              {activeSection === "SMS CONFIGURATION" && <SmsIcon />}
              {activeSection === "WHATSAPP CONFIGURATION" && <WhatsAppIcon />}
              {activeSection}
            </Typography>
          </Box>

          {defaultSections.includes(activeSection) && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={selectedServer}
                  onChange={handleServerChange}
                  onOpen={() => setIsServerDropdownOpen(true)}
                  onClose={() => setIsServerDropdownOpen(false)}
                  startAdornment={<StorageIcon sx={{ mr: 1, color: "#1976d2" }} />}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(25, 118, 210, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 250,
                        borderRadius: 12,
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
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                      }}
                    >
                      <Typography>Server {s}</Typography>

                      {isServerDropdownOpen && (
                        <Tooltip title="Rename Server">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
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
                  onClick={handleAddServer}
                  sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    color: "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Server">
                <IconButton
                  onClick={handleDeleteServer}
                  sx={{
                    background: isDark
                      ? "rgba(244, 67, 54, 0.2)"
                      : "rgba(244, 67, 54, 0.1)",
                    color: "#f44336",
                    border: "1px solid rgba(244, 67, 54, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(244, 67, 54, 0.2)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {defaultSections.includes(activeSection) && getTabsForSection().length > 1 && (
            <Tabs
              value={tabIndex}
              onChange={(e, newValue) => setTabIndex(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 3,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  minHeight: 48,
                  transition: "all 0.3s ease",
                  "&.Mui-selected": {
                    color: "#1976d2",
                    fontWeight: 600,
                  },
                  "&:hover": {
                    color: "#1976d2",
                    background: isDark
                      ? "rgba(25, 118, 210, 0.1)"
                      : "rgba(25, 118, 210, 0.05)",
                  },
                },
              }}
            >
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
