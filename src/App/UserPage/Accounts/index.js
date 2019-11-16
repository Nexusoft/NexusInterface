import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab } from 'lib/ui';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import { openModal } from 'lib/ui';
import plusIcon from 'icons/plus.svg';

import Account from './Account';
import NewAccountModal from 'components/UserDialogs/NewAccountModal';

const AccountsWrapper = styled.div(({ theme }) => ({
  maxWidth: 500,
  margin: '0 auto',
  paddingTop: 15,
  color: theme.mixer(0.75),
}));

@connect(state => ({
  accounts: state.core.accounts,
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
        <AccountsWrapper>
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
        </AccountsWrapper>
      )
    );
  }
}
