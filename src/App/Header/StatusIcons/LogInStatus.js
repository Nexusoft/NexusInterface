// External Dependencies
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { navigate } from 'lib/wallet';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import { isCoreConnected } from 'selectors';
import { timing } from 'styles';
import * as color from 'utils/color';
import { formatDateTime } from 'lib/intl';
import StatusIcon from './StatusIcon';

// Images
import questionMarkIcon from 'icons/question-mark.svg';
import lockedIcon from 'icons/padlock.svg';
import unlockedIcon from 'icons/padlock-open.svg';

__ = __context('Header');

const LoginStatusIcon = styled(StatusIcon)(
  ({ theme }) => ({
    cursor: 'pointer',
    color: theme.primary,
    transitionProperty: 'color, filter',
    transitionDuration: timing.normal,
    '&:hover': {
      color: color.lighten(theme.primary, 0.2),
      filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`,
    },
  }),
  ({ danger, theme }) =>
    danger && {
      color: theme.danger,
      '&:hover': {
        color: color.lighten(theme.danger, 0.2),
        filter: `drop-shadow(0 0 3px ${color.fade(theme.danger, 0.5)})`,
      },
    },
  ({ dimmed }) =>
    dimmed && {
      opacity: 0.7,
    }
);

function goToSecurity() {
  navigate('/Settings/Security');
}

export default function LogInStatus() {
  const coreConnected = useSelector(isCoreConnected);
  const unlocked_until = useSelector(
    (state) => state.core.info?.unlocked_until
  );
  const minting_only = useSelector((state) => state.core.info?.minting_only);
  const locked = useSelector((state) => state.core.info?.locked);

  const signInStatusMessage = () => {
    if (!coreConnected) {
      return __('Unknown login status');
    }

    if (locked === undefined) {
      return __('Wallet is not encrypted');
    } else if (locked) {
      return __('Not logged in');
    } else if (locked === false) {
      const unlockDate =
        unlocked_until &&
        formatDateTime(unlocked_until * 1000, {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      return (
        <>
          {__(
            'Logged in<if_timed> until %{unlockDate}</if_timed><if_minting_only> for staking & mining</if_minting_only>',
            {
              unlockDate,
            },
            {
              if_timed: !!unlocked_until,
              if_minting_only: !!minting_only,
            }
          )}
        </>
      );
    }
  };

  const statusIcon = () => {
    if (!coreConnected) {
      return <LoginStatusIcon icon={questionMarkIcon} dimmed />;
    }

    if (locked === undefined) {
      return (
        <LoginStatusIcon icon={unlockedIcon} onClick={goToSecurity} danger />
      );
    } else if (locked === true) {
      return <LoginStatusIcon icon={lockedIcon} onClick={goToSecurity} />;
    } else if (locked === false) {
      return (
        <LoginStatusIcon icon={unlockedIcon} onClick={goToSecurity} dimmed />
      );
    }
  };

  return (
    <Tooltip.Trigger tooltip={signInStatusMessage()} style={{ maxWidth: 200 }}>
      {statusIcon()}
    </Tooltip.Trigger>
  );
}
