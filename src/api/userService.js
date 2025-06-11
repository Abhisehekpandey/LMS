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





export const fetchUsers = async (page=0) => {
  try {
    const response = await axios.get(`/tenants/users`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          pageNumber: page.toString(), // send page number as header
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
  console.log(">>>>>aaa",users)
  console.log(">>>>bbb",pageNumber)
   const token = sessionStorage.getItem("authToken"); // Adjust key if different
   const adminEmail=sessionStorage.getItem("adminEmail")
    try {
    const response = await axios.post(`/dms_service_LM/api/dms_admin_service/setUserData`, users,
       {
        headers: {
          Authorization: `Bearer ${token}`,
          pageNumber: pageNumber.toString(), // or just pageNumber if backend expects number
          userName:adminEmail
        },
      }
    ); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const activateAll = async (users) => {
    const token = sessionStorage.getItem("authToken"); // Adjust key if different
  try {
    const response = await axios.post("/users/status?appName=TeamSync", users,
       {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ); // ❌ no page param
    return response.data;
  } catch (error) {
    console.error("Error activating users by ID:", error);
    throw error;
  }
};

