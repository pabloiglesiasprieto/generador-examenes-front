import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IUsuarioRepository } from '../../interfaces/repositories/IUsuarioRepository';
import {
  IGetAllRolesUseCase,
  IGetAllUsuariosUseCase,
  IGetUsuarioByIdUseCase,
  IGetRolesByUsuarioUseCase,
  IUpdateUsuarioUseCase,
  IDeleteUsuarioUseCase,
  IAsignarRolUseCase,
  IBorrarRolUseCase,
} from '../../interfaces/useCases/usuarios/IUsuarioUseCase';
import { UsuarioDTO, RolDTO } from '../../entities/Usuario';

@injectable()
export class GetAllRolesUseCase implements IGetAllRolesUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(): Promise<RolDTO[]> {
    return this.usuarioRepository.getAllRoles();
  }
}

@injectable()
export class GetAllUsuariosUseCase implements IGetAllUsuariosUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(): Promise<UsuarioDTO[]> {
    return this.usuarioRepository.getAllUsuarios();
  }
}

@injectable()
export class GetUsuarioByIdUseCase implements IGetUsuarioByIdUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(id: number): Promise<UsuarioDTO> {
    return this.usuarioRepository.getUsuarioById(id);
  }
}

@injectable()
export class GetRolesByUsuarioUseCase implements IGetRolesByUsuarioUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(id: number): Promise<RolDTO[]> {
    return this.usuarioRepository.getRolesByUsuario(id);
  }
}

@injectable()
export class UpdateUsuarioUseCase implements IUpdateUsuarioUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(
    id: number,
    data: { nombre_usuario: string; apellido_usuario: string; correo_usuario: string },
  ): Promise<UsuarioDTO> {
    return this.usuarioRepository.updateUsuario(id, data);
  }
}

@injectable()
export class DeleteUsuarioUseCase implements IDeleteUsuarioUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(id: number): Promise<UsuarioDTO> {
    return this.usuarioRepository.deleteUsuario(id);
  }
}

@injectable()
export class AsignarRolUseCase implements IAsignarRolUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(idUsuario: number, idRol: number): Promise<unknown> {
    return this.usuarioRepository.asignarRol(idUsuario, idRol);
  }
}

@injectable()
export class BorrarRolUseCase implements IBorrarRolUseCase {
  constructor(@inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository) {}
  execute(idUsuario: number, idRol: number): Promise<unknown> {
    return this.usuarioRepository.borrarRol(idUsuario, idRol);
  }
}
