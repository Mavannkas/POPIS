import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';
import { Event, getAvailableEvents } from '@/lib/services/events';

// Import native map component (only on iOS/Android)
const NativeMapView = Platform.OS !== 'web' ? require('@/app/components/MapViewNative').default : null;

export default function MapScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getAvailableEvents();
      setEvents(response.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS !== 'web' && NativeMapView) {
    return <NativeMapView events={events} loading={loading} />;
  }

  return (
    <View className="flex-1 bg-white">
      <TopBar showSearch={true} />
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-6xl mb-6">🗺️</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
          Mapa dostępna tylko w aplikacji mobilnej
        </Text>
        <Text className="text-gray-600 text-center">
          Funkcja mapy jest dostępna wyłącznie w aplikacji mobilnej.
        </Text>
      </View>
    </View>
  );
}

