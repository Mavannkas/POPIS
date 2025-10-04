import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

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
const tintColorLight = primaryColor;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: primaryColor,
    bg1: bg1Color,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: primaryColor,
    bg1: bg1Color,
  },
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
