import { PreguntaDTO } from './Pregunta';

/**
 * Datos completos de un examen tal como los devuelve el backend.
 */
export interface ExamenDTO {
  /** Identificador único del examen. */
  id: number;
  /** Identificador del usuario que creó el examen. */
  autor_id: number;
  /** Fecha de creación del examen en formato ISO 8601. */
  fecha_creacion: string;
  /** Duración máxima del examen en minutos, o null si no tiene límite. */
  duracion_minutos?: number | null;
  /** Categoría temática del examen, o null si no tiene categoría asignada. */
  categoria?: string | null;
  /** Lista de preguntas que componen el examen. */
  preguntas: PreguntaDTO[];
}

/**
 * Información de inicio de un examen devuelta por el backend al iniciarlo.
 */
export interface InicioExamenDTO {
  /** Fecha y hora de inicio del examen en formato ISO 8601. */
  fecha_inicio: string;
  /** Fecha y hora límite para completar el examen, o null si no tiene límite. */
  fecha_limite: string | null;
}

/**
 * Respuesta enviada por el alumno para una pregunta concreta del examen.
 */
export interface RespuestaAlumnoDTO {
  /** Identificador de la pregunta respondida. */
  pregunta_id: number;
  /** Lista de identificadores de las respuestas seleccionadas por el alumno. */
  respuesta_ids: number[];
}

/**
 * Detalle del resultado de una pregunta concreta tras la evaluación del examen.
 */
export interface DetalleRespuestaDTO {
  /** Identificador de la pregunta. */
  pregunta_id: number;
  /** Enunciado de la pregunta. */
  enunciado: string;
  /** Indica si la respuesta del alumno a esta pregunta fue correcta. */
  es_correcta: boolean;
  /** Identificadores de las respuestas enviadas por el alumno. */
  respuestas_enviadas: number[];
  /** Identificadores de las respuestas correctas. */
  respuestas_correctas: number[];
  /** Textos de las respuestas enviadas por el alumno. */
  textos_enviados: string[];
  /** Textos de las respuestas correctas. */
  textos_correctos: string[];
}

/**
 * Resultado completo de un intento de examen por parte de un alumno.
 */
export interface ResultadoDTO {
  /** Identificador del usuario que realizó el examen (opcional). */
  usuario_id?: number;
  /** Nombre completo del alumno (opcional). */
  nombre_usuario?: string;
  /** Identificador del examen realizado. */
  examen_id: number;
  /** Número de intento (empieza en 1). */
  intento: number;
  /** Nota obtenida sobre 10. */
  nota: number;
  /** Número total de preguntas del examen. */
  total_preguntas: number;
  /** Número de preguntas respondidas correctamente. */
  preguntas_correctas: number;
  /** Tiempo empleado en completar el examen en segundos (opcional). */
  tiempo_segundos?: number;
  /** Detalle pregunta a pregunta del resultado. */
  detalle: DetalleRespuestaDTO[];
}

/**
 * Estado de un nodo de examen en el mapa de juego.
 * - `available`: el examen está disponible para ser realizado.
 * - `completed`: el examen ya ha sido completado al menos una vez.
 */
export type NodeStatus = 'available' | 'completed';

/**
 * Información enriquecida de un examen para su representación como nodo en el mapa.
 */
export interface ExamNodeInfo {
  /** Datos del examen. */
  examen: ExamenDTO;
  /** Estado actual del nodo: disponible o completado. */
  status: NodeStatus;
  /** Número de estrellas obtenidas (0-3) en función de la mejor nota. */
  stars: number;
  /** Mejor nota conseguida por el alumno en este examen (0 si no lo ha realizado). */
  bestNota: number;
}
