import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../viewmodels/AuthContext';
import { useLoginForm } from '../viewmodels/useLoginForm';
import { useForgotPassword } from '../viewmodels/useForgotPassword';
import { PasswordInput } from '../components/PasswordInput';
import { ErrorBox } from '../components/ErrorBox';
import { LoadingButton } from '../components/LoadingButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

function useLoginAnimations() {
  const orb1X = useRef(new Animated.Value(0)).current;
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2X = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1X, { toValue: 18, duration: 3200, useNativeDriver: true }),
          Animated.timing(orb1Y, { toValue: 24, duration: 3200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orb1X, { toValue: -10, duration: 2800, useNativeDriver: true }),
          Animated.timing(orb1Y, { toValue: -16, duration: 2800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orb1X, { toValue: 0, duration: 3000, useNativeDriver: true }),
          Animated.timing(orb1Y, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb2X, { toValue: -20, duration: 3600, useNativeDriver: true }),
          Animated.timing(orb2Y, { toValue: -28, duration: 3600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orb2X, { toValue: 14, duration: 3000, useNativeDriver: true }),
          Animated.timing(orb2Y, { toValue: 18, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(orb2X, { toValue: 0, duration: 3200, useNativeDriver: true }),
          Animated.timing(orb2Y, { toValue: 0, duration: 3200, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return { orb1X, orb1Y, orb2X, orb2Y, pulse, fadeIn };
}

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const login = useLoginForm(signIn);
  const forgot = useForgotPassword();
  const { orb1X, orb1Y, orb2X, orb2Y, pulse, fadeIn } = useLoginAnimations();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View
        style={[styles.orb, styles.orb1, { transform: [{ translateX: orb1X }, { translateY: orb1Y }] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.orb, styles.orb2, { transform: [{ translateX: orb2X }, { translateY: orb2Y }] }]}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.header, { opacity: fadeIn }]}>
          <View style={styles.logoWrapper}>
            <Animated.View style={[styles.logoPulseRing, { transform: [{ scale: pulse }] }]} />
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
          </View>
          <Text style={styles.title}>ExamQuest</Text>
          <Text style={styles.subtitle}>Aprende jugando</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeIn }]}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor="#555"
              value={login.correo}
              onChangeText={login.setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <PasswordInput
              value={login.password}
              onChangeText={login.setPassword}
              show={login.showPassword}
              onToggleShow={login.toggleShowPassword}
            />
          </View>

          <ErrorBox message={login.error} />

          <LoadingButton
            onPress={login.handleLogin}
            loading={login.loading}
            label="Entrar"
          />
        </Animated.View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.registerTextBold}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={forgot.open} style={styles.forgotLink}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={forgot.show}
        transparent
        animationType="fade"
        onRequestClose={forgot.close}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar contraseña</Text>

            {forgot.step === 1 ? (
              <>
                <Text style={styles.modalSub}>Introduce tu correo electrónico</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="tu@correo.com"
                  placeholderTextColor="#555"
                  value={forgot.correo}
                  onChangeText={forgot.setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {forgot.error ? <Text style={styles.errorText}>{forgot.error}</Text> : null}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={forgot.close}>
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalConfirmBtn} onPress={forgot.goNext}>
                    <Text style={styles.modalConfirmText}>Siguiente</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalSub}>Nueva contraseña para {forgot.correo}</Text>
                <PasswordInput
                  value={forgot.password}
                  onChangeText={forgot.setPassword}
                  show={forgot.showPassword}
                  onToggleShow={forgot.toggleShowPassword}
                  inputStyle={styles.modalInputBase}
                />
                <View style={{ marginTop: 12 }}>
                  <PasswordInput
                    value={forgot.confirm}
                    onChangeText={forgot.setConfirm}
                    placeholder="Confirmar contraseña"
                    show={forgot.showConfirm}
                    onToggleShow={forgot.toggleShowConfirm}
                    inputStyle={styles.modalInputBase}
                  />
                </View>
                {forgot.error ? <Text style={styles.errorText}>{forgot.error}</Text> : null}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={forgot.goBack}>
                    <Text style={styles.modalCancelText}>Atrás</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, forgot.loading && { opacity: 0.6 }]}
                    onPress={() => void forgot.submit()}
                    disabled={forgot.loading}
                  >
                    {forgot.loading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.modalConfirmText}>Guardar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0D0D1A' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  orb1: { width: 320, height: 320, backgroundColor: '#7C3AED', top: -100, left: -100 },
  orb2: { width: 260, height: 260, backgroundColor: '#06B6D4', bottom: -80, right: -80 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoWrapper: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoPulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#7C3AED',
    opacity: 0.5,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1A1A2E',
    borderWidth: 3,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 14,
  },
  logoEmoji: { fontSize: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 15, color: '#94A3B8', marginTop: 4 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#94A3B8', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#0D0D1A',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
  },
  modalInputBase: {
    backgroundColor: '#0D0D1A',
  },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { color: '#94A3B8', fontSize: 14 },
  registerTextBold: { color: '#7C3AED', fontWeight: '700' },
  forgotLink: { marginTop: 12, alignItems: 'center' },
  forgotText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#0D0D1A',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 8 },
});
