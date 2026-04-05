import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IAuthRepository } from '../../domain/interfaces/repositories/IAuthRepository';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../domain/entities/Auth';
import { UsuarioDTO } from '../../domain/entities/Usuario';

@injectable()
export class AuthRepository implements IAuthRepository {
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/login', data).then((r) => r.data);
  }

  register(data: RegisterRequest): Promise<UsuarioDTO> {
    return apiClient.post<UsuarioDTO>('/auth/register', data).then((r) => r.data);
  }
}
