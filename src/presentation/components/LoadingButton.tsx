import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

/**
 * Props del componente {@link LoadingButton}.
 */
interface Props {
  /** Callback invocado al pulsar el botón. */
  onPress: () => void;
  /** Indica si el botón está en estado de carga (muestra un spinner). Por defecto false. */
  loading?: boolean;
  /** Indica si el botón está deshabilitado. Por defecto false. */
  disabled?: boolean;
  /** Texto a mostrar en el botón cuando no está en estado de carga. */
  label: string;
  /** Estilo adicional opcional para el botón. */
  style?: ViewStyle;
  /** Estilo adicional opcional para el texto del botón. */
  textStyle?: TextStyle;
  /** Color del indicador de carga. Por defecto '#fff'. */
  loadingColor?: string;
}

/**
 * Botón con soporte de estado de carga.
 * Muestra un indicador de actividad en lugar del texto cuando está cargando,
 * y se deshabilita automáticamente durante la carga.
 *
 * @param props - Props del componente.
 * @param props.onPress - Callback al pulsar el botón.
 * @param props.loading - Si es true, muestra el spinner y deshabilita el botón.
 * @param props.disabled - Si es true, deshabilita el botón independientemente del estado de carga.
 * @param props.label - Texto del botón.
 * @param props.style - Estilo adicional para el contenedor.
 * @param props.textStyle - Estilo adicional para el texto.
 * @param props.loadingColor - Color del spinner de carga.
 * @returns El componente de botón con soporte de carga.
 */
export function LoadingButton({
  onPress,
  loading = false,
  disabled = false,
  label,
  style,
  textStyle,
  loadingColor = '#fff',
}: Props) {
  return (
    <Pressable
      style={[styles.btn, (loading || disabled) && styles.disabled, style]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} />
      ) : (
        <Text style={[styles.text, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  disabled: { opacity: 0.6 },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
