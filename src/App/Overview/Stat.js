// External
import { Link } from 'react-router';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { useCoreConnected } from 'lib/coreInfo';
import { timing } from 'styles';

__ = __context('Overview');

export const StatWrapper = styled.div(
  ({ theme }) => ({
    display: 'grid',
    columnGap: 15,
    alignItems: 'center',
    margin: '1.7em 0',
    filter: `drop-shadow(0 0 8px ${theme.mixer(-0.5)}) brightness(100%)`,
    color: theme.foreground,
  }),
  ({ to, theme }) =>
    to && {
      cursor: 'pointer',
      transitionProperty: 'filter',
      transitionDuration: timing.normal,
      transitionTimingFunction: 'ease-out',
      '&:hover': {
        filter: `drop-shadow(0 0 8px ${theme.mixer(0.5)}) brightness(120%)`,
      },
    }
);

const StatContent = styled.div({
  gridArea: 'content',
});

const StatLabel = styled.div(({ theme }) => ({
  fontWeight: 'bold',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  fontSize: '.9em',
  color: theme.primary,
}));

const StatValue = styled.div({
  fontSize: '1.8em',
});

const StatIcon = styled(Icon)(({ theme }) => ({
  gridArea: 'icon',
  width: 38,
  height: 38,
  color: theme.primary,
}));

export default function Stat({
  tooltip,
  tooltipAlign = 'end',
  tooltipPosition,
  linkTo,
  label,
  icon,
  waitForCore = true,
  children,
}) {
  const coreConnected = useCoreConnected();
  const value =
    waitForCore && !coreConnected ? <span className="dim">-</span> : children;
  return (
    <Tooltip.Trigger
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
    </Tooltip.Trigger>
  );
}
