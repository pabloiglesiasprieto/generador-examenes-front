import { RegisterRequest } from '../../../entities/Auth';
import { UsuarioDTO } from '../../../entities/Usuario';

export interface IRegisterUseCase {
  execute(data: RegisterRequest): Promise<UsuarioDTO>;
}
