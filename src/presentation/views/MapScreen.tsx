import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HorizontalScroll from '../components/HorizontalScroll';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  useWindowDimensions,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../viewmodels/AuthContext';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetExamenesUseCase, ICreateExamenUseCase, IDeleteExamenUseCase, IGetResultadosAlumnoUseCase, IGetCategoriasUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { IGetUsuarioByIdUseCase } from '../../domain/interfaces/useCases/usuarios/IUsuarioUseCase';
import { ExamenDTO, ExamNodeInfo } from '../../domain/entities/Examen';
import ExamNode from '../components/ExamNode';
import { HEADER_TOP } from '../utils/responsive';

type Props = NativeStackScreenProps<GameStackParamList, 'Map'>;

/**
 * Calcula el número de estrellas obtenidas según la nota.
 *
 * @param nota - Nota numérica del intento (escala 0-10).
 * @returns Número de estrellas: 3 para nota >=9, 2 para >=7, 1 para >=5, 0 en caso contrario.
 */
function calcStars(nota: number): number {
  if (nota >= 9) return 3;
  if (nota >= 7) return 2;
  if (nota >= 5) return 1;
  return 0;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MapHeader({ nombreCompleto, userEmail, isAlumno, isAdmin, completedCount, totalNodes, totalStars, onSignOut }: Readonly<{
  nombreCompleto: string | null;
  userEmail: string | undefined;
  isAlumno: boolean;
  isAdmin: boolean;
  completedCount: number;
  totalNodes: number;
  totalStars: number;
  onSignOut: () => void;
}>) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>
          Hola, <Text style={styles.greetingName}>{nombreCompleto ?? userEmail?.split('@')[0]}</Text>
        </Text>
        <Text style={styles.headerSub}>
          {isAlumno
            ? `${completedCount}/${totalNodes} completados · ${totalStars}⭐`
            : isAdmin
            ? 'Panel de administrador'
            : 'Panel de profesor'}
        </Text>
      </View>
      <Pressable onPress={onSignOut} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Salir</Text>
      </Pressable>
    </View>
  );
}

function CategoriaFilter({ categorias, selected, onSelect }: Readonly<{
  categorias: string[];
  selected: string | null;
  onSelect: (cat: string | null) => void;
}>) {
  if (categorias.length === 0) return null;
  return (
    <HorizontalScroll style={styles.categoriaBar} contentContainerStyle={styles.categoriaBarContent}>
      <Pressable
        style={[styles.categoriaChip, selected === null && styles.categoriaChipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.categoriaChipText, selected === null && styles.categoriaChipTextActive]}>Todas</Text>
      </Pressable>
      {categorias.map((cat) => (
        <Pressable
          key={cat}
          style={[styles.categoriaChip, selected === cat && styles.categoriaChipActive]}
          onPress={() => onSelect(cat)}
        >
          <Text style={[styles.categoriaChipText, selected === cat && styles.categoriaChipTextActive]}>{cat}</Text>
        </Pressable>
      ))}
    </HorizontalScroll>
  );
}

function AlumnoProgress({ completed, total }: Readonly<{ completed: number; total: number }>) {
  if (total === 0) return null;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(completed / total) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round((completed / total) * 100)}% completado</Text>
    </View>
  );
}

