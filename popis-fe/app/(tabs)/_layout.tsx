import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { c } from '@/constants/theme';
import { useAuth } from '@/app/auth/context';
import { Button } from 'react-native-paper';

export default function TabLayout() {
  const { signOut } = useAuth();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: c.magenta, headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Główna',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? "house.fill" : "house"}
              color={color}
            />
          ),
          headerShown: true,
          headerRight: () => <Button onPress={signOut}>Wyloguj</Button>,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? "map.fill" : "map"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalendarz',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name={focused ? "calendar" : "calendar"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
