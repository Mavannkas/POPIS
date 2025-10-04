import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { TopBar } from '@/components/ui/top-bar';
import { CategoryIcon } from '@/components/ui/category-icon';
import { getCategoryEmoji, getCategoryLabel, getAvailableEvents, applyToEvent, type Event } from '@/lib/services/events';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getAvailableEvents({ limit: 5 });
        setEvents(res.events);
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
            className="mb-4"
            onPress={() => router.push(`/event/${event.id}` as any)}
          >
            <Card className="bg-white shadow-sm">
              <Card.Content className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                      {event.title}
                    </Text>
                    {event.organization && (
                      <Text className="text-primary font-medium text-sm mb-2">
                        👤 {typeof event.organization === 'object' ? (event.organization.name || 'Organizacja') : 'Organizacja'}
                      </Text>
                    )}
                  </View>
                  <View className={`px-3 py-1 rounded-full bg-primary/10 flex-row items-center`}>
                    <Text className="text-xs mr-1">{getCategoryEmoji(event.category)}</Text>
                    <Text className="text-xs font-medium text-primary">
                      {getCategoryLabel(event.category)}
                    </Text>
                  </View>
                </View>

                <View className="space-y-2 mb-3">
                  <View className="flex-row items-center">
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>📅</Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-2">{new Date(event.startDate).toLocaleDateString('pl-PL')}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>⏰</Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-2">{event.duration}h</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>📍</Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-2">{event.location?.address || ''} {event.location?.city ? `• ${event.location.city}` : ''}</Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="mb-3">
                  <View className="flex-row flex-wrap gap-2">
                    <View className="flex-row items-center">
                      <CategoryIcon category={event.category} size="small" />
                      <Chip
                        style={{ backgroundColor: '#F5F5F5', marginLeft: 4 }}
                        textStyle={{ color: '#666', fontSize: 12 }}
                      >
                        {getCategoryLabel(event.category)}
                      </Chip>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-sm">
                      {event.maxVolunteers ? `👥 miejsca: ${event.maxVolunteers}` : '👥 liczba miejsc n/d'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-primary px-4 py-2 rounded-full"
                    onPress={() => onJoin(event.id)}
                    disabled={joiningId === event.id}
                  >
                    <Text className="text-white font-medium text-sm">
                      {joiningId === event.id ? 'Wysyłanie...' : 'Dołącz'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
});
