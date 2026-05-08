import { RegisterRequest } from '../../../entities/Auth';
import { UsuarioDTO } from '../../../entities/Usuario';

/**
 * Contrato del caso de uso de registro de nuevos usuarios.
 * Define la operación para crear una cuenta de usuario en el sistema.
 */
export interface IRegisterUseCase {
  /**
   * Ejecuta el registro de un nuevo usuario con los datos proporcionados.
   *
   * @param data - Datos del nuevo usuario: nombre, apellido, correo y contraseña.
   * @returns Promesa que resuelve con los datos del usuario creado.
   */
  execute(data: RegisterRequest): Promise<UsuarioDTO>;
}
