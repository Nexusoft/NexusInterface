import React from 'react';
import { useSelector } from 'react-redux';

import DropdownMenu from 'components/DropdownMenu';
import Button from 'components/Button';
import Icon from 'components/Icon';
import SetRecoveryModal from 'components/SetRecoveryModal';
import ChangePasswordModal from 'components/ChangePasswordModal';
import { openModal } from 'lib/ui';
import menuIcon from 'icons/menu.svg';

const UserOptions = () => {
  const hasRecoveryPhrase = useSelector(
    ({ core: { userStatus } }) => !!(userStatus && userStatus.recovery)
  );

  return (
    <DropdownMenu
      renderControl={({ open, controlRef, openDropdown }) => (
        <Button
          skin="plain"
          ref={controlRef}
          onClick={openDropdown}
          style={{ height: 'auto' }}
        >
          <Icon icon={menuIcon} />
        </Button>
      )}
      renderDropdown={({ closeDropdown }) => (
        <>
          <DropdownMenu.MenuItem
            onClick={() => {
              closeDropdown();
              openModal(ChangePasswordModal);
            }}
          >
            {__('Change password & PIN')}
          </DropdownMenu.MenuItem>

          <DropdownMenu.MenuItem
            onClick={() => {
              closeDropdown();
              openModal(SetRecoveryModal);
            }}
          >
            {hasRecoveryPhrase
              ? __('Change recovery phrase')
              : __('Set recovery phrase')}
          </DropdownMenu.MenuItem>
        </>
      )}
    />
  );
};

export default UserOptions;
