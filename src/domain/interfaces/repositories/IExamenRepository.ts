import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../entities/Examen';

/**
 * Contrato del repositorio de exámenes.
 * Define todas las operaciones disponibles para la gestión de exámenes,
 * resultados y estadísticas.
 */
export interface IExamenRepository {
  /**
   * Obtiene la lista de exámenes, opcionalmente ordenada.
   *
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden: 'asc' o 'desc' (opcional).
   * @returns Promesa que resuelve con la lista de exámenes.
   */
  getExamenes(sortBy?: string, order?: string): Promise<ExamenDTO[]>;

  /**
   * Obtiene un examen por su identificador.
   *
   * @param id - Identificador del examen.
   * @returns Promesa que resuelve con los datos del examen.
   */
  getExamenById(id: number): Promise<ExamenDTO>;

  /**
   * Crea un nuevo examen con los parámetros indicados.
   *
   * @param duracionMinutos - Duración máxima en minutos (opcional).
   * @param categoria - Categoría temática (opcional).
   * @param numPreguntas - Número de preguntas (opcional).
   * @returns Promesa que resuelve con el examen creado.
   */
  createExamen(duracionMinutos?: number, categoria?: string, numPreguntas?: number): Promise<ExamenDTO>;

  /**
   * Obtiene las categorías temáticas disponibles en el banco de preguntas.
   *
   * @returns Promesa que resuelve con la lista de categorías.
   */
  getCategorias(): Promise<string[]>;

  /**
   * Registra el inicio de un examen en el backend.
   *
   * @param id - Identificador del examen a iniciar.
   * @returns Promesa que resuelve con las fechas de inicio y límite.
   */
  iniciarExamen(id: number): Promise<InicioExamenDTO>;

  /**
   * Elimina un examen por su identificador.
   *
   * @param id - Identificador del examen a eliminar.
   * @returns Promesa que resuelve cuando el examen ha sido eliminado.
   */
  deleteExamen(id: number): Promise<void>;

  /**
   * Evalúa las respuestas de un alumno y devuelve el resultado del examen.
   *
   * @param id - Identificador del examen.
   * @param respuestas - Respuestas seleccionadas por el alumno.
   * @returns Promesa que resuelve con el resultado de la evaluación.
   */
  evaluarExamen(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO>;

  /**
   * Obtiene todos los resultados de un examen concreto.
   *
   * @param id - Identificador del examen.
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden (opcional).
   * @returns Promesa que resuelve con la lista de resultados.
   */
  getResultadosExamen(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;

  /**
   * Obtiene el historial de resultados de un alumno concreto.
   *
   * @param usuarioId - Identificador del alumno.
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden (opcional).
   * @returns Promesa que resuelve con la lista de resultados del alumno.
   */
  getResultadosAlumno(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;

  /**
   * Exporta los exámenes en el formato indicado.
   *
   * @param formato - Formato de exportación: 'excel' o 'pdf'.
   * @returns Promesa que resuelve con el contenido binario del archivo.
   */
  exportExamenes(formato: 'excel' | 'pdf'): Promise<ArrayBuffer>;

  /**
   * Obtiene las estadísticas agregadas de todos los exámenes.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por examen.
   */
  getEstadisticasExamenes(): Promise<EstadisticaExamenDTO[]>;

  /**
   * Obtiene el ranking de alumnos ordenado por nota media.
   *
   * @returns Promesa que resuelve con la lista del ranking de alumnos.
   */
  getRankingAlumnos(): Promise<EstadisticaAlumnoDTO[]>;

  /**
   * Obtiene las estadísticas de acierto/fallo de las preguntas del banco.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por pregunta.
   */
  getEstadisticasPreguntas(): Promise<EstadisticaPreguntaDTO[]>;
}
