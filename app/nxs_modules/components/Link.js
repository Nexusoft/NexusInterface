// External
import React from 'react';
import styled from '@emotion/styled';
import { Link as RouterLink } from 'react-router-dom';

// Internal
import { timing } from 'styles';

const linkStyles = ({ theme }) => ({
  '&, &:active': {
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

const Link = ({ as, ...rest }) => {
  if (typeof as === 'string') {
    return <NativeLink as={as} {...rest} />;
  } else {
    return <ComponentLink as={as} {...rest} />;
  }
};

export default Link;
