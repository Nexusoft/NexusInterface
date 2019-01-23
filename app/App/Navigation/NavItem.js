// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Global Depnedencies
import HorizontalLine from 'components/HorizontalLine';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { timing, consts } from 'styles';

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
  alignItems: 'center',
  padding: '0 10px',
  position: 'relative',
  transitionProperties: 'opacity, color, transform',
  transitionDuration: timing.normal,
  transitionTimingFunction: consts.enhancedEaseOut,
  color: theme.foreground,
  opacity: 0.45,

  '&:hover': {
    opacity: 1,
    transform: 'scale(1.15)',
  },
  '&.active': {
    opacity: 1,
    transform: 'scale(1.15)',
    color: theme.primary,

    '&::before': {
      content: '""',
      display: 'block',
      width: 20,
      height: 20,
      background: theme.primary,
      borderRadius: 45,
      position: 'absolute',
      bottom: 0,
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
      bottom: 0,
      left: '50%',
      transform: 'translate(-50%,50%)',
      animation: `${pulseDot} 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
    },
  },
}));

const NavIcon = styled(Icon)({
  width: 36,
  height: 36,
});

const NavItem = ({ icon, children, ...rest }) => (
  <Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <NavIcon icon={icon} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

export default NavItem;
