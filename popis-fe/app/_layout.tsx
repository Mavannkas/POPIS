import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { theme } from '@/constants/theme';
import { AuthProvider } from '@/lib/auth/context';
import { NotificationsProvider } from '@/lib/notifications/context';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import './globals.css';

export default function RootLayout() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  const pendingChatIdRef = useRef<string | null>(null)
  // Handle push notification taps to navigate directly to chat
  useEffect(() => {
    const handleResponse = (response: any) => {
      try {
        const data: any = response?.notification?.request?.content?.data || {};
        if (data?.type === 'chat_message' && data?.applicationId) {
          const applicationId = String(data.applicationId);
          pendingChatIdRef.current = applicationId
          if (loaded) {
            setTimeout(() => {
              router.push(`/chat?applicationId=${encodeURIComponent(applicationId)}` as any);
              pendingChatIdRef.current = null
            }, 0)
          }
        }
      } catch {}
    };

    // Handle cold start
    Notifications.getLastNotificationResponseAsync().then((resp: any) => {
      if (resp) handleResponse(resp);
    }).catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => {
      try {
        Notifications.removeNotificationSubscription(sub);
      } catch {}
    };
  }, []);

  // Perform deferred navigation once app is ready
  useEffect(() => {
    if (loaded && pendingChatIdRef.current) {
      const id = pendingChatIdRef.current
      setTimeout(() => {
        router.push(`/chat?applicationId=${encodeURIComponent(String(id))}` as any)
        pendingChatIdRef.current = null
      }, 0)
    }
  }, [loaded])

  if (!loaded) return <View />;

  // Set global default font family to Poppins
  const T: any = Text as any;
  const TI: any = TextInput as any;
  if (!T.defaultProps) T.defaultProps = {};
  if (!TI.defaultProps) TI.defaultProps = {};
  T.defaultProps.style = StyleSheet.flatten([T.defaultProps.style, { fontFamily: 'Poppins_400Regular' }]);
  TI.defaultProps.style = StyleSheet.flatten([TI.defaultProps.style, { fontFamily: 'Poppins_400Regular' }]);


  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NotificationsProvider>
        <Stack
          screenOptions={{
            headerBackTitle: '',
            headerStyle: {
              backgroundColor: 'white',
            },
            headerTintColor: '#A61F5E',
            headerTitleStyle: {
              fontFamily: 'Poppins_600SemiBold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen
            name="account"
            options={{
              title: 'Ustawienia konta',
              presentation: 'card'
            }}
          />
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
          <Stack.Screen
            name="chat/index"
            options={{
              title: 'Czat',
              presentation: 'card'
            }}
          />
        </Stack>
        <StatusBar style="dark" />
        </NotificationsProvider>
      </AuthProvider>
    </PaperProvider>
  );
}