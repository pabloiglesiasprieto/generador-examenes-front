import { useCallback, useMemo, useRef, useState } from 'react';
import { useAlert } from './AlertContext';
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

/** Contador global para generar claves únicas de filas de respuesta en formularios. */
let _keyCounter = 0;

/**
 * Genera la siguiente clave única para una fila de respuesta.
 *
 * @returns Número entero incremental único.
 */
const nextKey = () => ++_keyCounter;

const DEFAULT_RESPUESTAS: RespuestaInput[] = [
  { _key: nextKey(), texto: '', es_correcta: false },
  { _key: nextKey(), texto: '', es_correcta: false },
];

const PAGE_SIZE = 20;

/**
 * Extrae el mensaje de error de una respuesta de la API o devuelve un mensaje de reserva.
 *
 * @param err - Error capturado en el bloque catch.
 * @param fallback - Mensaje a devolver si no hay mensaje de la API.
 * @returns Mensaje de error legible para el usuario.
 */
function extractApiError(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

/**
 * Valida los campos básicos del formulario de pregunta antes de guardarlo.
 *
 * @param enunciado - Texto del enunciado de la pregunta.
 * @param respuestas - Lista de respuestas del formulario.
 * @returns Mensaje de error si la validación falla, o null si es válido.
 */
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

/**
 * ViewModel de la pantalla de gestión de preguntas del banco.
 * Gestiona la carga paginada, el filtrado, la creación, edición, eliminación e importación
 * de preguntas en formato formulario, JSON y CSV.
 *
 * @precondition El usuario debe tener rol ADMIN o PROFESOR.
 * @returns Objeto con el estado y los handlers de la pantalla de preguntas:
 *   - `preguntas`: lista de preguntas filtradas actualmente mostradas.
 *   - `loading`, `loadingMore`, `hasMore`: estado de la carga paginada.
 *   - `loadMore`: carga la siguiente página de preguntas.
 *   - `modalVisible`: indica si el modal de crear/editar está visible.
 *   - `editing`: pregunta en edición, o null si se está creando una nueva.
 *   - `saving`, `deleting`: indicadores de operación en curso.
 *   - `deleteTarget`, `deleteError`: pregunta a eliminar y error de eliminación.
 *   - `enunciado`, `esMultiple`, `respuestas`, `dificultad`, `categoria`: campos del formulario.
 *   - `filterDificultad`, `filterCategoria`: filtros activos de la lista.
 *   - Setters para los campos del formulario y filtros.
 *   - `openCreate`, `openEdit`, `closeModal`: control del modal.
 *   - `addRespuesta`, `removeRespuesta`, `updateRespuesta`: gestión de respuestas en el formulario.
 *   - `handleSave`: guarda la pregunta (crea o actualiza).
 *   - `handleDelete`, `cancelDelete`, `confirmDelete`: flujo de eliminación con confirmación.
 *   - `jsonInput`, `setJsonInput`, `jsonErrors`, `jsonImporting`, `handleJsonImport`: importación JSON.
 *   - `csvInput`, `setCsvInput`, `csvErrors`, `csvImporting`, `handleCsvImport`: importación CSV.
 *   - `activeTab`, `setActiveTab`: pestaña activa del modal (form | json | csv).
 */
export function useQuestionsScreen() {
  const { showAlert } = useAlert();
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

  const getAllPreguntasUseCase = useMemo(() => container.get<IGetAllPreguntasUseCase>(TYPES.IGetAllPreguntasUseCase), []);
  const getPreguntaByIdUseCase = useMemo(() => container.get<IGetPreguntaByIdUseCase>(TYPES.IGetPreguntaByIdUseCase), []);
  const createPreguntaUseCase = useMemo(() => container.get<ICreatePreguntaUseCase>(TYPES.ICreatePreguntaUseCase), []);
  const updatePreguntaUseCase = useMemo(() => container.get<IUpdatePreguntaUseCase>(TYPES.IUpdatePreguntaUseCase), []);
  const deletePreguntaUseCase = useMemo(() => container.get<IDeletePreguntaUseCase>(TYPES.IDeletePreguntaUseCase), []);
  const importarCsvUseCase = useMemo(() => container.get<IImportarCsvPreguntasUseCase>(TYPES.IImportarCsvPreguntasUseCase), []);

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
      showAlert('Error', 'No se pudieron cargar las preguntas');
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
    try {
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
    } catch (err: unknown) {
      showAlert('Error', extractApiError(err, 'No se pudo cargar la pregunta'));
    }
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
      showAlert('Error', validationError);
      return;
    }

    const data: PreguntaInput = {
      enunciado: enunciado.trim(),
      es_multiple: esMultiple,
      respuestas: respuestas.reduce<Omit<RespuestaInput, '_key'>[]>((acc, { _key: _, ...r }) => {
        if (r.texto.trim()) acc.push(r);
        return acc;
      }, []),
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
      showAlert('Error', extractApiError(err, 'Error al guardar'));
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
      await Promise.all(result.preguntas!.map((pregunta) => createPreguntaUseCase.execute(pregunta)));
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
