// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import TextField from 'components/TextField';
import * as color from 'utils/color';
import { consts, timing } from 'styles';
import NexusAddress from 'components/NexusAddress';
import { listAccounts, listAccountsAll } from 'api/UserApi';

const PanelHolder = styled.div(({ theme }) => ({
  background: color.lighten(theme.background, 0.2),
  flex: '1',
  padding: '0rem 0rem 1rem 0rem',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `thick solid ${theme.primary}`,
}));

const Title = styled.div(({ theme }) => ({
  background: color.lighten(theme.background, 0.4),
  color: theme.primary,
  fontSize: '1.5em',
  paddingLeft: '0.25em',
}));

const AccountsHolder = styled.div({
  padding: '0.5rem 1rem 0rem 1rem',
  flexGrow: 1,
  flexBasis: '35em',
  overflow: 'auto',
});

const AccountBox = styled.div(({ theme }) => ({
  background: color.lighten(theme.background, 0.4),
  border: `1px solid ${theme.primary}`,
  borderRadius: '2.5px',
  margin: '1em',
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  gridTemplateRows: 'auto',
  transition: `background ${timing.normal}`,
  '&:hover': {
    background: color.darken(theme.background, 0.2),
  },
}));

const AccountBoxRight = styled.div({
  float: 'right',
  margin: 'auto 0% auto auto ',
  paddingRight: '.5em',
  display: 'inlineBlock',
});

const AccountBoxLeft = styled.div({
  paddingLeft: '.5em',
  paddingBottom: '.5em',
});

const NXSAddress = styled(NexusAddress)({
  fontSize: '.75em',
});

class AccountsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAccounts: [],
    };
  }

  componentDidMount() {
    this.tempMakeAccounts();
  }

  async tempMakeAccounts() {
    const sadsasad = await listAccounts({
      username: 'test',
    });
    console.log(sadsasad);
    this.setState({
      userAccounts: sadsasad,
    });
  }

  returnBoxes() {
    return this.state.userAccounts.map(e => {
      return this.makeBox(e);
    });
  }

  makeBox(e) {
    return (
      <AccountBox>
        {' '}
        <AccountBoxLeft>
          <div>{e.name}</div>
          <NXSAddress key={e.address} address={e.address} />
          <div>{e.token_name}</div>
          <NXSAddress key={e.token} address={e.token} />
        </AccountBoxLeft>
        <AccountBoxRight>{`Balance: ${e.balance}`}</AccountBoxRight>
      </AccountBox>
    );
  }

  render() {
    return (
      <PanelHolder style={{ overflow: 'none' }}>
        <Title>{'Accounts'}</Title>
        <AccountsHolder>{this.returnBoxes()}</AccountsHolder>
      </PanelHolder>
    );
  }
}

export default AccountsPanel;
