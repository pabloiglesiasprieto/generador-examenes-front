export interface RespuestaDTO {
  id?: number;
  respuesta_id?: number;
  texto: string;
  es_correcta?: boolean;
}

export interface PreguntaDTO {
  id: number;
  enunciado: string;
  es_multiple: boolean;
  respuestas: RespuestaDTO[];
  respuestas_correctas?: number[];
}

export interface RespuestaInput {
  texto: string;
  es_correcta: boolean;
}

export interface PreguntaInput {
  enunciado: string;
  es_multiple: boolean;
  respuestas: RespuestaInput[];
}
