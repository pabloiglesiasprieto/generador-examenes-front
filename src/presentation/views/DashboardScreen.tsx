import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../navigation/AppNavigator';
import { useDashboardScreen, AlumnoRankingItem } from '../viewmodels/useDashboardScreen';
import { EstadisticaExamenDTO, EstadisticaPreguntaDTO } from '../../domain/entities/Estadistica';
import { HEADER_TOP } from '../utils/responsive';

type Props = NativeStackScreenProps<AdminStackParamList, 'Dashboard'>;

/**
 * Devuelve el color de la barra de progreso según la nota media.
 *
 * @param nota - Nota media o null si no hay datos.
 * @returns Color hexadecimal: verde para nota >=7, ámbar para >=5, rojo para <5 y gris para null.
 */
function getBarColor(nota: number | null): string {
  if (nota == null) return '#2D2D44';
  if (nota >= 7) return '#10B981';
  if (nota >= 5) return '#F59E0B';
  return '#EF4444';
}

/**
 * Tarjeta de estadísticas de un examen con barra de nota media y acceso al historial.
 *
 * @param props.item - Datos estadísticos del examen.
 * @param props.onVerResultados - Callback invocado al pulsar el enlace de historial de resultados.
 * @returns Tarjeta con nota media, barra de progreso, totales y enlace al detalle.
 */
function ExamenStatCard({
  item,
  onVerResultados,
}: Readonly<{ item: EstadisticaExamenDTO; onVerResultados: () => void }>) {
  const media = item.nota_media ?? 0;
  const barColor = getBarColor(media);
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>Examen #{item.examen_id}</Text>
        <View style={[styles.scorePill, { backgroundColor: barColor + '33' }]}>
          <Text style={[styles.scorePillText, { color: barColor }]}>
            {media.toFixed(1)}/10
          </Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${(media / 10) * 100}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Intentos: <Text style={styles.statValue}>{item.total_intentos}</Text></Text>
        <Text style={styles.statLabel}>Alumnos: <Text style={styles.statValue}>{item.total_alumnos}</Text></Text>
        {item.nota_maxima != null && (
          <Text style={styles.statLabel}>Máx: <Text style={[styles.statValue, { color: '#10B981' }]}>{item.nota_maxima.toFixed(1)}</Text></Text>
        )}
        {item.nota_minima != null && (
          <Text style={styles.statLabel}>Mín: <Text style={[styles.statValue, { color: '#EF4444' }]}>{item.nota_minima.toFixed(1)}</Text></Text>
        )}
      </View>
      <Pressable style={styles.verResultadosBtn} onPress={onVerResultados}>
        <Text style={styles.verResultadosText}>Ver historial de resultados →</Text>
      </Pressable>
    </View>
  );
}

/**
 * Tarjeta de ranking de un alumno con medalla de posición y nota media.
 *
 * @param props.item - Datos del alumno en el ranking.
 * @param props.position - Posición del alumno en el ranking (1-N).
 * @returns Fila de ranking con medalla, nombre, número de exámenes y nota media.
 */
function AlumnoRankCard({ item, position }: Readonly<{ item: AlumnoRankingItem; position: number }>) {
  const media = item.nota_media ?? 0;
  const medalColor = position === 1 ? '#F59E0B' : position === 2 ? '#94A3B8' : position === 3 ? '#CD7F32' : '#2D2D44';
  return (
    <View style={styles.rankCard}>
      <View style={[styles.rankBadge, { backgroundColor: medalColor + '33', borderColor: medalColor }]}>
        <Text style={[styles.rankPos, { color: medalColor }]}>{position}</Text>
      </View>
      <View style={styles.rankInfo}>
        <Text style={styles.rankUserId}>#{item.usuario_id} · {item.nombre_usuario}</Text>
        <Text style={styles.rankExamenes}>{item.examenes_realizados} examen(es)</Text>
      </View>
      <View style={[styles.scorePill, { backgroundColor: getBarColor(media) + '33' }]}>
        <Text style={[styles.scorePillText, { color: getBarColor(media) }]}>
          {media.toFixed(1)}/10
        </Text>
      </View>
    </View>
  );
}

