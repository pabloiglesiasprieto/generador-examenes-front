import { useCallback, useMemo, useState } from 'react';
import { useAlert } from './AlertContext';
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

/**
 * Extrae el mensaje de error de una respuesta de la API o devuelve un mensaje de reserva.
 *
 * @param err - Error capturado en el bloque catch.
 * @param fallback - Mensaje a devolver si no hay mensaje de la API.
 * @returns Mensaje de error legible para el usuario.
 */
function extractApiError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

/**
 * ViewModel de la pantalla de gestión de usuarios.
 * Carga la lista de usuarios y roles disponibles, permite abrir el detalle de un usuario
 * para consultar y modificar sus roles, y gestiona la eliminación de usuarios.
 *
 * @param currentUserId - Identificador del usuario autenticado actualmente,
 *   usado para impedir que el administrador se elimine a sí mismo.
 * @precondition El usuario autenticado debe tener rol ADMIN.
 * @returns Objeto con el estado y los handlers de la pantalla de usuarios:
 *   - `usuarios`: lista completa de usuarios cargados.
 *   - `loading`: indicador de carga inicial.
 *   - `selectedUser`: usuario seleccionado para ver el detalle, o null.
 *   - `userRoles`: roles asignados actualmente al usuario seleccionado.
 *   - `allRoles`: lista de todos los roles disponibles en el sistema.
 *   - `modalVisible`: indica si el modal de detalle está visible.
 *   - `rolLoading`: indica si se está cargando o modificando un rol.
 *   - `openUserDetail`: abre el modal de detalle y carga los roles del usuario.
 *   - `closeModal`: cierra el modal de detalle.
 *   - `handleToggleRol`: asigna o revoca un rol del usuario seleccionado.
 *   - `handleDelete`: solicita confirmación y elimina un usuario.
 */
export function useUsersScreen(currentUserId: number | undefined) {
  const { showAlert } = useAlert();
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

  const handleDelete = (u: UsuarioDTO) => {
    if (u.id_usuario === currentUserId) {
      showAlert('Error', 'No puedes eliminarte a ti mismo');
      return;
    }
    showAlert('Eliminar usuario', `¿Eliminar a ${u.nombre_usuario}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUsuarioUseCase.execute(u.id_usuario);
            await loadUsuarios();
          } catch {
            showAlert('Error', 'No se pudo eliminar el usuario');
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
