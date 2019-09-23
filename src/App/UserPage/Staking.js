import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Button from 'components/Button';
import AdjustStakeModal from 'components/AdjustStakeModal';
import MigrateStakeModal from 'components/MigrateStakeModal';
import { switchUserTab } from 'actions/ui';
import { updateSettings } from 'actions/settings';
import { restartCore } from 'actions/core';
import { openModal } from 'actions/overlays';
import confirm from 'utils/promisified/confirm';
import { formatNumber, formatDateTime } from 'lib/intl';

import QuestionMark from './QuestionMark';

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

@connect(
  state => ({
    stakeInfo: state.core.stakeInfo,
    stakingEnabled: state.settings.enableStaking,
  }),
  { switchUserTab, updateSettings, restartCore, openModal }
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
    const { stakeInfo, stakingEnabled, openModal } = this.props;

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
              <QuestionMark
                tooltip={__(
                  'The amount of NXS currently staked in the trust account'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.stake)} NXS</div>
          </Line>
          {!!stakeInfo.change && (
            <div>
              <Pending>
                <Line>
                  <div>
                    <span className="v-align">{__('Pending change')}</span>
                    <QuestionMark
                      tooltip={__(
                        'The pending stake amount change that will be applied on the next Trust transaction'
                      )}
                    />
                  </div>
                  <div>{formatNumber(stakeInfo.amount)} NXS</div>
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
              <QuestionMark
                tooltip={__(
                  'The current annual reward rate earned for staking'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.stakerate, 2)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Trust Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'The percentage of the maximum Trust Score, which is gradually built over time when you consistently operate your node in an honest, trustworthy, and timely manner'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.trustweight, 2)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Block Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'Block Weight depends on the time passed since you received a Trust transaction and will be reset everytime you receive a Trust transaction. Otherwise, Block Weight will reach 100% after 3 days and your Trust Score will start decaying until you receive another Trust transaction'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.blockweight, 2)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Stake Weight')}</span>
              <QuestionMark
                tooltip={__(
                  'Stake Weight depends on Trust Weight and Block Weight. Along with your Stake balance, Stake Weight affects how frequent you receive a Trust transaction'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.stakeweight, 2)} %</div>
          </Line>
          <Line>
            <div>
              <span className="v-align">{__('Unstaked amount')}</span>
              <QuestionMark
                tooltip={__(
                  'The current NXS balance of the trust account that is not staked. You can spend this amount without affecting your Trust Score'
                )}
              />
            </div>
            <div>{formatNumber(stakeInfo.balance)} NXS</div>
          </Line>

          <div className="mt1 flex space-between">
            {!!stakeInfo.new ? (
              <Button
                onClick={() => {
                  openModal(MigrateStakeModal);
                }}
              >
                {__('Migrate stake')}
              </Button>
            ) : (
              <Button
                disabled={!stakeInfo.stake && !stakeInfo.balance}
                onClick={() => {
                  openModal(AdjustStakeModal);
                }}
              >
                {__('Adjust stake amount')}
              </Button>
            )}
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
