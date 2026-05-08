import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

/**
 * Props del componente {@link ErrorBox}.
 */
interface Props {
  /** Mensaje de error a mostrar. Si está vacío, el componente no se renderiza. */
  message: string;
  /** Estilo adicional opcional para el contenedor del error. */
  style?: ViewStyle;
}

/**
 * Caja de mensaje de error con borde rojo.
 * Si el mensaje está vacío, el componente devuelve null y no ocupa espacio.
 *
 * @param props - Props del componente.
 * @param props.message - Mensaje de error a mostrar.
 * @param props.style - Estilo adicional opcional para el contenedor.
 * @returns El componente de error o null si el mensaje está vacío.
 */
export function ErrorBox({ message, style }: Props) {
  if (!message) return null;
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#2D1A1A',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  text: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
});
