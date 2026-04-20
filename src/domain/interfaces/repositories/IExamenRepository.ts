import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../entities/Estadistica';
import { ExamenDTO, InicioExamenDTO, ResultadoDTO, RespuestaAlumnoDTO } from '../../entities/Examen';

export interface IExamenRepository {
  getExamenes(sortBy?: string, order?: string): Promise<ExamenDTO[]>;
  getExamenById(id: number): Promise<ExamenDTO>;
  createExamen(duracionMinutos?: number, categoria?: string): Promise<ExamenDTO>;
  getCategorias(): Promise<string[]>;
  iniciarExamen(id: number): Promise<InicioExamenDTO>;
  deleteExamen(id: number): Promise<void>;
  evaluarExamen(id: number, respuestas: RespuestaAlumnoDTO[]): Promise<ResultadoDTO>;
  getResultadosExamen(id: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
  getResultadosAlumno(usuarioId: number, sortBy?: string, order?: string): Promise<ResultadoDTO[]>;
  exportExamenes(formato: 'excel' | 'pdf'): Promise<ArrayBuffer>;
  getEstadisticasExamenes(): Promise<EstadisticaExamenDTO[]>;
  getRankingAlumnos(): Promise<EstadisticaAlumnoDTO[]>;
  getEstadisticasPreguntas(): Promise<EstadisticaPreguntaDTO[]>;
}
