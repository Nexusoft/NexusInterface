// External
import styled from '@emotion/styled';
import { Link as RouterLink } from 'react-router';
import { FortifiedTheme } from './ThemeController';

// Internal
import { timing } from 'styles';

const linkStyles = ({ theme }: { theme: FortifiedTheme }) =>
  ({
    '&, &:active': {
      cursor: 'pointer',
      display: 'inline',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      color: theme.mixer(0.75),
      transition: `color ${timing.normal}`,
    },
    '&:hover': {
      color: theme.foreground,
    },
  } as const);

export const NativeLink = styled.a(linkStyles);

export const Link = styled(RouterLink)(linkStyles);
