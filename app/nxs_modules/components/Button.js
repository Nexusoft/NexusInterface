import React from 'react';
import styled from '@emotion/styled';
import { colors, timing } from 'styles';
import { color } from 'utils';

const ButtonComponent = styled.button(
  {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: '0 1em',
    height: '2.8em',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transitionProperty: 'border-color, color',
    transitionDuration: timing.normal,

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },

  ({ square }) =>
    square && {
      padding: 0,
      height: square === true ? '2.8em' : square,
      width: square === true ? '2.8em' : square,
    },

  ({ wide }) => wide && { width: '100%' },

  ({ fitHeight }) => fitHeight && { height: 'auto', alignSelf: 'stretch' },

  ({ grouped }) => {
    switch (grouped) {
      case 'left':
        return {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'right':
        return {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        };
      case 'top':
        return {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'bottom':
        return {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        };
    }
  },

  ({ uppercase }) =>
    uppercase && {
      textTransform: 'uppercase',
      fontSize: '.9em',
    },

  ({ skin = 'default' }) => {
    switch (skin) {
      case 'default':
        return {
          '&, &:active, &&[disabled]': {
            border: `1px solid ${colors.lightGray}`,
            color: colors.lightGray,
          },
          '&:hover': {
            borderColor: colors.light,
            color: colors.light,
          },
        };
      case 'primary':
        return {
          '&, &:active, &&[disabled]': {
            border: `2px solid ${colors.primary}`,
            color: colors.primary,
            fontWeight: 'bold',
            transitionProperty: 'border-color, color, filter',
            transitionTimingFunction: 'ease-out',
            boxShadow: 'none',
            textShadow: 'none',

            '.tooltip': {
              fontWeight: 'normal',
            },
          },
          '&:hover': {
            borderColor: color.lighten(colors.primary, 0.3),
            color: color.lighten(colors.primary, 0.3),
            filter: `drop-shadow(0 0 7px ${color.fade(colors.primary, 0.3)})`,
          },
        };
      case 'filled-primary':
        return {
          '&, &:active, &&[disabled]': {
            background: color.darken(colors.primary, 0.1),
            color: colors.primaryContrast,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: colors.primary,
          },
        };
      case 'filled-dark':
        return {
          '&, &:active, &&[disabled]': {
            background: colors.dark,
            color: colors.light,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: colors.darkerGray,
          },
        };
      case 'filled-light':
        return {
          '&, &:active, &&[disabled]': {
            background: colors.lighterGray,
            color: colors.dark,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: colors.light,
          },
        };
      case 'filled-error':
        return {
          '&, &:active, &&[disabled]': {
            background: colors.error,
            color: colors.errorContrast,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: color.lighten(colors.error, 0.2),
          },
        };
      case 'blank-dark':
        return {
          '&, &:active, &&[disabled]': {
            padding: '0.5em 1em',
            background: 'transparent',
            color: colors.darkGray,
            transitionProperty: 'color',
          },
          '&:hover': {
            color: colors.dark,
          },
        };
      case 'blank-light':
        return {
          '&, &:active, &&[disabled]': {
            padding: '0.5em 1em',
            background: 'transparent',
            color: colors.lightGray,
            transitionProperty: 'color',
          },
          '&:hover': {
            color: colors.light,
          },
        };
    }
  }
);

/**
 * Note: the double & in &&[disabled] is a css specificity hack so that the disabled styles take priority over the hover styles
 */

const Button = props => <ButtonComponent type="button" {...props} />;

export default Button;
