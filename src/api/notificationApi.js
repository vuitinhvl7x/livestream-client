import authApi from "./authApi";

export const getNotifications = async (params) => {
  try {
    const response = await authApi.get("/notifications", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching notifications:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await authApi.post(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await authApi.post("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error(
      "Error marking all notifications as read:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
