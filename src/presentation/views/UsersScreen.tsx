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
import { useAuth } from '../viewmodels/AuthContext';
import { useUsersScreen } from '../viewmodels/useUsersScreen';
import { UsuarioDTO, RolDTO } from '../../domain/entities/Usuario';

function UserCard({
  item,
  onPress,
  onDelete,
}: Readonly<{
  item: UsuarioDTO;
  onPress: () => void;
  onDelete: () => void;
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
        {item.activo !== undefined && (
          <View style={[styles.activoBadge, item.activo ? styles.activoOn : styles.activoOff]}>
            <Text style={styles.activoText}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>🗑️</Text>
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

export default function UsersScreen() {
  const { user: me } = useAuth();
  const {
    usuarios,
    loading,
    selectedUser,
    userRoles,
    allRoles,
    modalVisible,
    rolLoading,
    openUserDetail,
    closeModal,
    handleToggleRol,
    handleDelete,
  } = useUsersScreen(me?.id);

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
            <Text style={styles.headerTitle}>Usuarios</Text>
            <Text style={styles.headerCount}>{usuarios.length}</Text>
          </View>

          <FlatList
            data={usuarios}
            keyExtractor={(u) => String(u.id_usuario)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <UserCard
                item={item}
                onPress={() => openUserDetail(item)}
                onDelete={() => handleDelete(item)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerCount: {
    backgroundColor: '#7C3AED',
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  list: { padding: 16, gap: 10 },
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
  activoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  activoOn: { backgroundColor: 'rgba(16,185,129,0.15)' },
  activoOff: { backgroundColor: 'rgba(239,68,68,0.15)' },
  activoText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 20 },
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
