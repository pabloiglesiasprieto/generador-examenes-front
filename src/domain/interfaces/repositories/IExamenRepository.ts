import { ExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../entities/Examen';

export interface IExamenRepository {
  getExamenes(sortBy?: string, order?: string): Promise<ExamenDTO[]>;
  getExamenById(id: number): Promise<ExamenDTO>;
  createExamen(): Promise<ExamenDTO>;
  deleteExamen(id: number): Promise<void>;
  evaluarExamen(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO>;
  getResultadosExamen(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
  getResultadosAlumno(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
  exportExamenes(formato: 'excel' | 'pdf'): Promise<ArrayBuffer>;
}
