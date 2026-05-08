import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Props del componente {@link PasswordInput}.
 */
interface Props {
  /** Valor actual del campo de contraseña. */
  value: string;
  /** Callback invocado al cambiar el texto. */
  onChangeText: (v: string) => void;
  /** Texto de marcador de posición. Por defecto '••••••••'. */
  placeholder?: string;
  /** Indica si la contraseña es visible (true) u oculta (false). */
  show: boolean;
  /** Callback invocado al pulsar el icono de ojo para alternar la visibilidad. */
  onToggleShow: () => void;
  /** Estilo adicional opcional para el campo de texto. */
  inputStyle?: TextStyle;
  /** Estilo adicional opcional para el contenedor. */
  containerStyle?: ViewStyle;
}

/**
 * Campo de entrada de contraseña con botón para alternar la visibilidad del texto.
 * Muestra un icono de ojo que permite al usuario ver u ocultar la contraseña introducida.
 *
 * @param props - Props del componente.
 * @param props.value - Valor actual del campo.
 * @param props.onChangeText - Callback al cambiar el texto.
 * @param props.placeholder - Texto de marcador de posición.
 * @param props.show - Estado de visibilidad de la contraseña.
 * @param props.onToggleShow - Callback para alternar la visibilidad.
 * @param props.inputStyle - Estilo adicional para el input.
 * @param props.containerStyle - Estilo adicional para el contenedor.
 * @returns El componente de entrada de contraseña.
 */
export function PasswordInput({
  value,
  onChangeText,
  placeholder = '••••••••',
  show,
  onToggleShow,
  inputStyle,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.row, containerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor="#555"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
      />
      <TouchableOpacity onPress={onToggleShow} style={styles.eyeBtn}>
        <Ionicons
          name={show ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#94A3B8"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFFFFF',
    fontSize: 15,
  },
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
});
