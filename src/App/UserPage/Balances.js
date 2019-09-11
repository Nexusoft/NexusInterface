import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { switchUserTab } from 'actions/ui';
import { getBalances } from 'actions/core';
import { observeStore } from 'store';
import { formatNumber } from 'lib/intl';

import QuestionMark from './QuestionMark';

const BalancesWrapper = styled.div(({ theme }) => ({
  maxWidth: 350,
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
  ({ bold, theme }) =>
    bold && {
      fontWeight: 'bold',
      color: theme.foreground,
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
        balances.immature;

    return (
      !!balances && (
        <BalancesWrapper>
          <Line bold>
            <div>{__('Total balance')}</div>
            <div>{formatNumber(total)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Available')}</span>

              <QuestionMark
                tooltip={__(
                  'The current balance across all NXS accounts that is available to be spent'
                )}
              />
            </div>
            <div>{formatNumber(balances.available)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Pending')}</span>

              <QuestionMark
                tooltip={__(
                  'The sum of all debit and coinbase transactions made to your NXS accounts that are confirmed but have not yet been credited. This does NOT include immature and unconfirmed amounts'
                )}
              />
            </div>
            <div>{formatNumber(balances.pending)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Unconfirmed')}</span>

              <QuestionMark
                tooltip={__(
                  'The sum of all debit transactions made to your NXS accounts that are not confirmed, or credits you have made to your accounts that are not yet confirmed (not yet included in a block)'
                )}
              />
            </div>
            <div>{formatNumber(balances.unconfirmed)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake')}</span>

              <QuestionMark
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </div>
            <div>{formatNumber(balances.stake)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Immature')}</span>

              <QuestionMark
                tooltip={__(
                  'The sum of all coinbase transactions that have not yet reached maturity'
                )}
              />
            </div>
            <div>{formatNumber(balances.immature)} NXS</div>
          </Line>
        </BalancesWrapper>
      )
    );
  }
}
