export interface EstadisticaExamenDTO {
  examen_id: number;
  nota_media: number | null;
  nota_maxima: number | null;
  nota_minima: number | null;
  total_intentos: number;
  total_alumnos: number;
}

export interface EstadisticaAlumnoDTO {
  usuario_id: number;
  nota_media: number | null;
  examenes_realizados: number;
}

export interface EstadisticaPreguntaDTO {
  pregunta_id: number;
  enunciado: string;
  total_respuestas: number;
  respuestas_correctas: number;
  tasa_fallo: number;
}
