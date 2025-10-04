import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Searchbar, Chip, Card } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock tags/filters
  const availableTags = [
    'Edukacja',
    'Mentoring',
    'Konkurs',
    'Workshop',
    'Online',
    'Warszawa',
    'Kraków',
    'Programowanie',
    'Design',
    'Marketing',
  ];

  // Mock search results
  const mockResults = [
    {
      id: 1,
      title: 'Warsztaty programowania React',
      date: '21-01-2025',
      time: '10:00 - 12:00',
      location: 'Sala 101, Politechnika',
      category: 'Edukacja',
      tags: ['Edukacja', 'Programowanie', 'Workshop'],
    },
    {
      id: 2,
      title: 'Spotkanie z mentorem UX',
      date: '22-01-2025',
      time: '14:00 - 15:00',
      location: 'Online',
      category: 'Mentoring',
      tags: ['Mentoring', 'Design', 'Online'],
    },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  const filteredResults = mockResults.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => event.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2"
          >
            <IconSymbol 
              name="chevron.left" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-800">
            Szukaj wydarzeń
          </Text>
          
          <TouchableOpacity onPress={clearFilters} className="p-2">
            <Text className="text-primary font-medium">Wyczyść</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
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
        {/* Filters Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Filtry
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Chip
                key={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
                style={{
                  backgroundColor: selectedTags.includes(tag) 
                    ? colors.primary 
                    : '#F5F5F5',
                }}
                textStyle={{
                  color: selectedTags.includes(tag) ? 'white' : '#666',
                }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>

        {/* Results Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Wyniki ({filteredResults.length})
          </Text>
        </View>

        {/* Search Results */}
        {filteredResults.map((event) => (
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
                  </View>
                  <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-primary text-xs font-medium">
                      {event.category}
                    </Text>
                  </View>
                </View>

                <View className="space-y-2 mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-primary font-medium text-sm mr-2">📅</Text>
                    <Text className="text-gray-600 text-sm">{event.date}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-primary font-medium text-sm mr-2">⏰</Text>
                    <Text className="text-gray-600 text-sm">{event.time}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-primary font-medium text-sm mr-2">📍</Text>
                    <Text className="text-gray-600 text-sm">{event.location}</Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="flex-row flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <View key={tag} className="bg-gray-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-gray-600">{tag}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

        {/* No Results */}
        {filteredResults.length === 0 && (
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
    </View>
  );
}