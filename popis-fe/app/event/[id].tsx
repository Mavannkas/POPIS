import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function EventDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();

  // Mock event data - in real app this would be fetched based on ID
  const mockEvent = {
    id: parseInt(id as string) || 1,
    title: 'Warsztaty programowania React',
    date: '21-01-2025',
    time: '10:00 - 12:00',
    location: 'Sala 101, Politechnika Warszawska',
    category: 'Edukacja',
    organizer: 'Patryk Pietrzyk',
    attendees: 25,
    maxAttendees: 30,
    description: 'Dołącz do naszych warsztatów programowania React! Nauczysz się podstaw tej popularnej biblioteki JavaScript, poznasz komponenty, stan aplikacji i routing. Warsztaty są przeznaczone dla osób z podstawową znajomością JavaScript.',
    requirements: [
      'Podstawowa znajomość JavaScript',
      'Własny laptop',
      'Zainstalowany Node.js',
    ],
    agenda: [
      '10:00 - 10:30: Wprowadzenie do React',
      '10:30 - 11:15: Komponenty i JSX',
      '11:15 - 11:30: Przerwa',
      '11:30 - 12:00: Stan aplikacji i eventy',
    ],
    tags: ['React', 'JavaScript', 'Frontend', 'Workshop'],
    image: 'https://picsum.photos/400/200?random=1',
    price: 'Bezpłatne',
    level: 'Początkujący',
  };

  const handleJoinEvent = () => {
    // TODO: Implement join event logic
    console.log('Joining event:', mockEvent.id);
  };

  const handleShareEvent = () => {
    // TODO: Implement share event logic
    console.log('Sharing event:', mockEvent.id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Szczegóły wydarzenia',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={handleShareEvent} className="p-2">
              <IconSymbol
                name="square.and.arrow.up"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-white">

      <ScrollView className="flex-1">
        {/* Event Image */}
        <View className="h-48 bg-gray-200">
          <Image 
            source={{ uri: mockEvent.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="px-4 py-6">
          {/* Title and Category */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                {mockEvent.title}
              </Text>
              <Text className="text-primary font-medium text-base">
                👤 {mockEvent.organizer}
              </Text>
            </View>
            <Chip
              style={{ backgroundColor: colors.primary + '20' }}
              textStyle={{ color: colors.primary, fontWeight: '600' }}
            >
              {mockEvent.category}
            </Chip>
          </View>

          {/* Event Details */}
          <Card className="mb-6 bg-gray-50">
            <Card.Content className="p-4">
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <IconSymbol name="calendar" size={20} color={colors.primary} />
                  <Text className="ml-3 text-gray-700 font-medium">
                    {mockEvent.date}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="clock" size={20} color={colors.primary} />
                  <Text className="ml-3 text-gray-700 font-medium">
                    {mockEvent.time}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="location" size={20} color={colors.primary} />
                  <Text className="ml-3 text-gray-700 font-medium">
                    {mockEvent.location}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="person.2" size={20} color={colors.primary} />
                  <Text className="ml-3 text-gray-700 font-medium">
                    {mockEvent.attendees}/{mockEvent.maxAttendees} uczestników
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="dollarsign.circle" size={20} color={colors.primary} />
                  <Text className="ml-3 text-gray-700 font-medium">
                    {mockEvent.price}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <IconSymbol name="chart.bar" size={20} color={colors.primary} />
                  <Text className="ml-3 text-gray-700 font-medium">
                    Poziom: {mockEvent.level}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Opis wydarzenia
            </Text>
            <Text className="text-gray-600 leading-6">
              {mockEvent.description}
            </Text>
          </View>

          {/* Requirements */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Wymagania
            </Text>
            {mockEvent.requirements.map((req, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                <Text className="text-gray-600 flex-1">{req}</Text>
              </View>
            ))}
          </View>

          {/* Agenda */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Agenda
            </Text>
            {mockEvent.agenda.map((item, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                <Text className="text-gray-600 flex-1">{item}</Text>
              </View>
            ))}
          </View>

          {/* Tags */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Tagi
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {mockEvent.tags.map((tag) => (
                <Chip
                  key={tag}
                  style={{ backgroundColor: '#F5F5F5' }}
                  textStyle={{ color: '#666' }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white px-4 py-4 border-t border-gray-200">
        <Button
          mode="contained"
          onPress={handleJoinEvent}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 25,
            paddingVertical: 8,
          }}
          contentStyle={{
            paddingVertical: 8,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Dołącz do wydarzenia
        </Button>
      </View>
    </View>
    </>
  );
}