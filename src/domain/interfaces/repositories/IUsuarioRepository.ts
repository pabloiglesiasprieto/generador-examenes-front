import { UsuarioDTO, RolDTO } from '../../entities/Usuario';

/**
 * Contrato del repositorio de usuarios.
 * Define las operaciones para gestionar usuarios y la asignación de roles.
 */
export interface IUsuarioRepository {
  /**
   * Obtiene la lista de todos los roles disponibles en el sistema.
   *
   * @returns Promesa que resuelve con la lista de roles.
   */
  getAllRoles(): Promise<RolDTO[]>;

  /**
   * Obtiene la lista de todos los usuarios registrados en el sistema.
   *
   * @returns Promesa que resuelve con la lista de usuarios.
   */
  getAllUsuarios(): Promise<UsuarioDTO[]>;

  /**
   * Obtiene los datos de un usuario por su identificador.
   *
   * @param id - Identificador único del usuario.
   * @returns Promesa que resuelve con los datos del usuario.
   */
  getUsuarioById(id: number): Promise<UsuarioDTO>;

  /**
   * Obtiene los roles asignados a un usuario concreto.
   *
   * @param id - Identificador del usuario.
   * @returns Promesa que resuelve con la lista de roles del usuario.
   */
  getRolesByUsuario(id: number): Promise<RolDTO[]>;

  /**
   * Actualiza los datos personales de un usuario.
   *
   * @param id - Identificador del usuario a actualizar.
   * @param data - Nuevos datos: nombre, apellido y correo.
   * @returns Promesa que resuelve con los datos actualizados del usuario.
   */
  updateUsuario(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO>;

  /**
   * Elimina un usuario del sistema por su identificador.
   *
   * @param id - Identificador del usuario a eliminar.
   * @returns Promesa que resuelve con los datos del usuario eliminado.
   */
  deleteUsuario(id: number): Promise<UsuarioDTO>;

  /**
   * Asigna un rol a un usuario.
   *
   * @param idUsuario - Identificador del usuario.
   * @param idRol - Identificador del rol a asignar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  asignarRol(idUsuario: number, idRol: number): Promise<unknown>;

  /**
   * Elimina un rol asignado a un usuario.
   *
   * @param idUsuario - Identificador del usuario.
   * @param idRol - Identificador del rol a eliminar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  borrarRol(idUsuario: number, idRol: number): Promise<unknown>;
}
