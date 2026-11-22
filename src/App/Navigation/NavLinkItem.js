import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { fade } from 'utils/color';
import { keyframes } from '@emotion/react';
import { timing } from 'styles';
import { consts } from 'styles';
import themeStyles from 'utils/themeStyles';
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

const NavLinkItem = styled(NavLink)(themeStyles([({
  theme
}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  position: 'relative',
  transitionProperties: 'opacity, color, transform',
  transitionDuration: timing.normal,
  transitionTimingFunction: consts.enhancedEaseOut,
  color: theme.foreground,
  opacity: 0.45,
  fontSize: 36,
  '&:hover': {
    opacity: 0.9,
    transform: 'scale(1.15)'
  },
  '&.active': {
    opacity: 1,
    color: theme.primary,
    transform: 'scale(1.15)',
    '&::before': {
      content: '""',
      display: 'block',
      width: 20,
      height: 20,
      background: theme.primary,
      borderRadius: 45,
      position: 'absolute',
      bottom: 5,
      left: '50%',
      transform: 'translate(-50%,50%)',
      animation: `${pulseRing} 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`
    },
    '&::after': {
      content: '""',
      height: 6,
      width: 6,
      background: theme.foreground,
      borderRadius: '50%',
      position: 'absolute',
      bottom: 5,
      left: '50%',
      transform: 'translate(-50%,50%)',
      animation: `${pulseDot} 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`
    }
  }
})], [({
  theme
}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  minHeight: 48,
  padding: '12px 16px',
  position: 'relative',
  borderRadius: 6,
  color: theme.mixer(0.7),
  fontSize: 12,
  fontWeight: 500,
  transition: 'background-color 150ms, color 150ms',
  '& > svg': {
    width: 22,
    height: 22,
    flexShrink: 0
  },
  '&:hover': {
    background: theme.mixer(0.07),
    color: theme.foreground
  },
  '&.active': {
    color: theme.primary,
    background: `linear-gradient(90deg, ${fade(theme.primary, 0.83)}, ${fade(theme.primary, 0.97)})`,
    boxShadow: `inset 3px 0 ${theme.primary}`
  }
})]));

export default NavLinkItem;
