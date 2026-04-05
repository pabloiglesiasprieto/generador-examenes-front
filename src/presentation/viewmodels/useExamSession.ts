import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IEvaluarExamenUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ExamenDTO, RespuestaAlumnoDTO } from '../../domain/entities/Examen';

function buildInitialAnswers(examen: ExamenDTO, isReadOnly: boolean): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  if (!isReadOnly) return map;

  examen.preguntas?.forEach((p, pIdx) => {
    const correctIds = new Set(p.respuestas_correctas ?? []);
    const selected = new Set<number>();
    p.respuestas.forEach((r, rIdx) => {
      if (correctIds.has(r.id)) selected.add(rIdx);
    });
    map.set(pIdx, selected);
  });
  return map;
}

function buildRespuestasDTO(examen: ExamenDTO, answers: Map<number, Set<number>>): RespuestaAlumnoDTO[] {
  return (examen.preguntas ?? []).map((p, pIdx) => {
    const selectedIndices = answers.get(pIdx) ?? new Set<number>();
    const respuesta_ids = Array.from(selectedIndices)
      .map((rIdx) => p.respuestas[rIdx]?.id)
      .filter((id): id is number => id != null);
    return { pregunta_id: p.id, respuesta_ids };
  });
}

function extractErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Error al enviar el examen'
  );
}

export function useExamSession(examen: ExamenDTO) {
  const preguntas = examen.preguntas ?? [];
  const isReadOnly = preguntas.length > 0 && preguntas[0].respuestas_correctas != null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Set<number>>>(() =>
    buildInitialAnswers(examen, isReadOnly),
  );
  const [submitting, setSubmitting] = useState(false);

  const evaluarExamenUseCase = container.get<IEvaluarExamenUseCase>(TYPES.IEvaluarExamenUseCase);

  const currentPregunta = preguntas[currentIndex];
  const totalPreguntas = preguntas.length;
  const progress = (currentIndex + 1) / totalPreguntas;
  const isLast = currentIndex === totalPreguntas - 1;
  const currentSelected = answers.get(currentIndex) ?? new Set<number>();
  const hasAnswered = currentSelected.size > 0;

  const toggleAnswer = (respIndex: number) => {
    if (!currentPregunta || isReadOnly) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      const selected = new Set(next.get(currentIndex) ?? []);
      if (currentPregunta.es_multiple) {
        if (selected.has(respIndex)) selected.delete(respIndex);
        else selected.add(respIndex);
      } else {
        selected.clear();
        selected.add(respIndex);
      }
      next.set(currentIndex, selected);
      return next;
    });
  };

  const goNext = () => {
    if (!isReadOnly && !hasAnswered) {
      Alert.alert('Atención', 'Selecciona al menos una respuesta');
      return;
    }
    if (currentIndex < totalPreguntas - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const submitAnswers = async (onSuccess: (resultado: unknown, examenId: number) => void) => {
    setSubmitting(true);
    try {
      const respuestas = buildRespuestasDTO(examen, answers);
      const resultado = await evaluarExamenUseCase.execute(examen.id, respuestas);
      onSuccess(resultado, examen.id);
    } catch (err: unknown) {
      Alert.alert('Error', extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSubmit = (onSuccess: (resultado: unknown, examenId: number) => void) => {
    if (!hasAnswered) {
      Alert.alert('Atención', 'Selecciona al menos una respuesta');
      return;
    }
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de enviar tus respuestas?')) submitAnswers(onSuccess);
    } else {
      Alert.alert('Enviar examen', '¿Estás seguro de enviar tus respuestas?', [
        { text: 'Revisar', style: 'cancel' },
        { text: 'Enviar', onPress: () => submitAnswers(onSuccess) },
      ]);
    }
  };

  return {
    currentPregunta,
    totalPreguntas,
    currentIndex,
    progress,
    isLast,
    isReadOnly,
    currentSelected,
    hasAnswered,
    submitting,
    toggleAnswer,
    goNext,
    confirmSubmit,
  };
}
