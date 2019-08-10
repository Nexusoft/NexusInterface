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

// External Dependencies
import React from 'react';
import styled from '@emotion/styled';

import { consts } from 'styles';

const FieldSetComponent = styled.fieldset(({ theme }) => ({
  padding: '.5em 1.5em 1.5em',
  borderRadius: 4,
  border: `1px solid ${theme.mixer(0.25)}`,
  margin: `${consts.lineHeight}em 0`,
}));

const Legend = styled.legend(({ theme }) => ({
  textTransform: 'uppercase',
  textAlign: 'center',
  padding: '0 .5em',
  color: theme.mixer(0.75),
}));

const FieldSet = React.forwardRef(({ legend, children, ...rest }, ref) => (
  <FieldSetComponent {...rest} ref={ref}>
    <Legend>{legend}</Legend>
    {children}
  </FieldSetComponent>
));

export default FieldSet;
