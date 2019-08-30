import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { arrowStyles } from 'components/Arrow';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import { isLoggedIn } from 'selectors';
import { openModal } from 'actions/overlays';
import { timing, animations, consts } from 'styles';
import { apiPost } from 'lib/tritiumApi';
import { logOutUser } from 'actions/user';

const UserDropdownComponent = styled.div(({ theme }) => ({
  position: 'fixed',
  background: theme.background,
  color: theme.foreground,
  maxWidth: 250,
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

const LoggedInDropdown = connect(
  state => ({
    currentUser: state.core.userStatus && state.core.userStatus.username,
    unlocked: state.core.userStatus && state.core.userStatus.unlocked,
  }),
  { logOutUser }
)(({ currentUser, closeDropdown, logOutUser, unlocked }) => (
  <>
    <CurrentUser>
      <Username>{currentUser}</Username>
    </CurrentUser>
    <Separator />
    <MenuItem>{__('My Addresses')}</MenuItem>
    <Separator />
    {unlocked && unlocked.minting ? (
      <MenuItem>{__('Lock for staking & mining')}</MenuItem>
    ) : (
      <MenuItem>{__('Unlock for staking & mining')}</MenuItem>
    )}
    <MenuItem
      onClick={async () => {
        closeDropdown();
        await apiPost('users/logout/user');
        logOutUser();
      }}
    >
      {__('Log out')}
    </MenuItem>
  </>
));

const NotLoggedInDropdown = connect(
  null,
  { openModal }
)(({ openModal, closeDropdown }) => (
  <>
    <MenuItem
      onClick={() => {
        openModal(LoginModal);
        closeDropdown();
      }}
    >
      {__('Log in')}
    </MenuItem>
    <MenuItem
      onClick={() => {
        openModal(NewUserModal);
        closeDropdown();
      }}
    >
      {__('Create new user')}
    </MenuItem>
  </>
));

const UserDropdown = ({ loggedIn, closeDropdown, ...rest }) => (
  <UserDropdownComponent {...rest}>
    {loggedIn ? (
      <LoggedInDropdown closeDropdown={closeDropdown} />
    ) : (
      <NotLoggedInDropdown closeDropdown={closeDropdown} />
    )}
  </UserDropdownComponent>
);

const mapStateToProps = state => ({
  loggedIn: isLoggedIn(state),
});

export default connect(mapStateToProps)(UserDropdown);
