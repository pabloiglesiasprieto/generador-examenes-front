import { PreguntaDTO } from './Pregunta';

export interface ExamenDTO {
  id: number;
  autor_id: number;
  fecha_creacion: string;
  duracion_minutos?: number | null;
  preguntas: PreguntaDTO[];
}

export interface InicioExamenDTO {
  fecha_inicio: string;
  fecha_limite: string | null;
}

export interface RespuestaAlumnoDTO {
  pregunta_id: number;
  respuesta_ids: number[];
}

export interface DetalleRespuestaDTO {
  pregunta_id: number;
  enunciado: string;
  es_correcta: boolean;
  respuestas_enviadas: number[];
  respuestas_correctas: number[];
  textos_enviados: string[];
  textos_correctos: string[];
}

export interface ResultadoDTO {
  usuario_id?: number;
  examen_id: number;
  intento: number;
  nota: number;
  total_preguntas: number;
  preguntas_correctas: number;
  tiempo_segundos?: number;
  detalle: DetalleRespuestaDTO[];
}

export type NodeStatus = 'available' | 'completed';

export interface ExamNodeInfo {
  examen: ExamenDTO;
  status: NodeStatus;
  stars: number;
  bestNota: number;
}
