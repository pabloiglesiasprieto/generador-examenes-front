import { injectable } from 'inversify';
import apiClient from '../apiconnection/apiClient';
import { IPreguntaRepository } from '../../domain/interfaces/repositories/IPreguntaRepository';
import { PageResponse } from '../../domain/entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../domain/entities/Pregunta';

/**
 * Implementación concreta del repositorio de preguntas.
 * Se comunica con el backend a través de `apiClient` para gestionar
 * el banco de preguntas: consulta, creación, actualización, eliminación e importación.
 */
@injectable()
export class PreguntaRepository implements IPreguntaRepository {
  /**
   * Obtiene todas las preguntas del banco, con soporte opcional de paginación.
   *
   * @param sortBy - Campo por el que ordenar los resultados (por defecto 'id').
   * @param order - Dirección del orden: 'asc' o 'desc' (por defecto 'asc').
   * @param page - Número de página a recuperar (opcional; activa la paginación).
   * @param size - Tamaño de la página (opcional; activa la paginación).
   * @returns Promesa que resuelve con la lista completa o una página de preguntas.
   */
  getAllPreguntas(sortBy = 'id', order = 'asc', page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>> {
    const params: Record<string, unknown> = { sortBy, order };
    if (page != null) params.page = page;
    if (size != null) params.size = size;
    return apiClient.get<PreguntaDTO[] | PageResponse<PreguntaDTO>>('/preguntas', { params }).then((r) => r.data);
  }

  /**
   * Obtiene una pregunta concreta con todos sus detalles por su identificador.
   *
   * @param id - Identificador único de la pregunta.
   * @returns Promesa que resuelve con los datos de la pregunta.
   */
  getPreguntaById(id: number): Promise<PreguntaDTO> {
    return apiClient.get<PreguntaDTO>(`/preguntas/${id}`).then((r) => r.data);
  }

  /**
   * Crea una nueva pregunta en el banco de preguntas.
   *
   * @param data - Datos de la pregunta a crear.
   * @returns Promesa que resuelve con la pregunta creada.
   */
  createPregunta(data: PreguntaInput): Promise<PreguntaDTO> {
    return apiClient.post<PreguntaDTO>('/preguntas', data).then((r) => r.data);
  }

  /**
   * Actualiza los datos de una pregunta existente.
   *
   * @param id - Identificador de la pregunta a actualizar.
   * @param data - Nuevos datos de la pregunta.
   * @returns Promesa que resuelve con la pregunta actualizada.
   */
  updatePregunta(id: number, data: PreguntaInput): Promise<PreguntaDTO> {
    return apiClient.put<PreguntaDTO>(`/preguntas/${id}`, data).then((r) => r.data);
  }

  /**
   * Elimina una pregunta del banco por su identificador.
   *
   * @param id - Identificador de la pregunta a eliminar.
   * @returns Promesa que resuelve cuando la pregunta ha sido eliminada.
   */
  deletePregunta(id: number): Promise<void> {
    return apiClient.delete(`/preguntas/${id}`).then(() => undefined);
  }

  /**
   * Importa múltiples preguntas desde el contenido de un archivo CSV.
   * El contenido se envía como `multipart/form-data` al backend.
   *
   * @param csvContent - Texto completo del archivo CSV con las preguntas a importar.
   * @returns Promesa que resuelve con la lista de preguntas importadas.
   */
  importarCsv(csvContent: string): Promise<PreguntaDTO[]> {
    const form = new FormData();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    form.append('archivo', blob, 'preguntas.csv');
    return apiClient.post<PreguntaDTO[]>('/preguntas/importar-csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  }
}
