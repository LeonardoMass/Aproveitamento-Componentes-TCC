import { apiClient } from "@/libs/api";

const noticeList = async ({ page = 1, pageSize = 10, search = "" }) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("pageSize", pageSize);
  if (search) {
    params.append("search", search);
  }
  const url = `notices/?${params.toString()}`;
  return apiClient.get(url).then((response) => response.data);
};

const noticeListAll = async () => {
  const url = `notices/`; // Sem parâmetros de paginação
  console.log("Fetching all notices from URL:", url); // Para depuração
  return await apiClient.get(url).then((response) => response.data);
};

const noticeCreate = async (data) => {
  return await apiClient
    .post("notices/", data)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Erro ao criar edital:", error);
      throw error;
    });
};

const noticeEdit = async (id, data) => {
  return await apiClient
    .put(`notices/${id}/`, data)
    .then((response) => response.data);
};

export { noticeList, noticeCreate, noticeEdit, noticeListAll };
