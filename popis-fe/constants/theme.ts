import { MD3LightTheme, configureFonts } from 'react-native-paper';

// Paleta kolorów - zmień tutaj, by zmienić cały motyw
export const c = {
  pink: '#D94E73',
  magenta: '#A61F5E',
  blue: '#3088BF',
  green: '#73A641',
  orange: '#E8A031',
  white: '#FFFFFF',
  black: '#11181C',
};

const primaryColor = c.magenta;
const bg1Color = '#F1DAE5';

export const Colors = {
  text: '#11181C',
  background: '#fff',
  tint: primaryColor,
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: primaryColor,
  primary: primaryColor,
  bg1: bg1Color,
  error: '#B00020',
};

// Paper theme
// Map Paper's MD3 type scale to Poppins families
const paperFonts = configureFonts({
  config: {
    displayLarge: { fontFamily: 'Poppins_700Bold' },
    displayMedium: { fontFamily: 'Poppins_600SemiBold' },
    displaySmall: { fontFamily: 'Poppins_600SemiBold' },
    headlineLarge: { fontFamily: 'Poppins_700Bold' },
    headlineMedium: { fontFamily: 'Poppins_600SemiBold' },
    headlineSmall: { fontFamily: 'Poppins_600SemiBold' },
    titleLarge: { fontFamily: 'Poppins_600SemiBold' },
    titleMedium: { fontFamily: 'Poppins_500Medium' },
    titleSmall: { fontFamily: 'Poppins_500Medium' },
    labelLarge: { fontFamily: 'Poppins_500Medium' },
    labelMedium: { fontFamily: 'Poppins_500Medium' },
    labelSmall: { fontFamily: 'Poppins_500Medium' },
    bodyLarge: { fontFamily: 'Poppins_400Regular' },
    bodyMedium: { fontFamily: 'Poppins_400Regular' },
    bodySmall: { fontFamily: 'Poppins_400Regular' },
  },
});

export const theme = {
  ...MD3LightTheme,
  fonts: paperFonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: c.magenta,
    background: c.white,
    surface: c.white,
  },
};
