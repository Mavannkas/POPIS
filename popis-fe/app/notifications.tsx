import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Card } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
//
import { getMyNotifications, markNotificationRead, type AppNotification } from '@/lib/services/notifications';
import { useNotificationsBadge } from '@/lib/notifications/context';
import { useAuth } from '@/lib/auth/context';
import { apiFetch } from '@/lib/http';

export default function NotificationsScreen() {
  const colors = Colors;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      case 'approval_decision': return 'checkmark.circle.fill';
      case 'event_invitation': return 'envelope.badge';
      case 'chat_message': return 'bubble.left.and.bubble.right.fill';
      default: return 'bell.fill';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval_decision': return colors.primary;
      case 'event_invitation': return '#FF6B35';
      case 'chat_message': return '#2563EB';
      default: return colors.icon;
    }
  };

  const getChatPartnerName = (n: AppNotification) => {
    try {
      const app: any = typeof n.application === 'object' ? n.application : null;
      const ev: any = app?.event && typeof app.event === 'object' ? app.event : (typeof n.event === 'object' ? n.event : null);
      const org: any = ev?.organization && typeof ev.organization === 'object' ? ev.organization : null;
      const school: any = ev?.targetSchool && typeof ev.targetSchool === 'object' ? ev.targetSchool : null;
      const schoolName = ev?.eventType === 'school' ? (school?.name || '') : '';
      const orgName = org?.organizationName || [org?.firstName, org?.lastName].filter(Boolean).join(' ').trim();
      const name = (schoolName && schoolName.trim()) ? schoolName : orgName;
      return name || (ev?.eventType === 'school' ? 'Szkoła' : 'Organizator');
    } catch {
      return 'Organizator';
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
      } else if (n.type === 'chat_message' && n.application) {
        const applicationId = typeof n.application === 'object' ? n.application.id : n.application;
        router.push(`/chat?applicationId=${encodeURIComponent(String(applicationId))}` as any);
      }
  } catch {
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
          <TouchableOpacity key={n.id} onPress={() => handlePressNotification(n)} style={{ marginBottom: 14 }}>
            <Card style={{ backgroundColor: '#EFEFEF', borderRadius: 22, elevation: 0 }}>
              <Card.Content style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ marginRight: 12, marginTop: 4 }}>
                    <View
                      style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${getNotificationColor(n.type)}20` }}
                    >
                      <IconSymbol name={getNotificationIcon(n.type)} size={20} color={getNotificationColor(n.type)} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                        {n.type === 'approval_decision'
                          ? 'Decyzja o aplikacji'
                          : n.type === 'event_invitation'
                          ? 'Zaproszenie na wydarzenie'
                          : `Wiadomość od “${getChatPartnerName(n)}”`}
                      </Text>
                      {!n.isRead && (
                        <View style={{ width: 8, height: 8, backgroundColor: Colors.primary, borderRadius: 4, marginLeft: 8, marginTop: 6 }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                      {n.message || (n.type === 'approval_decision' ? (n.decision === 'accepted' ? 'Twoja aplikacja została zaakceptowana.' : 'Twoja aplikacja została odrzucona.') : 'Zaproszenie do udziału w wydarzeniu')}
                    </Text>
                    {n.type === 'event_invitation' && n.actionRequired && (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                        <TouchableOpacity onPress={() => handleInvitationAction(n, 'accept')} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#16A34A' }}>
                          <Text style={{ color: 'white', fontWeight: '600' }}>Akceptuj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleInvitationAction(n, 'decline')} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#DC2626' }}>
                          <Text style={{ color: 'white', fontWeight: '600' }}>Odrzuć</Text>
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