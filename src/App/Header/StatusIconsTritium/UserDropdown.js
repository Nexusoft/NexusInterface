import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { arrowStyles } from 'components/Arrow';
import LoginModal from 'components/LoginModal';
import Button from 'components/Button';
import NewUserModal from 'components/NewUserModal';
import SetRecoveryModal from 'components/SetRecoveryModal';
import { confirmPin, openErrorDialog } from 'lib/dialog';
import { isLoggedIn } from 'selectors';
import { openModal, showNotification } from 'lib/ui';
import { timing, animations, consts } from 'styles';
import { authorizeMasterProfile, logOut, selectUsername } from 'lib/user';

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

const MenuItem = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `0 15px`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `background-color ${timing.normal}`,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  height: consts.inputHeightEm + 'em',
  '&:hover': {
    background: theme.mixer(0.125),
  },
}));

const Separator = styled.div(({ theme }) => ({
  margin: '3px 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

function LoggedInDropdown({ closeDropdown }) {
  const currentUser = useSelector(selectUsername);
  const manualNoUsername =
    !currentUser && useSelector((state) => state.settings.manualDaemon);
  const hasRecoveryPhrase = useSelector(
    (state) => !!state.user.status?.recovery
  );
  const multiuser = useSelector((state) => !!state.core.systemInfo?.multiuser);
  const hasOtherSessions = useSelector(
    (state) => Object.keys(state.sessions).length > 1
  );
  const blocking = true; //useSelector((state) => state.settings.)

  return (
    <>
      <CurrentUser>
        {manualNoUsername && (
          <Button
            onClick={async () => {
              try {
                const pin = await confirmPin({
                  note: __('Authorize interface to gather more data.'), //TODO: re-word
                });
                await authorizeMasterProfile({ pin });
              } catch (error) {
                openErrorDialog({
                  message: error.message,
                  note: error.code,
                });
              }
              closeDropdown();
            }}
          >
            {__('Authorize')}
          </Button>
        )}
        <Username>{currentUser}</Username>
      </CurrentUser>
      <Separator />
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
      {multiuser && (
        <>
          {hasOtherSessions && (
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
              openModal(LoginModal);
              closeDropdown();
            }}
          >
            {__('Log in to another user')}
          </MenuItem>
          <Separator />
        </>
      )}
      <MenuItem
        onClick={async () => {
          closeDropdown();
          const pin =
            blocking &&
            (await confirmPin({
              note: 'Logout blocking active, enter Pin to logout',
            }));
          if (blocking && !pin) return;

          await logOut({ pin });
          showNotification('Logged out');
        }}
      >
        {multiuser ? __('Log out of all users') : __('Log out')}
      </MenuItem>
    </>
  );
}

function NotLoggedInDropdown({ closeDropdown }) {
  const multiuser = useSelector((state) => !!state.core.systemInfo?.multiuser);
  const hasOtherSessions = useSelector(
    (state) => Object.keys(state.sessions).length > 1
  );
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
      {multiuser && hasOtherSessions && (
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
  const loggedIn = useSelector(isLoggedIn);
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
