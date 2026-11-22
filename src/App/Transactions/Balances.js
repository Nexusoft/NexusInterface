import { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade, mix } from 'utils/color';
import { moduleLayout, modulePanel } from 'utils/moduleStyles';

import QuestionCircle from 'components/QuestionCircle';
import TokenName from 'components/TokenName';
import { refreshBalances } from 'lib/user';
import { selectBalances } from 'selectors';
import { observeStore } from 'store';
import { formatNumber } from 'lib/intl';

__ = __context('Transactions.Balances');

const BalanceCards = styled.div(({ theme }) => ({
  gridArea: 'balances', minWidth: 0,
  '.cards': { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 },
  '.card': { ...modulePanel(theme), padding: '16px 18px', background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.09)}, ${theme.background})`, minWidth: 0 },
  '.label': { fontSize: 10, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: theme.mixer(0.75), marginBottom: 10 },
  '.value': { fontSize: 'clamp(18px, 1.6vw, 22px)', fontFamily: moduleLayout.monoFont, fontWeight: 400, lineHeight: 1.3, letterSpacing: '-0.8px', color: theme.foreground, textShadow: `0 0 24px ${fade(theme.primary, 0.8)}`, overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' },
  details: { marginTop: 10, fontSize: 12 },
  summary: { cursor: 'pointer', color: theme.primary },
  '.breakdown': { display: 'flex', gap: 18, flexWrap: 'wrap', padding: '10px 0' },
  '@media (max-width: 650px)': { '.cards': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
}));

const BalancesColumn = styled.div(({ theme }) => ({
  gridArea: 'balances',
  padding: '0 30px',
  margin: '20px 0',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  overflowY: 'auto',
  ...(theme.modern && {
    minWidth: 0, padding: 20, margin: 0, borderRadius: 16,
    border: `1px solid ${fade(theme.primary, 0.8)}`,
    background: 'linear-gradient(135deg, #1b2b31, #1c1e20)',
    fontSize: 13,
  }),
}));

const BalancesTitle = styled.div(({ theme }) => ({
  color: theme.primary,
  textTransform: 'uppercase',
  textAlign: 'center',
  fontWeight: 'bold',
  ...(theme.modern && { textAlign: 'left', fontSize: 11, letterSpacing: 2, overflowWrap: 'anywhere' }),
}));

const BalancesWrapper = styled.div(({ theme }) => ({
  maxWidth: 350,
  margin: '15px auto 30px',
  color: theme.mixer(0.75),
  ...(theme.modern && { maxWidth: 'none', margin: '16px 0 28px' }),
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
  ({ theme }) => theme.modern && ({
    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '6px 12px',
    padding: '10px 0', marginTop: 0, borderBottom: `1px solid ${theme.mixer(0.1)}`,
    '&::after': { display: 'none' },
  }),
  ({ bold, theme }) =>
    bold && {
      fontWeight: 'bold',
      color: theme.foreground,
    }
);

const Label = styled.div({
  whiteSpace: 'nowrap',
  float: 'left',
}, ({ theme }) => theme.modern && ({ float: 'none', whiteSpace: 'normal' }));

const Value = styled.div({
  whiteSpace: 'nowrap',
  float: 'right',
}, ({ theme }) => theme.modern && ({ float: 'none', whiteSpace: 'normal', overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }));

export default function Balances() {
  const { modern } = useTheme();
  const [nxsBalances, tokenBalances] = useSelector(selectBalances);
  useEffect(() => {
    refreshBalances();
    return observeStore(
      ({ user }) => user.status,
      (userStatus) => userStatus && refreshBalances()
    );
  }, []);

  const total =
    nxsBalances &&
    nxsBalances.available +
      nxsBalances.unclaimed +
      nxsBalances.unconfirmed +
      nxsBalances.stake +
      nxsBalances.immature;

  if (modern) {
    const pending = nxsBalances ? nxsBalances.unclaimed + nxsBalances.unconfirmed + nxsBalances.immature : null;
    return <BalanceCards>
      <div className="cards">{[
        [__('Total Balance'), total], [__('Available'), nxsBalances?.available],
        [__('Staked'), nxsBalances?.stake], [__('Pending'), pending],
      ].map(([label, value]) => <div className="card" key={label}><div className="label">{label}</div><div className="value">{value == null ? '\u2014' : `${formatNumber(value, 6)} NXS`}</div></div>)}</div>
      {(!!pending || !!tokenBalances?.length) && <details>
        <summary>{__('Balance breakdown')}</summary>
        {!!nxsBalances && <div className="breakdown"><span>{__('Unclaimed')}: {formatNumber(nxsBalances.unclaimed, 6)} NXS</span><span>{__('Unconfirmed')}: {formatNumber(nxsBalances.unconfirmed, 6)} NXS</span><span>{__('Immature')}: {formatNumber(nxsBalances.immature, 6)} NXS</span></div>}
        {tokenBalances?.map((balance) => <div className="breakdown" key={balance.token}><strong><TokenName account={balance} /></strong><span>{__('Total')}: {formatNumber(balance.available + balance.unclaimed + balance.unconfirmed, balance.decimals)}</span><span>{__('Available')}: {formatNumber(balance.available, balance.decimals)}</span><span>{__('Unclaimed')}: {formatNumber(balance.unclaimed, balance.decimals)}</span><span>{__('Unconfirmed')}: {formatNumber(balance.unconfirmed, balance.decimals)}</span></div>)}
      </details>}
    </BalanceCards>;
  }

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
