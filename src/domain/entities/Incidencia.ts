export interface IncidenciaDTO {
  id_incidencia?: number;
  endpoint: string;
  tipo: string;
  clase: string;
  metodo: string;
  traza: string;
  fecha: string;
  id_usuario?: number;
}
