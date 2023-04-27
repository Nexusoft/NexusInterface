import { useSelector } from 'react-redux';

import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import Icon from 'components/Icon';
import SetRecoveryModal from 'components/SetRecoveryModal';
import ChangePasswordPinModal from 'components/ChangePasswordPinModal';
import { openModal } from 'lib/ui';
import menuIcon from 'icons/menu.svg';

__ = __context('User');

export default function UserOptions() {
  const hasRecoveryPhrase = useSelector(
    ({ user: { profileStatus } }) => !!profileStatus?.recovery
  );

  return (
    <Dropdown
      dropdown={({ closeDropdown }) => (
        <>
          <Dropdown.MenuItem
            onClick={() => {
              closeDropdown();
              openModal(ChangePasswordPinModal);
            }}
          >
            {__('Change password & PIN')}
          </Dropdown.MenuItem>

          <Dropdown.MenuItem
            onClick={() => {
              closeDropdown();
              openModal(SetRecoveryModal);
            }}
          >
            {hasRecoveryPhrase
              ? __('Change recovery phrase')
              : __('Set recovery phrase')}
          </Dropdown.MenuItem>
        </>
      )}
    >
      {({ controlRef, openDropdown }) => (
        <Button
          skin="plain"
          ref={controlRef}
          onClick={openDropdown}
          style={{ height: 'auto' }}
        >
          <Icon icon={menuIcon} />
        </Button>
      )}
    </Dropdown>
  );
}
