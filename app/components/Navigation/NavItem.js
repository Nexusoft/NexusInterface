// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Global Depnedencies
import HorizontalLine from 'components/common/HorizontalLine';
import Icon from 'components/common/Icon';
import { colors, timing } from 'styles';

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

const NavLinkItem = styled(NavLink)({
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  position: 'relative',
  transitionProperties: 'opacity, color, transform',
  transitionDuration: timing.normal,
  color: colors.light,
  opacity: 0.45,

  '&:hover': {
    opacity: 1,
    transform: 'scale(1.15)',
  },
  '&.active': {
    opacity: 1,
    transform: 'scale(1.15)',
    color: colors.primary,

    '&::before': {
      content: '""',
      display: 'block',
      width: 20,
      height: 20,
      backgroundColor: colors.primary,
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
      backgroundColor: colors.light,
      borderRadius: '50%',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translate(-50%,50%)',
      animation: `${pulseDot} 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
    },
  },
});

const NavIcon = styled(Icon)({
  width: 36,
  height: 36,
});

const NavItem = ({ icon, children, ...rest }) => (
  <NavLinkItem {...rest}>
    <NavIcon icon={icon} />
    <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
      {children}
    </div>
  </NavLinkItem>
);

export default NavItem;
