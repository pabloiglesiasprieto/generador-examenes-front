import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IPreguntaRepository } from '../../domain/interfaces/repositories/IPreguntaRepository';
import { PreguntaDTO, PreguntaInput } from '../../domain/entities/Pregunta';

@injectable()
export class PreguntaRepository implements IPreguntaRepository {
  getAllPreguntas(sortBy = 'id', order = 'asc'): Promise<PreguntaDTO[]> {
    return apiClient.get<PreguntaDTO[]>('/preguntas', { params: { sortBy, order } }).then((r) => r.data);
  }

  getPreguntaById(id: number): Promise<PreguntaDTO> {
    return apiClient.get<PreguntaDTO>(`/preguntas/${id}`).then((r) => r.data);
  }

  createPregunta(data: PreguntaInput): Promise<PreguntaDTO> {
    return apiClient.post<PreguntaDTO>('/preguntas', data).then((r) => r.data);
  }

  updatePregunta(id: number, data: PreguntaInput): Promise<PreguntaDTO> {
    return apiClient.put<PreguntaDTO>(`/preguntas/${id}`, data).then((r) => r.data);
  }

  deletePregunta(id: number): Promise<void> {
    return apiClient.delete(`/preguntas/${id}`).then(() => undefined);
  }
}
