import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IIncidenciaRepository } from '../../domain/interfaces/repositories/IIncidenciaRepository';
import { IncidenciaDTO } from '../../domain/entities/Incidencia';

@injectable()
export class IncidenciaRepository implements IIncidenciaRepository {
  getAllIncidencias(): Promise<IncidenciaDTO[]> {
    return apiClient.get<IncidenciaDTO[]>('/incidencias').then((r) => r.data);
  }

  getIncidenciaById(id: number): Promise<IncidenciaDTO> {
    return apiClient.get<IncidenciaDTO>(`/incidencias/${id}`).then((r) => r.data);
  }

  getIncidenciasByClase(clase: string): Promise<IncidenciaDTO[]> {
    return apiClient.get<IncidenciaDTO[]>(`/incidencias/clase/${clase}`).then((r) => r.data);
  }

  crearIncidencia(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO> {
    return apiClient.post<IncidenciaDTO>('/incidencias', data).then((r) => r.data);
  }
}
