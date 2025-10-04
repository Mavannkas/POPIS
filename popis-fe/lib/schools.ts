export type School = {
	id: string;
	name: string;
};

export async function getSchools(): Promise<School[]> {
	// Use predefined static schools list (same as registration)
	const schoolNamesData = require('./school-names.json');
	return schoolNamesData.map((name: string, index: number) => ({
		id: (index + 1).toString(),
		name,
	}));
}
