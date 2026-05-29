// Figma Design System - Colors

export const Colors = {
  // Base
  white: '#FFFFFF',

  // Gray Scale
  gray50: '#F5F5F7',
  gray100: '#E6E6EA',
  gray200: '#D4D4D9',
  gray300: '#C0BEC5',
  gray400: '#A3A1A9',
  gray500: '#85858B',
  gray600: '#6A6670',
  gray700: '#545059',
  gray800: '#3D3941',
  gray900: '#29252B',

  // Primary
  primary50: '#E1D3FF',
  primary100: '#CDB7FF',
  primary200: '#B598F6',
  primary300: '#9D7AEC',
  primary400: '#7F59D6',
  primary500: '#663FC0', // main
  primary600: '#4E3191',
  primary700: '#3D2477',
  primary800: '#281458',
  primary900: '#17083D',

  // Background
  bg50: '#FCFAF5',
  bg100: '#FBF8F2',
  bg200: '#EEEBE5',
  bg300: '#E1DFD9',
  bg400: '#CDCBC6',

  // System
  error: '#DC5063',
};

// Helper function to convert RGB to hex
export const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
