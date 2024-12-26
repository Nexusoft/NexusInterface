import { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import QuestionCircle from 'components/QuestionCircle';
import TokenName from 'components/TokenName';
import { refreshBalances } from 'lib/user';
import { selectBalances } from 'selectors';
import { subscribe } from 'store';
import { formatNumber } from 'lib/intl';
import { loggedInAtom } from 'lib/session';

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

export default function Balances() {
  const [nxsBalances, tokenBalances] = useSelector(selectBalances);
  useEffect(() => {
    refreshBalances();
    return subscribe(loggedInAtom, (loggedIn) => {
      if (loggedIn) {
        refreshBalances();
      }
    });
  }, []);

  const total =
    nxsBalances &&
    nxsBalances.available +
      nxsBalances.unclaimed +
      nxsBalances.unconfirmed +
      nxsBalances.stake +
      nxsBalances.immature;

  return (
    <BalancesColumn>
      {!!nxsBalances && (
        <Fragment>
          <BalancesTitle>{__('NXS balances')}</BalancesTitle>

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
              <Value>{formatNumber(nxsBalances.available, 6)} NXS</Value>
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
              <Value>{formatNumber(nxsBalances.stake, 6)} NXS</Value>
            </Line>

            <Line>
              <Label>
                <span className="v-align">{__('Unclaimed')}</span>
                <QuestionCircle
                  tooltip={__(
                    'The sum of all debit and coinbase transactions made to your NXS accounts that are confirmed but have not yet been credited. This does NOT include immature and unconfirmed amounts'
                  )}
                />
              </Label>
              <Value>{formatNumber(nxsBalances.unclaimed, 6)} NXS</Value>
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
              <Value>{formatNumber(nxsBalances.unconfirmed, 6)} NXS</Value>
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
              <Value>{formatNumber(nxsBalances.immature, 6)} NXS</Value>
            </Line>
          </BalancesWrapper>
        </Fragment>
      )}

      {tokenBalances?.map((balance) => (
        <Fragment key={balance.token}>
          <BalancesTitle>
            {__('%{token_name} balances', {
              token_name: TokenName.from({ account: balance }),
            })}
          </BalancesTitle>

          <BalancesWrapper>
            <Line bold>
              <Label>{__('Total')}</Label>
              <Value>
                {formatNumber(
                  balance.available + balance.unclaimed + balance.unconfirmed,
                  balance.decimals
                )}{' '}
                <TokenName account={balance} />
              </Value>
            </Line>

            <Line>
              <Label>
                <span className="v-align">{__('Available')}</span>
              </Label>
              <Value>
                {formatNumber(balance.available, balance.decimals)}{' '}
                <TokenName account={balance} />
              </Value>
            </Line>

            <Line>
              <Label>
                <span className="v-align">{__('Unclaimed')}</span>
              </Label>
              <Value>
                {formatNumber(balance.unclaimed, balance.decimals)}{' '}
                <TokenName account={balance} />
              </Value>
            </Line>

            <Line>
              <Label>
                <span className="v-align">{__('Unconfirmed')}</span>
              </Label>
              <Value>
                {formatNumber(balance.unconfirmed, balance.decimals)}{' '}
                <TokenName account={balance} />
              </Value>
            </Line>
          </BalancesWrapper>
        </Fragment>
      ))}
    </BalancesColumn>
  );
}
