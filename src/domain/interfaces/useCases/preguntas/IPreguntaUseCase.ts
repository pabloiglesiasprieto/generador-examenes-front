import { PageResponse } from '../../../entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../../entities/Pregunta';

export interface IGetAllPreguntasUseCase {
  execute(sortBy?: string, order?: string, page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>>;
}

export interface IGetPreguntaByIdUseCase {
  execute(id: number): Promise<PreguntaDTO>;
}

export interface ICreatePreguntaUseCase {
  execute(data: PreguntaInput): Promise<PreguntaDTO>;
}

export interface IUpdatePreguntaUseCase {
  execute(id: number, data: PreguntaInput): Promise<PreguntaDTO>;
}

export interface IDeletePreguntaUseCase {
  execute(id: number): Promise<void>;
}
