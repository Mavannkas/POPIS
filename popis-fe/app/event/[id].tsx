import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Linking, RefreshControl, TextInput } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { KeyboardAwareScrollView, TextArea } from '@/components/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { API_URL } from '@/lib/http';
import { getCategoryEmoji, getCategoryLabel, getCategoryColor, applyToEvent, getEventById, getMyApplications, type Event, type Application } from '@/lib/services/events';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

export default function EventDetailScreen() {
  const colors = Colors;
  const { id } = useLocalSearchParams();
  // Recommendation message removed from UI/logic per latest design
  const [event, setEvent] = useState<Event | null>(null);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const ev = await getEventById(String(id));
      setEvent(ev);
      try {
        const apps = await getMyApplications();
        const found = (apps.applications || []).find(a => {
          const appEventId = typeof a.event === 'object' ? (a.event as any).id : a.event;
          return String(appEventId) === String(id);
        }) || null;
        setMyApplication(found as any);
      } catch (e) {
        console.warn('Failed to load my application for event', e);
      }
    } catch (e) {
      console.error('Failed to load event', e);
    } finally {
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const [joining, setJoining] = useState(false);
  const [justification, setJustification] = useState('');
  const [justificationError, setJustificationError] = useState('');
  const justificationRef = useRef<TextInput | null>(null);
  const handleJoinEvent = async () => {
    // Prefer the loaded event's actual ID over the route param
    const actualEventId = (event && (event as any).id) ? String((event as any).id) : (id ? String(id) : '')
    if (!actualEventId) return;
    try {
      setJustificationError('');
      if (!justification || justification.trim().length < 10) {
        setJustificationError('Uzasadnienie jest wymagane (min. 10 znaków)');
        // Scroll to bottom and focus the field
        setTimeout(() => {
          justificationRef.current?.focus();
        }, 50);
        return;
      }
      setJoining(true);
      const res = await applyToEvent({ eventId: actualEventId, message: justification.trim() });
      if (res.success) {
        // Navigate back or show success toast
        console.log('Applied successfully');
        router.back();
      } else {
        console.warn('Apply failed', res.error);
      }
    } catch (e) {
      console.error('Apply error', e);
    } finally {
      setJoining(false);
    }
  };

  const handleOpenChat = async () => {
    const appId = (myApplication as any)?.id as string | undefined;
    if (appId) {
      router.push(`/chat?applicationId=${encodeURIComponent(appId)}` as any);
      return;
    }
    // If application unknown, open placeholder
    router.push(`/chat` as any);
  };

  // Share action can be implemented later if needed

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header image full-bleed without side margins */}
        <View>
          <View style={styles.headerImageWrapper}>
            {(() => {
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
              const imageUrl = resolveImageUrl((event as any)?.image);
              return imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.headerImage} resizeMode="cover" />
              ) : null;
            })()}
            {myApplication ? (() => {
              const s = myApplication.status
              const bg = s === 'accepted' ? '#73A641' : (s === 'rejected' ? '#EF4444' : (s === 'completed' ? '#3B82F6' : '#E8A031'))
              const label = s === 'accepted' ? 'Zaakceptowano' : (s === 'rejected' ? 'Odrzucono' : (s === 'completed' ? 'Ukończony' : 'Zapisano'))
              return (
                <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                  <Text style={styles.statusBadgeText}>{label}</Text>
                </View>
              )
            })() : null}
          </View>
        </View>

        <View className="px-4 py-6">
          {/* Title and Category */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                {event?.title || 'Wydarzenie'}
              </Text>
              <Text style={{ color: '#3088BF', fontWeight: '500', fontSize: 16 }}>
                👤 {event && event.organization ? (typeof event.organization === 'object' ? (event.organization.name || 'Organizacja') : 'Organizacja') : 'Organizacja'}
              </Text>
            </View>
            <View style={styles.categoryPillHeaderLight}>
              <Text style={styles.categoryPillEmojiLight}>{getCategoryEmoji(event?.category || 'other')}</Text>
              <Text style={styles.categoryPillTextLight}>{getCategoryLabel(event?.category || 'other')}</Text>
            </View>
          </View>

          {/* Event Details */}
          <Card style={{ backgroundColor: '#FFFFFF', marginBottom: 24, elevation: 0, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' }}>
            <Card.Content style={{ padding: 16, backgroundColor: 'transparent' }}>
              <View style={{ gap: 12 }}>
                {/* First row: capacity + right-aligned event type pill */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                    <View style={styles.iconCircleSmall}>
                      <Text style={styles.iconEmojiSmall}>👥</Text>
                    </View>
                    <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                      {(event?.acceptedCount || 0)}/{event?.maxVolunteers ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.freePill}>
                    <Text style={styles.freePillText}>{event?.eventType === 'school' ? 'Szkolne' : 'Publiczne'}</Text>
                  </View>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircleSmall}>
                    <Text style={styles.iconEmojiSmall}>📅</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {event?.startDate ? new Date(event.startDate).toLocaleDateString('pl-PL') : ''}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircleSmall}>
                    <Text style={styles.iconEmojiSmall}>⏰</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {event?.startDate ? new Date(event.startDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircleSmall}>
                    <Text style={styles.iconEmojiSmall}>📍</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {event?.location?.address || ''}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Opis</Text>
            <Text className="text-gray-600 leading-6">{event?.additionalInfo || ''}</Text>
          </View>

          {/* Mini mapa z lokalizacją i linkiem do Google Maps */}
          {event?.location?.lat !== undefined && event?.location?.lng !== undefined && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Lokalizacja na mapie</Text>
              <View style={styles.miniMapContainer}>
                <MapView
                  style={styles.miniMap}
                  provider={PROVIDER_DEFAULT}
                  initialRegion={{
                    latitude: Number(event.location.lat),
                    longitude: Number(event.location.lng),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(event.location.lat),
                      longitude: Number(event.location.lng),
                    }}
                    title={event.title}
                    description={event.location?.address || ''}
                  >
                    <View style={styles.markerContainer}>
                      <View style={[styles.markerPin, { backgroundColor: colors.primary }]}> 
                        <Text style={styles.markerEmoji}>{getCategoryEmoji(event?.category || 'other')}</Text>
                      </View>
                      <View style={[styles.markerTip, { borderTopColor: colors.primary }]} />
                    </View>
                  </Marker>
                </MapView>
              </View>
              <Button
                mode="outlined"
                onPress={() => {
                  const lat = Number(event.location?.lat);
                  const lng = Number(event.location?.lng);
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                  Linking.openURL(url);
                }}
                style={{ borderRadius: 20, marginTop: 10, borderColor: '#A61F5E' }}
                textColor="#A61F5E"
              >
                Otwórz w Mapach Google
              </Button>
            </View>
          )}

          {event?.requirements ? (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Wymagania
              </Text>
              <Text className="text-gray-600 leading-6">{event.requirements}</Text>
            </View>
          ) : null}

          {/* Category section omitted in this view per mock */}

          {/* Uzasadnienie (wymagane) - tylko jeśli użytkownik się jeszcze nie zgłosił */}
          {!myApplication && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Uzasadnienie zgłoszenia</Text>
              <TextArea
                ref={justificationRef as any}
                label={undefined}
                value={justification}
                onChangeText={setJustification}
                placeholder="Napisz, dlaczego chcesz wziąć udział..."
                error={justificationError}
                minHeight={120}
                maxHeight={200}
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white px-4 py-4 border-t border-gray-200">
        {myApplication ? (
          <Button
            mode="contained"
            onPress={handleOpenChat}
            style={{ backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 6 }}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={{ fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}
          >
            Czatuj z organizatorem
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleJoinEvent}
            style={{ backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 6 }}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={{ fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}
            loading={joining}
            disabled={joining}
          >
            Zapisz się
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImageWrapper: {
    height: 192,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  savedBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: '#73A641',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedBadgeText: {
    color: 'white',
    fontWeight: '600',
  },
  freePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  freePillIcon: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 6,
  },
  freePillText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: '600',
  },
  categoryPillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A61F5E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryPillHeaderLight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1DAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryPillEmoji: {
    color: 'white',
    fontSize: 12,
    marginRight: 6,
  },
  categoryPillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryPillTextLight: {
    color: '#A61F5E',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryPillEmojiLight: {
    color: '#A61F5E',
    fontSize: 12,
    marginRight: 6,
  },
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
  iconCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1DAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmojiSmall: {
    fontSize: 14,
  },
  miniMapContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});