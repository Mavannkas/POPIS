import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Card } from 'react-native-paper';
import { TopBar } from '@/components/ui/top-bar';
import { EventCard } from '@/components/ui';
import { getCategoryEmoji, getCategoryLabel, getAvailableEvents, applyToEvent, getMyApplications, type Event, type ApplicationStatus, type EventFilters } from '@/lib/services/events';
import { router } from 'expo-router';
import { API_URL } from '@/lib/http';

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

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [applicationStatusByEvent, setApplicationStatusByEvent] = useState<Record<string, ApplicationStatus>>({});
  const [filters, setFilters] = useState<EventFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await getAvailableEvents({ limit: 5, ...filters });
      setEvents(res.events);
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
        console.warn('Failed to load my applications', e);
      }
    } catch (e) {
      console.error('Failed to load home events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const onJoin = async (eventId: string) => {
    try {
      setJoiningId(eventId);
      const res = await applyToEvent({ eventId });
      if (res.success) {
        // Simple success feedback; could add toast
        console.log('Applied to event', eventId);
      } else {
        console.warn('Apply failed', res.error);
      }
    } catch (e) {
      console.error('Apply error', e);
    } finally {
      setJoiningId(prev => (prev === eventId ? null : prev));
    }
  };

  return (
    <View className="flex-1 bg-white">
      <TopBar showSearch={true} />
      
      <ScrollView className="flex-1 px-4 py-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Active filter: My applications */}
        {filters.applied && (
          <View className="mb-3">
            <Text className="text-sm text-gray-600">
              {filters.applied === 'applied' ? 'Pokazuję tylko zapisane wydarzenia' : 'Pokazuję tylko wydarzenia, na które nie jestem zapisany'}
            </Text>
          </View>
        )}
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          🏠 Nadchodzące wydarzenia
        </Text>

        {loading && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator />
            <Text className="ml-2 text-gray-600">Ładowanie wydarzeń...</Text>
          </View>
        )}

        {events
          .filter(e => {
            if (!filters.applied) return true;
            const st = applicationStatusByEvent[String(e.id)];
            if (filters.applied === 'applied') return !!st;
            if (filters.applied === 'not_applied') return !st;
            return true;
          })
          .map((event) => (
            <EventCard
              key={event.id}
              event={event}
              applicationStatus={applicationStatusByEvent[String(event.id)] || null}
            />
          ))}

        {/* Add some bottom padding for better scrolling */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1DAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  savedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 18,
  },
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
  savedIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'white',
  },
  savedIcon: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  savedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  infoPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
  },
  pillEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    color: '#4B5563',
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
