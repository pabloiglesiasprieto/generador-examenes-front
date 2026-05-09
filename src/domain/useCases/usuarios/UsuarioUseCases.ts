import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IUsuarioRepository } from '../../interfaces/repositories/IUsuarioRepository';
import {
  IGetAllRolesUseCase,
  IGetAllUsuariosUseCase,
  IGetAllUsuariosConInactivosUseCase,
  IActivarUsuarioUseCase,
  IGetUsuarioByIdUseCase,
  IGetRolesByUsuarioUseCase,
  IUpdateUsuarioUseCase,
  IDeleteUsuarioUseCase,
  IAsignarRolUseCase,
  IBorrarRolUseCase,
} from '../../interfaces/useCases/usuarios/IUsuarioUseCase';
import { UsuarioDTO, RolDTO } from '../../entities/Usuario';

/**
 * Caso de uso para obtener todos los roles disponibles en el sistema.
 */
@injectable()
export class GetAllRolesUseCase implements IGetAllRolesUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Obtiene la lista de todos los roles del sistema.
   *
   * @returns Promesa que resuelve con la lista de roles.
   */
  execute(): Promise<RolDTO[]> {
    return this.usuarioRepository.getAllRoles();
  }
}

/**
 * Caso de uso para obtener todos los usuarios registrados en el sistema.
 */
@injectable()
export class GetAllUsuariosUseCase implements IGetAllUsuariosUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Obtiene la lista de todos los usuarios del sistema.
   *
   * @returns Promesa que resuelve con la lista de usuarios.
   */
  execute(): Promise<UsuarioDTO[]> {
    return this.usuarioRepository.getAllUsuarios();
  }
}

/**
 * Caso de uso para obtener todos los usuarios incluyendo inactivos.
 */
@injectable()
export class GetAllUsuariosConInactivosUseCase implements IGetAllUsuariosConInactivosUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  execute(): Promise<UsuarioDTO[]> {
    return this.usuarioRepository.getAllUsuariosConInactivos();
  }
}

/**
 * Caso de uso para activar un usuario desactivado.
 */
@injectable()
export class ActivarUsuarioUseCase implements IActivarUsuarioUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  execute(id: number, usuario: UsuarioDTO): Promise<UsuarioDTO> {
    return this.usuarioRepository.activarUsuario(id, usuario);
  }
}

/**
 * Caso de uso para obtener un usuario por su identificador.
 */
@injectable()
export class GetUsuarioByIdUseCase implements IGetUsuarioByIdUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Obtiene los datos de un usuario concreto.
   *
   * @param id - Identificador único del usuario.
   * @returns Promesa que resuelve con los datos del usuario.
   */
  execute(id: number): Promise<UsuarioDTO> {
    return this.usuarioRepository.getUsuarioById(id);
  }
}

/**
 * Caso de uso para obtener los roles asignados a un usuario concreto.
 */
@injectable()
export class GetRolesByUsuarioUseCase implements IGetRolesByUsuarioUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Obtiene los roles del usuario indicado.
   *
   * @param id - Identificador del usuario.
   * @returns Promesa que resuelve con la lista de roles del usuario.
   */
  execute(id: number): Promise<RolDTO[]> {
    return this.usuarioRepository.getRolesByUsuario(id);
  }
}

/**
 * Caso de uso para actualizar los datos personales de un usuario.
 */
@injectable()
export class UpdateUsuarioUseCase implements IUpdateUsuarioUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

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
  ): Promise<UsuarioDTO> {
    return this.usuarioRepository.updateUsuario(id, data);
  }
}

/**
 * Caso de uso para eliminar un usuario del sistema.
 */
@injectable()
export class DeleteUsuarioUseCase implements IDeleteUsuarioUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Elimina un usuario por su identificador.
   *
   * @param id - Identificador del usuario a eliminar.
   * @returns Promesa que resuelve con los datos del usuario eliminado.
   */
  execute(id: number): Promise<UsuarioDTO> {
    return this.usuarioRepository.deleteUsuario(id);
  }
}

/**
 * Caso de uso para asignar un rol a un usuario.
 */
@injectable()
export class AsignarRolUseCase implements IAsignarRolUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Asigna un rol a un usuario.
   *
   * @param idUsuario - Identificador del usuario.
   * @param idRol - Identificador del rol a asignar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  execute(idUsuario: number, idRol: number): Promise<unknown> {
    return this.usuarioRepository.asignarRol(idUsuario, idRol);
  }
}

/**
 * Caso de uso para eliminar un rol de un usuario.
 */
@injectable()
export class BorrarRolUseCase implements IBorrarRolUseCase {
  /** @param usuarioRepository - Repositorio de usuarios inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}

  /**
   * Elimina un rol asignado a un usuario.
   *
   * @param idUsuario - Identificador del usuario.
   * @param idRol - Identificador del rol a eliminar.
   * @returns Promesa que resuelve con la respuesta del servidor.
   */
  execute(idUsuario: number, idRol: number): Promise<unknown> {
    return this.usuarioRepository.borrarRol(idUsuario, idRol);
  }
}
