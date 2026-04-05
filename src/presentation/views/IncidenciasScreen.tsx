import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import {
  IGetAllIncidenciasUseCase,
  IGetIncidenciasByClaseUseCase,
} from '../../domain/interfaces/useCases/incidencias/IIncidenciaUseCase';
import { IncidenciaDTO } from '../../domain/entities/Incidencia';

const TYPE_COLORS: Record<string, string> = {
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#06B6D4',
};

export default function IncidenciasScreen() {
  const [incidencias, setIncidencias] = useState<IncidenciaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IncidenciaDTO | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterClase, setFilterClase] = useState('');
  const [filtering, setFiltering] = useState(false);

  const getAllIncidenciasUseCase = container.get<IGetAllIncidenciasUseCase>(TYPES.IGetAllIncidenciasUseCase);
  const getIncidenciasByClaseUseCase = container.get<IGetIncidenciasByClaseUseCase>(TYPES.IGetIncidenciasByClaseUseCase);

  const loadAll = useCallback(async () => {
    try {
      const data = await getAllIncidenciasUseCase.execute();
      setIncidencias(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las incidencias');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
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
      Alert.alert('Error', 'No se encontraron incidencias para esa clase');
    } finally {
      setFiltering(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incidencias</Text>
        <Text style={styles.headerCount}>{incidencias.length}</Text>
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
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={handleFilterByClase}
          disabled={filtering}
        >
          {filtering ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.filterBtnText}>Buscar</Text>
          )}
        </TouchableOpacity>
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
        renderItem={({ item }) => {
          const typeColor = TYPE_COLORS[item.tipo?.toUpperCase()] ?? '#94A3B8';
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setSelected(item);
                setModalVisible(true);
              }}
            >
              <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>{item.tipo}</Text>
                  </View>
                  <Text style={styles.cardDate} numberOfLines={1}>
                    {item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '—'}
                  </Text>
                </View>
                <Text style={styles.cardEndpoint} numberOfLines={1}>
                  {item.endpoint}
                </Text>
                <Text style={styles.cardClase} numberOfLines={1}>
                  {item.clase} · {item.metodo}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalle de incidencia</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
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
    paddingTop: 56,
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
