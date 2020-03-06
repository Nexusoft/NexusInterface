import React from 'react';
import { connect } from 'react-redux';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab } from 'lib/ui';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import { openModal } from 'lib/ui';
import plusIcon from 'icons/plus.svg';

import Account from './Account';
import NewAccountModal from 'components/NewAccountModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Accounts');

@connect(state => ({
  accounts: state.user.accounts,
}))
export default class Accounts extends React.Component {
  constructor(props) {
    super(props);
    switchUserTab('Accounts');
  }

  componentDidMount() {
    loadAccounts();
    loadOwnedTokens();
  }

  render() {
    const { accounts } = this.props;

    return (
      !!accounts && (
        <TabContentWrapper>
          <Button
            wide
            onClick={() =>
              openModal(NewAccountModal, {
                tokenName: 'NXS',
                tokenAddress: '0',
              })
            }
          >
            <Icon icon={plusIcon} className="space-right" />
            {__('Create new account')}
          </Button>
          <div className="mt1">
            {accounts.map(account => (
              <Account key={account.name + account.address} account={account} />
            ))}
          </div>
        </TabContentWrapper>
      )
    );
  }
}
