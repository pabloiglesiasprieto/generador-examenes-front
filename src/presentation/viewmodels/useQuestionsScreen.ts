import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PageResponse } from '../../domain/entities/Page';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetAllPreguntasUseCase,
  IGetPreguntaByIdUseCase,
  ICreatePreguntaUseCase,
  IUpdatePreguntaUseCase,
  IDeletePreguntaUseCase,
  IImportarCsvPreguntasUseCase,
} from '../../domain/interfaces/useCases/preguntas/IPreguntaUseCase';
import { PreguntaDTO, PreguntaInput, RespuestaInput } from '../../domain/entities/Pregunta';
import { validatePreguntasJson, JsonValidationError } from '../utils/validatePreguntasJson';
import { validatePreguntasCsv } from '../utils/validatePreguntasCsv';

let _keyCounter = 0;
const nextKey = () => ++_keyCounter;

const DEFAULT_RESPUESTAS: RespuestaInput[] = [
  { _key: nextKey(), texto: '', es_correcta: false },
  { _key: nextKey(), texto: '', es_correcta: false },
];

const PAGE_SIZE = 20;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPageRef = useRef(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<PreguntaDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PreguntaDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [enunciado, setEnunciado] = useState('');
  const [esMultiple, setEsMultiple] = useState(false);
  const [respuestas, setRespuestas] = useState<RespuestaInput[]>(DEFAULT_RESPUESTAS);
  const [dificultad, setDificultad] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [filterDificultad, setFilterDificultad] = useState<string>('');
  const [filterCategoria, setFilterCategoria] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonErrors, setJsonErrors] = useState<JsonValidationError[]>([]);
  const [jsonImporting, setJsonImporting] = useState(false);
  const [csvInput, setCsvInput] = useState<string>('');
  const [csvErrors, setCsvErrors] = useState<JsonValidationError[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'csv'>('form');

  const getAllPreguntasUseCase = container.get<IGetAllPreguntasUseCase>(TYPES.IGetAllPreguntasUseCase);
  const getPreguntaByIdUseCase = container.get<IGetPreguntaByIdUseCase>(TYPES.IGetPreguntaByIdUseCase);
  const createPreguntaUseCase = container.get<ICreatePreguntaUseCase>(TYPES.ICreatePreguntaUseCase);
  const updatePreguntaUseCase = container.get<IUpdatePreguntaUseCase>(TYPES.IUpdatePreguntaUseCase);
  const deletePreguntaUseCase = container.get<IDeletePreguntaUseCase>(TYPES.IDeletePreguntaUseCase);
  const importarCsvUseCase = container.get<IImportarCsvPreguntasUseCase>(TYPES.IImportarCsvPreguntasUseCase);

  const loadPreguntas = useCallback(async () => {
    currentPageRef.current = 0;
    setHasMore(true);
    try {
      const result = await getAllPreguntasUseCase.execute('id', 'asc', 0, PAGE_SIZE);
      if (result && typeof result === 'object' && 'content' in result) {
        const paged = result as PageResponse<PreguntaDTO>;
        setPreguntas(paged.content);
        setHasMore(!paged.last);
      } else {
        setPreguntas(result as PreguntaDTO[]);
        setHasMore(false);
      }
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las preguntas');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = currentPageRef.current + 1;
    try {
      const result = await getAllPreguntasUseCase.execute('id', 'asc', nextPage, PAGE_SIZE);
      if (result && typeof result === 'object' && 'content' in result) {
        const paged = result as PageResponse<PreguntaDTO>;
        setPreguntas((prev) => [...prev, ...paged.content]);
        setHasMore(!paged.last);
        currentPageRef.current = nextPage;
      }
    } catch {
      // No mostrar error en loadMore para no interrumpir la UX
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPreguntas();
    }, [loadPreguntas]),
  );

  const resetJsonTab = () => {
    setJsonInput('');
    setJsonErrors([]);
  };

  const resetCsvTab = () => {
    setCsvInput('');
    setCsvErrors([]);
  };

  const openCreate = () => {
    setEditing(null);
    setEnunciado('');
    setEsMultiple(false);
    setRespuestas([
      { _key: nextKey(), texto: '', es_correcta: false },
      { _key: nextKey(), texto: '', es_correcta: false },
    ]);
    setDificultad('');
    setCategoria('');
    resetJsonTab();
    resetCsvTab();
    setActiveTab('form');
    setModalVisible(true);
  };

  const openEdit = async (p: PreguntaDTO) => {
    const full = await getPreguntaByIdUseCase.execute(p.id);
    setEditing(full);
    setEnunciado(full.enunciado);
    setEsMultiple(full.es_multiple);
    setDificultad(full.dificultad ?? '');
    setCategoria(full.categoria ?? '');
    setRespuestas(
      full.respuestas.map((r) => ({
        _key: nextKey(),
        texto: r.texto,
        es_correcta:
          full.respuestas_correctas?.includes(r.respuesta_id ?? r.id ?? -1) ??
          r.es_correcta ??
          false,
      })),
    );
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetJsonTab();
    resetCsvTab();
    setActiveTab('form');
  };

  const addRespuesta = () =>
    setRespuestas((prev) => [...prev, { _key: nextKey(), texto: '', es_correcta: false }]);

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
      respuestas: respuestas.filter((r) => r.texto.trim()).map(({ _key: _, ...r }) => r),
      dificultad: dificultad || undefined,
      categoria: categoria.trim() || undefined,
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

  const handleJsonImport = async () => {
    const result = validatePreguntasJson(jsonInput);
    if (!result.valid) {
      setJsonErrors(result.errors);
      return;
    }
    setJsonErrors([]);
    setJsonImporting(true);
    try {
      for (const pregunta of result.preguntas!) {
        await createPreguntaUseCase.execute(pregunta);
      }
      setModalVisible(false);
      resetJsonTab();
      setActiveTab('form');
      await loadPreguntas();
    } catch (err: unknown) {
      setJsonErrors([{ path: 'API', message: extractApiError(err, 'Error al importar las preguntas') }]);
    } finally {
      setJsonImporting(false);
    }
  };

  const handleCsvImport = async () => {
    const result = validatePreguntasCsv(csvInput);
    if (!result.valid) {
      setCsvErrors(result.errors);
      return;
    }
    setCsvErrors([]);
    setCsvImporting(true);
    try {
      await importarCsvUseCase.execute(csvInput);
      setModalVisible(false);
      resetCsvTab();
      setActiveTab('form');
      await loadPreguntas();
    } catch (err: unknown) {
      setCsvErrors([{ path: 'API', message: extractApiError(err, 'Error al importar el CSV') }]);
    } finally {
      setCsvImporting(false);
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

  const preguntasFiltradas = preguntas.filter((p) => {
    if (filterDificultad && p.dificultad !== filterDificultad) return false;
    if (filterCategoria && !(p.categoria ?? '').toLowerCase().includes(filterCategoria.toLowerCase())) return false;
    return true;
  });

  return {
    preguntas: preguntasFiltradas,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    modalVisible,
    editing,
    saving,
    deleteTarget,
    deleting,
    deleteError,
    enunciado,
    esMultiple,
    respuestas,
    dificultad,
    categoria,
    filterDificultad,
    filterCategoria,
    setEnunciado,
    setEsMultiple,
    setDificultad,
    setCategoria,
    setFilterDificultad,
    setFilterCategoria,
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
    jsonInput,
    setJsonInput,
    jsonErrors,
    jsonImporting,
    activeTab,
    setActiveTab,
    handleJsonImport,
    csvInput,
    setCsvInput,
    csvErrors,
    csvImporting,
    handleCsvImport,
  };
}
