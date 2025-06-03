// src/services/departmentService.js
import axios from "axios";


export const createDepartment = async (payload) => {
  try {
    const response = await axios.post(
      `tenants/departments`,
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




export const getDepartments = async () => {
  try {
    const response = await axios.get(`tenants/departments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });
    console.log(">>>res11111",response.data.content)
    return response.data.content
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    throw error;
  }
};





export const createRole = async (payload) => {
  try {
    const { department, role } = payload;

    const rolesArray = [
      { roleName: role } 
    ];

    console.log(">>roesArray",rolesArray)

    const response = await axios.post(
      `/tenants/departments/${department}/roles`,
      rolesArray, 
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          'Content-Type': 'application/json',
        },
      }
    );

          console.log("response",response.data.uniqueRoles)
    return response.data.uniqueRoles 

  } catch (error) {
    console.error('createRole error:', error);
    throw error;
  }
};


