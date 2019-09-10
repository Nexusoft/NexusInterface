import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Button from 'components/Button';
import { switchUserTab } from 'actions/ui';

const StakingWrapper = styled.div(({ theme }) => ({
  maxWidth: 300,
  margin: '0 auto',
  paddingTop: 15,
  paddingLeft: 30,
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
    stakeInfo: state.core.stakeInfo,
  }),
  { switchUserTab }
)
export default class Staking extends React.Component {
  constructor(props) {
    super(props);
    props.switchUserTab('Staking');
  }

  render() {
    const { stakeInfo } = this.props;

    return (
      !!stakeInfo && (
        <StakingWrapper>
          <Line bold>
            <div>{__('Status')}</div>
            <div>{stakeInfo.staking ? __('Staking') : __('Not staking')}</div>
          </Line>
          <Line>
            <div>{__('Stake balance')}</div>
            <div>{stakeInfo.stake} NXS</div>
          </Line>
          <Line>
            <div>{__('Stake Rate')}</div>
            <div>{stakeInfo.stakerate} %</div>
          </Line>
          <Line>
            <div>{__('Trust Weight')}</div>
            <div>{stakeInfo.trustweight} %</div>
          </Line>
          <Line>
            <div>{__('Block Weight')}</div>
            <div>{stakeInfo.blockweight} %</div>
          </Line>
          <Line>
            <div>{__('Stake Weight')}</div>
            <div>{stakeInfo.stakeweight} %</div>
          </Line>
          <Line>
            <div>{__('Unstaked balance')}</div>
            <div>{stakeInfo.balance} NXS</div>
          </Line>
          <div className="mt2">
            <Button disabled={!stakeInfo.stake && !stakeInfo.balance}>
              {__('Adjust stake balance')}
            </Button>
          </div>
        </StakingWrapper>
      )
    );
  }
}
