import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import Dropdown, { DropdownComponent } from 'components/Dropdown';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import SetRecoveryModal from 'components/SetRecoveryModal';
import { isLoggedIn } from 'selectors';
import { openModal, showNotification } from 'lib/ui';

import { logOut, selectUsername } from 'lib/session';

import SwitchUserModal from './SwitchUserModal';

import themeStyles from 'utils/themeStyles';

__ = __context('Header.UserDropdown');

const UserDropdownComponent = DropdownComponent;
const MenuItem = Dropdown.MenuItem;
const Separator = Dropdown.Separator;

const CurrentUser = styled.div(themeStyles([{
  padding: '5px 15px 10px',
  textAlign: 'center'
}], [{
  padding: '12px 12px 10px',
  textAlign: 'left'
}]));

const Username = styled.div(themeStyles([({
  theme
}) => ({
  color: theme.primary,
  fontWeight: 'bold'
})], [({
  theme
}) => ({
  color: theme.primary,
  fontSize: 15,
  fontWeight: 600,
  overflowWrap: 'anywhere'
})]));

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
      <Link to="/Registry/Tokens" onClick={closeDropdown}>
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
