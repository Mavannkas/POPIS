import {
	DarkTheme as NavigationDarkTheme,
	DefaultTheme as NavigationDefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
	const navigationTheme = colorScheme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

	return (
		<PaperProvider theme={paperTheme}>
			<ThemeProvider value={navigationTheme}>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
				</Stack>
				<StatusBar style="auto" />
			</ThemeProvider>
		</PaperProvider>
	);
}
