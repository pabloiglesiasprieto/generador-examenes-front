export interface UsuarioDTO {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_usuario: string;
  activo?: boolean;
}

export interface RolDTO {
  id_rol: number;
  nombre_rol: string;
  activo: boolean;
}
