import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import QuestionCircle from 'components/QuestionCircle';
import TokenName from 'components/TokenName';
import { refreshBalances, loadAccounts } from 'lib/user';
import { selectTokenBalances } from 'selectors';
import { observeStore } from 'store';
import { formatNumber } from 'lib/intl';

__ = __context('Transactions.Balances');

const BalancesColumn = styled.div(({ theme }) => ({
  gridArea: 'balances',
  padding: '0 30px',
  margin: '20px 0',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  overflowY: 'auto',
}));

const BalancesTitle = styled.div(({ theme }) => ({
  color: theme.primary,
  textTransform: 'uppercase',
  textAlign: 'center',
  fontWeight: 'bold',
}));

const BalancesWrapper = styled.div(({ theme }) => ({
  maxWidth: 350,
  margin: '15px auto 30px',
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

@connect((state) => ({
  balances: state.user.balances,
  tokenBalances: selectTokenBalances(state),
  tokenDecimals: state.tokenDecimals,
}))
class Balances extends Component {
  componentDidMount() {
    // Periodically get balances
    refreshBalances();
    this.unobserve = observeStore(
      ({ user }) => user && user.status,
      refreshBalances
    );

    // Load accounts to display token balances if any
    loadAccounts();
  }

  componentWillUnmount() {
    if (this.unobserve) this.unobserve();
  }

  render() {
    const { balances, tokenBalances, tokenDecimals } = this.props;
    const total =
      balances &&
      balances.available +
        balances.pending +
        balances.unconfirmed +
        balances.stake +
        balances.immature;

    return (
      <BalancesColumn>
        <BalancesTitle>{__('NXS balances')}</BalancesTitle>
        {!!balances && (
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
        )}

        {tokenBalances.map((token) => {
          let decimals = tokenDecimals[token.address];
          if (decimals === undefined || decimals > 6) {
            decimals = 6;
          }
          return (
            <Fragment key={token.address}>
              <BalancesTitle>
                {__('%{token_name} balances', {
                  token_name: TokenName.from({ token }),
                })}
              </BalancesTitle>

              <BalancesWrapper>
                <Line bold>
                  <Label>{__('Total')}</Label>
                  <Value>
                    {formatNumber(
                      token.balance + token.pending + token.unconfirmed,
                      decimals
                    )}{' '}
                    <TokenName token={token} />
                  </Value>
                </Line>

                <Line>
                  <Label>
                    <span className="v-align">{__('Available')}</span>
                  </Label>
                  <Value>
                    {formatNumber(token.balance, decimals)}{' '}
                    <TokenName token={token} />
                  </Value>
                </Line>

                <Line>
                  <Label>
                    <span className="v-align">{__('Pending')}</span>
                  </Label>
                  <Value>
                    {formatNumber(token.pending, decimals)}{' '}
                    <TokenName token={token} />
                  </Value>
                </Line>

                <Line>
                  <Label>
                    <span className="v-align">{__('Unconfirmed')}</span>
                  </Label>
                  <Value>
                    {formatNumber(token.unconfirmed, decimals)}{' '}
                    <TokenName token={token} />
                  </Value>
                </Line>
              </BalancesWrapper>
            </Fragment>
          );
        })}
      </BalancesColumn>
    );
  }
}

export default Balances;
