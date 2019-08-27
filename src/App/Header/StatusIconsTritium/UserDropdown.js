import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

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
}));

const CurrentUser = styled.div(({ theme }) => ({
  padding: '5px 12px 10px',
  textAlign: 'center',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  color: theme.primary,
  fontWeight: 'bold',
}));

const MenuItem = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `0 12px`,
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
  borderBottom: `1px solid ${theme.mixer(0.25)}`,
}));

const UserDropdown = ({ currentUser, ...rest }) => (
  <UserDropdownComponent {...rest}>
    {!!currentUser && <CurrentUser>{currentUser}</CurrentUser>}

    <MenuItem>{__('Create new user')}</MenuItem>
    <MenuItem>{__('Log in')}</MenuItem>
  </UserDropdownComponent>
);

const mapStateToProps = ({ currentUser }) => ({
  currentUser,
});

export default connect(mapStateToProps)(UserDropdown);
