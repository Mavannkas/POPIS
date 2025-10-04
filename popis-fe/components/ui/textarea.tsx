import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  description?: string;
  minHeight?: number;
  maxHeight?: number;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(({
  label,
  error,
  description,
  minHeight = 120,
  maxHeight = 200,
  style,
  numberOfLines = 6,
  ...props
}, ref) => {
  return (
    <View>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      <TextInput
        ref={ref}
        style={[
          styles.textArea,
          { minHeight, maxHeight },
          error && styles.error,
          style
        ]}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        placeholderTextColor="#999"
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

TextArea.displayName = 'TextArea';

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
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