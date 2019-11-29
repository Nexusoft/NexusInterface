// External Dependencies
import React, { Component } from 'react';

// Internal Global Dependencies
import GA from 'lib/googleAnalytics';
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import RequireCoreConnected from 'components/RequireCoreConnected';
import { openModal } from 'lib/ui';

// Internal Local Dependencies
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import SendForm from './SendForm';

// Resources
import sendIcon from 'icons/send.svg';
import swapIcon from 'icons/swap.svg';

__ = __context('Send');

/**
 * Send Page
 *
 * @class Send
 * @extends {Component}
 */
class Send extends Component {
  /**
   * Component Mount Callback
   *
   * @memberof Send
   */
  componentDidMount() {
    GA.SendScreen('Send');
  }

  /**
   * Opens the Move NXS between account modal
   *
   * @memberof Send
   */
  moveBetweenAccounts = () => {
    openModal(MoveBetweenAccountsModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Send
   */
  render() {
    return (
      <Panel
        icon={sendIcon}
        title={__('Send NXS')}
        controls={
          this.props.coreConnected && (
            <Tooltip.Trigger tooltip={__('Move NXS between accounts')}>
              <Button
                square
                skin="primary"
                className="relative"
                onClick={this.moveBetweenAccounts}
              >
                <Icon icon={swapIcon} />
              </Button>
            </Tooltip.Trigger>
          )
        }
      >
        <RequireCoreConnected>
          <SendForm />
        </RequireCoreConnected>
      </Panel>
    );
  }
}
export default Send;
