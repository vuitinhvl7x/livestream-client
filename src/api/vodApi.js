import api from "./index";

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
