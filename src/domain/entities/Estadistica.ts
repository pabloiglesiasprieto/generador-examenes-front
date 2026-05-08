/**
 * Estadísticas agregadas de un examen concreto: notas, intentos y alumnos participantes.
 */
export interface EstadisticaExamenDTO {
  /** Identificador del examen al que pertenecen las estadísticas. */
  examen_id: number;
  /** Nota media de todos los intentos, o null si no hay datos. */
  nota_media: number | null;
  /** Nota máxima obtenida en cualquier intento, o null si no hay datos. */
  nota_maxima: number | null;
  /** Nota mínima obtenida en cualquier intento, o null si no hay datos. */
  nota_minima: number | null;
  /** Número total de intentos realizados en el examen. */
  total_intentos: number;
  /** Número de alumnos distintos que han intentado el examen. */
  total_alumnos: number;
}

/**
 * Estadísticas de rendimiento de un alumno concreto en todos sus exámenes.
 */
export interface EstadisticaAlumnoDTO {
  /** Identificador único del usuario. */
  usuario_id: number;
  /** Nombre completo del alumno. */
  nombre_usuario: string;
  /** Nota media del alumno en todos sus exámenes, o null si no ha realizado ninguno. */
  nota_media: number | null;
  /** Número de exámenes realizados por el alumno. */
  examenes_realizados: number;
}

/**
 * Estadísticas de acierto/fallo de una pregunta concreta del banco de preguntas.
 */
export interface EstadisticaPreguntaDTO {
  /** Identificador único de la pregunta. */
  pregunta_id: number;
  /** Texto del enunciado de la pregunta. */
  enunciado: string;
  /** Número total de veces que la pregunta ha sido respondida. */
  total_respuestas: number;
  /** Número de veces que la pregunta ha sido respondida correctamente. */
  respuestas_correctas: number;
  /** Porcentaje de fallo de la pregunta (0-100). */
  tasa_fallo: number;
}
