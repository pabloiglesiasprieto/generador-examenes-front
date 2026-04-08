import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/AppNavigator';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetResultadosExamenUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { ResultadoDTO } from '../../domain/entities/Examen';

type ExamResultsRoute = RouteProp<AdminStackParamList, 'ExamResults'>;
type ExamResultsNav = NativeStackNavigationProp<AdminStackParamList, 'ExamResults'>;

function formatTime(seconds?: number): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ExamResultsScreen() {
  const navigation = useNavigation<ExamResultsNav>();
  const route = useRoute<ExamResultsRoute>();
  const { examenId } = route.params;

  const [results, setResults] = useState<ResultadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getResultadosUseCase = container.get<IGetResultadosExamenUseCase>(
    TYPES.IGetResultadosExamenUseCase,
  );

  useEffect(() => {
    getResultadosUseCase
      .execute(examenId)
      .then(setResults)
      .catch(() => setError('No se pudieron cargar los resultados'))
      .finally(() => setLoading(false));
  }, [examenId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Examen #{examenId}</Text>
        <Text style={styles.subtitle}>Resultados de alumnos</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aún no hay resultados para este examen</Text>
        </View>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colUsuario, styles.colHeaderText]}>Alumno</Text>
            <Text style={[styles.col, styles.colIntento, styles.colHeaderText]}>Intento</Text>
            <Text style={[styles.col, styles.colNota, styles.colHeaderText]}>Nota</Text>
            <Text style={[styles.col, styles.colTiempo, styles.colHeaderText]}>Tiempo</Text>
          </View>

          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const notaColor =
                item.nota >= 9
                  ? '#10B981'
                  : item.nota >= 7
                  ? '#06B6D4'
                  : item.nota >= 5
                  ? '#F59E0B'
                  : '#EF4444';
              return (
                <View style={styles.row}>
                  <Text style={[styles.col, styles.colUsuario, styles.cellText]}>
                    #{item.usuario_id ?? '—'}
                  </Text>
                  <Text style={[styles.col, styles.colIntento, styles.cellText]}>
                    {item.intento}
                  </Text>
                  <Text style={[styles.col, styles.colNota, { color: notaColor, fontWeight: '700' }]}>
                    {item.nota.toFixed(1)}
                  </Text>
                  <Text style={[styles.col, styles.colTiempo, styles.cellText]}>
                    {formatTime(item.tiempo_segundos)}
                  </Text>
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  backBtn: { marginBottom: 8 },
  backText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 15, textAlign: 'center' },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  col: { fontSize: 13 },
  colUsuario: { flex: 2 },
  colIntento: { flex: 1, textAlign: 'center' },
  colNota: { flex: 1, textAlign: 'center' },
  colTiempo: { flex: 1.5, textAlign: 'right' },
  colHeaderText: { color: '#64748B', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  cellText: { color: '#FFFFFF' },
});
