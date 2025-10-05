import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';
import { EventCard } from '@/components/ui';
import { getAvailableEvents, getMyApplications, type Event, type ApplicationStatus, type EventFilters } from '@/lib/services/events';
import { useNotificationsBadge } from '@/lib/notifications/context';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationStatusByEvent, setApplicationStatusByEvent] = useState<Record<string, ApplicationStatus>>({});
  const [filters] = useState<EventFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useNotificationsBadge();

  const loadHomeData = useCallback(async () => {
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
        showToast('Nie udało się załadować zgłoszeń');
      }
    } catch (e) {
      console.error('Failed to load home events', e);
      showToast('Nie udało się załadować wydarzeń');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
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


