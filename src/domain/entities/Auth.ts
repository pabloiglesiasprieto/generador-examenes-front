/**
 * Datos necesarios para iniciar sesión en la aplicación.
 */
export interface LoginRequest {
  /** Correo electrónico del usuario. */
  correo_usuario: string;
  /** Contraseña del usuario. */
  contrasenha_usuario: string;
}

/**
 * Respuesta del servidor tras un inicio de sesión exitoso.
 */
export interface LoginResponse {
  /** Token JWT de sesión. */
  token: string;
  /** Correo electrónico del usuario autenticado. */
  correo_usuario: string;
  /** Mensaje informativo del servidor. */
  mensaje: string;
}

/**
 * Datos necesarios para registrar un nuevo usuario en la aplicación.
 */
export interface RegisterRequest {
  /** Nombre del usuario. */
  nombre_usuario: string;
  /** Apellido del usuario. */
  apellido_usuario: string;
  /** Correo electrónico del usuario. */
  correo_usuario: string;
  /** Contraseña elegida por el usuario. */
  contrasenha_usuario: string;
}

/**
 * Carga útil decodificada del token JWT emitido por el backend.
 */
export interface JwtPayload {
  /** Identificador único del usuario en la base de datos. */
  id_usuario: number;
  /** Sujeto del token (generalmente el correo electrónico). */
  sub: string;
  /** Lista de roles asignados al usuario (p.ej. 'ADMIN', 'ALUMNO'). */
  roles: string[];
  /** Correo electrónico incluido en el token. */
  correo_usuario: string;
  /** Nombre del usuario (opcional). */
  nombre_usuario?: string;
  /** Apellido del usuario (opcional). */
  apellido_usuario?: string;
  /** Fecha de expiración del token en segundos Unix. */
  exp: number;
}

/**
 * Representación del usuario autenticado almacenada en el contexto de la aplicación.
 */
export interface AuthUser {
  /** Identificador único del usuario. */
  id: number;
  /** Correo electrónico del usuario. */
  email: string;
  /** Nombre del usuario (opcional). */
  nombre?: string;
  /** Apellido del usuario (opcional). */
  apellido?: string;
  /** Lista de roles asignados al usuario. */
  roles: string[];
  /** Token JWT de sesión activo. */
  token: string;
}
