import { PageResponse } from '../../../entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../../entities/Pregunta';

/**
 * Contrato del caso de uso para obtener todas las preguntas del banco.
 */
export interface IGetAllPreguntasUseCase {
  /**
   * Obtiene todas las preguntas con soporte opcional de paginación.
   *
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden: 'asc' o 'desc' (opcional).
   * @param page - Número de página (opcional; activa la paginación).
   * @param size - Tamaño de la página (opcional; activa la paginación).
   * @returns Promesa que resuelve con la lista completa o una página de preguntas.
   */
  execute(sortBy?: string, order?: string, page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>>;
}

/**
 * Contrato del caso de uso para obtener una pregunta por su identificador.
 */
export interface IGetPreguntaByIdUseCase {
  /**
   * Obtiene los datos de una pregunta concreta.
   *
   * @param id - Identificador único de la pregunta.
   * @returns Promesa que resuelve con los datos de la pregunta.
   */
  execute(id: number): Promise<PreguntaDTO>;
}

/**
 * Contrato del caso de uso para crear una nueva pregunta.
 */
export interface ICreatePreguntaUseCase {
  /**
   * Crea una nueva pregunta en el banco de preguntas.
   *
   * @param data - Datos de la pregunta a crear.
   * @returns Promesa que resuelve con la pregunta creada.
   */
  execute(data: PreguntaInput): Promise<PreguntaDTO>;
}

/**
 * Contrato del caso de uso para actualizar una pregunta existente.
 */
export interface IUpdatePreguntaUseCase {
  /**
   * Actualiza los datos de una pregunta existente.
   *
   * @param id - Identificador de la pregunta a actualizar.
   * @param data - Nuevos datos de la pregunta.
   * @returns Promesa que resuelve con la pregunta actualizada.
   */
  execute(id: number, data: PreguntaInput): Promise<PreguntaDTO>;
}

/**
 * Contrato del caso de uso para eliminar una pregunta del banco.
 */
export interface IDeletePreguntaUseCase {
  /**
   * Elimina una pregunta por su identificador.
   *
   * @param id - Identificador de la pregunta a eliminar.
   * @returns Promesa que resuelve cuando la pregunta ha sido eliminada.
   */
  execute(id: number): Promise<void>;
}

/**
 * Contrato del caso de uso para importar preguntas desde un archivo CSV.
 */
export interface IImportarCsvPreguntasUseCase {
  /**
   * Importa preguntas desde el contenido de un archivo CSV.
   *
   * @param csvContent - Texto completo del CSV con las preguntas a importar.
   * @returns Promesa que resuelve con la lista de preguntas importadas.
   */
  execute(csvContent: string): Promise<PreguntaDTO[]>;
}
