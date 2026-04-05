import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../viewmodels/AuthContext';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHome'>;

interface MenuOption {
  key: keyof AdminStackParamList;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  adminOnly?: boolean;
}

const OPTIONS: MenuOption[] = [
  {
    key: 'Questions',
    emoji: '📝',
    title: 'Preguntas',
    subtitle: 'Crear, editar y eliminar preguntas del banco',
    tag: 'Contenido',
    color: '#7C3AED',
  },
  {
    key: 'Users',
    emoji: '👥',
    title: 'Usuarios',
    subtitle: 'Gestionar cuentas, roles y permisos',
    tag: 'Gestión',
    color: '#06B6D4',
    adminOnly: true,
  },
  {
    key: 'Incidencias',
    emoji: '🚨',
    title: 'Incidencias',
    subtitle: 'Monitorizar errores y eventos del sistema',
    tag: 'Sistema',
    color: '#EF4444',
    adminOnly: true,
  },
];

function AdminCard({
  opt,
  onPress,
}: {
  opt: MenuOption;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.card, { borderColor: opt.color + '66', transform: [{ scale }] }]}>
        {/* Orbe de color en esquina */}
        <View style={[styles.cardOrb, { backgroundColor: opt.color }]} />

        <View style={styles.cardTop}>
          <View style={[styles.iconCircle, { backgroundColor: opt.color + '22' }]}>
            <Text style={styles.icon}>{opt.emoji}</Text>
          </View>
          <View style={[styles.tagBadge, { backgroundColor: opt.color + '22' }]}>
            <Text style={[styles.tagText, { color: opt.color }]}>{opt.tag}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{opt.title}</Text>
        <Text style={styles.cardSub}>{opt.subtitle}</Text>

        <View style={styles.cardFooter}>
          <View style={[styles.cardLine, { backgroundColor: opt.color + '44' }]} />
          <View style={[styles.arrowCircle, { backgroundColor: opt.color }]}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AdminHomeScreen({ navigation }: Props) {
  const { isAdmin, user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Panel Admin</Text>
          <Text style={styles.subtitle}>
            {isAdmin ? '⚙️ Acceso completo' : '📚 Gestión de contenido'}
          </Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>{isAdmin ? '👑' : '👨‍🏫'}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {OPTIONS.filter((opt) => !opt.adminOnly || isAdmin).map((opt) => (
          <AdminCard
            key={opt.key}
            opt={opt}
            onPress={() => navigation.navigate(opt.key as never)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  body: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  adminBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBadgeText: { fontSize: 24 },
  grid: { gap: 16 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardOrb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.07,
    top: -30,
    right: -30,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 28 },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tagText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 18 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardLine: { flex: 1, height: 1 },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
