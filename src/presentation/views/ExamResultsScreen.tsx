import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/AppNavigator';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IGetResultadosExamenUseCase, IGetExamenByIdUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';
import { IGetUsuarioByIdUseCase } from '../../domain/interfaces/useCases/usuarios/IUsuarioUseCase';
import { ResultadoDTO } from '../../domain/entities/Examen';
import { HEADER_TOP } from '../utils/responsive';

type ExamResultsRoute = RouteProp<AdminStackParamList, 'ExamResults'>;
type ExamResultsNav = NativeStackNavigationProp<AdminStackParamList, 'ExamResults'>;

function formatTime(seconds?: number): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getNotaColor(nota: number | null | undefined): string {
  if (nota == null) return '#64748B';
  if (nota >= 9) return '#10B981';
  if (nota >= 7) return '#06B6D4';
  if (nota >= 5) return '#F59E0B';
  return '#EF4444';
}

function DetalleModal({
  resultado,
  onClose,
}: Readonly<{ resultado: ResultadoDTO | null; onClose: () => void }>) {
  return (
    <Modal visible={!!resultado} animationType="slide" onRequestClose={onClose}>
      {resultado && (
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.headerTitle}>
                {resultado.nombre_usuario ?? `Alumno #${resultado.usuario_id}`}
              </Text>
              <Text style={modalStyles.headerSub}>
                Intento #{resultado.intento} · {resultado.nota == null ? '—' : resultado.nota.toFixed(1)}/10 · {formatTime(resultado.tiempo_segundos)}
              </Text>
            </View>
            <Pressable style={modalStyles.closeBtn} onPress={onClose}>
              <Text style={modalStyles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={modalStyles.body} showsVerticalScrollIndicator={false}>
            {resultado.detalle.map((d, i) => (
              <View
                key={`d-${d.pregunta_id}`}
                style={[modalStyles.card, d.es_correcta ? modalStyles.cardCorrect : modalStyles.cardWrong]}
              >
                <View style={modalStyles.cardHeader}>
                  <View style={modalStyles.indexBadge}>
                    <Text style={modalStyles.indexText}>#{i + 1}</Text>
                  </View>
                  <View
                    style={[
                      modalStyles.resultBadge,
                      { backgroundColor: d.es_correcta ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' },
                    ]}
                  >
                    <Text style={d.es_correcta ? modalStyles.correctText : modalStyles.wrongText}>
                      {d.es_correcta ? '✓ Correcta' : '✗ Incorrecta'}
                    </Text>
                  </View>
                </View>

                <Text style={modalStyles.enunciado}>{d.enunciado}</Text>

                <View style={modalStyles.respBlock}>
                  <Text style={modalStyles.respLabel}>Respuesta del alumno</Text>
                  {d.textos_enviados.length === 0 ? (
                    <Text style={modalStyles.respNone}>Sin respuesta</Text>
                  ) : (
                    d.textos_enviados.map((texto) => (
                      <View
                        key={texto}
                        style={[modalStyles.respRow, d.es_correcta ? modalStyles.respRowCorrect : modalStyles.respRowWrong]}
                      >
                        <Text style={[modalStyles.respIcon, { color: d.es_correcta ? '#10B981' : '#EF4444' }]}>●</Text>
                        <Text style={modalStyles.respText}>{texto}</Text>
                      </View>
                    ))
                  )}
                </View>

                {!d.es_correcta && (
                  <View style={modalStyles.respBlock}>
                    <Text style={modalStyles.respLabel}>Respuesta correcta</Text>
                    {d.textos_correctos.map((texto) => (
                      <View key={texto} style={modalStyles.respRowCorrect}>
                        <Text style={[modalStyles.respIcon, { color: '#10B981' }]}>●</Text>
                        <Text style={modalStyles.respText}>{texto}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

export default function ExamResultsScreen() {
  const { goBack } = useNavigation<ExamResultsNav>();
  const route = useRoute<ExamResultsRoute>();
  const { examenId } = route.params;

  const [results, setResults] = useState<ResultadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ResultadoDTO | null>(null);
  const [autorNombre, setAutorNombre] = useState<string | null>(null);
  const [fechaCreacion, setFechaCreacion] = useState<string | null>(null);

  const getResultadosUseCase = useMemo(
    () => container.get<IGetResultadosExamenUseCase>(TYPES.IGetResultadosExamenUseCase),
    [],
  );
  const getExamenByIdUseCase = useMemo(
    () => container.get<IGetExamenByIdUseCase>(TYPES.IGetExamenByIdUseCase),
    [],
  );
  const getUsuarioByIdUseCase = useMemo(
    () => container.get<IGetUsuarioByIdUseCase>(TYPES.IGetUsuarioByIdUseCase),
    [],
  );

  useEffect(() => {
    const fetchResultados = getResultadosUseCase
      .execute(examenId)
      .then(setResults)
      .catch(() => setError('No se pudieron cargar los resultados'));

    const fetchAutor = getExamenByIdUseCase.execute(examenId).then((examen) => {
      setFechaCreacion(new Date(examen.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }));
      return getUsuarioByIdUseCase.execute(examen.autor_id).then((u) => {
        setAutorNombre(`${u.nombre_usuario} ${u.apellido_usuario}`);
      });
    }).catch(() => {});

    Promise.all([fetchResultados, fetchAutor]).finally(() => setLoading(false));
  }, [examenId]);

  const renderItem = useCallback(({ item }: { item: ResultadoDTO }) => {
    const nota = item.nota ?? null;
    const notaColor = getNotaColor(nota);
    return (
      <Pressable onPress={() => setSelected(item)} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={[styles.cardAccent, { backgroundColor: notaColor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardUser}>
                {item.nombre_usuario ?? `Alumno #${item.usuario_id}`}
              </Text>
              <View style={styles.attemptBadge}>
                <Text style={styles.attemptText}>Intento #{item.intento}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.cardNota, { color: notaColor }]}>
                {nota != null ? nota.toFixed(1) : '—'}
              </Text>
              <Text style={styles.cardNotaLabel}>/10</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTime}>⏱ {formatTime(item.tiempo_segundos)}</Text>
            <Text style={styles.cardStats}>
              <Text style={{ color: '#10B981' }}>{item.preguntas_correctas}✓</Text>
              {'  '}
              <Text style={{ color: '#EF4444' }}>{item.total_preguntas - item.preguntas_correctas}✗</Text>
            </Text>
            <Text style={styles.cardChevron}>›</Text>
          </View>
        </View>
      </Pressable>
    );
  }, []);

  return (
    <View style={styles.container}>
      <DetalleModal resultado={selected} onClose={() => setSelected(null)} />

      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Examen #{examenId}</Text>
        <Text style={styles.subtitle}>Resultados de alumnos</Text>
        {autorNombre && (
          <View style={styles.autorRow}>
            <Text style={styles.autorIcon}>✍️</Text>
            <Text style={styles.autorText}>
              {autorNombre}
              {fechaCreacion ? <Text style={styles.autorDate}> · {fechaCreacion}</Text> : null}
            </Text>
          </View>
        )}
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
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: {
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP,
    paddingBottom: 16,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  backBtn: { marginBottom: 8 },
  backText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  autorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  autorIcon: { fontSize: 13 },
  autorText: { fontSize: 13, color: '#A78BFA', fontWeight: '600' },
  autorDate: { color: '#64748B', fontWeight: '400' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 15, textAlign: 'center' },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.75 },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLeft: { flex: 1, gap: 6 },
  cardUser: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  attemptBadge: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  attemptText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end', flexDirection: 'row', gap: 2, alignSelf: 'flex-start' },
  cardNota: { fontSize: 28, fontWeight: '800' },
  cardNotaLabel: { color: '#64748B', fontSize: 14, alignSelf: 'flex-end', marginBottom: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D2D44',
  },
  cardTime: { color: '#94A3B8', fontSize: 13 },
  cardStats: { fontSize: 13 },
  cardChevron: { color: '#7C3AED', fontSize: 22, fontWeight: '700' },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  closeBtn: {
    backgroundColor: '#2D2D44',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  body: { padding: 16, gap: 14 },
  card: { borderRadius: 16, padding: 16, borderLeftWidth: 4 },
  cardCorrect: { backgroundColor: 'rgba(16,185,129,0.08)', borderLeftColor: '#10B981' },
  cardWrong: { backgroundColor: 'rgba(239,68,68,0.08)', borderLeftColor: '#EF4444' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  indexBadge: { backgroundColor: '#2D2D44', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  indexText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  correctText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  wrongText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  enunciado: { color: '#FFFFFF', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  respBlock: { marginTop: 8, gap: 6 },
  respLabel: { color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  respNone: { color: '#475569', fontSize: 13, fontStyle: 'italic' },
  respRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    padding: 10,
  },
  respRowCorrect: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 8,
    padding: 10,
  },
  respRowWrong: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 8,
    padding: 10,
  },
  respIcon: { fontSize: 10, marginTop: 4 },
  respText: { flex: 1, color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
});
