import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IPreguntaRepository } from '../../interfaces/repositories/IPreguntaRepository';
import {
  IGetAllPreguntasUseCase,
  IGetPreguntaByIdUseCase,
  ICreatePreguntaUseCase,
  IUpdatePreguntaUseCase,
  IDeletePreguntaUseCase,
  IImportarCsvPreguntasUseCase,
} from '../../interfaces/useCases/preguntas/IPreguntaUseCase';
import { PageResponse } from '../../entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../entities/Pregunta';

/**
 * Caso de uso para obtener todas las preguntas del banco con soporte de paginación.
 */
@injectable()
export class GetAllPreguntasUseCase implements IGetAllPreguntasUseCase {
  /**
   * @param preguntaRepository - Repositorio de preguntas inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}

  /**
   * Obtiene todas las preguntas, con soporte opcional de paginación.
   *
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden: 'asc' o 'desc' (opcional).
   * @param page - Número de página (opcional).
   * @param size - Tamaño de la página (opcional).
   * @returns Promesa que resuelve con la lista completa o una página de preguntas.
   */
  execute(sortBy?: string, order?: string, page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>> {
    return this.preguntaRepository.getAllPreguntas(sortBy, order, page, size);
  }
}

/**
 * Caso de uso para obtener una pregunta por su identificador.
 */
@injectable()
export class GetPreguntaByIdUseCase implements IGetPreguntaByIdUseCase {
  /**
   * @param preguntaRepository - Repositorio de preguntas inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}

  /**
   * Obtiene los datos de una pregunta concreta.
   *
   * @param id - Identificador único de la pregunta.
   * @returns Promesa que resuelve con los datos de la pregunta.
   */
  execute(id: number): Promise<PreguntaDTO> {
    return this.preguntaRepository.getPreguntaById(id);
  }
}

/**
 * Caso de uso para crear una nueva pregunta en el banco de preguntas.
 */
@injectable()
export class CreatePreguntaUseCase implements ICreatePreguntaUseCase {
  /**
   * @param preguntaRepository - Repositorio de preguntas inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}

  /**
   * Crea una nueva pregunta en el banco de preguntas.
   *
   * @param data - Datos de la pregunta a crear.
   * @returns Promesa que resuelve con la pregunta creada.
   */
  execute(data: PreguntaInput): Promise<PreguntaDTO> {
    return this.preguntaRepository.createPregunta(data);
  }
}

/**
 * Caso de uso para actualizar los datos de una pregunta existente.
 */
@injectable()
export class UpdatePreguntaUseCase implements IUpdatePreguntaUseCase {
  /**
   * @param preguntaRepository - Repositorio de preguntas inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}

  /**
   * Actualiza los datos de una pregunta existente.
   *
   * @param id - Identificador de la pregunta a actualizar.
   * @param data - Nuevos datos de la pregunta.
   * @returns Promesa que resuelve con la pregunta actualizada.
   */
  execute(id: number, data: PreguntaInput): Promise<PreguntaDTO> {
    return this.preguntaRepository.updatePregunta(id, data);
  }
}

/**
 * Caso de uso para eliminar una pregunta del banco de preguntas.
 */
@injectable()
export class DeletePreguntaUseCase implements IDeletePreguntaUseCase {
  /**
   * @param preguntaRepository - Repositorio de preguntas inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}

  /**
   * Elimina una pregunta por su identificador.
   *
   * @param id - Identificador de la pregunta a eliminar.
   * @returns Promesa que resuelve cuando la pregunta ha sido eliminada.
   */
  execute(id: number): Promise<void> {
    return this.preguntaRepository.deletePregunta(id);
  }
}

/**
 * Caso de uso para importar preguntas desde el contenido de un archivo CSV.
 */
@injectable()
export class ImportarCsvPreguntasUseCase implements IImportarCsvPreguntasUseCase {
  /**
   * @param preguntaRepository - Repositorio de preguntas inyectado por el contenedor de IoC.
   */
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}

  /**
   * Importa preguntas desde el contenido de un archivo CSV.
   *
   * @param csvContent - Texto completo del CSV con las preguntas a importar.
   * @returns Promesa que resuelve con la lista de preguntas importadas.
   */
  execute(csvContent: string): Promise<PreguntaDTO[]> {
    return this.preguntaRepository.importarCsv(csvContent);
  }
}
