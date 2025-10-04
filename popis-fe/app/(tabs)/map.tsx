import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';

export default function MapScreen() {
  return (
    <View className="flex-1 bg-white">
      <TopBar showSearch={true} />
      
      <View className="flex-1 items-center justify-center bg-gray-100">
        {/* Placeholder for map */}
        <View className="w-full h-full bg-green-100 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-600 mb-2">
            🗺️ Mapa
          </Text>
          <Text className="text-gray-500 text-center px-4">
            Tutaj będzie wyświetlana mapa z wydarzeniami
          </Text>
          <Text className="text-sm text-gray-400 mt-2">
            (Expo Maps integration coming soon)
          </Text>
        </View>
      </View>
    </View>
  );
}