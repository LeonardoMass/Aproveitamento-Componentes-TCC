import { apiClient } from "@/libs/api";
import { handleApiResponse } from "@/libs/apiResponseHandler";

const courseList = async () => {
  return await apiClient.get("courses/list/").then((response) => response.data);
};

const courseListByName = async (params = {}) => {
  try {
    const response = await apiClient.get("courses/list/", { params });
    return response.data[0] || [];
  } catch (error) {
    console.error("Erro ao listar Cursos:", error);
    return [];
  }
};

const getCourseById = async (courseId) => {
  return await apiClient
    .get(`courses/read/${courseId}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching course by ID:", error);
      throw error;
    });
};


const courseCreate = async (data) => {
  return await apiClient
    .post(`courses/create/`, data)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Erro ao criar curso:", error);
      throw error;
    });
};

const courseEdit = async (id, data) => {
  return await apiClient
    .put(`courses/update/${id}`, data)
    .then((response) => response)
    .catch((error) => {
      console.error("Erro ao editar curso:", error);
      throw error;
    });
};

const courseListReduced = async (params = { reduced: true }) => {
  try {
    const response = await apiClient.get("courses/list/", { params });
    return response.data || [];
  } catch (error) {
    console.error("Erro ao listar cursos reduzidos:", error);
    return [];
  }
};

const changeStateCourse = async (courseId) => {
    try {
      const response = await apiClient.put(`courses/state/${courseId}`);
      handleApiResponse(response);
      return response.data;
    } catch(error) {
      console.error("Error state course by ID:", error);
      return [];
    };
};

export { courseList, courseCreate, courseEdit, getCourseById, courseListByName, courseListReduced, changeStateCourse };
