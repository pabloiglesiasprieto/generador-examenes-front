import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../viewmodels/AuthContext';
import { ExamenDTO, ResultadoDTO } from '../../domain/entities/Examen';

import MapScreen from '../views/MapScreen';
import ExamScreen from '../views/ExamScreen';
import ResultScreen from '../views/ResultScreen';
import ProfileScreen from '../views/ProfileScreen';
import HistoryScreen from '../views/HistoryScreen';
import AdminHomeScreen from '../views/AdminHomeScreen';
import QuestionsScreen from '../views/QuestionsScreen';
import UsersScreen from '../views/UsersScreen';
import IncidenciasScreen from '../views/IncidenciasScreen';
import DashboardScreen from '../views/DashboardScreen';
import ExamResultsScreen from '../views/ExamResultsScreen';

/** Mapa de nombres de rutas de pestaña a iconos de Ionicons. */
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  GameTab: 'game-controller',
  ProfileTab: 'person',
  AdminTab: 'settings',
};

/**
 * Componente auxiliar que renderiza el icono de una pestaña de la barra de navegación inferior.
 *
 * @param props - Props del componente.
 * @param props.routeName - Nombre de la ruta para seleccionar el icono correspondiente.
 * @param props.color - Color del icono (activo o inactivo).
 * @param props.size - Tamaño del icono en puntos.
 * @returns El icono de Ionicons correspondiente a la ruta.
 */
function TabIcon({ routeName, color, size }: Readonly<{ routeName: string; color: string; size: number }>) {
  return <Ionicons name={TAB_ICONS[routeName] ?? 'ellipse'} size={size} color={color} />;
}

// ── Param lists ───────────────────────────────────────────────────────────────

/** Lista de parámetros de las pantallas del stack de juego. */
export type GameStackParamList = {
  Map: undefined;
  Exam: { examen: ExamenDTO; isAdminMode?: boolean };
  Result: { resultado: ResultadoDTO; examenId: number };
};

/** Lista de parámetros de las pantallas del stack de perfil. */
export type ProfileStackParamList = {
  Profile: undefined;
  History: undefined;
};

/** Lista de parámetros de las pantallas del stack de administración. */
export type AdminStackParamList = {
  AdminHome: undefined;
  Questions: undefined;
  Users: undefined;
  Incidencias: undefined;
  Dashboard: undefined;
  ExamResults: { examenId: number };
};

/** Lista de parámetros de las pestañas principales de la aplicación. */
export type AppTabParamList = {
  GameTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

// ── Stacks ────────────────────────────────────────────────────────────────────

/**
 * Navegador de pila para el flujo de juego.
 * Contiene las pantallas: Mapa, Examen y Resultado.
 *
 * @returns El stack navigator del flujo de juego.
 */
const GameStack = createNativeStackNavigator<GameStackParamList>();
function GameNavigator() {
  return (
    <GameStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D1A' } }}
    >
      <GameStack.Screen name="Map" component={MapScreen} options={{ title: 'Seleccionar examen' }} />
      <GameStack.Screen name="Exam" component={ExamScreen} options={{ title: 'Realizando examen' }} />
      <GameStack.Screen name="Result" component={ResultScreen} options={{ title: 'Resultado del examen' }} />
    </GameStack.Navigator>
  );
}

/**
 * Navegador de pila para el perfil del usuario.
 * Contiene las pantallas: Perfil e Historial.
 *
 * @returns El stack navigator del perfil.
 */
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D1A' } }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi perfil' }} />
      <ProfileStack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial de exámenes' }} />
    </ProfileStack.Navigator>
  );
}

/**
 * Navegador de pila para la zona de administración.
 * Contiene las pantallas: Panel de admin, Preguntas, Usuarios, Incidencias, Dashboard y Resultados de examen.
 *
 * @returns El stack navigator de administración.
 */
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
function AdminNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D1A' } }}
    >
      <AdminStack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Panel de administración' }} />
      <AdminStack.Screen name="Questions" component={QuestionsScreen} options={{ title: 'Gestión de preguntas' }} />
      <AdminStack.Screen name="Users" component={UsersScreen} options={{ title: 'Gestión de usuarios' }} />
      <AdminStack.Screen name="Incidencias" component={IncidenciasScreen} options={{ title: 'Incidencias' }} />
      <AdminStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Panel de estadísticas' }} />
      <AdminStack.Screen name="ExamResults" component={ExamResultsScreen} options={{ title: 'Resultados del examen' }} />
    </AdminStack.Navigator>
  );
}

// ── Tab navigator ─────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Navegador principal con pestañas inferiores de la aplicación.
 * Muestra las pestañas de Juego y Perfil para todos los usuarios, y la pestaña
 * de Admin/Profesor únicamente para usuarios con los roles correspondientes.
 *
 * @precondition El usuario debe estar autenticado. Este componente se renderiza
 *   únicamente cuando {@link RootNavigator} detecta un usuario autenticado.
 * @returns El navegador de pestañas principal.
 */
export default function AppNavigator() {
  const { isAdmin, isProfesor } = useAuth();
  const showAdminTab = isAdmin || isProfesor;
  const adminTabLabel = isAdmin ? 'Admin' : 'Profesor';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const labels: Record<string, string> = {
          GameTab: 'Juego',
          ProfileTab: 'Perfil',
          AdminTab: adminTabLabel,
        };
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1A1A2E',
            borderTopColor: '#2D2D44',
            ...(Platform.OS === 'android' && insets.bottom > 0 && {
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom,
              paddingTop: 4,
            }),
          },
          tabBarActiveTintColor: '#7C3AED',
          tabBarInactiveTintColor: '#666',
          tabBarIcon: ({ color, size }) => <TabIcon routeName={route.name} color={color} size={size} />,
          tabBarLabel: labels[route.name] ?? route.name,
        };
      }}
    >
      <Tab.Screen name="GameTab" component={GameNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
      {showAdminTab && <Tab.Screen name="AdminTab" component={AdminNavigator} options={{ unmountOnBlur: true }} />}
    </Tab.Navigator>
  );
}
