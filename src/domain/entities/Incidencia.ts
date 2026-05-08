/**
 * Representa una incidencia o error registrado en el sistema backend.
 */
export interface IncidenciaDTO {
  /** Identificador único de la incidencia (opcional al crear). */
  id_incidencia?: number;
  /** Endpoint de la API donde se produjo la incidencia. */
  endpoint: string;
  /** Tipo de incidencia (p.ej. ERROR, WARNING, INFO). */
  tipo: string;
  /** Clase Java donde se generó la incidencia. */
  clase: string;
  /** Método Java donde se generó la incidencia. */
  metodo: string;
  /** Traza de la pila de error (stack trace). */
  traza: string;
  /** Fecha y hora en que ocurrió la incidencia en formato ISO 8601. */
  fecha: string;
  /** Identificador del usuario que provocó la incidencia, si aplica (opcional). */
  id_usuario?: number;
}
