import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { router } from 'expo-router';
import { Event, getCategoryEmoji, getCategoryLabel } from '@/lib/services/events';
import { API_URL } from '@/lib/http';

export type EventCardProps = {
  event: Event;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | 'completed' | null;
  containerStyle?: ViewStyle;
};

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

export function EventCard({ event, applicationStatus, containerStyle }: EventCardProps) {
  return (
    <TouchableOpacity className="mb-6" onPress={() => router.push(`/event/${event.id}` as any)}>
      <Card className="bg-white shadow-sm rounded-2xl overflow-hidden" style={containerStyle}>
        <View className="w-full h-40 bg-gray-200">
          {(() => {
            const imageUrl = resolveImageUrl((event as any).image);
            return imageUrl ? (
              <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
            ) : null;
          })()}
          {applicationStatus && (
            <View className="absolute left-3 bottom-3">
              {(() => {
                const s = applicationStatus
                const bg = s === 'accepted' ? '#73A641' : (s === 'rejected' ? '#EF4444' : (s === 'completed' ? '#3B82F6' : '#E8A031'))
                const label = s === 'accepted' ? 'Zaakceptowano' : (s === 'rejected' ? 'Odrzucono' : (s === 'completed' ? 'Ukończony' : 'Zapisano'))
                return (
                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={styles.statusBadgeText}>{label}</Text>
                  </View>
                )
              })()}
            </View>
          )}
          <View className="absolute right-3 bottom-3">
            <View className="px-3 py-1 rounded-full bg-primary/90 flex-row items-center">
              <Text className="text-white text-xs mr-1">{getCategoryEmoji(event.category)}</Text>
              <Text className="text-white text-xs font-semibold">{getCategoryLabel(event.category)}</Text>
            </View>
          </View>
        </View>

        <Card.Content className="p-4">
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
        </Card.Content>
      </Card>
    </TouchableOpacity>
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

export default EventCard;


