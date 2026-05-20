import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../data/apiconnection/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../viewmodels/AuthContext';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetUsuarioByIdUseCase, IUpdateUsuarioUseCase } from '../../domain/interfaces/useCases/usuarios/IUsuarioUseCase';
import { IGetResultadosAlumnoUseCase, IExportExamenesUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ResultadoDTO } from '../../domain/entities/Examen';
import { useAlert } from '../viewmodels/AlertContext';
import { UsuarioDTO } from '../../domain/entities/Usuario';
import { HEADER_TOP } from '../utils/responsive';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

type ProfileState = {
  usuario: UsuarioDTO | null;
  resultados: ResultadoDTO[];
  loading: boolean;
  showLogoutModal: boolean;
  showEditModal: boolean;
  editNombre: string;
  editApellido: string;
  saving: boolean;
};

type ProfileAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; usuario: UsuarioDTO | null; resultados: ResultadoDTO[] }
  | { type: 'OPEN_EDIT'; nombre: string; apellido: string }
  | { type: 'CLOSE_EDIT' }
  | { type: 'SET_EDIT_NOMBRE'; value: string }
  | { type: 'SET_EDIT_APELLIDO'; value: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; usuario: UsuarioDTO }
  | { type: 'SAVE_FAIL' }
  | { type: 'OPEN_LOGOUT' }
  | { type: 'CLOSE_LOGOUT' };

const initialProfileState: ProfileState = {
  usuario: null,
  resultados: [],
  loading: true,
  showLogoutModal: false,
  showEditModal: false,
  editNombre: '',
  editApellido: '',
  saving: false,
};

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, loading: false, usuario: action.usuario, resultados: action.resultados };
    case 'OPEN_EDIT': return { ...state, showEditModal: true, editNombre: action.nombre, editApellido: action.apellido };
    case 'CLOSE_EDIT': return { ...state, showEditModal: false };
    case 'SET_EDIT_NOMBRE': return { ...state, editNombre: action.value };
    case 'SET_EDIT_APELLIDO': return { ...state, editApellido: action.value };
    case 'SAVE_START': return { ...state, saving: true };
    case 'SAVE_SUCCESS': return { ...state, saving: false, showEditModal: false, usuario: action.usuario };
    case 'SAVE_FAIL': return { ...state, saving: false };
    case 'OPEN_LOGOUT': return { ...state, showLogoutModal: true };
    case 'CLOSE_LOGOUT': return { ...state, showLogoutModal: false };
    default: return state;
  }
}

/**
 * Pantalla de perfil del usuario autenticado.
 * Muestra el avatar, nombre, correo, rol y estadísticas del alumno (nota media,
 * mejor nota, estrellas y nivel de experiencia). Permite editar el nombre y apellidos,
 * acceder al historial de exámenes, exportar exámenes en PDF/Excel (admin y profesor)
 * y cerrar sesión.
 *
 * @param props.navigation - Objeto de navegación del stack de perfil.
 * @returns Vista de perfil con estadísticas, acciones y modales de edición y cierre de sesión.
 */
