import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IExamenRepository } from '../../interfaces/repositories/IExamenRepository';
import {
  IGetExamenesUseCase,
  IGetExamenByIdUseCase,
  ICreateExamenUseCase,
  IIniciarExamenUseCase,
  IDeleteExamenUseCase,
  IEvaluarExamenUseCase,
  IGetResultadosExamenUseCase,
  IGetResultadosAlumnoUseCase,
  IExportExamenesUseCase,
  IGetEstadisticasExamenesUseCase,
  IGetRankingAlumnosUseCase,
  IGetEstadisticasPreguntasUseCase,
  IGetCategoriasUseCase,
} from '../../interfaces/useCases/examenes/IExamenUseCase';
import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../entities/Examen';

/**
 * Caso de uso para obtener la lista de exámenes disponibles.
 */
@injectable()
export class GetExamenesUseCase implements IGetExamenesUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene la lista de exámenes, opcionalmente ordenada.
   *
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden: 'asc' o 'desc' (opcional).
   * @returns Promesa que resuelve con la lista de exámenes.
   */
  execute(sortBy?: string, order?: string): Promise<ExamenDTO[]> {
    return this.examenRepository.getExamenes(sortBy, order);
  }
}

/**
 * Caso de uso para obtener un examen por su identificador.
 */
@injectable()
export class GetExamenByIdUseCase implements IGetExamenByIdUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene los datos de un examen concreto.
   *
   * @param id - Identificador único del examen.
   * @returns Promesa que resuelve con los datos del examen.
   */
  execute(id: number): Promise<ExamenDTO> {
    return this.examenRepository.getExamenById(id);
  }
}

/**
 * Caso de uso para crear un nuevo examen.
 */
@injectable()
export class CreateExamenUseCase implements ICreateExamenUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Crea un nuevo examen con los parámetros indicados.
   *
   * @param duracionMinutos - Duración máxima en minutos (opcional).
   * @param categoria - Categoría temática (opcional).
   * @param numPreguntas - Número de preguntas (opcional).
   * @returns Promesa que resuelve con el examen creado.
   */
  execute(duracionMinutos?: number, categoria?: string, numPreguntas?: number): Promise<ExamenDTO> {
    return this.examenRepository.createExamen(duracionMinutos, categoria, numPreguntas);
  }
}

/**
 * Caso de uso para obtener las categorías temáticas disponibles.
 */
@injectable()
export class GetCategoriasUseCase implements IGetCategoriasUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene la lista de categorías del banco de preguntas.
   *
   * @returns Promesa que resuelve con la lista de nombres de categorías.
   */
  execute(): Promise<string[]> {
    return this.examenRepository.getCategorias();
  }
}

/**
 * Caso de uso para registrar el inicio de un examen en el backend.
 */
@injectable()
export class IniciarExamenUseCase implements IIniciarExamenUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Registra el inicio de un examen.
   *
   * @param id - Identificador del examen a iniciar.
   * @returns Promesa que resuelve con las fechas de inicio y límite.
   */
  execute(id: number): Promise<InicioExamenDTO> {
    return this.examenRepository.iniciarExamen(id);
  }
}

/**
 * Caso de uso para eliminar un examen del sistema.
 */
@injectable()
export class DeleteExamenUseCase implements IDeleteExamenUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Elimina un examen por su identificador.
   *
   * @param id - Identificador del examen a eliminar.
   * @returns Promesa que resuelve cuando el examen ha sido eliminado.
   */
  execute(id: number): Promise<void> {
    return this.examenRepository.deleteExamen(id);
  }
}

/**
 * Caso de uso para evaluar las respuestas de un examen y obtener el resultado.
 */
@injectable()
export class EvaluarExamenUseCase implements IEvaluarExamenUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Evalúa las respuestas del alumno y devuelve el resultado.
   *
   * @param id - Identificador del examen.
   * @param respuestas - Lista de respuestas seleccionadas por el alumno.
   * @returns Promesa que resuelve con el resultado de la evaluación.
   */
  execute(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO> {
    return this.examenRepository.evaluarExamen(id, respuestas);
  }
}

/**
 * Caso de uso para obtener todos los resultados de un examen concreto.
 */
@injectable()
export class GetResultadosExamenUseCase implements IGetResultadosExamenUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene todos los resultados de los intentos de un examen.
   *
   * @param id - Identificador del examen.
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden (opcional).
   * @returns Promesa que resuelve con la lista de resultados.
   */
  execute(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]> {
    return this.examenRepository.getResultadosExamen(id, sortBy, order);
  }
}

/**
 * Caso de uso para obtener el historial de resultados de un alumno.
 */
@injectable()
export class GetResultadosAlumnoUseCase implements IGetResultadosAlumnoUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene el historial de resultados de exámenes de un alumno.
   *
   * @param usuarioId - Identificador del alumno.
   * @param sortBy - Campo por el que ordenar (opcional).
   * @param order - Dirección del orden (opcional).
   * @returns Promesa que resuelve con la lista de resultados del alumno.
   */
  execute(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]> {
    return this.examenRepository.getResultadosAlumno(usuarioId, sortBy, order);
  }
}

/**
 * Caso de uso para exportar exámenes a un archivo Excel o PDF.
 */
@injectable()
export class ExportExamenesUseCase implements IExportExamenesUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Exporta los exámenes en el formato indicado.
   *
   * @param formato - Formato de exportación: 'excel' o 'pdf'.
   * @returns Promesa que resuelve con el contenido binario del archivo exportado.
   */
  execute(formato: 'excel' | 'pdf'): Promise<ArrayBuffer> {
    return this.examenRepository.exportExamenes(formato);
  }
}

/**
 * Caso de uso para obtener las estadísticas agregadas de todos los exámenes.
 */
@injectable()
export class GetEstadisticasExamenesUseCase implements IGetEstadisticasExamenesUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene las estadísticas de todos los exámenes del sistema.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por examen.
   */
  execute(): Promise<EstadisticaExamenDTO[]> {
    return this.examenRepository.getEstadisticasExamenes();
  }
}

/**
 * Caso de uso para obtener el ranking de alumnos por nota media.
 */
@injectable()
export class GetRankingAlumnosUseCase implements IGetRankingAlumnosUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene el ranking de alumnos ordenado por nota media descendente.
   *
   * @returns Promesa que resuelve con la lista del ranking de alumnos.
   */
  execute(): Promise<EstadisticaAlumnoDTO[]> {
    return this.examenRepository.getRankingAlumnos();
  }
}

/**
 * Caso de uso para obtener las estadísticas de acierto/fallo de las preguntas.
 */
@injectable()
export class GetEstadisticasPreguntasUseCase implements IGetEstadisticasPreguntasUseCase {
  /** @param examenRepository - Repositorio de exámenes inyectado por el contenedor de IoC. */
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}

  /**
   * Obtiene las estadísticas de acierto/fallo de las preguntas del banco.
   *
   * @returns Promesa que resuelve con la lista de estadísticas por pregunta.
   */
  execute(): Promise<EstadisticaPreguntaDTO[]> {
    return this.examenRepository.getEstadisticasPreguntas();
  }
}
