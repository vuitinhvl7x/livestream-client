import api from "./authApi";

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
    const response = await api.post("/vod/upload-local", formData, {
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
    const response = await api.delete(`/vod/${vodId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting VOD ${vodId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
