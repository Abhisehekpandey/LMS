// src/api/userCreationService.js

import axios from "axios";

export const createUsers = async (users) => {
  console.log(">>>users", users);
  try {
    const response = await axios.post(
      `/tenants/users`,
      Array.isArray(users) ? users : [users],  // 👈 send raw array, not object
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating users:", error);
    throw error;
  }
};





export const fetchUsers = async () => {
  try {
    const response = await axios.get(`/tenants/users`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });
    console.log(">>>>userResponse",response)
    return response.data; // Assume it's an array of user objects
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};



export const toggleUserStatusByUsername = async (users,pageNumber) => {
   const token = sessionStorage.getItem("authToken"); // Adjust key if different
    try {
    const response = await axios.put(`/users/status`, users,
       {
        headers: {
          Authorization: `Bearer ${token}`,
          pageNumber: pageNumber.toString(), // or just pageNumber if backend expects number
        },
      }
    ); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    throw error;
  }
};

