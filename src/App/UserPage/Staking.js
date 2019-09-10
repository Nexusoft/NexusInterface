import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Button from 'components/Button';
import { switchUserTab } from 'actions/ui';
import { updateSettings } from 'actions/settings';
import { restartCore } from 'actions/core';
import confirm from 'utils/promisified/confirm';

import QuestionMark from './QuestionMark';

const StakingWrapper = styled.div(({ theme }) => ({
  maxWidth: 400,
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
    stakingEnabled: state.settings.enableStaking,
  }),
  { switchUserTab, updateSettings, restartCore }
)
export default class Staking extends React.Component {
  constructor(props) {
    super(props);
    props.switchUserTab('Staking');
  }

  switchStaking = async () => {
    const { stakingEnabled, updateSettings, restartCore } = this.props;
    const confirmed = await confirm({
      question: __('Restart Core?'),
      note: __('Nexus Core needs to restart for this change to take effect'),
      labelYes: stakingEnabled ? __('Disable staking') : __('Enable staking'),
      labelNo: __('Cancel'),
    });
    if (confirmed) {
      updateSettings({ enableStaking: !stakingEnabled });
      restartCore();
    }
  };

  render() {
    const { stakeInfo, stakingEnabled } = this.props;

    return (
      !!stakeInfo && (
        <StakingWrapper>
          <Line bold>
            <div>{__('Status')}</div>
            <div>{stakeInfo.staking ? __('Staking') : __('Not staking')}</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake balance')}</span>
              <QuestionMark
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </div>
            <div>{stakeInfo.stake} NXS</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake Rate')}</span>
              <QuestionMark
                tooltip={__(
                  'The current annual reward rate earned for staking as an annual percent'
                )}
              />
            </div>
            <div>{stakeInfo.stakerate} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Trust Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'The current trust weight applied to staking as a percent of maximum'
                )}
              />
            </div>
            <div>{stakeInfo.trustweight} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Block Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'The current block weight applied to staking as a percent of maximum'
                )}
              />
            </div>
            <div>{stakeInfo.blockweight} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'The current stake weight (trust weight and block weight combined) as a percent of maximum'
                )}
              />
            </div>
            <div>{stakeInfo.stakeweight} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Unstaked balance')}</span>
              <QuestionMark
                tooltip={__(
                  'The current stake weight (trust weight and block weight combined) as a percent of maximum'
                )}
              />
            </div>
            <div>{stakeInfo.balance} NXS</div>
          </Line>
          <div className="mt1 flex space-between">
            <Button disabled={!stakeInfo.stake && !stakeInfo.balance}>
              {__('Adjust stake balance')}
            </Button>
            <Button
              skin={stakingEnabled ? 'default' : 'primary'}
              onClick={this.switchStaking}
            >
              {stakingEnabled ? __('Disable staking') : __('Enable staking')}
            </Button>
          </div>
        </StakingWrapper>
      )
    );
  }
}
