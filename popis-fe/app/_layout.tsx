import { DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	return (
		<PaperProvider theme={MD3LightTheme}>
			<ThemeProvider value={NavigationDefaultTheme}>
				<Stack
					screenOptions={{
						headerBackTitle: '',
					}}
				>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
				</Stack>
				<StatusBar style="light" />
			</ThemeProvider>
		</PaperProvider>
	);
}
