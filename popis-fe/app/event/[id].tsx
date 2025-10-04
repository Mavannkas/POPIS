import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryIcon } from '@/components/ui/category-icon';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { TextArea } from '@/components/ui/textarea';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function EventDetailScreen() {
  const colors = Colors;
  const { id } = useLocalSearchParams();
  const [recommendation, setRecommendation] = useState('');

  // Mock event data - in real app this would be fetched based on ID
  const mockEvent = {
    id: parseInt(id as string) || 1,
    title: 'Warsztaty programowania React',
    date: '21-01-2025',
    time: '10:00 - 12:00',
    location: 'Sala 101, Politechnika Warszawska',
    category: 'education',
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
    tags: ['React', 'JavaScript', 'Programowanie frontendowe', 'Warsztaty'],
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
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView className="flex-1">
        {/* Event Image */}
        <View className="h-48 bg-gray-200">
          <Image 
            source={{ uri: mockEvent.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="px-4 py-6">
          {/* Title and Organizer */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {mockEvent.title}
            </Text>
            <Text className="text-primary font-medium text-base" style={{ marginLeft: 2 }}>
              👤 {mockEvent.organizer} 
            </Text>
          </View>

          {/* Event Details */}
          <Card style={{ backgroundColor: '#F9F9F9', marginBottom: 24, elevation: 0 }}>
            <Card.Content style={{ padding: 16, backgroundColor: 'transparent' }}>
              <View style={{ gap: 12 }}>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>📅</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {mockEvent.date}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>⏰</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {mockEvent.time}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>📍</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {mockEvent.location}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>👥</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {mockEvent.attendees}/{mockEvent.maxAttendees} uczestników
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>💰</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {mockEvent.price}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>📊</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
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

          {/* Category */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Kategoria
            </Text>
            <View className="flex-row items-center">
              <CategoryIcon category={mockEvent.category} size="small" />
              <Chip
                style={{ backgroundColor: '#F5F5F5', marginLeft: 4 }}
                textStyle={{ color: '#666', fontSize: 12 }}
              >
                {mockEvent.category}
              </Chip>
            </View>
          </View>

          {/* Recommendation Textarea */}
          <View className="mb-8">
            <TextArea
              label="Dlaczego powinieneś zostać wybrany?"
              description="Opisz swoje doświadczenie, motywację lub powody, dla których chcesz uczestniczyć w tym wydarzeniu."
              value={recommendation}
              onChangeText={setRecommendation}
              placeholder="Napisz swoją rekomendację..."
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white px-4 py-4 border-t border-gray-200">
        <Button
          mode="contained"
          onPress={handleJoinEvent}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            paddingVertical: 4,
          }}
          contentStyle={{
            paddingVertical: 4,
          }}
          labelStyle={{
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          Dołącz do wydarzenia
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1DAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
});