import { useCallback, useMemo, useState } from 'react';
import { useAlert } from './AlertContext';
import { useFocusEffect } from '@react-navigation/native';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetAllRolesUseCase,
  IGetAllUsuariosConInactivosUseCase,
  IActivarUsuarioUseCase,
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

export type TabUsuarios = 'activos' | 'inactivos';

export function useUsersScreen(currentUserId: number | undefined) {
  const { showAlert } = useAlert();
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioDTO | null>(null);
  const [userRoles, setUserRoles] = useState<RolDTO[]>([]);
  const [allRoles, setAllRoles] = useState<RolDTO[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [rolLoading, setRolLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState<TabUsuarios>('activos');

  const getAllRolesUseCase = useMemo(() => container.get<IGetAllRolesUseCase>(TYPES.IGetAllRolesUseCase), []);
  const getAllUsuariosConInactivosUseCase = useMemo(() => container.get<IGetAllUsuariosConInactivosUseCase>(TYPES.IGetAllUsuariosConInactivosUseCase), []);
  const activarUsuarioUseCase = useMemo(() => container.get<IActivarUsuarioUseCase>(TYPES.IActivarUsuarioUseCase), []);
  const deleteUsuarioUseCase = useMemo(() => container.get<IDeleteUsuarioUseCase>(TYPES.IDeleteUsuarioUseCase), []);
  const getRolesByUsuarioUseCase = useMemo(() => container.get<IGetRolesByUsuarioUseCase>(TYPES.IGetRolesByUsuarioUseCase), []);
  const asignarRolUseCase = useMemo(() => container.get<IAsignarRolUseCase>(TYPES.IAsignarRolUseCase), []);
  const borrarRolUseCase = useMemo(() => container.get<IBorrarRolUseCase>(TYPES.IBorrarRolUseCase), []);

  const loadUsuarios = useCallback(async () => {
    try {
      const [data, roles] = await Promise.all([
        getAllUsuariosConInactivosUseCase.execute(),
        getAllRolesUseCase.execute(),
      ]);
      setUsuarios(data);
      setAllRoles(roles);
    } catch {
      showAlert('Error', 'No se pudieron cargar los usuarios');
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

  const usuariosActivos = useMemo(() => usuarios.filter((u) => u.activo !== false), [usuarios]);
  const usuariosInactivos = useMemo(() => usuarios.filter((u) => u.activo === false), [usuarios]);

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
      showAlert('Error', extractApiError(err, 'Error al modificar el rol'));
    } finally {
      setRolLoading(false);
    }
  };

  const handleDesactivar = (u: UsuarioDTO) => {
    if (u.id_usuario === currentUserId) {
      showAlert('Error', 'No puedes desactivarte a ti mismo');
      return;
    }
    showAlert('Desactivar usuario', `¿Desactivar a ${u.nombre_usuario}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desactivar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUsuarioUseCase.execute(u.id_usuario);
            await loadUsuarios();
          } catch {
            showAlert('Error', 'No se pudo desactivar el usuario');
          }
        },
      },
    ]);
  };

  const handleActivar = (u: UsuarioDTO) => {
    showAlert('Activar usuario', `¿Activar a ${u.nombre_usuario}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Activar',
        onPress: async () => {
          try {
            await activarUsuarioUseCase.execute(u.id_usuario, u);
            await loadUsuarios();
          } catch {
            showAlert('Error', 'No se pudo activar el usuario');
          }
        },
      },
    ]);
  };

  return {
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
  };
}
