import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IExamenRepository } from '../../domain/interfaces/repositories/IExamenRepository';
import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../domain/entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../domain/entities/Examen';

/**
 * Implementación concreta del repositorio de exámenes.
 * Se comunica con el backend a través de `apiClient` para realizar
 * todas las operaciones relacionadas con exámenes, resultados y estadísticas.
 */
@injectable()
export class ExamenRepository implements IExamenRepository {
  /**
   * Obtiene la lista completa de exámenes disponibles.
   *
   * @param sortBy - Campo por el que ordenar los resultados (por defecto 'id').
   * @param order - Dirección del orden: 'asc' o 'desc' (por defecto 'asc').
   * @returns Promesa que resuelve con la lista de exámenes.
   */
  getExamenes(sortBy = 'id', order = 'asc'): Promise<ExamenDTO[]> {
    return apiClient.get<ExamenDTO[]>('/examenes', { params: { sortBy, order } }).then((r) => r.data);
  }

  /**
   * Obtiene los datos completos de un examen por su identificador.
   *
   * @param id - Identificador único del examen.
   * @returns Promesa que resuelve con los datos del examen.
   */
  getExamenById(id: number): Promise<ExamenDTO> {
    return apiClient.get<ExamenDTO>(`/examenes/${id}`).then((r) => r.data);
  }

  /**
   * Crea un nuevo examen en el sistema con los parámetros opcionales indicados.
   *
   * @param duracionMinutos - Duración máxima del examen en minutos (opcional).
   * @param categoria - Categoría temática para filtrar las preguntas (opcional).
   * @param numPreguntas - Número de preguntas que debe incluir el examen (opcional).
   * @returns Promesa que resuelve con el examen creado.
   */
  createExamen(duracionMinutos?: number, categoria?: string, numPreguntas?: number): Promise<ExamenDTO> {
    const params: Record<string, unknown> = {};
    if (duracionMinutos != null) params.duracionMinutos = duracionMinutos;
    if (categoria != null) params.categoria = categoria;
    if (numPreguntas != null) params.numPreguntas = numPreguntas;
    return apiClient.post<ExamenDTO>('/examenes', null, { params }).then((r) => r.data);
  }

  /**
   * Obtiene las categorías temáticas disponibles en el banco de preguntas.
   *
   * @returns Promesa que resuelve con la lista de nombres de categorías.
   */
  getCategorias(): Promise<string[]> {
    return apiClient.get<string[]>('/examenes/categorias').then((r) => r.data);
  }

  /**
   * Registra el inicio de un examen en el backend para calcular el tiempo empleado.
   *
   * @param id - Identificador del examen a iniciar.
   * @returns Promesa que resuelve con las fechas de inicio y límite del examen.
   */
  iniciarExamen(id: number): Promise<InicioExamenDTO> {
    return apiClient.post<InicioExamenDTO>(`/examenes/${id}/iniciar`).then((r) => r.data);
  }

  /**
   * Elimina un examen del sistema por su identificador.
   *
   * @param id - Identificador del examen a eliminar.
   * @returns Promesa que resuelve cuando el examen ha sido eliminado.
   */
  deleteExamen(id: number): Promise<void> {
    return apiClient.delete(`/examenes/${id}`).then(() => undefined);
  }

  /**
   * Envía las respuestas del alumno y obtiene el resultado evaluado del examen.
   *
   * @param id - Identificador del examen evaluado.
   * @param respuestas - Lista de respuestas seleccionadas por el alumno.
   * @returns Promesa que resuelve con el resultado de la evaluación.
   * @precondition El examen debe haber sido iniciado previamente con `iniciarExamen`.
   */
  evaluarExamen(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO> {
    return apiClient.post<ResultadoDTO>(`/examenes/${id}/evaluar`, respuestas).then((r) => r.data);
  }

  /**
   * Obtiene todos los resultados de los intentos realizados sobre un examen concreto.
   *
   * @param id - Identificador del examen.
   * @param sortBy - Campo por el que ordenar (por defecto 'intento').
   * @param order - Dirección del orden: 'asc' o 'desc' (por defecto 'asc').
   * @returns Promesa que resuelve con la lista de resultados del examen.
   */
  getResultadosExamen(id: number, sortBy = 'intento', order = 'asc'): Promise<ResultadoDTO[]> {
    return apiClient
      .get<ResultadoDTO[]>(`/examenes/${id}/resultados`, { params: { sortBy, order } })
      .then((r) => r.data);
  }

  /**
   * Obtiene el historial de resultados de exámenes de un alumno concreto.
   *
   * @param usuarioId - Identificador del alumno.
   * @param sortBy - Campo por el que ordenar (por defecto 'intento').
   * @param order - Dirección del orden: 'asc' o 'desc' (por defecto 'desc').
   * @returns Promesa que resuelve con la lista de resultados del alumno.
   */
  getResultadosAlumno(usuarioId: number, sortBy = 'intento', order = 'desc'): Promise<ResultadoDTO[]> {
    return apiClient
      .get<ResultadoDTO[]>(`/usuarios/${usuarioId}/examenes`, { params: { sortBy, order } })
      .then((r) => r.data);
  }

  /**
   * Exporta los exámenes en el formato indicado y devuelve el contenido binario del archivo.
   *
   * @param formato - Formato de exportación: 'excel' o 'pdf'.
   * @returns Promesa que resuelve con el contenido binario del archivo exportado.
   */
  exportExamenes(formato: 'excel' | 'pdf'): Promise<ArrayBuffer> {
    return apiClient
      .get('/examenes/exportar', { params: { formato }, responseType: 'arraybuffer' })
      .then((r) => r.data);
  }

  /**
   * Obtiene las estadísticas agregadas de todos los exámenes del sistema.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por examen.
   */
  getEstadisticasExamenes(): Promise<EstadisticaExamenDTO[]> {
    return apiClient.get<EstadisticaExamenDTO[]>('/examenes/estadisticas').then((r) => r.data);
  }

  /**
   * Obtiene el ranking de alumnos ordenado por nota media descendente.
   *
   * @returns Promesa que resuelve con la lista de alumnos del ranking.
   */
  getRankingAlumnos(): Promise<EstadisticaAlumnoDTO[]> {
    return apiClient.get<EstadisticaAlumnoDTO[]>('/examenes/estadisticas/ranking').then((r) => r.data);
  }

  /**
   * Obtiene las estadísticas de acierto/fallo de las preguntas del banco,
   * ordenadas por tasa de fallo descendente.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por pregunta.
   */
  getEstadisticasPreguntas(): Promise<EstadisticaPreguntaDTO[]> {
    return apiClient.get<EstadisticaPreguntaDTO[]>('/examenes/estadisticas/preguntas').then((r) => r.data);
  }
}
