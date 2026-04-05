import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IExamenRepository } from '../../domain/interfaces/repositories/IExamenRepository';
import { ExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../domain/entities/Examen';

@injectable()
export class ExamenRepository implements IExamenRepository {
  getExamenes(sortBy = 'id', order = 'asc'): Promise<ExamenDTO[]> {
    return apiClient.get<ExamenDTO[]>('/examenes', { params: { sortBy, order } }).then((r) => r.data);
  }

  getExamenById(id: number): Promise<ExamenDTO> {
    return apiClient.get<ExamenDTO>(`/examenes/${id}`).then((r) => r.data);
  }

  createExamen(): Promise<ExamenDTO> {
    return apiClient.post<ExamenDTO>('/examenes').then((r) => r.data);
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
}
