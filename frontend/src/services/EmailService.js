import { apiClient } from "@/libs/api";
import { handleApiResponse } from "@/libs/apiResponseHandler";

export const sendEmailReminder = async (requestToEmail) => {
  const response = await apiClient.post("/email/send-reminder", requestToEmail);
  return response;
};

export const sendReminderResume = async () => {
  const response = await apiClient.get("/email/send-reminder-resume");
  return response;
};