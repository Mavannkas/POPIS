import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { theme } from '@/constants/theme';
import { AuthProvider } from '@/app/auth/context';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { View } from 'react-native';
import './globals.css';

export default function RootLayout() {
  const [loaded] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  if (!loaded) return <View />;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </PaperProvider>
  );
}
