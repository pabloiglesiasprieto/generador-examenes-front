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

export function useDashboardScreen() {
  const [estadisticasExamenes, setEstadisticasExamenes] = useState<EstadisticaExamenDTO[]>([]);
  const [rankingAlumnos, setRankingAlumnos] = useState<EstadisticaAlumnoDTO[]>([]);
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
    } catch {
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
