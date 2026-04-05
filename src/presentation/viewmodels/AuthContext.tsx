import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AuthUser, JwtPayload } from '../../domain/entities/Auth';
import { setUnauthorizedHandler } from '../../data/apiconnection/apiClient';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isProfesor: boolean;
  isAlumno: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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
            setUser({ id: payload.id_usuario, email: payload.correo_usuario, roles: payload.roles, token });
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
    setUser({ id: payload.id_usuario, email: payload.correo_usuario, roles: payload.roles, token });
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

export const useAuth = () => useContext(AuthContext);
