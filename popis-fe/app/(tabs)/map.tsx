import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';
import { Event, getAvailableEvents, EventFilters } from '@/lib/services/events';
import { FilterModal } from '@/components/FilterModal';

// Import native map component (only on iOS/Android)
const NativeMapView = Platform.OS !== 'web' ? require('@/app/components/MapViewNative').default : null;

export default function MapScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAvailableEvents(filters);
      setEvents(response.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  

  const activeFiltersCount = Object.entries(filters).reduce((acc, [key, val]) => {
    if (val === undefined || val === null || val === '') return acc;
    if (Array.isArray(val)) return acc + val.length;
    return acc + 1;
  }, 0);

  if (Platform.OS !== 'web' && NativeMapView) {
    return (
      <>
        <NativeMapView events={events} loading={loading} onOpenFilters={() => setShowFilters(true)} activeFiltersCount={activeFiltersCount} />
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={(f) => setFilters(f)}
          currentFilters={filters}
        />
      </>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <TopBar showSearch={true} />
      <View className="p-4">
        <Text onPress={() => setShowFilters(true)} className="inline-block bg-white px-4 py-2 rounded-full shadow text-gray-800 self-end">Filtry ⚙️</Text>
      </View>
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-6xl mb-6">🗺️</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
          Mapa dostępna tylko w aplikacji mobilnej
        </Text>
        <Text className="text-gray-600 text-center">
          Funkcja mapy jest dostępna wyłącznie w aplikacji mobilnej.
        </Text>
      </View>
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(f) => setFilters(f)}
        currentFilters={filters}
      />
    </View>
  );
}

