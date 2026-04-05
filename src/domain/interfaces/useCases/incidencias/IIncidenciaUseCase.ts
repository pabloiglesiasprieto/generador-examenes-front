import { IncidenciaDTO } from '../../../entities/Incidencia';

export interface IGetAllIncidenciasUseCase {
  execute(): Promise<IncidenciaDTO[]>;
}

export interface IGetIncidenciaByIdUseCase {
  execute(id: number): Promise<IncidenciaDTO>;
}

export interface IGetIncidenciasByClaseUseCase {
  execute(clase: string): Promise<IncidenciaDTO[]>;
}

export interface ICrearIncidenciaUseCase {
  execute(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO>;
}
