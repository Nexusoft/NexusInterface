// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';

/**
 * Handels the Daemon Status
 *
 * @class DaemonStatus
 * @extends {React.Component}
 */
@connect(({ core: { info: { connections } }, settings: { manualDaemon } }) => ({
  manualDaemon,
  connections,
}))
class DaemonStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof DaemonStatus
   */
  render() {
    const { manualDaemon, connections } = this.props;
    return (
      connections === undefined && (
        <span className="dim">
          {manualDaemon && <Text id="Alert.ManualDaemonDown" />}
          {!manualDaemon && (
            <>
              <Text id="Alert.DaemonLoadingWait" />
              ...
            </>
          )}
        </span>
      )
    );
  }
}

export default DaemonStatus;
