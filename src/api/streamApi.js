import api from "./index";
import authApi from "./authApi";

export const getStreams = async (params) => {
  try {
    const response = await api.get("/streams", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching streams:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getStreamById = async (streamId) => {
  try {
    const response = await api.get(`/streams/${streamId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching stream ${streamId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const updateStream = async (streamId, formData) => {
  try {
    const response = await authApi.put(`/streams/${streamId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error updating stream ${streamId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const createStream = async (formData) => {
  try {
    const response = await authApi.post("/streams", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating stream:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const streamApi = {
  searchStreams: (params) => {
    return api.get("/stream/search", { params });
  },
};

export default streamApi;
