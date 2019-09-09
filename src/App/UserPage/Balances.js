import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { switchUserTab } from 'actions/ui';
import { getBalances } from 'actions/core';
import { observeStore } from 'store';

const BalancesWrapper = styled.div(({ theme }) => ({
  maxWidth: 300,
  margin: '0 auto',
  paddingTop: 15,
  color: theme.mixer(0.75),
}));

const Line = styled.div(
  {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '.4em',
  },
  ({ bold }) =>
    bold && {
      fontWeight: 'bold',
    }
);

@connect(
  state => ({
    balances: state.core.balances,
  }),
  { switchUserTab, getBalances }
)
export default class Balances extends React.Component {
  constructor(props) {
    super(props);
    props.switchUserTab('Balances');
  }

  componentDidMount() {
    // Periodically get balances
    this.props.getBalances();
    this.unobserve = observeStore(
      ({ core }) => core && core.userStatus,
      this.props.getBalances
    );
  }

  componentWillUnmount() {
    if (this.unobserve) this.unobserve();
  }

  render() {
    const { balances } = this.props;
    const total =
      balances &&
      balances.available +
        balances.pending +
        balances.unconfirmed +
        balances.stake +
        balances.immature_mined +
        balances.immature_stake;

    return (
      !!balances && (
        <BalancesWrapper>
          <Line bold>
            <div>{__('Total balance')}</div>
            <div>{total} NXS</div>
          </Line>
          <Line>
            <div>{__('Available balance')}</div>
            <div>{balances.available} NXS</div>
          </Line>
          <Line>
            <div>{__('Pending balance')}</div>
            <div>{balances.pending} NXS</div>
          </Line>
          <Line>
            <div>{__('Unconfirmed balance')}</div>
            <div>{balances.unconfirmed} NXS</div>
          </Line>
          <Line>
            <div>{__('Staking balance')}</div>
            <div>{balances.stake} NXS</div>
          </Line>
          <Line>
            <div>{__('Immature mined')}</div>
            <div>{balances.immature_mined} NXS</div>
          </Line>
          <Line>
            <div>{__('Immature stake')}</div>
            <div>{balances.immature_stake} NXS</div>
          </Line>
        </BalancesWrapper>
      )
    );
  }
}
