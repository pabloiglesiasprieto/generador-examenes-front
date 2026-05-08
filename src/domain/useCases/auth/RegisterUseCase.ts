import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IRegisterUseCase } from '../../interfaces/useCases/auth/IRegisterUseCase';
import { RegisterRequest } from '../../entities/Auth';
import { UsuarioDTO } from '../../entities/Usuario';

/**
 * Caso de uso de registro de nuevos usuarios.
 * Delega la creación del usuario en el repositorio de autenticación inyectado.
 */
@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  /**
   * @param authRepository - Repositorio de autenticación inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IAuthRepository) private authRepository: IAuthRepository) {}

  /**
   * Ejecuta el registro de un nuevo usuario con los datos proporcionados.
   *
   * @param data - Datos del nuevo usuario: nombre, apellido, correo y contraseña.
   * @returns Promesa que resuelve con los datos del usuario creado.
   */
  execute(data: RegisterRequest): Promise<UsuarioDTO> {
    return this.authRepository.register(data);
  }
}
