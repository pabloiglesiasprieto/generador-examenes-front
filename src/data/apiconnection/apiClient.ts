import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../domain/entities/Auth';

export const API_BASE_URL = 'http://localhost:8080'; // <- reemplaza con tu URL de localtunnel

// Callback registrado por AuthContext para cerrar sesión desde fuera de React
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      if (exp * 1000 <= Date.now()) {
        await AsyncStorage.removeItem('token');
        onUnauthorized?.();
        throw new Error('Token expirado');
      }
    } catch {
      await AsyncStorage.removeItem('token');
      onUnauthorized?.();
      throw new Error('Token inválido');
    }
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      onUnauthorized?.();
    }
    throw error;
  },
);

export default apiClient;
