import React from 'react';
import styled from '@emotion/styled';
import { colors, timing } from 'styles';
import { lighten, darken, fade } from 'utils/colors';

const Button = styled.button(
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

  ({ disabled }) =>
    !!disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
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
            textSahdow: 'none',

            '.tooltip': {
              fontWeight: 'normal',
            },
          },
          '&:hover': {
            borderColor: lighten(colors.primary, 0.3),
            color: lighten(colors.primary, 0.3),
            filter: `drop-shadow(0 0 7px ${fade(colors.primary, 0.3)})`,
          },
        };
      case 'filled-primary':
        return {
          '&, &:active, &&[disabled]': {
            backgroundColor: darken(colors.primary, 0.1),
            color: colors.primaryContrast,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            backgroundColor: colors.primary,
            color: colors.primaryContrast,
          },
        };
      case 'filled-dark':
        return {
          '&, &:active, &&[disabled]': {
            backgroundColor: colors.dark,
            color: colors.light,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            backgroundColor: colors.darkerGray,
            color: colors.light,
          },
        };
      case 'filled-light':
        return {
          '&, &:active, &&[disabled]': {
            backgroundColor: colors.lighterGray,
            color: colors.dark,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            backgroundColor: colors.light,
            color: colors.dark,
          },
        };
      case 'blank-dark':
        return {
          '&, &:active, &&[disabled]': {
            padding: '0.5em 1em',
            backgroundColor: 'transparent',
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
            backgroundColor: 'transparent',
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

export default Button;
