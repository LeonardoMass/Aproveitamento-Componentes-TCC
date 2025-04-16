import axios from 'axios';
import { handleApiResponse } from './apiResponseHandler';

export const baseURL = 'http://localhost:8000';
//export const baseURL = 'https://super-spork-49rr5rxx44qhjqrv-8000.app.github.dev';

export const apiClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
    try {
        const token = 'localStorage' in self && localStorage.getItem('token') || null;
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        } 
    } catch (error) {

    }


    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});


apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            // localStorage.removeItem('token');
            // window.location.pathname = '/auth';
        }
        return Promise.reject(error);
    }
);