import authApi from "./authApi";

/**
 * Creates a new category.
 * @param {FormData} formData - The form data containing name, tags, and thumbnailFile.
 * @returns {Promise<object>} The newly created category data.
 */
export const createCategory = async (formData) => {
  try {
    const response = await authApi.post("/admin/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Updates an existing category.
 * @param {number} id - The ID of the category to update.
 * @param {FormData} formData - The form data containing the new details.
 * @returns {Promise<object>} The updated category data.
 */
export const updateCategory = async (id, formData) => {
  try {
    const response = await authApi.put(`/admin/categories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Deletes a category.
 * @param {number} id - The ID of the category to delete.
 * @returns {Promise<object>} The success message.
 */
export const deleteCategory = async (id) => {
  try {
    const response = await authApi.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Manually uploads a VOD record for an existing video file.
 * @param {object} vodData - The VOD data.
 * @returns {Promise<object>} The newly created VOD data.
 */
export const manualUploadVod = async (vodData) => {
  try {
    const response = await authApi.post("/admin/vod/upload", vodData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
