import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/AppNavigator';
import { useExamSession } from '../viewmodels/useExamSession';
import { ResultadoDTO } from '../../domain/entities/Examen';

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
  onSubmit,
  onClose,
}: Readonly<{
  session: ReturnType<typeof useExamSession>;
  onSubmit: () => void;
  onClose: () => void;
}>) {
  const showClose = session.isReadOnly && session.isLast;
  const showReadOnlyNext = session.isReadOnly && !session.isLast;
  const showSubmit = !session.isReadOnly && session.isLast;
  const showNext = !session.isReadOnly && !session.isLast;

  return (
    <>
      {showClose && (
        <TouchableOpacity style={[styles.btn, styles.btnSubmit]} onPress={onClose}>
          <Text style={styles.btnText}>Cerrar</Text>
        </TouchableOpacity>
      )}
      {showReadOnlyNext && (
        <TouchableOpacity style={styles.btn} onPress={session.goNext}>
          <Text style={styles.btnText}>Siguiente →</Text>
        </TouchableOpacity>
      )}
      {showSubmit && (
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
      )}
      {showNext && (
        <TouchableOpacity
          style={[styles.btn, !session.hasAnswered && styles.btnMuted]}
          onPress={session.goNext}
        >
          <Text style={styles.btnText}>Siguiente →</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

export default function ExamScreen({ navigation, route }: Readonly<Props>) {
  const { examen } = route.params;
  const session = useExamSession(examen);

  const handleQuit = () => confirmQuit(() => navigation.goBack());

  const handleSubmitSuccess = (resultado: unknown, examenId: number) => {
    navigation.replace('Result', { resultado: resultado as ResultadoDTO, examenId });
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
              <Text style={styles.quitText}>✕ Salir</Text>
            </TouchableOpacity>
            <Text style={styles.counter}>
              {session.currentIndex + 1} / {session.totalPreguntas}
            </Text>
            <View style={{ width: 60 }} />
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
                return (
                  <TouchableOpacity
                    key={`${session.currentIndex}-resp-${i}`}
                    style={[styles.answerCard, selected && styles.answerCardSelected]}
                    onPress={() => session.toggleAnswer(i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.answerIndicator, selected && styles.answerIndicatorSelected]}>
                      {selected && <Text style={styles.indicatorCheck}>✓</Text>}
                    </View>
                    <Text style={[styles.answerText, selected && styles.answerTextSelected]}>
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
              onSubmit={() => session.confirmSubmit(handleSubmitSuccess)}
              onClose={() => navigation.goBack()}
            />
          </View>
        </>
      )}
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
  indicatorCheck: { color: '#fff', fontSize: 13, fontWeight: '700' },
  answerText: { color: '#94A3B8', fontSize: 15, flex: 1, lineHeight: 22 },
  answerTextSelected: { color: '#FFFFFF', fontWeight: '600' },
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
});
