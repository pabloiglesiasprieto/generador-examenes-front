import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../../entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../../entities/Examen';

export interface IGetExamenesUseCase {
  execute(sortBy?: string, order?: string): Promise<ExamenDTO[]>;
}

export interface IGetExamenByIdUseCase {
  execute(id: number): Promise<ExamenDTO>;
}

export interface ICreateExamenUseCase {
  execute(duracionMinutos?: number, categoria?: string): Promise<ExamenDTO>;
}

export interface IGetCategoriasUseCase {
  execute(): Promise<string[]>;
}

export interface IIniciarExamenUseCase {
  execute(id: number): Promise<InicioExamenDTO>;
}

export interface IDeleteExamenUseCase {
  execute(id: number): Promise<void>;
}

export interface IEvaluarExamenUseCase {
  execute(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO>;
}

export interface IGetResultadosExamenUseCase {
  execute(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
}

export interface IGetResultadosAlumnoUseCase {
  execute(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
}

export interface IExportExamenesUseCase {
  execute(formato: 'excel' | 'pdf'): Promise<ArrayBuffer>;
}

export interface IGetEstadisticasExamenesUseCase {
  execute(): Promise<EstadisticaExamenDTO[]>;
}

export interface IGetRankingAlumnosUseCase {
  execute(): Promise<EstadisticaAlumnoDTO[]>;
}

export interface IGetEstadisticasPreguntasUseCase {
  execute(): Promise<EstadisticaPreguntaDTO[]>;
}
