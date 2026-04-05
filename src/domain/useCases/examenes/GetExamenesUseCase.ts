import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IExamenRepository } from '../../interfaces/repositories/IExamenRepository';
import {
  IGetExamenesUseCase,
  IGetExamenByIdUseCase,
  ICreateExamenUseCase,
  IDeleteExamenUseCase,
  IEvaluarExamenUseCase,
  IGetResultadosExamenUseCase,
  IGetResultadosAlumnoUseCase,
  IExportExamenesUseCase,
} from '../../interfaces/useCases/examenes/IExamenUseCase';
import { ExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../entities/Examen';

@injectable()
export class GetExamenesUseCase implements IGetExamenesUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(sortBy?: string, order?: string): Promise<ExamenDTO[]> {
    return this.examenRepository.getExamenes(sortBy, order);
  }
}

@injectable()
export class GetExamenByIdUseCase implements IGetExamenByIdUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(id: number): Promise<ExamenDTO> {
    return this.examenRepository.getExamenById(id);
  }
}

@injectable()
export class CreateExamenUseCase implements ICreateExamenUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(): Promise<ExamenDTO> {
    return this.examenRepository.createExamen();
  }
}

@injectable()
export class DeleteExamenUseCase implements IDeleteExamenUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(id: number): Promise<void> {
    return this.examenRepository.deleteExamen(id);
  }
}

@injectable()
export class EvaluarExamenUseCase implements IEvaluarExamenUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO> {
    return this.examenRepository.evaluarExamen(id, respuestas);
  }
}

@injectable()
export class GetResultadosExamenUseCase implements IGetResultadosExamenUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]> {
    return this.examenRepository.getResultadosExamen(id, sortBy, order);
  }
}

@injectable()
export class GetResultadosAlumnoUseCase implements IGetResultadosAlumnoUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]> {
    return this.examenRepository.getResultadosAlumno(usuarioId, sortBy, order);
  }
}

@injectable()
export class ExportExamenesUseCase implements IExportExamenesUseCase {
  constructor(@inject(TYPES.IExamenRepository) private examenRepository: IExamenRepository) {}
  execute(formato: 'excel' | 'pdf'): Promise<ArrayBuffer> {
    return this.examenRepository.exportExamenes(formato);
  }
}
