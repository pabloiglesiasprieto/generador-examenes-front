import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../domain/entities/Auth';

/** URL base de la API del backend. */
export const API_BASE_URL = 'https://generador-examenes.francecentral.cloudapp.azure.com'; // <- reemplaza con tu URL de localtunnel

/** Callback registrado por AuthContext para cerrar sesión desde fuera de React. */
let onUnauthorized: (() => void) | null = null;

/**
 * Registra un handler que será invocado cuando la API devuelva un error 401
 * o cuando el token JWT haya expirado, permitiendo cerrar la sesión del usuario
 * desde fuera del árbol de componentes de React.
 *
 * @param handler - Función sin parámetros que cierra la sesión del usuario.
 */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

/**
 * Instancia de Axios preconfigurada para comunicarse con el backend.
 * Incluye la URL base, cabeceras por defecto y un timeout de 15 segundos.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
  timeout: 15000,
});

/**
 * Interceptor de petición: adjunta el token JWT de AsyncStorage a la cabecera
 * Authorization. Si el token ha expirado o es inválido, lo elimina del almacenamiento,
 * invoca el handler de no autorizado y lanza un error para cancelar la petición.
 */
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

/**
 * Interceptor de respuesta: si el servidor devuelve un 401, elimina el token
 * del almacenamiento e invoca el handler de no autorizado para cerrar la sesión.
 */
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
