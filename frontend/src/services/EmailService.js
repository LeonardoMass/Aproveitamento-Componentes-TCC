import { apiClient } from "@/libs/api";
import { handleApiResponse } from "@/libs/apiResponseHandler";

export const sendEmailReminder = async (requestToEmail) => {
  try {
    const response = await apiClient.post("/gmail/send-reminder", requestToEmail);
    return response;
  } catch (error) {
    handleApiResponse(error);
    throw error;
  }
};
