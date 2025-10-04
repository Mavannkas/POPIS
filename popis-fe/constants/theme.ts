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
export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: { fontFamily: 'Roboto_400Regular' } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: c.magenta,
    background: c.white,
    surface: c.white,
  },
};
