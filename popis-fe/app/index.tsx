import { useRouter } from 'expo-router';
import { useAuth } from '@/app/auth/context';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useEffect } from 'react';

export default function AppIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('AppIndex render - user:', user, 'loading:', loading);

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('Redirecting to /(tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('Redirecting to /auth/login');
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router]);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;

  return <View />;
}

