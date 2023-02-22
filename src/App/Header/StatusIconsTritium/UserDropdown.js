import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { arrowStyles } from 'components/Arrow';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import SetRecoveryModal from 'components/SetRecoveryModal';
import { isLoggedIn } from 'selectors';
import { openModal, showNotification } from 'lib/ui';
import { timing, animations, consts } from 'styles';
import { logOut, selectUsername } from 'lib/user';

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
  const hasRecoveryPhrase = useSelector(
    (state) => !!state.user.profileStatus?.recovery
  );
  const multiuser = useSelector((state) => !!state.core.systemInfo?.multiuser);
  const hasOtherSessions = useSelector(
    ({ sessions }) => !!sessions && Object.keys(sessions).length > 1
  );

  return (
    <>
      <CurrentUser>
        <Username>{currentUser}</Username>
      </CurrentUser>
      <Separator />

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
        onClick={async () => {
          closeDropdown();
          await logOut();
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
    ({ sessions }) => !!sessions && Object.keys(sessions).length > 1
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
