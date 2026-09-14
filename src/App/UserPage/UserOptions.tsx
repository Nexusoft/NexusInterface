import { useAtomValue } from 'jotai';

import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import Icon from 'components/Icon';
import SetRecoveryModal from 'components/SetRecoveryModal';
import ChangePasswordPinModal from 'components/ChangePasswordPinModal';
import { hasRecoveryPhraseAtom } from 'lib/session';
import { openModal } from 'lib/ui';
import menuIcon from 'icons/menu.svg';
import { RefObject } from 'react';

__ = __context('User');

export default function UserOptions() {
  const hasRecoveryPhrase = useAtomValue(hasRecoveryPhraseAtom);

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
      {({ ref, openDropdown }) => (
        <Button
          skin="plain"
          ref={ref as RefObject<HTMLButtonElement>}
          onClick={openDropdown}
          style={{ height: 'auto' }}
        >
          <Icon icon={menuIcon} />
        </Button>
      )}
    </Dropdown>
  );
}
