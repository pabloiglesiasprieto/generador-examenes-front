import { LoginRequest, LoginResponse, RegisterRequest } from '../../entities/Auth';
import { UsuarioDTO } from '../../entities/Usuario';

export interface IAuthRepository {
  login(data: LoginRequest): Promise<LoginResponse>;
  register(data: RegisterRequest): Promise<UsuarioDTO>;
}
