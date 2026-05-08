import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../viewmodels/AuthContext';
import { useUsersScreen, TabUsuarios } from '../viewmodels/useUsersScreen';
import { UsuarioDTO, RolDTO } from '../../domain/entities/Usuario';

function UserCard({
  item,
  onPress,
  onToggleActivo,
  accion,
}: Readonly<{
  item: UsuarioDTO;
  onPress: () => void;
  onToggleActivo: () => void;
  accion: 'desactivar' | 'activar';
}>) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {(item.nombre_usuario ?? '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.userName}>
          {item.nombre_usuario} {item.apellido_usuario}
        </Text>
        <Text style={styles.userEmail}>{item.correo_usuario}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggleActivo}
        style={[styles.toggleBtn, accion === 'desactivar' ? styles.toggleBtnOff : styles.toggleBtnOn]}
      >
        <Text style={styles.toggleBtnText}>{accion === 'desactivar' ? 'Desactivar' : 'Activar'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function RolRow({
  rol,
  active,
  onToggle,
}: Readonly<{ rol: RolDTO; active: boolean; onToggle: () => void }>) {
  return (
    <TouchableOpacity
      style={[styles.rolRow, active && styles.rolRowActive]}
      onPress={onToggle}
    >
      <View style={[styles.rolCheck, active && styles.rolCheckActive]}>
        {active && <Text style={styles.rolCheckText}>✓</Text>}
      </View>
      <Text style={[styles.rolName, active && styles.rolNameActive]}>{rol.nombre_rol}</Text>
    </TouchableOpacity>
  );
}

function TabBar({
  tabActiva,
  onChangeTab,
  countActivos,
  countInactivos,
}: Readonly<{
  tabActiva: TabUsuarios;
  onChangeTab: (tab: TabUsuarios) => void;
  countActivos: number;
  countInactivos: number;
}>) {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, tabActiva === 'activos' && styles.tabActive]}
        onPress={() => onChangeTab('activos')}
      >
        <Text style={[styles.tabText, tabActiva === 'activos' && styles.tabTextActive]}>
          Activos
        </Text>
        <View style={[styles.tabBadge, tabActiva === 'activos' ? styles.tabBadgeActive : styles.tabBadgeInactive]}>
          <Text style={styles.tabBadgeText}>{countActivos}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, tabActiva === 'inactivos' && styles.tabActive]}
        onPress={() => onChangeTab('inactivos')}
      >
        <Text style={[styles.tabText, tabActiva === 'inactivos' && styles.tabTextActive]}>
          Inactivos
        </Text>
        <View style={[styles.tabBadge, tabActiva === 'inactivos' ? styles.tabBadgeActive : styles.tabBadgeInactive]}>
          <Text style={styles.tabBadgeText}>{countInactivos}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function UsersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { user: me } = useAuth();
  const {
    usuariosActivos,
    usuariosInactivos,
    loading,
    selectedUser,
    userRoles,
    allRoles,
    modalVisible,
    rolLoading,
    tabActiva,
    setTabActiva,
    openUserDetail,
    closeModal,
    handleToggleRol,
    handleDesactivar,
    handleActivar,
  } = useUsersScreen(me?.id);

  const listaVisible = tabActiva === 'activos' ? usuariosActivos : usuariosInactivos;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      )}

      {!loading && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Usuarios</Text>
          </View>

          <TabBar
            tabActiva={tabActiva}
            onChangeTab={setTabActiva}
            countActivos={usuariosActivos.length}
            countInactivos={usuariosInactivos.length}
          />

          <FlatList
            data={listaVisible}
            keyExtractor={(u) => String(u.id_usuario)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No hay usuarios {tabActiva === 'activos' ? 'activos' : 'inactivos'}
              </Text>
            }
            renderItem={({ item }) => (
              <UserCard
                item={item}
                onPress={() => tabActiva === 'activos' ? openUserDetail(item) : undefined}
                onToggleActivo={() =>
                  tabActiva === 'activos' ? handleDesactivar(item) : handleActivar(item)
                }
                accion={tabActiva === 'activos' ? 'desactivar' : 'activar'}
              />
            )}
          />

          <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={closeModal}
          >
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedUser?.nombre_usuario} {selectedUser?.apellido_usuario}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalBody}>
                <Text style={styles.modalEmail}>{selectedUser?.correo_usuario}</Text>
                <Text style={styles.sectionLabel}>Roles asignados</Text>
                {rolLoading ? (
                  <ActivityIndicator color="#7C3AED" style={{ marginVertical: 20 }} />
                ) : (
                  allRoles.map((rol) => (
                    <RolRow
                      key={rol.id_rol}
                      rol={rol}
                      active={userRoles.some((r) => r.id_rol === rol.id_rol)}
                      onToggle={() => handleToggleRol(rol.id_rol)}
                    />
                  ))
                )}
              </ScrollView>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  center: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  backBtn: { marginBottom: 8 },
  backBtnText: { color: '#7C3AED', fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
    gap: 8,
  },
  tabActive: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  tabText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#FFFFFF' },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: { backgroundColor: '#7C3AED' },
  tabBadgeInactive: { backgroundColor: '#2D2D44' },
  tabBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2D2D44',
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1 },
  userName: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  userEmail: { color: '#64748B', fontSize: 12, marginTop: 2 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  toggleBtnOff: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  toggleBtnOn: { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)' },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  modal: { flex: 1, backgroundColor: '#0D0D1A' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', flex: 1, marginRight: 8 },
  modalClose: { fontSize: 22, color: '#EF4444', fontWeight: '700' },
  modalBody: { padding: 20 },
  modalEmail: { color: '#64748B', fontSize: 14, marginBottom: 24 },
  sectionLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 12 },
  rolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2D2D44',
    marginBottom: 10,
    gap: 12,
  },
  rolRowActive: { borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)' },
  rolCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rolCheckActive: { borderColor: '#7C3AED', backgroundColor: '#7C3AED' },
  rolCheckText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rolName: { color: '#94A3B8', fontWeight: '700', fontSize: 16 },
  rolNameActive: { color: '#FFFFFF' },
});
