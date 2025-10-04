export type School = {
  id: string;
  name: string;
};

export async function getSchools(): Promise<School[]> {
  // Load school names from JSON file
  const schoolNamesData = require("./school-names.json");
  // Use actual school names from JSON data
  return schoolNamesData.map((name: string, index: number) => ({
    id: (index + 1).toString(),
    name: name,
  }));
}
