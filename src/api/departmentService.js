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
        },
      }
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
        },
        params: {
          search, // Optional search param
          pageNumber: page,
          pageSize: pageSize,
        },
      }
    );

    console.log(">>> Department API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    throw error;
  }
};

export const createRole = async (payload) => {
  try {
    const { department, role, isAdmin } = payload;

    const rolesArray = [{ roleName: role, isAdmin }];

    console.log(">>roesArray", rolesArray);

    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/departments/${department}/roles`,
      rolesArray,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("response", response.data.uniqueRoles);
    return response.data.uniqueRoles;
  } catch (error) {
    console.error("createRole error:", error);
    throw error;
  }
};





export const updateDepartment = async (payload) => {
  return await axios.put(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/Editdepartments`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    }
  );
};



export const deleteDepartment = async (deptName) => {
  return await axios.delete(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/Editdepartments`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
      params: { deptName },
    }
  );
};

