import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { switchUserTab } from 'actions/ui';
import { getBalances } from 'actions/core';
import { observeStore } from 'store';

import questionIcon from 'images/question-mark-circle.sprite.svg';

const BalancesWrapper = styled.div(({ theme }) => ({
  maxWidth: 300,
  margin: '0 auto',
  paddingTop: 15,
  paddingLeft: 30,
  color: theme.mixer(0.75),
}));

const QuestionMark = styled(Icon)({
  fontSize: '.8em',
  marginLeft: 6,
});

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
            <div>
              <span className="v-align">{__('Available')}</span>
              <Tooltip.Trigger
                tooltip={__(
                  'The current balance across all NXS accounts that is available to be spent'
                )}
              >
                <QuestionMark icon={questionIcon} />
              </Tooltip.Trigger>
            </div>
            <div>{balances.available} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Pending')}</span>
              <Tooltip.Trigger
                tooltip={__(
                  'The sum of all debit and coinbase transactions made to your NXS accounts that are confirmed but have not yet been credited. This does NOT include immature and unconfirmed amounts'
                )}
              >
                <QuestionMark icon={questionIcon} />
              </Tooltip.Trigger>
            </div>
            <div>{balances.pending} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Unconfirmed')}</span>
              <Tooltip.Trigger
                tooltip={__(
                  'The sum of all debit transactions made to your NXS accounts that are not confirmed, or credits you have made to your accounts that are not yet confirmed (not yet included in a block)'
                )}
              >
                <QuestionMark icon={questionIcon} />
              </Tooltip.Trigger>
            </div>
            <div>{balances.unconfirmed} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Staking')}</span>
              <Tooltip.Trigger
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              >
                <QuestionMark icon={questionIcon} />
              </Tooltip.Trigger>
            </div>
            <div>{balances.stake} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Immature')}</span>
              <Tooltip.Trigger
                tooltip={__(
                  'The sum of all coinbase transactions that have not yet reached maturity'
                )}
              >
                <QuestionMark icon={questionIcon} />
              </Tooltip.Trigger>
            </div>
            <div>{balances.immature_mined} NXS</div>
          </Line>
        </BalancesWrapper>
      )
    );
  }
}
