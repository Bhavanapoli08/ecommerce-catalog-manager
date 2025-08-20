import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories API
export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id: string) => apiClient.get(`/categories/${id}`),
  create: (data: any) => apiClient.post('/categories', data),
  update: (id: string, data: any) => apiClient.patch(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

// Attributes API
export const attributesApi = {
  getByCategory: (categoryId: string) => apiClient.get(`/attributes/category/${categoryId}`),
  getById: (id: string) => apiClient.get(`/attributes/${id}`),
  create: (data: any) => apiClient.post('/attributes', data),
  createOption: (data: any) => apiClient.post('/attributes/options', data),
  delete: (id: string) => apiClient.delete(`/attributes/${id}`),
};

// Products API
export const productsApi = {
  getAll: (params?: any) => apiClient.get('/products', { params }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: any) => apiClient.post('/products', data),
  update: (id: string, data: any) => apiClient.patch(`/products/${id}`, data),
  setAttributeValue: (data: any) => apiClient.post('/products/values', data),
  activate: (id: string) => apiClient.post(`/products/${id}/activate`),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

export default apiClient;
