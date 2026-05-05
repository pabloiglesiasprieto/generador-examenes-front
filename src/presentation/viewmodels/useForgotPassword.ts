import { useState } from 'react';
import apiClient from '../../data/apiconnection/apiClient';

type ForgotStep = 1 | 2 | 3;

interface ForgotPasswordState {
  show: boolean;
  step: ForgotStep;
  correo: string;
  codigo: string;
  password: string;
  confirm: string;
  loading: boolean;
  error: string;
  showPassword: boolean;
  showConfirm: boolean;
}

const INITIAL_STATE: ForgotPasswordState = {
  show: false,
  step: 1,
  correo: '',
  codigo: '',
  password: '',
  confirm: '',
  loading: false,
  error: '',
  showPassword: false,
  showConfirm: false,
};

export function useForgotPassword() {
  const [state, setState] = useState<ForgotPasswordState>(INITIAL_STATE);

  const set = <K extends keyof ForgotPasswordState>(key: K, value: ForgotPasswordState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const open = () => setState({ ...INITIAL_STATE, show: true });

  const close = () => set('show', false);

  const goBack = () =>
    setState((prev) => ({ ...prev, step: (prev.step > 1 ? prev.step - 1 : 1) as ForgotStep, error: '' }));

  // Paso 1: solicitar código al backend
  const requestCode = async () => {
    if (!state.correo.trim()) {
      set('error', 'Introduce tu correo electrónico');
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      await apiClient.post('/auth/solicitar-recuperacion', {
        correo_usuario: state.correo.trim(),
      });
      setState((prev) => ({ ...prev, loading: false, step: 2 }));
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = status === 404
        ? 'No existe ningún usuario registrado con ese correo electrónico'
        : 'No se pudo enviar el código. Inténtalo de nuevo.';
      setState((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

  // Paso 2: validar el código contra el backend y pasar al paso 3 solo si es correcto
  const goToNewPassword = async () => {
    if (!state.codigo.trim()) {
      set('error', 'Introduce el código que recibiste por correo');
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      await apiClient.post('/auth/verificar-codigo', {
        correo_usuario: state.correo.trim(),
        codigo: state.codigo.trim(),
      });
      setState((prev) => ({ ...prev, loading: false, step: 3 }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: 'Código inválido o expirado. Vuelve a intentarlo.' }));
    }
  };

  // Paso 3: confirmar código + nueva contraseña
  const submit = async () => {
    if (!state.password.trim() || !state.confirm.trim()) {
      set('error', 'Completa todos los campos');
      return;
    }
    if (state.password !== state.confirm) {
      set('error', 'Las contraseñas no coinciden');
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      await apiClient.post('/auth/confirmar-recuperacion', {
        correo_usuario: state.correo.trim(),
        codigo: state.codigo.trim(),
        nueva_contrasena: state.password,
      });
      close();
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: 'Código inválido o expirado. Vuelve a intentarlo.' }));
    }
  };

  return {
    ...state,
    open,
    close,
    goBack,
    requestCode,
    goToNewPassword,
    submit,
    setCorreo: (v: string) => set('correo', v),
    setCodigo: (v: string) => set('codigo', v),
    setPassword: (v: string) => set('password', v),
    setConfirm: (v: string) => set('confirm', v),
    toggleShowPassword: () => set('showPassword', !state.showPassword),
    toggleShowConfirm: () => set('showConfirm', !state.showConfirm),
  };
}
