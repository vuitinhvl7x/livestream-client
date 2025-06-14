import api from "./index";
import authApi from "./authApi";

/**
 * Fetches the list of available AI models from the backend.
 * @returns {Promise<string[]>} A promise that resolves to an array of AI model names.
 */
export const getAIModels = async () => {
  try {
    const response = await api.get("/ai/models");
    // The actual data is nested in response.data.data
    return response.data.data;
  } catch (error) {
    // Log the error or handle it as needed
    console.error("Error fetching AI models:", error);
    // Re-throw the error to be caught by the calling function (e.g., in useQuery)
    throw error;
  }
};

/**
 * Requests a chat summary for a specific stream.
 * @param {number} streamId - The ID of the stream to summarize.
 * @param {object} options - Optional parameters for the summary.
 * @param {string} [options.model] - The AI model to use for the summary.
 * @param {number} [options.numMessages] - The number of recent messages to summarize.
 * @returns {Promise<object>} A promise that resolves to the summary data.
 */
export const summarizeStreamChat = async (streamId, options = {}) => {
  const { model, numMessages } = options;
  try {
    const response = await authApi.post(`/ai/streams/${streamId}/summarize`, {
      model,
      numMessages,
    });
    // The actual data is nested in response.data.data
    return response.data.data;
  } catch (error) {
    console.error(`Error summarizing chat for stream ${streamId}:`, error);
    throw error;
  }
};
