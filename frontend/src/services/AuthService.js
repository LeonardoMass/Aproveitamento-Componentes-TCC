import { apiClient } from "@/libs/api";

async function UserDetails() {
    return apiClient.get('users/details').then((response) => response.data);
}

export async function UserList() {
    return apiClient.get('/users/list').then((response) => response.data);
}

async function CreateUser(data) {
    return apiClient.post('/users/create/', data)
}

async function UpdateUser(id, data) {
    return apiClient.put(`/users/update/${id}/`, data)
}

async function UpdateActivity(id) {
    return apiClient.get(`/users/update-activity/${id}`)
}

const getUserById = async (userId) => {
    const response = await apiClient.get(`/users/retrieve/${userId}/`);
    console.log(`[AuthService] Dados recebidos para ID ${userId}:`, response.data);
    return response.data;
};

export default {
    UserDetails,
    UserList,
    CreateUser,
    UpdateActivity,
    UpdateUser,
    getUserById
}