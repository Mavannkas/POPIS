import { useRouter } from "expo-router";
import { useState } from "react";
import * as Notifications from 'expo-notifications';
import { Image, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuth } from "@/lib/auth/context";
import { Colors } from "@/constants/theme";
import { KeyboardAwareScrollView, Input } from "@/components/ui";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const colors = Colors;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
      // Try to register Expo push token and send to backend
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const tokenResponse = await Notifications.getExpoPushTokenAsync();
          const token = (tokenResponse as any)?.data || (tokenResponse as any)?.expoPushToken || '';
          if (token) {
            const base = process.env.EXPO_PUBLIC_API_URL || '';
            if (base) {
              await fetch(`${base}/api/users/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ expoPushToken: token }),
              });
            }
          }
        }
      } catch {}
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}
      contentContainerStyle={{
        paddingHorizontal: 32,
        paddingTop: 20,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 200, objectFit: "contain" }}
        />
      </View>

      <Text
        style={{
          textAlign: "center",
          fontSize: 24,
          marginBottom: 8,
          color: 'black',
        }}
      >
        Zaloguj się
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: "#E5E5E5",
          marginHorizontal: 40,
          marginBottom: 32,
        }}
      />

      <View style={{ marginBottom: 16 }}>
        <Input
          label="Adres e-mail"
          value={email}
          onChangeText={setEmail}
          variant="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Input
          label="Hasło"
          value={password}
          onChangeText={setPassword}
          variant="outlined"
          secureTextEntry
          error={error || undefined}
        />
      </View>

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 50,
          marginBottom: 16,
        }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ fontSize: 15, fontWeight: "600", letterSpacing: 0.5 }}
      >
        ZALOGUJ SIĘ
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.push("/auth/register")}
        style={{
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 50,
          marginBottom: 24,
        }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: 0.5,
          color: colors.primary,
        }}
      >
        ZAREJESTRUJ SIĘ
      </Button>

    </KeyboardAwareScrollView>
  );
}