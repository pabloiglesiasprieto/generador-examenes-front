import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IUsuarioRepository } from '../../domain/interfaces/repositories/IUsuarioRepository';
import { UsuarioDTO, RolDTO } from '../../domain/entities/Usuario';

/**
 * Implementación concreta del repositorio de usuarios.
 * Se comunica con el backend a través de `apiClient` para gestionar
 * usuarios y la asignación de roles.
 */
@injectable()
export class UsuarioRepository implements IUsuarioRepository {
  /**
   * Obtiene la lista de todos los roles disponibles en el sistema.
   *
   * @returns Promesa que resuelve con la lista de roles.
   */
  getAllRoles(): Promise<RolDTO[]> {
    return apiClient.get<RolDTO[]>('/roles').then((r) => r.data);
  }

  /**
   * Obtiene la lista de todos los usuarios registrados en el sistema.
   *
   * @returns Promesa que resuelve con la lista de usuarios.
   */
  getAllUsuarios(): Promise<UsuarioDTO[]> {
    return apiClient.get<UsuarioDTO[]>('/usuarios').then((r) => r.data);
  }

  getAllUsuariosConInactivos(): Promise<UsuarioDTO[]> {
    return apiClient.get<UsuarioDTO[]>('/usuarios?incluirInactivos=true').then((r) => r.data);
  }

  activarUsuario(id: number): Promise<UsuarioDTO> {
    return apiClient.put<UsuarioDTO>(`/usuarios/${id}`, { activo: true }).then((r) => r.data);
  }

  /**
   * Obtiene los datos de un usuario concreto por su identificador.
   *
   * @param id - Identificador único del usuario.
   * @returns Promesa que resuelve con los datos del usuario.
   */
  getUsuarioById(id: number): Promise<UsuarioDTO> {
    return apiClient.get<UsuarioDTO>(`/usuarios/${id}`).then((r) => r.data);
  }

  /**
   * Obtiene los roles asignados a un usuario concreto.
   *
   * @param id - Identificador del usuario.
   * @returns Promesa que resuelve con la lista de roles del usuario.
   */
  getRolesByUsuario(id: number): Promise<RolDTO[]> {
    return apiClient.get<RolDTO[]>(`/usuarios/${id}/roles`).then((r) => r.data);
  }

  /**
   * Actualiza los datos personales de un usuario existente.
   *
   * @param id - Identificador del usuario a actualizar.
   * @param data - Nuevos datos del usuario: nombre, apellido y correo.
   * @returns Promesa que resuelve con los datos actualizados del usuario.
   */
  updateUsuario(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO> {
    return apiClient.put<UsuarioDTO>(`/usuarios/${id}`, data).then((r) => r.data);
  }

  /**
   * Elimina un usuario del sistema por su identificador.
   *
   * @param id - Identificador del usuario a eliminar.
   * @returns Promesa que resuelve con los datos del usuario eliminado.
   */
  deleteUsuario(id: number): Promise<UsuarioDTO> {
    return apiClient.delete<UsuarioDTO>(`/usuarios/${id}`).then((r) => r.data);
  }

  /**
   * Asigna un rol a un usuario.
   *
   * @param idUsuario - Identificador del usuario al que asignar el rol.
   * @param idRol - Identificador del rol a asignar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  asignarRol(idUsuario: number, idRol: number): Promise<unknown> {
    return apiClient.post(`/usuarios/${idUsuario}/roles`, { id_rol: idRol }).then((r) => r.data);
  }

  /**
   * Elimina un rol asignado a un usuario.
   *
   * @param idUsuario - Identificador del usuario al que quitar el rol.
   * @param idRol - Identificador del rol a eliminar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  borrarRol(idUsuario: number, idRol: number): Promise<unknown> {
    return apiClient.delete(`/usuarios/${idUsuario}/roles/${idRol}`).then((r) => r.data);
  }
}
