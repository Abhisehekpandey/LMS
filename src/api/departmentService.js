// src/services/departmentService.js
import axios from "axios";

export const createDepartment = async (payload) => {
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create department:", error);
    throw error;
  }
};

export const getDepartments = async (page = 0, pageSize = 10, search = "") => {
  try {
    const response = await axios.get(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
        params: {
          search, // Optional search param
          pageNumber: page,
          pageSize: pageSize,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    throw error;
  }
};

export const createRole = async (payload) => {
  try {
    const { department, role, isAdmin, appRole } = payload;

    const rolesArray = [{ roleName: role, isAdmin, appRole }];

    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/${department}/roles`,
      rolesArray,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
      },
    );

    return response.data.uniqueRoles;
  } catch (error) {
    console.error("createRole error:", error);
    throw error;
  }
};

export const updateDepartment = async (payload) => {
  return await axios.put(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/update`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        username: `${sessionStorage.getItem("adminEmail")}`,
      },
    },
  );
};

export const deleteDepartment = async (deptName) => {
  return await axios.delete(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/department`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        username: `${sessionStorage.getItem("adminEmail")}`,
      },
      params: { deptName },
    },
  );
};

export const updateDepartmentStorage = async ({ deptName, allowedStorage }) => {
  return await axios.put(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/updateDepartmentStorage`,
    { deptName, allowedStorage },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        username: `${sessionStorage.getItem("adminEmail")}`,
      },
    },
  );
};

export const updateDepartmentStoragePermission = async (
  permissionPayload,
  pageNumber,
) => {
  const token = sessionStorage.getItem("authToken");
  const adminEmail = sessionStorage.getItem("adminEmail");

  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/dms_service_LM/api/dms_admin_service/setDeptData`,
      permissionPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          pageNumber: pageNumber.toString(),
          userName: adminEmail,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update department storage permission:", error);
    throw error;
  }
};

export const deleteRole = async (roleId) => {
  return await axios.delete(`${window.__ENV__.REACT_APP_ROUTE}/tenants/role`, {
    params: {
      roleId,
    },
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      username: `${sessionStorage.getItem("adminEmail")}`,
    },
  });
};

export const getUserStorage = async (page = 1, size = 7, sort = "HTL") => {
  const response = await axios.get(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/dashboard/getUserStorage`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        username: sessionStorage.getItem("adminEmail"),
      },
      params: { page, size, sort },
    },
  );
  return response.data;
};

export const getDeptStorage = async (page = 1, size = 7, sort = "HTL") => {
  const response = await axios.get(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/dashboard/getDeptStorage`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        username: sessionStorage.getItem("adminEmail"),
      },
      params: { page, size, sort },
    },
  );
  return response.data;
};

// kunal's code
export const getDashboardStats = async () => {
  const response = await axios.get(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/dashboard/getStats`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        username: sessionStorage.getItem("adminEmail"),
      },
    },
  );
  return response.data;
};
