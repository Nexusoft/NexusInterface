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
import { ComponentProps, ReactNode } from 'react';
import styled from '@emotion/styled';

import { consts, timing } from 'styles';

const FieldSetComponent = styled.fieldset<{
  color?: string;
}>(({ theme, color }) => ({
  padding: '.5em 1.5em 1.5em',
  borderRadius: 4,
  border: `1px solid ${color || theme.mixer(0.25)}`,
  margin: `${consts.lineHeight}em 0`,
  transition: `border-color ${timing.normal}`,
}));

const Legend = styled.legend<{
  color?: string;
}>(({ theme, color }) => ({
  textTransform: 'uppercase',
  textAlign: 'center',
  padding: '0 .5em',
  color: color || theme.mixer(0.75),
  transition: `color ${timing.normal}`,
}));

const FieldSet = ({
  legend,
  children,
  color,
  ...rest
}: ComponentProps<typeof FieldSetComponent> & {
  legend?: ReactNode;
}) => (
  <FieldSetComponent {...rest} color={color}>
    <Legend color={color}>{legend}</Legend>
    {children}
  </FieldSetComponent>
);

export default FieldSet;
