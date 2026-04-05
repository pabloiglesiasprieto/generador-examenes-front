export interface LoginRequest {
  correo_usuario: string;
  contrasenha_usuario: string;
}

export interface LoginResponse {
  token: string;
  correo_usuario: string;
  mensaje: string;
}

export interface RegisterRequest {
  nombre_usuario: string;
  apellido_usuario: string;
  correo_usuario: string;
  contrasenha_usuario: string;
}

export interface JwtPayload {
  id_usuario: number;
  sub: string;
  roles: string[];
  correo_usuario: string;
  exp: number;
}

export interface AuthUser {
  id: number;
  email: string;
  roles: string[];
  token: string;
}
