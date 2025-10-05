import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { TopBar } from '@/components/ui/top-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Event, getCategoryColor, getCategoryLabel, getCategoryEmoji, applyToEvent } from '@/lib/services/events';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.1;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DEFAULT_LOCATION = {
	latitude: 50.0647,
	longitude: 19.945,
	latitudeDelta: LATITUDE_DELTA,
	longitudeDelta: LONGITUDE_DELTA,
};

interface MapViewNativeProps {
    events: Event[];
    loading: boolean;
    onOpenFilters?: () => void;
  activeFiltersCount?: number;
}

async function getUserLocation() {
	const { status } = await Location.requestForegroundPermissionsAsync();
	if (status === 'granted') {
		return await Location.getCurrentPositionAsync({});
	}
	return null;
}

export default function MapViewNative({ events, loading, onOpenFilters, activeFiltersCount = 0 }: MapViewNativeProps) {
	const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
	const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
	const [initialRegion, setInitialRegion] = useState(DEFAULT_LOCATION);
	const [joining, setJoining] = useState(false);
	const mapRef = useRef<MapView>(null);

	// Only use events that have valid coordinates
	const eventsWithCoords = (events || []).filter(e =>
		e && e.location && typeof e.location.lat === 'number' && typeof e.location.lng === 'number' && !Number.isNaN(e.location.lat) && !Number.isNaN(e.location.lng)
	);

	useEffect(() => {
		getUserLocation()
			.then(location => {
				if (location) {
					setUserLocation(location);
					setInitialRegion({
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						latitudeDelta: LATITUDE_DELTA,
						longitudeDelta: LONGITUDE_DELTA,
					});
				}
			})
			.catch(err => console.log('Error getting location:', err));
	}, []);

	useEffect(() => {
		if (eventsWithCoords.length > 0 && mapRef.current) {
			const coordinates = eventsWithCoords.map(e => ({
				latitude: e.location.lat as number,
				longitude: e.location.lng as number,
			}));

			if (userLocation) {
				coordinates.push({
					latitude: userLocation.coords.latitude,
					longitude: userLocation.coords.longitude,
				});
			}

			if (coordinates.length > 0) {
				setTimeout(() => {
					mapRef.current?.fitToCoordinates(coordinates, {
						edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
						animated: true,
					});
				}, 800);
			}
		}
	}, [eventsWithCoords, userLocation]);

	const centerOnUser = async () => {
		let location = userLocation;
		if (!location) {
			location = await getUserLocation();
			if (location) setUserLocation(location);
		}

		if (location && mapRef.current) {
			mapRef.current.animateToRegion(
				{
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					latitudeDelta: LATITUDE_DELTA,
					longitudeDelta: LONGITUDE_DELTA,
				},
				500
			);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('pl-PL', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
	};

	const handleMarkerPress = (event: Event) => {
		setSelectedMarker(event.id);

		// Center map on marker with offset for popup (guard coordinates)
		const lat = event.location?.lat;
		const lng = event.location?.lng;
		if (mapRef.current && typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
			const latOffset = LATITUDE_DELTA * 0.25;
			mapRef.current.animateToRegion(
				{
					latitude: lat - latOffset,
					longitude: lng,
					latitudeDelta: LATITUDE_DELTA,
					longitudeDelta: LONGITUDE_DELTA,
				},
				300
			);
		}
	};

	return (
		<View className="flex-1 bg-white">
			<TopBar showSearch={true} />

			<View className="flex-1">
				{loading && (
					<View className="absolute top-2 left-0 right-0 z-10 bg-white/80 p-4 flex-row items-center justify-center">
						<ActivityIndicator size="small" color="#6366f1" />
						<Text className="ml-2 text-gray-600">Ładowanie wydarzeń...</Text>
					</View>
				)}

				<MapView
					ref={mapRef}
					style={styles.map}
					provider={PROVIDER_DEFAULT}
					initialRegion={initialRegion}
					showsUserLocation={true}
					showsMyLocationButton={false}>
					{eventsWithCoords.map(event => (
						<Marker
							key={event.id}
							coordinate={{
								latitude: event.location.lat as number,
								longitude: event.location.lng as number,
							}}
							onPress={() => handleMarkerPress(event)}>
							<View style={styles.markerContainer}>
								<View style={[styles.markerPin, { backgroundColor: getCategoryColor(event.category) }]}>
									<Text style={styles.markerEmoji}>{getCategoryEmoji(event.category)}</Text>
								</View>
								<View style={[styles.markerTip, { borderTopColor: getCategoryColor(event.category) }]} />
							</View>
						</Marker>
					))}
				</MapView>

				{selectedMarker &&
					(() => {
						const event = events?.find(e => e.id === selectedMarker);
						if (!event) return null;

						return (
							<View style={styles.popupContainer}>
								<View style={styles.popup}>
									<View style={styles.popupHeader}>
										<View style={styles.popupHeaderText}>
											<Text style={styles.popupTitle} numberOfLines={2}>
												{event.title}
											</Text>
											<Text style={styles.popupOrganizer}>
												👤 {event && event.organization ? (typeof event.organization === 'object' ? (event.organization.name || 'Organizacja') : 'Organizacja') : 'Organizacja'}
											</Text>
										</View>
										<TouchableOpacity style={styles.popupCloseButton} onPress={() => setSelectedMarker(null)}>
											<Text style={styles.popupCloseText}>✕</Text>
										</TouchableOpacity>
									</View>

									<ScrollView style={styles.popupScroll} showsVerticalScrollIndicator={false}>
										<View style={styles.detailsCard}>
											<View style={styles.detailsRowFirst}> 
												<View style={styles.detailInline}>
													<View style={styles.iconCircleSmall}> 
														<Text style={styles.iconEmojiSmall}>👥</Text>
													</View>
													<Text style={styles.detailText}>{(event.acceptedCount || 0)}/{event.maxVolunteers ?? '—'}</Text>
												</View>
												<View style={styles.freePill}>
													<Text style={styles.freePillText}>{event.eventType === 'school' ? 'Szkolne' : 'Publiczne'}</Text>
												</View>
											</View>

											<View style={styles.detailInline}>
												<View style={styles.iconCircleSmall}><Text style={styles.iconEmojiSmall}>📅</Text></View>
												<Text style={styles.detailText}>{formatDate(event.startDate)}</Text>
											</View>
											<View style={styles.detailInline}>
												<View style={styles.iconCircleSmall}><Text style={styles.iconEmojiSmall}>⏰</Text></View>
												<Text style={styles.detailText}>{formatTime(event.startDate)}</Text>
											</View>
											<View style={styles.detailInline}>
												<View style={styles.iconCircleSmall}><Text style={styles.iconEmojiSmall}>📍</Text></View>
												<Text style={styles.detailText}>{event.location.address}</Text>
											</View>
										</View>

										<View style={styles.actionsRow}>
											<TouchableOpacity
												style={styles.secondaryButton}
												onPress={() => {
													setSelectedMarker(null);
													router.push(`/event/${event.id}` as any);
												}}>
												<Text style={styles.secondaryButtonText}>Pokaż</Text>
											</TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.primaryButton}
                                                onPress={() => {
                                                    setSelectedMarker(null);
                                                    router.push(`/event/${event.id}` as any);
                                                }}
                                                disabled={joining}>
                                                <Text style={styles.primaryButtonText}>Przejdź do wydarzenia</Text>
                                            </TouchableOpacity>
										</View>
									</ScrollView>
								</View>
							</View>
						);
					})()}

				{!loading && !selectedMarker && (
					<TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
						<Text style={styles.locationButtonIcon}>📍</Text>
					</TouchableOpacity>
				)}

				{!loading && !selectedMarker && (
					<TouchableOpacity style={styles.filtersFab} onPress={onOpenFilters}>
						<IconSymbol name={'line.3.horizontal.decrease.circle.fill'} size={22} color={'white'} />
						{activeFiltersCount > 0 && (
							<View style={styles.filtersBadge}>
								<Text style={styles.filtersBadgeText}>{activeFiltersCount}</Text>
							</View>
						)}
					</TouchableOpacity>
				)}

				{!loading && !selectedMarker && events && (
					<View className="absolute bottom-4 left-4 right-4 bg-white rounded-full px-4 py-3 shadow-lg">
						<Text className="text-center text-gray-700 font-medium">
							🗺️ {events.length} {events.length === 1 ? 'wydarzenie' : 'wydarzeń'}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	map: {
		width: '100%',
		height: '100%',
	},
	filtersButton: {
		backgroundColor: 'white',
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	filtersButtonText: {
		color: '#1f2937',
		fontWeight: '600',
	},
	locationButton: {
		position: 'absolute',
		bottom: 80,
		right: 16,
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	locationButtonIcon: {
		fontSize: 24,
	},
	filtersFab: {
		position: 'absolute',
		bottom: 140,
		right: 16,
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#3B82F6',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 6,
	},
	filtersBadge: {
		position: 'absolute',
		top: -4,
		right: -4,
		backgroundColor: '#EF4444',
		borderRadius: 10,
		paddingHorizontal: 5,
		minWidth: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	filtersBadgeText: {
		color: 'white',
		fontSize: 12,
		fontWeight: '700',
	},
	markerContainer: {
		alignItems: 'center',
	},
	markerPin: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 3,
		borderColor: 'white',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 5,
	},
	markerEmoji: {
		fontSize: 20,
	},
	markerTip: {
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 6,
		borderRightWidth: 6,
		borderTopWidth: 10,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		marginTop: -1,
	},
	popupContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'flex-end',
	},
	popup: {
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingTop: 20,
		paddingHorizontal: 20,
		paddingBottom: 30,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 10,
		maxHeight: '100%',
	},
	popupScroll: {
		flex: 1,
	},
	popupHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	popupHeaderText: {
		flex: 1,
		paddingRight: 8,
	},
	popupTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#1f2937',
		marginBottom: 8,
		lineHeight: 24,
	},
	popupOrganizer: {
		color: '#3088BF',
		fontWeight: '500',
		fontSize: 14,
		marginBottom: 8,
	},
	popupCategoryBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		backgroundColor: '#F1DAE5',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		gap: 6,
	},
	popupCategoryEmoji: {
		fontSize: 14,
	},
	popupCategoryText: {
		fontSize: 12,
		color: '#A61F5E',
		fontWeight: '600',
	},
	popupCloseButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	popupCloseText: {
		fontSize: 16,
		color: '#6b7280',
		fontWeight: '600',
	},
	popupDetails: {
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	// New card-like details similar to Event Details screen
	detailsCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#E5E7EB',
		padding: 16,
		marginBottom: 16,
	},
	detailsRowFirst: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
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
	detailInline: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 12,
	},
	detailText: {
		color: '#374151',
		fontWeight: '600',
		fontSize: 14,
	},
	freePill: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F5F5',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	freePillText: {
		color: '#6B7280',
		fontSize: 12,
		fontWeight: '700',
	},
	popupDetailRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		width: '48%',
		paddingVertical: 6,
	},
	popupDetailRowFull: {
		width: '100%',
	},
	popupIconCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
	},
	popupDetailIcon: {
		fontSize: 16,
	},
	popupDetailContent: {
		flex: 1,
	},
	popupDetailLabel: {
		fontSize: 10,
		color: '#9ca3af',
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	popupDetailText: {
		fontSize: 13,
		color: '#1f2937',
		fontWeight: '600',
	},
	popupDetailSubtext: {
		fontSize: 13,
		color: '#6b7280',
		marginTop: 2,
	},
	actionsRow: {
		flexDirection: 'row',
		gap: 12,
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: '#E9C7D7',
		paddingVertical: 12,
		borderRadius: 28,
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#7A1C4B',
		fontWeight: '700',
		fontSize: 14,
	},
	primaryButton: {
		flex: 1,
		backgroundColor: '#A61F5E',
		paddingVertical: 12,
		borderRadius: 28,
		alignItems: 'center',
	},
	primaryButtonText: {
		color: 'white',
		fontWeight: '700',
		fontSize: 14,
	},
});
