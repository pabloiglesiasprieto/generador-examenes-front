import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ILoginUseCase } from '../../interfaces/useCases/auth/ILoginUseCase';
import { LoginRequest, LoginResponse } from '../../entities/Auth';

/**
 * Caso de uso de inicio de sesión.
 * Delega la autenticación en el repositorio de autenticación inyectado.
 */
@injectable()
export class LoginUseCase implements ILoginUseCase {
  /**
   * @param authRepository - Repositorio de autenticación inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IAuthRepository) private authRepository: IAuthRepository) {}

  /**
   * Ejecuta el inicio de sesión con las credenciales proporcionadas.
   *
   * @param data - Credenciales del usuario: correo y contraseña.
   * @returns Promesa que resuelve con los datos de la sesión iniciada (token JWT y correo).
   */
  execute(data: LoginRequest): Promise<LoginResponse> {
    return this.authRepository.login(data);
  }
}
