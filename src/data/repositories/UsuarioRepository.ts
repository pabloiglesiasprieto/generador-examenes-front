import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IUsuarioRepository } from '../../domain/interfaces/repositories/IUsuarioRepository';
import { UsuarioDTO, RolDTO } from '../../domain/entities/Usuario';

@injectable()
export class UsuarioRepository implements IUsuarioRepository {
  getAllRoles(): Promise<RolDTO[]> {
    return apiClient.get<RolDTO[]>('/roles').then((r) => r.data);
  }

  getAllUsuarios(): Promise<UsuarioDTO[]> {
    return apiClient.get<UsuarioDTO[]>('/usuarios').then((r) => r.data);
  }

  getUsuarioById(id: number): Promise<UsuarioDTO> {
    return apiClient.get<UsuarioDTO>(`/usuarios/${id}`).then((r) => r.data);
  }

  getRolesByUsuario(id: number): Promise<RolDTO[]> {
    return apiClient.get<RolDTO[]>(`/usuarios/${id}/roles`).then((r) => r.data);
  }

  updateUsuario(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO> {
    return apiClient.put<UsuarioDTO>(`/usuarios/${id}`, data).then((r) => r.data);
  }

  deleteUsuario(id: number): Promise<UsuarioDTO> {
    return apiClient.delete<UsuarioDTO>(`/usuarios/${id}`).then((r) => r.data);
  }

  asignarRol(idUsuario: number, idRol: number): Promise<unknown> {
    return apiClient.post(`/usuarios/${idUsuario}/roles`, { id_rol: idRol }).then((r) => r.data);
  }

  borrarRol(idUsuario: number, idRol: number): Promise<unknown> {
    return apiClient.delete(`/usuarios/${idUsuario}/roles/${idRol}`).then((r) => r.data);
  }
}
