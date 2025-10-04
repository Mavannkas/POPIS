import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Image, ScrollView, View, TouchableOpacity } from 'react-native';
import { Button, Checkbox, Switch, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/lib/auth/context';
import { Colors } from '@/constants/theme';
import { getSchools, type School } from '@/lib/schools';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const colors = Colors;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  useEffect(() => {
    if (isStudent && schools.length === 0) {
      setSchoolsLoading(true);
      getSchools()
        .then(setSchools)
        .catch(() => setError('Nie udało się pobrać szkół'))
        .finally(() => setSchoolsLoading(false));
    }
  }, [isStudent, schools.length]);

  // Filter schools based on search term
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(schoolSearchTerm.toLowerCase())
  );

  async function onSubmit() {
    if (!accept) return setError('Zaznacz akceptację regulaminu');
    setError('');
    setLoading(true);
    try {
      await signUp({ email, password, firstName, lastName });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Błąd');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }} contentContainerStyle={{ padding: 32, paddingTop: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image source={require('@/assets/images/icon.png')} style={{ width: 200, objectFit: 'contain' }} />
      </View>

      <Text style={{ textAlign: 'center', fontSize: 24, marginBottom: 8, color: 'black' }}>Zarejestruj się</Text>
      <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 40, marginBottom: 32 }} />

      <TextInput label="Adres e-mail" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" keyboardType="email-address" style={{ marginBottom: 12, backgroundColor: 'white' }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Hasło" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={{ marginBottom: 12, backgroundColor: 'white' }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Imię" value={firstName} onChangeText={setFirstName} mode="outlined" style={{ marginBottom: 12, backgroundColor: 'white' }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Nazwisko" value={lastName} onChangeText={setLastName} mode="outlined" style={{ marginBottom: 12, backgroundColor: 'white' }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Data urodzin" value={birthDate} onChangeText={setBirthDate} mode="outlined" placeholder="MM/DD/YYYY" style={{ marginBottom: 12, backgroundColor: 'white' }} outlineStyle={{ borderRadius: 25 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ color: 'black', fontSize: 16 }}>Jestem studentem</Text>
        <Switch value={isStudent} onValueChange={setIsStudent} color={colors.primary} />
      </View>

      {isStudent && (
        schoolsLoading ? (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              label="Szkoła"
              value={schoolName || schoolSearchTerm}
              onChangeText={(text) => {
                setSchoolSearchTerm(text);
                // Clear selection if user starts typing
                if (schoolName && text !== schoolName) {
                  setSchoolName('');
                  setSchoolId('');
                }
              }}
              mode="outlined"
              placeholder="Wpisz nazwę szkoły..."
              style={{ marginBottom: 8, backgroundColor: 'white' }}
              outlineStyle={{ borderRadius: 25 }}
              right={
                schoolName ? (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => {
                      setSchoolName('');
                      setSchoolId('');
                      setSchoolSearchTerm('');
                    }}
                  />
                ) : (
                  <TextInput.Icon icon="school" />
                )
              }
            />

            {/* Show filtered results when searching */}
            {schoolSearchTerm && !schoolName && (
              <View style={{ marginBottom: 8 }}>
                {filteredSchools.length > 0 ? (
                  filteredSchools.slice(0, 5).map((school) => (
                    <TouchableOpacity
                      key={school.id}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#E5E5E5',
                        backgroundColor: 'white',
                      }}
                      onPress={() => {
                        setSchoolId(school.id);
                        setSchoolName(school.name);
                        setSchoolSearchTerm('');
                      }}
                    >
                      <Text style={{ color: 'black', fontSize: 14 }}>
                        {school.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: '#666', fontSize: 14, paddingVertical: 8 }}>
                    Brak szkół pasujących do wyszukiwania
                  </Text>
                )}
              </View>
            )}
          </View>
        )
      )}

      {error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        style={{ backgroundColor: colors.primary, borderRadius: 50, marginBottom: 16 }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ fontSize: 15, fontWeight: '600', letterSpacing: 0.5 }}
      >
        ZAREJESTRUJ SIĘ
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.push('/auth/login')}
        style={{
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 50,
          marginBottom: 24,
        }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{
          fontSize: 15,
          fontWeight: '600',
          letterSpacing: 0.5,
          color: colors.primary,
        }}
      >
        ZALOGUJ SIĘ
      </Button>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Checkbox status={accept ? 'checked' : 'unchecked'} onPress={() => setAccept(!accept)} color={colors.primary} />
        <Text style={{ color: 'black', fontSize: 14 }}>Akceptuję regulamin aplikacji</Text>
      </View>
    </ScrollView>
  );
}