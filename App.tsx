import 'reflect-metadata';
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider } from './src/presentation/viewmodels/AuthContext';
import { AlertProvider } from './src/presentation/viewmodels/AlertContext';
import { AppAlertModal } from './src/presentation/components/AppAlertModal';
import RootNavigator from './src/presentation/navigation/RootNavigator';

// Fondo del sistema Android: evita que aparezca blanco detrás de la app
// cuando el teclado sube o baja.
SystemUI.setBackgroundColorAsync('#0D0D1A');

const NAV_THEME = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#0D0D1A' },
};

const WEB_MAX_WIDTH = 480;

function AppContent() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideWeb = isWeb && width > WEB_MAX_WIDTH;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AlertProvider>
          <AuthProvider>
            {isWideWeb ? (
              <View style={styles.webOuter}>
                <View style={[styles.webInner, { width: WEB_MAX_WIDTH }]}>
                  <NavigationContainer theme={NAV_THEME}>
                    <StatusBar style="light" backgroundColor="#0D0D1A" />
                    <RootNavigator />
                  </NavigationContainer>
                  <AppAlertModal />
                </View>
              </View>
            ) : (
              <>
                <NavigationContainer theme={NAV_THEME}>
                  <StatusBar style="light" backgroundColor="#0D0D1A" />
                  <RootNavigator />
                </NavigationContainer>
                <AppAlertModal />
              </>
            )}
          </AuthProvider>
        </AlertProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D1A' },
  webOuter: {
    flex: 1,
    backgroundColor: '#07070F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webInner: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    overflow: 'hidden',
  },
});
