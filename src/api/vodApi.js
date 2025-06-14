import api from "./index";
import authApi from "./authApi";

export const getAllVods = async (params) => {
  try {
    const response = await api.get("/vod", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all VODs:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getVodsByUserId = async (userId, limit = 50) => {
  try {
    const response = await api.get(`/vod`, {
      params: { userId, limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching vods for user ${userId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const uploadVOD = async (formData) => {
  try {
    const response = await authApi.post("/vod/upload-local", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading VOD:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const deleteVOD = async (vodId) => {
  try {
    const response = await authApi.delete(`/vod/${vodId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting VOD ${vodId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const vodApi = {
  searchVODs: (params) => {
    return api.get("/vod/search", { params });
  },
};

export default vodApi;
