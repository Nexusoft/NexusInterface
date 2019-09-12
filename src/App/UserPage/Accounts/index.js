import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab } from 'actions/ui';
import { listAccounts } from 'actions/core';
import plusIcon from 'images/plus.sprite.svg';

import Account from './Account';

const AccountsWrapper = styled.div(({ theme }) => ({
  maxWidth: 500,
  margin: '0 auto',
  paddingTop: 15,
  color: theme.mixer(0.75),
}));

@connect(
  state => ({
    accounts: state.core.accounts,
  }),
  { switchUserTab, listAccounts }
)
export default class Accounts extends React.Component {
  constructor(props) {
    super(props);
    props.switchUserTab('Accounts');
  }

  componentDidMount() {
    this.props.listAccounts();
  }

  render() {
    const { accounts } = this.props;

    return (
      !!accounts && (
        <AccountsWrapper>
          {accounts.map(account => (
            <Account key={account.name} account={account} />
          ))}
          <div className="mt1 flex space-between">
            <div />
            <Button>
              <Icon icon={plusIcon} className="space-right" />
              {__('Create new account')}
            </Button>
          </div>
        </AccountsWrapper>
      )
    );
  }
}
