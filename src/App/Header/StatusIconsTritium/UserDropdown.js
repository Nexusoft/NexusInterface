import { useState } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { arrowStyles } from 'components/Arrow';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import SetRecoveryModal from 'components/SetRecoveryModal';
import { multiUserAtom } from 'lib/coreInfo';
import { openModal, showNotification } from 'lib/ui';
import { timing, animations, consts } from 'styles';
import {
  logOut,
  loggedInAtom,
  usernameAtom,
  hasRecoveryPhraseAtom,
} from 'lib/session';

import SwitchUserModal from './SwitchUserModal';

__ = __context('Header.UserDropdown');

const UserDropdownComponent = styled.div(({ theme }) => ({
  position: 'fixed',
  background: theme.background,
  color: theme.foreground,
  width: 'max-content',
  padding: '5px 0',
  fontSize: 15,
  borderRadius: 4,
  boxShadow: '0 0 8px rgba(0,0,0,.7)',
  animation: `${animations.fadeIn} ${timing.normal} ease-out`,

  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    right: 18,
    ...arrowStyles({
      direction: 'up',
      width: 15,
      height: 8,
      color: theme.background,
    }),
  },
}));

const CurrentUser = styled.div({
  padding: '5px 15px 10px',
  textAlign: 'center',
});

const Username = styled.div(({ theme }) => ({
  color: theme.primary,
  fontWeight: 'bold',
}));

const MenuItem = styled.div(({ theme, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `0 15px`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `background-color ${timing.normal}`,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  height: consts.inputHeightEm + 'em',
  opacity: disabled ? 0.5 : 1,
  pointerEvents: disabled ? 'none' : 'initial',
  '&:hover': {
    background: theme.mixer(0.125),
  },
}));

const Separator = styled.div(({ theme }) => ({
  margin: '3px 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

function LoggedInDropdown({ closeDropdown }) {
  const username = useAtomValue(usernameAtom);
  const hasRecoveryPhrase = useAtomValue(hasRecoveryPhraseAtom);
  const multiUser = useAtomValue(multiUserAtom);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <>
      <CurrentUser>
        <Username>{username}</Username>
      </CurrentUser>
      <Separator />

      {multiUser && (
        <>
          <MenuItem
            onClick={() => {
              openModal(SwitchUserModal);
              closeDropdown();
            }}
          >
            {__('Switch user')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              openModal(LoginModal);
              closeDropdown();
            }}
          >
            {__('Log in to another user')}
          </MenuItem>
          <Separator />
        </>
      )}

      <Link to="/User/Accounts" onClick={closeDropdown}>
        <MenuItem>{__('Accounts')}</MenuItem>
      </Link>
      <Link to="/User/Tokens" onClick={closeDropdown}>
        <MenuItem>{__('Tokens')}</MenuItem>
      </Link>
      <Separator />

      {!hasRecoveryPhrase && (
        <>
          <MenuItem
            onClick={() => {
              openModal(SetRecoveryModal);
              closeDropdown();
            }}
          >
            {__('Set recovery phrase')}
          </MenuItem>
          <Separator />
        </>
      )}

      <MenuItem
        disabled={loggingOut}
        onClick={async () => {
          setLoggingOut(true);
          try {
            await logOut();
          } finally {
            setLoggingOut(false);
          }
          closeDropdown();
          showNotification('Logged out');
        }}
      >
        {multiUser ? __('Log out of all users') : __('Log out')}
      </MenuItem>
    </>
  );
}

function NotLoggedInDropdown({ closeDropdown }) {
  const multiUser = useAtomValue(multiUserAtom);
  return (
    <>
      <MenuItem
        onClick={() => {
          openModal(LoginModal);
          closeDropdown();
        }}
      >
        {__('Log in')}
      </MenuItem>
      {multiUser && (
        <MenuItem
          onClick={() => {
            openModal(SwitchUserModal);
            closeDropdown();
          }}
        >
          {__('Switch user')}
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          openModal(NewUserModal);
          closeDropdown();
        }}
      >
        {__('Create new user')}
      </MenuItem>
    </>
  );
}

export default function UserDropdown({ closeDropdown, ...rest }) {
  const loggedIn = useAtomValue(loggedInAtom);
  return (
    <UserDropdownComponent {...rest}>
      {loggedIn ? (
        <LoggedInDropdown closeDropdown={closeDropdown} />
      ) : (
        <NotLoggedInDropdown closeDropdown={closeDropdown} />
      )}
    </UserDropdownComponent>
  );
}
