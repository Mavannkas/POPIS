import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { theme } from '@/constants/theme';
import { AuthProvider } from '@/lib/auth/context';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { View } from 'react-native';
import './globals.css';

export default function RootLayout() {
  const [loaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  if (!loaded) return <View />;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerBackTitle: '',
            headerStyle: {
              backgroundColor: 'white',
            },
            headerTintColor: '#A61F5E',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen
            name="search"
            options={{
              title: 'Szukaj wydarzeń',
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              title: 'Powiadomienia',
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="event/[id]"
            options={{
              title: 'Szczegóły wydarzenia',
              presentation: 'card'
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </PaperProvider>
  );
}