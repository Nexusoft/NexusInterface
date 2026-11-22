import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Dropdown from 'components/Dropdown';
import Button from 'components/Button';
import Icon from 'components/Icon';
import SetRecoveryModal from 'components/SetRecoveryModal';
import ChangePasswordPinModal from 'components/ChangePasswordPinModal';
import { openModal } from 'lib/ui';
import menuIcon from 'icons/menu.svg';
import lockIcon from 'icons/padlock.svg';
import recoveryIcon from 'icons/history.svg';
import VerticalTab from 'components/VerticalTab';

__ = __context('User');

const SidebarAction = styled(VerticalTab)({
  width: '100%',
  border: 0,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
});

export default function UserOptions({ sidebar = false, buttons = false, children }) {
  const hasRecoveryPhrase = useSelector(
    ({ user: { profileStatus } }) => !!profileStatus?.recovery
  );

  if (buttons) return (
    <div className="user-security-actions">
      <Button type="button" skin="primary" onClick={() => openModal(ChangePasswordPinModal)}><Icon icon={lockIcon} aria-hidden="true" />{__('Change password & PIN')}</Button>
      <Button type="button" skin="primary" onClick={() => openModal(SetRecoveryModal)}><Icon icon={recoveryIcon} aria-hidden="true" />{__('Recovery settings')}</Button>
      {children}
    </div>
  );

  if (sidebar) {
    return (
      <>
        <SidebarAction
          as="button"
          type="button"
          className="user-option"
          onClick={() => openModal(ChangePasswordPinModal)}
        >
          {__('Change password & PIN')}
        </SidebarAction>
        <SidebarAction
          as="button"
          type="button"
          className="user-option"
          onClick={() => openModal(SetRecoveryModal)}
        >
          {hasRecoveryPhrase
            ? __('Change recovery phrase')
            : __('Set recovery phrase')}
        </SidebarAction>
      </>
    );
  }

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
