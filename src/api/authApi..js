import axios from "axios";

export const signupUser = async (data) => {
  console.log(process.env.REACT_APP_API_BASE_URL);
  try {
    const response = await axios.post(`${window.__ENV__.REACT_APP_ROUTE}/tenants/public/register`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Signup failed" };
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/public/login`,
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
      JSON.stringify({
        name: displayName,
        initial: displayName.charAt(0),
        role: "Administrator",
      })
    );
    console.log(">>>>ress", response);
    return response.data;
  } catch (error) {
    console.log(">>eeerror",error)
    // Handle error (e.g., invalid credentials)
    throw new Error(error.response?.data?.message || "Invalid Credentials check Email and Password ");
  }
};

export const checkDomainAvailability = async (emailDomain) => {
  try {
    const response = await axios.get(`${window.__ENV__.REACT_APP_ROUTE}/tenants/public/domains`, {
      params: { emailDomain },
    });

    return response.data.message;
  } catch (error) {
    console.error("Domain check failed:", error);
    // throw error;
    return "domain already registered";
  }
};

export const resetPassword = async (newPassword, resetToken) => {
  console.log("resetToken",resetToken)
  
  if (!resetToken) throw new Error("Reset token is required");

  const response = await axios.post(
    `${window.__ENV__.REACT_APP_ROUTE}/tenants/public/setPassword`, // your backend endpoint
    {}, // no body, since data is in headers
    {
      headers: {
        token: resetToken, // custom header for reset token
        password: newPassword, // custom header for password
      },
    }
  );

  return response.data;
};



export const resetAdminPassword = async ({ email, newPassword }) => {
  const response = await axios.post('/api/auth/reset-password', {
    email,
    newPassword,
  });
  return response.data;
};
