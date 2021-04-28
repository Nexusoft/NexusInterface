import { ThemeProvider } from '@emotion/react';
import { fortifyTheme } from 'lib/theme';

export default function ThemeController({ theme, children }) {
  return <ThemeProvider theme={fortifyTheme(theme)}>{children}</ThemeProvider>;
}
