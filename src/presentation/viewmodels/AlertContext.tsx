import React, { createContext, useCallback, useContext, useState } from 'react';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextValue {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  alertOptions: AlertOptions | null;
  dismiss: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  showAlert: () => {},
  alertOptions: null,
  dismiss: () => {},
});

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

export function useAlert() {
  return useContext(AlertContext);
}
