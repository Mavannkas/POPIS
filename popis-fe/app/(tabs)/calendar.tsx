import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';
import { Card } from 'react-native-paper';
import { router } from 'expo-router';

export default function CalendarScreen() {

  // Mock calendar events
  const mockEvents = [
    {
      id: 1,
      date: '2024-01-15',
      title: 'Warsztaty programowania',
      time: '10:00 - 12:00',
      location: 'Sala 101',
    },
    {
      id: 2,
      date: '2024-01-18',
      title: 'Spotkanie z mentorem',
      time: '14:00 - 15:00',
      location: 'Online',
    },
    {
      id: 3,
      date: '2024-01-22',
      title: 'Prezentacja projektów',
      time: '16:00 - 18:00',
      location: 'Aula główna',
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <TopBar showSearch={true} />
      
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          📅 Kalendarz wydarzeń
        </Text>

        {/* Calendar placeholder */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-center text-gray-600 text-lg mb-2">
            Styczeń 2024
          </Text>
          <View className="grid grid-cols-7 gap-2">
            {/* Calendar grid placeholder */}
            <Text className="text-center text-gray-400 text-sm">
              Tutaj będzie kalendarz
            </Text>
          </View>
        </View>

        {/* Upcoming events */}
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Nadchodzące wydarzenia
        </Text>

        {mockEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            onPress={() => router.push(`/event/${event.id}` as any)}
          >
            <Card className="mb-3 bg-white">
            <Card.Content className="p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800 mb-1">
                    {event.title}
                  </Text>
                  <Text className="text-primary font-medium mb-1">
                    {event.time}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    📍 {event.location}
                  </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary text-sm font-medium">
                    {event.date}
                  </Text>
                </View>
              </View>
            </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}