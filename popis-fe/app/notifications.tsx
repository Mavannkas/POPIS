import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Card } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/lib/notifications/context';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function NotificationsScreen() {
  const colors = Colors;
  const { notifications, loading, markAsRead, fetchNotifications, connected } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notificationId: string, read: boolean, eventId: string) => {
    if (!read) {
      await markAsRead(notificationId);
    }

    // Navigate to event details
    if (eventId) {
      router.push(`/event/${eventId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_invitation': return 'envelope';
      case 'join_request_accepted': return 'checkmark.circle.fill';
      case 'join_request_rejected': return 'xmark.circle.fill';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'event_invitation': return colors.primary;
      case 'join_request_accepted': return '#10B981';
      case 'join_request_rejected': return '#EF4444';
      default: return colors.icon;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'event_invitation': return 'Zaproszenie do wydarzenia';
      case 'join_request_accepted': return 'Zgłoszenie zaakceptowane';
      case 'join_request_rejected': return 'Zgłoszenie odrzucone';
      default: return 'Powiadomienie';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: pl
      });
    } catch {
      return dateString;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-gray-500 mt-4">Ładowanie powiadomień...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Connection status indicator */}
      {!connected && (
        <View className="bg-yellow-100 px-4 py-2">
          <Text className="text-yellow-800 text-sm text-center">
            Reconnecting to notification service...
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {notifications.map((notification) => {
          const eventId = typeof notification.event === 'string'
            ? notification.event
            : notification.event?.id;

          return (
            <TouchableOpacity
              key={notification.id}
              className="mb-3"
              onPress={() => handleNotificationPress(notification.id, notification.read, eventId)}
            >
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
                          {getNotificationTitle(notification.type)}
                        </Text>
                        {!notification.read && (
                          <View className="w-2 h-2 bg-primary rounded-full ml-2 mt-2" />
                        )}
                      </View>

                      <Text className={`text-sm mb-2 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </Text>

                      <Text className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Empty state if no notifications */}
        {notifications.length === 0 && (
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