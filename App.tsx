import 'reflect-metadata';
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider } from './src/presentation/viewmodels/AuthContext';
import { AlertProvider } from './src/presentation/viewmodels/AlertContext';
import { AppAlertModal } from './src/presentation/components/AppAlertModal';
import RootNavigator from './src/presentation/navigation/RootNavigator';

// Fondo del sistema Android: evita que aparezca blanco detrás de la app
// cuando el teclado sube o baja.
SystemUI.setBackgroundColorAsync('#0D0D1A');

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AlertProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#0D0D1A" />
              <RootNavigator />
            </NavigationContainer>
            <AppAlertModal />
          </AuthProvider>
        </AlertProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
