import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { ExamNodeInfo } from '../../domain/entities/Examen';

/**
 * Props del componente {@link ExamNode}.
 */
interface Props {
  /** Información enriquecida del examen: datos, estado, estrellas y mejor nota. */
  info: ExamNodeInfo;
  /** Índice del nodo en la lista, usado para la posición alternada izquierda/derecha. */
  index: number;
  /** Callback invocado al pulsar el nodo del examen. */
  onPress: () => void;
  /** Indica si el usuario actual es profesor o administrador, para mostrar el botón de eliminar. */
  isProfesor?: boolean;
  /** Callback opcional invocado al pulsar el botón de eliminar (solo visible si es profesor). */
  onDelete?: () => void;
}

/**
 * Genera una representación visual de estrellas rellenas y vacías.
 *
 * @param stars - Número de estrellas rellenas (0-3).
 * @returns Cadena de texto con los símbolos de estrellas.
 */
function getStarsFilled(stars: number) {
  return ['★', '★', '★'].map((s, i) => (i < stars ? s : '☆')).join('');
}

/**
 * Calcula la etiqueta y el color de dificultad según el número de preguntas del examen.
 *
 * @param qCount - Número total de preguntas del examen.
 * @returns Objeto con la etiqueta y el color correspondientes a la dificultad.
 */
function getDifficulty(qCount: number) {
  if (qCount >= 30) return { label: 'Difícil', color: '#EF4444' };
  if (qCount >= 20) return { label: 'Medio', color: '#F59E0B' };
  return { label: 'Fácil', color: '#10B981' };
}

/**
 * Determina el color del nodo según su estado y si el alumno lo suspendió.
 *
 * @param status - Estado del nodo: 'available' o 'completed'.
 * @param isFailed - Indica si el alumno suspendió el examen (nota < 5).
 * @returns Color hexadecimal del nodo.
 */
function getNodeColor(status: string, isFailed: boolean) {
  if (status !== 'completed') return '#7C3AED';
  return isFailed ? '#EF4444' : '#10B981';
}

/**
 * Props del subcomponente {@link CardStatus}.
 */
interface CardStatusProps {
  /** Indica si el alumno suspendió el examen. */
  isFailed: boolean;
  /** Número de estrellas obtenidas (0-3). */
  stars: number;
  /** Mejor nota obtenida en el examen. */
  bestNota: number;
  /** Color del nodo según el estado del examen. */
  nodeColor: string;
}

/**
 * Muestra el estado de la tarjeta de un examen completado:
 * estrellas y nota si fue aprobado, o etiqueta "Suspenso" con la nota si fue suspendido.
 *
 * @param props - Props del subcomponente.
 * @returns El componente de estado de la tarjeta.
 */
function CardStatus({ isFailed, stars, bestNota, nodeColor }: Readonly<CardStatusProps>) {
  if (isFailed) {
    return (
      <View style={styles.starsRow}>
        <Text style={styles.failedLabel}>Suspenso</Text>
        <View style={[styles.scorePill, { backgroundColor: '#EF444422' }]}>
          <Text style={[styles.scoreText, styles.scoreTextFailed]}>{bestNota.toFixed(1)}/10</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.starsRow}>
      <Text style={[styles.starsText, { color: '#F59E0B' }]}>{getStarsFilled(stars)}</Text>
      <View style={[styles.scorePill, { backgroundColor: '#F59E0B22' }]}>
        <Text style={styles.scoreText}>{bestNota.toFixed(1)}/10</Text>
      </View>
    </View>
  );
}

/**
 * Muestra el indicador de estado "Disponible" para los nodos de examen no completados.
 *
 * @param props - Props del subcomponente.
 * @param props.nodeColor - Color del punto e indicador textual.
 * @returns El componente de estado disponible.
 */
function AvailableStatus({ nodeColor }: Readonly<{ nodeColor: string }>) {
  return (
    <View style={styles.availableRow}>
      <View style={[styles.availableDot, { backgroundColor: nodeColor }]} />
      <Text style={[styles.availableText, { color: nodeColor }]}>Disponible</Text>
    </View>
  );
}

/**
 * Componente de nodo de examen para el mapa de juego.
 * Muestra la información del examen con animaciones pulsantes para los disponibles,
 * indicador de dificultad y estado (aprobado, suspenso o disponible).
 *
 * @param props - Props del componente.
 * @param props.info - Información enriquecida del examen.
 * @param props.index - Índice del nodo para la disposición alternada.
 * @param props.onPress - Callback al pulsar el nodo.
 * @param props.isProfesor - Muestra el botón de eliminar si es true.
 * @param props.onDelete - Callback al pulsar el botón de eliminar.
 * @returns El componente de nodo de examen.
 */
export default function ExamNode({ info, index, onPress, isProfesor, onDelete }: Readonly<Props>) {
  const { examen, status, stars, bestNota } = info;
  const isRight = index % 2 === 0;

  const isFailed = status === 'completed' && bestNota < 5;
  const nodeColor = getNodeColor(status, isFailed);
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
  const difficulty = getDifficulty(qCount);

  return (
    <View style={[styles.row, isRight ? styles.rowRight : styles.rowLeft]}>
      <Pressable
        onPress={onPress}
        style={[styles.nodeWrapper, isRight ? styles.nodeRight : styles.nodeLeft]}
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

        <View style={[styles.nodeShadow, { boxShadow: '0 2px 8px rgba(0,0,0,0.75)' }]}>
          <View style={[styles.node, { backgroundColor: nodeColor }]}>
            {status === 'completed' ? (
              <Text style={styles.checkmark}>{isFailed ? '✕' : '✓'}</Text>
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
            <CardStatus isFailed={isFailed} stars={stars} bestNota={bestNota} nodeColor={nodeColor} />
          ) : (
            <AvailableStatus nodeColor={nodeColor} />
          )}

          <View style={styles.metaRow}>
            <Text style={styles.questionCount}>{qCount} preguntas</Text>
            {examen.duracion_minutos && (
              <Text style={styles.timerBadge}>⏱ {examen.duracion_minutos} min</Text>
            )}
          </View>
        </View>

        {/* Botón eliminar */}
        {isProfesor && onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </Pressable>
        )}
      </Pressable>
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
  failedLabel: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  scorePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreText: { fontSize: 11, color: '#F59E0B', fontWeight: '700' },
  scoreTextFailed: { color: '#EF4444' },
  availableRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  availableDot: { width: 7, height: 7, borderRadius: 4 },
  availableText: { fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionCount: { fontSize: 11, color: '#64748B' },
  timerBadge: { fontSize: 10, color: '#7C3AED', fontWeight: '700' },
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
