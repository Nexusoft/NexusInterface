// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import { timing, consts } from 'styles';
import { color } from 'utils';

const switchHeight = consts.lineHeight; // em
const switchWidth = consts.lineHeight * 1.75; // em

const SwitchInput = styled.input(({ theme }) => {
  const checkedBg = color.mix(theme.dark, theme.primary);

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
        background: theme.darkGray,
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
        background: theme.gray,
        boxShadow: '0 0 5px rgba(0,0,0,.7)',
        transitionProperty: 'background-color, transform, box-shadow',
        transitionDuration: timing.quick,
        transitionTimingFunction: 'ease-out',
      },
    },

    '&:hover': {
      '&::before': {
        background: color.lighten(theme.darkGray, 0.15),
      },
      '&::after': {
        background: theme.lightGray,
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
          background: color.lighten(theme.primary, 0.15),
          boxShadow: `0 0 5px ${checkedBg}`,
        },
      },

      '&:hover': {
        '&::before': {
          background: color.lighten(checkedBg, 0.15),
        },
        '&::after': {
          background: color.lighten(theme.primary, 0.3),
          boxShadow: `0 0 10px ${theme.primary}`,
        },
      },
    },
  };
});

const Switch = props => <SwitchInput type="checkbox" {...props} />;

const SwitchReduxForm = ({ input, meta, ...rest }) => (
  <Switch {...input} {...rest} />
);
Switch.RF = SwitchReduxForm;

export default Switch;
