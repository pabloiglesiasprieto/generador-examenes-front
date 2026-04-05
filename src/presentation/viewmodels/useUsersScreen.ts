import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetAllRolesUseCase,
  IGetAllUsuariosUseCase,
  IDeleteUsuarioUseCase,
  IGetRolesByUsuarioUseCase,
  IAsignarRolUseCase,
  IBorrarRolUseCase,
} from '../../domain/interfaces/useCases/usuarios/IUsuarioUseCase';
import { UsuarioDTO, RolDTO } from '../../domain/entities/Usuario';

function extractApiError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

export function useUsersScreen(currentUserId: number | undefined) {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioDTO | null>(null);
  const [userRoles, setUserRoles] = useState<RolDTO[]>([]);
  const [allRoles, setAllRoles] = useState<RolDTO[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [rolLoading, setRolLoading] = useState(false);

  const getAllRolesUseCase = useMemo(() => container.get<IGetAllRolesUseCase>(TYPES.IGetAllRolesUseCase), []);
  const getAllUsuariosUseCase = useMemo(() => container.get<IGetAllUsuariosUseCase>(TYPES.IGetAllUsuariosUseCase), []);
  const deleteUsuarioUseCase = useMemo(() => container.get<IDeleteUsuarioUseCase>(TYPES.IDeleteUsuarioUseCase), []);
  const getRolesByUsuarioUseCase = useMemo(() => container.get<IGetRolesByUsuarioUseCase>(TYPES.IGetRolesByUsuarioUseCase), []);
  const asignarRolUseCase = useMemo(() => container.get<IAsignarRolUseCase>(TYPES.IAsignarRolUseCase), []);
  const borrarRolUseCase = useMemo(() => container.get<IBorrarRolUseCase>(TYPES.IBorrarRolUseCase), []);

  const loadUsuarios = useCallback(async () => {
    try {
      const [data, roles] = await Promise.all([
        getAllUsuariosUseCase.execute(),
        getAllRolesUseCase.execute(),
      ]);
      setUsuarios(data);
      setAllRoles(roles);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadUsuarios();
    }, [loadUsuarios]),
  );

  const openUserDetail = async (u: UsuarioDTO) => {
    setSelectedUser(u);
    setModalVisible(true);
    setRolLoading(true);
    try {
      const roles = await getRolesByUsuarioUseCase.execute(u.id_usuario);
      setUserRoles(roles);
    } catch {
      setUserRoles([]);
    } finally {
      setRolLoading(false);
    }
  };

  const closeModal = () => setModalVisible(false);

  const handleToggleRol = async (rolId: number) => {
    if (!selectedUser) return;
    const hasRol = userRoles.some((r) => r.id_rol === rolId);
    setRolLoading(true);
    try {
      if (hasRol) {
        await borrarRolUseCase.execute(selectedUser.id_usuario, rolId);
      } else {
        await asignarRolUseCase.execute(selectedUser.id_usuario, rolId);
      }
      const roles = await getRolesByUsuarioUseCase.execute(selectedUser.id_usuario);
      setUserRoles(roles);
    } catch (err: unknown) {
      Alert.alert('Error', extractApiError(err, 'Error al modificar el rol'));
    } finally {
      setRolLoading(false);
    }
  };

  const handleDelete = (u: UsuarioDTO) => {
    if (u.id_usuario === currentUserId) {
      Alert.alert('Error', 'No puedes eliminarte a ti mismo');
      return;
    }
    Alert.alert('Eliminar usuario', `¿Eliminar a ${u.nombre_usuario}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUsuarioUseCase.execute(u.id_usuario);
            await loadUsuarios();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el usuario');
          }
        },
      },
    ]);
  };

  return {
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
  };
}
