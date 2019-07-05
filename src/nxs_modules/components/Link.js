/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

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

const Link = React.forwardRef(({ as, ...rest }, ref) => {
  if (typeof as === 'string') {
    return <NativeLink as={as} {...rest} ref={ref} />;
  } else {
    return <ComponentLink as={as} {...rest} ref={ref} />;
  }
});

export default Link;
