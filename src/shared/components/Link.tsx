// External
import { ElementType, forwardRef, HTMLAttributes } from 'react';
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

const NativeLink = styled.a(linkStyles);

const ComponentLink = styled(RouterLink)(linkStyles);

const Link = forwardRef<
  HTMLAnchorElement,
  HTMLAttributes<HTMLAnchorElement> & {
    href?: string;
    as?: ElementType;
    to: string;
  }
>(({ as, ...rest }, ref) => {
  if (as && typeof as === 'string') {
    return <NativeLink as={as} {...rest} ref={ref} />;
  } else {
    return <ComponentLink {...rest} ref={ref} />;
  }
});

export default Link;
