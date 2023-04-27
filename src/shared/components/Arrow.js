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

import styled from '@emotion/styled';

export function arrowStyles({ direction, width, height, color }) {
  const styles = {
    display: 'block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
  };
  switch (direction) {
    case 'up':
      return {
        ...styles,
        borderBottomColor: color,
        borderBottomWidth: height,
        borderTopWidth: 0,
        borderLeftWidth: width / 2,
        borderRightWidth: width / 2,
      };
    case 'down':
      return {
        ...styles,
        borderTopColor: color,
        borderTopWidth: height,
        borderBottomWidth: 0,
        borderLeftWidth: width / 2,
        borderRightWidth: width / 2,
      };
    case 'left':
      return {
        ...styles,
        borderRightColor: color,
        borderRightWidth: height,
        borderLeftWidth: 0,
        borderTopWidth: width / 2,
        borderBottomWidth: width / 2,
      };
    case 'right':
      return {
        ...styles,
        borderLeftColor: color,
        borderLeftWidth: height,
        borderRightWidth: 0,
        borderTopWidth: width / 2,
        borderBottomWidth: width / 2,
      };
  }
  return styles;
}

const Arrow = styled.span(
  ({ direction, width, height, color = 'currentColor' }) =>
    arrowStyles({ direction, width, height, color })
);

export default Arrow;
