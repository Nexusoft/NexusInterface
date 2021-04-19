// External
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { isCoreConnected } from 'selectors';
import { timing } from 'styles';

__ = __context('Overview');

const StatWrapper = styled.div(
  ({ theme }) => ({
    display: 'block',
    margin: '1.7em 0',
    display: 'flex',
    alignItems: 'center',
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
  width: 38,
  height: 38,
  color: theme.primary,
}));

export default function Stat({
  tooltip,
  tooltipAlign,
  tooltipPosition,
  linkTo,
  label,
  icon,
  waitForCore = true,
  children,
}) {
  const coreConnected = useSelector(isCoreConnected);
  const value =
    waitForCore && !coreConnected ? <span className="dim">-</span> : children;
  return (
    <Tooltip.Trigger
      align="end"
      tooltip={tooltip}
      align={tooltipAlign}
      position={tooltipPosition}
    >
      <StatWrapper as={linkTo ? Link : undefined} to={linkTo || undefined}>
        <div>
          <StatLabel>{label}</StatLabel>
          <StatValue>{value}</StatValue>
        </div>
        <StatIcon icon={icon} />
      </StatWrapper>
    </Tooltip.Trigger>
  );
}
