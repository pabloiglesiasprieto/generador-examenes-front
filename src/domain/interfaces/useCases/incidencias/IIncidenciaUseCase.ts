import { IncidenciaDTO } from '../../../entities/Incidencia';

/**
 * Contrato del caso de uso para obtener todas las incidencias del sistema.
 */
export interface IGetAllIncidenciasUseCase {
  /**
   * Obtiene todas las incidencias registradas.
   *
   * @returns Promesa que resuelve con la lista completa de incidencias.
   */
  execute(): Promise<IncidenciaDTO[]>;
}

/**
 * Contrato del caso de uso para obtener una incidencia por su identificador.
 */
export interface IGetIncidenciaByIdUseCase {
  /**
   * Obtiene los datos de una incidencia concreta.
   *
   * @param id - Identificador único de la incidencia.
   * @returns Promesa que resuelve con los datos de la incidencia.
   */
  execute(id: number): Promise<IncidenciaDTO>;
}

/**
 * Contrato del caso de uso para obtener incidencias filtradas por clase Java.
 */
export interface IGetIncidenciasByClaseUseCase {
  /**
   * Obtiene las incidencias filtradas por la clase Java donde se originaron.
   *
   * @param clase - Nombre de la clase Java por la que filtrar.
   * @returns Promesa que resuelve con la lista de incidencias de esa clase.
   */
  execute(clase: string): Promise<IncidenciaDTO[]>;
}

/**
 * Contrato del caso de uso para registrar una nueva incidencia en el sistema.
 */
export interface ICrearIncidenciaUseCase {
  /**
   * Registra una nueva incidencia en el sistema.
   *
   * @param data - Datos de la incidencia a registrar (sin identificador).
   * @returns Promesa que resuelve con la incidencia creada.
   */
  execute(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO>;
}
