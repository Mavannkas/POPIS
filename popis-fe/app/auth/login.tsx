import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "./context";
import { c } from "@/constants/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.white,
        paddingHorizontal: 32,
        paddingTop: 64,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 240, objectFit: "contain" }}
        />
      </View>

      <Text
        style={{
          textAlign: "center",
          fontSize: 24,
          marginBottom: 8,
          color: c.black,
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

      <TextInput
        label="Adres e-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 16, backgroundColor: c.white, paddingLeft: 10 }}
        outlineStyle={{ borderRadius: 25 }}
      />

      <TextInput
        label="Hasło"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={{ marginBottom: 24, backgroundColor: c.white, paddingLeft: 10 }}
        outlineStyle={{ borderRadius: 25 }}
      />

      {error && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 12 }}>
          {error}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        style={{
          backgroundColor: c.magenta,
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
          borderColor: c.magenta,
          borderWidth: 2,
          borderRadius: 50,
          marginBottom: 24,
        }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: 0.5,
          color: c.magenta,
        }}
      >
        ZAREJESTRUJ SIĘ
      </Button>

    </View>
  );
}
