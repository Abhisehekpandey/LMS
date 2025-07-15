import axios from "axios";

export const saveApmSettings = async (settings) => {
    console.log("sssett",settings)
  try {
    const response = await axios.post(
      `${window.__ENV__.REACT_APP_ROUTE}/tenants/apm`,
      settings
    ); // update URL as needed
    return response.data;
  } catch (error) {
    console.error("Failed to save APM settings:", error);
    throw error;
  }
};