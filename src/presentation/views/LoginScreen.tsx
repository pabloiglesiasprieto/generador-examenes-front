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

const isWeb = Platform.OS === 'web';

/**
 * Hook de animaciones de entrada escalonada de la pantalla de login.
 *
 * @returns Array de valores animados de opacidad y traslación vertical.
 */
function useLoginAnimations() {
  const items = Array.from({ length: 5 }, () => ({
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(16)).current,
  }));

  useEffect(() => {
    const anims = items.map(({ opacity, translateY }) =>
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]),
    );
    Animated.stagger(90, anims).start();
  }, []);

  return items;
}

/**
 * Pantalla de inicio de sesión.
 * En móvil ocupa toda la pantalla con scroll vertical.
 * En web/PC aparece como una tarjeta compacta centrada sobre el fondo oscuro.
 *
 * @param props.navigation - Objeto de navegación del stack de autenticación.
 * @returns Vista de login con animaciones y modal de recuperación de contraseña.
 */
export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const login = useLoginForm(signIn);
  const forgot = useForgotPassword();
  const items = useLoginAnimations();

  const anim = (i: number, children: React.ReactNode) => (
    <Animated.View style={{ opacity: items[i].opacity, transform: [{ translateY: items[i].translateY }] }}>
      {children}
    </Animated.View>
  );

  const content = (
    <>
      {/* Logo */}
      {anim(0, (
        <View style={styles.logoSection}>
          <View style={styles.logoRing}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
          </View>
          <Text style={styles.appName}>ExamQuest</Text>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>Aprende jugando</Text>
          </View>
        </View>
      ))}

      {/* Card formulario */}
      {anim(1, (
        <View style={styles.card}>
          <View style={styles.cardAccentBar} />
          <Text style={styles.cardTitle}>Iniciar sesión</Text>

          {anim(2, (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor="#475569"
                value={login.correo}
                onChangeText={login.setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          {anim(3, (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <PasswordInput
                value={login.password}
                onChangeText={login.setPassword}
                show={login.showPassword}
                onToggleShow={login.toggleShowPassword}
              />
            </View>
          ))}

          <ErrorBox message={login.error} />

          {anim(4, (
            <>
              <LoadingButton
                onPress={login.handleLogin}
                loading={login.loading}
                label="Entrar"
                style={styles.loginBtn}
              />
              <TouchableOpacity onPress={forgot.open} style={styles.forgotRow}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </>
          ))}
        </View>
      ))}

      {anim(4, (
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const modal = (
    <Modal visible={forgot.show} transparent animationType="fade" onRequestClose={forgot.close}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalCard, isWeb && styles.modalCardWeb]}>
          <View style={styles.cardAccentBar} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Recuperar contraseña</Text>
            <TouchableOpacity onPress={forgot.close} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {forgot.step === 1 && (
            <>
              <Text style={styles.modalSub}>
                Introduce tu correo y te enviaremos un código de verificación
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu@correo.com"
                  placeholderTextColor="#475569"
                  value={forgot.correo}
                  onChangeText={forgot.setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {forgot.error ? <Text style={styles.errorText}>{forgot.error}</Text> : null}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={forgot.close}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, forgot.loading && { opacity: 0.6 }]}
                  onPress={() => void forgot.requestCode()}
                  disabled={forgot.loading}
                >
                  {forgot.loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.confirmBtnText}>Enviar código</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          {forgot.step === 2 && (
            <>
              <Text style={styles.modalSub}>
                Código enviado a{' '}
                <Text style={{ color: '#7C3AED', fontWeight: '700' }}>{forgot.correo}</Text>
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Código de verificación</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor="#475569"
                  value={forgot.codigo}
                  onChangeText={forgot.setCodigo}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              {forgot.error ? <Text style={styles.errorText}>{forgot.error}</Text> : null}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={forgot.goBack}>
                  <Text style={styles.cancelBtnText}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={forgot.goToNewPassword}>
                  <Text style={styles.confirmBtnText}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {forgot.step === 3 && (
            <>
              <Text style={styles.modalSub}>Establece tu nueva contraseña</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva contraseña</Text>
                <PasswordInput
                  value={forgot.password}
                  onChangeText={forgot.setPassword}
                  show={forgot.showPassword}
                  onToggleShow={forgot.toggleShowPassword}
                  inputStyle={styles.modalPasswordInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <PasswordInput
                  value={forgot.confirm}
                  onChangeText={forgot.setConfirm}
                  placeholder="Repite la contraseña"
                  show={forgot.showConfirm}
                  onToggleShow={forgot.toggleShowConfirm}
                  inputStyle={styles.modalPasswordInput}
                />
              </View>
              {forgot.error ? <Text style={styles.errorText}>{forgot.error}</Text> : null}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={forgot.goBack}>
                  <Text style={styles.cancelBtnText}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, forgot.loading && { opacity: 0.6 }]}
                  onPress={() => void forgot.submit()}
                  disabled={forgot.loading}
                >
                  {forgot.loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.confirmBtnText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ── Web: tarjeta centrada ────────────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={styles.root}>
        <View style={styles.orb1} pointerEvents="none" />
        <View style={styles.orb2} pointerEvents="none" />
        <View style={styles.orb3} pointerEvents="none" />
        <View style={styles.webCenter}>
          <ScrollView
            contentContainerStyle={styles.webScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.webCard}>
              {content}
            </View>
          </ScrollView>
        </View>
        {modal}
      </View>
    );
  }

  // ── Móvil: scroll de pantalla completa ──────────────────────────────────────
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.orb1} pointerEvents="none" />
      <View style={styles.orb2} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={styles.mobileScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
      {modal}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D1A' },

  orb1: {
    position: 'absolute', width: 340, height: 340, borderRadius: 170,
    backgroundColor: '#7C3AED', opacity: 0.07, top: -120, right: -100,
  },
  orb2: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#06B6D4', opacity: 0.07, bottom: 20, left: -70,
  },
  orb3: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#7C3AED', opacity: 0.05, bottom: 80, right: 60,
  },

  // Móvil
  mobileScroll: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 48,
  },

  // Web
  webCenter: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  webScroll: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40, paddingHorizontal: 16,
  },
  webCard: {
    width: '100%',
  },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7C3AED', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { fontSize: 38 },
  appName: {
    fontSize: 30, fontWeight: '800', color: '#FFFFFF',
    letterSpacing: 0.5, marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: '#7C3AED22', borderWidth: 1, borderColor: '#7C3AED',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4,
  },
  tagText: { color: '#7C3AED', fontSize: 12, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#1A1A2E', borderRadius: 24,
    borderWidth: 1, borderColor: '#2D2D44',
    padding: 24, marginBottom: 20, overflow: 'hidden',
  },
  cardAccentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, backgroundColor: '#7C3AED',
  },
  cardTitle: {
    fontSize: 20, fontWeight: '800', color: '#FFFFFF',
    marginBottom: 24, marginTop: 8,
  },

  // Inputs
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '600', color: '#94A3B8',
    marginBottom: 8, letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: '#2D2D44',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: '#FFFFFF', fontSize: 15,
  },
  codeInput: {
    fontSize: 22, letterSpacing: 10, textAlign: 'center', fontWeight: '700',
  },
  modalPasswordInput: {
    backgroundColor: '#0D0D1A',
    borderTopRightRadius: 0, borderBottomRightRadius: 0,
  },

  // Botones
  loginBtn: {
    backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 15, marginTop: 8,
    shadowColor: '#7C3AED', shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  forgotRow: { alignItems: 'center', marginTop: 16 },
  forgotText: { color: '#7C3AED', fontSize: 13, fontWeight: '600' },
  registerRow: { alignItems: 'center', paddingVertical: 4 },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#7C3AED', fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#1A1A2E', borderRadius: 24,
    borderWidth: 1, borderColor: '#2D2D44',
    padding: 24, overflow: 'hidden',
  },
  modalCardWeb: {
    maxWidth: 800, alignSelf: 'center', width: '100%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6, marginTop: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 18, color: '#64748B', fontWeight: '700' },
  modalSub: { fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 18 },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1, backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: '#2D2D44',
    borderRadius: 14, paddingVertical: 13, alignItems: 'center',
  },
  cancelBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 1, backgroundColor: '#7C3AED', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
    shadowColor: '#7C3AED', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
