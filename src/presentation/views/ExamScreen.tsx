import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/AppNavigator';
import { useExamSession } from '../viewmodels/useExamSession';
import { ResultadoDTO } from '../../domain/entities/Examen';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IIniciarExamenUseCase } from '../../domain/interfaces/useCases/examenes/IExamenUseCase';

type Props = NativeStackScreenProps<GameStackParamList, 'Exam'>;

function confirmQuit(onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm('Perderás tu progreso. ¿Salir?')) onConfirm();
  } else {
    Alert.alert('Salir del examen', 'Perderás tu progreso. ¿Salir?', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

function ExamFooterButton({
  session,
  isAdminMode,
  onSubmit,
  onClose,
}: Readonly<{
  session: ReturnType<typeof useExamSession>;
  isAdminMode: boolean;
  onSubmit: () => void;
  onClose: () => void;
}>) {
  if (isAdminMode) {
    return (
      <TouchableOpacity style={[styles.btn, styles.btnClose]} onPress={onClose}>
        <Text style={styles.btnText}>{session.isLast ? 'Cerrar' : 'Siguiente →'}</Text>
      </TouchableOpacity>
    );
  }

  if (session.isLast) {
    return (
      <TouchableOpacity
        style={[styles.btn, styles.btnSubmit, session.submitting && styles.btnDisabled]}
        onPress={onSubmit}
        disabled={session.submitting}
      >
        {session.submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Enviar examen 🚀</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.btn, !session.hasAnswered && styles.btnMuted]}
      onPress={session.goNext}
    >
      <Text style={styles.btnText}>Siguiente →</Text>
    </TouchableOpacity>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ExamScreen({ navigation, route }: Readonly<Props>) {
  const { examen, isAdminMode = false } = route.params;
  const session = useExamSession(examen, isAdminMode);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const iniciarExamenUseCase = container.get<IIniciarExamenUseCase>(TYPES.IIniciarExamenUseCase);

  // Registrar inicio en backend (solo para alumnos, para calcular tiempo_segundos)
  useEffect(() => {
    if (!isAdminMode) {
      iniciarExamenUseCase.execute(examen.id).catch(() => {});
    }
  }, [examen.id, isAdminMode]);

  // Auto-submit cuando expira el tiempo
  useEffect(() => {
    if (session.isExpired && !session.isReadOnly) {
      session.submitAnswers((resultado, examenId) => {
        navigation.replace('Result', { resultado: resultado as ResultadoDTO, examenId });
      });
    }
  }, [session.isExpired, session.isReadOnly, session.submitAnswers]);

  const handleQuit = () => {
    if (isAdminMode) {
      navigation.goBack();
    } else {
      confirmQuit(() => navigation.goBack());
    }
  };

  const handleAdminNext = () => {
    if (!session.isLast) session.goNext();
    else navigation.goBack();
  };

  const handleSubmitSuccess = (resultado: unknown, examenId: number) => {
    navigation.replace('Result', { resultado: resultado as ResultadoDTO, examenId });
  };

  const handleSubmitPress = () => {
    if (!session.hasAnswered) {
      Alert.alert('Atención', 'Selecciona al menos una respuesta');
      return;
    }
    setSubmitModalVisible(true);
  };

  const handleConfirmSubmit = () => {
    setSubmitModalVisible(false);
    session.submitAnswers(handleSubmitSuccess);
  };

  return (
    <View style={styles.container}>
      {!session.currentPregunta && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Este examen no tiene preguntas</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}
      {session.currentPregunta && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleQuit}>
              <Text style={styles.quitText}>{isAdminMode ? '← Volver' : '✕ Salir'}</Text>
            </TouchableOpacity>
            <Text style={styles.counter}>
              {session.currentIndex + 1} / {session.totalPreguntas}
            </Text>
            {isAdminMode ? (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>👁 Vista admin</Text>
              </View>
            ) : session.timeRemaining != null ? (
              <Text style={[styles.timerText, session.timeRemaining < 60 && styles.timerWarning]}>
                ⏱ {formatTime(session.timeRemaining)}
              </Text>
            ) : (
              <View style={{ width: 80 }} />
            )}
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${session.progress * 100}%` }]} />
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.questionCard}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>
                  {session.currentPregunta.es_multiple ? '✔ Múltiple' : '◉ Una respuesta'}
                </Text>
              </View>
              <Text style={styles.questionText}>{session.currentPregunta.enunciado}</Text>
            </View>

            <View style={styles.answersContainer}>
              {session.currentPregunta.respuestas.map((resp, i) => {
                const selected = session.currentSelected.has(i);
                const respId = resp.respuesta_id ?? resp.id;
                const isCorrect = isAdminMode && respId != null && (session.currentPregunta.respuestas_correctas?.includes(respId) ?? false);
                const isWrong = isAdminMode && respId != null && !(session.currentPregunta.respuestas_correctas?.includes(respId) ?? false);

                return (
                  <TouchableOpacity
                    key={`${session.currentIndex}-resp-${i}`}
                    style={[
                      styles.answerCard,
                      !isAdminMode && selected && styles.answerCardSelected,
                      isCorrect && styles.answerCardCorrect,
                      isWrong && styles.answerCardWrong,
                    ]}
                    onPress={() => session.toggleAnswer(i)}
                    activeOpacity={isAdminMode ? 1 : 0.75}
                  >
                    <View
                      style={[
                        styles.answerIndicator,
                        !isAdminMode && selected && styles.answerIndicatorSelected,
                        isCorrect && styles.answerIndicatorCorrect,
                        isWrong && styles.answerIndicatorWrong,
                      ]}
                    >
                      {isCorrect && <Text style={styles.indicatorCheck}>✓</Text>}
                      {isWrong && <Text style={styles.indicatorCheck}>✗</Text>}
                      {!isAdminMode && selected && <Text style={styles.indicatorCheck}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.answerText,
                        !isAdminMode && selected && styles.answerTextSelected,
                        isCorrect && styles.answerTextCorrect,
                        isWrong && styles.answerTextWrong,
                      ]}
                    >
                      {resp.texto}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <ExamFooterButton
              session={session}
              isAdminMode={isAdminMode}
              onSubmit={handleSubmitPress}
              onClose={handleAdminNext}
            />
          </View>
        </>
      )}

      {/* Modal de confirmación de envío */}
      <Modal
        visible={submitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubmitModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>🚀</Text>
            </View>
            <Text style={styles.modalTitle}>Enviar examen</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres enviar tus respuestas?{'\n'}
              Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSubmitModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Revisar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, session.submitting && styles.btnDisabled]}
                onPress={handleConfirmSubmit}
                disabled={session.submitting}
              >
                {session.submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Enviar</Text>
                )}
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
  errorText: { color: '#94A3B8', fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  quitText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  counter: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  timerText: { color: '#94A3B8', fontSize: 14, fontWeight: '700', minWidth: 60, textAlign: 'right' },
  timerWarning: { color: '#EF4444' },
  adminBadge: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  adminBadgeText: { color: '#93C5FD', fontSize: 12, fontWeight: '700' },
  progressTrack: {
    height: 6,
    backgroundColor: '#2D2D44',
    marginHorizontal: 20,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 3 },
  body: { padding: 20, paddingBottom: 40 },
  questionCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D44',
    marginBottom: 24,
  },
  questionBadge: {
    backgroundColor: '#2D2D44',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  questionBadgeText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  questionText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', lineHeight: 26 },
  answersContainer: { gap: 12 },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2D2D44',
    gap: 14,
  },
  answerCardSelected: { borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.12)' },
  answerCardCorrect: { borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.12)' },
  answerCardWrong: { borderColor: '#374151', backgroundColor: '#1A1A2E' },
  answerIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerIndicatorSelected: { borderColor: '#7C3AED', backgroundColor: '#7C3AED' },
  answerIndicatorCorrect: { borderColor: '#10B981', backgroundColor: '#10B981' },
  answerIndicatorWrong: { borderColor: '#374151', backgroundColor: 'transparent' },
  indicatorCheck: { color: '#fff', fontSize: 13, fontWeight: '700' },
  answerText: { color: '#94A3B8', fontSize: 15, flex: 1, lineHeight: 22 },
  answerTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  answerTextCorrect: { color: '#10B981', fontWeight: '600' },
  answerTextWrong: { color: '#4B5563', fontWeight: '400' },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, backgroundColor: '#0D0D1A' },
  btn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnMuted: { backgroundColor: '#2D2D44', shadowOpacity: 0 },
  btnSubmit: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  btnClose: { backgroundColor: '#3B82F6', shadowColor: '#3B82F6' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backBtn: {
    marginTop: 16,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: { color: '#7C3AED', fontWeight: '700' },
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
    backgroundColor: 'rgba(16,185,129,0.15)',
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
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2D2D44',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modalConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
