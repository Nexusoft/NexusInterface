// External
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import Arrow from 'components/Arrow';
import Overlay from 'components/Overlay';
import { isLoggedIn } from 'selectors';
import userIcon from 'icons/user.svg';
import { timing } from 'styles';
import * as color from 'utils/color';

import StatusIcon from './StatusIcon';
import UserDropdown from './UserDropdown';

import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';

__ = __context('Header');

const UserControlComponent = styled(StatusIcon)(themeStyles([({
  theme
}) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.primary,
  transitionProperty: 'color, filter',
  transitionDuration: timing.normal,
  '&:hover': {
    color: color.lighten(theme.primary, 0.2),
    filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`
  }
})], [({
  theme
}) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.primary,
  marginLeft: 0,
  padding: '0 10px',
  '&[aria-expanded="true"]': {
    background: color.fade(theme.primary, 0.85),
    borderColor: color.fade(theme.primary, 0.5)
  },
  transitionProperty: 'color, filter',
  transitionDuration: timing.normal,
  '&:hover': {
    color: color.lighten(theme.primary, 0.2),
    filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`
  }
})]), ({
  loggedIn
}) => ({
  opacity: loggedIn ? 1 : 0.7
}));

export default function UserControl() {
  const { modern } = useTheme();
  const [open, setOpen] = useState(false);
  const controlRef = useRef();
  const loggedIn = useSelector(isLoggedIn);

  const openDropdown = () => {
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const getDropdownStyle = () => {
    const el = controlRef.current;
    if (!el) return {};

    const rect = el.getBoundingClientRect();
    return {
      minWidth: 120,
      top: rect.bottom + 18,
      right: window.innerWidth - rect.right,
    };
  };

  return (
    modern ? (<>
      <UserControlComponent
        as="button"
        type="button"
        aria-label={__('Account menu')}
        aria-expanded={open}
        ref={controlRef}
        onClick={openDropdown}
        loggedIn={loggedIn}
      >
        <Icon icon={userIcon} />
        <Arrow
          direction={open ? 'up' : 'down'}
          width={7}
          height={4}
          style={{ marginLeft: 8, opacity: 0.7 }}
        />
      </UserControlComponent>
      {open && (
        <Overlay onBackgroundClick={closeDropdown}>
          <UserDropdown
            closeDropdown={closeDropdown}
            style={getDropdownStyle()}
          />
        </Overlay>
      )}
    </>) : (<>
      <UserControlComponent
        ref={controlRef}
        onClick={openDropdown}
        loggedIn={loggedIn}
      >
        <Icon icon={userIcon} />
        <Arrow
          direction="down"
          width={10}
          height={6}
          style={{ marginLeft: 5 }}
        />
      </UserControlComponent>
      {open && (
        <Overlay onBackgroundClick={closeDropdown}>
          <UserDropdown
            closeDropdown={closeDropdown}
            style={getDropdownStyle()}
          />
        </Overlay>
      )}
    </>)
  );
}
