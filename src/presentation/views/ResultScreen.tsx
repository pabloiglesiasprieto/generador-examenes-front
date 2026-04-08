import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<GameStackParamList, 'Result'>;

function getStars(nota: number): number {
  if (nota >= 9) return 3;
  if (nota >= 7) return 2;
  if (nota >= 5) return 1;
  return 0;
}

function getGrade(nota: number): { label: string; color: string; emoji: string } {
  if (nota >= 9) return { label: 'Excelente', color: '#10B981', emoji: '🏆' };
  if (nota >= 7) return { label: 'Muy bien', color: '#06B6D4', emoji: '🌟' };
  if (nota >= 5) return { label: 'Aprobado', color: '#F59E0B', emoji: '👍' };
  return { label: 'Suspenso', color: '#EF4444', emoji: '💪' };
}

export default function ResultScreen({ navigation, route }: Props) {
  const { resultado } = route.params;
  const stars = getStars(resultado.nota);
  const grade = getGrade(resultado.nota);

  const heroScale = useRef(new Animated.Value(0.7)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const pct = resultado.total_preguntas > 0
    ? resultado.preguntas_correctas / resultado.total_preguntas
    : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.timing(barWidth, { toValue: pct, duration: 900, delay: 300, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.hero, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}>
          <Text style={styles.heroEmoji}>{grade.emoji}</Text>
          <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={[styles.star, i <= stars ? styles.starFilled : styles.starEmpty]}>★</Text>
            ))}
          </View>

          <View style={[styles.scoreBadge, { borderColor: grade.color }]}>
            <Text style={[styles.scoreNumber, { color: grade.color }]}>{resultado.nota.toFixed(1)}</Text>
            <Text style={styles.scoreLabel}>/10</Text>
          </View>

          {/* Barra de aciertos */}
          <View style={styles.barContainer}>
            <View style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: grade.color,
                    width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>
              {resultado.preguntas_correctas}/{resultado.total_preguntas} correctas
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{resultado.preguntas_correctas}</Text>
              <Text style={styles.statLabel}>Correctas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                {resultado.total_preguntas - resultado.preguntas_correctas}
              </Text>
              <Text style={styles.statLabel}>Incorrectas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>#{resultado.intento}</Text>
              <Text style={styles.statLabel}>Intento</Text>
            </View>
            {resultado.tiempo_segundos != null && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.floor(resultado.tiempo_segundos / 60)}:{String(resultado.tiempo_segundos % 60).padStart(2, '0')}
                  </Text>
                  <Text style={styles.statLabel}>Tiempo</Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {resultado.detalle && resultado.detalle.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Detalle por pregunta</Text>
            {resultado.detalle.map((d, i) => (
              <View
                key={`detalle-${d.pregunta_id}-${i}`}
                style={[styles.detailCard, d.es_correcta ? styles.detailCorrect : styles.detailWrong]}
              >
                <View style={styles.detailHeader}>
                  <View style={styles.detailIndexBadge}>
                    <Text style={styles.detailIndex}>#{i + 1}</Text>
                  </View>
                  <View style={[
                    styles.resultBadge,
                    { backgroundColor: d.es_correcta ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' },
                  ]}>
                    <Text style={d.es_correcta ? styles.correctBadge : styles.wrongBadge}>
                      {d.es_correcta ? '✓ Correcta' : '✗ Incorrecta'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.detailEnunciado}>{d.enunciado}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
          <Text style={styles.btnSecondaryText}>🔁 Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.btnPrimaryText}>Volver al mapa 🗺️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  body: { padding: 24, paddingTop: 60 },
  hero: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
    marginBottom: 24,
  },
  heroEmoji: { fontSize: 60, marginBottom: 8 },
  gradeLabel: { fontSize: 26, fontWeight: '800', marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  star: { fontSize: 38 },
  starFilled: { color: '#F59E0B' },
  starEmpty: { color: '#2D2D44' },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginBottom: 20,
  },
  scoreNumber: { fontSize: 56, fontWeight: '800' },
  scoreLabel: { fontSize: 24, color: '#94A3B8', marginLeft: 4 },
  barContainer: { width: '100%', marginBottom: 20 },
  barTrack: {
    height: 10,
    backgroundColor: '#2D2D44',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: { height: '100%', borderRadius: 5 },
  barLabel: { color: '#94A3B8', fontSize: 12, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
    borderRadius: 16,
    padding: 16,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: '#2D2D44' },
  detailSection: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  detailCard: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  detailCorrect: { backgroundColor: 'rgba(16,185,129,0.08)', borderLeftColor: '#10B981' },
  detailWrong: { backgroundColor: 'rgba(239,68,68,0.08)', borderLeftColor: '#EF4444' },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIndexBadge: {
    backgroundColor: '#2D2D44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  detailIndex: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  correctBadge: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  wrongBadge: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  detailEnunciado: { color: '#FFFFFF', fontSize: 14, lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: '#0D0D1A',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  btnSecondaryText: { color: '#94A3B8', fontWeight: '700', fontSize: 15 },
  btnPrimary: {
    flex: 2,
    backgroundColor: '#7C3AED',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
