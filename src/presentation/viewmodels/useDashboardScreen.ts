import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetEstadisticasExamenesUseCase,
  IGetRankingAlumnosUseCase,
  IGetEstadisticasPreguntasUseCase,
} from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { EstadisticaAlumnoDTO, EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../domain/entities/Estadistica';

/** Alias de tipo para los elementos del ranking de alumnos. */
export type AlumnoRankingItem = EstadisticaAlumnoDTO;

/**
 * ViewModel del panel de estadísticas (Dashboard).
 * Carga automáticamente al recibir el foco las estadísticas de exámenes, el ranking de alumnos
 * y las estadísticas de preguntas más falladas llamando a los casos de uso correspondientes.
 *
 * @precondition El usuario debe tener rol ADMIN o PROFESOR.
 * @returns Objeto con los datos del dashboard y funciones de control:
 *   - `estadisticasExamenes`: estadísticas agregadas de cada examen.
 *   - `rankingAlumnos`: ranking de alumnos ordenado por nota media.
 *   - `estadisticasPreguntas`: preguntas ordenadas por tasa de fallo descendente.
 *   - `loading`: indicador de carga.
 *   - `error`: mensaje de error o null.
 *   - `reload`: función para recargar los datos manualmente.
 */
export function useDashboardScreen() {
  const [estadisticasExamenes, setEstadisticasExamenes] = useState<EstadisticaExamenDTO[]>([]);
  const [rankingAlumnos, setRankingAlumnos] = useState<AlumnoRankingItem[]>([]);
  const [estadisticasPreguntas, setEstadisticasPreguntas] = useState<EstadisticaPreguntaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEstadisticasUseCase = container.get<IGetEstadisticasExamenesUseCase>(TYPES.IGetEstadisticasExamenesUseCase);
  const getRankingUseCase = container.get<IGetRankingAlumnosUseCase>(TYPES.IGetRankingAlumnosUseCase);
  const getEstadisticasPreguntasUseCase = container.get<IGetEstadisticasPreguntasUseCase>(TYPES.IGetEstadisticasPreguntasUseCase);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [examenes, ranking, preguntas] = await Promise.all([
        getEstadisticasUseCase.execute(),
        getRankingUseCase.execute(),
        getEstadisticasPreguntasUseCase.execute(),
      ]);
setEstadisticasExamenes(examenes);
      setRankingAlumnos(ranking);
      setEstadisticasPreguntas(preguntas);
    } catch (err) {
      console.error('[Dashboard] Error cargando estadísticas:', err);
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return {
    estadisticasExamenes,
    rankingAlumnos,
    estadisticasPreguntas,
    loading,
    error,
    reload: loadData,
  };
}
