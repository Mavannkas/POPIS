import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Linking, TextInput, RefreshControl } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { CategoryIcon } from '@/components/ui/category-icon';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { TextArea } from '@/components/ui/textarea';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getCategoryEmoji, getCategoryLabel, getCategoryColor, applyToEvent, getEventById, getMyApplications, type Event, type Application } from '@/lib/services/events';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

export default function EventDetailScreen() {
  const colors = Colors;
  const { id } = useLocalSearchParams();
  const [recommendation, setRecommendation] = useState('');
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const textAreaRef = useRef<TextInput>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
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
      setLoading(false);
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
  const [recommendationError, setRecommendationError] = useState('');
  const handleJoinEvent = async () => {
    if (!id) return;
    try {
      if (!recommendation.trim()) {
        setRecommendationError('To pole jest wymagane');
        // focus the text area for user convenience
        setTimeout(() => textAreaRef.current?.focus(), 50);
        return;
      }
      setRecommendationError('');
      setJoining(true);
      const res = await applyToEvent({ eventId: String(id), message: recommendation.trim() || undefined });
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
    // Navigate to chat screen if possible (requires either chatChannelId or event/org context)
    const channelId = (myApplication as any)?.chatChannelId as string | undefined;
    if (channelId) {
      router.push(`/chat?channelId=${encodeURIComponent(channelId)}` as any);
    } else {
      // Fallback: navigate with event id; chat screen can handle creation or show info
      router.push(`/chat?eventId=${encodeURIComponent(String(id || ''))}` as any);
    }
  };

  // Share action can be implemented later if needed

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Event Image */}
        <View className="h-48 bg-gray-200">
          {event && (event as any).image && typeof (event as any).image === 'object' && (event as any).image?.url ? (
            <Image 
              source={{ uri: (event as any).image.url as string }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View className="px-4 py-6">
          {/* Title and Category */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                {event?.title || 'Wydarzenie'}
              </Text>
              <Text className="text-primary font-medium text-base">
                👤 {event && event.organization ? (typeof event.organization === 'object' ? (event.organization.name || 'Organizacja') : 'Organizacja') : 'Organizacja'}
              </Text>
            </View>
            <Chip
              style={{ backgroundColor: colors.primary + '20' }}
              textStyle={{ color: colors.primary, fontWeight: '600' }}
            >
              <Text className="mr-1">{getCategoryEmoji(event?.category || 'other')}</Text>
              {getCategoryLabel(event?.category || 'other')}
            </Chip>
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
                    {event?.startDate ? new Date(event.startDate).toLocaleDateString('pl-PL') : ''}
                  </Text>
                </View>
                {event?.eventType === 'school' && (
                  <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconEmoji}>🏫</Text>
                    </View>
                    <Text className="text-gray-700 font-medium" style={{ marginLeft: 12, flex: 1, flexShrink: 1 }}>
                      {(() => {
                        const ts: any = (event as any)?.targetSchool;
                        if (ts && typeof ts === 'object' && ts.name) return ts.name as string;
                        return 'Wydarzenie szkolne';
                      })()}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>⏰</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {event?.duration ? `${event.duration}h` : ''}
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 2 }}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>📍</Text>
                  </View>
                  <Text className="text-gray-700 font-medium" style={{ marginLeft: 12 }}>
                    {event?.location?.address || ''} {event?.location?.city ? `• ${event.location.city}` : ''}
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
              {event?.additionalInfo || ''}
            </Text>
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
                      <View style={[styles.markerPin, { backgroundColor: getCategoryColor(event?.category || 'other') }]}> 
                        <Text style={styles.markerEmoji}>{getCategoryEmoji(event?.category || 'other')}</Text>
                      </View>
                      <View style={[styles.markerTip, { borderTopColor: getCategoryColor(event?.category || 'other') }]} />
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

          {/* Category */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Kategoria
            </Text>
            <View className="flex-row items-center">
              <CategoryIcon category={event?.category || 'other'} size="small" />
              <Chip
                style={{ backgroundColor: '#F5F5F5', marginLeft: 4 }}
                textStyle={{ color: '#666', fontSize: 12 }}
              >
                {getCategoryLabel(event?.category || 'other')}
              </Chip>
            </View>
          </View>

          {/* Recommendation Textarea (only when user has not applied) */}
          {!myApplication && (
            <View className="mb-8">
              <TextArea
                label="Dlaczego powinieneś zostać wybrany?"
                description="Opisz swoje doświadczenie, motywację lub powody, dla których chcesz uczestniczyć w tym wydarzeniu."
                value={recommendation}
                onChangeText={setRecommendation}
                placeholder="Napisz swoją rekomendację..."
                error={recommendationError}
                ref={textAreaRef}
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
            style={{ backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 4 }}
            contentStyle={{ paddingVertical: 4 }}
            labelStyle={{ fontSize: 14, fontWeight: '600' }}
          >
            Otwórz czat z organizatorem
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleJoinEvent}
            style={{ backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 4 }}
            contentStyle={{ paddingVertical: 4 }}
            labelStyle={{ fontSize: 14, fontWeight: '600' }}
            loading={joining}
            disabled={joining}
          >
            Dołącz do wydarzenia
          </Button>
        )}
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