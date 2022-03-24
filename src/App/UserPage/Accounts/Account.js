import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

import NexusAddress from 'components/NexusAddress';
import QRButton from 'components/QRButton';
import TokenName from 'components/TokenName';
import Dropdown from 'components/Dropdown';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import { selectUsername } from 'lib/user';
import walletIcon from 'icons/wallet.svg';
import ellipsisIcon from 'icons/ellipsis.svg';

import AccountDetailsModal from './AccountDetailsModal';
import AccountHistoryModal from './AccountHistoryModal';
import RenameAccountModal from './RenameAccountModal';
import { totalBalance } from './utils';

__ = __context('User.Accounts');

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0 3em',
}));

const AccountInfo = styled.div({
  cursor: 'pointer',
});

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const UnNamed = styled(AccountName)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.8),
}));

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

export default function Account({ account }) {
  const username = useSelector(selectUsername);
  return (
    <AccountComponent>
      <div className="flex space-between">
        <AccountInfo>
          <Icon icon={walletIcon} className="mr0_4" />
          <span
            className="v-align"
            onClick={() => {
              openModal(AccountDetailsModal, { account });
            }}
          >
            {account.name ? (
              <AccountName>
                {!!account.nameIsLocal && <Prefix>{username}:</Prefix>}
                {account.name}
              </AccountName>
            ) : (
              <UnNamed>{__('Unnamed account')}</UnNamed>
            )}

            <span>
              {' '}
              ({formatNumber(totalBalance(account))}{' '}
              <TokenName account={account} />)
            </span>
          </span>
        </AccountInfo>
        <div className="flex center">
          <QRButton address={account.address} className="mr1" />
          <Dropdown
            dropdown={({ closeDropdown }) => (
              <>
                <Dropdown.MenuItem
                  onClick={() => {
                    closeDropdown();
                    openModal(AccountDetailsModal, { account });
                  }}
                >
                  {__('Details')}
                </Dropdown.MenuItem>
                {account.name !== 'default' && (
                  <Dropdown.MenuItem
                    onClick={() => {
                      closeDropdown();
                      openModal(RenameAccountModal, { account });
                    }}
                  >
                    {__('Rename')}
                  </Dropdown.MenuItem>
                )}
                <Dropdown.MenuItem
                  onClick={() => {
                    closeDropdown();
                    openModal(AccountHistoryModal, { account });
                  }}
                >
                  {__('Transaction History')}
                </Dropdown.MenuItem>
              </>
            )}
          >
            {({ open, controlRef, openDropdown }) => (
              <Button
                skin="plain"
                fitHeight
                ref={controlRef}
                onClick={openDropdown}
                className={open ? 'hover' : undefined}
              >
                <Icon icon={ellipsisIcon} />
              </Button>
            )}
          </Dropdown>
        </div>
      </div>
      <NexusAddress className="mt1" address={account.address} />
    </AccountComponent>
  );
}
