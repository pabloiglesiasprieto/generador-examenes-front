import { PreguntaInput, RespuestaInput } from '../../domain/entities/Pregunta';

export interface JsonValidationError {
  path: string;
  message: string;
}

export interface JsonValidationResult {
  valid: boolean;
  errors: JsonValidationError[];
  preguntas?: PreguntaInput[];
}

const ALLOWED_ROOT_KEYS = new Set(['enunciado', 'es_multiple', 'respuestas', 'dificultad', 'categoria']);
const REQUIRED_ROOT_KEYS = ['enunciado', 'es_multiple', 'respuestas'];
const ALLOWED_RESPUESTA_KEYS = new Set(['texto', 'es_correcta']);
const VALID_DIFICULTADES = new Set(['FACIL', 'MEDIA', 'DIFICIL']);

function validateRespuesta(
  r: unknown,
  path: string,
  errors: JsonValidationError[],
): r is RespuestaInput {
  if (typeof r !== 'object' || r === null || Array.isArray(r)) {
    errors.push({ path, message: 'Debe ser un objeto' });
    return false;
  }

  const obj = r as Record<string, unknown>;
  let ok = true;

  // Campos desconocidos
  for (const key of Object.keys(obj)) {
    if (!ALLOWED_RESPUESTA_KEYS.has(key)) {
      errors.push({ path: `${path}.${key}`, message: `Campo no permitido. Campos válidos: texto, es_correcta` });
      ok = false;
    }
  }

  // texto
  if (!('texto' in obj)) {
    errors.push({ path: `${path}.texto`, message: 'Campo requerido ausente' });
    ok = false;
  } else if (typeof obj.texto !== 'string') {
    errors.push({ path: `${path}.texto`, message: `Debe ser string, se recibió ${typeof obj.texto}` });
    ok = false;
  } else if ((obj.texto as string).trim() === '') {
    errors.push({ path: `${path}.texto`, message: 'No puede estar vacío' });
    ok = false;
  }

  // es_correcta
  if (!('es_correcta' in obj)) {
    errors.push({ path: `${path}.es_correcta`, message: 'Campo requerido ausente' });
    ok = false;
  } else if (typeof obj.es_correcta !== 'boolean') {
    errors.push({ path: `${path}.es_correcta`, message: `Debe ser boolean (true/false), se recibió ${typeof obj.es_correcta}` });
    ok = false;
  }

  return ok;
}

function validatePregunta(
  p: unknown,
  path: string,
  errors: JsonValidationError[],
): p is PreguntaInput {
  if (typeof p !== 'object' || p === null || Array.isArray(p)) {
    errors.push({ path, message: 'Debe ser un objeto' });
    return false;
  }

  const obj = p as Record<string, unknown>;
  let ok = true;

  // Campos desconocidos
  for (const key of Object.keys(obj)) {
    if (!ALLOWED_ROOT_KEYS.has(key)) {
      errors.push({ path: `${path}.${key}`, message: `Campo no permitido. Campos válidos: ${[...ALLOWED_ROOT_KEYS].join(', ')}` });
      ok = false;
    }
  }

  // Campos requeridos ausentes
  for (const key of REQUIRED_ROOT_KEYS) {
    if (!(key in obj)) {
      errors.push({ path: `${path}.${key}`, message: 'Campo requerido ausente' });
      ok = false;
    }
  }

  // enunciado
  if ('enunciado' in obj) {
    if (typeof obj.enunciado !== 'string') {
      errors.push({ path: `${path}.enunciado`, message: `Debe ser string, se recibió ${typeof obj.enunciado}` });
      ok = false;
    } else if ((obj.enunciado as string).trim() === '') {
      errors.push({ path: `${path}.enunciado`, message: 'No puede estar vacío' });
      ok = false;
    }
  }

  // es_multiple
  if ('es_multiple' in obj) {
    if (typeof obj.es_multiple !== 'boolean') {
      errors.push({ path: `${path}.es_multiple`, message: `Debe ser boolean (true/false), se recibió ${typeof obj.es_multiple}` });
      ok = false;
    }
  }

  // dificultad (opcional)
  if ('dificultad' in obj && obj.dificultad !== null && obj.dificultad !== undefined) {
    if (typeof obj.dificultad !== 'string') {
      errors.push({ path: `${path}.dificultad`, message: `Debe ser string, se recibió ${typeof obj.dificultad}` });
      ok = false;
    } else if (!VALID_DIFICULTADES.has(obj.dificultad as string)) {
      errors.push({ path: `${path}.dificultad`, message: `Valor no válido "${obj.dificultad}". Valores permitidos: FACIL, MEDIA, DIFICIL` });
      ok = false;
    }
  }

  // categoria (opcional)
  if ('categoria' in obj && obj.categoria !== null && obj.categoria !== undefined) {
    if (typeof obj.categoria !== 'string') {
      errors.push({ path: `${path}.categoria`, message: `Debe ser string, se recibió ${typeof obj.categoria}` });
      ok = false;
    }
  }

  // respuestas
  if ('respuestas' in obj) {
    if (!Array.isArray(obj.respuestas)) {
      errors.push({ path: `${path}.respuestas`, message: `Debe ser un array, se recibió ${typeof obj.respuestas}` });
      ok = false;
    } else {
      const respuestas = obj.respuestas as unknown[];
      if (respuestas.length < 2) {
        errors.push({ path: `${path}.respuestas`, message: `Debe contener al menos 2 respuestas, se encontraron ${respuestas.length}` });
        ok = false;
      }

      let allRespOk = true;
      for (let i = 0; i < respuestas.length; i++) {
        const respOk = validateRespuesta(respuestas[i], `${path}.respuestas[${i}]`, errors);
        if (!respOk) allRespOk = false;
      }

      // Validar lógica de respuestas correctas (solo si respuestas individuales son válidas)
      if (allRespOk && 'es_multiple' in obj) {
        const correctas = (respuestas as RespuestaInput[]).filter((r) => r.es_correcta);
        if (correctas.length === 0) {
          errors.push({ path: `${path}.respuestas`, message: 'Al menos una respuesta debe tener es_correcta: true' });
          ok = false;
        }
        if (!obj.es_multiple && correctas.length > 1) {
          errors.push({ path: `${path}.respuestas`, message: `es_multiple es false pero hay ${correctas.length} respuestas correctas. Solo puede haber 1` });
          ok = false;
        }
      }
    }
  }

  return ok;
}

export function validatePreguntasJson(raw: string): JsonValidationResult {
  const errors: JsonValidationError[] = [];

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      valid: false,
      errors: [{ path: 'raíz', message: `JSON malformado: ${(e as SyntaxError).message}` }],
    };
  }

  // Aceptar tanto array como objeto único
  let items: unknown[];
  if (Array.isArray(parsed)) {
    items = parsed;
    if (items.length === 0) {
      return { valid: false, errors: [{ path: 'raíz', message: 'El array no puede estar vacío' }] };
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    items = [parsed];
  } else {
    return {
      valid: false,
      errors: [{ path: 'raíz', message: `Se esperaba un objeto o array de preguntas, se recibió ${typeof parsed}` }],
    };
  }

  for (let i = 0; i < items.length; i++) {
    const path = items.length === 1 ? 'pregunta' : `preguntas[${i}]`;
    validatePregunta(items[i], path, errors);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], preguntas: items as PreguntaInput[] };
}
