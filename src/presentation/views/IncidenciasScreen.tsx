import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/AppNavigator';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetAllIncidenciasUseCase,
  IGetIncidenciasByClaseUseCase,
} from '../../domain/interfaces/useCases/incidencias/IIncidenciaUseCase';
import { IncidenciaDTO } from '../../domain/entities/Incidencia';
import { useAlert } from '../viewmodels/AlertContext';
import { HEADER_TOP } from '../utils/responsive';

const TYPE_COLORS: Record<string, string> = {
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#06B6D4',
};

/**
 * Pantalla de monitorización de incidencias del sistema para administradores.
 * Carga todas las incidencias al entrar en foco, permite filtrar por nombre de clase
 * y muestra el detalle de cada incidencia en un modal de pantalla completa.
 *
 * @precondition El usuario autenticado debe tener rol ADMIN.
 * @returns Vista con lista de incidencias filtrable y modal de detalle.
 */
export default function IncidenciasScreen() {
  const { showAlert } = useAlert();
  const { goBack } = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [incidencias, setIncidencias] = useState<IncidenciaDTO[]>([]);
  const loadingRef = useRef(false);
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [selected, setSelected] = useState<IncidenciaDTO | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterClase, setFilterClase] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => { setNow(new Date()); }, []);

  const getAllIncidenciasUseCase = useMemo(() => container.get<IGetAllIncidenciasUseCase>(TYPES.IGetAllIncidenciasUseCase), []);
  const getIncidenciasByClaseUseCase = useMemo(() => container.get<IGetIncidenciasByClaseUseCase>(TYPES.IGetIncidenciasByClaseUseCase), []);

  const loadAll = useCallback(async () => {
    try {
      const data = await getAllIncidenciasUseCase.execute();
      setIncidencias(data);
    } catch {
      showAlert('Error', 'No se pudieron cargar las incidencias');
    } finally {
      loadingRef.current = false;
      setLoadingVisible(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadingRef.current = true;
      setLoadingVisible(true);
      setFilterClase('');
      loadAll();
    }, [loadAll]),
  );

  const handleFilterByClase = async () => {
    if (!filterClase.trim()) {
      await loadAll();
      return;
    }
    setFiltering(true);
    try {
      const data = await getIncidenciasByClaseUseCase.execute(filterClase.trim());
      setIncidencias(data);
    } catch {
      showAlert('Error', 'No se encontraron incidencias para esa clase');
    } finally {
      setFiltering(false);
    }
  };

  const handleItemPress = useCallback((item: IncidenciaDTO) => {
    setSelected(item);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: IncidenciaDTO }) => {
    const typeColor = TYPE_COLORS[item.tipo?.toUpperCase()] ?? '#94A3B8';
    return (
      <Pressable
        style={styles.card}
        onPress={() => handleItemPress(item)}
      >
        <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
              <Text style={[styles.typeText, { color: typeColor }]}>{item.tipo}</Text>
            </View>
            <Text style={styles.cardDate} numberOfLines={1}>
              {item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '—'}
            </Text>
          </View>
          <Text style={styles.cardEndpoint} numberOfLines={1}>
            {item.endpoint}
          </Text>
          <Text style={styles.cardClase} numberOfLines={1}>
            {item.clase} · {item.metodo}
          </Text>
        </View>
      </Pressable>
    );
  }, [handleItemPress, now]);

  if (loadingVisible) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Incidencias</Text>
          <Text style={styles.headerCount}>{incidencias.length}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filtrar por clase..."
          placeholderTextColor="#555"
          value={filterClase}
          onChangeText={setFilterClase}
          onSubmitEditing={handleFilterByClase}
        />
        <Pressable
          style={styles.filterBtn}
          onPress={handleFilterByClase}
          disabled={filtering}
        >
          {filtering ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.filterBtnText}>Buscar</Text>
          )}
        </Pressable>
      </View>

      <FlatList
        data={[...incidencias].reverse()}
        keyExtractor={(item, i) => String(item.id_incidencia ?? i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay incidencias registradas</Text>
          </View>
        }
        renderItem={renderItem}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalle de incidencia</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>
          {selected && (
            <ScrollView contentContainerStyle={styles.modalBody}>
              {[
                { label: 'ID', value: String(selected.id_incidencia ?? '—') },
                { label: 'Tipo', value: selected.tipo },
                { label: 'Endpoint', value: selected.endpoint },
                { label: 'Clase', value: selected.clase },
                { label: 'Método', value: selected.metodo },
                { label: 'Fecha', value: selected.fecha },
                { label: 'Usuario ID', value: String(selected.id_usuario ?? '—') },
              ].map(({ label, value }) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}
              <Text style={styles.detailLabel}>Traza</Text>
              <View style={styles.trazaBox}>
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <Text style={styles.trazaText}>{selected.traza}</Text>
                </ScrollView>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  center: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { marginBottom: 8 },
  backBtnText: { color: '#7C3AED', fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerCount: {
    backgroundColor: '#EF4444',
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  filterBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D44',
    overflow: 'hidden',
  },
  typeBar: { width: 5 },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700' },
  cardDate: { color: '#64748B', fontSize: 12 },
  cardEndpoint: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  cardClase: { color: '#64748B', fontSize: 12, marginTop: 3 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#64748B', fontSize: 15 },
  modal: { flex: 1, backgroundColor: '#0D0D1A' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 22, color: '#EF4444', fontWeight: '700' },
  modalBody: { padding: 20, gap: 12 },
  detailRow: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  detailLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  detailValue: { color: '#FFFFFF', fontSize: 14 },
  trazaBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2D2D44',
    marginTop: 4,
    maxHeight: 200,
  },
  trazaText: { color: '#94A3B8', fontSize: 12, fontFamily: 'monospace' },
});
