import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/lib/auth/context';
import { getSchools, type School } from '@/lib/schools';
import { Input } from '@/components/ui';

export default function AccountScreen() {
	const { user, updateProfile, refresh } = useAuth();
	const [firstName, setFirstName] = useState(user?.firstName || '');
	const [lastName, setLastName] = useState(user?.lastName || '');
	const [isStudent, setIsStudent] = useState<boolean>(!!user?.isStudent);
	const [schoolId, setSchoolId] = useState<string>('');
	const [schoolName, setSchoolName] = useState<string>('');
	const [schoolSearchTerm, setSchoolSearchTerm] = useState<string>('');
	const [schools, setSchools] = useState<School[]>([]);
	const [schoolsLoading, setSchoolsLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [firstNameError, setFirstNameError] = useState('');
	const [lastNameError, setLastNameError] = useState('');
	const [schoolError, setSchoolError] = useState('');

	useEffect(() => {
		if (isStudent && schools.length === 0) {
			setSchoolsLoading(true);
			getSchools()
				.then(setSchools)
				.catch(() => setSchools([]))
				.finally(() => setSchoolsLoading(false));
		}
	}, [isStudent, schools.length]);

	useEffect(() => {
		// Default school from current user if available (expects user.school{name,id} in future)
		// Fallback: keep empty if not provided
		if (user && (user as any).school) {
			const s = (user as any).school;
			if (typeof s === 'object' && s.id && s.name) {
				setSchoolId(String(s.id));
				setSchoolName(String(s.name));
			}
		}
	}, [user]);

	const filteredSchools = useMemo(() => {
		return schools.filter(s => s.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()));
	}, [schools, schoolSearchTerm]);

	const onSave = async () => {
		setError('');
		setFirstNameError('');
		setLastNameError('');
		setSchoolError('');
		let hasError = false;
		if (!firstName.trim()) {
			setFirstNameError('Imię jest wymagane');
			hasError = true;
		}
		if (!lastName.trim()) {
			setLastNameError('Nazwisko jest wymagane');
			hasError = true;
		}
		if (isStudent && !schoolId) {
			setSchoolError('Wybierz szkołę');
			hasError = true;
		}
		if (hasError) return;
		try {
			setSaving(true);
			await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), isStudent, school: isStudent ? schoolId : null });
			await refresh();
		} finally {
			setSaving(false);
		}
	};

	return (
		<View className="flex-1 bg-white p-4">
			<Text className="text-xl font-bold text-gray-900 mb-4">Ustawienia konta</Text>
			<Input
				label="Imię"
				value={firstName}
				onChangeText={setFirstName}
				variant="outlined"
				error={firstNameError}
				style={{ marginBottom: 12 }}
			/>
			<Input
				label="Nazwisko"
				value={lastName}
				onChangeText={setLastName}
				variant="outlined"
				error={lastNameError}
				style={{ marginBottom: 12 }}
			/>
			<View className="flex-row items-center mb-3">
				<Text className="text-gray-800 mr-3">Uczeń</Text>
				<Switch value={isStudent} onValueChange={setIsStudent} />
			</View>
			{isStudent && (
				<View className="mb-4">
					<Text className="text-gray-800 mb-2">Szkoła</Text>
					{schoolsLoading ? (
						<View className="items-center mb-2"><ActivityIndicator /></View>
					) : (
						<>
							<Input
								label="Szkoła"
								value={schoolName || schoolSearchTerm}
								onChangeText={(text) => {
									setSchoolSearchTerm(text);
									if (schoolName && text !== schoolName) {
										setSchoolName('');
										setSchoolId('');
									}
								}}
								variant="outlined"
								placeholder="Wpisz nazwę szkoły..."
								error={schoolError}
								style={{ marginBottom: 8 }}
							/>

							{schoolName ? (
								<Text className="text-primary mb-2" onPress={() => { setSchoolName(''); setSchoolId(''); setSchoolSearchTerm(''); }}>Zmień szkołę</Text>
							) : null}

							{schoolSearchTerm && !schoolName && (
								<View>
									{filteredSchools.length > 0 ? (
										filteredSchools.slice(0, 8).map((s) => (
											<Text
												key={s.id}
												onPress={() => { setSchoolId(s.id); setSchoolName(s.name); setSchoolSearchTerm(''); }}
												className="px-3 py-2 border-b border-gray-200"
											>
												{s.name}
											</Text>
										))
									) : (
										<Text className="text-gray-500 px-1 py-2">Brak szkół pasujących do wyszukiwania</Text>
									)}
								</View>
							)}
						</>
					)}
				</View>
			)}

			{error ? <Text className="text-red-600 mb-3">{error}</Text> : null}
			<Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>
				Zapisz zmiany
			</Button>
		</View>
	);
}


