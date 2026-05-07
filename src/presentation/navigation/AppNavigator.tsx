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

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  GameTab: 'game-controller',
  ProfileTab: 'person',
  AdminTab: 'settings',
};

function TabIcon({ routeName, color, size }: Readonly<{ routeName: string; color: string; size: number }>) {
  return <Ionicons name={TAB_ICONS[routeName] ?? 'ellipse'} size={size} color={color} />;
}

// ── Param lists ───────────────────────────────────────────────────────────────
export type GameStackParamList = {
  Map: undefined;
  Exam: { examen: ExamenDTO; isAdminMode?: boolean };
  Result: { resultado: ResultadoDTO; examenId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  History: undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
  Questions: undefined;
  Users: undefined;
  Incidencias: undefined;
  Dashboard: undefined;
  ExamResults: { examenId: number };
};

export type AppTabParamList = {
  GameTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

// ── Stacks ────────────────────────────────────────────────────────────────────
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
