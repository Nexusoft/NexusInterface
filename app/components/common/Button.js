// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { colors, timing } from 'styles';
import { lighten, fade } from 'utils/colors';

const Button = styled.button`
  display: inline-block;
  border-radius: 4px;
  padding: 0.8em 1.6em;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition-properties: border-color, color;
  transition-duration: ${timing.normal};
  /* Default styles */
  border: 2px solid ${colors.lightGray};
  color: ${colors.lightGray};
  &:hover {
    border-color: ${colors.light};
    color: ${colors.light};
  }

  ${({ primary }) =>
    !!primary &&
    `
    border: 2px solid ${colors.primary};
    color: ${colors.primary};
    font-weight: bold;
    transition-properties: border-color, color, box-shadow, text-shadow;
    &:hover {
      border-color: ${lighten(colors.primary, 0.3)};
      color: ${lighten(colors.primary, 0.3)};
      box-shadow: 0 0 20px ${fade(colors.primary, 0.5)};
      text-shadow: 0 0 20px ${fade(colors.primary, 0.5)};
    }
  `}

  ${({ blank }) =>
    !!blank &&
    `
    border: none;
    background-color: transparent;
    color: ${colors.lightGray};
    transition-properties: color;
    &:hover {
      border: none;
      color: ${colors.light};
    }
  `}
`;

export default Button;
