import { LoginRequest, LoginResponse, RegisterRequest } from '../../entities/Auth';
import { UsuarioDTO } from '../../entities/Usuario';

/**
 * Contrato del repositorio de autenticación.
 * Define las operaciones disponibles para la gestión de acceso y registro de usuarios.
 */
export interface IAuthRepository {
  /**
   * Inicia sesión con las credenciales proporcionadas.
   *
   * @param data - Credenciales del usuario (correo y contraseña).
   * @returns Promesa que resuelve con los datos de la sesión (token JWT y correo).
   */
  login(data: LoginRequest): Promise<LoginResponse>;

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param data - Datos del nuevo usuario: nombre, apellido, correo y contraseña.
   * @returns Promesa que resuelve con los datos del usuario creado.
   */
  register(data: RegisterRequest): Promise<UsuarioDTO>;
}
