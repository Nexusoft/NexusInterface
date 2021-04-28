import { ThemeProvider } from '@emotion/react';
import { getMixer, darken, lighten } from 'utils/color';

const fortifyTheme = (theme) => ({
  ...theme,
  mixer: getMixer(theme.background, theme.foreground),
  lower: theme.dark ? darken : lighten,
  raise: theme.dark ? lighten : darken,
});

export default function ThemeController({ theme, children }) {
  return <ThemeProvider theme={fortifyTheme(theme)}>{children}</ThemeProvider>;
}
