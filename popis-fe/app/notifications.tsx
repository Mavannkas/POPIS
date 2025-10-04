import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: 'Nowe wydarzenie dostępne',
      message: 'Warsztaty programowania - sprawdź szczegóły i zapisz się już dziś!',
      time: '2 min temu',
      type: 'event',
      read: false,
    },
    {
      id: 2,
      title: 'Przypomnienie o wydarzeniu',
      message: 'Spotkanie z mentorem rozpocznie się za godzinę',
      time: '1 godz temu',
      type: 'reminder',
      read: false,
    },
    {
      id: 3,
      title: 'Aktualizacja wydarzenia',
      message: 'Lokalizacja Hackathonu 2025 została zmieniona',
      time: '3 godz temu',
      type: 'update',
      read: true,
    },
    {
      id: 4,
      title: 'Nowy mentor dostępny',
      message: 'Anna Kowalska dołączyła jako mentor w kategorii Frontend',
      time: '1 dzień temu',
      type: 'mentor',
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event': return 'calendar';
      case 'reminder': return 'bell.fill';
      case 'update': return 'info.circle';
      case 'mentor': return 'person.fill';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event': return colors.primary;
      case 'reminder': return '#FF6B35';
      case 'update': return '#4ECDC4';
      case 'mentor': return '#45B7D1';
      default: return colors.icon;
    }
  };

  return (
    <View className="flex-1 bg-white">

      <ScrollView className="flex-1 px-4 py-4">
        {mockNotifications.map((notification) => (
          <TouchableOpacity key={notification.id} className="mb-3">
            <Card className={`bg-white ${!notification.read ? 'border-l-4 border-primary' : ''}`}>
              <Card.Content className="p-4">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                    >
                      <IconSymbol 
                        name={getNotificationIcon(notification.type)} 
                        size={20} 
                        color={getNotificationColor(notification.type)} 
                      />
                    </View>
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className={`text-base font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-primary rounded-full ml-2 mt-2" />
                      )}
                    </View>
                    
                    <Text className={`text-sm mb-2 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </Text>
                    
                    <Text className="text-xs text-gray-400">
                      {notification.time}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Empty state if no notifications */}
        {mockNotifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <IconSymbol 
              name="bell.slash" 
              size={48} 
              color={colors.icon} 
            />
            <Text className="text-lg text-gray-500 mt-4">
              Brak powiadomień
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-2">
              Tutaj będą wyświetlane wszystkie{'\n'}powiadomienia o wydarzeniach
            </Text>
          </View>
        )}

        {/* Add some bottom padding */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}