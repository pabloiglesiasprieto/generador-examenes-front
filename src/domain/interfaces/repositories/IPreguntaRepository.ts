import { PageResponse } from '../../entities/Page';
import { PreguntaDTO, PreguntaInput } from '../../entities/Pregunta';

export interface IPreguntaRepository {
  getAllPreguntas(sortBy?: string, order?: string, page?: number, size?: number): Promise<PreguntaDTO[] | PageResponse<PreguntaDTO>>;
  getPreguntaById(id: number): Promise<PreguntaDTO>;
  createPregunta(data: PreguntaInput): Promise<PreguntaDTO>;
  updatePregunta(id: number, data: PreguntaInput): Promise<PreguntaDTO>;
  deletePregunta(id: number): Promise<void>;
}
