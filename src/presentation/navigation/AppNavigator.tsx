import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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
      <GameStack.Screen name="Map" component={MapScreen} />
      <GameStack.Screen name="Exam" component={ExamScreen} />
      <GameStack.Screen name="Result" component={ResultScreen} />
    </GameStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D1A' } }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="History" component={HistoryScreen} />
    </ProfileStack.Navigator>
  );
}

const AdminStack = createNativeStackNavigator<AdminStackParamList>();
function AdminNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D1A' } }}
    >
      <AdminStack.Screen name="AdminHome" component={AdminHomeScreen} />
      <AdminStack.Screen name="Questions" component={QuestionsScreen} />
      <AdminStack.Screen name="Users" component={UsersScreen} />
      <AdminStack.Screen name="Incidencias" component={IncidenciasScreen} />
      <AdminStack.Screen name="Dashboard" component={DashboardScreen} />
      <AdminStack.Screen name="ExamResults" component={ExamResultsScreen} />
    </AdminStack.Navigator>
  );
}

// ── Tab navigator ─────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  const { isAdmin, isProfesor } = useAuth();
  const showAdminTab = isAdmin || isProfesor;
  const adminTabLabel = isAdmin ? 'Admin' : 'Profesor';

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
            paddingBottom: 4,
            height: 60,
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
      {showAdminTab && <Tab.Screen name="AdminTab" component={AdminNavigator} />}
    </Tab.Navigator>
  );
}
