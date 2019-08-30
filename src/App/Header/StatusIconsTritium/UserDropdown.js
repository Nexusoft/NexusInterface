import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { arrowStyles } from 'components/Arrow';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import PinDialog from 'components/PinDialog';
import { isLoggedIn } from 'selectors';
import { openModal } from 'actions/overlays';
import { getUserStatus } from 'actions/core';
import { timing, animations, consts } from 'styles';
import { apiPost } from 'lib/tritiumApi';
import { logOutUser } from 'actions/user';
import { handleError } from 'utils/form';
import confirm from 'utils/promisified/confirm';

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

@connect(
  state => ({
    currentUser: state.core.userStatus && state.core.userStatus.username,
    unlocked: state.core.userStatus && state.core.userStatus.unlocked,
  }),
  { logOutUser, getUserStatus, openModal }
)
class LoggedInDropdown extends React.Component {
  unlockMinting = () => {
    this.props.closeDropdown();
    this.props.openModal(PinDialog, {
      confirmLabel: __('Unlock'),
      onConfirm: async pin => {
        try {
          await apiPost('users/unlock/user', { pin, minting: true });
          this.props.getUserStatus();
        } catch (err) {
          handleError(err);
        }
      },
    });
  };

  lockMinting = async () => {
    this.props.closeDropdown();
    const confirmed = await confirm({
      question: __('Lock wallet for staking & mining?'),
      note: __("You won't be able to stake or solo mine to this wallet"),
    });
    if (confirmed) {
      try {
        await apiPost('users/unlock/user', { minting: true });
        this.props.getUserStatus();
      } catch (err) {
        handleError(err);
      }
    }
  };

  render() {
    const { currentUser, closeDropdown, logOutUser, unlocked } = this.props;
    return (
      <>
        <CurrentUser>
          <Username>{currentUser}</Username>
        </CurrentUser>
        <Separator />
        <MenuItem>{__('My Addresses')}</MenuItem>
        <Separator />
        {unlocked && unlocked.minting ? (
          <MenuItem onClick={this.lockMinting}>
            {__('Lock for staking & mining')}
          </MenuItem>
        ) : (
          <MenuItem onClick={this.unlockMinting}>
            {__('Unlock for staking & mining')}
          </MenuItem>
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
    );
  }
}

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
