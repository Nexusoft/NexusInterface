import React, { Component } from 'react';
import styled from '@emotion/styled';
import { timing } from 'styles';
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
            border: `1px solid ${theme.lightGray}`,
            color: theme.lightGray,
          },
          '&:hover': {
            borderColor: theme.light,
            color: theme.light,
          },
        };
      case 'primary':
        return {
          '&, &:active, &&:disabled': {
            border: `2px solid ${theme.primary}`,
            color: theme.primary,
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
            borderColor: color.lighten(theme.primary, 0.3),
            color: color.lighten(theme.primary, 0.3),
            boxShadow: `0 0 7px ${color.fade(theme.primary, 0.3)}`,
            textShadow: `0 0 7px ${color.fade(theme.primary, 0.3)}`,
          },
        };
      case 'error':
        return {
          '&, &:active, &&:disabled': {
            border: `2px solid ${theme.error}`,
            color: theme.error,
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
            borderColor: color.lighten(theme.error, 0.3),
            color: color.lighten(theme.error, 0.3),
            boxShadow: `0 0 7px ${color.fade(theme.error, 0.3)}`,
            textShadow: `0 0 7px ${color.fade(theme.error, 0.3)}`,
          },
        };
      case 'filled-primary':
        return {
          '&, &:active, &&:disabled': {
            background: color.darken(theme.primary, 0.1),
            color: theme.primaryContrast,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: theme.primary,
          },
        };
      case 'filled-dark':
        return {
          '&, &:active, &&:disabled': {
            background: theme.dark,
            color: theme.light,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: theme.darkerGray,
          },
        };
      case 'filled-light':
        return {
          '&, &:active, &&:disabled': {
            background: theme.lighterGray,
            color: theme.dark,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: theme.light,
          },
        };
      case 'filled-error':
        return {
          '&, &:active, &&:disabled': {
            background: theme.error,
            color: theme.errorContrast,
            transitionProperty: 'background-color',
          },
          '&:hover': {
            background: color.lighten(theme.error, 0.2),
          },
        };
      case 'blank-dark':
        return {
          '&, &:active, &&:disabled': {
            padding: '0.5em 1em',
            background: 'transparent',
            color: theme.darkGray,
            transitionProperty: 'color',
          },
          '&:hover': {
            color: theme.dark,
          },
        };
      case 'blank-light':
        return {
          '&, &:active, &&:disabled': {
            padding: '0.5em 1em',
            background: 'transparent',
            color: theme.lightGray,
            transitionProperty: 'color',
          },
          '&:hover': {
            color: theme.light,
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
            color: theme.lightGray,
            transitionProperty: 'color',
          },
          '&:hover': {
            color: theme.light,
          },
        };
    }
  }
);

/**
 * Note: the double & in &&:disabled is a css specificity hack so that the disabled styles take priority over the hover styles
 */

export default class Button extends Component {
  static defaultProps = {
    type: 'button',
    skin: 'default',
  };

  render() {
    return <ButtonComponent {...this.props} />;
  }
}
