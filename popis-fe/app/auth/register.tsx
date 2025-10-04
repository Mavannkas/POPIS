import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Image, ScrollView, View, TouchableOpacity, FlatList } from 'react-native';
import { Button, Checkbox, Switch, Text, TextInput, Menu, ActivityIndicator } from 'react-native-paper';
import { useAuth } from './context';
import { c } from '@/constants/theme';
import { getSchools, type School } from '@/app/services/schools';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [accountType, setAccountType] = useState('Wybierz');
  const [isStudent, setIsStudent] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const accountTypes = ['Wolontariusz', 'Organizacja'];

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
    <ScrollView style={{ flex: 1, backgroundColor: c.white }} contentContainerStyle={{ padding: 32, paddingTop: 64 }}>
      <View style={{ alignItems: 'center' }}>
        <Image source={require('@/assets/images/icon.png')} style={{ width: 240, objectFit: 'contain' }} />
      </View>

      <Text style={{ textAlign: 'center', fontSize: 24, marginBottom: 8, color: c.black }}>Zarejestruj się</Text>
      <View style={{ height: 1, backgroundColor: '#E5E5E5', marginHorizontal: 40, marginBottom: 32 }} />

      <TextInput label="Adres e-mail" value={email} onChangeText={setEmail} mode="outlined" autoCapitalize="none" keyboardType="email-address" style={{ marginBottom: 12, backgroundColor: c.white }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Hasło" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={{ marginBottom: 12, backgroundColor: c.white }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Imię" value={firstName} onChangeText={setFirstName} mode="outlined" style={{ marginBottom: 12, backgroundColor: c.white }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Nazwisko" value={lastName} onChangeText={setLastName} mode="outlined" style={{ marginBottom: 12, backgroundColor: c.white }} outlineStyle={{ borderRadius: 25 }} />
      <TextInput label="Data urodzin" value={birthDate} onChangeText={setBirthDate} mode="outlined" placeholder="MM/DD/YYYY" style={{ marginBottom: 12, backgroundColor: c.white }} outlineStyle={{ borderRadius: 25 }} />

      <Menu
        visible={accountMenuVisible}
        onDismiss={() => setAccountMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setAccountMenuVisible(true)}>
            <View pointerEvents="none">
              <TextInput
                label="Typ konta"
                value={accountType}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="chevron-down" />}
                style={{ marginBottom: 12, backgroundColor: c.white }}
                outlineStyle={{ borderRadius: 25 }}
              />
            </View>
          </TouchableOpacity>
        }
      >
        {accountTypes.map((type) => (
          <Menu.Item
            key={type}
            onPress={() => {
              setAccountType(type);
              setAccountMenuVisible(false);
            }}
            title={type}
          />
        ))}
      </Menu>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ color: c.black, fontSize: 16 }}>Jestem studentem</Text>
        <Switch value={isStudent} onValueChange={setIsStudent} color={c.magenta} />
      </View>

      {isStudent && (
        schoolsLoading ? (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <ActivityIndicator color={c.magenta} />
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
              style={{ marginBottom: 8, backgroundColor: c.white }}
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
            {schoolSearchTerm && filteredSchools.length > 0 && !schoolName && (
              <View
                style={{
                  maxHeight: 200,
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 8,
                  backgroundColor: c.white,
                  marginBottom: 8,
                }}
              >
                <FlatList
                  data={filteredSchools.slice(0, 10)} // Limit to first 10 results
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0',
                      }}
                      onPress={() => {
                        setSchoolId(item.id);
                        setSchoolName(item.name);
                        setSchoolSearchTerm('');
                      }}
                    >
                      <Text style={{ color: c.black, fontSize: 14 }}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            {/* Show message when no results */}
            {schoolSearchTerm && filteredSchools.length === 0 && (
              <Text style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                Brak szkół pasujących do wyszukiwania
              </Text>
            )}

            {/* Show selected school */}
            {schoolName && (
              <Text style={{ color: c.magenta, fontSize: 14, fontWeight: '600' }}>
                Wybrana szkoła: {schoolName}
              </Text>
            )}
          </View>
        )
      )}

      {error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        style={{ backgroundColor: c.magenta, borderRadius: 50, marginBottom: 16 }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ fontSize: 15, fontWeight: '600', letterSpacing: 0.5 }}
      >
        ZAREJESTRUJ SIĘ
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.push('/auth/login')}
        style={{
          borderColor: c.magenta,
          borderWidth: 2,
          borderRadius: 50,
          marginBottom: 24,
        }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{
          fontSize: 15,
          fontWeight: '600',
          letterSpacing: 0.5,
          color: c.magenta,
        }}
      >
        ZALOGUJ SIĘ
      </Button>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Checkbox status={accept ? 'checked' : 'unchecked'} onPress={() => setAccept(!accept)} color={c.magenta} />
        <Text style={{ color: c.black, fontSize: 14 }}>Akceptuję regulamin aplikacji</Text>
      </View>
    </ScrollView>
  );
}

