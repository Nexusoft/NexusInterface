// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';

/**
 * Handles the Core Status
 *
 * @class CoreStatus
 * @extends {React.Component}
 */
@connect(({ core: { info: { connections } }, settings: { manualDaemon } }) => ({
  manualDaemon,
  connections,
}))
class CoreStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof CoreStatus
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

export default CoreStatus;
