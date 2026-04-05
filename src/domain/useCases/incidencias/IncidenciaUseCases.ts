import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IIncidenciaRepository } from '../../interfaces/repositories/IIncidenciaRepository';
import {
  IGetAllIncidenciasUseCase,
  IGetIncidenciaByIdUseCase,
  IGetIncidenciasByClaseUseCase,
  ICrearIncidenciaUseCase,
} from '../../interfaces/useCases/incidencias/IIncidenciaUseCase';
import { IncidenciaDTO } from '../../entities/Incidencia';

@injectable()
export class GetAllIncidenciasUseCase implements IGetAllIncidenciasUseCase {
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}
  execute(): Promise<IncidenciaDTO[]> {
    return this.incidenciaRepository.getAllIncidencias();
  }
}

@injectable()
export class GetIncidenciaByIdUseCase implements IGetIncidenciaByIdUseCase {
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}
  execute(id: number): Promise<IncidenciaDTO> {
    return this.incidenciaRepository.getIncidenciaById(id);
  }
}

@injectable()
export class GetIncidenciasByClaseUseCase implements IGetIncidenciasByClaseUseCase {
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}
  execute(clase: string): Promise<IncidenciaDTO[]> {
    return this.incidenciaRepository.getIncidenciasByClase(clase);
  }
}

@injectable()
export class CrearIncidenciaUseCase implements ICrearIncidenciaUseCase {
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}
  execute(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO> {
    return this.incidenciaRepository.crearIncidencia(data);
  }
}
