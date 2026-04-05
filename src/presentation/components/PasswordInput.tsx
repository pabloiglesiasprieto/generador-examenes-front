import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  show: boolean;
  onToggleShow: () => void;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

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
        <Text style={styles.eyeText}>{show ? '🙈' : '👁️'}</Text>
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
  },
  eyeText: { fontSize: 18 },
});
