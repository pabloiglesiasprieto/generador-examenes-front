import { UsuarioDTO, RolDTO } from '../../../entities/Usuario';

/**
 * Contrato del caso de uso para obtener todos los roles del sistema.
 */
export interface IGetAllRolesUseCase {
  /**
   * Obtiene la lista de todos los roles disponibles.
   *
   * @returns Promesa que resuelve con la lista de roles.
   */
  execute(): Promise<RolDTO[]>;
}

/**
 * Contrato del caso de uso para obtener todos los usuarios del sistema.
 */
export interface IGetAllUsuariosUseCase {
  /**
   * Obtiene la lista de todos los usuarios registrados.
   *
   * @returns Promesa que resuelve con la lista de usuarios.
   */
  execute(): Promise<UsuarioDTO[]>;
}

/**
 * Contrato del caso de uso para obtener un usuario por su identificador.
 */
export interface IGetUsuarioByIdUseCase {
  /**
   * Obtiene los datos de un usuario concreto.
   *
   * @param id - Identificador único del usuario.
   * @returns Promesa que resuelve con los datos del usuario.
   */
  execute(id: number): Promise<UsuarioDTO>;
}

/**
 * Contrato del caso de uso para obtener los roles de un usuario concreto.
 */
export interface IGetRolesByUsuarioUseCase {
  /**
   * Obtiene los roles asignados a un usuario.
   *
   * @param id - Identificador del usuario.
   * @returns Promesa que resuelve con la lista de roles del usuario.
   */
  execute(id: number): Promise<RolDTO[]>;
}

/**
 * Contrato del caso de uso para actualizar los datos de un usuario.
 */
export interface IUpdateUsuarioUseCase {
  /**
   * Actualiza los datos personales de un usuario.
   *
   * @param id - Identificador del usuario a actualizar.
   * @param data - Nuevos datos: nombre, apellido y correo.
   * @returns Promesa que resuelve con los datos actualizados del usuario.
   */
  execute(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO>;
}

/**
 * Contrato del caso de uso para eliminar un usuario del sistema.
 */
export interface IDeleteUsuarioUseCase {
  /**
   * Elimina un usuario por su identificador.
   *
   * @param id - Identificador del usuario a eliminar.
   * @returns Promesa que resuelve con los datos del usuario eliminado.
   */
  execute(id: number): Promise<UsuarioDTO>;
}

/**
 * Contrato del caso de uso para asignar un rol a un usuario.
 */
export interface IAsignarRolUseCase {
  /**
   * Asigna un rol a un usuario.
   *
   * @param idUsuario - Identificador del usuario.
   * @param idRol - Identificador del rol a asignar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  execute(idUsuario: number, idRol: number): Promise<unknown>;
}

/**
 * Contrato del caso de uso para eliminar un rol de un usuario.
 */
export interface IBorrarRolUseCase {
  /**
   * Elimina un rol asignado a un usuario.
   *
   * @param idUsuario - Identificador del usuario.
   * @param idRol - Identificador del rol a eliminar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  execute(idUsuario: number, idRol: number): Promise<unknown>;
}
