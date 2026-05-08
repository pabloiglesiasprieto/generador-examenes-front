import { useState, useEffect, useRef } from 'react';
import { useAlert } from './AlertContext';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IEvaluarExamenUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ExamenDTO, RespuestaAlumnoDTO } from '../../domain/entities/Examen';

/** Duración en segundos del temporizador fijo para alumnos (2 minutos). */
const ALUMNO_TIMER_SECONDS = 120; // 2 minutos fijos para alumnos

/**
 * Construye la lista de respuestas del alumno en el formato requerido por la API.
 *
 * @param examen - Datos del examen con las preguntas y sus respuestas.
 * @param answers - Mapa de índice de pregunta a conjunto de índices de respuestas seleccionadas.
 * @returns Lista de DTOs de respuestas del alumno listos para enviar a la API.
 */
function buildRespuestasDTO(examen: ExamenDTO, answers: Map<number, Set<number>>): RespuestaAlumnoDTO[] {
  return (examen.preguntas ?? []).map((p, pIdx) => {
    const selectedIndices = answers.get(pIdx) ?? new Set<number>();
    const respuesta_ids = Array.from(selectedIndices)
      .map((rIdx) => p.respuestas[rIdx]?.id)
      .filter((id): id is number => id != null);
    return { pregunta_id: p.id, respuesta_ids };
  });
}

/**
 * Extrae el mensaje de error de una respuesta de la API o devuelve un mensaje genérico.
 *
 * @param err - Error capturado al evaluar el examen.
 * @returns Mensaje de error legible para el usuario.
 */
function extractErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    'Error al enviar el examen'
  );
}

/**
 * ViewModel de la sesión de examen.
 * Gestiona la navegación entre preguntas, la selección de respuestas, el temporizador
 * de cuenta regresiva (solo para alumnos) y el envío de las respuestas al backend.
 *
 * @param examen - Datos del examen a realizar, incluyendo las preguntas y sus respuestas.
 * @param isAdminMode - Si es true, el examen se muestra en modo lectura (sin temporizador ni envío).
 * @precondition El examen debe contener al menos una pregunta.
 * @returns Objeto con el estado de la sesión y los handlers:
 *   - `currentPregunta`: pregunta que se está mostrando actualmente.
 *   - `totalPreguntas`: número total de preguntas del examen.
 *   - `currentIndex`: índice de la pregunta actual.
 *   - `progress`: fracción de progreso (0-1).
 *   - `isLast`: indica si es la última pregunta.
 *   - `isReadOnly`: indica si el examen está en modo solo lectura.
 *   - `currentSelected`: conjunto de índices de respuestas seleccionadas en la pregunta actual.
 *   - `hasAnswered`: indica si la pregunta actual tiene al menos una respuesta seleccionada.
 *   - `submitting`: indica si se está enviando el examen.
 *   - `timeRemaining`: segundos restantes del temporizador, o null en modo admin.
 *   - `isExpired`: indica si el temporizador ha llegado a cero.
 *   - `toggleAnswer`: selecciona o deselecciona una respuesta por su índice.
 *   - `goNext`: avanza a la siguiente pregunta.
 *   - `submitAnswers`: envía las respuestas e invoca el callback con el resultado.
 */
export function useExamSession(examen: ExamenDTO, isAdminMode = false) {
  const { showAlert } = useAlert();
  const preguntas = examen.preguntas ?? [];
  // Admin siempre en modo solo lectura; alumno en modo interactivo
  const isReadOnly = isAdminMode;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Set<number>>>(() => new Map());
  const [submitting, setSubmitting] = useState(false);
  // Admin no tiene timer; alumno tiene 2 minutos fijos
  const [timeRemaining, setTimeRemaining] = useState<number | null>(() =>
    isAdminMode ? null : ALUMNO_TIMER_SECONDS,
  );
  const [isExpired, setIsExpired] = useState(false);
  const autoSubmitRef = useRef<((cb: (resultado: unknown, examenId: number) => void) => void) | null>(null);

  const evaluarExamenUseCase = container.get<IEvaluarExamenUseCase>(TYPES.IEvaluarExamenUseCase);

  // Countdown timer (solo para alumnos)
  useEffect(() => {
    if (timeRemaining === null || isReadOnly) return;
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev == null || prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, isReadOnly]);

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
      showAlert('Atención', 'Selecciona al menos una respuesta');
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
      showAlert('Error', extractErrorMessage(err));
    } finally {
      setSubmitting(false);
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
    timeRemaining,
    isExpired,
    toggleAnswer,
    goNext,
    submitAnswers,
  };
}
