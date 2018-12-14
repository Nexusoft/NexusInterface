// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { colors, timing } from 'styles';
import { lighten, fade } from 'utils/colors';

const Button = styled.button(
  {
    display: 'inline-block',
    borderRadius: 4,
    padding: '0.8em 1.6em',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transitionProperties: 'border-color, color',
    transitionDuration: timing.normal,
    // Default styles
    border: `2px solid ${colors.lightGray}`,
    color: colors.lightGray,
    '&:hover': {
      borderColor: colors.light,
      color: colors.light,
    },
  },

  ({ primary }) =>
    !!primary && {
      border: `2px solid ${colors.primary}`,
      color: colors.primary,
      fontWeight: 'bold',
      transitionProperties: 'border-color, color, box-shadow, text-shadow',
      '&:hover': {
        borderColor: lighten(colors.primary, 0.3),
        color: lighten(colors.primary, 0.3),
        boxShadow: `0 0 20px ${fade(colors.primary, 0.5)}`,
        textShadow: `0 0 20px ${fade(colors.primary, 0.5)}`,
      },
    },

  ({ blank }) =>
    !!blank && {
      border: 'none',
      backgroundColor: 'transparent',
      color: colors.lightGray,
      transitionProperties: 'color',
      '&:hover': {
        border: 'none',
        color: colors.light,
      },
    }
);

export default Button;
