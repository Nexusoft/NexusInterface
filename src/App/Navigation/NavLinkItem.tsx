// External Dependencies
import { NavLink } from 'react-router';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { timing, consts } from 'styles';
import { ComponentProps } from 'react';

const pulseRing = keyframes`
  0% {
    transform: translate(-50%,50%) scale(0.33);
  }
  80%, 100% {
    opacity: 0;
    transform: translate(-50%,50%)
  }
`;

const pulseDot = keyframes`
  0% {
    transform: translate(-50%,50%) scale(0.8);
  }
  50% {
    transform: translate(-50%,50%) scale(1);
  }
  100% {
    transform: translate(-50%,50%) scale(0.8);
  }
`;

const NavLinkItem = styled(NavLink)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 8px',
  position: 'relative',
  transitionProperties: 'opacity, color, transform',
  transitionDuration: timing.normal,
  transitionTimingFunction: consts.enhancedEaseOut,
  color: theme.foreground,
  opacity: 0.45,
  fontSize: 30,

  '&:hover': {
    opacity: 0.9,
    transform: 'scale(1.08)',
  },
  '&.active': {
    opacity: 1,
    color: theme.primary,
    transform: 'scale(1.08)',

    '&::before': {
      content: '""',
      display: 'block',
      width: 20,
      height: 20,
      background: theme.primary,
      borderRadius: 45,
      position: 'absolute',
      bottom: -2,
      left: '50%',
      transform: 'translate(-50%,50%)',
      animation: `${pulseRing} 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
    },

    '&::after': {
      content: '""',
      height: 6,
      width: 6,
      background: theme.foreground,
      borderRadius: '50%',
      position: 'absolute',
      bottom: -2,
      left: '50%',
      transform: 'translate(-50%,50%)',
      animation: `${pulseDot} 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
    },
  },
}));

export type NavLinkItemProps = ComponentProps<typeof NavLinkItem>;

export default NavLinkItem;
