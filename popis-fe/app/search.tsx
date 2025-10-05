import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Searchbar, Chip, Card } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import { FilterModal } from '@/components/FilterModal';
import { Event, EventFilters, getAvailableEvents, getCategoryEmoji, getCategoryLabel, getMyApplications, type ApplicationStatus } from '@/lib/services/events';
import { API_URL } from '@/lib/http';
import { EventCard } from '@/components/ui';

const resolveImageUrl = (img: any): string | null => {
  if (!img) return null;
  if (typeof img === 'string') {
    return img.startsWith('http') ? img : (API_URL ? `${API_URL}${img}` : null);
  }
  if (typeof img === 'object' && img.url) {
    const u = String(img.url);
    return u.startsWith('http') ? u : (API_URL ? `${API_URL}${u}` : u);
  }
  return null;
};

export default function SearchScreen() {
  const colors = Colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [applicationStatusByEvent, setApplicationStatusByEvent] = useState<Record<string, ApplicationStatus>>({});

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).reduce((acc, [key, val]) => {
      if (val === undefined || val === null || val === '') return acc;
      if (Array.isArray(val)) return acc + val.length;
      return acc + 1;
    }, 0) + (searchQuery ? 1 : 0);
  }, [filters, searchQuery]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // Client-side applied/not_applied filtering handled by screen; backend doesn't support it directly
      const response = await getAvailableEvents({ ...filters, search: searchQuery || undefined });
      setEvents(response.events);
    } catch (e) {
      console.error('Search load failed', e);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  // Load my applications to show status on cards (pending/accepted)
  useEffect(() => {
    (async () => {
      try {
        const apps = await getMyApplications();
        const map: Record<string, ApplicationStatus> = {};
        (apps.applications || []).forEach(app => {
          const ev: any = app.event as any;
          const eventId = typeof ev === 'object' ? String(ev.id) : String(ev);
          if (eventId) map[eventId] = app.status as ApplicationStatus;
        });
        setApplicationStatusByEvent(map);
      } catch (e) {
        // non-blocking
        console.warn('Failed to load my applications', e);
      }
    })();
  }, []);

  return (
    <View className="flex-1 bg-white">
        {/* Search Bar */}
        <View className="px-4 py-4 bg-white shadow-sm">
          <Searchbar
            placeholder="Szukaj wydarzeń..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              backgroundColor: '#F5F5F5',
              elevation: 0,
              borderRadius: 25,
            }}
            inputStyle={{
              fontSize: 16,
            }}
            iconColor={colors.primary}
          />
        </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Loading */}
        {loading && (
          <View className="mb-4 flex-row items-center">
            <ActivityIndicator color={colors.primary} />
            <Text className="ml-2 text-gray-600">Wyszukiwanie...</Text>
          </View>
        )}

        {/* Results Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Wyniki ({events.length})
          </Text>
        </View>

        {/* Search Results */}
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            applicationStatus={applicationStatusByEvent[String(event.id)] || null}
          />
        ))}

        {/* No Results */}
        {events.length === 0 && !loading && (
          <View className="flex-1 items-center justify-center py-20">
            <IconSymbol 
              name="magnifyingglass" 
              size={48} 
              color={colors.icon} 
            />
            <Text className="text-lg text-gray-500 mt-4">
              Brak wyników
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-2">
              Spróbuj zmienić kryteria wyszukiwania{'\n'}lub wyczyść filtry
            </Text>
          </View>
        )}

        {/* Add some bottom padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Floating Filters Button */}
      <View className="absolute right-4 bottom-6">
        <TouchableOpacity onPress={() => setShowFilters(true)} style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#3B82F6',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        }}>
          <IconSymbol name={'line.3.horizontal.decrease.circle.fill'} size={22} color={'white'} />
          {activeFiltersCount > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 5, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(f) => setFilters(f)}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  metaIcon: {
    fontSize: 16,
    color: '#D17A92',
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#D17A92',
    fontWeight: '600',
  },
});