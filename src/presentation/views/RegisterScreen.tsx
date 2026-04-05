import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/RootNavigator';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IRegisterUseCase } from '../../domain/interfaces/useCases/auth/IRegisterUseCase';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const registerUseCase = container.get<IRegisterUseCase>(TYPES.IRegisterUseCase);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    const { nombre, apellido, correo, password, confirm } = form;
    if (!nombre || !apellido || !correo || !password || !confirm) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      Alert.alert(
        'Contraseña débil',
        'Debe tener mínimo 8 caracteres y un carácter especial',
      );
      return;
    }
    setLoading(true);
    try {
      await registerUseCase.execute({
        nombre_usuario: nombre.trim(),
        apellido_usuario: apellido.trim(),
        correo_usuario: correo.trim(),
        contrasenha_usuario: password,
      });
      navigation.navigate('Login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo crear la cuenta';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete y empieza a jugar</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {[
            { key: 'nombre' as const, label: 'Nombre', placeholder: 'Carlos' },
            { key: 'apellido' as const, label: 'Apellidos', placeholder: 'Ruiz García' },
            {
              key: 'correo' as const,
              label: 'Correo electrónico',
              placeholder: 'carlos@email.com',
              keyboard: 'email-address' as const,
            },
          ].map(({ key, label, placeholder, keyboard }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#555"
                value={form[key]}
                onChangeText={set(key)}
                keyboardType={keyboard ?? 'default'}
                autoCapitalize={key === 'correo' ? 'none' : 'words'}
                autoCorrect={false}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Mín. 8 chars + especial"
                placeholderTextColor="#555"
                value={form.password}
                onChangeText={set('password')}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Repite la contraseña"
              placeholderTextColor="#555"
              value={form.confirm}
              onChangeText={set('confirm')}
              secureTextEntry={!showPass}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0D0D1A' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#7C3AED', fontSize: 16, fontWeight: '600' },
  titleRow: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: '#94A3B8', marginTop: 4 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
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
    flex: 1,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    backgroundColor: '#0D0D1A',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#2D2D44',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    justifyContent: 'center',
  },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
