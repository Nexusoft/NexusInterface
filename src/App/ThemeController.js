// External
import { ThemeProvider } from '@emotion/react';
import { useSelector } from 'react-redux';

// Internal
import { fortifyTheme } from 'lib/theme';

export default function ThemeController({ children }) {
  const theme = useSelector((state) => state.theme);

  return <ThemeProvider theme={fortifyTheme(theme)}>{children}</ThemeProvider>;
}
