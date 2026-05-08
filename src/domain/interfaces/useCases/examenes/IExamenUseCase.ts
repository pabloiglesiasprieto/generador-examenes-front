import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../../entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../../entities/Examen';

/**
 * Contrato del caso de uso para obtener la lista de exámenes.
 */
export interface IGetExamenesUseCase {
  /**
   * Obtiene la lista de exámenes disponibles.
   *
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden: 'asc' o 'desc' (opcional).
   * @returns Promesa que resuelve con la lista de exámenes.
   */
  execute(sortBy?: string, order?: string): Promise<ExamenDTO[]>;
}

/**
 * Contrato del caso de uso para obtener un examen por su identificador.
 */
export interface IGetExamenByIdUseCase {
  /**
   * Obtiene los datos de un examen concreto.
   *
   * @param id - Identificador único del examen.
   * @returns Promesa que resuelve con los datos del examen.
   */
  execute(id: number): Promise<ExamenDTO>;
}

/**
 * Contrato del caso de uso para crear un nuevo examen.
 */
export interface ICreateExamenUseCase {
  /**
   * Crea un nuevo examen con los parámetros indicados.
   *
   * @param duracionMinutos - Duración máxima en minutos (opcional).
   * @param categoria - Categoría temática (opcional).
   * @param numPreguntas - Número de preguntas (opcional).
   * @returns Promesa que resuelve con el examen creado.
   */
  execute(duracionMinutos?: number, categoria?: string, numPreguntas?: number): Promise<ExamenDTO>;
}

/**
 * Contrato del caso de uso para obtener las categorías temáticas disponibles.
 */
export interface IGetCategoriasUseCase {
  /**
   * Obtiene la lista de categorías del banco de preguntas.
   *
   * @returns Promesa que resuelve con la lista de nombres de categorías.
   */
  execute(): Promise<string[]>;
}

/**
 * Contrato del caso de uso para iniciar un examen.
 */
export interface IIniciarExamenUseCase {
  /**
   * Registra el inicio de un examen en el backend.
   *
   * @param id - Identificador del examen a iniciar.
   * @returns Promesa que resuelve con las fechas de inicio y límite.
   */
  execute(id: number): Promise<InicioExamenDTO>;
}

/**
 * Contrato del caso de uso para eliminar un examen.
 */
export interface IDeleteExamenUseCase {
  /**
   * Elimina un examen del sistema.
   *
   * @param id - Identificador del examen a eliminar.
   * @returns Promesa que resuelve cuando el examen ha sido eliminado.
   */
  execute(id: number): Promise<void>;
}

/**
 * Contrato del caso de uso para evaluar las respuestas de un examen.
 */
export interface IEvaluarExamenUseCase {
  /**
   * Evalúa las respuestas del alumno y devuelve el resultado.
   *
   * @param id - Identificador del examen evaluado.
   * @param respuestas - Lista de respuestas seleccionadas por el alumno.
   * @returns Promesa que resuelve con el resultado de la evaluación.
   */
  execute(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO>;
}

/**
 * Contrato del caso de uso para obtener los resultados de un examen.
 */
export interface IGetResultadosExamenUseCase {
  /**
   * Obtiene todos los resultados de los intentos de un examen concreto.
   *
   * @param id - Identificador del examen.
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden (opcional).
   * @returns Promesa que resuelve con la lista de resultados.
   */
  execute(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
}

/**
 * Contrato del caso de uso para obtener el historial de un alumno.
 */
export interface IGetResultadosAlumnoUseCase {
  /**
   * Obtiene el historial de resultados de exámenes de un alumno.
   *
   * @param usuarioId - Identificador del alumno.
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden (opcional).
   * @returns Promesa que resuelve con la lista de resultados del alumno.
   */
  execute(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
}

/**
 * Contrato del caso de uso para exportar exámenes a un archivo.
 */
export interface IExportExamenesUseCase {
  /**
   * Exporta los exámenes en el formato indicado.
   *
   * @param formato - Formato de exportación: 'excel' o 'pdf'.
   * @returns Promesa que resuelve con el contenido binario del archivo exportado.
   */
  execute(formato: 'excel' | 'pdf'): Promise<ArrayBuffer>;
}

/**
 * Contrato del caso de uso para obtener estadísticas de exámenes.
 */
export interface IGetEstadisticasExamenesUseCase {
  /**
   * Obtiene las estadísticas agregadas de todos los exámenes.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por examen.
   */
  execute(): Promise<EstadisticaExamenDTO[]>;
}

/**
 * Contrato del caso de uso para obtener el ranking de alumnos.
 */
export interface IGetRankingAlumnosUseCase {
  /**
   * Obtiene el ranking de alumnos ordenado por nota media.
   *
   * @returns Promesa que resuelve con la lista del ranking de alumnos.
   */
  execute(): Promise<EstadisticaAlumnoDTO[]>;
}

/**
 * Contrato del caso de uso para obtener estadísticas de las preguntas.
 */
export interface IGetEstadisticasPreguntasUseCase {
  /**
   * Obtiene las estadísticas de acierto/fallo de las preguntas del banco.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por pregunta.
   */
  execute(): Promise<EstadisticaPreguntaDTO[]>;
}
