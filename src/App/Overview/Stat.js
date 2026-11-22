// External
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { isCoreConnected } from 'selectors';
import { timing } from 'styles';
import { fade, mix } from 'utils/color';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';

__ = __context('Overview');

export const StatWrapper = styled.div(themeStyles([({
  theme
}) => ({
  display: 'grid',
  columnGap: 15,
  alignItems: 'center',
  margin: '1.7em 0',
  filter: `drop-shadow(0 0 8px ${theme.mixer(-0.5)}) brightness(100%)`,
  color: theme.foreground
}), ({
  to,
  theme
}) => to && {
  cursor: 'pointer',
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  '&:hover': {
    filter: `drop-shadow(0 0 8px ${theme.mixer(0.5)}) brightness(120%)`
  }
}], [({
  theme
}) => ({
  display: 'grid',
  position: 'relative',
  isolation: 'isolate',
  columnGap: 12,
  alignItems: 'center',
  margin: 0,
  padding: 'clamp(10px, 1.5vh, 18px) clamp(12px, 1.4vw, 20px)',
  paddingLeft: 'calc(clamp(12px, 1.4vw, 20px) + 2px)',
  paddingRight: 'calc(clamp(12px, 1.4vw, 20px) - 2px)',
  minHeight: 0,
  borderRadius: 0,
  background: `linear-gradient(270deg, ${fade(theme.primary, 0.6)}, ${fade(theme.primary, 0.94)}) right bottom / 100% 1px no-repeat`,
  border: 0,
  borderRight: `2px solid ${fade(theme.primary, 0.35)}`,
  boxShadow: 'none',
  backdropFilter: 'blur(16px)',
  color: theme.foreground,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    transform: 'scaleX(-1)',
    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
    background: `linear-gradient(115deg, ${fade(mix(theme.background, theme.primary, 0.12), 0.08)}, ${fade(theme.background, 0.4)})`,
    borderTop: `1px solid ${fade(theme.primary, 0.75)}`,
    pointerEvents: 'none'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 6,
    left: -2,
    width: 20,
    height: 1,
    transform: 'rotate(-45deg)',
    background: fade(theme.primary, 0.3),
    boxShadow: `0 0 8px ${fade(theme.primary, 0.5)}`,
    pointerEvents: 'none'
  }
}), ({
  to,
  theme
}) => to && {
  cursor: 'pointer',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  '&:hover': {
    borderColor: theme.primary,
    boxShadow: `inset 0 0 24px ${fade(theme.primary, 0.92)}`
  }
}, ({
  compact
}) => compact && {
  display: 'block',
  padding: 0,
  border: 0,
  background: 'none',
  backdropFilter: 'none',
  textAlign: 'center',
  '&::before, &::after': {
    display: 'none'
  },
  '&:hover': {
    boxShadow: 'none'
  }
}]));

const StatContent = styled.div(themeStyles([{
  gridArea: 'content'
}], [{
  gridArea: 'content',
  minWidth: 0,
  overflowWrap: 'anywhere'
}]));

const StatLabel = styled.div(themeStyles([({
  theme
}) => ({
  fontWeight: 'bold',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  fontSize: '.9em',
  color: theme.primary
})], [({
  theme,
  compact
}) => ({
  fontWeight: 500,
  letterSpacing: 1.4,
  fontSize: compact ? 14 : 9,
  textTransform: 'uppercase',
  color: theme.mixer(0.75)
})]));

const StatValue = styled.div(themeStyles([{
  fontSize: '1.8em'
}], [({
  theme
}) => ({
  fontSize: 'clamp(20px, 3.2vh, 32px)',
  fontFamily: '"Consolas", "SFMono-Regular", monospace',
  fontVariantNumeric: 'tabular-nums',
  marginTop: 5,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '-1px',
  textShadow: `0 0 24px ${fade(theme.primary, 0.8)}`,
  '.dim': {
    color: theme.mixer(0.5),
    textShadow: 'none'
  }
})]));

const IconBadge = styled.div({
  gridArea: 'icon',
  width: 'clamp(40px, 3.6vw, 50px)',
  height: 'clamp(40px, 3.6vw, 50px)',
  display: 'grid',
  placeItems: 'center',
});

const StatIcon = styled(Icon)(themeStyles([({
  theme
}) => ({
  gridArea: 'icon',
  width: 38,
  height: 38,
  color: theme.primary
})], [({
  theme
}) => ({
  width: 'clamp(26px, 2.2vw, 32px)',
  height: 'clamp(26px, 2.2vw, 32px)',
  color: theme.primary
})]));

export default function Stat({
  compact = false,
  tooltip,
  tooltipAlign,
  tooltipPosition,
  linkTo,
  label,
  icon,
  waitForCore = true,
  children,
}) {
  const { modern } = useTheme();
  const coreConnected = useSelector(isCoreConnected);
  const value =
    waitForCore && !coreConnected ? <span className="dim">-</span> : children;
  return (
    modern ? (<Tooltip.Trigger
      tooltip={tooltip}
      align={tooltipAlign}
      position={tooltipPosition}
    >
      <StatWrapper compact={compact} as={linkTo ? Link : undefined} to={linkTo || undefined}>
        <StatContent>
          <StatLabel compact={compact}>{label}</StatLabel>
          <StatValue>{value}</StatValue>
        </StatContent>
        {!compact && <IconBadge><StatIcon icon={icon} /></IconBadge>}
      </StatWrapper>
    </Tooltip.Trigger>) : (<Tooltip.Trigger
      align="end"
      tooltip={tooltip}
      align={tooltipAlign}
      position={tooltipPosition}
    >
      <StatWrapper as={linkTo ? Link : undefined} to={linkTo || undefined}>
        <StatContent>
          <StatLabel>{label}</StatLabel>
          <StatValue>{value}</StatValue>
        </StatContent>
        <StatIcon icon={icon} />
      </StatWrapper>
    </Tooltip.Trigger>)
  );
}
