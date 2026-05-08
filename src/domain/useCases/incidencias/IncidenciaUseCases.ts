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

/**
 * Caso de uso para obtener todas las incidencias del sistema.
 */
@injectable()
export class GetAllIncidenciasUseCase implements IGetAllIncidenciasUseCase {
  /**
   * @param incidenciaRepository - Repositorio de incidencias inyectado por el contenedor de IoC.
   */
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}

  /**
   * Obtiene todas las incidencias registradas en el sistema.
   *
   * @returns Promesa que resuelve con la lista completa de incidencias.
   */
  execute(): Promise<IncidenciaDTO[]> {
    return this.incidenciaRepository.getAllIncidencias();
  }
}

/**
 * Caso de uso para obtener una incidencia por su identificador.
 */
@injectable()
export class GetIncidenciaByIdUseCase implements IGetIncidenciaByIdUseCase {
  /**
   * @param incidenciaRepository - Repositorio de incidencias inyectado por el contenedor de IoC.
   */
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}

  /**
   * Obtiene los datos de una incidencia concreta.
   *
   * @param id - Identificador único de la incidencia.
   * @returns Promesa que resuelve con los datos de la incidencia.
   */
  execute(id: number): Promise<IncidenciaDTO> {
    return this.incidenciaRepository.getIncidenciaById(id);
  }
}

/**
 * Caso de uso para obtener incidencias filtradas por clase Java.
 */
@injectable()
export class GetIncidenciasByClaseUseCase implements IGetIncidenciasByClaseUseCase {
  /**
   * @param incidenciaRepository - Repositorio de incidencias inyectado por el contenedor de IoC.
   */
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}

  /**
   * Obtiene las incidencias filtradas por la clase Java donde se originaron.
   *
   * @param clase - Nombre de la clase Java por la que filtrar.
   * @returns Promesa que resuelve con la lista de incidencias de esa clase.
   */
  execute(clase: string): Promise<IncidenciaDTO[]> {
    return this.incidenciaRepository.getIncidenciasByClase(clase);
  }
}

/**
 * Caso de uso para registrar una nueva incidencia en el sistema.
 */
@injectable()
export class CrearIncidenciaUseCase implements ICrearIncidenciaUseCase {
  /**
   * @param incidenciaRepository - Repositorio de incidencias inyectado por el contenedor de IoC.
   */
  constructor(
    @inject(TYPES.IIncidenciaRepository) private incidenciaRepository: IIncidenciaRepository,
  ) {}

  /**
   * Registra una nueva incidencia en el sistema.
   *
   * @param data - Datos de la incidencia a registrar (sin identificador).
   * @returns Promesa que resuelve con la incidencia creada.
   */
  execute(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO> {
    return this.incidenciaRepository.crearIncidencia(data);
  }
}
