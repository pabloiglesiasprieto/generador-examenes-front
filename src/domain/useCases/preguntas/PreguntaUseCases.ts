import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IPreguntaRepository } from '../../interfaces/repositories/IPreguntaRepository';
import {
  IGetAllPreguntasUseCase,
  IGetPreguntaByIdUseCase,
  ICreatePreguntaUseCase,
  IUpdatePreguntaUseCase,
  IDeletePreguntaUseCase,
} from '../../interfaces/useCases/preguntas/IPreguntaUseCase';
import { PreguntaDTO, PreguntaInput } from '../../entities/Pregunta';

@injectable()
export class GetAllPreguntasUseCase implements IGetAllPreguntasUseCase {
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}
  execute(sortBy?: string, order?: string): Promise<PreguntaDTO[]> {
    return this.preguntaRepository.getAllPreguntas(sortBy, order);
  }
}

@injectable()
export class GetPreguntaByIdUseCase implements IGetPreguntaByIdUseCase {
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}
  execute(id: number): Promise<PreguntaDTO> {
    return this.preguntaRepository.getPreguntaById(id);
  }
}

@injectable()
export class CreatePreguntaUseCase implements ICreatePreguntaUseCase {
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}
  execute(data: PreguntaInput): Promise<PreguntaDTO> {
    return this.preguntaRepository.createPregunta(data);
  }
}

@injectable()
export class UpdatePreguntaUseCase implements IUpdatePreguntaUseCase {
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}
  execute(id: number, data: PreguntaInput): Promise<PreguntaDTO> {
    return this.preguntaRepository.updatePregunta(id, data);
  }
}

@injectable()
export class DeletePreguntaUseCase implements IDeletePreguntaUseCase {
  constructor(@inject(TYPES.IPreguntaRepository) private preguntaRepository: IPreguntaRepository) {}
  execute(id: number): Promise<void> {
    return this.preguntaRepository.deletePregunta(id);
  }
}
