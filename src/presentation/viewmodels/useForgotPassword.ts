import { useState } from 'react';
import apiClient from '../../data/apiconnection/apiClient';

type ForgotStep = 1 | 2;

interface ForgotPasswordState {
  show: boolean;
  step: ForgotStep;
  correo: string;
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

  const open = () =>
    setState({ ...INITIAL_STATE, show: true });

  const close = () => set('show', false);

  const goNext = () => {
    if (!state.correo.trim()) {
      set('error', 'Introduce tu correo electrónico');
      return;
    }
    setState((prev) => ({ ...prev, error: '', step: 2 }));
  };

  const goBack = () => set('step', 1);

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
      await apiClient.put('/auth/cambiar-contrasena', {
        correo: state.correo.trim(),
        nuevaContrasena: state.password,
      });
      close();
    } catch {
      set('error', 'No se pudo cambiar la contraseña. Verifica el correo.');
    } finally {
      set('loading', false);
    }
  };

  return {
    ...state,
    open,
    close,
    goNext,
    goBack,
    submit,
    setCorreo: (v: string) => set('correo', v),
    setPassword: (v: string) => set('password', v),
    setConfirm: (v: string) => set('confirm', v),
    toggleShowPassword: () => set('showPassword', !state.showPassword),
    toggleShowConfirm: () => set('showConfirm', !state.showConfirm),
  };
}
