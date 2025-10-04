import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { TopBar } from '@/components/ui/top-bar';
import { getCategoryEmoji, getCategoryLabel, getAvailableEvents, applyToEvent, getMyApplications, type Event } from '@/lib/services/events';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [appliedEventIds, setAppliedEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getAvailableEvents({ limit: 5 });
        setEvents(res.events);
        // Load my applications to show "Zapisano" status on cards
        try {
          const apps = await getMyApplications();
          const ids = new Set<string>();
          (apps.applications || []).forEach(app => {
            const ev: any = app.event as any;
            const eventId = typeof ev === 'object' ? String(ev.id) : String(ev);
            if (eventId) ids.add(eventId);
          });
          setAppliedEventIds(ids);
        } catch (e) {
          // non-blocking
          console.warn('Failed to load my applications', e);
        }
      } catch (e) {
        console.error('Failed to load home events', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          🏠 Nadchodzące wydarzenia
        </Text>

        {loading && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator />
            <Text className="ml-2 text-gray-600">Ładowanie wydarzeń...</Text>
          </View>
        )}

        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            className="mb-6"
            onPress={() => router.push(`/event/${event.id}` as any)}
          >
            <Card className="bg-white shadow-sm rounded-2xl overflow-hidden">
              {/* Image header */}
              <View className="w-full h-40 bg-gray-200">
                {event && (event as any).image && typeof (event as any).image === 'object' && (event as any).image?.url ? (
                  <Image
                    source={{ uri: (event as any).image.url as string }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : null}
                {/* Saved badge */}
                {appliedEventIds.has(String(event.id)) && (
                  <View className="absolute left-3 bottom-3">
                    <View style={styles.savedBadge} className="flex-row items-center">
                      <View style={styles.savedIconCircle} className="items-center justify-center mr-2">
                        <Text style={styles.savedIcon}>✓</Text>
                      </View>
                      <Text style={styles.savedText}>Zapisano</Text>
                    </View>
                  </View>
                )}
                {/* Top-right category chip */}
                <View className="absolute right-3 bottom-3">
                  <View className="px-3 py-1 rounded-full bg-primary/90 flex-row items-center">
                    <Text className="text-white text-xs mr-1">{getCategoryEmoji(event.category)}</Text>
                    <Text className="text-white text-xs font-semibold">{getCategoryLabel(event.category)}</Text>
                  </View>
                </View>
              </View>

              <Card.Content className="p-4">
                {/* Title and capacity */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-xl font-semibold text-gray-900 mb-1" numberOfLines={2}>
                      {event.title}
                    </Text>
                    {event.organization && (
                      <Text className="text-primary font-medium text-sm">
                        👤 {typeof event.organization === 'object' ? (event.organization.name || 'Organizacja') : 'Organizacja'}
                      </Text>
                    )}
                  </View>
                  {event.maxVolunteers ? (
                    <View className="items-end">
                      <Text className="text-blue-600 font-semibold">
                        {(event.acceptedCount ?? 0)}/{event.maxVolunteers} <Text>👥</Text>
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Meta row aligned per design */}
                <View className="flex-row items-center justify-between mt-1">
                  <View className="flex-row items-center">
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text style={styles.metaText}>{new Date(event.startDate).toLocaleDateString('pl-PL')}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text style={styles.metaIcon}>⏰</Text>
                    <Text style={styles.metaText}>{event.duration}h</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      {event.location?.city || event.location?.address || ''}
                    </Text>
                  </View>
                </View>

                {/* Removed bottom category row per new design */}
              </Card.Content>
            </Card>
          </TouchableOpacity>
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
