import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  message: string;
  style?: ViewStyle;
}

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
