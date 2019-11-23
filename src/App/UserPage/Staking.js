import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import AdjustStakeModal from 'components/AdjustStakeModal';
import MigrateStakeModal from 'components/MigrateStakeModal';
import { switchUserTab } from 'lib/ui';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';
import { openModal } from 'lib/ui';
import confirm from 'utils/promisified/confirm';
import { formatNumber, formatDateTime } from 'lib/intl';

import QuestionCircle from 'components/QuestionCircle';

const dateTimeFormat = {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const StakingWrapper = styled.div(({ theme }) => ({
  maxWidth: 400,
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

const Pending = styled.div({
  paddingLeft: '1em',
});

const BalanceTooltip = staking =>
  staking
    ? __(
        'The current NXS balance of the trust account that is not staked. You can spend this amount without affecting your Trust Score'
      )
    : __(
        'Balance that will be staked after the 72 holding period, any change to this balance will reset the hold timer'
      );

@connect(state => ({
  stakeInfo: state.core.stakeInfo,
  stakingEnabled: state.settings.enableStaking,
}))
export default class Staking extends React.Component {
  constructor(props) {
    super(props);
    switchUserTab('Staking');
  }

  switchStaking = async () => {
    const { stakingEnabled } = this.props;
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
    console.log(this.props);
    return (
      !!stakeInfo && (
        <StakingWrapper>
          <Line bold>
            <div>{__('Status')}</div>
            <div>{stakeInfo.staking ? __('Staking') : __('Not staking')}</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake amount')}</span>
              <QuestionCircle
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.stake, 6)} NXS</div>
          </Line>
          {!!stakeInfo.change && (
            <div>
              <Pending>
                <Line>
                  <div>
                    <span className="v-align">{__('Pending change')}</span>
                    <QuestionCircle
                      tooltip={__(
                        'The pending stake amount change that will be applied on the next Trust transaction'
                      )}
                    />
                  </div>
                  <div>{formatNumber(stakeInfo.amount, 6)} NXS</div>
                </Line>
                <Line>
                  <div>
                    <span className="v-align">{__('Requested in')}</span>
                  </div>
                  <div>
                    {formatDateTime(stakeInfo.requested * 1000, dateTimeFormat)}
                  </div>
                </Line>
                {!!stakeInfo.expires && (
                  <Line>
                    <div>
                      <span className="v-align">{__('Expired in')}</span>
                    </div>
                    <div>
                      {formatDateTime(stakeInfo.expires * 1000, dateTimeFormat)}{' '}
                    </div>
                  </Line>
                )}
              </Pending>
            </div>
          )}
          <Line>
            <div>
              <span className="v-align">{__('Stake Rate')}</span>
              <QuestionCircle
                tooltip={__(
                  'The current annual reward rate earned for staking'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.stakerate, 3)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Trust Weight')}</span>
              <QuestionCircle
                tooltip={__(
                  'The percentage of the maximum Trust Score, which is gradually built over time when you consistently operate your node in an honest, trustworthy, and timely manner'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.trustweight, 3)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Block Weight')}</span>
              <QuestionCircle
                tooltip={__(
                  'Block Weight depends on the time passed since you received a Trust transaction and will be reset everytime you receive a Trust transaction. Otherwise, Block Weight will reach 100% after 3 days and your Trust Score will start decaying until you receive another Trust transaction'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.blockweight, 3)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake Weight')}</span>
              <QuestionCircle
                tooltip={__(
                  'Stake Weight depends on Trust Weight and Block Weight. Along with your Stake balance, Stake Weight affects how frequent you receive a Trust transaction'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.stakeweight, 3)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Available Balance')}</span>
              <QuestionCircle tooltip={BalanceTooltip(!stakeInfo.new)} />
            </div>
            <div>{formatNumber(stakeInfo.balance, 6)} NXS</div>
          </Line>
          <div className="mt1 flex space-between">
            {stakeInfo.staking && stakeInfo.balance && (
              <div>
                <Button
                  disabled={
                    (!stakeInfo.stake && !stakeInfo.balance) || stakeInfo.new
                  }
                  onClick={() => {
                    openModal(AdjustStakeModal);
                  }}
                >
                  {__('Adjust stake amount')}
                </Button>
                {stakeInfo.new && (
                  <div className="error">
                    {__(
                      'Waiting For genesis. Time dependent on balance and difficulty.'
                    )}
                  </div>
                )}
                {stakeInfo.onHold && (
                  <div className="error">
                    {__('Account on hold for another %{stakeSeconds} Seconds', {
                      stakeSeconds: stakeInfo.holdtime,
                    })}
                  </div>
                )}
              </div>
            )}
            <Button
              skin={stakingEnabled ? 'default' : 'primary'}
              onClick={this.switchStaking}
            >
              {stakingEnabled ? __('Disable staking') : __('Enable staking')}
            </Button>
          </div>
          {!!stakeInfo.new && (
            <div className="mt2">
              <Button
                wide
                onClick={() => {
                  openModal(MigrateStakeModal);
                }}
              >
                {__('Migrate stake')}
              </Button>
            </div>
          )}
        </StakingWrapper>
      )
    );
  }
}
