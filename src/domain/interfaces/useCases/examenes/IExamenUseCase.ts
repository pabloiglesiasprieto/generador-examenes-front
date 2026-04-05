import { ExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../../entities/Examen';

export interface IGetExamenesUseCase {
  execute(sortBy?: string, order?: string): Promise<ExamenDTO[]>;
}

export interface IGetExamenByIdUseCase {
  execute(id: number): Promise<ExamenDTO>;
}

export interface ICreateExamenUseCase {
  execute(): Promise<ExamenDTO>;
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
