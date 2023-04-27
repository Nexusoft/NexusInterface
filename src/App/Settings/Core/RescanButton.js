import { Component } from 'react';

import rpc from 'lib/rpc';
import { showNotification } from 'lib/ui';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { consts } from 'styles';

__ = __context('Settings.Core');

/**
 *
 *
 * @class RescanButton
 * @extends {React.Component}
 */
class RescanButton extends Component {
  state = {
    rescanning: false,
  };

  /**
   *
   *
   * @memberof RescanButton
   */
  rescan = async () => {
    try {
      this.setState({ rescanning: true });
      await rpc('rescan', []);
    } catch (err) {
      showNotification(__('Error rescanning'), 'error');
      return;
    } finally {
      this.setState({ rescanning: false });
    }
    showNotification(__('Rescanned successfully'), 'success');
  };

  /**
   *
   *
   * @returns
   * @memberof RescanButton
   */
  render() {
    const { rescanning } = this.state;
    const { tooltip, ...rest } = this.props;
    return (
      <Tooltip.Trigger
        tooltip={
          !rescanning &&
          tooltip &&
          __(
            'Used to correct transaction/balance issues, scans over every block in the database. Could take up to 10 minutes.'
          )
        }
      >
        <Button
          disabled={rescanning}
          onClick={this.rescan}
          style={{ height: consts.inputHeightEm + 'em' }}
          {...rest}
        >
          {rescanning ? __('Rescanning...') : __('Rescan wallet')}
        </Button>
      </Tooltip.Trigger>
    );
  }
}

export default RescanButton;
