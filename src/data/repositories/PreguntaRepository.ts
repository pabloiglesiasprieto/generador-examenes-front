import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IPreguntaRepository } from '../../domain/interfaces/repositories/IPreguntaRepository';
import { PageResponse } from '../../domain/entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../domain/entities/Pregunta';

@injectable()
export class PreguntaRepository implements IPreguntaRepository {
  getAllPreguntas(sortBy = 'id', order = 'asc', page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>> {
    const params: Record<string, unknown> = { sortBy, order };
    if (page != null) params.page = page;
    if (size != null) params.size = size;
    return apiClient.get<PreguntaDTO[] | PageResponse<PreguntaDTO>>('/preguntas', { params }).then((r) => r.data);
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
