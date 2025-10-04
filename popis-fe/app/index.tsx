import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/context';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useEffect } from 'react';

export default function AppIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router]);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;

  return <View />;
}