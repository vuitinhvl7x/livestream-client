import api from "./index";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await api.get(
      `/categories/search/name?q=${query}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error searching categories:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
