import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetAllPreguntasUseCase,
  IGetPreguntaByIdUseCase,
  ICreatePreguntaUseCase,
  IUpdatePreguntaUseCase,
  IDeletePreguntaUseCase,
} from '../../domain/interfaces/useCases/preguntas/IPreguntaUseCase';
import { PreguntaDTO, PreguntaInput, RespuestaInput } from '../../domain/entities/Pregunta';

const DEFAULT_RESPUESTAS: RespuestaInput[] = [
  { texto: '', es_correcta: false },
  { texto: '', es_correcta: false },
];

function extractApiError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

function validatePreguntaForm(
  enunciado: string,
  respuestas: RespuestaInput[],
): string | null {
  if (!enunciado.trim()) return 'El enunciado no puede estar vacío';
  const valid = respuestas.filter((r) => r.texto.trim());
  if (valid.length < 1) return 'Añade al menos una respuesta';
  if (!valid.some((r) => r.es_correcta)) return 'Marca al menos una respuesta como correcta';
  return null;
}

export function useQuestionsScreen() {
  const [preguntas, setPreguntas] = useState<PreguntaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<PreguntaDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PreguntaDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [enunciado, setEnunciado] = useState('');
  const [esMultiple, setEsMultiple] = useState(false);
  const [respuestas, setRespuestas] = useState<RespuestaInput[]>(DEFAULT_RESPUESTAS);

  const getAllPreguntasUseCase = container.get<IGetAllPreguntasUseCase>(TYPES.IGetAllPreguntasUseCase);
  const getPreguntaByIdUseCase = container.get<IGetPreguntaByIdUseCase>(TYPES.IGetPreguntaByIdUseCase);
  const createPreguntaUseCase = container.get<ICreatePreguntaUseCase>(TYPES.ICreatePreguntaUseCase);
  const updatePreguntaUseCase = container.get<IUpdatePreguntaUseCase>(TYPES.IUpdatePreguntaUseCase);
  const deletePreguntaUseCase = container.get<IDeletePreguntaUseCase>(TYPES.IDeletePreguntaUseCase);

  const loadPreguntas = useCallback(async () => {
    try {
      const data = await getAllPreguntasUseCase.execute();
      setPreguntas(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las preguntas');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPreguntas();
    }, [loadPreguntas]),
  );

  const openCreate = () => {
    setEditing(null);
    setEnunciado('');
    setEsMultiple(false);
    setRespuestas([...DEFAULT_RESPUESTAS]);
    setModalVisible(true);
  };

  const openEdit = async (p: PreguntaDTO) => {
    const full = await getPreguntaByIdUseCase.execute(p.id);
    setEditing(full);
    setEnunciado(full.enunciado);
    setEsMultiple(full.es_multiple);
    setRespuestas(
      full.respuestas.map((r) => ({
        texto: r.texto,
        es_correcta:
          full.respuestas_correctas?.includes(r.respuesta_id ?? r.id ?? -1) ??
          r.es_correcta ??
          false,
      })),
    );
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const addRespuesta = () =>
    setRespuestas((prev) => [...prev, { texto: '', es_correcta: false }]);

  const removeRespuesta = (i: number) =>
    setRespuestas((prev) => prev.filter((_, idx) => idx !== i));

  const updateRespuesta = (i: number, field: keyof RespuestaInput, value: string | boolean) =>
    setRespuestas((prev) => {
      if (field === 'es_correcta' && value === true && !esMultiple) {
        return prev.map((r, idx) => ({ ...r, es_correcta: idx === i }));
      }
      return prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    });

  const handleSave = async () => {
    const validationError = validatePreguntaForm(enunciado, respuestas);
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }

    const data: PreguntaInput = {
      enunciado: enunciado.trim(),
      es_multiple: esMultiple,
      respuestas: respuestas.filter((r) => r.texto.trim()),
    };

    setSaving(true);
    try {
      if (editing) {
        await updatePreguntaUseCase.execute(editing.id, data);
      } else {
        await createPreguntaUseCase.execute(data);
      }
      setModalVisible(false);
      await loadPreguntas();
    } catch (err: unknown) {
      Alert.alert('Error', extractApiError(err, 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (p: PreguntaDTO) => {
    setDeleteTarget(p);
    setDeleteError(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePreguntaUseCase.execute(deleteTarget.id);
      setDeleteTarget(null);
      await loadPreguntas();
    } catch (err: unknown) {
      setDeleteError(extractApiError(err, 'No se pudo eliminar la pregunta'));
    } finally {
      setDeleting(false);
    }
  };

  return {
    preguntas,
    loading,
    modalVisible,
    editing,
    saving,
    deleteTarget,
    deleting,
    deleteError,
    enunciado,
    esMultiple,
    respuestas,
    setEnunciado,
    setEsMultiple,
    openCreate,
    openEdit,
    closeModal,
    addRespuesta,
    removeRespuesta,
    updateRespuesta,
    handleSave,
    handleDelete,
    cancelDelete,
    confirmDelete,
  };
}
