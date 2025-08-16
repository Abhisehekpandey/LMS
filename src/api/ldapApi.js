import axios from "axios";

export const detectPort = async ({ host, port }) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/detect-port`,
    { host, port },
    {
      headers: {
        "Content-Type": "application/json",
        username: `${sessionStorage.getItem("adminEmail")}`,
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  console.log("response1", response);
  return response.data;
};

export const saveLdapCredentials = async ({
  host,
  port,
  username,
  password,
}) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/save-credentials`,
    {
      host,
      port,
      username,
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
        username: `${sessionStorage.getItem("adminEmail")}`,
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );

  return response.data;
};

export const detectBaseDn = async ({ host, port, username, password }) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap//detect-base-dn`,
    {
      host,
      port,
      username,
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
        username: `${sessionStorage.getItem("adminEmail")}`,
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );

  return response.data;
};

export const testBaseDn = async ({
  host,
  port,
  username,
  password,
  baseDn,
}) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/test-base-dn`,
    { host, port, username, password, baseDn },
    {
      headers: {
        "Content-Type": "application/json",
        username: `${sessionStorage.getItem("adminEmail")}`,
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );

  return response.data;
};

export const saveLdapConfig = async (config) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/saveConfiguration`,
    config,
    {
      headers: {
        "Content-Type": "application/json",
        username: `${sessionStorage.getItem("adminEmail")}`,
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );

  return response.data;
};

export const fetchGroupsByObjectClass = async (configId) => {
  const response = await axios.get(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/getAllgroups`,
    {
      headers: {
        "Content-Type": "application/json",
        username: `${sessionStorage.getItem("adminEmail")}`,
        ldapId: configId, // ✅ send as custom header
      },
    }
  );
  console.log("response",response)
  return response.data;
};


// export const verifyAndCountUsers = async ({ ldapId, groupDn }) => {
//   const response = await axios.post(
//     `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/users-from-group`,
//     {
//       ldapId,
//       groupDn,
//     }
//   );
//   console.log("responseFinal",response)
//   return response.data;
// };


export const verifyAndCountUsers = async ({ ldapId, groupDn }) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/api/ldap/addUsersToMongoDB/GroupDn/${ldapId}`,
    { groupDn }, // request body
    {
      headers: {
        username: `${sessionStorage.getItem("adminEmail")}`,
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );

  console.log("responseFinal", response);
  return response.data;
};


