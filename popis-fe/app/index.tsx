import { Redirect } from 'expo-router';
import { useAuth } from '@/app/auth/context';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function AppIndex() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <Redirect href={user ? '/(tabs)' : '/auth/login'} />;
}

