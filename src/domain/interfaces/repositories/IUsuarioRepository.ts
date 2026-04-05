import { UsuarioDTO, RolDTO } from '../../entities/Usuario';

export interface IUsuarioRepository {
  getAllRoles(): Promise<RolDTO[]>;
  getAllUsuarios(): Promise<UsuarioDTO[]>;
  getUsuarioById(id: number): Promise<UsuarioDTO>;
  getRolesByUsuario(id: number): Promise<RolDTO[]>;
  updateUsuario(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO>;
  deleteUsuario(id: number): Promise<UsuarioDTO>;
  asignarRol(idUsuario: number, idRol: number): Promise<unknown>;
  borrarRol(idUsuario: number, idRol: number): Promise<unknown>;
}
