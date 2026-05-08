import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../viewmodels/AuthContext';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/RegisterScreen';
import AppNavigator from './AppNavigator';

/** Lista de parámetros de las pantallas del stack de autenticación. */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Navegador raíz de la aplicación.
 * Decide qué navegador mostrar según el estado de autenticación:
 * - Muestra un spinner mientras se comprueba la sesión almacenada.
 * - Muestra el stack de autenticación (Login/Register) si no hay usuario.
 * - Muestra {@link AppNavigator} si el usuario está autenticado.
 *
 * @returns El navegador raíz según el estado de autenticación.
 */
export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
