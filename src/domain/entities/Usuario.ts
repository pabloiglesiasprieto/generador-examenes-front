/**
 * Datos de un usuario del sistema tal como los devuelve el backend.
 */
export interface UsuarioDTO {
  /** Identificador único del usuario. */
  id_usuario: number;
  /** Nombre del usuario. */
  nombre_usuario: string;
  /** Apellido del usuario. */
  apellido_usuario: string;
  /** Correo electrónico del usuario. */
  correo_usuario: string;
  /** Indica si la cuenta del usuario está activa (opcional). */
  activo?: boolean;
}

/**
 * Datos de un rol del sistema tal como los devuelve el backend.
 */
export interface RolDTO {
  /** Identificador único del rol. */
  id_rol: number;
  /** Nombre del rol (p.ej. ADMIN, PROFESOR, ALUMNO). */
  nombre_rol: string;
  /** Indica si el rol está activo en el sistema. */
  activo: boolean;
}
