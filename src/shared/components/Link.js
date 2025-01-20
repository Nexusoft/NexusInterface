// External
import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { Link as RouterLink } from 'react-router';

// Internal
import { timing } from 'styles';

const linkStyles = ({ theme }) => ({
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
});

const NativeLink = styled.a(linkStyles);

const ComponentLink = styled(RouterLink)(linkStyles);

const Link = forwardRef(({ as, ...rest }, ref) => {
  if (typeof as === 'string') {
    return <NativeLink as={as} {...rest} ref={ref} />;
  } else {
    return <ComponentLink as={as} {...rest} ref={ref} />;
  }
});

export default Link;
