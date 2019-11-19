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
    marginTop: '.6em',
    '&::after': {
      content: '""',
      display: 'block',
      clear: 'both',
    },
  },
  ({ bold, theme }) =>
    bold && {
      fontWeight: 'bold',
      color: theme.foreground,
    }
);

const Label = styled.div({
  whiteSpace: 'nowrap',
  float: 'left',
});

const Value = styled.div({
  whiteSpace: 'nowrap',
  float: 'right',
});

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
            <Label>{__('Total')}</Label>
            <Value>{formatNumber(total, 6)} NXS</Value>
          </Line>
          <Line>
            <Label>
              <span className="v-align">{__('Available')}</span>

              <QuestionCircle
                tooltip={__(
                  'The current balance across all NXS accounts that is available to be spent'
                )}
              />
            </Label>
            <Value>{formatNumber(balances.available, 6)} NXS</Value>
          </Line>
          <Line>
            <Label>
              <span className="v-align">{__('Pending')}</span>

              <QuestionCircle
                tooltip={__(
                  'The sum of all debit and coinbase transactions made to your NXS accounts that are confirmed but have not yet been credited. This does NOT include immature and unconfirmed amounts'
                )}
              />
            </Label>
            <Value>{formatNumber(balances.pending, 6)} NXS</Value>
          </Line>
          <Line>
            <Label>
              <span className="v-align">{__('Unconfirmed')}</span>

              <QuestionCircle
                tooltip={__(
                  'The sum of all debit transactions made to your NXS accounts that are not confirmed, or credits you have made to your accounts that are not yet confirmed (not yet included in a block)'
                )}
              />
            </Label>
            <Value>{formatNumber(balances.unconfirmed, 6)} NXS</Value>
          </Line>
          <Line>
            <Label>
              <span className="v-align">{__('Stake')}</span>

              <QuestionCircle
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </Label>
            <Value>{formatNumber(balances.stake, 6)} NXS</Value>
          </Line>
          <Line>
            <Label>
              <span className="v-align">{__('Immature')}</span>

              <QuestionCircle
                tooltip={__(
                  'The sum of all coinbase transactions that have not yet reached maturity'
                )}
              />
            </Label>
            <Value>{formatNumber(balances.immature, 6)} NXS</Value>
          </Line>
        </BalancesWrapper>
      )
    );
  }
}
