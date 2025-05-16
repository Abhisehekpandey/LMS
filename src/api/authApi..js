import axios from "axios";

export const signupUser = async (data) => {
  try {
    console.log(process.env.REACT_APP_API_BASE_URL)
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/public/register`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "*/*",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Signup failed" };
  }
};

export const loginUser = async (username, password) => {
  try {
    // Send POST request to the backend login API
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/public/users/login`,
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "*/*",
          appName: "TeamSync",
        },
      }
    );
    return response.data;
  } catch (error) {
    // Handle error (e.g., invalid credentials)
    throw new Error(error.response?.data?.message || "Login failed");
  }
};
