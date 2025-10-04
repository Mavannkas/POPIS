import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { TopBar } from '@/components/ui/top-bar';
import { CategoryIcon } from '@/components/ui/category-icon';
import { router } from 'expo-router';

export default function HomeScreen() {

  // Mock events data
  const mockEvents = [
    {
      id: 1,
      title: 'Warsztaty programowania',
      date: '21-01-2025',
      time: '10:00 - 12:00',
      location: 'Sala 101, Politechnika',
      category: 'education',
      attendees: 25,
      maxAttendees: 30,
      status: 'available',
      organizer: 'Patryk Pietrzyk',
      tags: ['React', 'JavaScript', 'Programowanie frontendowe'],
    },
    {
      id: 2,
      title: 'Spotkanie z mentorem',
      date: '22-01-2025',
      time: '14:00 - 15:00',
      location: 'Online',
      category: 'social',
      attendees: 8,
      maxAttendees: 10,
      status: 'available',
      organizer: 'Anna Kowalska',
      tags: ['Mentoring', 'Programowanie', 'Rozwój osobisty'],
    },
    {
      id: 3,
      title: 'Hackathon 2025',
      date: '25-01-2025',
      time: '09:00 - 18:00',
      location: 'Centrum Konferencyjne',
      category: 'education',
      attendees: 45,
      maxAttendees: 50,
      status: 'almost_full',
      organizer: 'Tech Community',
      tags: ['Hackaton', 'Startup', 'Innowacje'],
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Edukacja': return 'bg-blue-100 text-blue-800';
      case 'Mentoring': return 'bg-green-100 text-green-800';
      case 'Konkurs': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className="flex-1 bg-white">
      <TopBar showSearch={true} />
      
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          🏠 Nadchodzące wydarzenia
        </Text>

        {mockEvents.map((event) => (
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
                    <Text className="text-primary font-medium text-sm mb-2">
                      👤 {event.organizer}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                    <Text className="text-xs font-medium">
                      {event.category}
                    </Text>
                  </View>
                </View>

                <View className="space-y-2 mb-3">
                  <View className="flex-row items-center">
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>📅</Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-2">{event.date}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>⏰</Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-2">{event.time}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>📍</Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-2">{event.location}</Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="mb-3">
                  <View className="flex-row flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <View key={tag} className="flex-row items-center">
                        <CategoryIcon category={event.category} size="small" />
                        <Chip
                          style={{ backgroundColor: '#F5F5F5', marginLeft: 4 }}
                          textStyle={{ color: '#666', fontSize: 12 }}
                        >
                          {tag}
                        </Chip>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-sm">
                      👥 {event.attendees}/{event.maxAttendees} uczestników
                    </Text>
                  </View>
                  <TouchableOpacity className="bg-primary px-4 py-2 rounded-full">
                    <Text className="text-white font-medium text-sm">
                      Dołącz
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
