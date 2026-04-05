import { IncidenciaDTO } from '../../entities/Incidencia';

export interface IIncidenciaRepository {
  getAllIncidencias(): Promise<IncidenciaDTO[]>;
  getIncidenciaById(id: number): Promise<IncidenciaDTO>;
  getIncidenciasByClase(clase: string): Promise<IncidenciaDTO[]>;
  crearIncidencia(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO>;
}
