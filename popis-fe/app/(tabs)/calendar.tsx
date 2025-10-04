import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';
import { Card, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { getCategoryEmoji, getCategoryLabel, getMyApplications, type Application, type Event } from '@/lib/services/events';

export default function CalendarScreen() {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

	const loadData = async () => {
		try {
			setLoading(true);
			const res = await getMyApplications();
			setApplications(res.applications || []);
		} catch (e) {
			console.error('Failed to load my applications', e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const onRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const groupedByMonth = useMemo(() => {
		const map = new Map<string, { label: string; items: { app: Application; event: Event }[] }>();
		const formatter = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' });
		const eventsWithApps = applications
			.map(app => {
				const ev = (app.event as any) as Event; // depth=2 returns object
				return ev && ev.startDate ? { app, event: ev } : null;
			})
			.filter(Boolean) as { app: Application; event: Event }[];

		// Sort by startDate asc
		eventsWithApps.sort((a, b) => new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime());

		for (const item of eventsWithApps) {
			const d = new Date(item.event.startDate);
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
			const label = formatter.format(d).replace(/^./, c => c.toUpperCase());
			if (!map.has(key)) map.set(key, { label, items: [] });
			map.get(key)!.items.push(item);
		}
		return Array.from(map.entries())
			.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
			.map(([key, value]) => ({ key, ...value }));
	}, [applications]);

	const statusLabel: Record<string, string> = {
		pending: 'Oczekujące',
		accepted: 'Zaakceptowane',
		rejected: 'Odrzucone',
		completed: 'Ukończone',
	};

	const statusColor: Record<string, { bg: string; text: string }> = {
		pending: { bg: 'bg-gray-200', text: 'text-gray-700' },
		accepted: { bg: 'bg-green-100', text: 'text-green-700' },
		rejected: { bg: 'bg-red-100', text: 'text-red-700' },
		completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
	};

	return (
		<View className="flex-1 bg-white">
			<TopBar showSearch={true} />
			
			<ScrollView className="flex-1 px-4 py-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				{loading && (
					<View className="flex-row items-center mb-4">
						<ActivityIndicator />
						<Text className="ml-2 text-gray-600">Ładowanie wydarzeń...</Text>
					</View>
				)}

				{!loading && groupedByMonth.length === 0 && (
					<Text className="text-gray-600">Brak zgłoszeń na wydarzenia.</Text>
				)}

				{groupedByMonth.map(group => (
					<View key={group.key} className="mb-6">
						<Text className="text-xl font-bold text-gray-800 mb-3">{group.label}</Text>
						{group.items.map(({ app, event }) => (
							<TouchableOpacity
								key={app.id + ':' + (event.id as string)}
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
												{event.organization && (
													<Text className="text-primary font-medium text-sm mb-2">
														👤 {typeof event.organization === 'object' ? (event.organization.name || 'Organizacja') : 'Organizacja'}
													</Text>
												)}
											</View>
											<View className={`px-3 py-1 rounded-full bg-primary/10 flex-row items-center`}>
												<Text className="text-xs mr-1">{getCategoryEmoji(event.category)}</Text>
												<Text className="text-xs font-medium text-primary">
													{getCategoryLabel(event.category)}
												</Text>
											</View>
										</View>

										<View className="space-y-2 mb-3">
											<View className="flex-row items-center">
												<View style={styles.iconCircle}>
													<Text style={styles.iconEmoji}>📅</Text>
												</View>
												<Text className="text-gray-600 text-sm ml-2">{new Date(event.startDate).toLocaleDateString('pl-PL')}</Text>
											</View>
											<View className="flex-row items-center">
												<View style={styles.iconCircle}>
													<Text style={styles.iconEmoji}>⏰</Text>
												</View>
												<Text className="text-gray-600 text-sm ml-2">{event.duration}h</Text>
											</View>
											<View className="flex-row items-center">
												<View style={styles.iconCircle}>
													<Text style={styles.iconEmoji}>📍</Text>
												</View>
												<Text className="text-gray-600 text-sm ml-2">{event.location?.address || ''} {event.location?.city ? `• ${event.location.city}` : ''}</Text>
											</View>
										</View>

										<View className="mb-3">
											<View className="flex-row flex-wrap gap-2">
												<View className="flex-row items-center">
													<Chip
														style={{ backgroundColor: '#F5F5F5' }}
														textStyle={{ color: '#666', fontSize: 12 }}
													>
														{getCategoryLabel(event.category)}
													</Chip>
												</View>
												<View className={`px-3 py-1 rounded-full ${statusColor[app.status].bg}`}>
													<Text className={`text-xs font-medium ${statusColor[app.status].text}`}>
														{statusLabel[app.status]}
													</Text>
												</View>
											</View>
										</View>

										<View className="flex-row justify-between items-center">
											<View className="flex-row items-center">
												<Text className="text-gray-500 text-sm">
													{event.maxVolunteers ? `👥 miejsca: ${event.maxVolunteers}` : '👥 liczba miejsc n/d'}
												</Text>
											</View>
										</View>
									</Card.Content>
								</Card>
							</TouchableOpacity>
						))}
					</View>
				))}

				<View className="h-20" />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	iconCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#F1DAE5',
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconEmoji: {
		fontSize: 16,
	},
});