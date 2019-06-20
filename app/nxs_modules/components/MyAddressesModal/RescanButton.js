import React from 'react';

import * as RPC from 'scripts/rpc';
import UIController from 'components/UIController';
import Text from 'components/Text';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';

/**
 *
 *
 * @class RescanButton
 * @extends {React.Component}
 */
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
      await RPC.PROMISE('rescan', []);
    } catch (err) {
      UIController.showNotification(
        <Text id="MyAddressesModal.RescanError" />,
        'error'
      );
      return;
    } finally {
      this.setState({ rescanning: false });
    }
    UIController.showNotification(
      <Text id="MyAddressesModal.RescanSuccess" />,
      'success'
    );
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
          this.props.tooltip && <Text id="MyAddressesModal.RescanTooltip" />
        }
      >
        <Button fitHeight disabled={rescanning} onClick={this.rescan}>
          {rescanning ? (
            <Text id="MyAddressesModal.Rescanning" />
          ) : (
            <Text id="MyAddressesModal.Rescan" />
          )}
        </Button>
      </Tooltip.Trigger>
    );
  }
}

export default RescanButton;
