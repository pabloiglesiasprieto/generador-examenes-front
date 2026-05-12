import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAlert } from '../viewmodels/AlertContext';

/**
 * Modal de alerta global de la aplicación.
 * Renderiza un diálogo emergente con título, mensaje y botones configurables
 * según las opciones proporcionadas a través del contexto {@link AlertContext}.
 * No recibe props: consume el contexto {@link useAlert} directamente.
 *
 * @returns El componente modal de alerta, o null si no hay alerta activa.
 */
export function AppAlertModal() {
  const { alertOptions, dismiss } = useAlert();

  if (!alertOptions) return null;

  const buttons =
    alertOptions.buttons && alertOptions.buttons.length > 0
      ? alertOptions.buttons
      : [{ text: 'Aceptar', style: 'default' as const }];

  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actionBtns = buttons.filter((b) => b.style !== 'cancel');

  const handlePress = (btn: (typeof buttons)[number]) => {
    dismiss();
    btn.onPress?.();
  };

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{alertOptions.title}</Text>
          <Text style={styles.message}>{alertOptions.message}</Text>

          <View style={[styles.btnRow, (cancelBtn || actionBtns.length > 1) && styles.btnRowMulti]}>
            {cancelBtn && (
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel, styles.btnFlex]}
                onPress={() => handlePress(cancelBtn)}
              >
                <Text style={styles.btnCancelText}>{cancelBtn.text}</Text>
              </TouchableOpacity>
            )}
            {actionBtns.map((btn) => (
              <TouchableOpacity
                key={btn.text}
                style={[
                  styles.btn,
                  btn.style === 'destructive' ? styles.btnDestructive : styles.btnPrimary,
                  (cancelBtn || actionBtns.length > 1) && styles.btnFlex,
                ]}
                onPress={() => handlePress(btn)}
              >
                <Text style={btn.style === 'destructive' ? styles.btnDestructiveText : styles.btnPrimaryText}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  message: { fontSize: 14, color: '#94A3B8', lineHeight: 20, marginBottom: 24 },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnRowMulti: { justifyContent: 'space-between' },
  btn: { borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20, alignItems: 'center' },
  btnFlex: { flex: 1 },
  btnPrimary: { backgroundColor: '#7C3AED' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  btnCancel: { backgroundColor: '#2D2D44' },
  btnCancelText: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
  btnDestructive: { backgroundColor: '#EF4444' },
  btnDestructiveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
