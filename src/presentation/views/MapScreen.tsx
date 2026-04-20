import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../viewmodels/AuthContext';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetExamenesUseCase, ICreateExamenUseCase, IDeleteExamenUseCase, IGetResultadosAlumnoUseCase, IGetCategoriasUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ExamenDTO, ExamNodeInfo } from '../../domain/entities/Examen';
import ExamNode from '../components/ExamNode';

type Props = NativeStackScreenProps<GameStackParamList, 'Map'>;

function calcStars(nota: number): number {
  if (nota >= 9) return 3;
  if (nota >= 7) return 2;
  if (nota >= 5) return 1;
  return 0;
}

export default function MapScreen({ navigation }: Props) {
  const { user, isAlumno, isProfesor, isAdmin, signOut } = useAuth();
  const [examenes, setExamenes] = useState<ExamenDTO[]>([]);
  const [nodes, setNodes] = useState<ExamNodeInfo[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Modal de selección de categoría al crear
  const [categoriaModalVisible, setCategoriaModalVisible] = useState(false);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [pendingDuracion] = useState<number | undefined>(undefined);

  const getExamenesUseCase = container.get<IGetExamenesUseCase>(TYPES.IGetExamenesUseCase);
  const createExamenUseCase = container.get<ICreateExamenUseCase>(TYPES.ICreateExamenUseCase);
  const deleteExamenUseCase = container.get<IDeleteExamenUseCase>(TYPES.IDeleteExamenUseCase);
  const getResultadosAlumnoUseCase = container.get<IGetResultadosAlumnoUseCase>(TYPES.IGetResultadosAlumnoUseCase);
  const getCategoriasUseCase = container.get<IGetCategoriasUseCase>(TYPES.IGetCategoriasUseCase);

  const loadData = useCallback(async () => {
    try {
      const exams = await getExamenesUseCase.execute();
      setExamenes(exams);

      // Cargar categorías disponibles
      const cats = await getCategoriasUseCase.execute().catch(() => []);
      setCategorias(cats);

      if (isAlumno && user) {
        const allResults = await getResultadosAlumnoUseCase.execute(user.id).catch(() => []);
        const bestByExam = new Map<number, number>();
        for (const r of allResults) {
          const prev = bestByExam.get(r.examen_id);
          if (prev == null || r.nota > prev) bestByExam.set(r.examen_id, r.nota);
        }
        const enriched: ExamNodeInfo[] = exams.map((ex) => {
          const best = bestByExam.get(ex.id);
          if (best == null) return { examen: ex, status: 'available', stars: 0, bestNota: 0 };
          return { examen: ex, status: 'completed', stars: calcStars(best), bestNota: best };
        });
        setNodes(enriched);
      } else {
        setNodes(
          exams.map((ex) => ({ examen: ex, status: 'available', stars: 0, bestNota: 0 })),
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los exámenes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAlumno, user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleNodePress = (info: ExamNodeInfo) => {
    if (isProfesor || isAdmin) {
      navigation.navigate('Exam', { examen: info.examen, isAdminMode: true });
    } else {
      navigation.navigate('Exam', { examen: info.examen });
    }
  };

  // Abrir modal de selección de categoría
  const handleCreate = async () => {
    setCategoriasLoading(true);
    setCategoriaModalVisible(true);
    try {
      const cats = await getCategoriasUseCase.execute();
      setCategorias(cats);
    } catch {
      // ya tenemos categorias del loadData, seguimos
    } finally {
      setCategoriasLoading(false);
    }
  };

  // Crear examen con la categoría elegida
  const handleSelectCategoria = async (categoria: string | null) => {
    setCategoriaModalVisible(false);
    setCreating(true);
    try {
      await createExamenUseCase.execute(pendingDuracion, categoria ?? undefined);
      await loadData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo crear el examen';
      Alert.alert('Error', msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (examenId: number) => {
    setExamToDelete(examenId);
    setDeleteError(null);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (examToDelete == null) return;
    setDeleteError(null);
    try {
      await deleteExamenUseCase.execute(examToDelete);
      setDeleteModalVisible(false);
      setExamToDelete(null);
      await loadData();
    } catch {
      setDeleteError('No se pudo eliminar el examen. Inténtalo de nuevo.');
    }
  };

  // Filtrar nodos por categoría seleccionada
  const filteredNodes = selectedCategoria
    ? nodes.filter((n) => n.examen.categoria === selectedCategoria)
    : nodes;

  const totalStars = filteredNodes.reduce((acc, n) => acc + n.stars, 0);
  const completedCount = filteredNodes.filter((n) => n.status === 'completed').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Hola, <Text style={styles.greetingName}>{user?.email.split('@')[0]}</Text>
          </Text>
          <Text style={styles.headerSub}>
            {isAlumno
              ? `${completedCount}/${filteredNodes.length} completados · ${totalStars}⭐`
              : isAdmin
              ? 'Panel de administrador'
              : 'Panel de profesor'}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro por categoría */}
      {categorias.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriaBar}
          contentContainerStyle={styles.categoriaBarContent}
        >
          <TouchableOpacity
            style={[styles.categoriaChip, selectedCategoria === null && styles.categoriaChipActive]}
            onPress={() => setSelectedCategoria(null)}
          >
            <Text style={[styles.categoriaChipText, selectedCategoria === null && styles.categoriaChipTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoriaChip, selectedCategoria === cat && styles.categoriaChipActive]}
              onPress={() => setSelectedCategoria(cat)}
            >
              <Text style={[styles.categoriaChipText, selectedCategoria === cat && styles.categoriaChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Progress bar for alumno */}
      {isAlumno && filteredNodes.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / filteredNodes.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((completedCount / filteredNodes.length) * 100)}% completado
          </Text>
        </View>
      )}

      {/* Create button for profesor/admin */}
      {(isProfesor || isAdmin) && (
        <TouchableOpacity
          style={[styles.createBtn, creating && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createBtnText}>+ Generar nuevo examen</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Map */}
      {filteredNodes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>
            {selectedCategoria
              ? `No hay exámenes en "${selectedCategoria}"`
              : 'No hay exámenes disponibles'}
          </Text>
          {(isProfesor || isAdmin) && !selectedCategoria && (
            <Text style={styles.emptyHint}>Pulsa el botón para generar uno</Text>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.map}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7C3AED"
            />
          }
        >
          <View style={styles.pathStart}>
            <View style={styles.pathStartCircle}>
              <Text style={styles.pathStartText}>START</Text>
            </View>
          </View>

          {filteredNodes.map((info, index) => (
            <View key={`exam-${info.examen.id}-${index}`}>
              <View style={styles.pathLine} />
              <ExamNode
                info={info}
                index={index}
                onPress={() => handleNodePress(info)}
                isProfesor={isProfesor || isAdmin}
                onDelete={isProfesor || isAdmin ? () => handleDelete(info.examen.id) : undefined}
              />
            </View>
          ))}

          <View style={styles.pathLine} />
          <View style={styles.pathEnd}>
            <View style={styles.pathEndCircle}>
              <Text style={styles.pathEndText}>🏆</Text>
            </View>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      )}

      {/* Modal selección de categoría al crear examen */}
      <Modal
        visible={categoriaModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoriaModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecciona una categoría</Text>
            <Text style={styles.modalMessage}>
              El examen se creará con preguntas de la categoría elegida.
            </Text>
            {categoriasLoading ? (
              <ActivityIndicator color="#7C3AED" style={{ marginVertical: 16 }} />
            ) : (
              <ScrollView style={styles.categoriaList} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.categoriaItem}
                  onPress={() => handleSelectCategoria(null)}
                >
                  <Text style={styles.categoriaItemText}>Todas las categorías</Text>
                </TouchableOpacity>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoriaItem}
                    onPress={() => handleSelectCategoria(cat)}
                  >
                    <Text style={styles.categoriaItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCategoriaModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setDeleteModalVisible(false); setDeleteError(null); }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>🗑️</Text>
            </View>
            <Text style={styles.modalTitle}>Borrar examen</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres eliminar el{' '}
              <Text style={{ color: '#EF4444', fontWeight: '700' }}>
                Examen #{examToDelete}
              </Text>
              ?{'\n'}Esta acción no se puede deshacer.
            </Text>
            {deleteError && (
              <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                {deleteError}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setDeleteModalVisible(false); setDeleteError(null); }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                <Text style={styles.confirmBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 56,
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
    maxHeight: 52,
  },
  categoriaBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
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
    maxHeight: 220,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2D2D44',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
