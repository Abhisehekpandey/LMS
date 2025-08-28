// src/api/userCreationService.js

import axios from "axios";

export const createUsers = async (users) => {
  console.log(">>>users", users);
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/users`,
      Array.isArray(users) ? users : [users], // 👈 send raw array, not object
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
      }
    );
    console.log(">>>>>>rrrr", response);
    return response.data;
  } catch (error) {
    console.error("Error creating users:", error);
    throw error;
  }
};

export const fetchUsers = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/users`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
          pageNumber: page.toString(), // send page number as header
          pageSize: size.toString(), // ✅ add page size as header
        },
      }
    );
    console.log(">>>>userResponse", response);
    return response.data; // Assume it's an array of user objects
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const toggleUserStatusByUsername = async (users, pageNumber) => {
  console.log(">>>>>aaa", users);
  console.log(">>>>bbb", pageNumber);
  const token = sessionStorage.getItem("authToken"); // Adjust key if different
  const adminEmail = sessionStorage.getItem("adminEmail");
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/dms_service_LM/api/dms_admin_service/setUserData`,
      users,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // pageNumber: pageNumber.toString(),
          pageNumber: pageNumber?.toString() ?? "0", // ✅ safe fallback
          userName: adminEmail,
        },
      }
    ); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const activateAll = async (users) => {
  console.log("AllUserss", users);
  const token = sessionStorage.getItem("authToken"); // Adjust key if different
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/users/status?appName=TeamSync`,
      users,
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

export const fetchUsersByDepartment = async (
  deptName,
  pageNumber = 0,
  pageSize = 10,
  search = ""
) => {
  return await axios.get(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/department/users`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        appName: "TeamSync", // ✅ required by backend
        username: `${sessionStorage.getItem("adminEmail")}`,
      },
      params: {
        deptName,
        pageNumber, // ✅ backend expects this
        pageSize, // ✅ backend expects this
        search,
      },
    }
  );
};

export const deleteUsers = async (userIds) => {
  const authToken = sessionStorage.getItem("authToken");
  const username = sessionStorage.getItem("adminEmail");

  const url = `${window.__ENV__.REACT_APP_ROUTE}/tenants/allusers`;

  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        username: username,
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*", // optional but safe
      },
      data: userIds, // ✅ array of IDs directly
    });

    return {
      success: true,
      message: `Successfully deleted ${userIds.length} user(s).`,
      data: response.data,
    };
  } catch (error) {
    console.error("Bulk deletion failed:", error);

    let errorMsg = "Failed to delete user(s).";
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    }

    throw {
      success: false,
      message: errorMsg,
      details: error.response?.data || error,
    };
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await axios.put(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/edituser`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};

export const searchUsers = async (
  page = 0,
  size = 10,
  searchColumn = "",
  searchQuery = ""
) => {
  try {
    const response = await axios.get(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/search`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
        params: {
          pageNumber: page,
          pageSize: size,
          searchColumn,
          searchQuery,
        },
      }
    );
    console.log(">>>>searchUserResponse", response);
    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw error;
  }
};
