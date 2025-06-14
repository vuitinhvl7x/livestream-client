import authApi from "./authApi";
import api from "./index";

export const getMyProfile = async () => {
  try {
    const response = await authApi.get("/users/me");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching my profile:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getUserProfile = async (username) => {
  try {
    const response = await authApi.get(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching profile for ${username}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await authApi.post(`/social/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error(
      `Error following user ${userId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await authApi.delete(`/social/${userId}/unfollow`);
    return response.data;
  } catch (error) {
    console.error(
      `Error unfollowing user ${userId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const updateMyProfile = async (formData) => {
  try {
    const response = await authApi.put("/users/me/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating my profile:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getFollowers = async (userId, page = 1, limit = 10) => {
  try {
    const response = await authApi.get(`/social/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching followers:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getFollowing = async (userId, page = 1, limit = 10) => {
  try {
    const response = await authApi.get(`/social/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching following:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users/all");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all users:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
