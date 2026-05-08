import { PageResponse } from '../../entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../entities/Pregunta';

/**
 * Contrato del repositorio de preguntas.
 * Define las operaciones para gestionar el banco de preguntas:
 * consulta, creación, actualización, eliminación e importación masiva.
 */
export interface IPreguntaRepository {
  /**
   * Obtiene todas las preguntas del banco, con soporte opcional de paginación.
   *
   * @param sortBy - Campo por el que ordenar los resultados (opcional).
   * @param order - Dirección del orden: 'asc' o 'desc' (opcional).
   * @param page - Número de página (opcional; activa la paginación).
   * @param size - Tamaño de la página (opcional; activa la paginación).
   * @returns Promesa que resuelve con la lista completa o una página de preguntas.
   */
  getAllPreguntas(sortBy?: string, order?: string, page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>>;

  /**
   * Obtiene una pregunta por su identificador.
   *
   * @param id - Identificador único de la pregunta.
   * @returns Promesa que resuelve con los datos de la pregunta.
   */
  getPreguntaById(id: number): Promise<PreguntaDTO>;

  /**
   * Crea una nueva pregunta en el banco de preguntas.
   *
   * @param data - Datos de la pregunta a crear.
   * @returns Promesa que resuelve con la pregunta creada.
   */
  createPregunta(data: PreguntaInput): Promise<PreguntaDTO>;

  /**
   * Actualiza los datos de una pregunta existente.
   *
   * @param id - Identificador de la pregunta a actualizar.
   * @param data - Nuevos datos de la pregunta.
   * @returns Promesa que resuelve con la pregunta actualizada.
   */
  updatePregunta(id: number, data: PreguntaInput): Promise<PreguntaDTO>;

  /**
   * Elimina una pregunta del banco por su identificador.
   *
   * @param id - Identificador de la pregunta a eliminar.
   * @returns Promesa que resuelve cuando la pregunta ha sido eliminada.
   */
  deletePregunta(id: number): Promise<void>;

  /**
   * Importa preguntas desde el contenido de un archivo CSV.
   *
   * @param csvContent - Texto completo del CSV con las preguntas a importar.
   * @returns Promesa que resuelve con la lista de preguntas importadas.
   */
  importarCsv(csvContent: string): Promise<PreguntaDTO[]>;
}