/**
 * Tarjeta de estadística de una pregunta con tasa de fallo y barra de porcentaje.
 *
 * @param props.item - Datos estadísticos de la pregunta.
 * @param props.position - Posición en el ranking de preguntas más falladas (1-N).
 * @returns Tarjeta con enunciado, tasa de fallo coloreada, barra de progreso y contadores.
 */
function PreguntaFalloCard({ item, position }: Readonly<{ item: EstadisticaPreguntaDTO; position: number }>) {
  const tasa = item.tasa_fallo ?? 0;
  const barColor = tasa >= 70 ? '#EF4444' : tasa >= 40 ? '#F59E0B' : '#10B981';
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle} numberOfLines={2}>
          {position}. {item.enunciado}
        </Text>
        <View style={[styles.scorePill, { backgroundColor: barColor + '33' }]}>
          <Text style={[styles.scorePillText, { color: barColor }]}>{tasa.toFixed(0)}% fallo</Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${tasa}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>
          Intentos: <Text style={styles.statValue}>{item.total_respuestas}</Text>
        </Text>
        <Text style={styles.statLabel}>
          Correctas: <Text style={[styles.statValue, { color: '#10B981' }]}>{item.respuestas_correctas}</Text>
        </Text>
      </View>
    </View>
  );
}

/**
 * Pantalla de estadísticas del sistema para administradores y profesores.
 * Muestra notas por examen, las preguntas más falladas y el ranking de alumnos.
 *
 * @param props.navigation - Objeto de navegación del stack de administración.
 * @returns Vista scrollable con secciones de estadísticas o indicadores de carga y error.
 */
export default function DashboardScreen({ navigation }: Props) {
  const { estadisticasExamenes, rankingAlumnos, estadisticasPreguntas, loading, error, reload } = useDashboardScreen();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando estadísticas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={reload}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      <View style={styles.pageHeader}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </Pressable>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.pageSubtitle}>Estadísticas del sistema</Text>
      </View>

      {/* Notas por examen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Notas por Examen</Text>
        {estadisticasExamenes.length === 0 ? (
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        ) : (
          estadisticasExamenes.map((item) => (
            <ExamenStatCard
              key={item.examen_id}
              item={item}
              onVerResultados={() => navigation.navigate('ExamResults', { examenId: item.examen_id })}
            />
          ))
        )}
      </View>

      {/* Preguntas más falladas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❌ Preguntas Más Falladas</Text>
        {estadisticasPreguntas.length === 0 ? (
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        ) : (
          estadisticasPreguntas.slice(0, 10).map((item, idx) => (
            <PreguntaFalloCard key={item.pregunta_id} item={item} position={idx + 1} />
          ))
        )}
      </View>

      {/* Ranking alumnos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Ranking de Alumnos</Text>
        {rankingAlumnos.length === 0 ? (
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        ) : (
          rankingAlumnos.map((item, idx) => (
            <AlumnoRankCard key={item.usuario_id} item={item} position={idx + 1} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  body: { padding: 20, paddingTop: HEADER_TOP, paddingBottom: 40, gap: 24 },
  center: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14 },
  errorText: { color: '#EF4444', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700' },
  pageHeader: { marginBottom: 8 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: '#7C3AED', fontSize: 15, fontWeight: '700' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  emptyText: { color: '#64748B', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  statCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
    gap: 10,
  },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  statCardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  barTrack: { height: 6, backgroundColor: '#2D2D44', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  statRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  statLabel: { fontSize: 12, color: '#64748B' },
  statValue: { color: '#FFFFFF', fontWeight: '600' },
  scorePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  scorePillText: { fontSize: 12, fontWeight: '700' },
  verResultadosBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7C3AED44',
    alignSelf: 'flex-start',
  },
  verResultadosText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2D2D44',
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankPos: { fontSize: 14, fontWeight: '800' },
  rankInfo: { flex: 1 },
  rankUserId: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  rankExamenes: { color: '#64748B', fontSize: 12, marginTop: 2 },
});
