import '@emotion/react';
import { FortifiedTheme } from 'components/ThemeController';

declare module '@emotion/react' {
  export interface Theme extends FortifiedTheme {}
}
