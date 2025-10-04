// Fallback for Expo Router - native version in MapViewNative.native.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function MapViewNative() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Map not available</Text>
    </View>
  );
}
