import { apiClient } from "@/libs/api";
import { handleApiResponse } from "@/libs/apiResponseHandler";

export const ppcList = async (params = {}) => {
  try {
    const response = await apiClient.get("/ppc/", { params });
    return response.data.results || [];
  } catch (error) {
    console.error("Erro ao listar PPCs:", error);
    return [];
  }
};

export const ppcGet = async (ppcId) => {
  try {
    const response = await apiClient.get(`/ppc/${ppcId}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar PPC ${ppcId}:`, error);
    return null;
  }
};

export const ppcCreate = async (ppcData) => {
  try {
    const response = await apiClient.post("/ppc/", ppcData);
    handleApiResponse(response); 
    return response.data;
  } catch (error) {
    handleApiResponse(error.response);
    throw error;
  }
};

export const ppcEdit = async (ppcId, ppcData) => {
  try {
    const response = await apiClient.patch(`/ppc/${ppcId}/`, ppcData);
    handleApiResponse(response);
    return response.data;
  } catch (error) {
    console.error(`Erro ao editar PPC ${ppcId}:`, error);
    handleApiResponse(error.response);
    throw error;
  }
};

// ppcDelete