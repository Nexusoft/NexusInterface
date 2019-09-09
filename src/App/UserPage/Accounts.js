import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import NexusAddress from 'components/NexusAddress';
import { switchUserTab } from 'actions/ui';
import { listAccounts } from 'actions/core';

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
            <NexusAddress
              address={account.address}
              label={`${account.name} (${account.balance} ${account.token_name})`}
            />
          ))}
        </AccountsWrapper>
      )
    );
  }
}
