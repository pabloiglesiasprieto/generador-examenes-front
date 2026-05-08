import { IncidenciaDTO } from '../../entities/Incidencia';

/**
 * Contrato del repositorio de incidencias.
 * Define las operaciones disponibles para consultar y registrar incidencias del sistema.
 */
export interface IIncidenciaRepository {
  /**
   * Obtiene todas las incidencias registradas en el sistema.
   *
   * @returns Promesa que resuelve con la lista completa de incidencias.
   */
  getAllIncidencias(): Promise<IncidenciaDTO[]>;

  /**
   * Obtiene una incidencia concreta por su identificador.
   *
   * @param id - Identificador único de la incidencia.
   * @returns Promesa que resuelve con los datos de la incidencia.
   */
  getIncidenciaById(id: number): Promise<IncidenciaDTO>;

  /**
   * Obtiene las incidencias filtradas por la clase Java donde se originaron.
   *
   * @param clase - Nombre de la clase Java por la que filtrar.
   * @returns Promesa que resuelve con la lista de incidencias de esa clase.
   */
  getIncidenciasByClase(clase: string): Promise<IncidenciaDTO[]>;

  /**
   * Registra una nueva incidencia en el sistema.
   *
   * @param data - Datos de la incidencia a crear (sin identificador).
   * @returns Promesa que resuelve con la incidencia creada, incluyendo su identificador.
   */
  crearIncidencia(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO>;
}
