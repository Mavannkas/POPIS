import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'outlined';
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  variant = 'default',
  style,
  ...props
}, ref) => {
  const inputStyle = variant === 'outlined' ? styles.outlined : styles.default;

  return (
    <View>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        ref={ref}
        style={[inputStyle, error && styles.error, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  default: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: 48,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  error: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
});