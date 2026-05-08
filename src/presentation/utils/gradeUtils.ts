/** Tabla de umbrales de nota con estrellas, color y etiqueta asociados. */
const GRADE_THRESHOLDS = [
  { min: 9, stars: 3, color: '#10B981', label: 'Excelente' },
  { min: 7, stars: 2, color: '#10B981', label: 'Muy bien' },
  { min: 5, stars: 1, color: '#F59E0B', label: 'Aprobado' },
  { min: 0, stars: 0, color: '#EF4444', label: 'Suspenso' },
] as const;

/**
 * Busca el umbral de calificación que corresponde a la nota dada.
 *
 * @param nota - Nota numérica (0-10).
 * @returns El umbral de calificación correspondiente.
 */
function findThreshold(nota: number) {
  const found = GRADE_THRESHOLDS.find((t) => nota >= t.min);
  return found ?? GRADE_THRESHOLDS.at(-1)!;
}

/**
 * Devuelve el número de estrellas (0-3) correspondiente a una nota.
 *
 * @param nota - Nota numérica (0-10).
 * @returns Número de estrellas: 3 (≥9), 2 (≥7), 1 (≥5) o 0 (suspenso).
 */
export function getStars(nota: number): number {
  return findThreshold(nota).stars;
}

/**
 * Devuelve el color hexadecimal asociado a una nota.
 *
 * @param nota - Nota numérica (0-10).
 * @returns Color hexadecimal: verde (aprobado alto), naranja (aprobado) o rojo (suspenso).
 */
export function getNotaColor(nota: number): string {
  return findThreshold(nota).color;
}

/**
 * Devuelve la etiqueta textual de calificación correspondiente a una nota.
 *
 * @param nota - Nota numérica (0-10).
 * @returns Etiqueta: 'Excelente', 'Muy bien', 'Aprobado' o 'Suspenso'.
 */
export function getGradeLabel(nota: number): string {
  return findThreshold(nota).label;
}
