// Fallback for Expo Router - native version in MapViewNative.native.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MapViewNative({ onOpenFilters }: { onOpenFilters?: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Map not available</Text>
      {onOpenFilters && (
        <TouchableOpacity onPress={onOpenFilters} style={styles.btn}>
          <Text style={styles.btnText}>Otwórz filtry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  btnText: {
    color: '#111827',
    fontWeight: '600',
  },
});