export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut, isAdmin, isProfesor, isAlumno } = useAuth();
  const { showAlert } = useAlert();
  const [{ usuario, resultados, loading, showLogoutModal, showEditModal, editNombre, editApellido, saving }, dispatch] = useReducer(profileReducer, initialProfileState);

  const getUsuarioByIdUseCase = useMemo(() => container.get<IGetUsuarioByIdUseCase>(TYPES.IGetUsuarioByIdUseCase), []);
  const getResultadosAlumnoUseCase = useMemo(() => container.get<IGetResultadosAlumnoUseCase>(TYPES.IGetResultadosAlumnoUseCase), []);
  const updateUsuarioUseCase = useMemo(() => container.get<IUpdateUsuarioUseCase>(TYPES.IUpdateUsuarioUseCase), []);
  const exportExamenesUseCase = useMemo(() => container.get<IExportExamenesUseCase>(TYPES.IExportExamenesUseCase), []);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      dispatch({ type: 'FETCH_START' });
      Promise.all([
        getUsuarioByIdUseCase.execute(user.id).catch(() => null),
        isAlumno ? getResultadosAlumnoUseCase.execute(user.id).catch(() => []) : Promise.resolve([]),
      ]).then(([u, r]) => {
        dispatch({ type: 'FETCH_SUCCESS', usuario: (u as UsuarioDTO) ?? null, resultados: r as ResultadoDTO[] });
      });
    }, [user, isAlumno]),
  );

  const avgNota =
    resultados.length > 0
      ? resultados.reduce((acc, r) => acc + r.nota, 0) / resultados.length
      : 0;

  const bestNota = resultados.length > 0 ? Math.max(...resultados.map((r) => r.nota)) : 0;

  const totalStars = resultados.reduce((acc, r) => {
    if (r.nota >= 9) return acc + 3;
    if (r.nota >= 7) return acc + 2;
    if (r.nota >= 5) return acc + 1;
    return acc;
  }, 0);

  const roleTag = isAdmin ? '👑 ADMIN' : isProfesor ? '👨‍🏫 PROFESOR' : '🎓 ALUMNO';
  const roleColor = isAdmin ? '#F59E0B' : isProfesor ? '#06B6D4' : '#7C3AED';

  // Sistema de nivel: 1 nivel cada 10 estrellas
  const STARS_PER_LEVEL = 10;
  const level = Math.floor(totalStars / STARS_PER_LEVEL) + 1;
  const xpInLevel = totalStars % STARS_PER_LEVEL;
  const xpPct = xpInLevel / STARS_PER_LEVEL;

  const xpBarWidth = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(xpBarWidth, { toValue: xpPct, duration: 1000, delay: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [loading, xpPct]);

  const openEdit = () => {
    dispatch({ type: 'OPEN_EDIT', nombre: usuario?.nombre_usuario ?? '', apellido: usuario?.apellido_usuario ?? '' });
  };

  const handleSaveProfile = async () => {
    if (!editNombre.trim() || !editApellido.trim() || !user || !usuario) return;
    dispatch({ type: 'SAVE_START' });
    try {
      const updated = await updateUsuarioUseCase.execute(user.id, {
        nombre_usuario: editNombre.trim(),
        apellido_usuario: editApellido.trim(),
        correo_usuario: usuario.correo_usuario,
      });
      dispatch({ type: 'SAVE_SUCCESS', usuario: updated });
    } catch {
      showAlert('Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
      dispatch({ type: 'SAVE_FAIL' });
    }
  };

  async function handleExport(formato: 'pdf' | 'excel') {
    try {
      const ext = formato === 'pdf' ? 'pdf' : 'xlsx';
      const mime = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (typeof document === 'undefined') {
        // Nativo (iOS/Android): FileSystem.downloadAsync es más fiable que Axios arraybuffer en Android
        const token = await AsyncStorage.getItem('token');
        const uri = `${FileSystem.cacheDirectory}examenes_export.${ext}`;
        const result = await FileSystem.downloadAsync(
          `${API_BASE_URL}/examenes/exportar?formato=${formato}`,
          uri,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'bypass-tunnel-reminder': 'true',
            },
          },
        );
        if (result.status !== 200) throw new Error(`HTTP ${result.status}`);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(result.uri, { mimeType: mime, dialogTitle: `Exportar exámenes ${formato.toUpperCase()}` });
        } else {
          showAlert('Archivo generado', `Guardado en: ${result.uri}`);
        }
      } else {
        // Web: descarga directa vía <a>
        const buffer = await exportExamenesUseCase.execute(formato);
        const blob = new Blob([buffer], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `examenes_export.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      showAlert('Error', `No se pudo exportar el archivo ${formato.toUpperCase()}.`);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header con fondo oscuro y avatar centrado */}
      <Animated.View style={[styles.headerBg, { opacity: headerFade }]}>
        {/* Orbe decorativo */}
        <View style={[styles.headerOrb, { backgroundColor: roleColor }]} />

        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { borderColor: roleColor }]}>
            <View style={[styles.avatar, { backgroundColor: roleColor }]}>
              <Text style={styles.avatarText}>
                {(usuario?.nombre_usuario ?? user?.email ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {usuario
                ? `${usuario.nombre_usuario} ${usuario.apellido_usuario}`
                : user?.email.split('@')[0]}
            </Text>
            {usuario && (
              <Pressable onPress={openEdit} style={styles.editProfileBtn}>
                <Text style={styles.editProfileText}>✏️</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.email}>{usuario?.correo_usuario ?? user?.email}</Text>
          <View style={[styles.roleBadge, { borderColor: roleColor, backgroundColor: roleColor + '18' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleTag}</Text>
          </View>
        </View>

        {/* Nivel y XP — solo alumnos */}
        {isAlumno && (
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelEmoji}>⚡</Text>
              <Text style={styles.levelText}>Nivel {level}</Text>
            </View>
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarTrack}>
                <Animated.View
                  style={[
                    styles.xpBarFill,
                    {
                      width: xpBarWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.xpLabel}>{xpInLevel}/{STARS_PER_LEVEL} ⭐ para nivel {level + 1}</Text>
            </View>
          </View>
        )}
      </Animated.View>

      <View style={styles.body}>
        {isAlumno && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{resultados.length}</Text>
              <Text style={styles.statLabel}>Intentos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: avgNota >= 5 ? '#10B981' : '#EF4444' }]}>
                {avgNota.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Media</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#06B6D4' }]}>{bestNota.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Mejor nota</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{totalStars}⭐</Text>
              <Text style={styles.statLabel}>Estrellas</Text>
            </View>
          </View>
        )}

      <View style={styles.actionsSection}>
        {isAlumno && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Historial de exámenes</Text>
              <Text style={styles.actionSub}>{resultados.length} intentos registrados</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </Pressable>
        )}
        {(isAdmin || isProfesor) && (
          <>
            <Pressable
              style={styles.actionBtn}
              onPress={() => { void handleExport('pdf'); }}
            >
              <Text style={styles.actionIcon}>📄</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Exportar exámenes en PDF</Text>
                <Text style={styles.actionSub}>Descarga el informe de exámenes en PDF</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => { void handleExport('excel'); }}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Exportar exámenes en Excel</Text>
                <Text style={styles.actionSub}>Descarga el informe de exámenes en Excel</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable
        style={styles.logoutBtn}
        onPress={() => dispatch({ type: 'OPEN_LOGOUT' })}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => dispatch({ type: 'CLOSE_EDIT' })}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Nombre</Text>
              <TextInput
                style={styles.editInput}
                value={editNombre}
                onChangeText={(value) => dispatch({ type: 'SET_EDIT_NOMBRE', value })}
                placeholderTextColor="#555"
                placeholder="Nombre"
              />
            </View>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Apellidos</Text>
              <TextInput
                style={styles.editInput}
                value={editApellido}
                onChangeText={(value) => dispatch({ type: 'SET_EDIT_APELLIDO', value })}
                placeholderTextColor="#555"
                placeholder="Apellidos"
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => dispatch({ type: 'CLOSE_EDIT' })}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveBtn, saving && styles.modalSaveBtnDisabled]}
                onPress={() => void handleSaveProfile()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => dispatch({ type: 'CLOSE_LOGOUT' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalMessage}>¿Estás seguro?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => dispatch({ type: 'CLOSE_LOGOUT' })}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.modalConfirmBtn}
                onPress={() => {
                  dispatch({ type: 'CLOSE_LOGOUT' });
                  void signOut();
                }}
              >
                <Text style={styles.modalConfirmText}>Salir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </View>{/* end body */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  body: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' },
  // Header con fondo semi-oscuro y orbe
  headerBg: {
    backgroundColor: '#111128',
    paddingTop: HEADER_TOP,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
    overflow: 'hidden',
    marginBottom: 24,
  },
  headerOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.12,
    top: -60,
    right: -60,
  },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  email: { fontSize: 14, color: '#64748B', marginTop: 4 },
  roleBadge: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: { fontSize: 13, fontWeight: '700' },
  // Nivel / XP
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  levelEmoji: { fontSize: 16 },
  levelText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  xpBarContainer: { flex: 1 },
  xpBarTrack: {
    height: 8,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  xpLabel: { fontSize: 11, color: '#64748B' },
  // Estadísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  actionsSection: { gap: 12, marginBottom: 28 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2D2D44',
    gap: 14,
  },
  actionIcon: { fontSize: 24 },
  actionText: { flex: 1 },
  actionTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  actionSub: { color: '#64748B', fontSize: 13, marginTop: 2 },
  actionArrow: { color: '#7C3AED', fontSize: 18, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 28,
    width: '80%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#2D2D44',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  modalMessage: { fontSize: 15, color: '#94A3B8', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editProfileBtn: { padding: 4 },
  editProfileText: { fontSize: 18 },
  editField: { width: '100%', marginBottom: 14 },
  editLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 6 },
  editInput: {
    backgroundColor: '#0D0D1A',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: { opacity: 0.6 },
  modalSaveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
