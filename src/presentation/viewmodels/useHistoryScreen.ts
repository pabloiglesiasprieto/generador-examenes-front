import { useEffect, useState } from 'react';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetResultadosAlumnoUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ResultadoDTO } from '../../domain/entities/Examen';

export function useHistoryScreen(userId: number | undefined) {
  const [resultados, setResultados] = useState<ResultadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroExamen, setFiltroExamen] = useState<number | null>(null);
  const [selectedResultado, setSelectedResultado] = useState<ResultadoDTO | null>(null);

  const getResultadosAlumnoUseCase = container.get<IGetResultadosAlumnoUseCase>(
    TYPES.IGetResultadosAlumnoUseCase,
  );

  useEffect(() => {
    if (!userId) return;
    getResultadosAlumnoUseCase
      .execute(userId)
      .then(setResultados)
      .catch(() => setResultados([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const openDetalle = (resultado: ResultadoDTO) => {
    setSelectedResultado(resultado);
  };

  const closeDetalle = () => {
    setSelectedResultado(null);
  };

  const resultadosFiltrados =
    filtroExamen === null
      ? resultados
      : resultados.filter((r) => r.examen_id === filtroExamen);

  const examenesIds = [...new Set(resultados.map((r) => r.examen_id))].sort((a, b) => a - b);

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
