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

import React from 'react';
import styled from '@emotion/styled';

const Svg = styled.svg({
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  width: '1em',
  height: '1em',
});

const Icon = React.forwardRef(({ icon = {}, ...rest }, ref) => (
  <Svg viewBox={icon.viewBox} {...rest} ref={ref}>
    <use href={`${icon.url ? icon.url : ''}#${icon.id}`} />
  </Svg>
));

export default Icon;
