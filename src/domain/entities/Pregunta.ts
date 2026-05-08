/**
 * Representa una opción de respuesta de una pregunta tal como la devuelve el backend.
 */
export interface RespuestaDTO {
  /** Identificador de la respuesta (puede venir como `id` o `respuesta_id`). */
  id?: number;
  /** Identificador alternativo de la respuesta. */
  respuesta_id?: number;
  /** Texto de la opción de respuesta. */
  texto: string;
  /** Indica si esta respuesta es la correcta (opcional, puede omitirse en ciertos contextos). */
  es_correcta?: boolean;
}

/**
 * Representa una pregunta del banco de preguntas tal como la devuelve el backend.
 */
export interface PreguntaDTO {
  /** Identificador único de la pregunta. */
  id: number;
  /** Texto del enunciado de la pregunta. */
  enunciado: string;
  /** Indica si la pregunta admite múltiples respuestas correctas. */
  es_multiple: boolean;
  /** Lista de opciones de respuesta disponibles. */
  respuestas: RespuestaDTO[];
  /** Lista de identificadores de las respuestas correctas (opcional). */
  respuestas_correctas?: number[];
  /** Nivel de dificultad de la pregunta: FACIL, MEDIA o DIFICIL (opcional). */
  dificultad?: string;
  /** Categoría temática de la pregunta (opcional). */
  categoria?: string;
}

/**
 * Representación interna de una respuesta durante la edición en formulario.
 * Incluye una clave única `_key` para el renderizado de listas en React.
 */
export interface RespuestaInput {
  /** Clave interna única generada en cliente para identificar la fila en listas. */
  _key: number;
  /** Texto de la opción de respuesta. */
  texto: string;
  /** Indica si esta respuesta es la correcta. */
  es_correcta: boolean;
}

/**
 * Datos necesarios para crear o actualizar una pregunta mediante la API.
 */
export interface PreguntaInput {
  /** Texto del enunciado de la pregunta. */
  enunciado: string;
  /** Indica si la pregunta admite múltiples respuestas correctas. */
  es_multiple: boolean;
  /** Lista de opciones de respuesta. */
  respuestas: RespuestaInput[];
  /** Nivel de dificultad: FACIL, MEDIA o DIFICIL (opcional). */
  dificultad?: string;
  /** Categoría temática de la pregunta (opcional). */
  categoria?: string;
}
