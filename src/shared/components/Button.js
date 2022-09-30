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

import { forwardRef } from 'react';
import styled from '@emotion/styled';

import { timing } from 'styles';
import { lighten, fade } from 'utils/color';

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

  ({ waiting }) =>
    waiting && {
      '&, &:disabled': {
        cursor: 'wait',
      },
    },

  ({ skin, theme }) => {
    switch (skin) {
      case 'default':
        return {
          '&, &:active, &&:disabled': {
            border: `1px solid ${theme.mixer(0.75)}`,
            color: theme.mixer(0.75),
          },
          '&:hover, &.hover': {
            borderColor: theme.foreground,
            color: theme.foreground,
          },
        };
      case 'primary':
        return {
          '&, &:active, &&:disabled': {
            border: `2px solid ${theme.primary}`,
            color: theme.primary,
            fontWeight: 'bold',
            transitionProperty:
              'border-color, color, filter, box-shadow, text-shadow',
            transitionTimingFunction: 'ease-out',
            boxShadow: 'none',
            textShadow: 'none',

            '.tooltip': {
              fontWeight: 'normal',
            },
          },
          '&:hover, &.hover': {
            borderColor: lighten(theme.primary, 0.3),
            color: lighten(theme.primary, 0.3),
            boxShadow: `0 0 7px ${fade(theme.primary, 0.3)}`,
            textShadow: `0 0 7px ${fade(theme.primary, 0.3)}`,
          },
        };
      case 'danger':
        return {
          '&, &:active, &&:disabled': {
            border: `2px solid ${theme.danger}`,
            color: theme.danger,
            fontWeight: 'bold',
            transitionProperty:
              'border-color, color, filter, box-shadow, text-shadow',
            transitionTimingFunction: 'ease-out',
            boxShadow: 'none',
            textShadow: 'none',

            '.tooltip': {
              fontWeight: 'normal',
            },
          },
          '&:hover, &.hover': {
            borderColor: theme.raise(theme.danger, 0.3),
            color: theme.raise(theme.danger, 0.3),
            boxShadow: `0 0 7px ${fade(theme.danger, 0.3)}`,
            textShadow: `0 0 7px ${fade(theme.danger, 0.3)}`,
          },
        };
      case 'filled-primary':
        return {
          '&, &:active, &&:disabled': {
            background: theme.lower(theme.primary, 0.2),
            color: theme.primaryAccent,
            transitionProperty: 'background-color',
          },
          '&:hover, &.hover': {
            background: theme.primary,
          },
        };
      case 'filled-inverted':
        return {
          '&, &:active, &&:disabled': {
            background: theme.background,
            color: theme.foreground,
            transitionProperty: 'background-color',
          },
          '&:hover, &.hover': {
            background: theme.mixer(0.125),
          },
        };
      case 'filled':
        return {
          '&, &:active, &&:disabled': {
            background: theme.mixer(0.875),
            color: theme.background,
            transitionProperty: 'background-color',
          },
          '&:hover, &.hover': {
            background: theme.foreground,
          },
        };
      case 'filled-danger':
        return {
          '&, &:active, &&:disabled': {
            background: theme.danger,
            color: theme.dangerAccent,
            transitionProperty: 'background-color',
          },
          '&:hover, &.hover': {
            background: theme.raise(theme.danger, 0.2),
          },
        };
      case 'plain-inverted':
        return {
          '&, &:active, &&:disabled': {
            background: 'transparent',
            color: theme.mixer(0.25),
            transitionProperty: 'color',
          },
          '&:hover, &.hover': {
            color: theme.background,
          },
        };
      case 'plain-danger':
        return {
          '&, &:active, &&:disabled': {
            background: 'transparent',
            color: theme.danger,
            transitionProperty: 'color',
          },
          '&:hover, &.hover': {
            color: theme.lower(theme.danger, 0.2),
          },
        };
      case 'plain':
        return {
          '&, &:active, &&:disabled': {
            background: 'transparent',
            color: theme.mixer(0.75),
            transitionProperty: 'color',
          },
          '&:hover, &.hover': {
            color: theme.foreground,
          },
        };
      case 'hyperlink':
        return {
          '&, &:active, &&:disabled': {
            display: 'inline',
            padding: '.2em 0',
            height: 'auto',
            background: 'transparent',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderRadius: 0,
            color: theme.mixer(0.75),
            transitionProperty: 'color',
          },
          '&:hover, &.hover': {
            color: theme.foreground,
          },
        };
      case 'plain-link-primary':
        return {
          '&, &:active, &&:disabled': {
            display: 'inline',
            padding: '.2em 0',
            height: 'auto',
            background: 'transparent',
            color: fade(theme.primary, 0.15),
            transitionProperty: 'color',
          },
          '&:hover, &.hover': {
            color: theme.primary,
          },
        };
    }
  }
);

/**
 * Note: the double & in &&:disabled is a css specificity hack so that the disabled styles take priority over the hover styles
 */

const Button = forwardRef(
  ({ type = 'button', skin = 'default', ...rest }, ref) => (
    <ButtonComponent type={type} skin={skin} {...rest} ref={ref} />
  )
);

export default Button;
