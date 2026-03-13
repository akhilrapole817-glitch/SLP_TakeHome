import axios from 'axios';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL += '/api';
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const searchVehicle = async (params: { vin?: string; make?: string; model?: string; year?: string | number }) => {
  const response = await apiClient.get('/search', { params });
  return response.data;
};

export const getDashboardData = async (vehicleId: number) => {
  const response = await apiClient.get(`/vehicle/${vehicleId}/dashboard`);
  return response.data;
};

export const getComplaints = async (vehicleId: number, symptom: string = '') => {
  const params = symptom ? { symptom } : {};
  const response = await apiClient.get(`/vehicle/${vehicleId}/complaints`, { params });
  return response.data;
};

export const getRecalls = async (vehicleId: number) => {
  const response = await apiClient.get(`/vehicle/${vehicleId}/recalls`);
  return response.data;
};
