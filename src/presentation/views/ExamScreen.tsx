import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
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
import { IGetUsuarioByIdUseCase } from '../../domain/interfaces/useCases/usuarios/IUsuarioUseCase';
import { useAlert } from '../viewmodels/AlertContext';
import { HEADER_TOP } from '../utils/responsive';

type Props = NativeStackScreenProps<GameStackParamList, 'Exam'>;

/**
 * Botón de acción del pie de la pantalla de examen.
 * Renderiza un botón diferente según el modo (admin/alumno) y el estado de la sesión
 * (última pregunta o no, enviando o no).
 *
 * @param props.session - Estado de la sesión de examen.
 * @param props.isAdminMode - Indica si el examen se visualiza en modo administrador (solo lectura).
 * @param props.onSubmit - Callback invocado al pulsar el botón de envío de respuestas.
 * @param props.onClose - Callback invocado al pulsar el botón de siguiente/cerrar en modo admin.
 * @returns Botón de siguiente, enviar o cerrar según el contexto.
 */
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
  const isFirst = session.currentIndex === 0;

  const prevBtn = !isFirst && (
    <Pressable style={styles.btnPrev} onPress={session.goPrev}>
      <Text style={styles.btnPrevText}>← Anterior</Text>
    </Pressable>
  );

  if (isAdminMode) {
    return (
      <View style={styles.footerRow}>
        {prevBtn}
        <Pressable style={[styles.btn, styles.btnClose]} onPress={onClose}>
          <Text style={styles.btnText}>{session.isLast ? 'Cerrar' : 'Siguiente →'}</Text>
        </Pressable>
      </View>
    );
  }

  if (session.isLast) {
    return (
      <View style={styles.footerRow}>
        {prevBtn}
        <Pressable
          style={[styles.btn, styles.btnSubmit, session.submitting && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={session.submitting}
        >
          {session.submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Enviar examen 🚀</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.footerRow}>
      {prevBtn}
      <Pressable
        style={[styles.btn, !session.hasAnswered && styles.btnMuted]}
        onPress={session.goNext}
      >
        <Text style={styles.btnText}>Siguiente →</Text>
      </Pressable>
    </View>
  );
}

/**
 * Formatea un número de segundos en formato mm:ss con relleno de ceros.
 *
 * @param seconds - Número de segundos a formatear.
 * @returns Cadena en formato "mm:ss".
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Pantalla de realización de un examen.
 * Gestiona la navegación entre preguntas, la selección de respuestas, el temporizador
 * de cuenta regresiva (alumnos), el autoenvío al expirar el tiempo y los modales
 * de confirmación de salida y envío. En modo admin muestra las respuestas correctas.
 *
 * @param props.navigation - Objeto de navegación del stack de juego.
 * @param props.route - Parámetros de ruta con el examen a realizar y el modo de visualización.
 * @returns Vista de sesión de examen con preguntas, respuestas, temporizador y modales.
 */
export default function ExamScreen({ navigation, route }: Readonly<Props>) {
  const { examen, isAdminMode = false } = route.params;
  const { showAlert } = useAlert();
  const session = useExamSession(examen, isAdminMode);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [autorNombre, setAutorNombre] = useState<string | null>(null);

  const getUsuarioByIdUseCase = useMemo(
    () => container.get<IGetUsuarioByIdUseCase>(TYPES.IGetUsuarioByIdUseCase),
    [],
  );

  useEffect(() => {
    if (!isAdminMode || !examen.autor_id) return;
    getUsuarioByIdUseCase.execute(examen.autor_id).then((u) => {
      setAutorNombre(`${u.nombre_usuario} ${u.apellido_usuario}`);
    }).catch(() => {
      // El nombre del autor es informativo; si falla, no interrumpir la demo
    });
  }, [examen.autor_id, isAdminMode]);
  const [quitModalVisible, setQuitModalVisible] = useState(false);

  const iniciarExamenUseCase = useMemo(() => container.get<IIniciarExamenUseCase>(TYPES.IIniciarExamenUseCase), []);
  const autoSubmittedRef = useRef(false);

  // Registrar inicio en backend (solo para alumnos, para calcular tiempo_segundos)
  useEffect(() => {
    if (!isAdminMode) {
      iniciarExamenUseCase.execute(examen.id).catch(() => {
        showAlert('Error', 'No se pudo registrar el inicio del examen. El tiempo puede no calcularse correctamente.');
      });
    }
  }, [examen.id, isAdminMode]);

  // Auto-submit cuando expira el tiempo (solo una vez)
  useEffect(() => {
    if (session.isExpired && !session.isReadOnly && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      session.submitAnswers((resultado, examenId) => {
        navigation.replace('Result', { resultado: resultado as ResultadoDTO, examenId });
      });
    }
  }, [session.isExpired, session.isReadOnly, session.submitAnswers]);

  const handleQuit = () => {
    if (isAdminMode) {
      navigation.goBack();
    } else {
      setQuitModalVisible(true);
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
      showAlert('Atención', 'Selecciona al menos una respuesta');
      return;
    }
    setSubmitModalVisible(true);
  };

  const handleConfirmSubmit = () => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    setSubmitModalVisible(false);
    session.submitAnswers(handleSubmitSuccess);
  };

  return (
    <View style={styles.container}>
      {!session.currentPregunta && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Este examen no tiene preguntas</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Volver</Text>
          </Pressable>
        </View>
      )}
      {session.currentPregunta && (
        <>
          <View style={styles.header}>
            <Pressable onPress={handleQuit}>
              <Text style={styles.quitText}>{isAdminMode ? '← Volver' : '✕ Salir'}</Text>
            </Pressable>
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
            {isAdminMode && (
              <View style={styles.adminInfoBanner}>
                <Text style={styles.adminInfoItem}>
                  ✍️ <Text style={styles.adminInfoValue}>{autorNombre ?? `#${examen.autor_id}`}</Text>
                </Text>
                <View style={styles.adminInfoDivider} />
                <Text style={styles.adminInfoItem}>
                  📅 <Text style={styles.adminInfoValue}>
                    {new Date(examen.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </Text>
              </View>
            )}
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
                  <Pressable
                    key={`${session.currentIndex}-resp-${respId ?? i}`}
                    style={[
                      styles.answerCard,
                      !isAdminMode && selected && styles.answerCardSelected,
                      isCorrect && styles.answerCardCorrect,
                      isWrong && styles.answerCardWrong,
                    ]}
                    onPress={() => session.toggleAnswer(i)}
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
                  </Pressable>
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

      {/* Modal de confirmación de salida */}
      <Modal
        visible={quitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuitModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>Salir del examen</Text>
            <Text style={styles.modalMessage}>
              Perderás todo tu progreso.{'\n'}¿Estás seguro de que quieres salir?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setQuitModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Continuar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirmBtn, { backgroundColor: '#EF4444', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }]}
                onPress={() => { setQuitModalVisible(false); navigation.goBack(); }}
              >
                <Text style={styles.modalConfirmText}>Salir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setSubmitModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Revisar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirmBtn, session.submitting && styles.btnDisabled]}
                onPress={handleConfirmSubmit}
                disabled={session.submitting}
              >
                {session.submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Enviar</Text>
                )}
              </Pressable>
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
    paddingTop: HEADER_TOP,
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
  adminInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 12,
  },
  adminInfoItem: { color: '#94A3B8', fontSize: 13 },
  adminInfoValue: { color: '#93C5FD', fontWeight: '600' },
  adminInfoDivider: { width: 1, height: 16, backgroundColor: 'rgba(59,130,246,0.3)' },
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
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnPrev: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
btnPrevText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  btn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  btnMuted: { backgroundColor: '#2D2D44', boxShadow: 'none' },
  btnSubmit: { backgroundColor: '#10B981', boxShadow: '0 2px 8px rgba(16,185,129,0.5)' },
  btnClose: { backgroundColor: '#3B82F6', boxShadow: '0 2px 8px rgba(59,130,246,0.5)' },
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
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
    boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
  },
  modalConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
