import { useCallback, useEffect, useMemo, useState } from 'react';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetResultadosAlumnoUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ResultadoDTO } from '../../domain/entities/Examen';

/**
 * ViewModel de la pantalla de historial de exámenes del alumno.
 * Carga los resultados del alumno al montarse y calcula estadísticas derivadas.
 * Permite filtrar por examen concreto y abrir el detalle de un intento.
 *
 * @param userId - Identificador del alumno autenticado, o undefined si no está disponible.
 * @precondition El usuario debe estar autenticado y tener rol ALUMNO.
 * @returns Objeto con el estado y los handlers:
 *   - `loading`: indicador de carga inicial.
 *   - `resultadosFiltrados`: resultados filtrados según el examen seleccionado.
 *   - `examenesIds`: lista de IDs únicos de exámenes con al menos un intento.
 *   - `filtroExamen`: ID del examen filtrado actualmente, o null para ver todos.
 *   - `setFiltroExamen`: setter del filtro de examen.
 *   - `selectedResultado`: resultado seleccionado para ver el detalle, o null.
 *   - `openDetalle`, `closeDetalle`: abrir y cerrar el detalle de un intento.
 *   - `avg`: nota media de los resultados filtrados.
 *   - `best`: mejor nota de los resultados filtrados.
 *   - `totalEstrellas`: suma de estrellas obtenidas en los resultados filtrados.
 */
export function useHistoryScreen(userId: number | undefined) {
  const [resultados, setResultados] = useState<ResultadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroExamen, setFiltroExamen] = useState<number | null>(null);
  const [selectedResultado, setSelectedResultado] = useState<ResultadoDTO | null>(null);

  const getResultadosAlumnoUseCase = useMemo(() => container.get<IGetResultadosAlumnoUseCase>(TYPES.IGetResultadosAlumnoUseCase), []);

  useEffect(() => {
    if (!userId) return;
    getResultadosAlumnoUseCase
      .execute(userId)
      .then(setResultados)
      .catch(() => setResultados([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const openDetalle = useCallback((resultado: ResultadoDTO) => {
    setSelectedResultado(resultado);
  }, []);

  const closeDetalle = useCallback(() => {
    setSelectedResultado(null);
  }, []);

  const resultadosFiltrados =
    filtroExamen === null
      ? resultados
      : resultados.filter((r) => r.examen_id === filtroExamen);

  const examenesIds = Array.from(new Set(resultados.map((r) => r.examen_id))).sort((a, b) => a - b);

  const avg =
    resultadosFiltrados.length > 0
      ? resultadosFiltrados.reduce((a, r) => a + r.nota, 0) / resultadosFiltrados.length
      : 0;

  const best =
    resultadosFiltrados.length > 0 ? Math.max(...resultadosFiltrados.map((r) => r.nota)) : 0;

  const totalEstrellas = resultadosFiltrados.reduce((a, r) => {
    if (r.nota >= 9) return a + 3;
    if (r.nota >= 7) return a + 2;
    if (r.nota >= 5) return a + 1;
    return a;
  }, 0);

  return {
    loading,
    resultadosFiltrados,
    examenesIds,
    filtroExamen,
    setFiltroExamen,
    selectedResultado,
    openDetalle,
    closeDetalle,
    avg,
    best,
    totalEstrellas,
  };
}
