import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ExamNodeInfo } from '../../domain/entities/Examen';

interface Props {
  info: ExamNodeInfo;
  index: number;
  onPress: () => void;
  isProfesor?: boolean;
  onDelete?: () => void;
}

function getStarsFilled(stars: number) {
  return ['★', '★', '★'].map((s, i) => (i < stars ? s : '☆')).join('');
}

export default function ExamNode({ info, index, onPress, isProfesor, onDelete }: Props) {
  const { examen, status, stars, bestNota } = info;
  const isRight = index % 2 === 0;

  const nodeColor = status === 'completed' ? '#10B981' : '#7C3AED';
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (status !== 'completed') {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, { toValue: 1.35, duration: 1600, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ringScale, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [status]);

  const qCount = examen.preguntas?.length ?? 0;
  const difficulty = qCount >= 15 ? { label: 'Difícil', color: '#EF4444' }
    : qCount >= 8 ? { label: 'Medio', color: '#F59E0B' }
    : { label: 'Fácil', color: '#10B981' };

  return (
    <View style={[styles.row, isRight ? styles.rowRight : styles.rowLeft]}>
      {/* Node */}
      <TouchableOpacity
        onPress={onPress}
        style={[styles.nodeWrapper, isRight ? styles.nodeRight : styles.nodeLeft]}
        activeOpacity={0.82}
      >
        {/* Anillo pulsante (solo en disponibles) */}
        {status !== 'completed' && (
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: nodeColor, transform: [{ scale: ringScale }], opacity: ringOpacity },
            ]}
          />
        )}

        <View style={[styles.nodeShadow, { shadowColor: nodeColor }]}>
          <View style={[styles.node, { backgroundColor: nodeColor }]}>
            {status === 'completed' ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : (
              <Text style={styles.nodeNumber}>{index + 1}</Text>
            )}
          </View>
        </View>

        {/* Card con info */}
        <View style={[styles.card, { borderColor: nodeColor + '55' }]}>
          <View style={styles.cardTop}>
            <Text style={styles.examLabel} numberOfLines={1}>Examen #{examen.id}</Text>
            <View style={[styles.diffBadge, { backgroundColor: difficulty.color + '22' }]}>
              <Text style={[styles.diffText, { color: difficulty.color }]}>{difficulty.label}</Text>
            </View>
          </View>

          {status === 'completed' ? (
            <View style={styles.starsRow}>
              <Text style={[styles.starsText, { color: '#F59E0B' }]}>{getStarsFilled(stars)}</Text>
              <View style={[styles.scorePill, { backgroundColor: '#F59E0B22' }]}>
                <Text style={styles.scoreText}>{bestNota.toFixed(1)}/10</Text>
              </View>
            </View>
          ) : (
            <View style={styles.availableRow}>
              <View style={[styles.availableDot, { backgroundColor: nodeColor }]} />
              <Text style={[styles.availableText, { color: nodeColor }]}>Disponible</Text>
            </View>
          )}

          <Text style={styles.questionCount}>{qCount} preguntas</Text>
        </View>

        {/* Botón eliminar */}
        {isProfesor && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  nodeWrapper: {
    alignItems: 'center',
    width: 150,
    zIndex: 1,
  },
  nodeRight: { marginRight: 20 },
  nodeLeft: { marginLeft: 20 },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    top: 0,
  },
  nodeShadow: {
    shadowOpacity: 0.75,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    marginBottom: 10,
  },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  checkmark: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '800',
  },
  nodeNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    width: 148,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  examLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', flex: 1 },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  diffText: { fontSize: 10, fontWeight: '700' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starsText: { fontSize: 14 },
  scorePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreText: { fontSize: 11, color: '#F59E0B', fontWeight: '700' },
  availableRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  availableDot: { width: 7, height: 7, borderRadius: 4 },
  availableText: { fontSize: 12, fontWeight: '600' },
  questionCount: { fontSize: 11, color: '#64748B' },
  deleteBtn: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
