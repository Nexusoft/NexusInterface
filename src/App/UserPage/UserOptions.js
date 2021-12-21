import { useSelector } from 'react-redux';

import DropdownMenu from 'components/DropdownMenu';
import Button from 'components/Button';
import Icon from 'components/Icon';
import SetRecoveryModal from 'components/SetRecoveryModal';
import ChangePasswordPinModal from 'components/ChangePasswordPinModal';
import { openModal } from 'lib/ui';
import menuIcon from 'icons/menu.svg';

__ = __context('User');

export default function UserOptions() {
  const hasRecoveryPhrase = useSelector(
    ({ user: { status } }) => !!(status && status.recovery)
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
          <DropdownMenu.Item
            onClick={() => {
              closeDropdown();
              openModal(ChangePasswordPinModal);
            }}
          >
            {__('Change password & PIN')}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => {
              closeDropdown();
              openModal(SetRecoveryModal);
            }}
          >
            {hasRecoveryPhrase
              ? __('Change recovery phrase')
              : __('Set recovery phrase')}
          </DropdownMenu.Item>
        </>
      )}
    />
  );
}
