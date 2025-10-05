import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Card } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import { getMyNotifications, markNotificationRead, type AppNotification } from '@/lib/services/notifications';
import { useNotificationsBadge } from '@/lib/notifications/context';
import { useAuth } from '@/lib/auth/context';
import { apiFetch } from '@/lib/http';

export default function NotificationsScreen() {
  const colors = Colors;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { refresh: refreshBadge } = useNotificationsBadge();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getMyNotifications();
      if ((res as any).success) {
        setItems((res as any).notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
    pollRef.current = setInterval(fetchData, 45000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchData, user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchData();
    await refreshBadge();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_decision': return 'checkmark.seal';
      case 'event_invitation': return 'envelope.open';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval_decision': return colors.primary;
      case 'event_invitation': return '#FF6B35';
      default: return colors.icon;
    }
  };

  const handleNavigateToEvent = async (n: AppNotification) => {
    if (n.event) {
      const eventId = typeof n.event === 'object' ? n.event.id : n.event;
      // Mark as read before navigation
      try {
        if (!n.isRead) {
          await markNotificationRead(n.id, true);
          setItems(prev => prev.map(i => i.id === n.id ? { ...i, isRead: true } : i));
          await refreshBadge();
        }
      } catch {}
      router.push(`/event/${eventId}`);
    }
  };

  const handlePressNotification = async (n: AppNotification) => {
    try {
      if (!n.isRead) {
        await markNotificationRead(n.id, true);
        setItems(prev => prev.map(i => i.id === n.id ? { ...i, isRead: true } : i));
        await refreshBadge();
      }
      if (n.type === 'approval_decision') {
        await handleNavigateToEvent(n);
      }
    } catch (e) {
      // best-effort
    }
  };

  const handleInvitationAction = async (n: AppNotification, action: 'accept' | 'decline') => {
    try {
      const invitationId = typeof n.invitation === 'object' ? n.invitation.id : n.invitation;
      await apiFetch(`/api/invitations/${invitationId}/respond`, {
        method: 'POST',
        credentials: 'include',
        json: { action },
      });
      await markNotificationRead(n.id, true);
      await fetchData();
      await refreshBadge();
    } catch (e) {
      console.error('Failed to respond invitation', e);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      {!loading && (
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {items.map((n) => (
          <TouchableOpacity key={n.id} className="mb-3" onPress={() => handlePressNotification(n)}>
            <Card className={`bg-white ${!n.isRead ? 'border-l-4 border-primary' : ''}`}>
              <Card.Content className="p-4">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${getNotificationColor(n.type)}20` }}
                    >
                      <IconSymbol 
                        name={getNotificationIcon(n.type)} 
                        size={20} 
                        color={getNotificationColor(n.type)} 
                      />
                    </View>
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className={`text-base font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.type === 'approval_decision' ? 'Decyzja o aplikacji' : 'Zaproszenie na wydarzenie'}
                      </Text>
                      {!n.isRead && (
                        <View className="w-2 h-2 bg-primary rounded-full ml-2 mt-2" />
                      )}
                    </View>
                    
                    <Text className={`text-sm mb-2 ${!n.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {n.message || (n.type === 'approval_decision' ? (n.decision === 'accepted' ? 'Twoja aplikacja została zaakceptowana.' : 'Twoja aplikacja została odrzucona.') : 'Zaproszenie do udziału w wydarzeniu')}
                    </Text>
                    
                    {n.type === 'event_invitation' && n.actionRequired && (
                      <View className="flex-row gap-3 mt-2">
                        <TouchableOpacity className="px-3 py-2 rounded-md bg-green-600" onPress={() => handleInvitationAction(n, 'accept')}>
                          <Text className="text-white">Akceptuj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="px-3 py-2 rounded-md bg-red-600" onPress={() => handleInvitationAction(n, 'decline')}>
                          <Text className="text-white">Odrzuć</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Empty state if no notifications */}
        {items.length === 0 && (
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
      )}
    </View>
  );
}