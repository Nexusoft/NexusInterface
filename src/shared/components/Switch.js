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
import { forwardRef } from 'react';
import styled from '@emotion/styled';

// Internal
import { timing, consts } from 'styles';
import * as color from 'utils/color';

const switchHeight = consts.lineHeight; // em
const switchWidth = consts.lineHeight * 1.75; // em

const SwitchInput = styled.input(({ theme }) => {
  const checkedBg = color.mix(theme.background, theme.primary);

  return {
    display: 'block',
    appearance: 'none',
    height: switchHeight + 'em',
    width: switchWidth + 'em',
    position: 'relative',
    cursor: 'pointer',
    outline: 'none',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

    // Unchecked styles
    // &&:disabled is for overriding the :hover styles on disabled
    '&, &&:disabled': {
      // Switch track
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: 'scale(.9)',
        borderRadius: switchHeight / 2 + 'em',
        background: theme.mixer(0.25),
        transition: `background-color ${timing.quick} ease-out`,
      },
      // Switch round handle
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        height: switchHeight + 'em',
        width: switchHeight + 'em',
        borderRadius: '50%',
        background: theme.mixer(0.5),
        boxShadow: '0 0 5px rgba(0,0,0,.7)',
        transitionProperty: 'background-color, transform, box-shadow',
        transitionDuration: timing.quick,
        transitionTimingFunction: 'ease-out',
      },
    },

    '&:hover': {
      '&::before': {
        background: theme.raise(theme.mixer(0.25), 0.15),
      },
      '&::after': {
        background: theme.mixer(0.75),
      },
    },

    // Checked styles
    '&:checked': {
      // &&:disabled is for overriding the :hover styles on disabled
      '&, &&:disabled': {
        '&::before': {
          background: checkedBg,
        },
        '&::after': {
          transform: `translateX(${switchWidth - switchHeight}em)`,
          background: theme.raise(theme.primary, 0.15),
          boxShadow: `0 0 5px ${checkedBg}`,
        },
      },

      '&:hover': {
        '&::before': {
          background: theme.raise(checkedBg, 0.15),
        },
        '&::after': {
          background: theme.raise(theme.primary, 0.3),
          boxShadow: `0 0 10px ${theme.primary}`,
        },
      },
    },
  };
});

const Switch = forwardRef((props, ref) => (
  <SwitchInput type="checkbox" checked={!!props.value} {...props} ref={ref} />
));

export default Switch;
