import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IIncidenciaRepository } from '../../domain/interfaces/repositories/IIncidenciaRepository';
import { IncidenciaDTO } from '../../domain/entities/Incidencia';

/**
 * Implementación concreta del repositorio de incidencias.
 * Se comunica con el backend a través de `apiClient` para consultar
 * y registrar las incidencias del sistema.
 */
@injectable()
export class IncidenciaRepository implements IIncidenciaRepository {
  /**
   * Obtiene todas las incidencias registradas en el sistema.
   *
   * @returns Promesa que resuelve con la lista completa de incidencias.
   */
  getAllIncidencias(): Promise<IncidenciaDTO[]> {
    return apiClient.get<IncidenciaDTO[]>('/incidencias').then((r) => r.data);
  }

  /**
   * Obtiene una incidencia concreta por su identificador.
   *
   * @param id - Identificador único de la incidencia.
   * @returns Promesa que resuelve con los datos de la incidencia.
   */
  getIncidenciaById(id: number): Promise<IncidenciaDTO> {
    return apiClient.get<IncidenciaDTO>(`/incidencias/${id}`).then((r) => r.data);
  }

  /**
   * Obtiene las incidencias filtradas por la clase Java donde se originaron.
   *
   * @param clase - Nombre de la clase Java por la que filtrar.
   * @returns Promesa que resuelve con la lista de incidencias de esa clase.
   */
  getIncidenciasByClase(clase: string): Promise<IncidenciaDTO[]> {
    return apiClient.get<IncidenciaDTO[]>(`/incidencias/clase/${clase}`).then((r) => r.data);
  }

  /**
   * Registra una nueva incidencia en el sistema.
   *
   * @param data - Datos de la incidencia a crear (sin identificador).
   * @returns Promesa que resuelve con la incidencia creada, incluyendo su identificador.
   */
  crearIncidencia(data: Omit<IncidenciaDTO, 'id_incidencia'>): Promise<IncidenciaDTO> {
    return apiClient.post<IncidenciaDTO>('/incidencias', data).then((r) => r.data);
  }
}
