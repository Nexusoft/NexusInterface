import '@emotion/react';
import { FortifiedTheme } from 'components/ThemeController';

declare module '@emotion/react' {
  export interface Theme extends FortifiedTheme {}
}

// Fixes forwardRef for generic functional components
declare module 'react' {
  function forwardRef<T, P extends object>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}