function ExamMapScroll({ nodes, selectedCategoria, isEditor, refreshing, onRefresh, onNodePress, onDelete }: Readonly<{
  nodes: ExamNodeInfo[];
  selectedCategoria: string | null;
  isEditor: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onNodePress: (info: ExamNodeInfo) => void;
  onDelete: (id: number) => void;
}>) {
  if (nodes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyText}>
          {selectedCategoria ? `No hay exámenes en "${selectedCategoria}"` : 'No hay exámenes disponibles'}
        </Text>
        {isEditor && !selectedCategoria && (
          <Text style={styles.emptyHint}>Pulsa el botón para generar uno</Text>
        )}
      </View>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={styles.map}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <View style={styles.pathStart}>
        <View style={styles.pathStartCircle}><Text style={styles.pathStartText}>START</Text></View>
      </View>
      {nodes.map((info, index) => (
        <View key={`exam-${info.examen.id}`}>
          <View style={styles.pathLine} />
          <ExamNode
            info={info}
            index={index}
            onPress={() => onNodePress(info)}
            isProfesor={isEditor}
            onDelete={isEditor ? () => onDelete(info.examen.id) : undefined}
          />
        </View>
      ))}
      <View style={styles.pathLine} />
      <View style={styles.pathEnd}>
        <View style={styles.pathEndCircle}><Text style={styles.pathEndText}>🏆</Text></View>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function SelectCategoriaModal({ visible, categorias, loading, onSelect, onClose }: Readonly<{
  visible: boolean;
  categorias: string[];
  loading: boolean;
  onSelect: (cat: string | null) => void;
  onClose: () => void;
}>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Selecciona una categoría</Text>
          <Text style={styles.modalMessage}>El examen se creará con preguntas de la categoría elegida.</Text>
          {loading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginVertical: 16 }} />
          ) : (
            <ScrollView style={styles.categoriaList} showsVerticalScrollIndicator={false}>
              <Pressable style={styles.categoriaItem} onPress={() => onSelect(null)}>
                <Text style={styles.categoriaItemText}>Todas las categorías</Text>
              </Pressable>
              {categorias.map((cat) => (
                <Pressable key={cat} style={styles.categoriaItem} onPress={() => onSelect(cat)}>
                  <Text style={styles.categoriaItemText}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Pressable style={[styles.cancelBtn, { width: '100%', flex: undefined }]} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SelectNumPreguntasModal({ visible, error, creating, onSelect, onClose }: Readonly<{
  visible: boolean;
  error: string | null;
  creating: boolean;
  onSelect: (num: 10 | 20 | 30) => void;
  onClose: () => void;
}>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>¿Cuántas preguntas?</Text>
          <Text style={styles.modalMessage}>Elige la dificultad del examen según el número de preguntas.</Text>
          {([
            { num: 10, label: '10 preguntas', dif: 'Fácil', color: '#10B981' },
            { num: 20, label: '20 preguntas', dif: 'Medio', color: '#F59E0B' },
            { num: 30, label: '30 preguntas', dif: 'Difícil', color: '#EF4444' },
          ] as const).map(({ num, label, dif, color }) => (
            <Pressable
              key={num}
              style={[styles.categoriaItem, { marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }]}
              onPress={() => onSelect(num)}
              disabled={creating}
            >
              <Text style={styles.categoriaItemText}>{label}</Text>
              <View style={[styles.difBadge, { backgroundColor: color + '22', borderColor: color }]}>
                <Text style={[styles.difBadgeText, { color }]}>{dif}</Text>
              </View>
            </Pressable>
          ))}
          {error && <Text style={[styles.modalMessage, { color: '#EF4444', marginTop: 8 }]}>{error}</Text>}
          <Pressable style={[styles.cancelBtn, { width: '100%', flex: undefined, marginTop: 8 }]} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function DeleteExamenModal({ visible, examId, error, onConfirm, onClose }: Readonly<{
  visible: boolean;
  examId: number | null;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalIconCircle}><Text style={styles.modalIcon}>🗑️</Text></View>
          <Text style={styles.modalTitle}>Borrar examen</Text>
          <Text style={styles.modalMessage}>
            ¿Estás seguro de que quieres eliminar el{' '}
            <Text style={{ color: '#EF4444', fontWeight: '700' }}>Examen #{examId}</Text>
            ?{'\n'}Esta acción no se puede deshacer.
          </Text>
          {error && <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 8 }}>{error}</Text>}
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

/**
 * Pantalla principal de mapa de exámenes.
 * Muestra los exámenes disponibles como nodos en un mapa vertical.
 * Los alumnos ven su progreso y estrellas; los profesores y admins pueden
 * crear y eliminar exámenes. Permite filtrar por categoría y refrescar con pull-to-refresh.
 *
 * @param props.navigation - Objeto de navegación del stack de juego.
 * @returns Vista de mapa con nodos de examen, barra de categorías, modales de creación
 *   y eliminación, y cabecera con información del usuario.
 */
export default function MapScreen({ navigation }: Props) {
  useWindowDimensions(); // subscribe to dimension changes
  const { user, isAlumno, isProfesor, isAdmin, signOut } = useAuth();
  const examenesRef = useRef<ExamenDTO[]>([]);
  const [nodes, setNodes] = useState<ExamNodeInfo[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const loadingRef = useRef(true);
  const loadErrorRef = useRef(false);
  // Estado de carga agrupado
  const [loadState, setLoadState] = useState({ loadingVisible: true, refreshing: false, loadErrorVisible: false });
  // Estado del modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; examId: number | null; error: string | null }>({ visible: false, examId: null, error: null });
  // Estado del flujo de creación
  const [createFlow, setCreateFlow] = useState<{ categoriaModalVisible: boolean; categoriasLoading: boolean; numPreguntasModalVisible: boolean; pendingCategoria: string | null | undefined; numPreguntasError: string | null }>({ categoriaModalVisible: false, categoriasLoading: false, numPreguntasModalVisible: false, pendingCategoria: undefined, numPreguntasError: null });
  const pendingDuracion: number | undefined = undefined;

  const getExamenesUseCase = useMemo(() => container.get<IGetExamenesUseCase>(TYPES.IGetExamenesUseCase), []);
  const createExamenUseCase = useMemo(() => container.get<ICreateExamenUseCase>(TYPES.ICreateExamenUseCase), []);
  const deleteExamenUseCase = useMemo(() => container.get<IDeleteExamenUseCase>(TYPES.IDeleteExamenUseCase), []);
  const getResultadosAlumnoUseCase = useMemo(() => container.get<IGetResultadosAlumnoUseCase>(TYPES.IGetResultadosAlumnoUseCase), []);
  const getCategoriasUseCase = useMemo(() => container.get<IGetCategoriasUseCase>(TYPES.IGetCategoriasUseCase), []);
  const getUsuarioByIdUseCase = useMemo(() => container.get<IGetUsuarioByIdUseCase>(TYPES.IGetUsuarioByIdUseCase), []);

  useEffect(() => {
    if (!user) return;
    getUsuarioByIdUseCase.execute(user.id)
      .then((u) => setNombreCompleto(`${u.nombre_usuario} ${u.apellido_usuario}`))
      .catch(() => {});
  }, [user?.id]);

  const loadData = useCallback(async () => {
    loadErrorRef.current = false;
    setLoadState(s => ({ ...s, loadErrorVisible: false }));
    try {
      const exams = await getExamenesUseCase.execute();
      examenesRef.current = exams;
      const cats = await getCategoriasUseCase.execute().catch(() => []);
      setCategorias(cats);
      if (isAlumno && user) {
        const allResults = await getResultadosAlumnoUseCase.execute(user.id).catch(() => []);
        const bestByExam = new Map<number, number>();
        for (const r of allResults) {
          const prev = bestByExam.get(r.examen_id);
          if (prev == null || r.nota > prev) bestByExam.set(r.examen_id, r.nota);
        }
        setNodes(exams.map((ex) => {
          const best = bestByExam.get(ex.id);
          if (best == null) return { examen: ex, status: 'available', stars: 0, bestNota: 0 };
          return { examen: ex, status: 'completed', stars: calcStars(best), bestNota: best };
        }));
      } else {
        setNodes(exams.map((ex) => ({ examen: ex, status: 'available', stars: 0, bestNota: 0 })));
      }
    } catch {
      loadErrorRef.current = true;
      setLoadState(s => ({ ...s, loadErrorVisible: true }));
    } finally {
      loadingRef.current = false;
      setLoadState({ loadingVisible: false, refreshing: false, loadErrorVisible: loadErrorRef.current });
    }
  }, [isAlumno, user]);

  useFocusEffect(useCallback(() => {
    loadingRef.current = true;
    setLoadState(s => ({ ...s, loadingVisible: true }));
    loadData();
  }, [loadData]));

  const handleNodePress = (info: ExamNodeInfo) => {
    navigation.navigate('Exam', { examen: info.examen, isAdminMode: isProfesor || isAdmin || undefined });
  };

  const handleCreate = async () => {
    setCreateFlow(s => ({ ...s, categoriasLoading: true, categoriaModalVisible: true }));
    try {
      const cats = await getCategoriasUseCase.execute();
      setCategorias(cats);
    } catch { /* usa categorías del loadData */ } finally {
      setCreateFlow(s => ({ ...s, categoriasLoading: false }));
    }
  };

  const handleSelectCategoria = (categoria: string | null) => {
    setCreateFlow(s => ({ ...s, categoriaModalVisible: false, pendingCategoria: categoria, numPreguntasError: null, numPreguntasModalVisible: true }));
  };

  const handleSelectNumPreguntas = async (numPreguntas: 10 | 20 | 30) => {
    setCreateFlow(s => ({ ...s, numPreguntasError: null }));
    setCreating(true);
    try {
      await createExamenUseCase.execute(pendingDuracion, createFlow.pendingCategoria ?? undefined, numPreguntas);
      setCreateFlow(s => ({ ...s, numPreguntasModalVisible: false }));
      await loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo crear el examen';
      setCreateFlow(s => ({ ...s, numPreguntasError: msg }));
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.examId == null) return;
    try {
      await deleteExamenUseCase.execute(deleteModal.examId);
      setDeleteModal({ visible: false, examId: null, error: null });
      await loadData();
    } catch {
      setDeleteModal(s => ({ ...s, error: 'No se pudo eliminar el examen. Inténtalo de nuevo.' }));
    }
  };

  const filteredNodes = selectedCategoria ? nodes.filter((n) => n.examen.categoria === selectedCategoria) : nodes;
  const totalStars = filteredNodes.reduce((acc, n) => acc + n.stars, 0);
  const completedCount = filteredNodes.filter((n) => n.status === 'completed').length;
  const isEditor = isProfesor || isAdmin;

  if (loadState.loadingVisible) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando mapa…</Text>
      </View>
    );
  }

  if (loadState.loadErrorVisible) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: '#EF4444', marginBottom: 16, textAlign: 'center' }}>
          No se pudieron cargar los exámenes.{'\n'}Comprueba tu conexión e inténtalo de nuevo.
        </Text>
        <Pressable
          style={{ backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          onPress={() => { setLoadState(s => ({ ...s, loadingVisible: true })); loadData(); }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapHeader
        nombreCompleto={nombreCompleto}
        userEmail={user?.email}
        isAlumno={isAlumno}
        isAdmin={isAdmin}
        completedCount={completedCount}
        totalNodes={filteredNodes.length}
        totalStars={totalStars}
        onSignOut={signOut}
      />
      <CategoriaFilter categorias={categorias} selected={selectedCategoria} onSelect={setSelectedCategoria} />
      {isAlumno && <AlumnoProgress completed={completedCount} total={filteredNodes.length} />}
      {isEditor && (
        <Pressable style={[styles.createBtn, creating && styles.btnDisabled]} onPress={handleCreate} disabled={creating}>
          {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createBtnText}>+ Generar nuevo examen</Text>}
        </Pressable>
      )}
      <ExamMapScroll
        nodes={filteredNodes}
        selectedCategoria={selectedCategoria}
        isEditor={isEditor}
        refreshing={loadState.refreshing}
        onRefresh={() => { setLoadState(s => ({ ...s, refreshing: true })); loadData(); }}
        onNodePress={handleNodePress}
        onDelete={(id) => setDeleteModal({ visible: true, examId: id, error: null })}
      />
      <SelectCategoriaModal
        visible={createFlow.categoriaModalVisible}
        categorias={categorias}
        loading={createFlow.categoriasLoading}
        onSelect={handleSelectCategoria}
        onClose={() => setCreateFlow(s => ({ ...s, categoriaModalVisible: false }))}
      />
      <SelectNumPreguntasModal
        visible={createFlow.numPreguntasModalVisible}
        error={createFlow.numPreguntasError}
        creating={creating}
        onSelect={(num) => void handleSelectNumPreguntas(num)}
        onClose={() => setCreateFlow(s => ({ ...s, numPreguntasModalVisible: false, numPreguntasError: null }))}
      />
      <DeleteExamenModal
        visible={deleteModal.visible}
        examId={deleteModal.examId}
        error={deleteModal.error}
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal({ visible: false, examId: null, error: null })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  center: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP,
    paddingBottom: 16,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  headerLeft: {},
  greeting: { fontSize: 16, color: '#94A3B8' },
  greetingName: { color: '#FFFFFF', fontWeight: '700' },
  headerSub: { fontSize: 13, color: '#7C3AED', marginTop: 2, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  categoriaBar: {
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
    flexShrink: 0,
    flexGrow: 0,
  },
  categoriaBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2D2D44',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  categoriaChipActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7C3AED',
  },
  categoriaChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  categoriaChipTextActive: { color: '#7C3AED' },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1A1A2E',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  progressText: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  createBtn: {
    margin: 16,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  btnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  map: { paddingTop: 20, alignItems: 'center' },
  pathStart: { alignItems: 'center', marginBottom: 8 },
  pathStartCircle: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pathStartText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  pathLine: {
    width: 4,
    height: 30,
    backgroundColor: '#2D2D44',
    alignSelf: 'center',
    borderRadius: 2,
  },
  pathEnd: { alignItems: 'center', marginTop: 8 },
  pathEndCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathEndText: { fontSize: 30 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyHint: { color: '#94A3B8', fontSize: 14, marginTop: 8, textAlign: 'center' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239,68,68,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: { fontSize: 30 },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  categoriaList: {
    width: '100%',
    maxHeight: 180,
    marginBottom: 16,
  },
  categoriaItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#2D2D44',
    marginBottom: 8,
  },
  categoriaItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  difBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  difBadgeText: { fontSize: 12, fontWeight: '700' },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  cancelBtnText: { color: '#7C3AED', fontWeight: '700', fontSize: 15 },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
