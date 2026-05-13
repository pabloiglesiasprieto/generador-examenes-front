import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/RootNavigator';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { IRegisterUseCase } from '../../domain/interfaces/useCases/auth/IRegisterUseCase';
import { useAlert } from '../viewmodels/AlertContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

type FormErrors = {
  nombre?: string;
  apellido?: string;
  correo?: string;
  password?: string;
  confirm?: string;
};

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { showAlert } = useAlert();

  const registerUseCase = useMemo(() => container.get<IRegisterUseCase>(TYPES.IRegisterUseCase), []);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const { nombre, apellido, correo, password, confirm } = form;
    const newErrors: FormErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (!NAME_REGEX.test(nombre.trim())) {
      newErrors.nombre = 'El nombre solo puede contener letras';
    }

    if (!apellido.trim()) {
      newErrors.apellido = 'Los apellidos son obligatorios';
    } else if (!NAME_REGEX.test(apellido.trim())) {
      newErrors.apellido = 'Los apellidos solo pueden contener letras';
    }

    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      newErrors.correo = 'Introduce un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!SPECIAL_CHAR_REGEX.test(password)) {
      newErrors.password = 'Debe incluir al menos un carácter especial (!@#$%...)';
    }

    if (!confirm) {
      newErrors.confirm = 'Confirma tu contraseña';
    } else if (password !== confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const { nombre, apellido, correo, password } = form;
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
      showAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>

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
                style={[styles.input, errors[key] ? styles.inputError : null]}
                placeholder={placeholder}
                placeholderTextColor="#555"
                value={form[key]}
                onChangeText={set(key)}
                keyboardType={keyboard ?? 'default'}
                autoCapitalize={key === 'correo' ? 'none' : 'words'}
                autoCorrect={false}
              />
              {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password ? styles.inputError : null]}
                placeholder="Mín. 8 chars + especial"
                placeholderTextColor="#555"
                value={form.password}
                onChangeText={set('password')}
                secureTextEntry={!showPass}
              />
              <Pressable onPress={() => setShowPass((v) => !v)} style={[styles.eyeBtn, errors.password ? styles.eyeBtnError : null]}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={[styles.input, errors.confirm ? styles.inputError : null]}
              placeholder="Repite la contraseña"
              placeholderTextColor="#555"
              value={form.confirm}
              onChangeText={set('confirm')}
              secureTextEntry={!showPass}
            />
            {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
          </View>

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Crear cuenta</Text>
            )}
          </Pressable>
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
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeBtnError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  btn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
