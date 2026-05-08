/**
 * Respuesta paginada genérica del backend.
 * Envuelve una lista de elementos junto con metadatos de paginación.
 *
 * @template T - Tipo de los elementos contenidos en la página.
 */
export interface PageResponse<T> {
  /** Lista de elementos de la página actual. */
  content: T[];
  /** Número total de elementos en todas las páginas. */
  total_elements: number;
  /** Número total de páginas disponibles. */
  total_pages: number;
  /** Índice de la página actual (empieza en 0). */
  number: number;
  /** Tamaño de la página (número máximo de elementos por página). */
  size: number;
  /** Indica si esta es la última página disponible. */
  last: boolean;
}
