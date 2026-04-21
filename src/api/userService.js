// src/api/userCreationService.js

import axios from "axios";

export const createUsers = async (users) => {
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
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error creating users:", error);
    throw error;
  }
};

// OLD: fetchUsers sent page/size as headers — API now uses query params
// OLD: export const fetchUsers = async (page = 0, size = 10) => {
//   const response = await axios.get(`${window.__ENV__.REACT_APP_ROUTE}/tenants/users`, {
//     headers: {
//       Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
//       username: `${sessionStorage.getItem("adminEmail")}`,
//       pageNumber: page.toString(),
//       pageSize: size.toString(),
//     },
//   });
//   return response.data;
// };

// NEW: page/size as query params (1-based); also accepts optional searchColumn/searchQuery
export const fetchUsers = async (
  page = 0,
  size = 10,
  searchColumn = "",
  searchQuery = "",
  filter = "",
) => {
  try {
    const params = {
      page: page + 1, // convert 0-based (MUI) → 1-based (API)
      size,
      searchColumn: searchColumn,
      searchQuery: searchQuery,
    };

    if (filter) {
      params.filter = filter.toLowerCase();
    }

    const response = await axios.get(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/users`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
        params,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const toggleUserStatusByUsername = async (users, pageNumber) => {
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
      },
    ); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const activateAll = async (users) => {
  const token = sessionStorage.getItem("authToken"); // Adjust key if different
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/users/status?appName=TeamSync`,
      users,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
  search = "",
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
    },
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
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};

// OLD searchUsers (/tenants/search with pageNumber/pageSize) - COMMENTED OUT
// export const searchUsers = async (
//   page = 0,
//   size = 10,
//   searchColumn = "",
//   searchQuery = ""
// ) => {
//   try {
//     const response = await axios.get(
//       `${window.__ENV__.REACT_APP_ROUTE}/tenants/search`,
//       {
//         headers: {
//           Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
//           username: `${sessionStorage.getItem("adminEmail")}`,
//         },
//         params: {
//           pageNumber: page,  // OLD param name
//           pageSize: size,    // OLD param name
//           searchColumn,
//           searchQuery,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Failed to search users:", error);
//     throw error;
//   }
// };

export const searchUsers = async (
  page = 0, // 0-based from component (MUI TablePagination)
  size = 10,
  searchColumn = "",
  searchQuery = "",
) => {
  try {
    const response = await axios.get(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/search/users`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
        params: {
          page: page + 1, // convert 0-based → 1-based index
          size,
          searchColumn,
          searchQuery,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw error;
  }
};

export const getTenantPermissions = async () => {
  try {
    const response = await axios.get(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/get-tenant-permissions`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          username: `${sessionStorage.getItem("adminEmail")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to check tenant permissions:", error);
    throw error;
  }
};
