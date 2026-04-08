import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IExamenRepository } from '../../domain/interfaces/repositories/IExamenRepository';
import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../domain/entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../domain/entities/Examen';

@injectable()
export class ExamenRepository implements IExamenRepository {
  getExamenes(sortBy = 'id', order = 'asc'): Promise<ExamenDTO[]> {
    return apiClient.get<ExamenDTO[]>('/examenes', { params: { sortBy, order } }).then((r) => r.data);
  }

  getExamenById(id: number): Promise<ExamenDTO> {
    return apiClient.get<ExamenDTO>(`/examenes/${id}`).then((r) => r.data);
  }

  createExamen(duracionMinutos?: number): Promise<ExamenDTO> {
    return apiClient.post<ExamenDTO>('/examenes', null, { params: duracionMinutos != null ? { duracionMinutos } : {} }).then((r) => r.data);
  }

  iniciarExamen(id: number): Promise<InicioExamenDTO> {
    return apiClient.post<InicioExamenDTO>(`/examenes/${id}/iniciar`).then((r) => r.data);
  }

  deleteExamen(id: number): Promise<void> {
    return apiClient.delete(`/examenes/${id}`).then(() => undefined);
  }

  evaluarExamen(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO> {
    return apiClient.post<ResultadoDTO>(`/examenes/${id}/evaluar`, respuestas).then((r) => r.data);
  }

  getResultadosExamen(id: number, sortBy = 'intento', order = 'asc'): Promise<ResultadoDTO[]> {
    return apiClient
      .get<ResultadoDTO[]>(`/examenes/${id}/resultados`, { params: { sortBy, order } })
      .then((r) => r.data);
  }

  getResultadosAlumno(usuarioId: number, sortBy = 'intento', order = 'desc'): Promise<ResultadoDTO[]> {
    return apiClient
      .get<ResultadoDTO[]>(`/usuarios/${usuarioId}/examenes`, { params: { sortBy, order } })
      .then((r) => r.data);
  }

  exportExamenes(formato: 'excel' | 'pdf'): Promise<ArrayBuffer> {
    return apiClient
      .get('/examenes/exportar', { params: { formato }, responseType: 'arraybuffer' })
      .then((r) => r.data);
  }

  getEstadisticasExamenes(): Promise<EstadisticaExamenDTO[]> {
    return apiClient.get<EstadisticaExamenDTO[]>('/examenes/estadisticas').then((r) => r.data);
  }

  getRankingAlumnos(): Promise<EstadisticaAlumnoDTO[]> {
    return apiClient.get<EstadisticaAlumnoDTO[]>('/examenes/estadisticas/ranking').then((r) => r.data);
  }

  getEstadisticasPreguntas(): Promise<EstadisticaPreguntaDTO[]> {
    return apiClient.get<EstadisticaPreguntaDTO[]>('/examenes/estadisticas/preguntas').then((r) => r.data);
  }
}
