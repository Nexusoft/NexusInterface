import '@emotion/react';

declare module '@emotion/react' {
  export type Theme = import('components/ThemeController').FortifiedTheme;
}
