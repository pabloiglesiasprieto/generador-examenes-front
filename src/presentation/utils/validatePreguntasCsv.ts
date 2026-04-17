import { JsonValidationError } from './validatePreguntasJson';

export interface CsvValidationResult {
  valid: boolean;
  errors: JsonValidationError[];
}

const VALID_DIFICULTADES = new Set(['FACIL', 'MEDIA', 'DIFICIL', '']);

function parseCsvRow(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  cols.push(current);
  return cols;
}

export function validatePreguntasCsv(raw: string): CsvValidationResult {
  const errors: JsonValidationError[] = [];
  const lines = raw.split(/\r?\n/);

  if (lines.length < 2) {
    return { valid: false, errors: [{ path: 'CSV', message: 'El CSV debe tener al menos una cabecera y una fila de datos.' }] };
  }

  // Saltar cabecera (línea 0), validar desde línea 1
  let dataRows = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    dataRows++;
    const rowLabel = `Fila ${i + 1}`;
    const cols = parseCsvRow(line);

    if (cols.length < 6) {
      errors.push({ path: rowLabel, message: 'Se requieren al menos 6 columnas: enunciado, es_multiple, dificultad, categoria, respuesta_1, correcta_1.' });
      continue;
    }

    const enunciado = cols[0].trim();
    if (!enunciado) {
      errors.push({ path: `${rowLabel}.enunciado`, message: 'El enunciado no puede estar vacío.' });
    }

    const esMultipleRaw = cols[1].trim().toLowerCase();
    if (esMultipleRaw !== 'true' && esMultipleRaw !== 'false') {
      errors.push({ path: `${rowLabel}.es_multiple`, message: `Debe ser 'true' o 'false', se recibió '${cols[1].trim()}'.` });
    }
    const esMultiple = esMultipleRaw === 'true';

    const dificultad = cols[2].trim().toUpperCase();
    if (!VALID_DIFICULTADES.has(dificultad)) {
      errors.push({ path: `${rowLabel}.dificultad`, message: `Valor no válido '${cols[2].trim()}'. Valores permitidos: FACIL, MEDIA, DIFICIL (o vacío).` });
    }

    // Parsear respuestas (pares desde columna índice 4)
    const respuestas: { texto: string; esCorrecta: boolean }[] = [];
    for (let j = 4; j + 1 < cols.length; j += 2) {
      const texto = cols[j].trim();
      if (!texto) continue;
      const correctaRaw = cols[j + 1].trim().toLowerCase();
      if (correctaRaw !== 'true' && correctaRaw !== 'false') {
        const idx = (j - 4) / 2 + 1;
        errors.push({ path: `${rowLabel}.correcta_${idx}`, message: `Debe ser 'true' o 'false', se recibió '${cols[j + 1].trim()}'.` });
        continue;
      }
      respuestas.push({ texto, esCorrecta: correctaRaw === 'true' });
    }

    if (respuestas.length === 0) {
      errors.push({ path: `${rowLabel}.respuestas`, message: 'La pregunta no tiene respuestas válidas.' });
      continue;
    }

    const correctas = respuestas.filter((r) => r.esCorrecta);
    if (correctas.length === 0) {
      errors.push({ path: `${rowLabel}.respuestas`, message: 'Al menos una respuesta debe ser correcta (true).' });
    }
    if (!esMultiple && correctas.length > 1) {
      errors.push({ path: `${rowLabel}.respuestas`, message: `es_multiple es false pero hay ${correctas.length} respuestas correctas. Solo puede haber 1.` });
    }
  }

  if (dataRows === 0) {
    return { valid: false, errors: [{ path: 'CSV', message: 'El CSV no contiene filas de datos.' }] };
  }

  return { valid: errors.length === 0, errors };
}
