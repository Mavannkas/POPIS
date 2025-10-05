import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { TopBar } from '@/components/ui/top-bar';
import { Card } from 'react-native-paper';
import { router } from 'expo-router';
import { getMyApplications, type Application, type Event } from '@/lib/services/events';

// Extract plain text from possible rich-text (e.g., Payload Lexical) or string
function extractPlainText(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const extract = (node: any): string => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(extract).join(' ');
        if (typeof node === 'object') {
            if (typeof node.text === 'string') return node.text;
            if (node.root) return extract(node.root);
            if (node.children) return extract(node.children);
        }
        return '';
    };
    const text = extract(value);
    return typeof text === 'string' ? text.trim() : '';
}

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

    // Status dot colors only; labels not used in this view

  const statusDot: Record<string, string> = {
    pending: '#E8A031',
    accepted: '#73A641',
    rejected: '#EF4444',
    completed: '#3B82F6',
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
                    <View key={group.key} className="mb-8">
                        <Text className="text-2xl font-bold text-gray-900 mb-4">{group.label}</Text>
                        {group.items.map(({ app, event }) => {
                            const date = new Date(event.startDate);
                            const day = date.getDate();
                            const weekday = new Intl.DateTimeFormat('pl-PL', { weekday: 'long' })
                                .format(date)
                                .replace(/^./, c => c.toUpperCase());
                            const year = date.getFullYear();
                            return (
                                <TouchableOpacity
                                    key={app.id + ':' + (event.id as string)}
                                    className="mb-4"
                                    onPress={() => router.push(`/event/${event.id}` as any)}
                                >
                                    <View className="flex-row items-stretch">
                                        {/* Left date rail */}
                                        <View className="w-14 mr-2 items-center justify-center">
                                            <Text className="text-2xl font-bold text-gray-800 leading-none">{day}</Text>
                                            <Text className="text-[11px] text-gray-500 mt-1 leading-3">{weekday}</Text>
                                            <Text className="text-[10px] text-gray-400 leading-3">{year}</Text>
                                        </View>

                                        {/* Card */}
                                        <Card className="flex-1 bg-white shadow-sm rounded-2xl overflow-hidden">
                                            <Card.Content className="p-4">
                                                <View className="flex-row items-start justify-between">
                                                    <View className="flex-1 pr-3">
                                                        <Text className="text-lg font-semibold text-gray-900" numberOfLines={2}>
                                                            {event.title}
                                                        </Text>
                                                        {(() => {
                                                            const descriptionText = extractPlainText((event as any).description);
                                                            return descriptionText ? (
                                                                <Text className="text-gray-500 mt-1" numberOfLines={1} ellipsizeMode="tail">
                                                                    {descriptionText}
                                                                </Text>
                                                            ) : null;
                                                        })()}
                                                    </View>
                                                    <View style={[styles.statusDot, { backgroundColor: statusDot[app.status] }]} />
                                                </View>

                                                {/* Meta row removed per new design: date/time shown on rail; keep card clean */}
                                            </Card.Content>
                                        </Card>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
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
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#73A641',
        marginLeft: 8,
        marginTop: 4,
    },
    metaIcon: {
        fontSize: 16,
        color: '#D17A92',
        marginRight: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#D17A92',
        fontWeight: '600',
    },
});