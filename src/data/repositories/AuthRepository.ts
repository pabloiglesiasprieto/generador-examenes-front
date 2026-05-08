import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IAuthRepository } from '../../domain/interfaces/repositories/IAuthRepository';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../domain/entities/Auth';
import { UsuarioDTO } from '../../domain/entities/Usuario';

/**
 * Implementación concreta del repositorio de autenticación.
 * Se comunica con el backend a través de `apiClient` para realizar
 * las operaciones de inicio de sesión y registro de usuarios.
 */
@injectable()
export class AuthRepository implements IAuthRepository {
  /**
   * Envía las credenciales del usuario al backend y devuelve el token JWT
   * junto con los datos básicos de la sesión.
   *
   * @param data - Objeto con el correo y la contraseña del usuario.
   * @returns Promesa que resuelve con los datos de la sesión iniciada.
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/login', data).then((r) => r.data);
  }

  /**
   * Registra un nuevo usuario en el sistema con los datos proporcionados.
   *
   * @param data - Objeto con nombre, apellido, correo y contraseña del nuevo usuario.
   * @returns Promesa que resuelve con los datos del usuario creado.
   */
  register(data: RegisterRequest): Promise<UsuarioDTO> {
    return apiClient.post<UsuarioDTO>('/auth/register', data).then((r) => r.data);
  }
}
