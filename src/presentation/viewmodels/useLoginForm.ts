import { useState } from 'react';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../infrastructure/config/types';
import { ILoginUseCase } from '../../domain/interfaces/useCases/auth/ILoginUseCase';
import { API_BASE_URL } from '../../data/apiconnection/apiClient';

interface LoginFormState {
  correo: string;
  password: string;
  loading: boolean;
  error: string;
  showPassword: boolean;
}

function getLoginErrorMessage(err: unknown): string {
  const e = err as {
    response?: { status?: number; data?: { message?: string; error?: string } };
    request?: unknown;
    message?: string;
    code?: string;
  };
  if (e.response) {
    return e.response.data?.message ?? e.response.data?.error ?? `Error ${e.response.status}`;
  }
  if (e.request) {
    return `Sin respuesta del servidor.\nURL: ${API_BASE_URL}\nCódigo: ${e.code ?? 'NETWORK_ERROR'}`;
  }
  return e.message ?? 'Error desconocido';
}

export function useLoginForm(onSuccess: (token: string) => Promise<void>) {
  const [state, setState] = useState<LoginFormState>({
    correo: '',
    password: '',
    loading: false,
    error: '',
    showPassword: false,
  });

  const loginUseCase = container.get<ILoginUseCase>(TYPES.ILoginUseCase);

  const setField = <K extends keyof LoginFormState>(key: K, value: LoginFormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const handleLogin = async () => {
    if (!state.correo.trim() || !state.password.trim()) {
      setField('error', 'Completa todos los campos');
      return;
    }
    setField('error', '');
    setField('loading', true);
    try {
      const res = await loginUseCase.execute({
        correo_usuario: state.correo.trim(),
        contrasenha_usuario: state.password,
      });
      await onSuccess(res.token);
    } catch (err: unknown) {
      setField('error', getLoginErrorMessage(err));
    } finally {
      setField('loading', false);
    }
  };

  return {
    ...state,
    setCorreo: (v: string) => setField('correo', v),
    setPassword: (v: string) => setField('password', v),
    toggleShowPassword: () => setField('showPassword', !state.showPassword),
    handleLogin,
  };
}
