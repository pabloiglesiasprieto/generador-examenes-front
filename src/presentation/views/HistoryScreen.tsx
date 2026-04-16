import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../viewmodels/AuthContext';
import { useHistoryScreen } from '../viewmodels/useHistoryScreen';
import { getStars, getNotaColor, getGradeLabel } from '../utils/gradeUtils';
import { ResultadoDTO } from '../../domain/entities/Examen';

type Props = NativeStackScreenProps<ProfileStackParamList, 'History'>;

function DetalleModal({
  resultado,
  onClose,
}: Readonly<{
  resultado: ResultadoDTO | null;
  onClose: () => void;
}>) {
  return (
    <Modal visible={!!resultado} animationType="slide" onRequestClose={onClose}>
      {resultado && (
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <View>
            <Text style={modalStyles.headerTitle}>Examen #{resultado.examen_id}</Text>
            <Text style={modalStyles.headerSub}>
              Intento #{resultado.intento} · {resultado.nota == null ? '-' : resultado.nota.toFixed(1)}/10
            </Text>
          </View>
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <Text style={modalStyles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={modalStyles.body} showsVerticalScrollIndicator={false}>
            {resultado.detalle.map((d, i) => (
              <View
                key={`d-${d.pregunta_id}-${i}`}
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
                  <Text style={modalStyles.respLabel}>Tu respuesta</Text>
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

function HistoryCard({
  item,
  index,
  onPress,
}: Readonly<{ item: ResultadoDTO; index: number; onPress: () => void }>) {
  const notaColor = getNotaColor(item.nota);
  const stars = getStars(item.nota);
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.timing(barAnim, { toValue: item.nota / 10, duration: 700, delay: index * 60 + 200, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, borderColor: notaColor + '44' }]}>
        <View style={[styles.cardAccent, { backgroundColor: notaColor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.badgesCol}>
              <View style={styles.examBadge}>
                <Text style={styles.examBadgeText}>Examen #{item.examen_id}</Text>
              </View>
              <View style={styles.attemptBadge}>
                <Text style={styles.attemptText}>Intento #{item.intento}</Text>
              </View>
            </View>
            <View style={styles.gradeRight}>
              <Text style={[styles.gradeLabel, { color: notaColor }]}>{getGradeLabel(item.nota)}</Text>
              <Text style={[styles.nota, { color: notaColor }]}>{item.nota == null ? '-' : item.nota.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.notaBarTrack}>
            <Animated.View
              style={[
                styles.notaBarFill,
                {
                  backgroundColor: notaColor,
                  width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                },
              ]}
            />
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={[styles.star, i <= stars ? styles.starOn : styles.starOff]}>★</Text>
            ))}
            <Text style={styles.outOf}>/10</Text>
          </View>

          <View style={styles.cardStats}>
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatValue, { color: '#10B981' }]}>{item.preguntas_correctas}</Text>
              <Text style={styles.cardStatLabel}>Correctas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatValue, { color: '#EF4444' }]}>
                {item.total_preguntas - item.preguntas_correctas}
              </Text>
              <Text style={styles.cardStatLabel}>Incorrectas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.cardStat}>
              <Text style={styles.cardStatValue}>{item.total_preguntas}</Text>
              <Text style={styles.cardStatLabel}>Total</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen({ navigation }: Readonly<Props>) {
  const { user } = useAuth();
  const history = useHistoryScreen(user?.id);

  return (
    <View style={styles.container}>
      {history.loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      )}

      {!history.loading && (
        <>
          <DetalleModal
            resultado={history.selectedResultado}
            onClose={history.closeDetalle}
          />

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Historial</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{history.resultadosFiltrados.length}</Text>
            </View>
          </View>

          {history.examenesIds.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterBar}
              contentContainerStyle={styles.filterBarContent}
            >
              <TouchableOpacity
                style={[styles.filterChip, history.filtroExamen === null && styles.filterChipActive]}
                onPress={() => history.setFiltroExamen(null)}
              >
                <Text style={[styles.filterChipText, history.filtroExamen === null && styles.filterChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {history.examenesIds.map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.filterChip, history.filtroExamen === id && styles.filterChipActive]}
                  onPress={() => history.setFiltroExamen(history.filtroExamen === id ? null : id)}
                >
                  <Text style={[styles.filterChipText, history.filtroExamen === id && styles.filterChipTextActive]}>
                    Examen #{id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {history.resultadosFiltrados.length > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: getNotaColor(history.avg) }]}>
                  {history.avg.toFixed(1)}
                </Text>
                <Text style={styles.summaryLabel}>Media</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#06B6D4' }]}>{history.best.toFixed(1)}</Text>
                <Text style={styles.summaryLabel}>Mejor</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{history.totalEstrellas}⭐</Text>
                <Text style={styles.summaryLabel}>Estrellas</Text>
              </View>
            </View>
          )}

          <FlatList
            data={history.resultadosFiltrados}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>Aún no has realizado ningún examen</Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <HistoryCard item={item} index={index} onPress={() => history.openDetalle(item)} />
            )}
          />
        </>
      )}
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
  backText: { color: '#7C3AED', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  countBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 36,
    alignItems: 'center',
  },
  countText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#2D2D44' },
  list: { padding: 16, gap: 14 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesCol: { flexDirection: 'column', gap: 4 },
  examBadge: {
    backgroundColor: '#3D1D6E',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  examBadgeText: { color: '#A78BFA', fontSize: 11, fontWeight: '700' },
  attemptBadge: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  attemptText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  filterBar: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#2D2D44' },
  filterBarContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  filterChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  gradeRight: { alignItems: 'flex-end' },
  gradeLabel: { fontSize: 12, fontWeight: '700' },
  nota: { fontSize: 24, fontWeight: '800' },
  notaBarTrack: {
    height: 7,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  notaBarFill: { height: '100%', borderRadius: 4 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 12 },
  star: { fontSize: 18 },
  starOn: { color: '#F59E0B' },
  starOff: { color: '#2D2D44' },
  outOf: { color: '#64748B', fontSize: 12, marginLeft: 4 },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0D0D1A',
    borderRadius: 12,
    padding: 12,
  },
  cardStat: { alignItems: 'center' },
  cardStatValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  cardStatLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#2D2D44' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: '#64748B', fontSize: 16, textAlign: 'center' },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
    backgroundColor: '#1A1A2E',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  closeBtn: {
    backgroundColor: '#2D2D44',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
