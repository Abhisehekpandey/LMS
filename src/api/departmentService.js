// src/services/departmentService.js
import axios from "axios";


export const createDepartment = async (payload) => {
  try {
    const response = await axios.post(
      `/tenants/departments`,
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
