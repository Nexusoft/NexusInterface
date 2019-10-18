import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import QuestionCircle from 'components/QuestionCircle';
import { getBalances } from 'lib/user';
import { observeStore } from 'store';
import { formatNumber } from 'lib/intl';

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

@connect(state => ({
  balances: state.core.balances,
}))
export default class Balances extends React.Component {
  componentDidMount() {
    // Periodically get balances
    getBalances();
    this.unobserve = observeStore(
      ({ core }) => core && core.userStatus,
      getBalances
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
            <div>{formatNumber(total, 6)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Available')}</span>

              <QuestionCircle
                tooltip={__(
                  'The current balance across all NXS accounts that is available to be spent'
                )}
              />
            </div>
            <div>{formatNumber(balances.available, 6)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Pending')}</span>

              <QuestionCircle
                tooltip={__(
                  'The sum of all debit and coinbase transactions made to your NXS accounts that are confirmed but have not yet been credited. This does NOT include immature and unconfirmed amounts'
                )}
              />
            </div>
            <div>{formatNumber(balances.pending, 6)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Unconfirmed')}</span>

              <QuestionCircle
                tooltip={__(
                  'The sum of all debit transactions made to your NXS accounts that are not confirmed, or credits you have made to your accounts that are not yet confirmed (not yet included in a block)'
                )}
              />
            </div>
            <div>{formatNumber(balances.unconfirmed, 6)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake')}</span>

              <QuestionCircle
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </div>
            <div>{formatNumber(balances.stake, 6)} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Immature')}</span>

              <QuestionCircle
                tooltip={__(
                  'The sum of all coinbase transactions that have not yet reached maturity'
                )}
              />
            </div>
            <div>{formatNumber(balances.immature, 6)} NXS</div>
          </Line>
        </BalancesWrapper>
      )
    );
  }
}
