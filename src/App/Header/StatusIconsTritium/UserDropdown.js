import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { arrowStyles } from 'components/Arrow';
import LoginModal from 'components/LoginModal';
import { isLoggedIn } from 'selectors';
import { openModal } from 'actions/overlays';
import { timing, animations, consts } from 'styles';

const UserDropdownComponent = styled.div(({ theme }) => ({
  position: 'fixed',
  background: theme.background,
  color: theme.foreground,
  maxWidth: 220,
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

const CurrentUser = styled.div(({ theme }) => ({
  padding: '5px 15px 10px',
  textAlign: 'center',
  // borderBottom: `1px solid ${theme.mixer(0.125)}`,
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

const UserDropdown = ({ loggedIn, currentUser, openModal, ...rest }) => (
  <UserDropdownComponent {...rest}>
    {loggedIn && (
      <>
        <CurrentUser>{currentUser}</CurrentUser>
        <Separator />
      </>
    )}

    {loggedIn ? (
      <>
        <MenuItem>{__('My Addresses')}</MenuItem>
        <MenuItem>{__('Log out')}</MenuItem>
      </>
    ) : (
      <>
        <MenuItem
          onClick={() => {
            openModal(LoginModal);
          }}
        >
          {__('Log in')}
        </MenuItem>
        <MenuItem>{__('Create new user')}</MenuItem>
      </>
    )}
  </UserDropdownComponent>
);

const mapStateToProps = state => ({
  loggedIn: isLoggedIn(state),
  currentUser: state.core.userStatus && state.core.userStatus.username,
});

const actionCreators = { openModal };

export default connect(
  mapStateToProps,
  actionCreators
)(UserDropdown);
