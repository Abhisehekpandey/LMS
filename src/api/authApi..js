import axios from "axios";

export const signupUser = async (data) => {
  console.log(process.env.REACT_APP_API_BASE_URL)
  try {
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
     // 🔧 Extract name from username (before @)
     const namePart = username.split("@")[0];
     const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
 
     // ✅ Store derived info in localStorage
     localStorage.setItem(
       "user",
       JSON.stringify({ name: displayName, initial: displayName.charAt(0), role: "Administrator" })
     );
    console.log(">>>>ress",response)
    return response.data;
  } catch (error) {
    // Handle error (e.g., invalid credentials)
    throw new Error(error.response?.data?.message || "Login failed");
  }
};



export const checkDomainAvailability = async (emailDomain) => {
  try {
    console.log(">>domain",emailDomain)
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/public/domains`,
      {
        params: { emailDomain },
      }
    );
    console.log(">>>res",response.data.message)
    return response.data.message;
  } catch (error) {
    console.error("Domain check failed:", error);
    // throw error;
    return "domain already registered"
  }
};

