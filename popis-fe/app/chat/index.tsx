import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ChatScreen() {
	const { channelId, eventId } = useLocalSearchParams();
	return (
		<View className="flex-1 items-center justify-center bg-white p-4">
			<Text className="text-xl font-semibold text-gray-800 mb-2">Czat</Text>
			{channelId ? (
				<Text className="text-gray-700">Kanał: {String(channelId)}</Text>
			) : (
				<Text className="text-gray-700">Brak kanału. Event: {String(eventId || '')}</Text>
			)}
		</View>
	);
}


