import { LoginRequest, LoginResponse } from '../../../entities/Auth';

/**
 * Contrato del caso de uso de inicio de sesión.
 * Define la operación de autenticación del usuario en el sistema.
 */
export interface ILoginUseCase {
  /**
   * Ejecuta el inicio de sesión con las credenciales proporcionadas.
   *
   * @param data - Credenciales del usuario: correo y contraseña.
   * @returns Promesa que resuelve con los datos de la sesión iniciada (token JWT y correo).
   */
  execute(data: LoginRequest): Promise<LoginResponse>;
}
