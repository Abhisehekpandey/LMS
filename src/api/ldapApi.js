import axios from "axios";

export const detectPort = async (host,port) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/dtectPort`,
    { host, port },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  return response.data;
};



export const saveLdapCredentials = async ({ host, port, userDn, password }) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/saveCredential`,
    {
      host,
      port,
      userDn,
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  return response.data;
};



export const detectBaseDn = async ({
  host,
  port,
  userDn,
  password,
  baseDn,
}) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/detectBaseDN`,
    {
      host,
      port,
      userDn,
      password,
      baseDn,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  return response.data;
};



export const testBaseDn = async ({ host, port, userDn, password, baseDn }) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/detectBaseDN`,
    {
      host,
      port,
      userDn,
      password,
      baseDn,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  return response.data;
};



export const saveLdapConfig = async (config) => {
  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/saveConfig`,
    config,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
  return response.data;
};
  
  
  
  