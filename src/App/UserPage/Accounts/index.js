import Icon from 'components/Icon';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { accountsQuery } from 'lib/user';
import plusIcon from 'icons/plus.svg';

import { useUserTab } from '../atoms';
import Account from './Account';
import NewAccountModal from 'components/NewAccountModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Accounts');

export default function Accounts() {
  useUserTab('Accounts');
  const accounts = accountsQuery.use();

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
