import { UsuarioDTO, RolDTO } from '../../../entities/Usuario';

export interface IGetAllRolesUseCase {
  execute(): Promise<RolDTO[]>;
}

export interface IGetAllUsuariosUseCase {
  execute(): Promise<UsuarioDTO[]>;
}

export interface IGetUsuarioByIdUseCase {
  execute(id: number): Promise<UsuarioDTO>;
}

export interface IGetRolesByUsuarioUseCase {
  execute(id: number): Promise<RolDTO[]>;
}

export interface IUpdateUsuarioUseCase {
  execute(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO>;
}

export interface IDeleteUsuarioUseCase {
  execute(id: number): Promise<UsuarioDTO>;
}

export interface IAsignarRolUseCase {
  execute(idUsuario: number, idRol: number): Promise<unknown>;
}

export interface IBorrarRolUseCase {
  execute(idUsuario: number, idRol: number): Promise<unknown>;
}
