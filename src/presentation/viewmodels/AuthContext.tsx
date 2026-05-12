import React, { createContext, use, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AuthUser, JwtPayload } from '../../domain/entities/Auth';
import { setUnauthorizedHandler } from '../../data/apiconnection/apiClient';

/**
 * Tipo del valor expuesto por el contexto de autenticación.
 */
interface AuthContextType {
  /** Usuario autenticado actualmente, o null si no hay sesión activa. */
  user: AuthUser | null;
  /** Indica si se está comprobando la sesión almacenada (carga inicial). */
  loading: boolean;
  /**
   * Inicia sesión almacenando el token JWT y actualizando el estado de usuario.
   *
   * @param token - Token JWT devuelto por el backend tras el login.
   */
  signIn: (token: string) => Promise<void>;
  /**
   * Cierra la sesión eliminando el token de AsyncStorage y limpiando el estado.
   */
  signOut: () => Promise<void>;
  /** Indica si el usuario autenticado tiene el rol ADMIN. */
  isAdmin: boolean;
  /** Indica si el usuario autenticado tiene el rol PROFESOR. */
  isProfesor: boolean;
  /** Indica si el usuario autenticado tiene el rol ALUMNO. */
  isAlumno: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Proveedor del contexto de autenticación.
 * Al montarse, recupera el token JWT de AsyncStorage y restablece la sesión si es válido.
 * Registra el handler de no autorizado para cerrar sesión automáticamente en errores 401.
 *
 * @param props - Props del proveedor.
 * @param props.children - Árbol de componentes hijos.
 * @returns El proveedor del contexto de autenticación.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));

    AsyncStorage.getItem('token').then((token) => {
      if (token) {
        try {
          const payload = jwtDecode<JwtPayload>(token);
          if (payload.exp * 1000 > Date.now()) {
            setUser({ id: payload.id_usuario, email: payload.correo_usuario, nombre: payload.nombre_usuario, apellido: payload.apellido_usuario, roles: payload.roles, token });
          } else {
            AsyncStorage.removeItem('token');
          }
        } catch {
          AsyncStorage.removeItem('token');
        }
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (token: string) => {
    const payload = jwtDecode<JwtPayload>(token);
    await AsyncStorage.setItem('token', token);
    setUser({ id: payload.id_usuario, email: payload.correo_usuario, nombre: payload.nombre_usuario, apellido: payload.apellido_usuario, roles: payload.roles, token });
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const roles = user?.roles ?? [];

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin: roles.includes('ADMIN'),
        isProfesor: roles.includes('PROFESOR'),
        isAlumno: roles.includes('ALUMNO'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación.
 * Devuelve el usuario, el estado de carga, las funciones de login/logout y los flags de rol.
 *
 * @precondition El componente debe estar dentro de un {@link AuthProvider}.
 * @returns El valor del contexto de autenticación.
 */
export const useAuth = () => use(AuthContext);
