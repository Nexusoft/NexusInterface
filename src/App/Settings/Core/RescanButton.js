import React from 'react';
import { connect } from 'react-redux';

import rpc from 'lib/rpc';
import { showNotification } from 'actions/overlays';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { consts } from 'styles';

/**
 *
 *
 * @class RescanButton
 * @extends {React.Component}
 */
@connect(
  null,
  { showNotification }
)
class RescanButton extends React.Component {
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
      this.props.showNotification(__('Error rescanning'), 'error');
      return;
    } finally {
      this.setState({ rescanning: false });
    }
    this.props.showNotification(__('Rescanned successfully'), 'success');
  };

  /**
   *
   *
   * @returns
   * @memberof RescanButton
   */
  render() {
    const { rescanning } = this.state;
    return (
      <Tooltip.Trigger
        tooltip={
          !rescanning &&
          this.props.tooltip &&
          __(
            'Used to correct transaction/balance issues, scans over every block in the database. Could take up to 10 minutes.'
          )
        }
      >
        <Button
          disabled={rescanning}
          onClick={this.rescan}
          style={{ height: consts.inputHeightEm + 'em' }}
        >
          {rescanning ? __('Rescanning...') : __('Rescan wallet')}
        </Button>
      </Tooltip.Trigger>
    );
  }
}

export default RescanButton;
