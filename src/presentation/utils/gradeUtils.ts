const GRADE_THRESHOLDS = [
  { min: 9, stars: 3, color: '#10B981', label: 'Excelente' },
  { min: 7, stars: 2, color: '#10B981', label: 'Muy bien' },
  { min: 5, stars: 1, color: '#F59E0B', label: 'Aprobado' },
  { min: 0, stars: 0, color: '#EF4444', label: 'Suspenso' },
] as const;

function findThreshold(nota: number) {
  const found = GRADE_THRESHOLDS.find((t) => nota >= t.min);
  return found ?? GRADE_THRESHOLDS.at(-1)!;
}

export function getStars(nota: number): number {
  return findThreshold(nota).stars;
}

export function getNotaColor(nota: number): string {
  return findThreshold(nota).color;
}

export function getGradeLabel(nota: number): string {
  return findThreshold(nota).label;
}
