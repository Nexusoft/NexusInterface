import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab, openModal } from 'lib/ui';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import plusIcon from 'icons/plus.svg';

import Account from './Account';
import NewAccountModal from 'components/NewAccountModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Accounts');

export default function Accounts() {
  const session = useSelector((state) => state.user.session);
  const accounts = useSelector((state) => state.user.accounts);

  useEffect(() => {
    switchUserTab('Accounts');
    loadAccounts();
    loadOwnedTokens();
  }, [session]);

  return (
    !!accounts && (
      <TabContentWrapper>
        <Button wide onClick={() => openModal(NewAccountModal)}>
          <Icon icon={plusIcon} className="mr0_4" />
          {__('Create new account')}
        </Button>
        <div className="mt1">
          {accounts.map((account) => (
            <Account key={account.name + account.address} account={account} />
          ))}
        </div>
      </TabContentWrapper>
    )
  );
}
