import React, { createContext, useCallback, useContext, useState } from 'react';

/**
 * Definición de un botón de la alerta global.
 */
export interface AlertButton {
  /** Texto que se muestra en el botón. */
  text: string;
  /** Callback invocado al pulsar el botón (opcional). */
  onPress?: () => void;
  /** Estilo visual del botón: 'default' (primario), 'cancel' o 'destructive'. */
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Opciones de configuración para mostrar una alerta global.
 */
interface AlertOptions {
  /** Título de la alerta. */
  title: string;
  /** Cuerpo del mensaje de la alerta. */
  message: string;
  /** Botones que aparecen en la alerta (opcional). Por defecto se muestra un botón "Aceptar". */
  buttons?: AlertButton[];
}

/**
 * Valor expuesto por el contexto de alerta global.
 */
interface AlertContextValue {
  /**
   * Muestra una alerta global con el título, mensaje y botones indicados.
   *
   * @param title - Título de la alerta.
   * @param message - Mensaje de la alerta.
   * @param buttons - Botones opcionales.
   */
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  /** Opciones de la alerta actualmente visible, o null si no hay ninguna. */
  alertOptions: AlertOptions | null;
  /** Cierra la alerta activa. */
  dismiss: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  showAlert: () => {},
  alertOptions: null,
  dismiss: () => {},
});

/**
 * Proveedor del contexto de alerta global.
 * Envuelve el árbol de componentes y expone {@link useAlert} para mostrar alertas modales
 * desde cualquier punto de la aplicación sin necesidad de estado local en cada componente.
 *
 * @param props - Props del proveedor.
 * @param props.children - Árbol de componentes hijos.
 * @returns El proveedor del contexto de alerta.
 */
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    setAlertOptions({ title, message, buttons });
  }, []);

  const dismiss = useCallback(() => setAlertOptions(null), []);

  return (
    <AlertContext.Provider value={{ showAlert, alertOptions, dismiss }}>
      {children}
    </AlertContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de alerta global.
 * Devuelve las funciones y el estado necesarios para mostrar y cerrar alertas.
 *
 * @precondition El componente debe estar dentro de un {@link AlertProvider}.
 * @returns El valor del contexto de alerta: `showAlert`, `alertOptions` y `dismiss`.
 */
export function useAlert() {
  return useContext(AlertContext);
}
